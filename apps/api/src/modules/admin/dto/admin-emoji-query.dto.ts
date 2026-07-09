import { BadRequestException } from '@nestjs/common';
import { DEFAULT_PAGE, DEFAULT_LIMIT, MAX_LIMIT } from '@emoji-platform/types';

export type AdminEmojiStatus = 'draft' | 'published' | 'archived';

export interface AdminEmojiListQuery {
  page: number;
  limit: number;
  q?: string;
  categoryId?: string;
  status?: AdminEmojiStatus | 'all';
}

const STATUS_VALUES: AdminEmojiStatus[] = ['draft', 'published', 'archived'];

export function parseAdminEmojiListQuery(
  query: Record<string, string | undefined>,
): AdminEmojiListQuery {
  let page = parseInt(query.page ?? '', 10);
  let limit = parseInt(query.limit ?? '', 10);
  if (isNaN(page) || page < 1) page = DEFAULT_PAGE;
  if (isNaN(limit) || limit < 1) limit = DEFAULT_LIMIT;
  if (limit > MAX_LIMIT) limit = MAX_LIMIT;

  const statusRaw = query.status ?? 'all';
  let status: AdminEmojiStatus | 'all' = 'all';
  if (statusRaw && statusRaw !== 'all') {
    if (!STATUS_VALUES.includes(statusRaw as AdminEmojiStatus)) {
      throw new BadRequestException(
        `无效的 status "${statusRaw}"。支持：draft, published, archived, all`,
      );
    }
    status = statusRaw as AdminEmojiStatus;
  }

  return {
    page,
    limit,
    q: query.q?.trim() || undefined,
    categoryId: query.categoryId || undefined,
    status,
  };
}
