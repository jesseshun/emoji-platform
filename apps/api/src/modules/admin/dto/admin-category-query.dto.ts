export interface AdminCategoryListQuery {
  page: number;
  limit: number;
  q?: string;
  status?: string;
  parentId?: string | null;
}

/**
 * Parse admin category list query parameters.
 * - page defaults to 1
 * - limit defaults to 20 (per the agreed API contract), capped at 100
 * - parentId 'none' is normalized to null (categories without a parent)
 */
export function parseAdminCategoryListQuery(
  query: Record<string, string | undefined>,
): AdminCategoryListQuery {
  const page = parseInt(query.page ?? '', 10);
  const limit = parseInt(query.limit ?? '', 10);

  let parentId: string | null | undefined;
  if (query.parentId === 'none') {
    parentId = null;
  } else if (query.parentId) {
    parentId = query.parentId;
  }

  return {
    page: isNaN(page) || page < 1 ? 1 : page,
    limit: isNaN(limit) || limit < 1 ? 20 : Math.min(limit, 100),
    q: query.q?.trim() || undefined,
    status: query.status && query.status !== 'all' ? query.status : undefined,
    parentId,
  };
}
