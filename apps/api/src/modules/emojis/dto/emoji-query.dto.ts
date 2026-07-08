import { DEFAULT_PAGE, DEFAULT_LIMIT, MAX_LIMIT, DEFAULT_LOCALE, isLocale } from '@emoji-platform/types';
import { BadRequestException } from '@nestjs/common';

export interface EmojiListQuery {
  locale: 'zh' | 'en';
  page: number;
  limit: number;
  category?: string;
  q?: string;
}

export interface EmojiDetailQuery {
  locale: 'zh' | 'en';
}

function parseLocale(raw: string | undefined): 'zh' | 'en' {
  if (!raw) return DEFAULT_LOCALE;
  if (isLocale(raw)) return raw;
  throw new BadRequestException(`Invalid locale "${raw}". Supported: zh, en`);
}

export function parseEmojiListQuery(query: Record<string, string | undefined>): EmojiListQuery {
  const locale = parseLocale(query.locale);

  let page = parseInt(query.page ?? '', 10);
  let limit = parseInt(query.limit ?? '', 10);

  if (isNaN(page) || page < 1) page = DEFAULT_PAGE;
  if (isNaN(limit) || limit < 1) limit = DEFAULT_LIMIT;
  if (limit > MAX_LIMIT) limit = MAX_LIMIT;

  return {
    locale,
    page,
    limit,
    category: query.category || undefined,
    q: query.q?.trim() || undefined,
  };
}

export function parseEmojiDetailQuery(query: Record<string, string | undefined>): EmojiDetailQuery {
  return {
    locale: parseLocale(query.locale),
  };
}
