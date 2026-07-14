import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { DEFAULT_LOCALE, type Locale } from '@emoji-platform/types';

export type RecommendationEntityType = 'emoji' | 'category' | 'topic' | 'article';

export interface RecommendationResult {
  entityType: RecommendationEntityType;
  id: string;
  slug: string;
  locale: Locale;
  relatedEmojis: unknown[];
  relatedCategories: unknown[];
  relatedTopics: unknown[];
  relatedArticles: unknown[];
}

/**
 * Phase 6D RecommendationService.
 *
 * Lightweight, explainable, content-based recommendations built from the
 * existing public data. No AI, no personalization, no user profiling, no
 * third-party recommendation service.
 *
 * The recommendation logic is computed from the DATABASE only. Meilisearch is
 * NOT a hard dependency: if it is unavailable the recommendations still work
 * (and the public pages never break). The `SearchService` is intentionally not
 * used here so recommendations remain fully independent of the search provider.
 *
 * Hard boundaries (per DEVELOPMENT_RULES + Phase 6D spec):
 * - Only PUBLISHED content is recommended (draft / archived excluded).
 * - The current entity is always excluded from its own recommendations.
 * - No admin fields, no passwordHash / JWT_SECRET / plaintext IP / API keys.
 * - No new sitemap / robots entries; recommendations are page-content only.
 */
@Injectable()
export class RecommendationService {
  private readonly logger = new Logger(RecommendationService.name);
  private readonly defaultLimit = 8;
  private readonly maxLimit = 20;
  private readonly candidatePool = 300;

  constructor(private readonly prisma: PrismaService) {}

  async getRecommendations(
    entityType: RecommendationEntityType,
    slug: string,
    locale: Locale = DEFAULT_LOCALE,
    limit?: number,
  ): Promise<RecommendationResult> {
    const safeLimit = this.normalizeLimit(limit);
    switch (entityType) {
      case 'emoji':
        return this.forEmoji(slug, locale, safeLimit);
      case 'category':
        return this.forCategory(slug, locale, safeLimit);
      case 'topic':
        return this.forTopic(slug, locale, safeLimit);
      case 'article':
        return this.forArticle(slug, locale, safeLimit);
    }
  }

  // ─── Per-entity recommendation builders ──────────────

  private async forEmoji(slug: string, locale: Locale, limit: number): Promise<RecommendationResult> {
    const emoji = await this.prisma.emoji.findFirst({
      where: { slug, status: 'published' },
      include: {
        translations: { where: { locale } },
        topicEmojis: { select: { topicId: true } },
      },
    });
    if (!emoji) {
      throw new NotFoundException(`Emoji with slug "${slug}" not found`);
    }

    const targetText = this.entityText([
      emoji.translations[0]?.name ?? '',
      emoji.translations[0]?.shortName ?? '',
      this.keywordsText(emoji.translations[0]?.keywords),
    ]);
    const topicIds = emoji.topicEmojis.map((t) => t.topicId);

    const [sameCategory, sameTopic] = await Promise.all([
      this.prisma.emoji.findMany({
        where: { categoryId: emoji.categoryId, status: 'published', id: { not: emoji.id } },
        take: limit,
        orderBy: [{ sortOrder: 'asc' }, { id: 'asc' }],
        include: { translations: { where: { locale } } },
      }),
      topicIds.length > 0
        ? this.prisma.emoji.findMany({
            where: {
              status: 'published',
              id: { not: emoji.id },
              topicEmojis: { some: { topicId: { in: topicIds } } },
            },
            take: limit,
            orderBy: [{ sortOrder: 'asc' }, { id: 'asc' }],
            include: { translations: { where: { locale } } },
          })
        : Promise.resolve([] as unknown[]),
    ]);

    // Keyword-near candidates from a bounded published pool.
    const pool = await this.prisma.emoji.findMany({
      where: { status: 'published', id: { not: emoji.id } },
      take: this.candidatePool,
      include: { translations: { where: { locale } } },
    });
    const keywordNear = pool
      .map((e) => ({
        e,
        score: this.overlap(
          targetText,
          this.entityText([e.translations[0]?.name ?? '', this.keywordsText(e.translations[0]?.keywords)]),
        ),
      }))
      .filter((x) => x.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
      .map((x) => x.e);

    const merged = this.dedupeById([...sameCategory, ...sameTopic, ...keywordNear]).slice(0, limit);

    return {
      entityType: 'emoji',
      id: emoji.id,
      slug: emoji.slug,
      locale,
      relatedEmojis: merged.map((e) => this.formatRelatedEmoji(e, locale)),
      relatedCategories: [],
      relatedTopics: [],
      relatedArticles: [],
    };
  }

  private async forCategory(slug: string, locale: Locale, limit: number): Promise<RecommendationResult> {
    const category = await this.prisma.category.findFirst({
      where: { slug, status: 'published' },
      include: {
        translations: { where: { locale } },
        _count: {
          select: {
            emojis: { where: { status: 'published' } },
            subEmojis: { where: { status: 'published' } },
          },
        },
      },
    });
    if (!category) {
      throw new NotFoundException(`Category with slug "${slug}" not found`);
    }

    const where: Record<string, unknown> = {
      status: 'published',
      OR: [{ parentId: category.id }] as Record<string, unknown>[],
    };
    if (category.parentId) {
      // Siblings: other categories that share the same parent.
      (where.OR as Record<string, unknown>[]).push({
        parentId: category.parentId,
        id: { not: category.id },
      });
    } else {
      // Top-level category with no parent: surface other top-level categories
      // as siblings so the "related categories" module is never empty.
      (where.OR as Record<string, unknown>[]).push({
        parentId: null,
        id: { not: category.id },
      });
    }

    const relatedCategories = await this.prisma.category.findMany({
      where,
      take: limit,
      orderBy: [{ sortOrder: 'asc' }, { id: 'asc' }],
      include: {
        translations: { where: { locale } },
        _count: {
          select: {
            emojis: { where: { status: 'published' } },
            subEmojis: { where: { status: 'published' } },
          },
        },
      },
    });

    let relatedTopics: unknown[] = [];
    const catEmojiIds = await this.prisma.emoji.findMany({
      where: { categoryId: category.id, status: 'published' },
      select: { id: true },
    });
    if (catEmojiIds.length > 0) {
      const topicEmojis = await this.prisma.topicEmoji.findMany({
        where: { emojiId: { in: catEmojiIds.map((e) => e.id) }, topic: { status: 'published' } },
        include: { topic: { include: { translations: { where: { locale } } } } },
        distinct: ['topicId'],
        take: limit,
      });
      relatedTopics = topicEmojis.map((te) => this.formatRelatedTopic(te.topic, locale));
    }

    const categoryText = this.entityText([
      category.translations[0]?.name ?? '',
      category.translations[0]?.description ?? '',
    ]);
    const relatedArticles = await this.relatedArticlesByText(categoryText, locale, limit);

    return {
      entityType: 'category',
      id: category.id,
      slug: category.slug,
      locale,
      relatedEmojis: [],
      relatedCategories: relatedCategories.map((c) => this.formatCategoryItem(c, locale)),
      relatedTopics,
      relatedArticles,
    };
  }

  private async forTopic(slug: string, locale: Locale, limit: number): Promise<RecommendationResult> {
    const topic = await this.prisma.topic.findFirst({
      where: { slug, status: 'published' },
      include: {
        translations: { where: { locale } },
        topicEmojis: { select: { emojiId: true } },
      },
    });
    if (!topic) {
      throw new NotFoundException(`Topic with slug "${slug}" not found`);
    }

    const emojiIds = topic.topicEmojis.map((t) => t.emojiId);

    let relatedEmojis: unknown[] = [];
    if (emojiIds.length > 0) {
      const emojis = await this.prisma.emoji.findMany({
        where: { id: { in: emojiIds }, status: 'published' },
        take: limit,
        orderBy: [{ sortOrder: 'asc' }, { id: 'asc' }],
        include: { translations: { where: { locale } } },
      });
      relatedEmojis = emojis.map((e) => this.formatRelatedEmoji(e, locale));
    }

    let relatedTopics: unknown[] = [];
    if (emojiIds.length > 0) {
      const topicEmojis = await this.prisma.topicEmoji.findMany({
        where: { emojiId: { in: emojiIds }, topicId: { not: topic.id } },
        include: { topic: { include: { translations: { where: { locale } } } } },
        distinct: ['topicId'],
        take: this.candidatePool,
      });
      const shared = new Map<string, number>();
      for (const te of topicEmojis) {
        shared.set(te.topicId, (shared.get(te.topicId) ?? 0) + 1);
      }
      relatedTopics = topicEmojis
        .map((te) => ({ topic: te.topic, score: shared.get(te.topicId) ?? 0 }))
        .sort((a, b) => b.score - a.score)
        .slice(0, limit)
        .map((x) => this.formatRelatedTopic(x.topic, locale));
    }

    const topicText = this.entityText([
      topic.translations[0]?.title ?? '',
      topic.translations[0]?.summary ?? '',
    ]);
    const relatedArticles = await this.relatedArticlesByText(topicText, locale, limit);

    return {
      entityType: 'topic',
      id: topic.id,
      slug: topic.slug,
      locale,
      relatedEmojis,
      relatedCategories: [],
      relatedTopics,
      relatedArticles,
    };
  }

  private async forArticle(slug: string, locale: Locale, limit: number): Promise<RecommendationResult> {
    const article = await this.prisma.article.findFirst({
      where: { slug, status: 'published' },
      include: { translations: { where: { locale } } },
    });
    if (!article || article.translations.length === 0) {
      throw new NotFoundException(`Article with slug "${slug}" not found`);
    }

    const t = article.translations[0];
    const text = this.entityText([
      t?.title ?? '',
      t?.summary ?? '',
      this.keywordsText(t?.keywords),
    ]);

    const [otherArticles, topics, emojis] = await Promise.all([
      this.prisma.article.findMany({
        where: { status: 'published', id: { not: article.id } },
        take: this.candidatePool,
        include: { translations: { where: { locale } } },
      }),
      this.prisma.topic.findMany({
        where: { status: 'published' },
        take: this.candidatePool,
        include: { translations: { where: { locale } } },
      }),
      this.prisma.emoji.findMany({
        where: { status: 'published' },
        take: this.candidatePool,
        include: { translations: { where: { locale } } },
      }),
    ]);

    const relatedArticles = this.scoreArticles(otherArticles, text, locale).slice(0, limit);
    const relatedTopics = this.scoreTopics(topics, text, locale).slice(0, limit);
    const relatedEmojis = this.scoreEmojis(emojis, text, locale).slice(0, limit);

    return {
      entityType: 'article',
      id: article.id,
      slug: article.slug,
      locale,
      relatedEmojis,
      relatedCategories: [],
      relatedTopics,
      relatedArticles,
    };
  }

  // ─── Scoring helpers (keyword overlap, no AI) ────────

  private async relatedArticlesByText(text: string, locale: Locale, limit: number): Promise<unknown[]> {
    if (!text.trim()) return [];
    return this.scoreArticles(
      await this.prisma.article.findMany({
        where: { status: 'published' },
        take: this.candidatePool,
        include: { translations: { where: { locale } } },
      }),
      text,
      locale,
    ).slice(0, limit);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private scoreArticles(articles: any[], text: string, _locale: Locale): unknown[] {
    return articles
      .map((a) => {
        const tr = a.translations[0];
        const artText = this.entityText([
          tr?.title ?? '',
          tr?.summary ?? '',
          this.keywordsText(tr?.keywords),
        ]);
        return { a, score: this.overlap(text, artText) };
      })
      .filter((x) => x.score > 0)
      .sort((a, b) => b.score - a.score)
      .map((x) => this.formatArticleItem(x.a, _locale));
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private scoreTopics(topics: any[], text: string, _locale: Locale): unknown[] {
    return topics
      .map((tp) => {
        const tr = tp.translations[0];
        const tpText = this.entityText([tr?.title ?? '', tr?.summary ?? '']);
        return { tp, score: this.overlap(text, tpText) };
      })
      .filter((x) => x.score > 0)
      .sort((a, b) => b.score - a.score)
      .map((x) => this.formatRelatedTopic(x.tp, _locale));
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private scoreEmojis(emojis: any[], text: string, _locale: Locale): unknown[] {
    return emojis
      .map((e) => {
        const tr = e.translations[0];
        const eText = this.entityText([tr?.name ?? '', tr?.shortName ?? '', this.keywordsText(tr?.keywords)]);
        return { e, score: this.overlap(text, eText) };
      })
      .filter((x) => x.score > 0)
      .sort((a, b) => b.score - a.score)
      .map((x) => this.formatRelatedEmoji(x.e, _locale));
  }

  // ─── Tokenization (no AI, no Meilisearch) ────────────

  private tokenize(text?: string | null): Set<string> {
    const tokens = new Set<string>();
    if (!text || typeof text !== 'string') return tokens;
    const lower = text.toLowerCase();
    for (const m of lower.match(/[a-z0-9]{2,}/g) ?? []) tokens.add(m);
    for (const m of lower.match(/[一-鿿]+/g) ?? []) {
      if (m.length === 1) tokens.add(m);
      else for (let i = 0; i < m.length - 1; i++) tokens.add(m.slice(i, i + 2));
    }
    return tokens;
  }

  private overlap(a: string, b: string): number {
    if (!a || !b) return 0;
    const ta = this.tokenize(a);
    const tb = this.tokenize(b);
    if (ta.size === 0 || tb.size === 0) return 0;
    let inter = 0;
    for (const t of ta) if (tb.has(t)) inter++;
    return inter;
  }

  private keywordsText(keywords: unknown): string {
    if (Array.isArray(keywords)) {
      return (keywords as unknown[]).filter((k): k is string => typeof k === 'string').join(' ');
    }
    if (typeof keywords === 'string') return keywords;
    return '';
  }

  private entityText(parts: string[]): string {
    return parts.filter((p) => !!p && p.trim().length > 0).join(' ');
  }

  // ─── Small utilities ──────────────────────────────────

  private normalizeLimit(limit?: number): number {
    if (limit === undefined || Number.isNaN(limit) || limit < 1) return this.defaultLimit;
    return Math.min(limit, this.maxLimit);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private dedupeById(items: any[]): any[] {
    const seen = new Set<string>();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const out: any[] = [];
    for (const item of items) {
      if (item?.id && !seen.has(item.id)) {
        seen.add(item.id);
        out.push(item);
      }
    }
    return out;
  }

  // ─── Formatters (public, published-only shapes) ──────

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private formatRelatedEmoji(emoji: any, _locale: Locale) {
    const translation = emoji.translations[0] ?? null;
    return {
      id: emoji.id,
      emojiChar: emoji.emojiChar,
      slug: emoji.slug,
      shortcode: emoji.shortcode,
      translation: translation
        ? {
            locale: translation.locale,
            name: translation.name,
            shortName: translation.shortName,
            oneLineMeaning: translation.oneLineMeaning,
          }
        : null,
    };
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private formatRelatedTopic(topic: any, _locale: Locale) {
    const translation = topic.translations[0] ?? null;
    return {
      id: topic.id,
      slug: topic.slug,
      topicType: topic.topicType,
      coverImage: topic.coverImage,
      translation: translation
        ? {
            locale: translation.locale,
            title: translation.title,
            summary: translation.summary,
          }
        : null,
    };
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private formatCategoryItem(category: any, _locale: Locale) {
    const translation = category.translations[0] ?? null;
    return {
      id: category.id,
      slug: category.slug,
      iconEmoji: category.iconEmoji,
      parentId: category.parentId,
      sortOrder: category.sortOrder,
      emojiCount: (category._count?.emojis ?? 0) + (category._count?.subEmojis ?? 0),
      translation: translation
        ? {
            locale: translation.locale,
            name: translation.name,
            description: translation.description,
            seoTitle: translation.seoTitle,
            seoDescription: translation.seoDescription,
          }
        : null,
    };
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private formatArticleItem(article: any, _locale: Locale) {
    const translation = article.translations[0] ?? null;
    return {
      id: article.id,
      slug: article.slug,
      coverImage: article.coverImage,
      publishedAt: article.publishedAt,
      status: article.status,
      translation: translation
        ? {
            locale: translation.locale,
            title: translation.title,
            summary: translation.summary,
            seoTitle: translation.seoTitle,
            seoDescription: translation.seoDescription,
          }
        : null,
    };
  }
}
