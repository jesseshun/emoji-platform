/* eslint-disable @typescript-eslint/no-explicit-any */
import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { AdminJwtPayload } from './admin-auth.guard';
import { assertCanViewSeoQuality, assertCanRunSeoQualityCheck } from './role.util';
import { SeoIssueType, SeoSeverity } from './dto/admin-seo-quality-query.dto';
import { SeoEntityType } from './dto/admin-seo-query.dto';
import { buildPaginationMeta } from '@emoji-platform/types';

const SITE_URL = process.env.SITE_URL || process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

export type QualityEntityType = 'emoji' | 'category' | 'topic' | 'article';

export interface SeoIssue {
  id: string;
  entityType: QualityEntityType;
  entityId: string;
  locale: 'zh' | 'en' | 'all';
  issueType: SeoIssueType;
  severity: SeoSeverity;
  message: string;
  recommendedAction: string;
  nameOrTitle: string | null;
  slug: string | null;
  status: string | null;
  updatedAt: string;
  editUrl: string;
  publicUrl: string | null;
}

export interface SeoIssuesByType {
  missingSeoTitle: number;
  missingSeoDescription: number;
  titleTooShort: number;
  titleTooLong: number;
  descriptionTooShort: number;
  descriptionTooLong: number;
  missingCanonicalPreview: number;
  missingHreflangPreview: number;
  missingJsonLd: number;
  sitemapMismatch: number;
  noInternalLinks: number;
}

export interface SeoIssuesByEntityType {
  emoji: { issue: number; warning: number };
  category: { issue: number; warning: number };
  topic: { issue: number; warning: number };
  article: { issue: number; warning: number };
}

export interface SeoQualityOverview {
  totalChecked: number;
  passedCount: number;
  issueCount: number;
  warningCount: number;
  issuesByEntityType: SeoIssuesByEntityType;
  issuesByType: SeoIssuesByType;
  recentIssues: SeoIssue[];
  generatedAt: string;
}

export interface SeoQualityResult extends SeoQualityOverview {
  issues: SeoIssue[];
}

export interface InternalLinkSuggestion {
  entityType: QualityEntityType;
  id: string;
  slug: string;
  title: string | null;
  url: string;
  reason: string;
  score: number;
}

export interface InternalLinkSuggestionResponse {
  entityType: QualityEntityType;
  id: string;
  locale: 'zh' | 'en';
  suggestions: InternalLinkSuggestion[];
}

interface QualityEntityConfig {
  translationModel: 'emojiTranslation' | 'categoryTranslation' | 'topicTranslation' | 'articleTranslation';
  mainModel: 'emoji' | 'category' | 'topic' | 'article';
  pathSegment: string;
  nameField: 'name' | 'title';
}

const QUALITY_CONFIG: Record<QualityEntityType, QualityEntityConfig> = {
  emoji: {
    translationModel: 'emojiTranslation',
    mainModel: 'emoji',
    pathSegment: 'emoji',
    nameField: 'name',
  },
  category: {
    translationModel: 'categoryTranslation',
    mainModel: 'category',
    pathSegment: 'categories',
    nameField: 'name',
  },
  topic: {
    translationModel: 'topicTranslation',
    mainModel: 'topic',
    pathSegment: 'topics',
    nameField: 'title',
  },
  article: {
    translationModel: 'articleTranslation',
    mainModel: 'article',
    pathSegment: 'articles',
    nameField: 'title',
  },
};

const SEVERITY_MAP: Record<SeoIssueType, SeoSeverity> = {
  missingSeoTitle: 'issue',
  missingSeoDescription: 'issue',
  titleTooShort: 'warning',
  titleTooLong: 'warning',
  descriptionTooShort: 'warning',
  descriptionTooLong: 'warning',
  missingCanonicalPreview: 'issue',
  missingHreflangPreview: 'issue',
  missingJsonLd: 'issue',
  sitemapMismatch: 'issue',
  noInternalLinks: 'warning',
};

const MESSAGES: Record<SeoIssueType, { message: string; action: string }> = {
  missingSeoTitle: {
    message: '缺少 seoTitle（SEO 标题缺失）',
    action: '为该语言填写 seoTitle（建议 10–70 字符）。',
  },
  missingSeoDescription: {
    message: '缺少 seoDescription（SEO 描述缺失）',
    action: '为该语言填写 seoDescription（建议 50–180 字符）。',
  },
  titleTooShort: {
    message: 'seoTitle 过短（少于 10 字符）',
    action: '补充 seoTitle 内容，使其更具描述性（≥10 字符）。',
  },
  titleTooLong: {
    message: 'seoTitle 过长（超过 70 字符）',
    action: '精简 seoTitle，控制在 70 字符以内。',
  },
  descriptionTooShort: {
    message: 'seoDescription 过短（少于 50 字符）',
    action: '补充 seoDescription，提供更完整的摘要（≥50 字符）。',
  },
  descriptionTooLong: {
    message: 'seoDescription 过长（超过 180 字符）',
    action: '精简 seoDescription，控制在 180 字符以内。',
  },
  missingCanonicalPreview: {
    message: '已发布页面缺少可用的 canonical 预览（slug 无效）',
    action: '修正 slug（仅允许字母、数字、连字符，且不含 undefined/null），以便生成 canonical。',
  },
  missingHreflangPreview: {
    message: '已发布页面缺少完整的 hreflang 备用语言',
    action: '补全 zh / en 两种翻译，以便生成 hreflang 交替链接。',
  },
  missingJsonLd: {
    message: '已发布详情页缺少可用的 JSON-LD 数据',
    action: '确保 slug 有效且至少一种语言的名称/标题已填写，以便生成结构化数据。',
  },
  sitemapMismatch: {
    message: '已发布内容因 slug 无效无法正确进入 sitemap',
    action: '修正 slug，使该已发布页面可被 sitemap 收录。',
  },
  noInternalLinks: {
    message: '缺少可关联的内部链接内容',
    action: '补充分类/专题/表情关联或更多已发布内容，以建立内部链接。',
  },
};

function slugIsValid(slug?: string | null): boolean {
  if (!slug || typeof slug !== 'string') return false;
  const s = slug.trim();
  if (s.length === 0) return false;
  if (/undefined|null/i.test(s)) return false;
  if (!/^[a-z0-9-]+$/i.test(s)) return false;
  return true;
}

function isMissing(value: string | null | undefined): boolean {
  return value === null || value === undefined || value.trim() === '';
}

function frontendUrl(entityType: QualityEntityType, locale: 'zh' | 'en', slug: string): string {
  return `${SITE_URL}/${locale}/${QUALITY_CONFIG[entityType].pathSegment}/${slug}/`;
}

function emptyIssuesByType(): SeoIssuesByType {
  return {
    missingSeoTitle: 0,
    missingSeoDescription: 0,
    titleTooShort: 0,
    titleTooLong: 0,
    descriptionTooShort: 0,
    descriptionTooLong: 0,
    missingCanonicalPreview: 0,
    missingHreflangPreview: 0,
    missingJsonLd: 0,
    sitemapMismatch: 0,
    noInternalLinks: 0,
  };
}

function emptyIssuesByEntityType(): SeoIssuesByEntityType {
  return {
    emoji: { issue: 0, warning: 0 },
    category: { issue: 0, warning: 0 },
    topic: { issue: 0, warning: 0 },
    article: { issue: 0, warning: 0 },
  };
}

// ─── Tokenization (no AI, no Meilisearch) ──────────────
function tokenize(text?: string | null): Set<string> {
  const tokens = new Set<string>();
  if (!text || typeof text !== 'string') return tokens;
  const lower = text.toLowerCase();
  // Latin / digit runs (length >= 2)
  for (const m of lower.match(/[a-z0-9]{2,}/g) ?? []) tokens.add(m);
  // CJK contiguous runs -> character bigrams
  for (const m of lower.match(/[一-鿿]+/g) ?? []) {
    const run = m;
    if (run.length === 1) {
      tokens.add(run);
    } else {
      for (let i = 0; i < run.length - 1; i++) tokens.add(run.slice(i, i + 2));
    }
  }
  return tokens;
}

function overlapScore(a?: string | null, b?: string | null): number {
  if (isMissing(a) || isMissing(b)) return 0;
  const ta = tokenize(a);
  const tb = tokenize(b);
  if (ta.size === 0 || tb.size === 0) return 0;
  let inter = 0;
  for (const t of ta) if (tb.has(t)) inter++;
  return inter;
}

function keywordsToText(keywords: unknown): string {
  if (Array.isArray(keywords)) {
    return (keywords as unknown[])
      .filter((k): k is string => typeof k === 'string')
      .join(' ');
  }
  if (typeof keywords === 'string') return keywords;
  return '';
}

@Injectable()
export class AdminSeoQualityService {
  private readonly logger = new Logger(AdminSeoQualityService.name);

  constructor(private readonly prisma: PrismaService) {}

  // ─── Authorization helpers (reused by controller) ─────
  assertView(admin: AdminJwtPayload): void {
    assertCanViewSeoQuality(admin.role);
  }
  assertRun(admin: AdminJwtPayload): void {
    assertCanRunSeoQualityCheck(admin.role);
  }

  // ─── Scan core ───────────────────────────────────────
  private async runScan(): Promise<SeoQualityResult> {
    const [emojis, categories, topics, articles] = await Promise.all([
      this.prisma.emoji.findMany({
        include: { translations: true, category: { select: { id: true, slug: true } } },
      }),
      this.prisma.category.findMany({
        include: { translations: true, _count: { select: { emojis: true } } },
      }),
      this.prisma.topic.findMany({
        include: { translations: true, _count: { select: { topicEmojis: true } } },
      }),
      this.prisma.article.findMany({ include: { translations: true } }),
    ]);

    const emojiInTopics = new Set(
      (await this.prisma.topicEmoji.findMany({ select: { emojiId: true } })).map(
        (e: any) => e.emojiId as string,
      ),
    );
    const publishedArticleCount = await this.prisma.article.count({
      where: { status: 'published' },
    });

    const issues: SeoIssue[] = [];
    const entityIdsWithIssue = new Set<string>();
    const totalChecked = emojis.length + categories.length + topics.length + articles.length;

    const pushIssue = (
      entityType: QualityEntityType,
      entityId: string,
      locale: 'zh' | 'en' | 'all',
      issueType: SeoIssueType,
      nameOrTitle: string | null,
      slug: string | null,
      status: string | null,
      updatedAt: string | Date,
    ) => {
      const severity = SEVERITY_MAP[issueType];
      entityIdsWithIssue.add(`${entityType}:${entityId}`);
      issues.push({
        id: `${entityType}:${entityId}:${locale}:${issueType}`,
        entityType,
        entityId,
        locale,
        issueType,
        severity,
        message: MESSAGES[issueType].message,
        recommendedAction: MESSAGES[issueType].action,
        nameOrTitle,
        slug,
        status,
        updatedAt: updatedAt instanceof Date ? updatedAt.toISOString() : updatedAt,
        editUrl: `/admin/seo/${entityType}/${entityId}/edit`,
        publicUrl:
          status === 'published' && slug && slugIsValid(slug)
            ? frontendUrl(entityType, locale === 'en' ? 'en' : 'zh', slug)
            : null,
      });
    };

    const checkTranslation = (
      entityType: QualityEntityType,
      entityId: string,
      nameOrTitle: string | null,
      slug: string | null,
      status: string | null,
      updatedAt: string | Date,
      t: any,
    ) => {
      const locale: 'zh' | 'en' = t.locale;
      const title = t.seoTitle as string | null;
      const desc = t.seoDescription as string | null;

      if (isMissing(title)) {
        pushIssue(entityType, entityId, locale, 'missingSeoTitle', nameOrTitle, slug, status, updatedAt);
      } else {
        const len = (title as string).length;
        if (len < 10) pushIssue(entityType, entityId, locale, 'titleTooShort', nameOrTitle, slug, status, updatedAt);
        else if (len > 70) pushIssue(entityType, entityId, locale, 'titleTooLong', nameOrTitle, slug, status, updatedAt);
      }

      if (isMissing(desc)) {
        pushIssue(entityType, entityId, locale, 'missingSeoDescription', nameOrTitle, slug, status, updatedAt);
      } else {
        const len = (desc as string).length;
        if (len < 50) pushIssue(entityType, entityId, locale, 'descriptionTooShort', nameOrTitle, slug, status, updatedAt);
        else if (len > 180) pushIssue(entityType, entityId, locale, 'descriptionTooLong', nameOrTitle, slug, status, updatedAt);
      }
    };

    const checkPageLevel = (
      entityType: QualityEntityType,
      entityId: string,
      nameOrTitle: string | null,
      slug: string | null,
      status: string | null,
      updatedAt: string | Date,
      translations: any[],
      context: {
        emojiInTopics?: boolean;
        emojiCount?: number;
        topicEmojiCount?: number;
        publishedArticleCount?: number;
        categoryId?: string | null;
      },
    ) => {
      if (status !== 'published') return;
      const slugValid = slugIsValid(slug);
      const hasZh = translations.some((t) => t.locale === 'zh');
      const hasEn = translations.some((t) => t.locale === 'en');
      const nameField = QUALITY_CONFIG[entityType].nameField;
      const zhName = translations.find((t) => t.locale === 'zh')?.[nameField] as string | null | undefined;
      const enName = translations.find((t) => t.locale === 'en')?.[nameField] as string | null | undefined;
      const nameMissingBoth = isMissing(zhName) && isMissing(enName);

      if (!slugValid) {
        pushIssue(entityType, entityId, 'all', 'missingCanonicalPreview', nameOrTitle, slug, status, updatedAt);
        pushIssue(entityType, entityId, 'all', 'sitemapMismatch', nameOrTitle, slug, status, updatedAt);
      }
      if (!hasZh || !hasEn) {
        pushIssue(entityType, entityId, 'all', 'missingHreflangPreview', nameOrTitle, slug, status, updatedAt);
      }
      if (entityType !== 'category' && (!slugValid || nameMissingBoth)) {
        pushIssue(entityType, entityId, 'all', 'missingJsonLd', nameOrTitle, slug, status, updatedAt);
      }

      // Internal-link opportunity (warning)
      let noLinks = false;
      if (entityType === 'emoji') {
        // Flag only when the emoji has neither a category nor any related topic.
        const hasCategory = !!context.categoryId;
        const inTopics = !!context.emojiInTopics;
        noLinks = !hasCategory && !inTopics;
      } else if (entityType === 'category') {
        noLinks = (context.emojiCount ?? 0) === 0;
      } else if (entityType === 'topic') {
        noLinks = (context.topicEmojiCount ?? 0) === 0;
      } else if (entityType === 'article') {
        noLinks = (context.publishedArticleCount ?? 0) <= 1;
      }
      if (noLinks) {
        pushIssue(entityType, entityId, 'all', 'noInternalLinks', nameOrTitle, slug, status, updatedAt);
      }
    };

    for (const e of emojis) {
      const nameOrTitle = e.translations?.find((t: any) => t.locale === 'zh')?.name
        ?? e.translations?.find((t: any) => t.locale === 'en')?.name
        ?? null;
      for (const t of e.translations ?? []) {
        checkTranslation('emoji', e.id, nameOrTitle, e.slug, e.status, e.updatedAt, t);
      }
      checkPageLevel('emoji', e.id, nameOrTitle, e.slug, e.status, e.updatedAt, e.translations ?? [], {
        emojiInTopics: emojiInTopics.has(e.id),
        categoryId: e.categoryId,
      });
    }

    for (const c of categories) {
      const nameOrTitle = c.translations?.find((t: any) => t.locale === 'zh')?.name
        ?? c.translations?.find((t: any) => t.locale === 'en')?.name
        ?? null;
      for (const t of c.translations ?? []) {
        checkTranslation('category', c.id, nameOrTitle, c.slug, c.status, c.updatedAt, t);
      }
      checkPageLevel('category', c.id, nameOrTitle, c.slug, c.status, c.updatedAt, c.translations ?? [], {
        emojiCount: (c as any)._count?.emojis ?? 0,
      });
    }

    for (const tp of topics) {
      const nameOrTitle = tp.translations?.find((t: any) => t.locale === 'zh')?.title
        ?? tp.translations?.find((t: any) => t.locale === 'en')?.title
        ?? null;
      for (const t of tp.translations ?? []) {
        checkTranslation('topic', tp.id, nameOrTitle, tp.slug, tp.status, tp.updatedAt, t);
      }
      checkPageLevel('topic', tp.id, nameOrTitle, tp.slug, tp.status, tp.updatedAt, tp.translations ?? [], {
        topicEmojiCount: (tp as any)._count?.topicEmojis ?? 0,
      });
    }

    for (const a of articles) {
      const nameOrTitle = a.translations?.find((t: any) => t.locale === 'zh')?.title
        ?? a.translations?.find((t: any) => t.locale === 'en')?.title
        ?? null;
      for (const t of a.translations ?? []) {
        checkTranslation('article', a.id, nameOrTitle, a.slug, a.status, a.updatedAt, t);
      }
      checkPageLevel('article', a.id, nameOrTitle, a.slug, a.status, a.updatedAt, a.translations ?? [], {
        publishedArticleCount,
      });
    }

    const issuesByType = emptyIssuesByType();
    const issuesByEntityType = emptyIssuesByEntityType();
    let issueCount = 0;
    let warningCount = 0;
    for (const issue of issues) {
      issuesByType[issue.issueType] += 1;
      if (issue.severity === 'issue') {
        issueCount += 1;
        issuesByEntityType[issue.entityType].issue += 1;
      } else {
        warningCount += 1;
        issuesByEntityType[issue.entityType].warning += 1;
      }
    }

    const recentIssues = [...issues]
      .sort((a, b) => {
        if (a.severity !== b.severity) return a.severity === 'issue' ? -1 : 1;
        return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
      })
      .slice(0, 12);

    const passedCount = totalChecked - entityIdsWithIssue.size;

    return {
      totalChecked,
      passedCount: passedCount < 0 ? 0 : passedCount,
      issueCount,
      warningCount,
      issuesByEntityType,
      issuesByType,
      recentIssues,
      issues,
      generatedAt: new Date().toISOString(),
    };
  }

  // ─── Overview ────────────────────────────────────────
  async getOverview(): Promise<SeoQualityOverview> {
    const result = await this.runScan();
    const { issues, ...overview } = result;
    void issues;
    return overview;
  }

  // ─── Issues list (filtered + paginated) ─────────────
  async listIssues(query: {
    page: number;
    limit: number;
    entityType: SeoEntityType | 'all';
    issueType: SeoIssueType | 'all';
    severity: SeoSeverity | 'all';
    locale: 'zh' | 'en' | 'all';
    q?: string;
  }) {
    const result = await this.runScan();
    let filtered = result.issues;

    if (query.entityType !== 'all') {
      filtered = filtered.filter((i) => i.entityType === query.entityType);
    }
    if (query.issueType !== 'all') {
      filtered = filtered.filter((i) => i.issueType === query.issueType);
    }
    if (query.severity !== 'all') {
      filtered = filtered.filter((i) => i.severity === query.severity);
    }
    if (query.locale !== 'all') {
      // Page-level / internal-link issues use locale 'all' and always apply.
      filtered = filtered.filter(
        (i) => i.locale === query.locale || i.locale === 'all',
      );
    }
    if (query.q) {
      const q = query.q.toLowerCase();
      filtered = filtered.filter(
        (i) =>
          (i.nameOrTitle && i.nameOrTitle.toLowerCase().includes(q)) ||
          (i.slug && i.slug.toLowerCase().includes(q)) ||
          i.entityId.toLowerCase().includes(q) ||
          i.message.toLowerCase().includes(q),
      );
    }

    // Stable sort: issue severity first, then most recent.
    filtered = [...filtered].sort((a, b) => {
      if (a.severity !== b.severity) return a.severity === 'issue' ? -1 : 1;
      return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
    });

    const total = filtered.length;
    const start = (query.page - 1) * query.limit;
    const data = filtered.slice(start, start + query.limit);

    // Re-count issuesByType for the filtered set (for the filter panel).
    const issuesByType = emptyIssuesByType();
    for (const i of filtered) issuesByType[i.issueType] += 1;

    return {
      data,
      meta: buildPaginationMeta(query.page, query.limit, total),
      issuesByType,
    };
  }

  // ─── Run (read-only on-demand check) ─────────────────
  async runCheck(): Promise<SeoQualityOverview> {
    // Identical to overview but explicitly flagged as an on-demand run.
    // Read-only: does not write to the database or modify any entity.
    return this.getOverview();
  }

  // ─── Internal link suggestions (no AI, no Meilisearch) ─
  async getInternalLinkSuggestions(
    entityType: QualityEntityType,
    id: string,
    locale: 'zh' | 'en',
  ): Promise<InternalLinkSuggestionResponse> {
    const suggestions: InternalLinkSuggestion[] = [];

    if (entityType === 'emoji') {
      const emoji = await this.prisma.emoji.findUnique({
        where: { id },
        include: { translations: true, category: { select: { id: true, slug: true } } },
      });
      if (!emoji) throw new NotFoundException(`未找到 emoji "${id}"`);

      // Same-category emojis
      if (emoji.categoryId) {
        const peers = await this.prisma.emoji.findMany({
          where: { categoryId: emoji.categoryId, status: 'published', id: { not: id } },
          take: 8,
          orderBy: [{ manualWeight: 'desc' }, { sortOrder: 'asc' }],
          include: { translations: true },
        });
        for (const p of peers) {
          const tr = (locale === 'zh' ? p.translations?.find((t: any) => t.locale === 'zh') : p.translations?.find((t: any) => t.locale === 'en')) as any;
          suggestions.push({
            entityType: 'emoji',
            id: p.id,
            slug: p.slug,
            title: tr?.name ?? p.slug,
            url: frontendUrl('emoji', locale, p.slug),
            reason: '同分类表情',
            score: 0,
          });
        }
      }

      // Topics containing this emoji
      const topicLinks = await this.prisma.topicEmoji.findMany({
        where: { emojiId: id },
        include: { topic: { include: { translations: true } } },
      });
      for (const link of topicLinks) {
        const tp = link.topic;
        if (tp.status !== 'published') continue;
        const tr = (locale === 'zh' ? tp.translations?.find((t: any) => t.locale === 'zh') : tp.translations?.find((t: any) => t.locale === 'en')) as any;
        suggestions.push({
          entityType: 'topic',
          id: tp.id,
          slug: tp.slug,
          title: tr?.title ?? tp.slug,
          url: frontendUrl('topic', locale, tp.slug),
          reason: '关联专题',
          score: 0,
        });
      }
    } else if (entityType === 'category') {
      const category = await this.prisma.category.findUnique({
        where: { id },
        include: { translations: true },
      });
      if (!category) throw new NotFoundException(`未找到 category "${id}"`);

      const emojis = await this.prisma.emoji.findMany({
        where: { categoryId: id, status: 'published' },
        take: 12,
        orderBy: [{ manualWeight: 'desc' }, { sortOrder: 'asc' }],
        include: { translations: true },
      });
      for (const p of emojis) {
        const tr = (locale === 'zh' ? p.translations?.find((t: any) => t.locale === 'zh') : p.translations?.find((t: any) => t.locale === 'en')) as any;
        suggestions.push({
          entityType: 'emoji',
          id: p.id,
          slug: p.slug,
          title: tr?.name ?? p.slug,
          url: frontendUrl('emoji', locale, p.slug),
          reason: '分类下表情',
          score: 0,
        });
      }

      // Related topics = topics that reference emojis in this category
      const catEmojiIds = (
        await this.prisma.emoji.findMany({
          where: { categoryId: id },
          select: { id: true },
        })
      ).map((e: any) => e.id);
      if (catEmojiIds.length > 0) {
        const topicLinks = await this.prisma.topicEmoji.findMany({
          where: { emojiId: { in: catEmojiIds } },
          include: { topic: { include: { translations: true } } },
        });
        const seen = new Set<string>();
        for (const link of topicLinks) {
          const tp = link.topic;
          if (tp.status !== 'published' || seen.has(tp.id)) continue;
          seen.add(tp.id);
          const tr = (locale === 'zh' ? tp.translations?.find((t: any) => t.locale === 'zh') : tp.translations?.find((t: any) => t.locale === 'en')) as any;
          suggestions.push({
            entityType: 'topic',
            id: tp.id,
            slug: tp.slug,
            title: tr?.title ?? tp.slug,
            url: frontendUrl('topic', locale, tp.slug),
            reason: '同分类相关专题',
            score: 0,
          });
        }
      }
    } else if (entityType === 'topic') {
      const topic = await this.prisma.topic.findUnique({
        where: { id },
        include: {
          translations: true,
          topicEmojis: { include: { emoji: { include: { translations: true } } } },
        },
      });
      if (!topic) throw new NotFoundException(`未找到 topic "${id}"`);
      for (const link of topic.topicEmojis ?? []) {
        const p = link.emoji;
        if (p.status !== 'published') continue;
        const tr = (locale === 'zh' ? p.translations?.find((t: any) => t.locale === 'zh') : p.translations?.find((t: any) => t.locale === 'en')) as any;
        suggestions.push({
          entityType: 'emoji',
          id: p.id,
          slug: p.slug,
          title: tr?.name ?? p.slug,
          url: frontendUrl('emoji', locale, p.slug),
          reason: '专题收录表情',
          score: 0,
        });
      }

      const boundEmojiIds = (topic.topicEmojis ?? []).map((l: any) => l.emojiId);
      const otherTopics = await this.prisma.topic.findMany({
        where: { status: 'published', id: { not: id } },
        include: {
          translations: true,
          topicEmojis: { where: { emojiId: { in: boundEmojiIds.length ? boundEmojiIds : ['__none__'] } } },
        },
        take: 20,
      });
      for (const tp of otherTopics) {
        const shared = (tp.topicEmojis ?? []).length;
        if (shared === 0) continue;
        const tr = (locale === 'zh' ? tp.translations?.find((t: any) => t.locale === 'zh') : tp.translations?.find((t: any) => t.locale === 'en')) as any;
        suggestions.push({
          entityType: 'topic',
          id: tp.id,
          slug: tp.slug,
          title: tr?.title ?? tp.slug,
          url: frontendUrl('topic', locale, tp.slug),
          reason: '共享表情的专题',
          score: shared,
        });
      }
    } else if (entityType === 'article') {
      const article = await this.prisma.article.findUnique({
        where: { id },
        include: { translations: true },
      });
      if (!article) throw new NotFoundException(`未找到 article "${id}"`);
      const tr = (locale === 'zh' ? article.translations?.find((t: any) => t.locale === 'zh') : article.translations?.find((t: any) => t.locale === 'en')) as any;
      const selfText = [
        tr?.title,
        tr?.summary,
        keywordsToText(tr?.keywords),
      ].join(' ');

      const others = await this.prisma.article.findMany({
        where: { status: 'published', id: { not: id } },
        include: { translations: true },
      });
      const articleSugs: InternalLinkSuggestion[] = [];
      for (const a of others) {
        const atr = (locale === 'zh' ? a.translations?.find((t: any) => t.locale === 'zh') : a.translations?.find((t: any) => t.locale === 'en')) as any;
        const score = overlapScore(
          selfText,
          [atr?.title, atr?.summary, keywordsToText(atr?.keywords)].join(' '),
        );
        if (score <= 0) continue;
        articleSugs.push({
          entityType: 'article',
          id: a.id,
          slug: a.slug,
          title: atr?.title ?? a.slug,
          url: frontendUrl('article', locale, a.slug),
          reason: '关键词相关文章',
          score,
        });
      }
      articleSugs.sort((x, y) => y.score - x.score);
      suggestions.push(...articleSugs.slice(0, 6));

      // Related topics by keyword overlap
      const topics = await this.prisma.topic.findMany({
        where: { status: 'published' },
        include: { translations: true },
      });
      const topicSugs: InternalLinkSuggestion[] = [];
      for (const tp of topics) {
        const ttr = (locale === 'zh' ? tp.translations?.find((t: any) => t.locale === 'zh') : tp.translations?.find((t: any) => t.locale === 'en')) as any;
        const score = overlapScore(selfText, [ttr?.title, ttr?.summary].join(' '));
        if (score <= 0) continue;
        topicSugs.push({
          entityType: 'topic',
          id: tp.id,
          slug: tp.slug,
          title: ttr?.title ?? tp.slug,
          url: frontendUrl('topic', locale, tp.slug),
          reason: '关键词相关专题',
          score,
        });
      }
      topicSugs.sort((x, y) => y.score - x.score);
      suggestions.push(...topicSugs.slice(0, 5));

      // Related emojis by keyword overlap
      const emojis = await this.prisma.emoji.findMany({
        where: { status: 'published' },
        include: { translations: true },
      });
      const emojiSugs: InternalLinkSuggestion[] = [];
      for (const p of emojis) {
        const ptr = (locale === 'zh' ? p.translations?.find((t: any) => t.locale === 'zh') : p.translations?.find((t: any) => t.locale === 'en')) as any;
        const score = overlapScore(selfText, [ptr?.name, keywordsToText(ptr?.keywords)].join(' '));
        if (score <= 0) continue;
        emojiSugs.push({
          entityType: 'emoji',
          id: p.id,
          slug: p.slug,
          title: ptr?.name ?? p.slug,
          url: frontendUrl('emoji', locale, p.slug),
          reason: '关键词相关表情',
          score,
        });
      }
      emojiSugs.sort((x, y) => y.score - x.score);
      suggestions.push(...emojiSugs.slice(0, 6));
    }

    return {
      entityType,
      id,
      locale,
      suggestions: suggestions.slice(0, 20),
    };
  }
}
