/* eslint-disable @typescript-eslint/no-explicit-any */
import { Injectable, Logger } from '@nestjs/common';
import { SearchProvider } from './search-provider.interface';
import { SearchQueryInput, SearchResult } from './search.types';

/**
 * Phase 6A stub for the planned Meilisearch provider (target: Phase 6B).
 *
 * Deliberately NOT implemented in Phase 6A:
 *   - no Meilisearch SDK is installed
 *   - no real index is created
 *   - no connection to a Meilisearch instance is made
 *
 * `isAvailable()` is always false so SearchService safely falls back to the
 * database provider. `search()` is never invoked in Phase 6A.
 */
@Injectable()
export class MeilisearchSearchProvider implements SearchProvider {
  readonly type = 'meilisearch' as const;
  private readonly logger = new Logger(MeilisearchSearchProvider.name);

  isAvailable(): boolean {
    return false;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async search(_query: SearchQueryInput, _userAgent?: string): Promise<SearchResult> {
    throw new Error(
      'Meilisearch provider is not implemented in Phase 6A. Falling back to the database provider.',
    );
  }
}
