import { BadRequestException } from '@nestjs/common';
import { DEFAULT_PAGE, DEFAULT_LIMIT, MAX_LIMIT } from '@emoji-platform/types';
import { SeoEntityType, parseSeoEntityType } from './admin-seo-query.dto';

export type SeoSeverity = 'issue' | 'warning';

export type SeoIssueType =
  | 'missingSeoTitle'
  | 'missingSeoDescription'
  | 'titleTooShort'
  | 'titleTooLong'
  | 'descriptionTooShort'
  | 'descriptionTooLong'
  | 'missingCanonicalPreview'
  | 'missingHreflangPreview'
  | 'missingJsonLd'
  | 'sitemapMismatch'
  | 'noInternalLinks';

export const SEO_ISSUE_TYPES: SeoIssueType[] = [
  'missingSeoTitle',
  'missingSeoDescription',
  'titleTooShort',
  'titleTooLong',
  'descriptionTooShort',
  'descriptionTooLong',
  'missingCanonicalPreview',
  'missingHreflangPreview',
  'missingJsonLd',
  'sitemapMismatch',
  'noInternalLinks',
];

export const SEO_SEVERITIES: SeoSeverity[] = ['issue', 'warning'];

export interface SeoQualityIssuesQuery {
  page: number;
  limit: number;
  entityType: SeoEntityType | 'all';
  issueType: SeoIssueType | 'all';
  severity: SeoSeverity | 'all';
  locale: 'zh' | 'en' | 'all';
  q?: string;
}

export function isSeoIssueType(value: unknown): value is SeoIssueType {
  return typeof value === 'string' && SEO_ISSUE_TYPES.includes(value as SeoIssueType);
}

export function isSeoSeverity(value: unknown): value is SeoSeverity {
  return typeof value === 'string' && SEO_SEVERITIES.includes(value as SeoSeverity);
}

export function parseSeoQualityIssuesQuery(
  query: Record<string, string | undefined>,
): SeoQualityIssuesQuery {
  const entityTypeRaw = query.entityType ?? 'all';
  let entityType: SeoEntityType | 'all' = 'all';
  if (entityTypeRaw && entityTypeRaw !== 'all') {
    entityType = parseSeoEntityType(entityTypeRaw);
  }

  const issueTypeRaw = query.issueType ?? 'all';
  let issueType: SeoIssueType | 'all' = 'all';
  if (issueTypeRaw && issueTypeRaw !== 'all') {
    if (!isSeoIssueType(issueTypeRaw)) {
      throw new BadRequestException(
        `无效的 issueType "${issueTypeRaw}"。支持：${SEO_ISSUE_TYPES.join(', ')}, all`,
      );
    }
    issueType = issueTypeRaw;
  }

  const severityRaw = query.severity ?? 'all';
  let severity: SeoSeverity | 'all' = 'all';
  if (severityRaw && severityRaw !== 'all') {
    if (!isSeoSeverity(severityRaw)) {
      throw new BadRequestException(`无效的 severity "${severityRaw}"。支持：issue, warning, all`);
    }
    severity = severityRaw;
  }

  const localeRaw = query.locale ?? 'all';
  let locale: 'zh' | 'en' | 'all' = 'all';
  if (localeRaw && localeRaw !== 'all') {
    if (localeRaw !== 'zh' && localeRaw !== 'en') {
      throw new BadRequestException(`无效的 locale "${localeRaw}"。支持：zh, en, all`);
    }
    locale = localeRaw;
  }

  let page = parseInt(query.page ?? '', 10);
  let limit = parseInt(query.limit ?? '', 10);
  if (isNaN(page) || page < 1) page = DEFAULT_PAGE;
  if (isNaN(limit) || limit < 1) limit = DEFAULT_LIMIT;
  if (limit > MAX_LIMIT) limit = MAX_LIMIT;

  return {
    page,
    limit,
    entityType,
    issueType,
    severity,
    locale,
    q: query.q?.trim() || undefined,
  };
}
