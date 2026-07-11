/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { AdminJwtPayload } from './admin-auth.guard';
import {
  SeoEntityType,
  SeoCompleteness,
  SEO_ENTITY_TYPES,
} from './dto/admin-seo-query.dto';
import { SeoUpdateInput } from './dto/admin-seo-body.dto';
import { buildPaginationMeta } from '@emoji-platform/types';

const SITE_URL = process.env.SITE_URL || 'http://localhost:3000';

type Completeness = 'complete' | 'missingTitle' | 'missingDescription' | 'missingAny';

interface EntityConfig {
  translationModel:
    | 'emojiTranslation'
    | 'categoryTranslation'
    | 'topicTranslation'
    | 'articleTranslation';
  mainModel: 'emoji' | 'category' | 'topic' | 'article';
  relation: 'emoji' | 'category' | 'topic' | 'article';
  idField: 'emojiId' | 'categoryId' | 'topicId' | 'articleId';
  pathSegment: string;
  nameField: 'name' | 'title';
  planned: boolean;
}

const ENTITY_CONFIG: Record<SeoEntityType, EntityConfig> = {
  emoji: {
    translationModel: 'emojiTranslation',
    mainModel: 'emoji',
    relation: 'emoji',
    idField: 'emojiId',
    pathSegment: 'emoji',
    nameField: 'name',
    planned: false,
  },
  category: {
    translationModel: 'categoryTranslation',
    mainModel: 'category',
    relation: 'category',
    idField: 'categoryId',
    pathSegment: 'categories',
    nameField: 'name',
    planned: false,
  },
  topic: {
    translationModel: 'topicTranslation',
    mainModel: 'topic',
    relation: 'topic',
    idField: 'topicId',
    pathSegment: 'topics',
    nameField: 'title',
    planned: false,
  },
  article: {
    translationModel: 'articleTranslation',
    mainModel: 'article',
    relation: 'article',
    idField: 'articleId',
    pathSegment: 'articles',
    nameField: 'title',
    planned: true,
  },
};

function isMissing(value: string | null | undefined): boolean {
  return value === null || value === undefined || value.trim() === '';
}

function computeCompleteness(
  seoTitle: string | null | undefined,
  seoDescription: string | null | undefined,
): Completeness {
  const t = isMissing(seoTitle);
  const d = isMissing(seoDescription);
  if (t && d) return 'missingAny';
  if (t) return 'missingTitle';
  if (d) return 'missingDescription';
  return 'complete';
}

function frontendPath(entityType: SeoEntityType, locale: 'zh' | 'en', slug: string): string {
  const seg = ENTITY_CONFIG[entityType].pathSegment;
  return `${SITE_URL}/${locale}/${seg}/${slug}/`;
}

export interface CanonicalPreview {
  zh: string;
  en: string;
  xdefault: string;
}

export interface HreflangLink {
  lang: string;
  href: string;
}

function buildCanonicalPreview(entityType: SeoEntityType, slug: string): CanonicalPreview {
  const zh = frontendPath(entityType, 'zh', slug);
  const en = frontendPath(entityType, 'en', slug);
  return { zh, en, xdefault: en };
}

function buildHreflangPreview(entityType: SeoEntityType, slug: string): HreflangLink[] {
  const zh = frontendPath(entityType, 'zh', slug);
  const en = frontendPath(entityType, 'en', slug);
  return [
    { lang: 'zh', href: zh },
    { lang: 'en', href: en },
    { lang: 'x-default', href: en },
  ];
}

export interface SeoStats {
  total: number;
  missingTitle: number;
  missingDescription: number;
  missingAny: number;
  complete: number;
  missingByLocale: {
    zh: { missingTitle: number; missingDescription: number };
    en: { missingTitle: number; missingDescription: number };
  };
}

@Injectable()
export class AdminSeoService {
  private readonly logger = new Logger(AdminSeoService.name);

  constructor(private readonly prisma: PrismaService) {}

  // ─── Overview ───────────────────────────────────────

  async overview() {
    const statsByType: Record<SeoEntityType, SeoStats> = {} as Record<
      SeoEntityType,
      SeoStats
    >;
    for (const type of SEO_ENTITY_TYPES) {
      statsByType[type] = await this.seoStats(type);
    }

    const missingTitleCount = SEO_ENTITY_TYPES.reduce(
      (sum, t) => sum + statsByType[t].missingTitle,
      0,
    );
    const missingDescriptionCount = SEO_ENTITY_TYPES.reduce(
      (sum, t) => sum + statsByType[t].missingDescription,
      0,
    );

    const recentSeoUpdates = await this.prisma.auditLog.findMany({
      where: { action: 'seo.update' },
      orderBy: { createdAt: 'desc' },
      take: 10,
    });

    return {
      emojiSeoStats: statsByType.emoji,
      categorySeoStats: statsByType.category,
      topicSeoStats: statsByType.topic,
      articleSeoStats: statsByType.article,
      missingTitleCount,
      missingDescriptionCount,
      missingByLocale: {
        zh: {
          missingTitle: SEO_ENTITY_TYPES.reduce(
            (sum, t) => sum + statsByType[t].missingByLocale.zh.missingTitle,
            0,
          ),
          missingDescription: SEO_ENTITY_TYPES.reduce(
            (sum, t) => sum + statsByType[t].missingByLocale.zh.missingDescription,
            0,
          ),
        },
        en: {
          missingTitle: SEO_ENTITY_TYPES.reduce(
            (sum, t) => sum + statsByType[t].missingByLocale.en.missingTitle,
            0,
          ),
          missingDescription: SEO_ENTITY_TYPES.reduce(
            (sum, t) => sum + statsByType[t].missingByLocale.en.missingDescription,
            0,
          ),
        },
      },
      recentSeoUpdates: recentSeoUpdates.map((log: any) => ({
        id: log.id,
        action: log.action,
        entityType: log.entityType,
        entityId: log.entityId,
        adminUserId: log.adminUserId,
        createdAt: log.createdAt,
      })),
      robotsStatus: await this.robotsStatus(),
      sitemapStatus: await this.sitemapStatus(),
    };
  }

  private async seoStats(entityType: SeoEntityType): Promise<SeoStats> {
    const config = ENTITY_CONFIG[entityType];
    const delegate = (this.prisma as any)[config.translationModel];

    const total = await delegate.count({});
    const missingTitle = await delegate.count({
      where: { OR: [{ seoTitle: null }, { seoTitle: '' }] },
    });
    const missingDescription = await delegate.count({
      where: { OR: [{ seoDescription: null }, { seoDescription: '' }] },
    });
    const missingAny = await delegate.count({
      where: {
        OR: [
          { seoTitle: null },
          { seoTitle: '' },
          { seoDescription: null },
          { seoDescription: '' },
        ],
      },
    });
    const complete = total - missingAny;

    const zhMissingTitle = await delegate.count({
      where: { locale: 'zh', OR: [{ seoTitle: null }, { seoTitle: '' }] },
    });
    const zhMissingDescription = await delegate.count({
      where: { locale: 'zh', OR: [{ seoDescription: null }, { seoDescription: '' }] },
    });
    const enMissingTitle = await delegate.count({
      where: { locale: 'en', OR: [{ seoTitle: null }, { seoTitle: '' }] },
    });
    const enMissingDescription = await delegate.count({
      where: { locale: 'en', OR: [{ seoDescription: null }, { seoDescription: '' }] },
    });

    return {
      total,
      missingTitle,
      missingDescription,
      missingAny,
      complete,
      missingByLocale: {
        zh: { missingTitle: zhMissingTitle, missingDescription: zhMissingDescription },
        en: { missingTitle: enMissingTitle, missingDescription: enMissingDescription },
      },
    };
  }

  // ─── List ───────────────────────────────────────────

  async listEntities(query: {
    entityType: SeoEntityType;
    page: number;
    limit: number;
    q?: string;
    locale: 'zh' | 'en' | 'all';
    status: string | 'all';
    completeness: SeoCompleteness;
  }) {
    const config = ENTITY_CONFIG[query.entityType];
    const delegate = (this.prisma as any)[config.translationModel];

    const where: any = {};
    if (query.locale !== 'all') where.locale = query.locale;

    if (query.status !== 'all') {
      where[config.relation] = { status: query.status };
    }

    if (query.q) {
      const or: any[] = [
        { [config.nameField]: { contains: query.q, mode: 'insensitive' } },
        { [config.relation]: { slug: { contains: query.q, mode: 'insensitive' } } },
      ];
      if (query.entityType === 'emoji') {
        or.push({ [config.relation]: { emojiChar: { contains: query.q, mode: 'insensitive' } } });
      }
      where.OR = or;
    }

    if (query.completeness !== 'all') {
      where[completenessWhereKey(query.completeness)] = completenessWhereValue(
        query.completeness,
      );
    }

    const [rows, total] = await Promise.all([
      delegate.findMany({
        where,
        include: { [config.relation]: true },
        skip: (query.page - 1) * query.limit,
        take: query.limit,
        orderBy: [{ locale: 'asc' }, { updatedAt: 'desc' }],
      }),
      delegate.count({ where }),
    ]);

    const data = rows.map((row: any) => this.formatListItem(query.entityType, row, config));

    return {
      data,
      meta: buildPaginationMeta(query.page, query.limit, total),
    };
  }

  private formatListItem(entityType: SeoEntityType, row: any, config: EntityConfig) {
    const entity = row[config.relation] ?? {};
    const slug = entity.slug ?? '';
    const seoTitle = row.seoTitle ?? null;
    const seoDescription = row.seoDescription ?? null;

    return {
      id: row.id,
      entityId: entity.id ?? null,
      entityType,
      locale: row.locale,
      nameOrTitle: row[config.nameField] ?? null,
      slug,
      status: entity.status ?? null,
      seoTitle,
      seoDescription,
      seoTitleLength: (seoTitle ?? '').length,
      seoDescriptionLength: (seoDescription ?? '').length,
      completeness: computeCompleteness(seoTitle, seoDescription),
      previewLink: frontendPath(entityType, row.locale, slug),
      canonical: buildCanonicalPreview(entityType, slug),
      hreflang: buildHreflangPreview(entityType, slug),
      editUrl: `/admin/seo/${entityType}/${entity.id ?? ''}/edit`,
      planned: config.planned,
    };
  }

  // ─── Detail ─────────────────────────────────────────

  async getEntity(entityType: SeoEntityType, id: string) {
    const config = ENTITY_CONFIG[entityType];
    const entity = await (this.prisma as any)[config.mainModel].findUnique({
      where: { id },
      include: { translations: true },
    });
    if (!entity) {
      throw new NotFoundException(`未找到 ${entityType} 实体 "${id}"`);
    }

    const zh = entity.translations?.find((t: any) => t.locale === 'zh');
    const en = entity.translations?.find((t: any) => t.locale === 'en');

    const buildTranslation = (t: any) => ({
      seoTitle: t?.seoTitle ?? null,
      seoDescription: t?.seoDescription ?? null,
      [config.nameField]: t?.[config.nameField] ?? null,
    });

    return {
      entityType,
      id: entity.id,
      slug: entity.slug,
      status: entity.status,
      publishedAt: entity.publishedAt ?? null,
      name: zh?.[config.nameField] ?? en?.[config.nameField] ?? null,
      translations: {
        zh: zh ? buildTranslation(zh) : null,
        en: en ? buildTranslation(en) : null,
      },
      canonical: buildCanonicalPreview(entityType, entity.slug),
      hreflang: buildHreflangPreview(entityType, entity.slug),
      previewLinks: {
        zh: frontendPath(entityType, 'zh', entity.slug),
        en: frontendPath(entityType, 'en', entity.slug),
      },
      planned: config.planned,
      seoNote: config.planned
        ? '前台文章详情页暂未实现，canonical/hreflang 为规划路径（planned / not active）'
        : undefined,
    };
  }

  // ─── Update ─────────────────────────────────────────

  async updateEntity(
    entityType: SeoEntityType,
    id: string,
    input: SeoUpdateInput,
    admin: AdminJwtPayload,
  ) {
    const config = ENTITY_CONFIG[entityType];
    const entity = await (this.prisma as any)[config.mainModel].findUnique({
      where: { id },
      include: { translations: true },
    });
    if (!entity) {
      throw new NotFoundException(`未找到 ${entityType} 实体 "${id}"`);
    }

    const oldTranslations = entity.translations ?? [];
    const pickOld = (locale: 'zh' | 'en') => {
      const t = oldTranslations.find((x: any) => x.locale === locale);
      return {
        seoTitle: t?.seoTitle ?? null,
        seoDescription: t?.seoDescription ?? null,
      };
    };
    const oldData = {
      entityType,
      entityId: `${entityType}:${id}`,
      zh: pickOld('zh'),
      en: pickOld('en'),
    };

    const updatedLocales: ('zh' | 'en')[] = [];
    if (input.translations.zh) {
      await this.applyTranslationUpdate(config, id, 'zh', input.translations.zh);
      updatedLocales.push('zh');
    }
    if (input.translations.en) {
      await this.applyTranslationUpdate(config, id, 'en', input.translations.en);
      updatedLocales.push('en');
    }

    const refreshed = await (this.prisma as any)[config.mainModel].findUnique({
      where: { id },
      include: { translations: true },
    });
    const newTranslations = refreshed?.translations ?? [];
    const pickNew = (locale: 'zh' | 'en') => {
      const t = newTranslations.find((x: any) => x.locale === locale);
      return {
        seoTitle: t?.seoTitle ?? null,
        seoDescription: t?.seoDescription ?? null,
      };
    };
    const newData: any = {
      entityType,
      entityId: `${entityType}:${id}`,
    };
    if (updatedLocales.includes('zh')) newData.zh = pickNew('zh');
    if (updatedLocales.includes('en')) newData.en = pickNew('en');

    await this.recordAudit({
      adminUserId: admin.sub,
      action: 'seo.update',
      entityType: 'seo',
      entityId: `${entityType}:${id}`,
      oldData,
      newData,
    });

    return { data: await this.getEntity(entityType, id) };
  }

  private async applyTranslationUpdate(
    config: EntityConfig,
    entityId: string,
    locale: 'zh' | 'en',
    patch: { seoTitle?: string | null; seoDescription?: string | null },
  ): Promise<void> {
    const data: Record<string, unknown> = {};
    if ('seoTitle' in patch) data.seoTitle = patch.seoTitle ?? null;
    if ('seoDescription' in patch) data.seoDescription = patch.seoDescription ?? null;
    if (Object.keys(data).length === 0) return;

    const delegate = (this.prisma as any)[config.translationModel];
    await delegate.updateMany({
      where: { [config.idField]: entityId, locale },
      data,
    });
  }

  // ─── robots / sitemap status (read-only) ────────────

  private getWebBase(): string {
    return process.env.SITE_URL || process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
  }

  /**
   * Probes a public web route to confirm it is actually served. Used so the
   * admin SEO status reflects the live dynamic robots.txt / sitemap.xml that
   * apps/web now generates at request time (no static files under public/).
   */
  private async probeUrl(url: string, timeoutMs = 2000): Promise<boolean> {
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), timeoutMs);
      const res = await fetch(url, { method: 'GET', signal: controller.signal });
      clearTimeout(timer);
      return res.ok;
    } catch {
      return false;
    }
  }

  async robotsStatus(): Promise<{
    exists: boolean;
    blocksIndexing: boolean;
    protectsAdminNoindex: boolean;
    note: string;
  }> {
    const base = this.getWebBase();
    const robotsUrl = `${base}/robots.txt`;
    const sitemapUrl = `${base}/sitemap.xml`;
    const [robotsOk, sitemapOk] = await Promise.all([
      this.probeUrl(robotsUrl),
      this.probeUrl(sitemapUrl),
    ]);

    return {
      exists: robotsOk,
      blocksIndexing: false,
      protectsAdminNoindex: true,
      note: robotsOk
        ? `robots.txt 由 web 动态生成（Disallow /admin/ 与 /api/v1/admin/），不阻止前台公开页面；sitemap 索引${sitemapOk ? '可访问' : '（web 未运行或路由异常）不可访问'}。`
        : '未检测到 robots.txt（web 未运行或路由异常）。后台 /admin/* 仍通过页面 meta robots 强制 noindex，不影响前台。',
    };
  }

  async sitemapStatus(): Promise<{ exists: boolean; note: string }> {
    const base = this.getWebBase();
    const ok = await this.probeUrl(`${base}/sitemap.xml`);
    return {
      exists: ok,
      note: ok
        ? 'sitemap 索引已由 web 动态生成，包含 static / emojis / categories / topics（articles 在 Phase 5B 启用）。'
        : 'sitemap.xml 不可访问（web 未运行或路由异常）；动态 sitemap 将在 web 运行时生效。',
    };
  }

  // ─── Helpers ────────────────────────────────────────

  private async recordAudit(params: {
    adminUserId: string;
    action: string;
    entityType: string;
    entityId: string;
    oldData?: unknown;
    newData?: unknown;
    ipAddress?: string | null;
  }): Promise<void> {
    try {
      await this.prisma.auditLog.create({
        data: {
          adminUserId: params.adminUserId,
          action: params.action,
          entityType: params.entityType,
          entityId: params.entityId,
          oldData: (params.oldData ?? undefined) as any,
          newData: (params.newData ?? undefined) as any,
          ipAddress: params.ipAddress ?? null,
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

function completenessWhereKey(completeness: SeoCompleteness): string {
  switch (completeness) {
    case 'missingTitle':
      return 'OR';
    case 'missingDescription':
      return 'OR';
    case 'missingAny':
      return 'OR';
    case 'complete':
      return 'AND';
    default:
      return 'OR';
  }
}

function completenessWhereValue(completeness: SeoCompleteness): any {
  switch (completeness) {
    case 'missingTitle':
      return [{ seoTitle: null }, { seoTitle: '' }];
    case 'missingDescription':
      return [{ seoDescription: null }, { seoDescription: '' }];
    case 'missingAny':
      return [
        { seoTitle: null },
        { seoTitle: '' },
        { seoDescription: null },
        { seoDescription: '' },
      ];
    case 'complete':
      return [
        { seoTitle: { not: null } },
        { seoTitle: { not: '' } },
        { seoDescription: { not: null } },
        { seoDescription: { not: '' } },
      ];
    default:
      return [];
  }
}
