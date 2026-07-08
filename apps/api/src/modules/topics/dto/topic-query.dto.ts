import { DEFAULT_LOCALE, isLocale, DEFAULT_PAGE, DEFAULT_LIMIT, MAX_LIMIT } from '@emoji-platform/types';
import { BadRequestException } from '@nestjs/common';

export interface TopicListQuery {
  locale: 'zh' | 'en';
  page: number;
  limit: number;
}

export interface TopicDetailQuery {
  locale: 'zh' | 'en';
}

function parseLocale(raw: string | undefined): 'zh' | 'en' {
  if (!raw) return DEFAULT_LOCALE;
  if (isLocale(raw)) return raw;
  throw new BadRequestException(`Invalid locale "${raw}". Supported: zh, en`);
}

export function parseTopicListQuery(query: Record<string, string | undefined>): TopicListQuery {
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

export function parseTopicDetailQuery(query: Record<string, string | undefined>): TopicDetailQuery {
  return { locale: parseLocale(query.locale) };
}
