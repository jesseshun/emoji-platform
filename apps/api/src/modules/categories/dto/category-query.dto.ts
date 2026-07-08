import { DEFAULT_LOCALE, isLocale, DEFAULT_PAGE, DEFAULT_LIMIT, MAX_LIMIT } from '@emoji-platform/types';
import { BadRequestException } from '@nestjs/common';

export interface CategoryListQuery {
  locale: 'zh' | 'en';
}

export interface CategoryDetailQuery {
  locale: 'zh' | 'en';
  page: number;
  limit: number;
}

function parseLocale(raw: string | undefined): 'zh' | 'en' {
  if (!raw) return DEFAULT_LOCALE;
  if (isLocale(raw)) return raw;
  throw new BadRequestException(`Invalid locale "${raw}". Supported: zh, en`);
}

export function parseCategoryListQuery(query: Record<string, string | undefined>): CategoryListQuery {
  return { locale: parseLocale(query.locale) };
}

export function parseCategoryDetailQuery(query: Record<string, string | undefined>): CategoryDetailQuery {
  let page = parseInt(query.page ?? '', 10);
  let limit = parseInt(query.limit ?? '', 10);

  if (isNaN(page) || page < 1) page = DEFAULT_PAGE;
  if (isNaN(limit) || limit < 1) limit = DEFAULT_LIMIT;
  if (limit > MAX_LIMIT) limit = MAX_LIMIT;

  return {
    locale: parseLocale(query.locale),
    page,
    limit,
  };
}
