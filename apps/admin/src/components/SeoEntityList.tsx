'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import {
  listSeoEntities,
  SeoEntityListItem,
  SeoEntityType,
  SeoCompleteness,
  SeoLocaleFilter,
  AdminApiError,
  AdminSeoListMeta,
} from '@/lib/adminApi';

const COMPLETENESS_LABEL: Record<string, string> = {
  complete: '完整',
  missingTitle: '缺标题',
  missingDescription: '缺描述',
  missingAny: '全缺',
};

function CompletenessBadge({ value }: { value: string }) {
  const map: Record<string, string> = {
    complete: 'bg-green-100 text-green-700',
    missingTitle: 'bg-amber-100 text-amber-700',
    missingDescription: 'bg-amber-100 text-amber-700',
    missingAny: 'bg-red-100 text-red-700',
  };
  return (
    <span className={`text-xs px-2 py-0.5 rounded ${map[value] ?? 'bg-gray-100 text-gray-600'}`}>
      {COMPLETENESS_LABEL[value] ?? value}
    </span>
  );
}

export function SeoEntityList({
  entityType,
  title,
  description,
}: {
  entityType: SeoEntityType;
  title: string;
  description: string;
}) {
  const [items, setItems] = useState<SeoEntityListItem[]>([]);
  const [meta, setMeta] = useState<AdminSeoListMeta>({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 1,
  });
  const [q, setQ] = useState('');
  const [locale, setLocale] = useState<SeoLocaleFilter>('all');
  const [status, setStatus] = useState('all');
  const [completeness, setCompleteness] = useState<SeoCompleteness>('all');
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchList = useCallback(
    async (p: number) => {
      setLoading(true);
      setError('');
      try {
        const res = await listSeoEntities(entityType, {
          page: p,
          limit: 20,
          q: q.trim() || undefined,
          locale,
          status,
          completeness,
        });
        setItems(res.data);
        setMeta(res.meta);
        setPage(p);
      } catch (err) {
        if (err instanceof AdminApiError) {
          setError(err.message || '加载 SEO 列表失败');
        } else {
          setError('加载 SEO 列表失败，请稍后重试');
        }
      } finally {
        setLoading(false);
      }
    },
    [entityType, q, locale, status, completeness],
  );

  useEffect(() => {
    fetchList(1);
  }, [fetchList]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchList(1);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div>
          <Link href="/admin/seo" className="text-sm text-blue-600 hover:underline">
            ← 返回 SEO 总览
          </Link>
          <h1 className="text-2xl font-bold mb-1">{title}</h1>
          <p className="text-gray-500 text-sm">{description}</p>
        </div>
      </div>

      <form
        onSubmit={handleSearch}
        className="bg-white rounded-lg border p-4 mb-4 flex flex-wrap gap-3 items-end"
      >
        <div className="flex-1 min-w-[180px]">
          <label className="block text-xs text-gray-500 mb-1">关键词</label>
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="名称 / 标题 / slug"
            className="w-full px-3 py-2 border rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1">语言</label>
          <select
            value={locale}
            onChange={(e) => setLocale(e.target.value as SeoLocaleFilter)}
            className="px-3 py-2 border rounded text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">全部语言</option>
            <option value="zh">中文 (zh)</option>
            <option value="en">英文 (en)</option>
          </select>
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1">状态</label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="px-3 py-2 border rounded text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">全部状态</option>
            <option value="published">published</option>
            <option value="draft">draft</option>
            <option value="archived">archived</option>
          </select>
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1">完整度</label>
          <select
            value={completeness}
            onChange={(e) => setCompleteness(e.target.value as SeoCompleteness)}
            className="px-3 py-2 border rounded text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">全部</option>
            <option value="missingTitle">缺标题</option>
            <option value="missingDescription">缺描述</option>
            <option value="missingAny">标题或描述缺失</option>
            <option value="complete">完整</option>
          </select>
        </div>
        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm"
        >
          搜索
        </button>
        <button
          type="button"
          onClick={() => {
            setQ('');
            setLocale('all');
            setStatus('all');
            setCompleteness('all');
            fetchList(1);
          }}
          className="px-4 py-2 border rounded text-sm text-gray-600 hover:bg-gray-50"
        >
          重置
        </button>
      </form>

      {error && (
        <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded px-3 py-2 mb-4">
          {error}
        </div>
      )}

      <div className="bg-white rounded-lg border overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-gray-500 border-b bg-gray-50">
              <th className="px-4 py-3">语言</th>
              <th className="px-4 py-3">名称 / 标题</th>
              <th className="px-4 py-3">slug</th>
              <th className="px-4 py-3">状态</th>
              <th className="px-4 py-3">SEO 标题</th>
              <th className="px-4 py-3">SEO 描述</th>
              <th className="px-4 py-3">完整度</th>
              <th className="px-4 py-3">前台预览</th>
              <th className="px-4 py-3 text-right">操作</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={9} className="px-4 py-8 text-center text-gray-400">
                  加载中…
                </td>
              </tr>
            ) : items.length === 0 ? (
              <tr>
                <td colSpan={9} className="px-4 py-8 text-center text-gray-400">
                  暂无数据
                </td>
              </tr>
            ) : (
              items.map((item) => (
                <tr key={item.id} className="border-b hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <span className="text-xs px-2 py-0.5 rounded bg-gray-100 text-gray-600">
                      {item.locale}
                    </span>
                    {item.planned && (
                      <span className="ml-1 text-xs px-2 py-0.5 rounded bg-purple-100 text-purple-700">
                        规划中
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 max-w-[200px] truncate" title={item.nameOrTitle ?? ''}>
                    {item.nameOrTitle ?? '—'}
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-gray-600">{item.slug || '—'}</td>
                  <td className="px-4 py-3">
                    <span className="text-xs px-2 py-0.5 rounded bg-gray-100 text-gray-600">
                      {item.status ?? '—'}
                    </span>
                  </td>
                  <td className="px-4 py-3 max-w-[220px]">
                    <div className="truncate text-gray-800" title={item.seoTitle ?? ''}>
                      {item.seoTitle || <span className="text-red-400">（空）</span>}
                    </div>
                    <div className="text-[11px] text-gray-400">{item.seoTitleLength} 字符</div>
                  </td>
                  <td className="px-4 py-3 max-w-[260px]">
                    <div className="truncate text-gray-800" title={item.seoDescription ?? ''}>
                      {item.seoDescription || <span className="text-red-400">（空）</span>}
                    </div>
                    <div className="text-[11px] text-gray-400">
                      {item.seoDescriptionLength} 字符
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <CompletenessBadge value={item.completeness} />
                  </td>
                  <td className="px-4 py-3">
                    {item.planned ? (
                      <span className="text-xs text-gray-400">规划中</span>
                    ) : (
                      <a
                        href={item.previewLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline text-xs"
                      >
                        预览
                      </a>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right whitespace-nowrap">
                    <Link
                      href={`/admin/seo/${entityType}/${item.entityId ?? ''}/edit`}
                      className="text-blue-600 hover:underline"
                    >
                      编辑
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {meta.totalPages > 1 && (
        <div className="flex items-center justify-between mt-4 text-sm">
          <div className="text-gray-500">
            共 {meta.total} 条 · 第 {meta.page} / {meta.totalPages} 页
          </div>
          <div className="flex gap-2">
            <button
              disabled={meta.page <= 1}
              onClick={() => fetchList(meta.page - 1)}
              className="px-3 py-1.5 border rounded disabled:opacity-40 hover:bg-gray-50"
            >
              上一页
            </button>
            <button
              disabled={meta.page >= meta.totalPages}
              onClick={() => fetchList(meta.page + 1)}
              className="px-3 py-1.5 border rounded disabled:opacity-40 hover:bg-gray-50"
            >
              下一页
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
