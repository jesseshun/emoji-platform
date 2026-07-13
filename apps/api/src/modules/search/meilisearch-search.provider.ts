/* eslint-disable @typescript-eslint/no-explicit-any */
import { Injectable, Logger } from '@nestjs/common';
import { type SearchResponse } from 'meilisearch';
import { PrismaService } from '../../prisma/prisma.service';
import { SearchProvider } from './search-provider.interface';
import {
  SearchQueryInput,
  SearchResult,
  SearchResultTotals,
  UnifiedSearchResultItem,
} from './search.types';
import { MeilisearchConfig } from './search.config';
import { createMeiliClient, isMeiliConfigured } from './meilisearch-client';

type EntityType = 'emoji' | 'category' | 'topic' | 'article';
const ALL_TYPES: EntityType[] = ['emoji', 'category', 'topic', 'article'];

/**
 * Real Meilisearch search provider (Phase 6B, extended in Phase 6C).
 *
 * Connects to a Meilisearch instance only when it is both configured (host +
 * apiKey present) and reachable. Searches the unified `emoji_platform_search`
 * index across every published entity type and maps each hit back to its
 * typed result shape (emoji / category / topic / article) so the response is
 * identical in structure to the database provider.
 *
 * On any Meilisearch failure `search()` throws a recognizable error so that
 * SearchService can fall back to the database provider. Search logs are still
 * recorded (exactly once) to preserve the analytics contract.
 */
@Injectable()
export class MeilisearchSearchProvider implements SearchProvider {
  readonly type = 'meilisearch' as const;
  private readonly logger = new Logger(MeilisearchSearchProvider.name);
  private client = null as ReturnType<typeof createMeiliClient> | null;

  constructor(
    private readonly prisma: PrismaService,
    private readonly meiliConfig: MeilisearchConfig,
  ) {}

  /** True only when host + apiKey are both configured (no network call). */
  isAvailable(): boolean {
    return isMeiliConfigured(this.meiliConfig);
  }

  private getClient(): ReturnType<typeof createMeiliClient> {
    if (!this.isAvailable()) {
      throw new Error('Meilisearch is not configured (missing host or api key).');
    }
    if (!this.client) {
      this.client = createMeiliClient(this.meiliConfig);
    }
    return this.client;
  }

  /** Probes Meilisearch health without throwing. */
  async isReachable(): Promise<boolean> {
    if (!this.isAvailable()) return false;
    try {
      await this.getClient().health();
      return true;
    } catch {
      return false;
    }
  }

  async search(query: SearchQueryInput, userAgent?: string): Promise<SearchResult> {
    const { locale, q, page, limit, type } = query;

    // Empty query → no search, no log (matches database provider behavior).
    if (!q) {
      return {
        data: [],
        meta: {
          page,
          limit,
          total: 0,
          totalPages: 0,
          provider: 'meilisearch',
          fallbackUsed: false,
          totalByType: { emoji: 0, category: 0, topic: 0, article: 0 },
          type,
          query: '',
        },
      };
    }

    const client = this.getClient();
    const index = client.index(this.meiliConfig.indexName);

    const baseFilter = [`locale = '${locale}'`, `status = 'published'`];
    const mainFilter = type === 'all' ? baseFilter : [...baseFilter, `type = '${type}'`];

    // Main paginated search for the requested type(s).
    const response: SearchResponse<any, any> = await index.search(q, {
      filter: mainFilter,
      limit,
      offset: (page - 1) * limit,
    });

    const hits = response.hits ?? [];
    const data: UnifiedSearchResultItem[] = hits
      .map((hit: any) => this.mapHit(hit))
      .filter((item: UnifiedSearchResultItem | null): item is UnifiedSearchResultItem => item !== null);

    // Per-type counts (full tab counts regardless of the active filter).
    const totalByType: SearchResultTotals = { emoji: 0, category: 0, topic: 0, article: 0 };
    await Promise.all(
      ALL_TYPES.map(async (t) => {
        try {
          const r = await index.search(q, {
            filter: [`type = '${t}'`, `locale = '${locale}'`, `status = 'published'`],
            limit: 0,
          });
          totalByType[t] =
            typeof r.estimatedTotalHits === 'number'
              ? r.estimatedTotalHits
              : (r.hits?.length ?? 0);
        } catch {
          totalByType[t] = 0;
        }
      }),
    );

    const total =
      totalByType.emoji + totalByType.category + totalByType.topic + totalByType.article;
    const totalPages =
      type === 'all'
        ? Math.max(1, Math.ceil(total / limit))
        : Math.max(1, Math.ceil(totalByType[type] / limit));

    // Record search log exactly once (no double logging on fallback).
    this.recordSearchLog(q, locale, total, userAgent).catch((err) => {
      this.logger.warn(`Failed to record Meilisearch search log: ${err.message}`);
    });

    return {
      data,
      meta: {
        page,
        limit,
        total,
        totalPages,
        provider: 'meilisearch',
        fallbackUsed: false,
        totalByType,
        type,
        query: q,
      },
    };
  }

  /** Maps a Meilisearch hit back to its typed unified result (by `hit.type`). */
  private mapHit(hit: any): UnifiedSearchResultItem | null {
    switch (hit.type) {
      case 'emoji':
        return {
          type: 'emoji',
          id: String(hit.id),
          emojiChar: hit.emojiChar ?? '',
          slug: hit.slug ?? '',
          unicodeCodepoint: hit.unicodeCodepoint ?? null,
          shortcode: hit.shortcode ?? null,
          category: hit.categoryId
            ? {
                id: String(hit.categoryId),
                slug: hit.categorySlug ?? '',
                name: hit.categoryName ?? null,
              }
            : null,
          translation: {
            name: hit.title ?? null,
            shortName: hit.shortName ?? null,
            oneLineMeaning: hit.description ?? null,
            keywords: Array.isArray(hit.keywords) ? (hit.keywords as string[]) : null,
          },
        };
      case 'category':
        return {
          type: 'category',
          id: String(hit.id),
          slug: hit.slug ?? '',
          iconEmoji: hit.iconEmoji ?? null,
          emojiCount: typeof hit.emojiCount === 'number' ? hit.emojiCount : 0,
          name: hit.title ?? null,
          description: hit.description ?? null,
        };
      case 'topic':
        return {
          type: 'topic',
          id: String(hit.id),
          slug: hit.slug ?? '',
          coverImage: hit.coverImage ?? null,
          topicType: hit.topicType ?? null,
          title: hit.title ?? null,
          summary: hit.description ?? null,
        };
      case 'article':
        return {
          type: 'article',
          id: String(hit.id),
          slug: hit.slug ?? '',
          coverImage: hit.coverImage ?? null,
          publishedAt: hit.publishedAt ?? null,
          title: hit.title ?? null,
          summary: hit.description ?? null,
        };
      default:
        return null;
    }
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
      this.logger.warn(`Failed to write Meilisearch search log: ${error.message}`);
    }
  }
}
