import { SearchProviderType } from './search.types';

export interface MeilisearchConfig {
  host: string;
  apiKey: string;
  indexPrefix: string;
  /** Unified index name: `${indexPrefix}_search` (e.g. `emoji_platform_search`). */
  indexName: string;
}

export interface SearchConfig {
  /** Active provider. Defaults to `database` and never connects to Meilisearch in Phase 6A. */
  provider: SearchProviderType;
  /** Provider used when the configured provider is unavailable. */
  fallback: SearchProviderType;
  meilisearch: MeilisearchConfig;
}

/**
 * Loads search configuration from environment variables.
 *
 * Safety rules:
 *   - SEARCH_PROVIDER defaults to `database`; Meilisearch is never required.
 *   - MEILISEARCH_* may be empty; empty values must NOT cause a startup failure.
 *   - No real secret is read or leaked; the API key is only used in Phase 6B.
 */
export function loadSearchConfig(): SearchConfig {
  const providerRaw = (process.env.SEARCH_PROVIDER || 'database').toLowerCase();
  const provider: SearchProviderType =
    providerRaw === 'meilisearch' ? 'meilisearch' : 'database';

  const indexPrefix = process.env.MEILISEARCH_INDEX_PREFIX || 'emoji_platform';

  return {
    provider,
    fallback: 'database',
    meilisearch: {
      host: process.env.MEILISEARCH_HOST || '',
      // Accept either the canonical Phase 6B name or the legacy docker-compose key.
      apiKey: process.env.MEILISEARCH_API_KEY || process.env.MEILISEARCH_MASTER_KEY || '',
      indexPrefix,
      indexName: `${indexPrefix}_search`,
    },
  };
}
