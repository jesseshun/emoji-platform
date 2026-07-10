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

// ─── Category (Phase 4C-1) ──────────────────────────────

export type CategoryStatus = 'draft' | 'published' | 'archived';

export interface CategoryTranslation {
  name: string | null;
  description?: string | null;
  seoTitle?: string | null;
  seoDescription?: string | null;
}

export interface CategoryTranslationInput {
  name: string;
  description?: string | null;
  seoTitle?: string | null;
  seoDescription?: string | null;
}

export interface AdminCategoryListItem {
  id: string;
  slug: string;
  iconEmoji: string | null;
  sortOrder: number;
  status: CategoryStatus;
  parentId: string | null;
  parent: { id: string; slug: string; iconEmoji: string | null; name: string | null } | null;
  emojiCount: number;
  translations: {
    zh: { name: string | null; complete: boolean };
    en: { name: string | null; complete: boolean };
  };
  updatedAt: string;
  previewLinks: { zh: string; en: string };
}

export interface AdminCategoryListMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface AdminCategoryListResponse {
  data: AdminCategoryListItem[];
  meta: AdminCategoryListMeta;
}

export interface CategoryTreeNode {
  id: string;
  slug: string;
  iconEmoji: string | null;
  status: CategoryStatus;
  sortOrder: number;
  name: string | null;
  children: CategoryTreeNode[];
}

export interface AdminCategoryDetail {
  id: string;
  slug: string;
  iconEmoji: string | null;
  parentId: string | null;
  sortOrder: number;
  status: CategoryStatus;
  createdAt: string;
  updatedAt: string;
  parent: { id: string; slug: string; iconEmoji: string | null; name: string | null } | null;
  children: { id: string; slug: string; name: string | null }[];
  translations: { zh: CategoryTranslation | null; en: CategoryTranslation | null };
  previewLinks: { zh: string; en: string };
}

export interface CreateCategoryPayload {
  slug: string;
  parentId?: string | null;
  iconEmoji?: string | null;
  sortOrder?: number;
  status: CategoryStatus;
  translations: { zh: CategoryTranslationInput; en: CategoryTranslationInput };
}

export type UpdateCategoryPayload = Partial<Omit<CreateCategoryPayload, 'translations'>> & {
  translations?: { zh?: Partial<CategoryTranslationInput>; en?: Partial<CategoryTranslationInput> };
};

export async function listCategories(params: {
  page?: number;
  limit?: number;
  q?: string;
  status?: string;
  parentId?: string | null;
} = {}): Promise<AdminCategoryListResponse> {
  const qs = new URLSearchParams();
  if (params.page && params.page > 1) qs.set('page', String(params.page));
  if (params.limit) qs.set('limit', String(params.limit));
  if (params.q) qs.set('q', params.q);
  if (params.parentId) qs.set('parentId', params.parentId);
  if (params.status && params.status !== 'all') qs.set('status', params.status);
  const query = qs.toString();

  const body = await adminFetchEnvelope<AdminCategoryListItem[]>(
    `/admin/categories${query ? `?${query}` : ''}`,
  );
  return {
    data: body.data,
    meta: (body.meta as unknown as AdminCategoryListMeta) ?? {
      page: 1,
      limit: params.limit ?? 20,
      total: 0,
      totalPages: 1,
    },
  };
}

export async function getCategory(id: string): Promise<AdminCategoryDetail> {
  return adminFetch<AdminCategoryDetail>(`/admin/categories/${id}`);
}

export async function createCategory(payload: CreateCategoryPayload): Promise<AdminCategoryDetail> {
  return adminFetch<AdminCategoryDetail>('/admin/categories', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function updateCategory(
  id: string,
  payload: UpdateCategoryPayload,
): Promise<AdminCategoryDetail> {
  return adminFetch<AdminCategoryDetail>(`/admin/categories/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
}

export async function updateCategoryStatus(
  id: string,
  status: CategoryStatus,
): Promise<{ id: string; status: CategoryStatus }> {
  return adminFetch<{ id: string; status: CategoryStatus }>(`/admin/categories/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  });
}

export async function getCategoryTree(
  locale: 'zh' | 'en' = 'zh',
  exclude?: string,
): Promise<CategoryTreeNode[]> {
  const qs = new URLSearchParams();
  qs.set('locale', locale);
  if (exclude) qs.set('exclude', exclude);
  return adminFetch<CategoryTreeNode[]>(`/admin/categories/tree?${qs.toString()}`);
}

// ─── Topic (Phase 4C-2) ────────────────────────────────

export type TopicStatus = 'draft' | 'published' | 'archived';

export interface TopicTranslation {
  title: string | null;
  summary?: string | null;
  content?: string | null;
  seoTitle?: string | null;
  seoDescription?: string | null;
  faqJson?: unknown;
}

export interface TopicTranslationInput {
  title: string;
  summary?: string | null;
  content?: string | null;
  seoTitle?: string | null;
  seoDescription?: string | null;
  faqJson?: unknown;
}

export interface TopicEmojiBinding {
  id: string;
  emojiId: string;
  sortOrder: number;
  note: string | null;
  emoji: {
    id: string;
    slug: string;
    emojiChar: string;
    name: string | null;
  };
}

export interface TopicEmojiOption {
  id: string;
  slug: string;
  emojiChar: string;
  name: string | null;
}

export interface AdminTopicListItem {
  id: string;
  slug: string;
  coverImage: string | null;
  topicType: string | null;
  sortOrder: number;
  status: TopicStatus;
  emojiCount: number;
  translations: {
    zh: { title: string | null; complete: boolean };
    en: { title: string | null; complete: boolean };
  };
  updatedAt: string;
  previewLinks: { zh: string; en: string };
}

export interface AdminTopicListMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface AdminTopicListResponse {
  data: AdminTopicListItem[];
  meta: AdminTopicListMeta;
}

export interface AdminTopicDetail {
  id: string;
  slug: string;
  coverImage: string | null;
  topicType: string | null;
  status: TopicStatus;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
  translations: { zh: TopicTranslation | null; en: TopicTranslation | null };
  emojis: TopicEmojiBinding[];
  previewLinks: { zh: string; en: string };
}

export interface CreateTopicPayload {
  slug: string;
  coverImage?: string | null;
  topicType?: string | null;
  sortOrder?: number;
  status: TopicStatus;
  translations: { zh: TopicTranslationInput; en: TopicTranslationInput };
}

export type UpdateTopicPayload = Partial<Omit<CreateTopicPayload, 'translations'>> & {
  translations?: { zh?: Partial<TopicTranslationInput>; en?: Partial<TopicTranslationInput> };
};

export async function listTopics(params: {
  page?: number;
  limit?: number;
  q?: string;
  status?: string;
} = {}): Promise<AdminTopicListResponse> {
  const qs = new URLSearchParams();
  if (params.page && params.page > 1) qs.set('page', String(params.page));
  if (params.limit) qs.set('limit', String(params.limit));
  if (params.q) qs.set('q', params.q);
  if (params.status && params.status !== 'all') qs.set('status', params.status);
  const query = qs.toString();

  const body = await adminFetchEnvelope<AdminTopicListItem[]>(
    `/admin/topics${query ? `?${query}` : ''}`,
  );
  return {
    data: body.data,
    meta: (body.meta as unknown as AdminTopicListMeta) ?? {
      page: 1,
      limit: params.limit ?? 20,
      total: 0,
      totalPages: 1,
    },
  };
}

export async function getTopic(id: string): Promise<AdminTopicDetail> {
  return adminFetch<AdminTopicDetail>(`/admin/topics/${id}`);
}

export async function createTopic(payload: CreateTopicPayload): Promise<AdminTopicDetail> {
  return adminFetch<AdminTopicDetail>('/admin/topics', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function updateTopic(
  id: string,
  payload: UpdateTopicPayload,
): Promise<AdminTopicDetail> {
  return adminFetch<AdminTopicDetail>(`/admin/topics/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
}

export async function updateTopicStatus(
  id: string,
  status: TopicStatus,
): Promise<{ id: string; status: TopicStatus }> {
  return adminFetch<{ id: string; status: TopicStatus }>(`/admin/topics/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  });
}

export async function getTopicEmojiOptions(locale: 'zh' | 'en' = 'zh'): Promise<TopicEmojiOption[]> {
  return adminFetch<TopicEmojiOption[]>(`/admin/topics/emoji-options?locale=${locale}`);
}

export async function setTopicEmojis(
  id: string,
  items: { emojiId: string; note?: string | null }[],
): Promise<AdminTopicDetail> {
  return adminFetch<AdminTopicDetail>(`/admin/topics/${id}/emojis`, {
    method: 'PUT',
    body: JSON.stringify({ items }),
  });
}
