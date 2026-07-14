/* eslint-disable @typescript-eslint/no-explicit-any */
import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { SearchService } from '../search/search.service';
import { SearchIndexService } from '../search/search-index.service';
import { buildPaginationMeta } from '@emoji-platform/types';
import type {
  SearchAnalyticsOverview,
  SearchAnalyticsQueryItem,
  SearchAnalyticsNoResultItem,
  SearchAnalyticsProviderHealth,
  SearchAnalyticsQueryParams,
  SearchAnalyticsNoResultParams,
  SearchesByLocale,
  TuningSuggestion,
  SearchTuningApplyResult,
} from './admin-search-analytics.types';

const ZERO_RATE_HIGH = 0.3; // 30% zero-result rate triggers a "high" suggestion.
const TOP_N = 10;

/**
 * Search Analytics service (Phase 6E).
 *
 * Produces read-only, rule-based analytics over `search_logs` (and, where
 * useful, `copy_events`). No AI / ML is used and no content is auto-generated
 * or rewritten. Provider-health reuses SearchService so it always reflects the
 * runtime-selected provider including Meilisearch reachability / fallback.
 *
 * Sensitive-data rules (consistent with Phase 4D-3 / 6B):
 *  - No plaintext IP (the model only stores ipHash, which is never selected).
 *  - No passwordHash / JWT_SECRET / Meilisearch API key in any response.
 */
@Injectable()
export class AdminSearchAnalyticsService {
  private readonly logger = new Logger(AdminSearchAnalyticsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly searchService: SearchService,
    private readonly searchIndexService: SearchIndexService,
  ) {}

  // ─── Overview ───────────────────────────────────────

  async getOverview(): Promise<SearchAnalyticsOverview> {
    const [
      totalSearches,
      todaySearches,
      zeroResultSearches,
      byLocale,
      topQueries,
      topZeroResultQueries,
      zeroByLocale,
      recentRows,
      providerStatus,
    ] = await Promise.all([
      this.prisma.searchLog.count(),
      this.prisma.searchLog.count({ where: { createdAt: { gte: startOfToday() } } }),
      this.prisma.searchLog.count({ where: { resultCount: 0 } }),
      this.prisma.searchLog.groupBy({ by: ['locale'], _count: { _all: true } }),
      this.topQueryGroups(TOP_N),
      this.topZeroResultGroups(TOP_N),
      this.prisma.searchLog.groupBy({
        by: ['locale'],
        where: { resultCount: 0 },
        _count: { _all: true },
      }),
      this.prisma.searchLog.findMany({
        orderBy: { createdAt: 'desc' },
        take: 10,
        select: {
          id: true,
          query: true,
          locale: true,
          resultCount: true,
          country: true,
          createdAt: true,
        },
      }),
      this.getProviderHealth(),
    ]);

    const searchesByLocale = normalizeLocaleCounts(byLocale);
    const zeroByLocaleMap = normalizeLocaleCounts(zeroByLocale);

    const zeroResultRate = totalSearches > 0 ? zeroResultSearches / totalSearches : 0;

    const tuningSuggestions = this.buildTuningSuggestions({
      totalSearches,
      zeroResultSearches,
      zeroResultRate,
      zeroByLocale: zeroByLocaleMap,
      topZeroResultQueries,
      providerStatus,
    });

    return {
      totalSearches,
      todaySearches,
      zeroResultSearches,
      zeroResultRate: round(zeroResultRate, 4),
      searchesByLocale,
      searchesByProvider: {
        supported: false,
        note: '搜索日志未记录每次请求命中的 provider（公开搜索在 Meilisearch 失败时透明 fallback 到 database）。当前 provider 状态请见 providerStatus。',
      },
      topQueries: topQueries.map((t) => ({ query: t.query, count: t.count })),
      topZeroResultQueries: topZeroResultQueries.map((t) => ({
        query: t.query,
        count: t.count,
      })),
      topCopiedAfterSearch: {
        supported: false,
        note: '搜索与复制事件之间没有共享的会话 / 点击关联，无法可靠计算「搜索后复制」关联。原始复制分析请见复制日志接口。',
      },
      recentSearches: recentRows.map((r) => ({
        id: r.id,
        query: r.query ?? null,
        locale: r.locale ?? null,
        resultCount: r.resultCount ?? null,
        country: r.country ?? null,
        createdAt: r.createdAt.toISOString(),
      })),
      tuningSuggestions,
      providerStatus,
    };
  }

  // ─── Queries (aggregate by query + locale) ──────────

  async listQueries(params: SearchAnalyticsQueryParams) {
    const where = this.buildSearchWhere(params);

    const [groups, zeroGroups] = await Promise.all([
      this.prisma.searchLog.groupBy({
        by: ['query', 'locale'],
        where,
        _count: { _all: true },
        _avg: { resultCount: true },
        _max: { createdAt: true },
      }),
      this.prisma.searchLog.groupBy({
        by: ['query', 'locale'],
        where: { ...where, resultCount: 0 },
        _count: { _all: true },
      }),
    ]);

    const zeroMap = new Map<string, number>();
    for (const z of zeroGroups) {
      zeroMap.set(groupKey(z.query, z.locale), z._count._all);
    }

    let items: SearchAnalyticsQueryItem[] = groups.map((g: any) => {
      const count = g._count._all as number;
      const zeroResultCount = zeroMap.get(groupKey(g.query, g.locale)) ?? 0;
      const avg = g._avg?.resultCount;
      return {
        query: g.query ?? null,
        locale: g.locale ?? null,
        count,
        avgResultCount: typeof avg === 'number' ? round(avg, 2) : null,
        zeroResultCount,
        lastSearchedAt: g._max?.createdAt
          ? new Date(g._max.createdAt).toISOString()
          : null,
      };
    });

    if (params.hasResults === 'true') {
      items = items.filter((it) => it.zeroResultCount < it.count);
    } else if (params.hasResults === 'false') {
      items = items.filter((it) => it.zeroResultCount === it.count);
    }

    items.sort((a, b) => b.count - a.count || (b.lastSearchedAt ?? '').localeCompare(a.lastSearchedAt ?? ''));

    const total = items.length;
    const start = (params.page - 1) * params.limit;
    const pageItems = items.slice(start, start + params.limit);

    return {
      data: pageItems,
      meta: buildPaginationMeta(params.page, params.limit, total),
    };
  }

  // ─── No-result queries ──────────────────────────────

  async listNoResults(params: SearchAnalyticsNoResultParams) {
    const where: Prisma.SearchLogWhereInput = { resultCount: 0 };
    if (params.locale !== 'all') where.locale = params.locale;
    const dateRange = buildDateRange(params.dateFrom, params.dateTo);
    if (dateRange.gte || dateRange.lte) where.createdAt = dateRange;

    const groups = await this.prisma.searchLog.groupBy({
      by: ['query', 'locale'],
      where,
      _count: { _all: true },
      _max: { createdAt: true },
      orderBy: { _count: { query: 'desc' } },
    });

    const all: SearchAnalyticsNoResultItem[] = groups.map((g: any) => {
      const query = g.query ?? null;
      const locale = g.locale ?? null;
      return {
        query,
        locale,
        count: g._count._all as number,
        lastSearchedAt: g._max?.createdAt
          ? new Date(g._max.createdAt).toISOString()
          : null,
        suggestedAction: this.buildNoResultSuggestion(query, locale),
      };
    });

    const total = all.length;
    const start = (params.page - 1) * params.limit;
    const pageItems = all.slice(start, start + params.limit);

    return {
      data: pageItems,
      meta: buildPaginationMeta(params.page, params.limit, total),
    };
  }

  // ─── Provider health ────────────────────────────────

  async getProviderHealth(): Promise<SearchAnalyticsProviderHealth> {
    const status = await this.searchService.getInfrastructureStatus();
    const indexStatus = await this.searchIndexService.getIndexStatus();

    const usingMeili = status.currentProvider === 'meilisearch';
    const fallbackRecommended =
      usingMeili && (!status.meilisearchReachable || !status.indexReady);

    const notes: string[] = [];
    notes.push(
      `当前搜索 provider：${status.currentProvider}；fallback：${status.fallbackProvider}。`,
    );
    if (!status.meilisearchConfigured) {
      notes.push('Meilisearch 未配置，公开搜索全部走 database（无外部索引依赖）。');
    } else if (!status.meilisearchReachable) {
      notes.push('Meilisearch 已配置但不可达，系统已自动 fallback 到 database，公开搜索不受影响。');
    } else if (!status.indexReady) {
      notes.push('Meilisearch 可连接但索引未就绪，建议执行「重建索引」。');
    } else {
      notes.push('Meilisearch 已配置、可连接且索引就绪。');
    }

    return {
      currentProvider: status.currentProvider,
      fallbackProvider: status.fallbackProvider,
      meilisearchConfigured: status.meilisearchConfigured,
      meilisearchReachable: status.meilisearchReachable,
      indexReady: status.indexReady,
      documentCount: indexStatus.documentCount,
      lastIndexedAt: indexStatus.lastCheckedAt ?? null, // not persisted; report last probe time
      fallbackRecommended,
      notes,
    };
  }

  // ─── Conservative tuning apply (super_admin only) ──

  async applyTuningSettings(adminUserId: string): Promise<SearchTuningApplyResult> {
    if (!this.searchIndexService.isConfigured()) {
      return {
        available: false,
        applied: false,
        message:
          'Manual tuning apply 需要 Meilisearch 已配置。当前未配置 Meilisearch（SEARCH_PROVIDER=database），无需应用外部索引设置。',
      };
    }

    try {
      const result = await this.searchIndexService.configureIndexSettings();
      await this.recordAudit({
        adminUserId,
        action: 'search.tuning_settings_update',
        entityType: 'search',
        entityId: result.indexName,
        newData: {
          indexName: result.indexName,
          searchableAttributes: result.searchableAttributes,
          filterableAttributes: result.filterableAttributes,
          sortableAttributes: result.sortableAttributes,
          rankingRules: result.rankingRules,
        },
      });

      return {
        available: true,
        applied: true,
        message: `已应用保守索引设置（${result.searchableAttributes.length} 个可搜索字段，${result.filterableAttributes.length} 个可过滤字段，${result.rankingRules.length} 条 ranking 规则）。未修改核心 ranking 逻辑，未自动改写任何内容。`,
        indexName: result.indexName,
        searchableAttributes: result.searchableAttributes,
        filterableAttributes: result.filterableAttributes,
        sortableAttributes: result.sortableAttributes,
        rankingRules: result.rankingRules,
        finishedAt: result.finishedAt,
      };
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      this.logger.warn(`tuning apply-settings failed: ${message}`);
      throw new BadRequestException(`应用调优设置失败：${message}`);
    }
  }

  // ─── Internal helpers ───────────────────────────────

  private buildSearchWhere(
    params: SearchAnalyticsQueryParams,
  ): Prisma.SearchLogWhereInput {
    const where: Prisma.SearchLogWhereInput = {};
    if (params.locale !== 'all') where.locale = params.locale;
    if (params.q) {
      where.query = { contains: params.q, mode: 'insensitive' };
    }
    const dateRange = buildDateRange(params.dateFrom, params.dateTo);
    if (dateRange.gte || dateRange.lte) where.createdAt = dateRange;
    return where;
  }

  private async topQueryGroups(limit: number) {
    const rows = await this.prisma.searchLog.groupBy({
      by: ['query'],
      where: { query: { not: null } },
      _count: { _all: true },
      orderBy: { _count: { query: 'desc' } },
      take: limit,
    });
    return rows
      .filter((r: any) => r.query)
      .map((r: any) => ({ query: r.query as string, count: r._count._all as number }));
  }

  private async topZeroResultGroups(limit: number) {
    const rows = await this.prisma.searchLog.groupBy({
      by: ['query'],
      where: { query: { not: null }, resultCount: 0 },
      _count: { _all: true },
      orderBy: { _count: { query: 'desc' } },
      take: limit,
    });
    return rows
      .filter((r: any) => r.query)
      .map((r: any) => ({ query: r.query as string, count: r._count._all as number }));
  }

  private buildTuningSuggestions(input: {
    totalSearches: number;
    zeroResultSearches: number;
    zeroResultRate: number;
    zeroByLocale: SearchesByLocale;
    topZeroResultQueries: { query: string; count: number }[];
    providerStatus: SearchAnalyticsProviderHealth;
  }): TuningSuggestion[] {
    const suggestions: TuningSuggestion[] = [];

    if (input.totalSearches === 0) {
      suggestions.push({
        priority: 'low',
        category: '数据',
        title: '暂无搜索数据',
        detail: '系统尚未记录到任何搜索日志，可能流量还未进入或日志采集未接入。',
        suggestedAction: '建议先引入自然流量，积累搜索日志后再进行分析与调优。',
      });
      return suggestions;
    }

    if (input.zeroResultRate >= ZERO_RATE_HIGH) {
      suggestions.push({
        priority: 'high',
        category: '零结果率',
        title: '零结果率偏高',
        detail: `零结果搜索占比约 ${(input.zeroResultRate * 100).toFixed(1)}%（${input.zeroResultSearches}/${input.totalSearches}），说明较多查询没有命中内容。`,
        suggestedAction:
          '建议为高频无结果词补充 Emoji alias / keywords，以及 Article keyword；若为长尾词可评估是否值得收录。',
      });
    }

    for (const t of input.topZeroResultQueries.slice(0, 5)) {
      suggestions.push({
        priority: t.count >= 5 ? 'high' : 'medium',
        category: '零结果词',
        title: `高频无结果词：「${t.query}」`,
        detail: `「${t.query}」共出现 ${t.count} 次且始终无结果。`,
        suggestedAction:
          '检查是否缺少对应 Emoji alias / Article keyword；若确为常见需求，确认该实体是否已以 published 状态收录。',
      });
    }

    const zeroZh = input.zeroByLocale.zh;
    const zeroEn = input.zeroByLocale.en;
    if (zeroZh > 0 && zeroZh >= zeroEn && zeroZh >= 10) {
      suggestions.push({
        priority: 'medium',
        category: '中文覆盖',
        title: '中文搜索无结果偏多',
        detail: `中文（zh）零结果搜索约 ${zeroZh} 次，明显高于其他语言。`,
        suggestedAction: '建议补充中文关键词（keywords / 别名），提升中文检索召回。',
      });
    }
    if (zeroEn > 0 && zeroEn > zeroZh && zeroEn >= 10) {
      suggestions.push({
        priority: 'medium',
        category: '英文覆盖',
        title: '英文搜索无结果偏多',
        detail: `英文（en）零结果搜索约 ${zeroEn} 次，明显高于中文。`,
        suggestedAction: '建议补充英文 aliases / shortcode，提升英文检索召回。',
      });
    }

    if (input.providerStatus.meilisearchConfigured && !input.providerStatus.meilisearchReachable) {
      suggestions.push({
        priority: 'high',
        category: 'Meilisearch',
        title: 'Meilisearch 不可达',
        detail: 'Meilisearch 已配置但当前不可连接，搜索已自动 fallback 到 database。',
        suggestedAction:
          '建议检查 Docker 容器状态与 env（MEILISEARCH_API_KEY 等），恢复后公开搜索将回到 Meilisearch。',
      });
    } else if (input.providerStatus.meilisearchConfigured && !input.providerStatus.indexReady) {
      suggestions.push({
        priority: 'high',
        category: 'Meilisearch',
        title: '索引未就绪',
        detail: 'Meilisearch 可连接，但索引尚未就绪（可能未重建）。',
        suggestedAction: '建议在搜索基础设施页执行「重建全部索引」，再应用索引设置。',
      });
    }

    return suggestions;
  }

  private buildNoResultSuggestion(
    query: string | null,
    locale: string | null,
  ): string {
    const base = query
      ? `建议补充「${query}」相关内容的 Emoji alias / keywords 或 Article keyword。`
      : '建议补充空查询对应的引导内容或默认推荐。';
    if (locale === 'zh') return `${base}（中文搜索：补充中文关键词 / 别名）`;
    if (locale === 'en') return `${base}（英文搜索：补充英文 aliases / shortcode）`;
    return base;
  }

  private async recordAudit(params: {
    adminUserId: string;
    action: string;
    entityType: string;
    entityId: string;
    newData?: unknown;
  }): Promise<void> {
    try {
      await this.prisma.auditLog.create({
        data: {
          adminUserId: params.adminUserId,
          action: params.action,
          entityType: params.entityType,
          entityId: params.entityId,
          oldData: undefined,
          newData: (params.newData ?? undefined) as Prisma.InputJsonValue | undefined,
          ipAddress: null,
        },
      });
    } catch (error) {
      this.logger.error(
        `audit log write failed for ${params.action} ${params.entityType}:${params.entityId}`,
        error instanceof Error ? error.stack : String(error),
      );
    }
  }
}

// ─── Shared helpers ───────────────────────────────────

function groupKey(query: string | null, locale: string | null): string {
  return `${query ?? '∅'}|${locale ?? '∅'}`;
}

function startOfToday(): Date {
  const now = new Date();
  now.setUTCHours(0, 0, 0, 0);
  return now;
}

function normalizeLocaleCounts(
  rows: { locale: string | null; _count: { _all: number } }[],
): SearchesByLocale {
  const out: SearchesByLocale = { zh: 0, en: 0, other: 0 };
  for (const r of rows) {
    const key = r.locale === 'zh' || r.locale === 'en' ? r.locale : 'other';
    out[key] += r._count._all;
  }
  return out;
}

function buildDateRange(
  dateFrom?: string,
  dateTo?: string,
): { gte?: Date; lte?: Date } {
  const range: { gte?: Date; lte?: Date } = {};
  if (dateFrom) range.gte = new Date(dateFrom);
  if (dateTo) {
    const end = new Date(dateTo);
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateTo)) end.setUTCHours(23, 59, 59, 999);
    range.lte = end;
  }
  return range;
}

function round(value: number, decimals: number): number {
  const f = 10 ** decimals;
  return Math.round(value * f) / f;
}
