import { parsePagination } from '@emoji-platform/types';

export type LogLocaleFilter = 'zh' | 'en' | 'all';

export interface SearchLogsQuery {
  page: number;
  limit: number;
  q?: string;
  locale: LogLocaleFilter;
  dateFrom?: string;
  dateTo?: string;
  minResultCount?: number;
  maxResultCount?: number;
}

export interface CopyEventsQuery {
  page: number;
  limit: number;
  locale: LogLocaleFilter;
  emojiId?: string;
  dateFrom?: string;
  dateTo?: string;
}

function parseLocale(value: string | undefined | null): LogLocaleFilter {
  if (value === 'zh' || value === 'en') return value;
  return 'all';
}

function parseDate(value: string | undefined | null): string | undefined {
  if (!value) return undefined;
  // Accept ISO date/datetime strings; Prisma will validate further.
  const trimmed = value.trim();
  if (!trimmed) return undefined;
  // Basic sanity: must look like a date/time.
  if (!/^\d{4}-\d{2}-\d{2}([T\s]\d{2}:\d{2}(:\d{2})?(\.\d+)?(Z|[+-]\d{2}:?\d{2})?)?$/.test(trimmed)) {
    return undefined;
  }
  return trimmed;
}

function parseOptionalInt(value: string | undefined | null): number | undefined {
  if (value === undefined || value === null || value.trim() === '') return undefined;
  const n = Number(value);
  if (!Number.isFinite(n)) return undefined;
  return Math.trunc(n);
}

export function parseSearchLogsQuery(query: Record<string, string | undefined>): SearchLogsQuery {
  const { page, limit } = parsePagination(query.page, query.limit);
  return {
    page,
    limit,
    q: query.q && query.q.trim() ? query.q.trim() : undefined,
    locale: parseLocale(query.locale),
    dateFrom: parseDate(query.dateFrom),
    dateTo: parseDate(query.dateTo),
    minResultCount: parseOptionalInt(query.minResultCount),
    maxResultCount: parseOptionalInt(query.maxResultCount),
  };
}

export function parseCopyEventsQuery(query: Record<string, string | undefined>): CopyEventsQuery {
  const { page, limit } = parsePagination(query.page, query.limit);
  return {
    page,
    limit,
    locale: parseLocale(query.locale),
    emojiId: query.emojiId && query.emojiId.trim() ? query.emojiId.trim() : undefined,
    dateFrom: parseDate(query.dateFrom),
    dateTo: parseDate(query.dateTo),
  };
}
