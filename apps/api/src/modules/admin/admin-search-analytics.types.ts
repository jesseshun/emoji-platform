/**
 * Search Analytics types (Phase 6E).
 *
 * All responses are read-only aggregations over `search_logs` / `copy_events`
 * plus a live Meilisearch provider-health snapshot. None of these types ever
 * carry a plaintext IP, passwordHash, JWT_SECRET, or the Meilisearch API key.
 *
 * Rule-based tuning suggestions are computed in code (no AI, no ML, no content
 * auto-generation) from the aggregated metrics.
 */

export type SearchProviderType = 'database' | 'meilisearch';

/** A single search-log aggregation grouped by (query, locale). */
export interface SearchAnalyticsQueryItem {
  query: string | null;
  locale: string | null;
  count: number;
  avgResultCount: number | null;
  zeroResultCount: number;
  lastSearchedAt: string | null;
}

/** A single zero-result search aggregation grouped by (query, locale). */
export interface SearchAnalyticsNoResultItem {
  query: string | null;
  locale: string | null;
  count: number;
  lastSearchedAt: string | null;
  suggestedAction: string;
}

/** One rule-based tuning suggestion (never AI-generated). */
export interface TuningSuggestion {
  priority: 'high' | 'medium' | 'low';
  category: string;
  title: string;
  detail: string;
  suggestedAction: string;
}

/**
 * Live provider-health snapshot. Mirrors the admin search infrastructure
 * status but trimmed to the analytics view. `lastIndexedAt` is null because
 * the index last-run time is not persisted; `documentCount` / `indexReady`
 * are the source of truth.
 */
export interface SearchAnalyticsProviderHealth {
  currentProvider: SearchProviderType;
  fallbackProvider: SearchProviderType;
  meilisearchConfigured: boolean;
  meilisearchReachable: boolean;
  indexReady: boolean;
  documentCount: number;
  lastIndexedAt: string | null;
  fallbackRecommended: boolean;
  notes: string[];
}

/** Locale breakdown shape shared by overview + summary responses. */
export interface SearchesByLocale {
  zh: number;
  en: number;
  other: number;
}

/**
 * `searchesByProvider` is reported as unsupported because `search_logs` does
 * not record which provider served each request (the public search path
 * transparently falls back from Meilisearch to database). The current active
 * provider is available via provider-health instead.
 */
export type SearchesByProvider =
  | { supported: true; database: number; meilisearch: number }
  | { supported: false; note: string };

/**
 * `topCopiedAfterSearch` is reported as unsupported: there is no shared
 * session / click linkage between a search result row and a subsequent copy
 * event, so a reliable "copy after search" correlation cannot be computed.
 * Raw copy analytics remain available under the copy-events endpoints.
 */
export type TopCopiedAfterSearch =
  | { supported: true; emojis: TopCopiedEmoji[] }
  | { supported: false; note: string };

export interface TopCopiedEmoji {
  emojiId: string;
  emojiChar: string | null;
  emojiSlug: string | null;
  count: number;
}

/** Full analytics overview returned by GET /admin/search/analytics/overview. */
export interface SearchAnalyticsOverview {
  totalSearches: number;
  todaySearches: number;
  zeroResultSearches: number;
  zeroResultRate: number;
  searchesByLocale: SearchesByLocale;
  searchesByProvider: SearchesByProvider;
  topQueries: { query: string; count: number }[];
  topZeroResultQueries: { query: string; count: number }[];
  topCopiedAfterSearch: TopCopiedAfterSearch;
  recentSearches: {
    id: string;
    query: string | null;
    locale: string | null;
    resultCount: number | null;
    country: string | null;
    createdAt: string;
  }[];
  tuningSuggestions: TuningSuggestion[];
  providerStatus: SearchAnalyticsProviderHealth;
}

/** Result of a conservative tuning-settings apply (POST .../tuning/apply-settings). */
export interface SearchTuningApplyResult {
  available: boolean;
  applied: boolean;
  message: string;
  indexName?: string;
  searchableAttributes?: string[];
  filterableAttributes?: string[];
  sortableAttributes?: string[];
  rankingRules?: string[];
  finishedAt?: string;
}

/** Query parameters for GET /admin/search/analytics/queries. */
export interface SearchAnalyticsQueryParams {
  page: number;
  limit: number;
  q?: string;
  locale: 'zh' | 'en' | 'all';
  hasResults?: 'true' | 'false';
  dateFrom?: string;
  dateTo?: string;
}

/** Query parameters for GET /admin/search/analytics/no-results. */
export interface SearchAnalyticsNoResultParams {
  page: number;
  limit: number;
  locale: 'zh' | 'en' | 'all';
  dateFrom?: string;
  dateTo?: string;
}
