import { parsePagination } from '@emoji-platform/types';
import type {
  SearchAnalyticsQueryParams,
  SearchAnalyticsNoResultParams,
} from './admin-search-analytics.types';

type RawQuery = Record<string, string | undefined>;

function parseLocale(value: string | undefined | null): 'zh' | 'en' | 'all' {
  if (value === 'zh' || value === 'en') return value;
  return 'all';
}

function parseDate(value: string | undefined | null): string | undefined {
  if (!value) return undefined;
  const trimmed = value.trim();
  if (!trimmed) return undefined;
  // Accept ISO date/datetime strings only; Prisma validates further.
  if (
    !/^\d{4}-\d{2}-\d{2}([T\s]\d{2}:\d{2}(:\d{2})?(\.\d+)?(Z|[+-]\d{2}:?\d{2})?)?$/.test(
      trimmed,
    )
  ) {
    return undefined;
  }
  return trimmed;
}

function parseHasResults(
  value: string | undefined | null,
): 'true' | 'false' | undefined {
  if (value === 'true' || value === 'false') return value;
  return undefined;
}

export function parseSearchAnalyticsQuery(raw: RawQuery): SearchAnalyticsQueryParams {
  const { page, limit } = parsePagination(raw.page, raw.limit);
  return {
    page,
    limit,
    q: raw.q && raw.q.trim() ? raw.q.trim() : undefined,
    locale: parseLocale(raw.locale),
    hasResults: parseHasResults(raw.hasResults),
    dateFrom: parseDate(raw.dateFrom),
    dateTo: parseDate(raw.dateTo),
  };
}

export function parseSearchAnalyticsNoResult(
  raw: RawQuery,
): SearchAnalyticsNoResultParams {
  const { page, limit } = parsePagination(raw.page, raw.limit);
  return {
    page,
    limit,
    locale: parseLocale(raw.locale),
    dateFrom: parseDate(raw.dateFrom),
    dateTo: parseDate(raw.dateTo),
  };
}
