'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  createTopic,
  updateTopic,
  updateTopicStatus,
  getTopicEmojiOptions,
  setTopicEmojis,
  AdminTopicDetail,
  TopicStatus,
  TopicEmojiOption,
  AdminApiError,
} from '@/lib/adminApi';

interface TranslationState {
  title: string;
  summary: string;
  content: string;
  seoTitle: string;
  seoDescription: string;
  faqJson: string;
}

interface BaseState {
  slug: string;
  coverImage: string;
  topicType: string;
  sortOrder: string;
  status: TopicStatus;
}

interface BoundEmojiState {
  emojiId: string;
  emojiChar: string;
  name: string | null;
  note: string;
}

const EMPTY_TRANSLATION: TranslationState = {
  title: '',
  summary: '',
  content: '',
  seoTitle: '',
  seoDescription: '',
  faqJson: '[]',
};

const EMPTY_BASE: BaseState = {
  slug: '',
  coverImage: '',
  topicType: '',
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
    throw new Error(`${field} 不是合法的 JSON 格式`);
  }
}

function translationFromDetail(t: AdminTopicDetail['translations']['zh']): TranslationState {
  if (!t) return { ...EMPTY_TRANSLATION };
  return {
    title: t.title ?? '',
    summary: t.summary ?? '',
    content: t.content ?? '',
    seoTitle: t.seoTitle ?? '',
    seoDescription: t.seoDescription ?? '',
    faqJson: jsonToText(t.faqJson),
  };
}

export function TopicForm({
  mode,
  topicId,
  initial,
}: {
  mode: 'create' | 'edit';
  topicId?: string;
  initial?: AdminTopicDetail | null;
}) {
  const router = useRouter();
  const [tab, setTab] = useState<'base' | 'zh' | 'en'>('base');
  const [base, setBase] = useState<BaseState>(EMPTY_BASE);
  const [zh, setZh] = useState<TranslationState>(EMPTY_TRANSLATION);
  const [en, setEn] = useState<TranslationState>(EMPTY_TRANSLATION);
  const [boundEmojis, setBoundEmojis] = useState<BoundEmojiState[]>([]);
  const [emojiOptions, setEmojiOptions] = useState<TopicEmojiOption[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [statusBusy, setStatusBusy] = useState(false);

  // Load emoji options for the binding selector.
  useEffect(() => {
    let active = true;
    getTopicEmojiOptions('zh')
      .then((opts) => {
        if (active) setEmojiOptions(opts);
      })
      .catch(() => undefined);
    return () => {
      active = false;
    };
  }, []);

  // Initialize from detail data (edit mode only).
  useEffect(() => {
    if (mode === 'edit' && initial) {
      setBase({
        slug: initial.slug ?? '',
        coverImage: initial.coverImage ?? '',
        topicType: initial.topicType ?? '',
        sortOrder: String(initial.sortOrder ?? 0),
        status: (initial.status as TopicStatus) ?? 'draft',
      });
      setZh(translationFromDetail(initial.translations.zh));
      setEn(translationFromDetail(initial.translations.en));
      setBoundEmojis(
        (initial.emojis ?? []).map((e) => ({
          emojiId: e.emojiId,
          emojiChar: e.emoji.emojiChar,
          name: e.emoji.name,
          note: e.note ?? '',
        })),
      );
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
    faqJson: t.faqJson.trim() ? parseJsonText(t.faqJson, 'faqJson') : null,
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

  const addEmoji = (emojiId: string) => {
    if (!emojiId) return;
    if (boundEmojis.some((e) => e.emojiId === emojiId)) {
      setError('该 Emoji 已在关联列表中');
      return;
    }
    const opt = emojiOptions.find((o) => o.id === emojiId);
    if (!opt) return;
    setBoundEmojis((prev) => [
      ...prev,
      { emojiId: opt.id, emojiChar: opt.emojiChar, name: opt.name, note: '' },
    ]);
    setError('');
  };

  const removeEmoji = (emojiId: string) => {
    setBoundEmojis((prev) => prev.filter((e) => e.emojiId !== emojiId));
  };

  const moveEmoji = (index: number, dir: -1 | 1) => {
    setBoundEmojis((prev) => {
      const next = [...prev];
      const target = index + dir;
      if (target < 0 || target >= next.length) return prev;
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  };

  const updateEmojiNote = (emojiId: string, note: string) => {
    setBoundEmojis((prev) => prev.map((e) => (e.emojiId === emojiId ? { ...e, note } : e)));
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
      setError('slug 只能包含小写字母、数字和短横线（例如 heart-colors）');
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
      if (zh.faqJson.trim()) parseJsonText(zh.faqJson, 'zh faqJson');
      if (en.faqJson.trim()) parseJsonText(en.faqJson, 'en faqJson');
    } catch (err) {
      setError(err instanceof Error ? err.message : '存在格式错误的 JSON 字段');
      setTab(zh.faqJson.trim() ? 'zh' : 'en');
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
        coverImage: base.coverImage.trim() || null,
        topicType: base.topicType.trim() || null,
        sortOrder,
        status: base.status,
        translations: {
          zh: buildTranslationPayload(zh),
          en: buildTranslationPayload(en),
        },
      };

      if (mode === 'create') {
        const created = await createTopic(payload);
        setSuccess('创建成功，正在跳转…');
        router.push(`/admin/topics/${created.id}/edit`);
      } else if (topicId) {
        await updateTopic(topicId, payload);
        // Persist emoji bindings (bind / unbind / reorder) for this topic.
        await setTopicEmojis(
          topicId,
          boundEmojis.map((e) => ({ emojiId: e.emojiId, note: e.note.trim() || null })),
        );
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

  const handleQuickStatus = async (status: TopicStatus) => {
    if (!topicId) return;
    setStatusBusy(true);
    setError('');
    setSuccess('');
    try {
      await updateTopicStatus(topicId, status);
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
      zh: `${SITE_URL}/zh/topics/${initial.slug}/`,
      en: `${SITE_URL}/en/topics/${initial.slug}/`,
    };
  }, [mode, initial]);

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">{mode === 'create' ? '+ 新建专题' : '编辑专题'}</h1>
        <Link href="/admin/topics" className="text-sm text-blue-600 hover:underline">
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
                  placeholder="heart-colors"
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
            <Field label="专题类型 (topicType)">
              <input
                value={base.topicType}
                onChange={(e) => updateBase('topicType', e.target.value)}
                className="w-full px-3 py-2 border rounded text-sm"
                placeholder="color / holiday / animal …"
              />
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

            {/* Emoji 关联 (bind / unbind / reorder). Available after creation. */}
            <div className="md:col-span-2 border-t pt-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">关联 Emoji（{boundEmojis.length}）</span>
                {mode === 'create' && (
                  <span className="text-xs text-gray-400">创建专题后即可在此关联 Emoji</span>
                )}
              </div>

              {mode === 'edit' ? (
                <>
                  <div className="flex gap-2 mb-3">
                    <select
                      value=""
                      onChange={(e) => {
                        addEmoji(e.target.value);
                        e.target.value = '';
                      }}
                      className="flex-1 px-3 py-2 border rounded text-sm bg-white"
                    >
                      <option value="">+ 选择 Emoji 加入关联…</option>
                      {emojiOptions.map((o) => (
                        <option key={o.id} value={o.id}>
                          {o.emojiChar} {o.name || o.slug}
                        </option>
                      ))}
                    </select>
                  </div>

                  {boundEmojis.length === 0 ? (
                    <p className="text-sm text-gray-400">尚未关联任何 Emoji。</p>
                  ) : (
                    <ul className="space-y-2">
                      {boundEmojis.map((e, i) => (
                        <li
                          key={e.emojiId}
                          className="flex items-center gap-2 border rounded px-3 py-2"
                        >
                          <span className="text-xl w-8 text-center">{e.emojiChar}</span>
                          <span className="text-sm flex-1">
                            {e.name || e.emojiId}
                          </span>
                          <input
                            value={e.note}
                            onChange={(ev) => updateEmojiNote(e.emojiId, ev.target.value)}
                            placeholder="备注 (可选)"
                            className="w-32 px-2 py-1 border rounded text-xs"
                          />
                          <button
                            type="button"
                            onClick={() => moveEmoji(i, -1)}
                            disabled={i === 0}
                            className="px-2 py-1 text-xs border rounded disabled:opacity-40 hover:bg-gray-50"
                            title="上移"
                          >
                            ↑
                          </button>
                          <button
                            type="button"
                            onClick={() => moveEmoji(i, 1)}
                            disabled={i === boundEmojis.length - 1}
                            className="px-2 py-1 text-xs border rounded disabled:opacity-40 hover:bg-gray-50"
                            title="下移"
                          >
                            ↓
                          </button>
                          <button
                            type="button"
                            onClick={() => removeEmoji(e.emojiId)}
                            className="px-2 py-1 text-xs border rounded text-red-600 hover:bg-red-50"
                            title="移除"
                          >
                            ✕
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </>
              ) : (
                <p className="text-sm text-gray-400">
                  请先创建专题，再到编辑页关联 Emoji。
                </p>
              )}
            </div>
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

          {mode === 'edit' && topicId && (
            <div className="flex items-center gap-2 ml-2">
              <span className="text-xs text-gray-400">快捷状态:</span>
              {(['published', 'draft', 'archived'] as TopicStatus[]).map((s) => (
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
  const jsonNote = 'JSON 格式，保存前会校验。数组推荐格式，例如 []。错误格式会被拒绝保存。';
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
            rows={4}
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
      <div className="md:col-span-2">
        <Field label={`FAQ (faqJson) — ${jsonNote}`}>
          <textarea
            value={state.faqJson}
            onChange={(e) => onChange('faqJson', e.target.value)}
            rows={4}
            className="w-full px-3 py-2 border rounded text-sm font-mono"
          />
        </Field>
      </div>
    </div>
  );
}
