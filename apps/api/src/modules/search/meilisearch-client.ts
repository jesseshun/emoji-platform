import { MeiliSearch } from 'meilisearch';
import { MeilisearchConfig } from './search.config';

/**
 * Shared Meilisearch client helpers for the search module (Phase 6B).
 *
 * Centralizes the "configured" check and client construction so the provider
 * and the index service never diverge on how the host / api key are read.
 */

export function isMeiliConfigured(config: MeilisearchConfig): boolean {
  return Boolean(config.host) && Boolean(config.apiKey);
}

export function createMeiliClient(config: MeilisearchConfig): MeiliSearch {
  if (!isMeiliConfigured(config)) {
    throw new Error('Meilisearch is not configured (missing host or api key).');
  }
  return new MeiliSearch({ host: config.host, apiKey: config.apiKey });
}
