import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { SearchProvider } from './search-provider.interface';
import { DatabaseSearchProvider } from './database-search.provider';
import { MeilisearchSearchProvider } from './meilisearch-search.provider';
import { SearchIndexService } from './search-index.service';
import { loadSearchConfig, SearchConfig } from './search.config';
import {
  SearchQueryInput,
  SearchResult,
  SearchInfrastructureStatus,
  SearchEntityType,
} from './search.types';
import { SearchQuery } from './dto/search-query.dto';

/**
 * Phase 6B SearchService.
 *
 * Selects the active search provider (default: database; meilisearch when
 * SEARCH_PROVIDER=meilisearch and reachable). On a Meilisearch failure it
 * transparently falls back to the database provider so public search never
 * breaks. The public `search` signature is preserved for the controller and
 * web frontend.
 */
@Injectable()
export class SearchService {
  private readonly logger = new Logger(SearchService.name);
  private readonly config: SearchConfig;
  private readonly databaseProvider: DatabaseSearchProvider;
  private readonly meilisearchProvider: MeilisearchSearchProvider;

  constructor(
    prisma: PrismaService,
    private readonly searchIndexService: SearchIndexService,
  ) {
    this.config = loadSearchConfig();
    this.databaseProvider = new DatabaseSearchProvider(prisma);
    this.meilisearchProvider = new MeilisearchSearchProvider(
      prisma,
      this.config.meilisearch,
    );
  }

  async search(query: SearchQuery, userAgent?: string): Promise<SearchResult> {
    const provider = this.resolveProvider();
    const input: SearchQueryInput = {
      locale: query.locale,
      q: query.q,
      page: query.page,
      limit: query.limit,
      type: query.type,
    };

    try {
      const result = await provider.search(input, userAgent);
      // Reflect the provider that actually served the result. The frontend
      // reads `fallbackUsed` to show a gentle notice; `provider` is intentionally
      // not surfaced as a raw technical string to end users.
      result.meta.provider = provider.type;
      result.meta.fallbackUsed = false;
      return result;
    } catch (err) {
      // Transparent fallback: if Meilisearch is the active provider and fails,
      // return database results instead. The warning intentionally omits the
      // API key / secret.
      if (provider.type === 'meilisearch') {
        const message = err instanceof Error ? err.message : String(err);
        this.logger.warn(
          `Meilisearch search failed, falling back to database provider ` +
            `(index=${this.config.meilisearch.indexName}): ${message}`,
        );
        const result = await this.databaseProvider.search(input, userAgent);
        result.meta.provider = 'database';
        result.meta.fallbackUsed = true;
        return result;
      }
      throw err;
    }
  }

  private resolveProvider(): SearchProvider {
    if (this.config.provider === 'meilisearch' && this.meilisearchProvider.isAvailable()) {
      return this.meilisearchProvider;
    }
    return this.databaseProvider;
  }

  /** Real infrastructure status for the admin search infrastructure page. */
  async getInfrastructureStatus(): Promise<SearchInfrastructureStatus> {
    const usingMeili = this.config.provider === 'meilisearch';
    const meiliConfigured = this.meilisearchProvider.isAvailable();
    const meiliReachable = meiliConfigured
      ? await this.meilisearchProvider.isReachable()
      : false;

    const indexStatus = await this.searchIndexService.getIndexStatus();
    const indexReady = indexStatus.exists && indexStatus.settingsConfigured;

    const plannedEntities: SearchEntityType[] = [
      'emoji',
      'category',
      'topic',
      'article',
    ];

    return {
      currentProvider: this.config.provider,
      fallbackProvider: this.config.fallback,
      meilisearchConfigured: meiliConfigured,
      meilisearchEnabled: usingMeili && meiliReachable,
      meilisearchReachable: meiliReachable,
      indexName: this.config.meilisearch.indexName,
      indexReady,
      documentCount: indexStatus.documentCount,
      lastIndexedAt: null,
      plannedEntities,
      notes:
        'Phase 6B：Meilisearch 已接入。索引包含 emoji / category / topic / article 的 published 内容（单索引 ' +
        `${this.config.meilisearch.indexName}，locale 字段区分中英文）。` +
        '公开搜索在 SEARCH_PROVIDER=meilisearch 时走 Meilisearch，不可用时自动 fallback 到 database。' +
        'Asset 不纳入索引（避免版权 / 授权 / 重复内容风险）。',
    };
  }
}
