import { BadRequestException } from '@nestjs/common';
import { DEFAULT_PAGE, DEFAULT_LIMIT, MAX_LIMIT } from '@emoji-platform/types';

export type SeoEntityType = 'emoji' | 'category' | 'topic' | 'article';
export type SeoCompleteness =
  | 'all'
  | 'missingTitle'
  | 'missingDescription'
  | 'missingAny'
  | 'complete';
export type SeoLocaleFilter = 'zh' | 'en' | 'all';

export const SEO_ENTITY_TYPES: SeoEntityType[] = [
  'emoji',
  'category',
  'topic',
  'article',
];

export const SEO_COMPLETENESS_VALUES: SeoCompleteness[] = [
  'all',
  'missingTitle',
  'missingDescription',
  'missingAny',
  'complete',
];

export const SEO_STATUS_VALUES = ['draft', 'published', 'archived'] as const;

export interface AdminSeoListQuery {
  entityType: SeoEntityType;
  page: number;
  limit: number;
  q?: string;
  locale: SeoLocaleFilter;
  status: string | 'all';
  completeness: SeoCompleteness;
}

export function isSeoEntityType(value: unknown): value is SeoEntityType {
  return typeof value === 'string' && SEO_ENTITY_TYPES.includes(value as SeoEntityType);
}

export function parseSeoEntityType(value: unknown): SeoEntityType {
  if (!isSeoEntityType(value)) {
    throw new BadRequestException(
      `无效的 entityType "${String(value)}"。支持：emoji, category, topic, article`,
    );
  }
  return value;
}

export function parseAdminSeoListQuery(
  query: Record<string, string | undefined>,
): AdminSeoListQuery {
  const entityType = parseSeoEntityType(query.entityType);

  let page = parseInt(query.page ?? '', 10);
  let limit = parseInt(query.limit ?? '', 10);
  if (isNaN(page) || page < 1) page = DEFAULT_PAGE;
  if (isNaN(limit) || limit < 1) limit = DEFAULT_LIMIT;
  if (limit > MAX_LIMIT) limit = MAX_LIMIT;

  const localeRaw = query.locale ?? 'all';
  let locale: SeoLocaleFilter = 'all';
  if (localeRaw && localeRaw !== 'all') {
    if (localeRaw !== 'zh' && localeRaw !== 'en') {
      throw new BadRequestException(`无效的 locale "${localeRaw}"。支持：zh, en, all`);
    }
    locale = localeRaw;
  }

  const statusRaw = query.status ?? 'all';
  let status: string | 'all' = 'all';
  if (statusRaw && statusRaw !== 'all') {
    if (!(SEO_STATUS_VALUES as readonly string[]).includes(statusRaw)) {
      throw new BadRequestException(
        `无效的 status "${statusRaw}"。支持：draft, published, archived, all`,
      );
    }
    status = statusRaw;
  }

  const completenessRaw = query.completeness ?? 'all';
  let completeness: SeoCompleteness = 'all';
  if (completenessRaw && completenessRaw !== 'all') {
    if (!SEO_COMPLETENESS_VALUES.includes(completenessRaw as SeoCompleteness)) {
      throw new BadRequestException(
        `无效的 completeness "${completenessRaw}"。支持：all, missingTitle, missingDescription, missingAny, complete`,
      );
    }
    completeness = completenessRaw as SeoCompleteness;
  }

  return {
    entityType,
    page,
    limit,
    q: query.q?.trim() || undefined,
    locale,
    status,
    completeness,
  };
}
