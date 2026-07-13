import { SearchProviderType, SearchQueryInput, SearchResult } from './search.types';

/**
 * Common contract for all search providers.
 *
 * - `database`: default provider, searches Postgres directly (Phase 6A+).
 * - `meilisearch`: real provider integrated in Phase 6B, with transparent
 *   database fallback handled by SearchService.
 *
 * Both providers return the same unified `SearchResult` shape (emoji /
 * category / topic / article items, plus provider / fallback metadata).
 */
export interface SearchProvider {
  /** Stable identifier used by SearchService for selection and status reporting. */
  readonly type: SearchProviderType;

  /**
   * Execute a search for the given query.
   * Must return the unified typed `SearchResult` shape and, on failure, throw a
   * recognizable error so SearchService can fall back to the database provider.
   */
  search(query: SearchQueryInput, userAgent?: string): Promise<SearchResult>;
}
