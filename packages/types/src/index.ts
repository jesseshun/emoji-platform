export type Locale = 'zh' | 'en';

// ─── API Response ──────────────────────────────────────

export interface ApiResponse<T = unknown> {
  success: boolean;
  data: T;
  message?: string;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  meta: PaginationMeta;
}

// ─── Error ─────────────────────────────────────────────

export interface ErrorBody {
  success: false;
  error: {
    code: string;
    message: string;
  };
}

// ─── Health ────────────────────────────────────────────

export interface HealthStatus {
  status: string;
  service: string;
}

export interface StatusInfo extends HealthStatus {
  phase: string;
  database?: string;
}

// ─── Locale ────────────────────────────────────────────

export const SUPPORTED_LOCALES = ['zh', 'en'] as const;
export const DEFAULT_LOCALE: Locale = 'en';

export function isLocale(value: string): value is Locale {
  return (SUPPORTED_LOCALES as readonly string[]).includes(value);
}

// ─── Pagination ────────────────────────────────────────

export const DEFAULT_PAGE = 1;
export const DEFAULT_LIMIT = 30;
export const MAX_LIMIT = 100;

export function parsePagination(rawPage?: string, rawLimit?: string): { page: number; limit: number } {
  let page = parseInt(rawPage ?? '', 10);
  let limit = parseInt(rawLimit ?? '', 10);

  if (isNaN(page) || page < 1) page = DEFAULT_PAGE;
  if (isNaN(limit) || limit < 1) limit = DEFAULT_LIMIT;
  if (limit > MAX_LIMIT) limit = MAX_LIMIT;

  return { page, limit };
}

export function buildPaginationMeta(page: number, limit: number, total: number): PaginationMeta {
  return {
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit),
  };
}
