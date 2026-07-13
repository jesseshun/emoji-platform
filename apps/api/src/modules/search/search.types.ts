/**
 * Search module types.
 *
 * Phase 6A defines a provider abstraction so the current database search can be
 * kept as the default provider while a Meilisearch provider is planned for Phase 6B.
 *
 * Phase 6B integrates a real Meilisearch provider with a transparent database
 * fallback, preserving the public search contract.
 *
 * Phase 6C extends the public search with typed results (emoji / category /
 * topic / article), a `type` filter, safe client-side highlighting support, and
 * provider / fallback metadata. No Prisma schema change is required.
 *
 * Runtime types (used today):
 *   - SearchProviderType
 *   - SearchResultType / SearchTypeFilter
 *   - SearchQueryInput
 *   - UnifiedSearchResultItem (discriminated union by `type`)
 *   - SearchResult / SearchResultTotals
 *   - SearchInfrastructureStatus
 *
 * Planning types (Phase 6B, NOT used in Phase 6A runtime):
 *   - Planned*SearchDoc: intended Meilisearch document shape
 *   - SearchFieldWeight / SearchRankingStrategy: intended weighting & ranking
 */

export type SearchProviderType = 'database' | 'meilisearch';

/** Entity types that can appear in public search results (Phase 6C). */
export type SearchResultType = 'emoji' | 'category' | 'topic' | 'article';

/** Entity types that can be indexed / rebuilt by the search engine (Phase 6B). */
export type SearchEntityType = 'emoji' | 'category' | 'topic' | 'article';

/** Public type filter accepted by ?type=. `all` returns every type. */
export type SearchTypeFilter = 'all' | SearchResultType;

export const SEARCH_TYPE_FILTERS: SearchTypeFilter[] = [
  'all',
  'emoji',
  'category',
  'topic',
  'article',
];

/** Normalized search request consumed by a SearchProvider. */
export interface SearchQueryInput {
  locale: 'zh' | 'en';
  q: string;
  page: number;
  limit: number;
  /** Restricts results to a single entity type, or `all` for everything. */
  type: SearchTypeFilter;
}

export interface SearchCategoryRef {
  id: string;
  slug: string;
  name: string | null;
}

export interface SearchTranslation {
  name: string | null;
  shortName: string | null;
  oneLineMeaning: string | null;
  keywords: unknown;
}

/* ───────────────────────────────────────────────────────────────────────────
 * Unified search result items (Phase 6C).
 *
 * Every result carries a `type` discriminator so the frontend can render the
 * correct card and link to the correct public route. No admin / draft /
 * archived / Asset content is ever returned.
 * ─────────────────────────────────────────────────────────────────────────── */

export interface EmojiSearchResult {
  type: 'emoji';
  id: string;
  emojiChar: string;
  slug: string;
  unicodeCodepoint: string | null;
  shortcode: string | null;
  category: SearchCategoryRef | null;
  translation: SearchTranslation | null;
}

export interface CategorySearchResult {
  type: 'category';
  id: string;
  slug: string;
  iconEmoji: string | null;
  emojiCount: number;
  name: string | null;
  description: string | null;
}

export interface TopicSearchResult {
  type: 'topic';
  id: string;
  slug: string;
  coverImage: string | null;
  topicType: string | null;
  title: string | null;
  summary: string | null;
}

export interface ArticleSearchResult {
  type: 'article';
  id: string;
  slug: string;
  coverImage: string | null;
  publishedAt: string | null;
  title: string | null;
  summary: string | null;
}

export type UnifiedSearchResultItem =
  | EmojiSearchResult
  | CategorySearchResult
  | TopicSearchResult
  | ArticleSearchResult;

export interface SearchResultTotals {
  emoji: number;
  category: number;
  topic: number;
  article: number;
}

export interface SearchResult {
  data: UnifiedSearchResultItem[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    /** Provider that actually served the result (`database` when fell back). */
    provider: SearchProviderType;
    /** True when the configured provider failed and we fell back to database. */
    fallbackUsed: boolean;
    /** Per-type result counts (ignores the active type filter). */
    totalByType: SearchResultTotals;
    /** Active type filter echoed back. */
    type: SearchTypeFilter;
    /** The original (trimmed) query string. */
    query: string;
  };
}

/** Backwards-compatible emoji-shaped result (kept for external typings). */
export interface SearchResultItem extends EmojiSearchResult {}

/** Read-only status reported by GET /api/v1/admin/search/infrastructure/status. */
export interface SearchInfrastructureStatus {
  currentProvider: SearchProviderType;
  fallbackProvider: SearchProviderType;
  meilisearchConfigured: boolean;
  meilisearchEnabled: boolean;
  meilisearchReachable: boolean;
  indexName: string;
  indexReady: boolean;
  documentCount: number;
  lastIndexedAt: string | null;
  plannedEntities: SearchEntityType[];
  notes: string;
}

/** Read-only index status reported by GET /api/v1/admin/search/index/status. */
export interface SearchIndexStatus {
  indexName: string;
  exists: boolean;
  documentCount: number;
  settingsConfigured: boolean;
  searchableAttributes: string[];
  filterableAttributes: string[];
  sortableAttributes: string[];
  lastCheckedAt: string;
}

/** Entity-level statistics returned by a rebuild operation. */
export interface SearchIndexRebuildEntityResult {
  type: SearchEntityType;
  indexed: number;
  skipped: number;
}

/** Result returned by POST /api/v1/admin/search/index/rebuild. */
export interface SearchIndexRebuildResult {
  entityType: 'all' | SearchEntityType;
  provider: SearchProviderType;
  indexName: string;
  totalIndexed: number;
  perEntity: SearchIndexRebuildEntityResult[];
  durationMs: number;
  finishedAt: string;
}

/** Result returned by POST /api/v1/admin/search/index/settings. */
export interface SearchIndexSettingsResult {
  indexName: string;
  applied: boolean;
  searchableAttributes: string[];
  filterableAttributes: string[];
  sortableAttributes: string[];
  rankingRules: string[];
  finishedAt: string;
}

/* ───────────────────────────────────────────────────────────────────────────
 * Phase 6B planning types (documentation only — no runtime use in Phase 6A).
 * ─────────────────────────────────────────────────────────────────────────── */

export interface PlannedEmojiSearchDoc {
  id: string;
  type: 'emoji';
  locale: 'zh' | 'en';
  emojiChar: string;
  slug: string;
  unicodeCodepoint: string;
  shortcode: string;
  name: string;
  aliases: string[];
  keywords: string[];
  categoryIds: string[];
  categoryNames: string[];
  topicIds: string[];
  topicTitles: string[];
  status: 'published' | 'draft' | 'archived';
  updatedAt: string;
  publicUrl: string;
}

export interface PlannedCategorySearchDoc {
  id: string;
  type: 'category';
  locale: 'zh' | 'en';
  slug: string;
  name: string;
  description: string;
  parentId: string | null;
  status: 'published' | 'draft' | 'archived';
  updatedAt: string;
  publicUrl: string;
}

export interface PlannedTopicSearchDoc {
  id: string;
  type: 'topic';
  locale: 'zh' | 'en';
  slug: string;
  title: string;
  description: string;
  keywords: string[];
  emojiIds: string[];
  status: 'published' | 'draft' | 'archived';
  updatedAt: string;
  publicUrl: string;
}

export interface PlannedArticleSearchDoc {
  id: string;
  type: 'article';
  locale: 'zh' | 'en';
  slug: string;
  title: string;
  summary: string;
  keywords: string[];
  status: 'published' | 'draft' | 'archived';
  publishedAt: string | null;
  updatedAt: string;
  publicUrl: string;
}

/** Relative field weight used to design the Phase 6B ranking formula. */
export interface SearchFieldWeight {
  field: string;
  weight: number;
}

/**
 * Intended ranking strategy for Phase 6B. Phase 6A does NOT implement scoring;
 * the current database provider keeps simple ordering. This documents priority.
 */
export interface SearchRankingStrategy {
  /** 1-5: exact-match fields win first. */
  exactMatchFields: string[];
  /** 6: prefix match on name / title. */
  prefixMatchFields: string[];
  /** 7: keyword / alias overlap. */
  keywordMatchFields: string[];
  /** 8: category / topic relevance. */
  relevanceFields: string[];
  /** 9: copy / search volume (Phase 6E tuning signal, not used in 6A). */
  popularityFields: string[];
  /** 10: lightweight tie-breakers. */
  tieBreakers: string[];
}
