import { SearchProviderType, SearchQueryInput, SearchResult } from './search.types';

/**
 * Common contract for all search providers.
 *
 * - `database`: current default, searches Postgres directly (Phase 6A).
 * - `meilisearch`: planned for Phase 6B, implemented only as a stub in Phase 6A.
 */
export interface SearchProvider {
  /** Stable identifier used by SearchService for selection and status reporting. */
  readonly type: SearchProviderType;

  /**
   * Execute a search for the given query.
   * Must preserve the existing public search response shape (emoji results).
   */
  search(query: SearchQueryInput, userAgent?: string): Promise<SearchResult>;
}
