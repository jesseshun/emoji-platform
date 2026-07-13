/* eslint-disable @typescript-eslint/no-explicit-any */
import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { SearchProvider } from './search-provider.interface';
import {
  SearchQueryInput,
  SearchResult,
  SearchResultTotals,
  UnifiedSearchResultItem,
  SearchTypeFilter,
} from './search.types';

type EntityType = 'emoji' | 'category' | 'topic' | 'article';
const ALL_TYPES: EntityType[] = ['emoji', 'category', 'topic', 'article'];

/**
 * Default search provider (Phase 6A, extended in Phase 6C).
 *
 * Searches Postgres directly across emoji / category / topic / article entities
 * (published only, locale-aware) and returns a unified, typed result list. A
 * `type` filter restricts results to a single entity type; `totalByType` always
 * reports per-type counts so the frontend can show filter tab badges.
 *
 * Preserves the existing database search behavior and search-log recording
 * contract. Moving this logic into a provider lets SearchService switch
 * implementations (e.g. Meilisearch) without changing the public API contract.
 */
@Injectable()
export class DatabaseSearchProvider implements SearchProvider {
  readonly type = 'database' as const;
  private readonly logger = new Logger(DatabaseSearchProvider.name);

  constructor(private readonly prisma: PrismaService) {}

  async search(query: SearchQueryInput, userAgent?: string): Promise<SearchResult> {
    const { locale, q, page, limit, type } = query;

    // Empty query → no search, no log (matches prior behavior).
    if (!q) {
      return {
        data: [],
        meta: {
          page,
          limit,
          total: 0,
          totalPages: 0,
          provider: 'database',
          fallbackUsed: false,
          totalByType: { emoji: 0, category: 0, topic: 0, article: 0 },
          type,
          query: '',
        },
      };
    }

    const targetTypes = type === 'all' ? ALL_TYPES : [type];

    // Paginated results for the requested type(s).
    const searched = await Promise.all(
      targetTypes.map((t) => this.searchType(t, q, locale, page, limit)),
    );
    const data: UnifiedSearchResultItem[] = searched.flatMap((r) => r.items);

    // Per-type counts (full tab counts regardless of the active filter).
    const totalByType: SearchResultTotals = { emoji: 0, category: 0, topic: 0, article: 0 };
    for (const r of searched) totalByType[r.type] = r.count;
    const missing = ALL_TYPES.filter((t) => !targetTypes.includes(t));
    if (missing.length > 0) {
      const counts = await Promise.all(missing.map((t) => this.countType(t, q, locale)));
      missing.forEach((t, i) => {
        totalByType[t] = counts[i];
      });
    }

    const total = totalByType.emoji + totalByType.category + totalByType.topic + totalByType.article;
    const totalPages =
      type === 'all'
        ? Math.max(1, Math.ceil(total / limit))
        : Math.max(1, Math.ceil(totalByType[type] / limit));

    // Record search log once (fire-and-forget, never fails the search).
    this.recordSearchLog(q, locale, total, userAgent).catch((err) => {
      this.logger.warn(`Failed to record search log: ${err.message}`);
    });

    return {
      data,
      meta: {
        page,
        limit,
        total,
        totalPages,
        provider: 'database',
        fallbackUsed: false,
        totalByType,
        type,
        query: q,
      },
    };
  }

  private resolveTypes(type: SearchTypeFilter): EntityType[] {
    return type === 'all' ? ALL_TYPES : [type];
  }

  private async searchType(
    type: EntityType,
    q: string,
    locale: 'zh' | 'en',
    page: number,
    limit: number,
  ): Promise<{ type: EntityType; items: UnifiedSearchResultItem[]; count: number; totalPages: number }> {
    const skip = (page - 1) * limit;
    switch (type) {
      case 'emoji': {
        const where = this.emojiWhere(q, locale);
        const [emojis, count] = await Promise.all([
          this.prisma.emoji.findMany({
            where: where as any,
            skip,
            take: limit,
            orderBy: [{ sortOrder: 'asc' }, { id: 'asc' }],
            include: {
              category: { include: { translations: { where: { locale } } } },
              translations: { where: { locale } },
            },
          }),
          this.prisma.emoji.count({ where: where as any }),
        ]);
        const items = emojis.map(
          (emoji: any): UnifiedSearchResultItem => ({
            type: 'emoji',
            id: emoji.id,
            emojiChar: emoji.emojiChar,
            slug: emoji.slug,
            unicodeCodepoint: emoji.unicodeCodepoint,
            shortcode: emoji.shortcode,
            category: emoji.category
              ? {
                  id: emoji.category.id,
                  slug: emoji.category.slug,
                  name: emoji.category.translations[0]?.name ?? null,
                }
              : null,
            translation: emoji.translations[0]
              ? {
                  name: emoji.translations[0].name,
                  shortName: emoji.translations[0].shortName,
                  oneLineMeaning: emoji.translations[0].oneLineMeaning,
                  keywords: emoji.translations[0].keywords,
                }
              : null,
          }),
        );
        return { type, items, count, totalPages: Math.max(1, Math.ceil(count / limit)) };
      }

      case 'category': {
        const where = this.translatableWhere(q, locale, ['name', 'description']);
        const [categories, count] = await Promise.all([
          this.prisma.category.findMany({
            where: where as any,
            skip,
            take: limit,
            orderBy: [{ sortOrder: 'asc' }, { id: 'asc' }],
            include: {
              translations: { where: { locale } },
              _count: { select: { emojis: true } },
            },
          }),
          this.prisma.category.count({ where: where as any }),
        ]);
        const items = categories.map(
          (c: any): UnifiedSearchResultItem => ({
            type: 'category',
            id: c.id,
            slug: c.slug,
            iconEmoji: c.iconEmoji ?? null,
            emojiCount: c._count?.emojis ?? 0,
            name: c.translations[0]?.name ?? null,
            description: c.translations[0]?.description ?? null,
          }),
        );
        return { type, items, count, totalPages: Math.max(1, Math.ceil(count / limit)) };
      }

      case 'topic': {
        const where = this.translatableWhere(q, locale, ['title', 'summary']);
        const [topics, count] = await Promise.all([
          this.prisma.topic.findMany({
            where: where as any,
            skip,
            take: limit,
            orderBy: [{ sortOrder: 'asc' }, { id: 'asc' }],
            include: { translations: { where: { locale } } },
          }),
          this.prisma.topic.count({ where: where as any }),
        ]);
        const items = topics.map(
          (t: any): UnifiedSearchResultItem => ({
            type: 'topic',
            id: t.id,
            slug: t.slug,
            coverImage: t.coverImage ?? null,
            topicType: t.topicType ?? null,
            title: t.translations[0]?.title ?? null,
            summary: t.translations[0]?.summary ?? null,
          }),
        );
        return { type, items, count, totalPages: Math.max(1, Math.ceil(count / limit)) };
      }

      case 'article': {
        const where = this.translatableWhere(q, locale, ['title', 'summary']);
        const [articles, count] = await Promise.all([
          this.prisma.article.findMany({
            where: where as any,
            skip,
            take: limit,
            orderBy: [{ publishedAt: 'desc' }, { id: 'asc' }],
            include: { translations: { where: { locale } } },
          }),
          this.prisma.article.count({ where: where as any }),
        ]);
        const items = articles.map(
          (a: any): UnifiedSearchResultItem => ({
            type: 'article',
            id: a.id,
            slug: a.slug,
            coverImage: a.coverImage ?? null,
            publishedAt: a.publishedAt ? a.publishedAt.toISOString() : null,
            title: a.translations[0]?.title ?? null,
            summary: a.translations[0]?.summary ?? null,
          }),
        );
        return { type, items, count, totalPages: Math.max(1, Math.ceil(count / limit)) };
      }
    }
  }

  private async countType(type: EntityType, q: string, locale: 'zh' | 'en'): Promise<number> {
    try {
      switch (type) {
        case 'emoji':
          return this.prisma.emoji.count({ where: this.emojiWhere(q, locale) as any });
        case 'category':
          return this.prisma.category.count({ where: this.translatableWhere(q, locale, ['name', 'description']) as any });
        case 'topic':
          return this.prisma.topic.count({ where: this.translatableWhere(q, locale, ['title', 'summary']) as any });
        case 'article':
          return this.prisma.article.count({ where: this.translatableWhere(q, locale, ['title', 'summary']) as any });
      }
    } catch (err: any) {
      this.logger.warn(`countType(${type}) failed: ${err.message}`);
      return 0;
    }
  }

  private emojiWhere(q: string, locale: 'zh' | 'en') {
    return {
      status: 'published' as const,
      OR: [
        { emojiChar: { contains: q, mode: 'insensitive' as const } },
        { slug: { contains: q, mode: 'insensitive' as const } },
        { unicodeCodepoint: { contains: q, mode: 'insensitive' as const } },
        { shortcode: { contains: q, mode: 'insensitive' as const } },
        {
          translations: {
            some: {
              locale,
              OR: [
                { name: { contains: q, mode: 'insensitive' as const } },
                { shortName: { contains: q, mode: 'insensitive' as const } },
                { oneLineMeaning: { contains: q, mode: 'insensitive' as const } },
              ],
            },
          },
        },
      ],
    };
  }

  private translatableWhere(
    q: string,
    locale: 'zh' | 'en',
    fields: ('name' | 'description' | 'title' | 'summary')[],
  ) {
    const or = fields.map((f) => ({ [f]: { contains: q, mode: 'insensitive' as const } }));
    return {
      status: 'published' as const,
      OR: [
        { slug: { contains: q, mode: 'insensitive' as const } },
        { translations: { some: { locale, OR: or } } },
      ],
    };
  }

  private async recordSearchLog(
    q: string,
    locale: string,
    resultCount: number,
    userAgent?: string,
  ) {
    try {
      await this.prisma.searchLog.create({
        data: {
          query: q,
          locale: locale as any,
          resultCount,
          userAgent: userAgent ?? null,
          ipHash: null, // left empty for now
        },
      });
    } catch (error: any) {
      this.logger.warn(`Failed to write search log: ${error.message}`);
    }
  }
}
