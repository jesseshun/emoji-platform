import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { SearchProvider } from './search-provider.interface';
import { DatabaseSearchProvider } from './database-search.provider';
import { MeilisearchSearchProvider } from './meilisearch-search.provider';
import { loadSearchConfig, SearchConfig } from './search.config';
import {
  SearchQueryInput,
  SearchResult,
  SearchInfrastructureStatus,
  SearchEntityType,
} from './search.types';
import { SearchQuery } from './dto/search-query.dto';

/**
 * Phase 6A SearchService.
 *
 * Selects the active search provider (default: database) and exposes a
 * read-only infrastructure status for the admin panel. The public `search`
 * signature is preserved so the existing controller and web frontend are
 * unaffected.
 */
@Injectable()
export class SearchService {
  private readonly logger = new Logger(SearchService.name);
  private readonly config: SearchConfig;
  private readonly databaseProvider: DatabaseSearchProvider;
  private readonly meilisearchProvider: MeilisearchSearchProvider;

  constructor(prisma: PrismaService) {
    this.config = loadSearchConfig();
    this.databaseProvider = new DatabaseSearchProvider(prisma);
    this.meilisearchProvider = new MeilisearchSearchProvider();
  }

  async search(query: SearchQuery, userAgent?: string): Promise<SearchResult> {
    const provider = this.resolveProvider();
    const input: SearchQueryInput = {
      locale: query.locale,
      q: query.q,
      page: query.page,
      limit: query.limit,
    };
    return provider.search(input, userAgent);
  }

  /**
   * Resolves the provider to use. In Phase 6A the Meilisearch provider is a
   * non-available stub, so any `meilisearch` configuration safely falls back
   * to the database provider.
   */
  private resolveProvider(): SearchProvider {
    if (this.config.provider === 'meilisearch') {
      if (this.meilisearchProvider.isAvailable()) {
        return this.meilisearchProvider;
      }
      this.logger.warn(
        'SEARCH_PROVIDER=meilisearch but Meilisearch is unavailable in Phase 6A; falling back to database provider',
      );
      return this.databaseProvider;
    }
    return this.databaseProvider;
  }

  /** Read-only infrastructure status for the admin search infrastructure page. */
  getInfrastructureStatus(): SearchInfrastructureStatus {
    const usingMeili = this.config.provider === 'meilisearch';
    const meiliConfigured =
      usingMeili &&
      Boolean(this.config.meilisearch.host) &&
      Boolean(this.config.meilisearch.apiKey);

    const indexEntitiesPlanned: SearchEntityType[] = [
      'emoji',
      'category',
      'topic',
      'article',
    ];

    return {
      currentProvider: this.config.provider,
      fallbackProvider: this.config.fallback,
      meilisearchConfigured: meiliConfigured,
      meilisearchEnabled: false,
      indexEntitiesPlanned,
      indexReady: false,
      lastIndexedAt: null,
      notes:
        'Phase 6A：搜索基础设施规划已就绪。当前使用 database provider 保留现有数据库搜索行为；' +
        'Meilisearch 计划在 Phase 6B 接入，本阶段未启用、未创建真实索引。' +
        'Asset 暂不纳入索引（避免版权 / 授权 / 重复内容风险）。',
    };
  }
}
