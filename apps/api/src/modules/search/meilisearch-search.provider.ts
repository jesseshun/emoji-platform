/* eslint-disable @typescript-eslint/no-explicit-any */
import { Injectable, Logger } from '@nestjs/common';
import { type SearchResponse } from 'meilisearch';
import { PrismaService } from '../../prisma/prisma.service';
import { SearchProvider } from './search-provider.interface';
import { SearchQueryInput, SearchResult, SearchResultItem } from './search.types';
import { MeilisearchConfig } from './search.config';
import { createMeiliClient, isMeiliConfigured } from './meilisearch-client';
import { buildPaginationMeta } from '@emoji-platform/types';

/**
 * Real Meilisearch search provider (Phase 6B).
 *
 * Connects to a Meilisearch instance only when it is both configured (host +
 * apiKey present) and reachable. The public `search()` always returns emoji
 * results (filtered by `type = 'emoji'`) so the response shape stays compatible
 * with the existing web frontend; category / topic / article documents live in
 * the same index for future discovery features (Phase 6C+).
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
    const { locale, q, page, limit } = query;

    // Empty query → no search, no log (matches database provider behavior).
    if (!q) {
      return { data: [], meta: buildPaginationMeta(page, limit, 0) };
    }

    const client = this.getClient();
    const index = client.index(this.meiliConfig.indexName);

    const filter = [
      `type = 'emoji'`,
      `locale = '${locale}'`,
      `status = 'published'`,
    ];

    let response: SearchResponse<any, any>;
    try {
      response = await index.search(q, {
        filter,
        limit,
        offset: (page - 1) * limit,
      });
    } catch (err) {
      // Recognizable error so SearchService can fall back to the database.
      const message = err instanceof Error ? err.message : String(err);
      throw new Error(`Meilisearch search failed: ${message}`);
    }

    const hits = response.hits ?? [];
    const total =
      typeof response.estimatedTotalHits === 'number'
        ? response.estimatedTotalHits
        : hits.length;

    const data: SearchResultItem[] = hits.map((hit: any) => ({
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
    }));

    // Record search log exactly once (no double logging on fallback).
    this.recordSearchLog(q, locale, total, userAgent).catch((err) => {
      this.logger.warn(`Failed to record Meilisearch search log: ${err.message}`);
    });

    return { data, meta: buildPaginationMeta(page, limit, total) };
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
