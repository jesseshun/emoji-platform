import type { ApiResponse, PaginatedResponse } from '@emoji-platform/types';
import type { EmojiListItem, CategoryItem, TopicItem, SearchResultItem, Locale, EmojiDetail, CategoryDetailData, TopicDetailData } from './types';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

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

// ─── Search Endpoint ───────────────────────────────────

export async function searchEmojis(
  locale: Locale,
  q: string,
  page = 1,
  limit = 30,
): Promise<PaginatedResponse<SearchResultItem>> {
  const params = new URLSearchParams({ locale, q, page: String(page), limit: String(limit) });
  return fetchApi<PaginatedResponse<SearchResultItem>>(`/search?${params}`);
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
