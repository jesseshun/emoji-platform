'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  createEmoji,
  updateEmoji,
  updateEmojiStatus,
  getCategoryOptions,
  CategoryOption,
  AdminEmojiDetail,
  EmojiStatus,
  ReviewStatus,
  AdminApiError,
} from '@/lib/adminApi';

interface TranslationState {
  name: string;
  shortName: string;
  oneLineMeaning: string;
  meaning: string;
  usageNotes: string;
  formalUsageNotes: string;
  informalUsageNotes: string;
  socialUsageNotes: string;
  examples: string;
  keywords: string;
  faqJson: string;
  seoTitle: string;
  seoDescription: string;
  status: EmojiStatus;
  reviewStatus: ReviewStatus;
}

interface BaseState {
  emojiChar: string;
  slug: string;
  unicodeCodepoint: string;
  htmlDecimal: string;
  htmlHex: string;
  shortcode: string;
  emojiVersion: string;
  unicodeVersion: string;
  categoryId: string;
  status: EmojiStatus;
  manualWeight: string;
}

const EMPTY_TRANSLATION: TranslationState = {
  name: '',
  shortName: '',
  oneLineMeaning: '',
  meaning: '',
  usageNotes: '',
  formalUsageNotes: '',
  informalUsageNotes: '',
  socialUsageNotes: '',
  examples: '[]',
  keywords: '[]',
  faqJson: '[]',
  seoTitle: '',
  seoDescription: '',
  status: 'draft',
  reviewStatus: 'pending',
};

const EMPTY_BASE: BaseState = {
  emojiChar: '',
  slug: '',
  unicodeCodepoint: '',
  htmlDecimal: '',
  htmlHex: '',
  shortcode: '',
  emojiVersion: '',
  unicodeVersion: '',
  categoryId: '',
  status: 'draft',
  manualWeight: '0',
};

function jsonToText(value: unknown): string {
  if (value === undefined || value === null) return '[]';
  if (typeof value === 'string') return value;
  try {
    return JSON.stringify(value, null, 2);
  } catch {
    return '[]';
  }
}

function translationFromDetail(t: AdminEmojiDetail['translations']['zh']): TranslationState {
  if (!t) return { ...EMPTY_TRANSLATION };
  return {
    name: t.name ?? '',
    shortName: t.shortName ?? '',
    oneLineMeaning: t.oneLineMeaning ?? '',
    meaning: t.meaning ?? '',
    usageNotes: t.usageNotes ?? '',
    formalUsageNotes: t.formalUsageNotes ?? '',
    informalUsageNotes: t.informalUsageNotes ?? '',
    socialUsageNotes: t.socialUsageNotes ?? '',
    examples: jsonToText(t.examples),
    keywords: jsonToText(t.keywords),
    faqJson: jsonToText(t.faqJson),
    seoTitle: t.seoTitle ?? '',
    seoDescription: t.seoDescription ?? '',
    status: (t.status as EmojiStatus) ?? 'draft',
    reviewStatus: (t.reviewStatus as ReviewStatus) ?? 'pending',
  };
}

function parseJsonText(text: string, field: string): unknown {
  const trimmed = text.trim();
  if (trimmed === '') return undefined;
  return JSON.parse(trimmed); // throws on invalid
}

export function EmojiForm({
  mode,
  emojiId,
  initial,
}: {
  mode: 'create' | 'edit';
  emojiId?: string;
  initial?: AdminEmojiDetail | null;
}) {
  const router = useRouter();
  const [tab, setTab] = useState<'base' | 'zh' | 'en'>('base');
  const [base, setBase] = useState<BaseState>(EMPTY_BASE);
  const [zh, setZh] = useState<TranslationState>(EMPTY_TRANSLATION);
  const [en, setEn] = useState<TranslationState>(EMPTY_TRANSLATION);
  const [categories, setCategories] = useState<CategoryOption[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [jsonError, setJsonError] = useState('');
  const [statusBusy, setStatusBusy] = useState(false);

  useEffect(() => {
    let active = true;
    getCategoryOptions('zh')
      .then((opts) => active && setCategories(opts))
      .catch(() => undefined);
    return () => {
      active = false;
    };
  }, []);

  // Initialize from detail data (edit mode only).
  useEffect(() => {
    if (mode === 'edit' && initial) {
      setBase({
        emojiChar: initial.emojiChar ?? '',
        slug: initial.slug ?? '',
        unicodeCodepoint: initial.unicodeCodepoint ?? '',
        htmlDecimal: initial.htmlDecimal ?? '',
        htmlHex: initial.htmlHex ?? '',
        shortcode: initial.shortcode ?? '',
        emojiVersion: initial.emojiVersion ?? '',
        unicodeVersion: initial.unicodeVersion ?? '',
        categoryId: initial.categoryId ?? '',
        status: (initial.status as EmojiStatus) ?? 'draft',
        manualWeight: String(initial.manualWeight ?? 0),
      });
      setZh(translationFromDetail(initial.translations.zh));
      setEn(translationFromDetail(initial.translations.en));
    }
  }, [mode, initial]);

  const updateBase = (field: keyof BaseState, value: string) =>
    setBase((prev) => ({ ...prev, [field]: value }));
  const updateTrans = (
    locale: 'zh' | 'en',
    field: keyof TranslationState,
    value: string,
  ) => {
    if (locale === 'zh') setZh((prev) => ({ ...prev, [field]: value }));
    else setEn((prev) => ({ ...prev, [field]: value }));
  };

  const buildTranslationPayload = (t: TranslationState) => ({
    name: t.name,
    shortName: t.shortName || null,
    oneLineMeaning: t.oneLineMeaning || null,
    meaning: t.meaning || null,
    usageNotes: t.usageNotes || null,
    formalUsageNotes: t.formalUsageNotes || null,
    informalUsageNotes: t.informalUsageNotes || null,
    socialUsageNotes: t.socialUsageNotes || null,
    examples: t.examples.trim() ? parseJsonText(t.examples, 'examples') : undefined,
    keywords: t.keywords.trim() ? parseJsonText(t.keywords, 'keywords') : undefined,
    faqJson: t.faqJson.trim() ? parseJsonText(t.faqJson, 'faqJson') : undefined,
    seoTitle: t.seoTitle || null,
    seoDescription: t.seoDescription || null,
    status: t.status,
    reviewStatus: t.reviewStatus,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setJsonError('');

    if (!base.emojiChar.trim()) {
      setError('emojiChar 不能为空');
      setTab('base');
      return;
    }
    if (!base.slug.trim()) {
      setError('slug 不能为空');
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

    // Validate JSON fields before submitting.
    try {
      if (zh.examples.trim()) parseJsonText(zh.examples, 'zh examples');
      if (zh.keywords.trim()) parseJsonText(zh.keywords, 'zh keywords');
      if (zh.faqJson.trim()) parseJsonText(zh.faqJson, 'zh faqJson');
      if (en.examples.trim()) parseJsonText(en.examples, 'en examples');
      if (en.keywords.trim()) parseJsonText(en.keywords, 'en keywords');
      if (en.faqJson.trim()) parseJsonText(en.faqJson, 'en faqJson');
    } catch {
      setJsonError('存在格式错误的 JSON 字段，请检查 examples / keywords / faqJson 后再保存。');
      setTab('zh');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        emojiChar: base.emojiChar.trim(),
        slug: base.slug.trim(),
        unicodeCodepoint: base.unicodeCodepoint.trim() || null,
        htmlDecimal: base.htmlDecimal.trim() || null,
        htmlHex: base.htmlHex.trim() || null,
        shortcode: base.shortcode.trim() || null,
        emojiVersion: base.emojiVersion.trim() || null,
        unicodeVersion: base.unicodeVersion.trim() || null,
        categoryId: base.categoryId || null,
        status: base.status,
        manualWeight: parseInt(base.manualWeight, 10) || 0,
        translations: {
          zh: buildTranslationPayload(zh),
          en: buildTranslationPayload(en),
        },
      };

      if (mode === 'create') {
        const created = await createEmoji(payload);
        setSuccess('创建成功，正在跳转…');
        router.push(`/admin/emojis/${created.id}/edit`);
      } else if (emojiId) {
        await updateEmoji(emojiId, payload);
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

  const handleQuickStatus = async (status: EmojiStatus) => {
    if (!emojiId) return;
    setStatusBusy(true);
    setError('');
    setSuccess('');
    try {
      await updateEmojiStatus(emojiId, status);
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

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">
          {mode === 'create' ? '+ 新建 Emoji' : '编辑 Emoji'}
        </h1>
        <Link href="/admin/emojis" className="text-sm text-blue-600 hover:underline">
          ← 返回列表
        </Link>
      </div>

      {error && (
        <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded px-3 py-2 mb-3">
          {error}
        </div>
      )}
      {jsonError && (
        <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded px-3 py-2 mb-3">
          {jsonError}
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
            <Field label="Emoji 字符 *">
              <input
                value={base.emojiChar}
                onChange={(e) => updateBase('emojiChar', e.target.value)}
                className="w-full px-3 py-2 border rounded text-sm"
                placeholder="😀"
              />
            </Field>
            <Field label="Slug *">
              <input
                value={base.slug}
                onChange={(e) => updateBase('slug', e.target.value)}
                className="w-full px-3 py-2 border rounded text-sm font-mono"
                placeholder="grinning-face"
              />
            </Field>
            <Field label="Unicode">
              <input
                value={base.unicodeCodepoint}
                onChange={(e) => updateBase('unicodeCodepoint', e.target.value)}
                className="w-full px-3 py-2 border rounded text-sm"
                placeholder="U+1F600"
              />
            </Field>
            <Field label="HTML Decimal">
              <input
                value={base.htmlDecimal}
                onChange={(e) => updateBase('htmlDecimal', e.target.value)}
                className="w-full px-3 py-2 border rounded text-sm"
              />
            </Field>
            <Field label="HTML Hex">
              <input
                value={base.htmlHex}
                onChange={(e) => updateBase('htmlHex', e.target.value)}
                className="w-full px-3 py-2 border rounded text-sm"
              />
            </Field>
            <Field label="Shortcode">
              <input
                value={base.shortcode}
                onChange={(e) => updateBase('shortcode', e.target.value)}
                className="w-full px-3 py-2 border rounded text-sm"
                placeholder=":grinning:"
              />
            </Field>
            <Field label="Emoji 版本">
              <input
                value={base.emojiVersion}
                onChange={(e) => updateBase('emojiVersion', e.target.value)}
                className="w-full px-3 py-2 border rounded text-sm"
              />
            </Field>
            <Field label="Unicode 版本">
              <input
                value={base.unicodeVersion}
                onChange={(e) => updateBase('unicodeVersion', e.target.value)}
                className="w-full px-3 py-2 border rounded text-sm"
              />
            </Field>
            <Field label="分类">
              <select
                value={base.categoryId}
                onChange={(e) => updateBase('categoryId', e.target.value)}
                className="w-full px-3 py-2 border rounded text-sm bg-white"
              >
                <option value="">未分类</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.iconEmoji ? `${c.iconEmoji} ` : ''}
                    {c.name || c.slug}
                  </option>
                ))}
              </select>
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
            <Field label="排序权重 (manualWeight)">
              <input
                type="number"
                value={base.manualWeight}
                onChange={(e) => updateBase('manualWeight', e.target.value)}
                className="w-full px-3 py-2 border rounded text-sm"
              />
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

          {mode === 'edit' && emojiId && (
            <div className="flex items-center gap-2 ml-2">
              <span className="text-xs text-gray-400">快捷状态:</span>
              {(['published', 'draft', 'archived'] as EmojiStatus[]).map((s) => (
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

          {mode === 'edit' && initial?.previewLinks && (
            <a
              href={initial.previewLinks.zh}
              target="_blank"
              rel="noopener noreferrer"
              className="ml-auto text-sm text-gray-500 hover:underline"
            >
              预览前台 (zh) ↗
            </a>
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
  const jsonNote = 'JSON 格式，保存前会校验。数组推荐格式，例如 []。错误格式会被拒绝保存。';
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <Field label="名称 (name) *">
        <input
          value={state.name}
          onChange={(e) => onChange('name', e.target.value)}
          className="w-full px-3 py-2 border rounded text-sm"
        />
      </Field>
      <Field label="简称 (shortName)">
        <input
          value={state.shortName}
          onChange={(e) => onChange('shortName', e.target.value)}
          className="w-full px-3 py-2 border rounded text-sm"
        />
      </Field>
      <Field label="一句话含义 (oneLineMeaning)">
        <input
          value={state.oneLineMeaning}
          onChange={(e) => onChange('oneLineMeaning', e.target.value)}
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
        <Field label="含义 (meaning)">
          <textarea
            value={state.meaning}
            onChange={(e) => onChange('meaning', e.target.value)}
            rows={3}
            className="w-full px-3 py-2 border rounded text-sm"
          />
        </Field>
      </div>
      <div className="md:col-span-2">
        <Field label="使用说明 (usageNotes)">
          <textarea
            value={state.usageNotes}
            onChange={(e) => onChange('usageNotes', e.target.value)}
            rows={2}
            className="w-full px-3 py-2 border rounded text-sm"
          />
        </Field>
      </div>
      <Field label="正式场景说明 (formalUsageNotes)">
        <textarea
          value={state.formalUsageNotes}
          onChange={(e) => onChange('formalUsageNotes', e.target.value)}
          rows={2}
          className="w-full px-3 py-2 border rounded text-sm"
        />
      </Field>
      <Field label="非正式场景说明 (informalUsageNotes)">
        <textarea
          value={state.informalUsageNotes}
          onChange={(e) => onChange('informalUsageNotes', e.target.value)}
          rows={2}
          className="w-full px-3 py-2 border rounded text-sm"
        />
      </Field>
      <Field label="社交场景说明 (socialUsageNotes)">
        <textarea
          value={state.socialUsageNotes}
          onChange={(e) => onChange('socialUsageNotes', e.target.value)}
          rows={2}
          className="w-full px-3 py-2 border rounded text-sm"
        />
      </Field>
      <Field label="SEO 描述 (seoDescription)">
        <textarea
          value={state.seoDescription}
          onChange={(e) => onChange('seoDescription', e.target.value)}
          rows={2}
          className="w-full px-3 py-2 border rounded text-sm"
        />
      </Field>
      <div className="md:col-span-2">
        <Field label={`示例 (examples) — ${jsonNote}`}>
          <textarea
            value={state.examples}
            onChange={(e) => onChange('examples', e.target.value)}
            rows={4}
            className="w-full px-3 py-2 border rounded text-sm font-mono text-xs"
            placeholder="[]"
          />
        </Field>
      </div>
      <div className="md:col-span-2">
        <Field label={`关键词 (keywords) — ${jsonNote}`}>
          <textarea
            value={state.keywords}
            onChange={(e) => onChange('keywords', e.target.value)}
            rows={3}
            className="w-full px-3 py-2 border rounded text-sm font-mono text-xs"
            placeholder="[]"
          />
        </Field>
      </div>
      <div className="md:col-span-2">
        <Field label={`FAQ (faqJson) — ${jsonNote}`}>
          <textarea
            value={state.faqJson}
            onChange={(e) => onChange('faqJson', e.target.value)}
            rows={4}
            className="w-full px-3 py-2 border rounded text-sm font-mono text-xs"
            placeholder="[]"
          />
        </Field>
      </div>
      <Field label="翻译状态 (status)">
        <select
          value={state.status}
          onChange={(e) => onChange('status', e.target.value)}
          className="w-full px-3 py-2 border rounded text-sm bg-white"
        >
          <option value="draft">draft</option>
          <option value="published">published</option>
          <option value="archived">archived</option>
        </select>
      </Field>
      <Field label="审核状态 (reviewStatus)">
        <select
          value={state.reviewStatus}
          onChange={(e) => onChange('reviewStatus', e.target.value)}
          className="w-full px-3 py-2 border rounded text-sm bg-white"
        >
          <option value="pending">pending</option>
          <option value="approved">approved</option>
          <option value="rejected">rejected</option>
          <option value="needs_edit">needs_edit</option>
        </select>
      </Field>
    </div>
  );
}
