export type AdminRole =
  | 'super_admin'
  | 'editor'
  | 'seo_manager'
  | 'translator'
  | 'reviewer'
  | 'analyst';

export interface AdminUser {
  id: string;
  email: string;
  name: string | null;
  role: string;
}

export type EmojiStatus = 'draft' | 'published' | 'archived';
export type ReviewStatus = 'pending' | 'approved' | 'rejected' | 'needs_edit';

export interface AdminEmojiTranslation {
  name: string | null;
  shortName?: string | null;
  oneLineMeaning?: string | null;
  meaning?: string | null;
  usageNotes?: string | null;
  formalUsageNotes?: string | null;
  informalUsageNotes?: string | null;
  socialUsageNotes?: string | null;
  examples?: unknown;
  keywords?: unknown;
  faqJson?: unknown;
  seoTitle?: string | null;
  seoDescription?: string | null;
  status?: EmojiStatus;
  reviewStatus?: ReviewStatus;
}

export interface AdminEmojiDetail {
  id: string;
  emojiChar: string;
  slug: string;
  unicodeCodepoint: string | null;
  htmlDecimal: string | null;
  htmlHex: string | null;
  shortcode: string | null;
  emojiVersion: string | null;
  unicodeVersion: string | null;
  categoryId: string | null;
  subcategoryId: string | null;
  status: EmojiStatus;
  manualWeight: number;
  createdAt: string;
  updatedAt: string;
  category: { id: string; slug: string; iconEmoji: string | null; name: string | null } | null;
  translations: { zh: AdminEmojiTranslation | null; en: AdminEmojiTranslation | null };
  previewLinks: { zh: string; en: string };
}

export interface AdminEmojiListItem {
  id: string;
  emojiChar: string;
  slug: string;
  unicodeCodepoint: string | null;
  shortcode: string | null;
  category: { id: string; slug: string; iconEmoji: string | null; name: string | null } | null;
  status: EmojiStatus;
  updatedAt: string;
  manualWeight: number;
  translations: {
    zh: { name: string | null; complete: boolean };
    en: { name: string | null; complete: boolean };
  };
  previewLinks: { zh: string; en: string };
}

export interface AdminEmojiListMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface AdminEmojiListResponse {
  data: AdminEmojiListItem[];
  meta: AdminEmojiListMeta;
}

export interface AdminDashboardStats {
  emojiTotal: number;
  publishedEmojiTotal: number;
  draftEmojiTotal: number;
  archivedEmojiTotal: number;
  categoryTotal: number;
  topicTotal: number;
  todaySearchTotal: number;
  todayCopyTotal: number;
}

export interface AdminRecentEmoji {
  id: string;
  emojiChar: string;
  slug: string;
  status: EmojiStatus;
  updatedAt: string;
  name: string | null;
  previewLinks: { zh: string; en: string };
}

export interface AdminDashboardData {
  stats: AdminDashboardStats;
  recentEmojis: AdminRecentEmoji[];
  admin: AdminUser;
}

export interface CategoryOption {
  id: string;
  slug: string;
  iconEmoji: string | null;
  name: string | null;
}

export interface EmojiTranslationInput {
  name: string;
  shortName?: string | null;
  oneLineMeaning?: string | null;
  meaning?: string | null;
  usageNotes?: string | null;
  formalUsageNotes?: string | null;
  informalUsageNotes?: string | null;
  socialUsageNotes?: string | null;
  examples?: unknown;
  keywords?: unknown;
  faqJson?: unknown;
  seoTitle?: string | null;
  seoDescription?: string | null;
  status?: EmojiStatus;
  reviewStatus?: ReviewStatus;
}

export interface CreateEmojiPayload {
  emojiChar: string;
  slug: string;
  unicodeCodepoint?: string | null;
  htmlDecimal?: string | null;
  htmlHex?: string | null;
  shortcode?: string | null;
  emojiVersion?: string | null;
  unicodeVersion?: string | null;
  categoryId?: string | null;
  status: EmojiStatus;
  manualWeight?: number;
  translations: { zh: EmojiTranslationInput; en: EmojiTranslationInput };
}

export type UpdateEmojiPayload = Partial<Omit<CreateEmojiPayload, 'translations'>> & {
  translations?: { zh?: Partial<EmojiTranslationInput>; en?: Partial<EmojiTranslationInput> };
};

export class AdminApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public code?: string,
  ) {
    super(message);
    this.name = 'AdminApiError';
  }
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

interface ApiEnvelope<T> {
  success: boolean;
  data: T;
  meta?: Record<string, unknown>;
  error?: { code?: string; message?: string };
}

async function adminFetchEnvelope<T>(path: string, options?: RequestInit): Promise<ApiEnvelope<T>> {
  let res: Response;
  try {
    res = await fetch(`${API_BASE}/api/v1${path}`, {
      ...options,
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        ...(options?.headers || {}),
      },
    });
  } catch {
    throw new AdminApiError('无法连接到服务器，请稍后重试', 0, 'NETWORK_ERROR');
  }

  let body: ApiEnvelope<T>;
  try {
    body = (await res.json()) as ApiEnvelope<T>;
  } catch {
    throw new AdminApiError('服务器返回了无效响应', res.status, 'INVALID_JSON');
  }

  if (!res.ok || !body.success) {
    const err = body.error || {};
    throw new AdminApiError(err.message || `请求失败（${res.status}）`, res.status, err.code);
  }

  return body;
}

async function adminFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const body = await adminFetchEnvelope<T>(path, options);
  return body.data;
}

export async function adminLogin(
  email: string,
  password: string,
): Promise<{ admin: AdminUser; token: string }> {
  return adminFetch<{ admin: AdminUser; token: string }>('/admin/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
}

export async function getAdminMe(): Promise<AdminUser> {
  const data = await adminFetch<{ admin: AdminUser }>('/admin/auth/me');
  return data.admin;
}

export async function adminLogout(): Promise<{ loggedOut: boolean }> {
  return adminFetch<{ loggedOut: boolean }>('/admin/auth/logout', { method: 'POST' });
}

export async function getDashboard(): Promise<AdminDashboardData> {
  return adminFetch<AdminDashboardData>('/admin/dashboard');
}

export async function listEmojis(params: {
  page?: number;
  limit?: number;
  q?: string;
  categoryId?: string;
  status?: string;
} = {}): Promise<AdminEmojiListResponse> {
  const qs = new URLSearchParams();
  if (params.page && params.page > 1) qs.set('page', String(params.page));
  if (params.limit) qs.set('limit', String(params.limit));
  if (params.q) qs.set('q', params.q);
  if (params.categoryId) qs.set('categoryId', params.categoryId);
  if (params.status && params.status !== 'all') qs.set('status', params.status);
  const query = qs.toString();

  const body = await adminFetchEnvelope<AdminEmojiListItem[]>(
    `/admin/emojis${query ? `?${query}` : ''}`,
  );
  return {
    data: body.data,
    meta: (body.meta as unknown as AdminEmojiListMeta) ?? {
      page: 1,
      limit: params.limit ?? 30,
      total: 0,
      totalPages: 1,
    },
  };
}

export async function getEmoji(id: string): Promise<AdminEmojiDetail> {
  return adminFetch<AdminEmojiDetail>(`/admin/emojis/${id}`);
}

export async function createEmoji(payload: CreateEmojiPayload): Promise<AdminEmojiDetail> {
  return adminFetch<AdminEmojiDetail>('/admin/emojis', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function updateEmoji(
  id: string,
  payload: UpdateEmojiPayload,
): Promise<AdminEmojiDetail> {
  return adminFetch<AdminEmojiDetail>(`/admin/emojis/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
}

export async function updateEmojiStatus(
  id: string,
  status: EmojiStatus,
): Promise<{ id: string; status: EmojiStatus }> {
  return adminFetch<{ id: string; status: EmojiStatus }>(`/admin/emojis/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  });
}

export async function getCategoryOptions(locale: 'zh' | 'en' = 'zh'): Promise<CategoryOption[]> {
  return adminFetch<CategoryOption[]>(`/admin/categories/options?locale=${locale}`);
}
