'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  createCategory,
  updateCategory,
  updateCategoryStatus,
  getCategoryTree,
  CategoryTreeNode,
  AdminCategoryDetail,
  CategoryStatus,
  AdminApiError,
} from '@/lib/adminApi';

interface TranslationState {
  name: string;
  description: string;
  seoTitle: string;
  seoDescription: string;
}

interface BaseState {
  slug: string;
  parentId: string;
  iconEmoji: string;
  sortOrder: string;
  status: CategoryStatus;
}

const EMPTY_TRANSLATION: TranslationState = {
  name: '',
  description: '',
  seoTitle: '',
  seoDescription: '',
};

const EMPTY_BASE: BaseState = {
  slug: '',
  parentId: '',
  iconEmoji: '',
  sortOrder: '0',
  status: 'draft',
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

function translationFromDetail(t: AdminCategoryDetail['translations']['zh']): TranslationState {
  if (!t) return { ...EMPTY_TRANSLATION };
  return {
    name: t.name ?? '',
    description: t.description ?? '',
    seoTitle: t.seoTitle ?? '',
    seoDescription: t.seoDescription ?? '',
  };
}

function flattenTree(nodes: CategoryTreeNode[], depth = 0): { value: string; label: string }[] {
  const out: { value: string; label: string }[] = [];
  for (const n of nodes) {
    const indent = depth > 0 ? '　'.repeat(depth) : '';
    out.push({
      value: n.id,
      label: `${indent}${n.iconEmoji ? `${n.iconEmoji} ` : ''}${n.name || n.slug}`,
    });
    if (n.children?.length) {
      out.push(...flattenTree(n.children, depth + 1));
    }
  }
  return out;
}

export function CategoryForm({
  mode,
  categoryId,
  initial,
}: {
  mode: 'create' | 'edit';
  categoryId?: string;
  initial?: AdminCategoryDetail | null;
}) {
  const router = useRouter();
  const [tab, setTab] = useState<'base' | 'zh' | 'en'>('base');
  const [base, setBase] = useState<BaseState>(EMPTY_BASE);
  const [zh, setZh] = useState<TranslationState>(EMPTY_TRANSLATION);
  const [en, setEn] = useState<TranslationState>(EMPTY_TRANSLATION);
  const [parentOptions, setParentOptions] = useState<{ value: string; label: string }[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [statusBusy, setStatusBusy] = useState(false);

  // Load the category tree for the parent selector (exclude self in edit mode).
  useEffect(() => {
    let active = true;
    getCategoryTree('zh', mode === 'edit' ? categoryId : undefined)
      .then((tree) => {
        if (active) setParentOptions(flattenTree(tree));
      })
      .catch(() => undefined);
    return () => {
      active = false;
    };
  }, [mode, categoryId]);

  // Initialize from detail data (edit mode only).
  useEffect(() => {
    if (mode === 'edit' && initial) {
      setBase({
        slug: initial.slug ?? '',
        parentId: initial.parentId ?? '',
        iconEmoji: initial.iconEmoji ?? '',
        sortOrder: String(initial.sortOrder ?? 0),
        status: (initial.status as CategoryStatus) ?? 'draft',
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
    name: t.name.trim(),
    description: t.description.trim() || null,
    seoTitle: t.seoTitle.trim() || null,
    seoDescription: t.seoDescription.trim() || null,
  });

  const handleAutoSlug = () => {
    const source = en.name.trim() || zh.name.trim();
    if (!source) {
      setError('请先填写中文或英文名称，再生成 slug');
      return;
    }
    const slug = slugify(source);
    if (!slug) {
      setError('当前名称无法生成有效 slug（仅支持小写字母、数字和短横线），请手动填写');
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
      setError('slug 只能包含小写字母、数字和短横线（例如 smiling-face）');
      setTab('base');
      return;
    }
    if (!zh.name.trim()) {
      setError('中文 (zh) 名称不能为空');
      setTab('zh');
      return;
    }
    if (!en.name.trim()) {
      setError('英文 (en) 名称不能为空');
      setTab('en');
      return;
    }
    if (base.parentId && base.parentId === categoryId) {
      setError('不能将分类的父级设为自身');
      setTab('base');
      return;
    }

    const sortOrder = parseInt(base.sortOrder, 10);
    if (!Number.isFinite(sortOrder)) {
      setError('排序 (sortOrder) 必须是数字');
      setTab('base');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        slug,
        parentId: base.parentId || null,
        iconEmoji: base.iconEmoji.trim() || null,
        sortOrder,
        status: base.status,
        translations: {
          zh: buildTranslationPayload(zh),
          en: buildTranslationPayload(en),
        },
      };

      if (mode === 'create') {
        const created = await createCategory(payload);
        setSuccess('创建成功，正在跳转…');
        router.push(`/admin/categories/${created.id}/edit`);
      } else if (categoryId) {
        await updateCategory(categoryId, payload);
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

  const handleQuickStatus = async (status: CategoryStatus) => {
    if (!categoryId) return;
    setStatusBusy(true);
    setError('');
    setSuccess('');
    try {
      await updateCategoryStatus(categoryId, status);
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

  const previewLinks = useMemo(() => {
    if (mode !== 'edit' || !initial?.slug) return null;
    return {
      zh: `${SITE_URL}/zh/categories/${initial.slug}/`,
      en: `${SITE_URL}/en/categories/${initial.slug}/`,
    };
  }, [mode, initial]);

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">
          {mode === 'create' ? '+ 新建分类' : '编辑分类'}
        </h1>
        <Link href="/admin/categories" className="text-sm text-blue-600 hover:underline">
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
                  placeholder="smiling-face"
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
            <Field label="图标 Emoji">
              <input
                value={base.iconEmoji}
                onChange={(e) => updateBase('iconEmoji', e.target.value)}
                className="w-full px-3 py-2 border rounded text-sm"
                placeholder="😀"
              />
            </Field>
            <Field label="父级分类">
              <select
                value={base.parentId}
                onChange={(e) => updateBase('parentId', e.target.value)}
                className="w-full px-3 py-2 border rounded text-sm bg-white"
              >
                <option value="">无（顶级分类）</option>
                {parentOptions.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="排序 (sortOrder)">
              <input
                type="number"
                value={base.sortOrder}
                onChange={(e) => updateBase('sortOrder', e.target.value)}
                className="w-full px-3 py-2 border rounded text-sm"
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

          {mode === 'edit' && categoryId && (
            <div className="flex items-center gap-2 ml-2">
              <span className="text-xs text-gray-400">快捷状态:</span>
              {(['published', 'draft', 'archived'] as CategoryStatus[]).map((s) => (
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
            <>
              <a
                href={previewLinks.zh}
                target="_blank"
                rel="noopener noreferrer"
                className="ml-auto text-sm text-gray-500 hover:underline"
              >
                预览前台 (zh) ↗
              </a>
              <a
                href={previewLinks.en}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-gray-500 hover:underline"
              >
                预览前台 (en) ↗
              </a>
            </>
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
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <Field label="名称 (name) *">
        <input
          value={state.name}
          onChange={(e) => onChange('name', e.target.value)}
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
        <Field label="描述 (description)">
          <textarea
            value={state.description}
            onChange={(e) => onChange('description', e.target.value)}
            rows={3}
            className="w-full px-3 py-2 border rounded text-sm"
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
    </div>
  );
}
