'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/components/AuthProvider';
import {
  getSeoEntity,
  updateSeoEntity,
  SeoEntityDetail,
  SeoEntityType,
  AdminApiError,
} from '@/lib/adminApi';

const VALID_TYPES: SeoEntityType[] = ['emoji', 'category', 'topic', 'article'];
const SEO_WRITE_ROLES = ['super_admin', 'editor', 'seo_manager'];

function LengthHint({ value, min, max }: { value: string; min: number; max: number }) {
  const len = (value ?? '').length;
  const ok = len >= min && len <= max;
  return (
    <span className={`text-[11px] ${ok ? 'text-green-600' : 'text-amber-600'}`}>
      {len} 字符（建议 {min}–{max}）
    </span>
  );
}

export default function SeoEditPage() {
  const params = useParams();
  const entityType = typeof params.entityType === 'string' ? params.entityType : '';
  const id = typeof params.id === 'string' ? params.id : '';
  const { admin } = useAuth();

  const [initial, setInitial] = useState<SeoEntityDetail | null>(null);
  const [zhTitle, setZhTitle] = useState('');
  const [zhDesc, setZhDesc] = useState('');
  const [enTitle, setEnTitle] = useState('');
  const [enDesc, setEnDesc] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [saveSuccess, setSaveSuccess] = useState(false);

  const canManage = !!admin && SEO_WRITE_ROLES.includes(admin.role);

  useEffect(() => {
    if (!VALID_TYPES.includes(entityType as SeoEntityType)) {
      setError(`不支持的实体类型 "${entityType}"`);
      setLoading(false);
      return;
    }
    let active = true;
    (async () => {
      try {
        const data = await getSeoEntity(entityType as SeoEntityType, id);
        if (!active) return;
        setInitial(data);
        setZhTitle(data.translations.zh?.seoTitle ?? '');
        setZhDesc(data.translations.zh?.seoDescription ?? '');
        setEnTitle(data.translations.en?.seoTitle ?? '');
        setEnDesc(data.translations.en?.seoDescription ?? '');
      } catch (err) {
        if (active) {
          setError(err instanceof AdminApiError ? err.message || '加载失败' : '加载失败');
        }
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [entityType, id]);

  const handleSave = async () => {
    if (!initial) return;
    setSaving(true);
    setSaveError('');
    setSaveSuccess(false);
    try {
      const updated = await updateSeoEntity(entityType as SeoEntityType, id, {
        translations: {
          zh: { seoTitle: zhTitle, seoDescription: zhDesc },
          en: { seoTitle: enTitle, seoDescription: enDesc },
        },
      });
      setInitial(updated);
      setZhTitle(updated.translations.zh?.seoTitle ?? '');
      setZhDesc(updated.translations.zh?.seoDescription ?? '');
      setEnTitle(updated.translations.en?.seoTitle ?? '');
      setEnDesc(updated.translations.en?.seoDescription ?? '');
      setSaveSuccess(true);
    } catch (err) {
      setSaveError(
        err instanceof AdminApiError ? err.message || '保存失败' : '保存失败，请稍后重试',
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="text-gray-500">加载中…</div>;
  }
  if (error) {
    return (
      <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded px-3 py-2">
        {error}
      </div>
    );
  }
  if (!initial) return null;

  const backHref = `/admin/seo/${initial.entityType}`;

  return (
    <div className="max-w-4xl">
      <div className="flex items-center justify-between mb-4">
        <div>
          <Link href={backHref} className="text-sm text-blue-600 hover:underline">
            ← 返回 {initial.entityType} SEO 列表
          </Link>
          <h1 className="text-2xl font-bold mb-1">
            🔍 编辑 SEO：{initial.name ?? initial.slug}
          </h1>
          <p className="text-gray-500 text-sm">
            实体类型：{initial.entityType} · slug：<span className="font-mono">{initial.slug}</span> ·
            状态：{initial.status}
          </p>
          {initial.planned && (
            <p className="text-xs text-purple-600 mt-1">{initial.seoNote}</p>
          )}
        </div>
      </div>

      {!canManage && (
        <div className="text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded px-3 py-2 mb-4">
          当前角色（{admin?.role}）仅有只读权限，无法保存修改。
        </div>
      )}

      {saveSuccess && !saveError && (
        <div className="text-sm text-green-700 bg-green-50 border border-green-200 rounded px-3 py-2 mb-4">
          保存成功。
        </div>
      )}
      {saveError && (
        <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded px-3 py-2 mb-4">
          {saveError}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* zh */}
        <div className="bg-white rounded-lg border p-4">
          <h2 className="font-semibold text-gray-800 mb-3">中文 (zh)</h2>
          <label className="block text-xs text-gray-500 mb-1">SEO 标题</label>
          <textarea
            value={zhTitle}
            onChange={(e) => setZhTitle(e.target.value)}
            disabled={!canManage}
            rows={2}
            className="w-full px-3 py-2 border rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50"
            placeholder="建议 10–70 字符"
          />
          <div className="mb-3">
            <LengthHint value={zhTitle} min={10} max={70} />
          </div>

          <label className="block text-xs text-gray-500 mb-1">SEO 描述</label>
          <textarea
            value={zhDesc}
            onChange={(e) => setZhDesc(e.target.value)}
            disabled={!canManage}
            rows={3}
            className="w-full px-3 py-2 border rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50"
            placeholder="建议 50–180 字符"
          />
          <div>
            <LengthHint value={zhDesc} min={50} max={180} />
          </div>
        </div>

        {/* en */}
        <div className="bg-white rounded-lg border p-4">
          <h2 className="font-semibold text-gray-800 mb-3">English (en)</h2>
          <label className="block text-xs text-gray-500 mb-1">SEO Title</label>
          <textarea
            value={enTitle}
            onChange={(e) => setEnTitle(e.target.value)}
            disabled={!canManage}
            rows={2}
            className="w-full px-3 py-2 border rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50"
            placeholder="建议 10–70 字符"
          />
          <div className="mb-3">
            <LengthHint value={enTitle} min={10} max={70} />
          </div>

          <label className="block text-xs text-gray-500 mb-1">SEO Description</label>
          <textarea
            value={enDesc}
            onChange={(e) => setEnDesc(e.target.value)}
            disabled={!canManage}
            rows={3}
            className="w-full px-3 py-2 border rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50"
            placeholder="建议 50–180 字符"
          />
          <div>
            <LengthHint value={enDesc} min={50} max={180} />
          </div>
        </div>
      </div>

      {/* canonical / hreflang preview (read-only) */}
      <div className="bg-white rounded-lg border p-4 mt-4">
        <h2 className="font-semibold text-gray-800 mb-3">Canonical / Hreflang 预览（只读）</h2>
        <div className="space-y-1 text-sm font-mono text-gray-700">
          <div>zh canonical：{initial.canonical.zh}</div>
          <div>en canonical：{initial.canonical.en}</div>
          <div>x-default：{initial.canonical.xdefault}</div>
        </div>
        <div className="mt-3 space-y-1 text-sm">
          {initial.hreflang.map((h) => (
            <div key={h.lang} className="font-mono text-gray-600">
              {`<link rel="alternate" hreflang="${h.lang}" href="${h.href}" />`}
            </div>
          ))}
        </div>
        {!initial.planned && (
          <div className="mt-3">
            <a
              href={initial.previewLinks.zh}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline text-sm mr-4"
            >
              前台预览 (zh)
            </a>
            <a
              href={initial.previewLinks.en}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline text-sm"
            >
              前台预览 (en)
            </a>
          </div>
        )}
      </div>

      <div className="mt-4">
        <button
          onClick={handleSave}
          disabled={!canManage || saving}
          className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm disabled:opacity-40"
        >
          {saving ? '保存中…' : '保存'}
        </button>
      </div>
    </div>
  );
}
