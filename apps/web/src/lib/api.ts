import type { ApiResponse, PaginatedResponse } from '@emoji-platform/types';
import type { EmojiListItem, CategoryItem, TopicItem, Locale, EmojiDetail, CategoryDetailData, TopicDetailData, ArticleItem, ArticleDetailData, SearchResponse, SearchTypeFilter, DiscoveryHomeData, RecommendationData, RecommendationEntityType } from './types';

// SSR (server-side render): use internal API_URL (e.g. http://api:4000 inside Docker).
// CSR (client-side browser): fall back to NEXT_PUBLIC_API_URL (public-facing URL).
const API_BASE = process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

// ─── Error ─────────────────────────────────────────────

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public code?: string,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

// ─── Fetch Wrapper ─────────────────────────────────────

async function fetchApi<T>(path: string, options?: RequestInit): Promise<T> {
  const url = `${API_BASE}/api/v1${path}`;

  let res: Response;
  try {
    res = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    });
  } catch {
    throw new ApiError('Unable to connect to the server', 0, 'NETWORK_ERROR');
  }

  let body: Record<string, unknown>;
  try {
    body = await res.json();
  } catch {
    throw new ApiError('Invalid response from server', res.status, 'INVALID_JSON');
  }

  if (!res.ok || !body.success) {
    const error = body.error as { code?: string; message?: string } | undefined;
    throw new ApiError(
      error?.message || `API error: ${res.status}`,
      res.status,
      error?.code,
    );
  }

  return body as T;
}

// ─── Emoji Endpoints ───────────────────────────────────

export async function getEmojis(
  locale: Locale,
  page = 1,
  limit = 30,
  category?: string,
): Promise<PaginatedResponse<EmojiListItem>> {
  const params = new URLSearchParams({ locale, page: String(page), limit: String(limit) });
  if (category) params.set('category', category);
  return fetchApi<PaginatedResponse<EmojiListItem>>(`/emojis?${params}`);
}

export async function getEmojiDetail(
  slug: string,
  locale: Locale,
): Promise<ApiResponse<EmojiDetail>> {
  return fetchApi<ApiResponse<EmojiDetail>>(`/emojis/${encodeURIComponent(slug)}?locale=${locale}`);
}

// ─── Category Endpoints ────────────────────────────────

export async function getCategories(
  locale: Locale,
): Promise<ApiResponse<CategoryItem[]>> {
  return fetchApi<ApiResponse<CategoryItem[]>>(`/categories?locale=${locale}`);
}

export async function getCategoryDetail(
  slug: string,
  locale: Locale,
  page = 1,
  limit = 30,
): Promise<ApiResponse<CategoryDetailData> & { meta: PaginatedResponse<unknown>['meta'] }> {
  const params = new URLSearchParams({ locale, page: String(page), limit: String(limit) });
  return fetchApi<ApiResponse<CategoryDetailData> & { meta: PaginatedResponse<unknown>['meta'] }>(`/categories/${encodeURIComponent(slug)}?${params}`);
}

// ─── Topic Endpoints ───────────────────────────────────

export async function getTopics(
  locale: Locale,
  page = 1,
  limit = 30,
): Promise<PaginatedResponse<TopicItem>> {
  const params = new URLSearchParams({ locale, page: String(page), limit: String(limit) });
  return fetchApi<PaginatedResponse<TopicItem>>(`/topics?${params}`);
}

export async function getTopicDetail(
  slug: string,
  locale: Locale,
): Promise<ApiResponse<TopicDetailData>> {
  return fetchApi<ApiResponse<TopicDetailData>>(`/topics/${encodeURIComponent(slug)}?locale=${locale}`);
}

// ─── Article Endpoints ─────────────────────────────────

export async function getArticles(
  locale: Locale,
  page = 1,
  limit = 30,
): Promise<PaginatedResponse<ArticleItem>> {
  const params = new URLSearchParams({ locale, page: String(page), limit: String(limit) });
  return fetchApi<PaginatedResponse<ArticleItem>>(`/articles?${params}`);
}

export async function getArticleDetail(
  slug: string,
  locale: Locale,
): Promise<ApiResponse<ArticleDetailData>> {
  return fetchApi<ApiResponse<ArticleDetailData>>(`/articles/${encodeURIComponent(slug)}?locale=${locale}`);
}

// ─── Search Endpoint ───────────────────────────────────

export async function searchEmojis(
  locale: Locale,
  q: string,
  page = 1,
  limit = 30,
): Promise<SearchResponse> {
  return search(locale, q, { type: 'emoji', page, limit });
}

/**
 * Unified public search (Phase 6C).
 *
 * Supports a `type` filter (all | emoji | category | topic | article), `page`,
 * and `limit`. Returns a typed result list plus provider / fallback metadata.
 */
export async function search(
  locale: Locale,
  q: string,
  options: { type?: SearchTypeFilter; page?: number; limit?: number } = {},
): Promise<SearchResponse> {
  const params = new URLSearchParams({ locale, q });
  if (options.type) params.set('type', options.type);
  if (options.page && options.page > 1) params.set('page', String(options.page));
  if (options.limit) params.set('limit', String(options.limit));
  return fetchApi<SearchResponse>(`/search?${params}`);
}

// ─── Discovery (Phase 6D) ──────────────────────────────

/**
 * Public homepage discovery module (Phase 6D).
 *
 * Returns featured emojis, featured categories, featured topics, and latest
 * articles — all published, no auth required.
 */
export async function getDiscovery(locale: Locale): Promise<ApiResponse<DiscoveryHomeData>> {
  return fetchApi<ApiResponse<DiscoveryHomeData>>(`/discovery/home?locale=${locale}`);
}

/**
 * Public content-based recommendations (Phase 6D).
 *
 * Lightweight, explainable recommendations by entity type + slug. No AI, no
 * personalization. Returns related emojis / categories / topics / articles
 * (each array may be empty when not applicable to the entity type).
 */
export async function getRecommendations(
  entityType: RecommendationEntityType,
  slug: string,
  locale: Locale,
  limit = 8,
): Promise<ApiResponse<RecommendationData>> {
  const params = new URLSearchParams({ entityType, slug, locale, limit: String(limit) });
  return fetchApi<ApiResponse<RecommendationData>>(`/recommendations?${params}`);
}

// ─── Copy Event ────────────────────────────────────────

export async function recordCopyEvent(
  emojiId: string,
  locale: Locale,
  pageUrl?: string,
): Promise<ApiResponse<{ id: string }>> {
  return fetchApi<ApiResponse<{ id: string }>>('/events/copy', {
    method: 'POST',
    body: JSON.stringify({ emojiId, locale, pageUrl }),
  });
}

// ─── Helpers ───────────────────────────────────────────

export function getErrorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    if (error.status === 0) return '无法连接到服务器，请稍后重试';
    if (error.status === 404) return '请求的资源不存在';
    if (error.status >= 500) return '服务器错误，请稍后重试';
    return error.message;
  }
  if (error instanceof Error) return error.message;
  return '未知错误';
}
