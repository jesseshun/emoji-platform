'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/components/AuthProvider';
import {
  createArticle,
  updateArticle,
  updateArticleStatus,
  AdminArticleDetail,
  ArticleStatus,
  AdminApiError,
} from '@/lib/adminApi';

interface TranslationState {
  title: string;
  summary: string;
  content: string;
  seoTitle: string;
  seoDescription: string;
  keywords: string;
}

interface BaseState {
  slug: string;
  coverImage: string;
  status: ArticleStatus;
  publishedAt: string;
}

const EMPTY_TRANSLATION: TranslationState = {
  title: '',
  summary: '',
  content: '',
  seoTitle: '',
  seoDescription: '',
  keywords: '[]',
};

const EMPTY_BASE: BaseState = {
  slug: '',
  coverImage: '',
  status: 'draft',
  publishedAt: '',
};

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function jsonToText(value: unknown): string {
  if (value === null || value === undefined) return '[]';
  if (typeof value === 'string') return value.trim() === '' ? '[]' : value;
  try {
    return JSON.stringify(value, null, 2);
  } catch {
    return '[]';
  }
}

function parseJsonText(value: string, field: string): unknown {
  const trimmed = value.trim();
  if (!trimmed) return null;
  try {
    return JSON.parse(trimmed);
  } catch {
    // keywords accepts a comma-separated list as a fallback.
    const parts = trimmed.split(',').map((s) => s.trim()).filter(Boolean);
    if (parts.length === 0) {
      throw new Error(`${field} 不是合法的 JSON 或逗号分隔列表`);
    }
    return parts;
  }
}

function dateToInput(value: string | null | undefined): string {
  if (!value) return '';
  const d = new Date(value);
  if (isNaN(d.getTime())) return '';
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, '0');
  const day = String(d.getUTCDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function translationFromDetail(t: AdminArticleDetail['translations']['zh']): TranslationState {
  if (!t) return { ...EMPTY_TRANSLATION };
  return {
    title: t.title ?? '',
    summary: t.summary ?? '',
    content: t.content ?? '',
    seoTitle: t.seoTitle ?? '',
    seoDescription: t.seoDescription ?? '',
    keywords: jsonToText(t.keywords),
  };
}

export function ArticleForm({
  mode,
  articleId,
  initial,
}: {
  mode: 'create' | 'edit';
  articleId?: string;
  initial?: AdminArticleDetail | null;
}) {
  const router = useRouter();
  const { admin } = useAuth();
  const [tab, setTab] = useState<'base' | 'zh' | 'en'>('base');
  const [base, setBase] = useState<BaseState>(EMPTY_BASE);
  const [zh, setZh] = useState<TranslationState>(EMPTY_TRANSLATION);
  const [en, setEn] = useState<TranslationState>(EMPTY_TRANSLATION);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [statusBusy, setStatusBusy] = useState(false);

  // Initialize from detail data (edit mode only).
  useEffect(() => {
    if (mode === 'edit' && initial) {
      setBase({
        slug: initial.slug ?? '',
        coverImage: initial.coverImage ?? '',
        status: (initial.status as ArticleStatus) ?? 'draft',
        publishedAt: dateToInput(initial.publishedAt),
      });
      setZh(translationFromDetail(initial.translations.zh));
      setEn(translationFromDetail(initial.translations.en));
    }
  }, [mode, initial]);

  const updateBase = (field: keyof BaseState, value: string) =>
    setBase((prev) => ({ ...prev, [field]: value }));
  const updateTrans = (locale: 'zh' | 'en', field: keyof TranslationState, value: string) => {
    if (locale === 'zh') setZh((prev) => ({ ...prev, [field]: value }));
    else setEn((prev) => ({ ...prev, [field]: value }));
  };

  const buildTranslationPayload = (t: TranslationState) => ({
    title: t.title.trim(),
    summary: t.summary.trim() || null,
    content: t.content.trim() || null,
    seoTitle: t.seoTitle.trim() || null,
    seoDescription: t.seoDescription.trim() || null,
    keywords: t.keywords.trim() ? parseJsonText(t.keywords, 'keywords') : null,
  });

  const handleAutoSlug = () => {
    const source = en.title.trim() || zh.title.trim();
    if (!source) {
      setError('请先填写中文或英文标题，再生成 slug');
      return;
    }
    const slug = slugify(source);
    if (!slug) {
      setError('当前标题无法生成有效 slug（仅支持小写字母、数字和短横线），请手动填写');
      return;
    }
    updateBase('slug', slug);
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const slug = base.slug.trim();
    if (!slug) {
      setError('slug 不能为空');
      setTab('base');
      return;
    }
    if (!/^[a-z0-9-]+$/.test(slug)) {
      setError('slug 只能包含小写字母、数字和短横线（例如 emoji-guide）');
      setTab('base');
      return;
    }
    if (!zh.title.trim()) {
      setError('中文 (zh) 标题不能为空');
      setTab('zh');
      return;
    }
    if (!en.title.trim()) {
      setError('英文 (en) 标题不能为空');
      setTab('en');
      return;
    }

    // Validate JSON fields before submitting.
    try {
      if (zh.keywords.trim()) parseJsonText(zh.keywords, 'zh keywords');
      if (en.keywords.trim()) parseJsonText(en.keywords, 'en keywords');
    } catch (err) {
      setError(err instanceof Error ? err.message : '存在格式错误的 JSON 字段');
      setTab(zh.keywords.trim() ? 'zh' : 'en');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        slug,
        coverImage: base.coverImage.trim() || null,
        authorId: mode === 'create' ? (admin?.id ?? null) : (initial?.authorId ?? null),
        status: base.status,
        publishedAt: base.publishedAt.trim() || null,
        translations: {
          zh: buildTranslationPayload(zh),
          en: buildTranslationPayload(en),
        },
      };

      if (mode === 'create') {
        const created = await createArticle(payload);
        setSuccess('创建成功，正在跳转…');
        router.push(`/admin/articles/${created.id}/edit`);
      } else if (articleId) {
        await updateArticle(articleId, payload);
        setSuccess('保存成功');
      }
    } catch (err) {
      if (err instanceof AdminApiError) {
        setError(err.message || '保存失败');
      } else {
        setError('保存失败，请稍后重试');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleQuickStatus = async (status: ArticleStatus) => {
    if (!articleId) return;
    setStatusBusy(true);
    setError('');
    setSuccess('');
    try {
      await updateArticleStatus(articleId, status);
      setBase((prev) => ({ ...prev, status }));
      setSuccess(`状态已切换为 ${status}`);
    } catch (err) {
      if (err instanceof AdminApiError) {
        setError(err.message || '状态切换失败');
      } else {
        setError('状态切换失败，请稍后重试');
      }
    } finally {
      setStatusBusy(false);
    }
  };

  const authorLabel =
    mode === 'create'
      ? admin?.email ?? '当前管理员'
      : initial?.author?.email ?? initial?.author?.name ?? (initial?.authorId ?? '—');

  const previewLinks = (() => {
    const slug = mode === 'edit' ? initial?.slug : base.slug.trim();
    if (!slug) return null;
    return {
      zh: `${SITE_URL}/zh/articles/${slug}/`,
      en: `${SITE_URL}/en/articles/${slug}/`,
    };
  })();

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">{mode === 'create' ? '+ 新建文章' : '编辑文章'}</h1>
        <Link href="/admin/articles" className="text-sm text-blue-600 hover:underline">
          ← 返回列表
        </Link>
      </div>

      {error && (
        <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded px-3 py-2 mb-3">
          {error}
        </div>
      )}
      {success && (
        <div className="text-sm text-green-700 bg-green-50 border border-green-200 rounded px-3 py-2 mb-3">
          {success}
        </div>
      )}

      <div className="flex gap-2 mb-4 border-b">
        {(['base', 'zh', 'en'] as const).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={`px-4 py-2 text-sm border-b-2 -mb-px ${
              tab === t
                ? 'border-blue-600 text-blue-600 font-medium'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {t === 'base' ? '基础信息' : t === 'zh' ? '中文 (zh)' : 'English (en)'}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-lg border p-5 space-y-4">
        {tab === 'base' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="Slug *">
              <div className="flex gap-2">
                <input
                  value={base.slug}
                  onChange={(e) => updateBase('slug', e.target.value)}
                  className="flex-1 px-3 py-2 border rounded text-sm font-mono"
                  placeholder="emoji-guide"
                />
                <button
                  type="button"
                  onClick={handleAutoSlug}
                  className="px-3 py-2 border rounded text-xs text-gray-600 hover:bg-gray-50 whitespace-nowrap"
                >
                  用英文名生成
                </button>
              </div>
            </Field>
            <Field label="封面图 (coverImage URL)">
              <input
                value={base.coverImage}
                onChange={(e) => updateBase('coverImage', e.target.value)}
                className="w-full px-3 py-2 border rounded text-sm"
                placeholder="https://…"
              />
            </Field>
            <Field label="作者 (authorId)">
              <input
                value={authorLabel}
                readOnly
                disabled
                className="w-full px-3 py-2 border rounded text-sm bg-gray-50 text-gray-500"
                title={initial?.authorId ?? undefined}
              />
            </Field>
            <Field label="状态">
              <select
                value={base.status}
                onChange={(e) => updateBase('status', e.target.value)}
                className="w-full px-3 py-2 border rounded text-sm bg-white"
              >
                <option value="draft">draft</option>
                <option value="published">published</option>
                <option value="archived">archived</option>
              </select>
            </Field>
            <Field label="发布时间 (publishedAt)">
              <input
                type="date"
                value={base.publishedAt}
                onChange={(e) => updateBase('publishedAt', e.target.value)}
                className="w-full px-3 py-2 border rounded text-sm"
              />
              <p className="text-xs text-gray-400 mt-1">
                留空表示未设置；发布状态下若留空，保存时会自动设为当前时间。
              </p>
            </Field>
          </div>
        )}

        {(tab === 'zh' || tab === 'en') && (
          <TranslationFields
            locale={tab}
            state={tab === 'zh' ? zh : en}
            onChange={(field, value) => updateTrans(tab, field, value)}
          />
        )}

        <div className="flex items-center gap-3 pt-2 border-t">
          <button
            type="submit"
            disabled={submitting}
            className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm disabled:opacity-50"
          >
            {submitting ? '保存中…' : mode === 'create' ? '创建' : '保存'}
          </button>

          {mode === 'edit' && articleId && (
            <div className="flex items-center gap-2 ml-2">
              <span className="text-xs text-gray-400">快捷状态:</span>
              {(['published', 'draft', 'archived'] as ArticleStatus[]).map((s) => (
                <button
                  key={s}
                  type="button"
                  disabled={statusBusy}
                  onClick={() => handleQuickStatus(s)}
                  className="px-3 py-1.5 border rounded text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                >
                  {s}
                </button>
              ))}
            </div>
          )}

          {mode === 'edit' && previewLinks && (
            <span
              className="ml-auto text-sm text-gray-400"
              title="前台文章页（/zh/articles/ 与 /en/articles/）将在后续阶段实现"
            >
              预览前台（未实现）↗
            </span>
          )}
        </div>
      </form>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="block text-xs text-gray-500 mb-1">{label}</span>
      {children}
    </label>
  );
}

function TranslationFields({
  locale,
  state,
  onChange,
}: {
  locale: 'zh' | 'en';
  state: TranslationState;
  onChange: (field: keyof TranslationState, value: string) => void;
}) {
  const jsonNote =
    'JSON 格式，保存前会校验；也支持逗号分隔列表（如 a, b, c）。错误格式会被拒绝保存。';
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <Field label="标题 (title) *">
        <input
          value={state.title}
          onChange={(e) => onChange('title', e.target.value)}
          className="w-full px-3 py-2 border rounded text-sm"
        />
      </Field>
      <Field label="SEO 标题 (seoTitle)">
        <input
          value={state.seoTitle}
          onChange={(e) => onChange('seoTitle', e.target.value)}
          className="w-full px-3 py-2 border rounded text-sm"
        />
      </Field>
      <div className="md:col-span-2">
        <Field label="摘要 (summary)">
          <textarea
            value={state.summary}
            onChange={(e) => onChange('summary', e.target.value)}
            rows={2}
            className="w-full px-3 py-2 border rounded text-sm"
          />
        </Field>
      </div>
      <div className="md:col-span-2">
        <Field label="正文 (content)">
          <textarea
            value={state.content}
            onChange={(e) => onChange('content', e.target.value)}
            rows={6}
            className="w-full px-3 py-2 border rounded text-sm font-mono"
          />
        </Field>
      </div>
      <div className="md:col-span-2">
        <Field label="SEO 描述 (seoDescription)">
          <textarea
            value={state.seoDescription}
            onChange={(e) => onChange('seoDescription', e.target.value)}
            rows={2}
            className="w-full px-3 py-2 border rounded text-sm"
          />
        </Field>
      </div>
      <div className="md:col-span-2">
        <Field label={`关键词 (keywords) — ${jsonNote}`}>
          <textarea
            value={state.keywords}
            onChange={(e) => onChange('keywords', e.target.value)}
            rows={3}
            className="w-full px-3 py-2 border rounded text-sm font-mono"
          />
        </Field>
      </div>
    </div>
  );
}
