import { DEFAULT_LOCALE, isLocale, DEFAULT_PAGE, DEFAULT_LIMIT, MAX_LIMIT } from '@emoji-platform/types';
import { SEARCH_TYPE_FILTERS, SearchTypeFilter } from '../search.types';

export interface SearchQuery {
  locale: 'zh' | 'en';
  q: string;
  page: number;
  limit: number;
  /** Restricts results to a single entity type, or `all` for everything. */
  type: SearchTypeFilter;
}

/**
 * Locale parsing (Phase 6C).
 *
 * An invalid / missing `locale` falls back to the default locale instead of
 * returning 400. A hand-edited URL should never break the public search page;
 * the web app always sends a valid locale. Documented in README.
 */
function parseLocale(raw: string | undefined): 'zh' | 'en' {
  if (!raw) return DEFAULT_LOCALE;
  if (isLocale(raw)) return raw;
  return DEFAULT_LOCALE;
}

/**
 * Type filter parsing (Phase 6C).
 *
 * An invalid / unknown `type` falls back to `all` (show every entity type)
 * instead of 400, so a malformed URL still returns useful results. Documented
 * in README.
 */
function parseType(raw: string | undefined): SearchTypeFilter {
  if (!raw) return 'all';
  const normalized = raw.toLowerCase();
  return (SEARCH_TYPE_FILTERS as string[]).includes(normalized)
    ? (normalized as SearchTypeFilter)
    : 'all';
}

export function parseSearchQuery(query: Record<string, string | undefined>): SearchQuery {
  let page = parseInt(query.page ?? '', 10);
  let limit = parseInt(query.limit ?? '', 10);

  if (isNaN(page) || page < 1) page = DEFAULT_PAGE;
  if (isNaN(limit) || limit < 1) limit = DEFAULT_LIMIT;
  if (limit > MAX_LIMIT) limit = MAX_LIMIT;

  return {
    locale: parseLocale(query.locale),
    q: query.q?.trim() ?? '',
    page,
    limit,
    type: parseType(query.type),
  };
}
