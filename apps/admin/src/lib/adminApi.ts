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

// ─── Article (Phase 4C-3) ──────────────────────────────

export type ArticleStatus = 'draft' | 'published' | 'archived';

export interface ArticleAuthorSummary {
  id: string | null;
  name: string | null;
  email: string | null;
}

export interface ArticleTranslation {
  title: string | null;
  summary?: string | null;
  content?: string | null;
  seoTitle?: string | null;
  seoDescription?: string | null;
  keywords?: unknown;
}

export interface ArticleTranslationInput {
  title: string;
  summary?: string | null;
  content?: string | null;
  seoTitle?: string | null;
  seoDescription?: string | null;
  keywords?: unknown;
}

export interface AdminArticleListItem {
  id: string;
  slug: string;
  coverImage: string | null;
  status: ArticleStatus;
  publishedAt: string | null;
  author: ArticleAuthorSummary;
  translations: {
    zh: { title: string | null; complete: boolean };
    en: { title: string | null; complete: boolean };
  };
  updatedAt: string;
  previewLinks: { zh: string; en: string };
}

export interface AdminArticleListMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface AdminArticleListResponse {
  data: AdminArticleListItem[];
  meta: AdminArticleListMeta;
}

export interface AdminArticleDetail {
  id: string;
  slug: string;
  coverImage: string | null;
  authorId: string | null;
  author: ArticleAuthorSummary;
  status: ArticleStatus;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
  translations: { zh: ArticleTranslation | null; en: ArticleTranslation | null };
  previewLinks: { zh: string; en: string };
}

export interface CreateArticlePayload {
  slug: string;
  coverImage?: string | null;
  authorId?: string | null;
  status: ArticleStatus;
  publishedAt?: string | null;
  translations: { zh: ArticleTranslationInput; en: ArticleTranslationInput };
}

export type UpdateArticlePayload = Partial<Omit<CreateArticlePayload, 'translations'>> & {
  translations?: { zh?: Partial<ArticleTranslationInput>; en?: Partial<ArticleTranslationInput> };
};

export async function listArticles(params: {
  page?: number;
  limit?: number;
  q?: string;
  status?: string;
} = {}): Promise<AdminArticleListResponse> {
  const qs = new URLSearchParams();
  if (params.page && params.page > 1) qs.set('page', String(params.page));
  if (params.limit) qs.set('limit', String(params.limit));
  if (params.q) qs.set('q', params.q);
  if (params.status && params.status !== 'all') qs.set('status', params.status);
  const query = qs.toString();

  const body = await adminFetchEnvelope<AdminArticleListItem[]>(
    `/admin/articles${query ? `?${query}` : ''}`,
  );
  return {
    data: body.data,
    meta: (body.meta as unknown as AdminArticleListMeta) ?? {
      page: 1,
      limit: params.limit ?? 20,
      total: 0,
      totalPages: 1,
    },
  };
}

export async function getArticle(id: string): Promise<AdminArticleDetail> {
  return adminFetch<AdminArticleDetail>(`/admin/articles/${id}`);
}

export async function createArticle(payload: CreateArticlePayload): Promise<AdminArticleDetail> {
  return adminFetch<AdminArticleDetail>('/admin/articles', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function updateArticle(
  id: string,
  payload: UpdateArticlePayload,
): Promise<AdminArticleDetail> {
  return adminFetch<AdminArticleDetail>(`/admin/articles/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
}

export async function updateArticleStatus(
  id: string,
  status: ArticleStatus,
): Promise<{ id: string; status: ArticleStatus }> {
  return adminFetch<{ id: string; status: ArticleStatus }>(`/admin/articles/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  });
}

// ─── Emoji options (for asset selector) ─────────────
export interface EmojiOption {
  id: string;
  slug: string;
  emojiChar: string;
  name: string | null;
}

export async function getEmojiOptions(locale: 'zh' | 'en' = 'zh'): Promise<EmojiOption[]> {
  return adminFetch<EmojiOption[]>(`/admin/emojis/options?locale=${locale}`);
}

// ─── Asset / License (Phase 4D-1) ──────────────────
export type AssetProvider = 'noto' | 'openmoji' | 'twemoji' | 'custom';
export type AssetFileType = 'svg' | 'png' | 'webp' | 'gif';
export type AssetStatus = 'draft' | 'published' | 'archived';

export interface AssetEmojiSummary {
  id: string;
  emojiChar: string;
  slug: string;
  name: string | null;
}

export interface AdminAssetDetail {
  id: string;
  emojiId: string;
  emoji: AssetEmojiSummary | null;
  provider: string | null;
  fileType: string | null;
  fileUrl: string | null;
  localPath: string | null;
  width: number | null;
  height: number | null;
  licenseName: string | null;
  licenseUrl: string | null;
  attribution: string | null;
  isDownloadable: boolean;
  status: AssetStatus;
  createdAt: string;
  updatedAt: string;
}

export interface AdminAssetListItem {
  id: string;
  emojiId: string;
  emoji: AssetEmojiSummary | null;
  provider: string | null;
  fileType: string | null;
  fileUrl: string | null;
  localPath: string | null;
  width: number | null;
  height: number | null;
  licenseName: string | null;
  licenseUrl: string | null;
  attribution: string | null;
  isDownloadable: boolean;
  status: AssetStatus;
  createdAt: string;
  updatedAt: string;
}

export interface AdminAssetListMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface AdminAssetListResponse {
  data: AdminAssetListItem[];
  meta: AdminAssetListMeta;
}

export interface CreateAssetPayload {
  emojiId: string;
  provider: AssetProvider;
  fileType: AssetFileType;
  fileUrl?: string | null;
  localPath?: string | null;
  width?: number | null;
  height?: number | null;
  licenseName?: string | null;
  licenseUrl?: string | null;
  attribution?: string | null;
  isDownloadable: boolean;
  status: AssetStatus;
}

export type UpdateAssetPayload = Partial<Omit<CreateAssetPayload, 'isDownloadable'>> & {
  isDownloadable?: boolean;
};

export const ASSET_PROVIDERS: AssetProvider[] = ['noto', 'openmoji', 'twemoji', 'custom'];
export const ASSET_FILE_TYPES: AssetFileType[] = ['svg', 'png', 'webp', 'gif'];

export async function listAssets(params: {
  page?: number;
  limit?: number;
  q?: string;
  provider?: string;
  fileType?: string;
  status?: string;
  emojiId?: string;
  isDownloadable?: string;
} = {}): Promise<AdminAssetListResponse> {
  const qs = new URLSearchParams();
  if (params.page && params.page > 1) qs.set('page', String(params.page));
  if (params.limit) qs.set('limit', String(params.limit));
  if (params.q) qs.set('q', params.q);
  if (params.provider && params.provider !== 'all') qs.set('provider', params.provider);
  if (params.fileType && params.fileType !== 'all') qs.set('fileType', params.fileType);
  if (params.status && params.status !== 'all') qs.set('status', params.status);
  if (params.emojiId) qs.set('emojiId', params.emojiId);
  if (params.isDownloadable && params.isDownloadable !== 'all') {
    qs.set('isDownloadable', params.isDownloadable);
  }
  const query = qs.toString();

  const body = await adminFetchEnvelope<AdminAssetListItem[]>(
    `/admin/assets${query ? `?${query}` : ''}`,
  );
  return {
    data: body.data,
    meta: (body.meta as unknown as AdminAssetListMeta) ?? {
      page: 1,
      limit: params.limit ?? 20,
      total: 0,
      totalPages: 1,
    },
  };
}

export async function getAsset(id: string): Promise<AdminAssetDetail> {
  return adminFetch<AdminAssetDetail>(`/admin/assets/${id}`);
}

export async function getAssetProviders(): Promise<AssetProvider[]> {
  return adminFetch<AssetProvider[]>('/admin/assets/providers');
}

export async function getAssetFileTypes(): Promise<AssetFileType[]> {
  return adminFetch<AssetFileType[]>('/admin/assets/file-types');
}

export async function createAsset(payload: CreateAssetPayload): Promise<AdminAssetDetail> {
  return adminFetch<AdminAssetDetail>('/admin/assets', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function updateAsset(
  id: string,
  payload: UpdateAssetPayload,
): Promise<AdminAssetDetail> {
  return adminFetch<AdminAssetDetail>(`/admin/assets/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
}

export async function updateAssetStatus(
  id: string,
  status: AssetStatus,
): Promise<{ id: string; status: AssetStatus }> {
  return adminFetch<{ id: string; status: AssetStatus }>(`/admin/assets/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  });
}

export async function deleteAsset(
  id: string,
): Promise<{ id: string; deleted: boolean }> {
  return adminFetch<{ id: string; deleted: boolean }>(`/admin/assets/${id}`, {
    method: 'DELETE',
  });
}

// ─── SEO Management Center (Phase 4D-2) ─────────────

export type SeoEntityType = 'emoji' | 'category' | 'topic' | 'article';
export type SeoCompleteness =
  | 'all'
  | 'missingTitle'
  | 'missingDescription'
  | 'missingAny'
  | 'complete';
export type SeoLocaleFilter = 'zh' | 'en' | 'all';

export interface SeoStats {
  total: number;
  missingTitle: number;
  missingDescription: number;
  missingAny: number;
  complete: number;
  missingByLocale: {
    zh: { missingTitle: number; missingDescription: number };
    en: { missingTitle: number; missingDescription: number };
  };
}

export interface SeoRecentUpdate {
  id: string;
  action: string | null;
  entityType: string | null;
  entityId: string | null;
  adminUserId: string | null;
  createdAt: string;
}

export interface SeoOverview {
  emojiSeoStats: SeoStats;
  categorySeoStats: SeoStats;
  topicSeoStats: SeoStats;
  articleSeoStats: SeoStats;
  missingTitleCount: number;
  missingDescriptionCount: number;
  missingByLocale: {
    zh: { missingTitle: number; missingDescription: number };
    en: { missingTitle: number; missingDescription: number };
  };
  recentSeoUpdates: SeoRecentUpdate[];
  robotsStatus: {
    exists: boolean;
    blocksIndexing: boolean;
    protectsAdminNoindex: boolean;
    note: string;
  };
  sitemapStatus: { exists: boolean; note: string };
}

// ─── SEO Quality Checker (Phase 5C) ───────────────

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

export type SeoSeverity = 'issue' | 'warning';

export interface SeoQualityIssuesByType {
  missingSeoTitle: number;
  missingSeoDescription: number;
  titleTooShort: number;
  titleTooLong: number;
  descriptionTooShort: number;
  descriptionTooLong: number;
  missingCanonicalPreview: number;
  missingHreflangPreview: number;
  missingJsonLd: number;
  sitemapMismatch: number;
  noInternalLinks: number;
}

export interface SeoQualityIssuesByEntityType {
  emoji: { issue: number; warning: number };
  category: { issue: number; warning: number };
  topic: { issue: number; warning: number };
  article: { issue: number; warning: number };
}

export interface SeoIssue {
  id: string;
  entityType: 'emoji' | 'category' | 'topic' | 'article';
  entityId: string;
  locale: 'zh' | 'en' | 'all';
  issueType: SeoIssueType;
  severity: SeoSeverity;
  message: string;
  recommendedAction: string;
  nameOrTitle: string | null;
  slug: string | null;
  status: string | null;
  updatedAt: string;
  editUrl: string;
  publicUrl: string | null;
}

export interface SeoQualityOverview {
  totalChecked: number;
  passedCount: number;
  issueCount: number;
  warningCount: number;
  issuesByEntityType: SeoQualityIssuesByEntityType;
  issuesByType: SeoQualityIssuesByType;
  recentIssues: SeoIssue[];
  generatedAt: string;
}

export interface InternalLinkSuggestion {
  entityType: 'emoji' | 'category' | 'topic' | 'article';
  id: string;
  slug: string;
  title: string | null;
  url: string;
  reason: string;
  score: number;
}

export interface InternalLinkSuggestionResponse {
  entityType: 'emoji' | 'category' | 'topic' | 'article';
  id: string;
  locale: 'zh' | 'en';
  suggestions: InternalLinkSuggestion[];
}

export interface SeoEntityListItem {
  id: string;
  entityId: string | null;
  entityType: SeoEntityType;
  locale: 'zh' | 'en';
  nameOrTitle: string | null;
  slug: string;
  status: string | null;
  seoTitle: string | null;
  seoDescription: string | null;
  seoTitleLength: number;
  seoDescriptionLength: number;
  completeness: SeoCompleteness | string;
  previewLink: string;
  canonical: { zh: string; en: string; xdefault: string };
  hreflang: { lang: string; href: string }[];
  editUrl: string;
  planned: boolean;
}

export interface SeoEntityTranslation {
  seoTitle: string | null;
  seoDescription: string | null;
  name?: string | null;
  title?: string | null;
}

export interface SeoEntityDetail {
  entityType: SeoEntityType;
  id: string;
  slug: string;
  status: string;
  publishedAt: string | null;
  name: string | null;
  translations: {
    zh: SeoEntityTranslation | null;
    en: SeoEntityTranslation | null;
  };
  canonical: { zh: string; en: string; xdefault: string };
  hreflang: { lang: string; href: string }[];
  previewLinks: { zh: string; en: string };
  planned: boolean;
  seoNote?: string;
}

export interface SeoUpdatePayload {
  translations: {
    zh?: { seoTitle?: string | null; seoDescription?: string | null };
    en?: { seoTitle?: string | null; seoDescription?: string | null };
  };
}

export interface AdminSeoListMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface AdminSeoListResponse {
  data: SeoEntityListItem[];
  meta: AdminSeoListMeta;
}

export async function getSeoOverview(): Promise<SeoOverview> {
  return adminFetch<SeoOverview>('/admin/seo/overview');
}

export async function listSeoEntities(
  entityType: SeoEntityType,
  params: {
    page?: number;
    limit?: number;
    q?: string;
    locale?: SeoLocaleFilter;
    status?: string;
    completeness?: SeoCompleteness;
  } = {},
): Promise<AdminSeoListResponse> {
  const qs = new URLSearchParams();
  qs.set('entityType', entityType);
  if (params.page && params.page > 1) qs.set('page', String(params.page));
  if (params.limit) qs.set('limit', String(params.limit));
  if (params.q) qs.set('q', params.q);
  if (params.locale && params.locale !== 'all') qs.set('locale', params.locale);
  if (params.status && params.status !== 'all') qs.set('status', params.status);
  if (params.completeness && params.completeness !== 'all') {
    qs.set('completeness', params.completeness);
  }
  const query = qs.toString();

  const body = await adminFetchEnvelope<SeoEntityListItem[]>(
    `/admin/seo/entities${query ? `?${query}` : ''}`,
  );
  return {
    data: body.data,
    meta: (body.meta as unknown as AdminSeoListMeta) ?? {
      page: 1,
      limit: params.limit ?? 20,
      total: 0,
      totalPages: 1,
    },
  };
}

export async function getSeoEntity(
  entityType: SeoEntityType,
  id: string,
): Promise<SeoEntityDetail> {
  return adminFetch<SeoEntityDetail>(`/admin/seo/entities/${entityType}/${id}`);
}

export async function updateSeoEntity(
  entityType: SeoEntityType,
  id: string,
  payload: SeoUpdatePayload,
): Promise<SeoEntityDetail> {
  return adminFetch<SeoEntityDetail>(`/admin/seo/entities/${entityType}/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
}

export async function getSeoRobotsStatus(): Promise<{
  exists: boolean;
  blocksIndexing: boolean;
  protectsAdminNoindex: boolean;
  note: string;
}> {
  return adminFetch<{
    exists: boolean;
    blocksIndexing: boolean;
    protectsAdminNoindex: boolean;
    note: string;
  }>('/admin/seo/robots-status');
}

export async function getSeoSitemapStatus(): Promise<{ exists: boolean; note: string }> {
  return adminFetch<{ exists: boolean; note: string }>('/admin/seo/sitemap-status');
}

// ─── Logs & Reviews (Phase 4D-3) ───────────────────────

export interface SearchLogItem {
  id: string;
  query: string | null;
  locale: 'zh' | 'en' | null;
  country: string | null;
  resultCount: number | null;
  userAgent: string | null;
  ipHash: string | null;
  createdAt: string;
}

export interface SearchLogsSummary {
  totalSearches: number;
  todaySearches: number;
  zeroResultSearches: number;
  topQueries: { query: string; count: number }[];
  searchesByLocale: { zh: number; en: number; other: number };
}

export interface AdminLogListMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface AdminSearchLogsListResponse {
  data: SearchLogItem[];
  meta: AdminLogListMeta;
}

export interface SearchLogsQuery {
  page?: number;
  limit?: number;
  q?: string;
  locale?: 'zh' | 'en' | 'all';
  dateFrom?: string;
  dateTo?: string;
  minResultCount?: number;
  maxResultCount?: number;
}

export async function listSearchLogs(
  params: SearchLogsQuery = {},
): Promise<AdminSearchLogsListResponse> {
  const qs = new URLSearchParams();
  if (params.page && params.page > 1) qs.set('page', String(params.page));
  if (params.limit) qs.set('limit', String(params.limit));
  if (params.q) qs.set('q', params.q);
  if (params.locale && params.locale !== 'all') qs.set('locale', params.locale);
  if (params.dateFrom) qs.set('dateFrom', params.dateFrom);
  if (params.dateTo) qs.set('dateTo', params.dateTo);
  if (params.minResultCount !== undefined) qs.set('minResultCount', String(params.minResultCount));
  if (params.maxResultCount !== undefined) qs.set('maxResultCount', String(params.maxResultCount));
  const query = qs.toString();

  const body = await adminFetchEnvelope<SearchLogItem[]>(
    `/admin/search-logs${query ? `?${query}` : ''}`,
  );
  return {
    data: body.data,
    meta: (body.meta as unknown as AdminLogListMeta) ?? {
      page: 1,
      limit: params.limit ?? 30,
      total: 0,
      totalPages: 1,
    },
  };
}

export async function getSearchLogsSummary(): Promise<SearchLogsSummary> {
  return adminFetch<SearchLogsSummary>('/admin/search-logs/summary');
}

export interface CopyEventItem {
  id: string;
  emojiId: string | null;
  emojiChar: string | null;
  emojiSlug: string | null;
  locale: 'zh' | 'en' | null;
  country: string | null;
  pageUrl: string | null;
  userAgent: string | null;
  ipHash: string | null;
  createdAt: string;
}

export interface CopyEventsSummary {
  totalCopies: number;
  todayCopies: number;
  topCopiedEmojis: {
    emojiId: string;
    emojiChar: string | null;
    emojiSlug: string | null;
    count: number;
  }[];
  copiesByLocale: { zh: number; en: number; other: number };
}

export interface AdminCopyEventsListResponse {
  data: CopyEventItem[];
  meta: AdminLogListMeta;
}

export interface CopyEventsQuery {
  page?: number;
  limit?: number;
  locale?: 'zh' | 'en' | 'all';
  emojiId?: string;
  dateFrom?: string;
  dateTo?: string;
}

export async function listCopyEvents(
  params: CopyEventsQuery = {},
): Promise<AdminCopyEventsListResponse> {
  const qs = new URLSearchParams();
  if (params.page && params.page > 1) qs.set('page', String(params.page));
  if (params.limit) qs.set('limit', String(params.limit));
  if (params.locale && params.locale !== 'all') qs.set('locale', params.locale);
  if (params.emojiId) qs.set('emojiId', params.emojiId);
  if (params.dateFrom) qs.set('dateFrom', params.dateFrom);
  if (params.dateTo) qs.set('dateTo', params.dateTo);
  const query = qs.toString();

  const body = await adminFetchEnvelope<CopyEventItem[]>(
    `/admin/copy-events${query ? `?${query}` : ''}`,
  );
  return {
    data: body.data,
    meta: (body.meta as unknown as AdminLogListMeta) ?? {
      page: 1,
      limit: params.limit ?? 30,
      total: 0,
      totalPages: 1,
    },
  };
}

export async function getCopyEventsSummary(): Promise<CopyEventsSummary> {
  return adminFetch<CopyEventsSummary>('/admin/copy-events/summary');
}

export type SubmissionType =
  | 'new_usage'
  | 'example'
  | 'correction'
  | 'culture_note'
  | 'translation_suggestion';
export type SubmissionStatus = 'pending' | 'approved' | 'rejected' | 'spam';

export interface ReviewItem {
  id: string;
  type: SubmissionType;
  locale: 'zh' | 'en';
  status: SubmissionStatus;
  content: string | null;
  userName: string | null;
  userEmail: string | null;
  emojiId: string | null;
  emojiChar: string | null;
  emojiSlug: string | null;
  createdAt: string;
  adminNote: string | null;
}

export interface ReviewDetail extends ReviewItem {
  emoji: { id: string; emojiChar: string; slug: string; name: string | null } | null;
  updatedAt: string;
}

export interface AdminReviewsListResponse {
  data: ReviewItem[];
  meta: AdminLogListMeta;
}

export interface ReviewsQuery {
  page?: number;
  limit?: number;
  status?: SubmissionStatus | 'all';
  type?: SubmissionType | 'all';
  locale?: 'zh' | 'en' | 'all';
  q?: string;
  emojiId?: string;
}

export async function listReviews(params: ReviewsQuery = {}): Promise<AdminReviewsListResponse> {
  const qs = new URLSearchParams();
  if (params.page && params.page > 1) qs.set('page', String(params.page));
  if (params.limit) qs.set('limit', String(params.limit));
  if (params.status && params.status !== 'all') qs.set('status', params.status);
  if (params.type && params.type !== 'all') qs.set('type', params.type);
  if (params.locale && params.locale !== 'all') qs.set('locale', params.locale);
  if (params.q) qs.set('q', params.q);
  if (params.emojiId) qs.set('emojiId', params.emojiId);
  const query = qs.toString();

  const body = await adminFetchEnvelope<ReviewItem[]>(
    `/admin/reviews${query ? `?${query}` : ''}`,
  );
  return {
    data: body.data,
    meta: (body.meta as unknown as AdminLogListMeta) ?? {
      page: 1,
      limit: params.limit ?? 30,
      total: 0,
      totalPages: 1,
    },
  };
}

export async function getReview(id: string): Promise<ReviewDetail> {
  return adminFetch<ReviewDetail>(`/admin/reviews/${id}`);
}

export async function updateReviewStatus(
  id: string,
  status: SubmissionStatus,
  adminNote?: string,
): Promise<ReviewDetail> {
  return adminFetch<ReviewDetail>(`/admin/reviews/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status, adminNote }),
  });
}

export const SUBMISSION_TYPE_LABELS: Record<SubmissionType, string> = {
  new_usage: '新用法',
  example: '示例',
  correction: '纠错',
  culture_note: '文化注释',
  translation_suggestion: '翻译建议',
};

export const SUBMISSION_STATUS_LABELS: Record<SubmissionStatus, string> = {
  pending: '待审核',
  approved: '已通过',
  rejected: '已拒绝',
  spam: '垃圾',
};

export const SUBMISSION_STATUS_BADGE: Record<SubmissionStatus, string> = {
  pending: 'bg-amber-100 text-amber-700',
  approved: 'bg-green-100 text-green-700',
  rejected: 'bg-red-100 text-red-700',
  spam: 'bg-gray-200 text-gray-600',
};

// ─── SEO Quality Checker (Phase 5C) ──────────────────

export interface SeoQualityIssuesQuery {
  page?: number;
  limit?: number;
  entityType?: 'emoji' | 'category' | 'topic' | 'article' | 'all';
  issueType?: SeoIssueType | 'all';
  severity?: SeoSeverity | 'all';
  locale?: 'zh' | 'en' | 'all';
  q?: string;
}

export interface SeoQualityIssuesResponse {
  data: SeoIssue[];
  meta: { page: number; limit: number; total: number; totalPages: number };
  issuesByType: SeoQualityIssuesByType;
}

export async function getSeoQualityOverview(): Promise<SeoQualityOverview> {
  return adminFetch<SeoQualityOverview>('/admin/seo/quality/overview');
}

export async function runSeoQualityCheck(): Promise<SeoQualityOverview> {
  return adminFetch<SeoQualityOverview>('/admin/seo/quality/run', { method: 'POST' });
}

export async function listSeoQualityIssues(
  params: SeoQualityIssuesQuery = {},
): Promise<SeoQualityIssuesResponse> {
  const qs = new URLSearchParams();
  if (params.page && params.page > 1) qs.set('page', String(params.page));
  if (params.limit) qs.set('limit', String(params.limit));
  if (params.entityType && params.entityType !== 'all') qs.set('entityType', params.entityType);
  if (params.issueType && params.issueType !== 'all') qs.set('issueType', params.issueType);
  if (params.severity && params.severity !== 'all') qs.set('severity', params.severity);
  if (params.locale && params.locale !== 'all') qs.set('locale', params.locale);
  if (params.q) qs.set('q', params.q);
  const query = qs.toString();
  const body = (await adminFetchEnvelope<SeoIssue[]>(
    `/admin/seo/quality/issues${query ? `?${query}` : ''}`,
  )) as unknown as { data: SeoIssue[]; meta?: unknown; issuesByType?: SeoQualityIssuesByType };
  return {
    data: body.data,
    meta: (body.meta as unknown as SeoQualityIssuesResponse['meta']) ?? {
      page: 1,
      limit: params.limit ?? 30,
      total: 0,
      totalPages: 1,
    },
    issuesByType: body.issuesByType ?? ({} as SeoQualityIssuesByType),
  };
}

export async function getInternalLinkSuggestions(
  entityType: 'emoji' | 'category' | 'topic' | 'article',
  id: string,
  locale: 'zh' | 'en' = 'zh',
): Promise<InternalLinkSuggestionResponse> {
  const qs = new URLSearchParams();
  qs.set('entityType', entityType);
  qs.set('id', id);
  qs.set('locale', locale);
  return adminFetch<InternalLinkSuggestionResponse>(
    `/admin/seo/internal-links/suggestions?${qs.toString()}`,
  );
}
