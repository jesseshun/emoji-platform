import { SearchProviderType } from './search.types';

export interface MeilisearchConfig {
  host: string;
  apiKey: string;
  indexPrefix: string;
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
 * Safety rules (Phase 6A):
 *   - SEARCH_PROVIDER defaults to `database`; Meilisearch is never required.
 *   - MEILISEARCH_* may be empty; empty values must NOT cause a startup failure.
 *   - No real secret is read or leaked; the API key is only used in Phase 6B.
 */
export function loadSearchConfig(): SearchConfig {
  const providerRaw = (process.env.SEARCH_PROVIDER || 'database').toLowerCase();
  const provider: SearchProviderType =
    providerRaw === 'meilisearch' ? 'meilisearch' : 'database';

  return {
    provider,
    fallback: 'database',
    meilisearch: {
      host: process.env.MEILISEARCH_HOST || '',
      // Accept either the Phase 6A placeholder name or the existing docker-compose key.
      apiKey: process.env.MEILISEARCH_API_KEY || process.env.MEILISEARCH_MASTER_KEY || '',
      indexPrefix: process.env.MEILISEARCH_INDEX_PREFIX || 'emoji_platform',
    },
  };
}
