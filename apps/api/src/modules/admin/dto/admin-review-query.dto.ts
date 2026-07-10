import { parsePagination } from '@emoji-platform/types';

export type ReviewStatusFilter = 'pending' | 'approved' | 'rejected' | 'spam' | 'all';
export type SubmissionTypeFilter =
  | 'new_usage'
  | 'example'
  | 'correction'
  | 'culture_note'
  | 'translation_suggestion'
  | 'all';
export type ReviewLocaleFilter = 'zh' | 'en' | 'all';

export interface ReviewQuery {
  page: number;
  limit: number;
  status: ReviewStatusFilter;
  type: SubmissionTypeFilter;
  locale: ReviewLocaleFilter;
  q?: string;
  emojiId?: string;
}

function parseStatus(value: string | undefined | null): ReviewStatusFilter {
  const allowed: ReviewStatusFilter[] = ['pending', 'approved', 'rejected', 'spam'];
  return (allowed as string[]).includes(value ?? '') ? (value as ReviewStatusFilter) : 'all';
}

function parseType(value: string | undefined | null): SubmissionTypeFilter {
  const allowed: SubmissionTypeFilter[] = [
    'new_usage',
    'example',
    'correction',
    'culture_note',
    'translation_suggestion',
  ];
  return (allowed as string[]).includes(value ?? '') ? (value as SubmissionTypeFilter) : 'all';
}

function parseLocale(value: string | undefined | null): ReviewLocaleFilter {
  if (value === 'zh' || value === 'en') return value;
  return 'all';
}

export function parseReviewQuery(query: Record<string, string | undefined>): ReviewQuery {
  const { page, limit } = parsePagination(query.page, query.limit);
  return {
    page,
    limit,
    status: parseStatus(query.status),
    type: parseType(query.type),
    locale: parseLocale(query.locale),
    q: query.q && query.q.trim() ? query.q.trim() : undefined,
    emojiId: query.emojiId && query.emojiId.trim() ? query.emojiId.trim() : undefined,
  };
}

export const REVIEW_STATUS_VALUES: ReviewStatusFilter[] = [
  'pending',
  'approved',
  'rejected',
  'spam',
];
