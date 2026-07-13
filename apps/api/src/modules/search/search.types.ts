/**
 * Search module types.
 *
 * Phase 6A defines a provider abstraction so the current database search can be
 * kept as the default provider while a Meilisearch provider is planned for Phase 6B.
 *
 * Runtime types (used today):
 *   - SearchProviderType
 *   - SearchEntityType
 *   - SearchQueryInput
 *   - SearchResult / SearchResultItem
 *   - SearchInfrastructureStatus
 *
 * Planning types (Phase 6B, NOT used in Phase 6A runtime):
 *   - Planned*SearchDoc: intended Meilisearch document shape
 *   - SearchFieldWeight / SearchRankingStrategy: intended weighting & ranking
 */

export type SearchProviderType = 'database' | 'meilisearch';

/** Entities planned for the future external search index (Phase 6B). */
export type SearchEntityType = 'emoji' | 'category' | 'topic' | 'article';

/** Normalized search request consumed by a SearchProvider. */
export interface SearchQueryInput {
  locale: 'zh' | 'en';
  q: string;
  page: number;
  limit: number;
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

export interface SearchResultItem {
  id: string;
  emojiChar: string;
  slug: string;
  unicodeCodepoint: string | null;
  shortcode: string | null;
  category: SearchCategoryRef | null;
  translation: SearchTranslation | null;
}

export interface SearchResult {
  data: SearchResultItem[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

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
