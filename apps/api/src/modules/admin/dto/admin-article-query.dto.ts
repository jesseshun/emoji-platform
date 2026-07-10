export interface AdminArticleListQuery {
  page: number;
  limit: number;
  q?: string;
  status?: string;
}

/**
 * Parse admin article list query parameters.
 * - page defaults to 1
 * - limit defaults to 20 (per the agreed API contract), capped at 100
 * - q matches slug or translation title (case-insensitive)
 */
export function parseAdminArticleListQuery(
  query: Record<string, string | undefined>,
): AdminArticleListQuery {
  const page = parseInt(query.page ?? '', 10);
  const limit = parseInt(query.limit ?? '', 10);

  return {
    page: isNaN(page) || page < 1 ? 1 : page,
    limit: isNaN(limit) || limit < 1 ? 20 : Math.min(limit, 100),
    q: query.q?.trim() || undefined,
    status: query.status && query.status !== 'all' ? query.status : undefined,
  };
}
