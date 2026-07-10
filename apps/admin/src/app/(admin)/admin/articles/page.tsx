'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/components/AuthProvider';
import {
  listArticles,
  AdminArticleListItem,
  AdminArticleListMeta,
  AdminApiError,
} from '@/lib/adminApi';

function formatDate(value: string | null): string {
  if (!value) return '—';
  const d = new Date(value);
  if (isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('zh-CN', { hour12: false });
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    published: 'bg-green-100 text-green-700',
    draft: 'bg-amber-100 text-amber-700',
    archived: 'bg-gray-100 text-gray-600',
  };
  return (
    <span className={`text-xs px-2 py-0.5 rounded ${map[status] ?? 'bg-gray-100 text-gray-600'}`}>
      {status}
    </span>
  );
}

export default function AdminArticlesPage() {
  const { admin } = useAuth();
  const [items, setItems] = useState<AdminArticleListItem[]>([]);
  const [meta, setMeta] = useState<AdminArticleListMeta>({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 1,
  });
  const [q, setQ] = useState('');
  const [status, setStatus] = useState('all');
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchList = useCallback(
    async (p: number) => {
      setLoading(true);
      setError('');
      try {
        const res = await listArticles({
          page: p,
          limit: 20,
          q: q.trim() || undefined,
          status,
        });
        setItems(res.data);
        setMeta(res.meta);
        setPage(p);
      } catch (err) {
        if (err instanceof AdminApiError) {
          setError(err.message || '加载文章列表失败');
        } else {
          setError('加载文章列表失败，请稍后重试');
        }
      } finally {
        setLoading(false);
      }
    },
    [q, status],
  );

  useEffect(() => {
    fetchList(1);
  }, [fetchList]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchList(1);
  };

  const canManage = admin?.role === 'super_admin' || admin?.role === 'editor';

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-2xl font-bold mb-1">📄 文章管理</h1>
          <p className="text-gray-500 text-sm">管理平台文章内容（标题、摘要、正文、SEO 与关键词）。</p>
        </div>
        {canManage && (
          <Link
            href="/admin/articles/create"
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm"
          >
            + 新建文章
          </Link>
        )}
      </div>

      <form
        onSubmit={handleSearch}
        className="bg-white rounded-lg border p-4 mb-4 flex flex-wrap gap-3 items-end"
      >
        <div className="flex-1 min-w-[200px]">
          <label className="block text-xs text-gray-500 mb-1">关键词</label>
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="slug / 标题"
            className="w-full px-3 py-2 border rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
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
            setStatus('all');
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
              <th className="px-4 py-3">Slug</th>
              <th className="px-4 py-3">中文标题</th>
              <th className="px-4 py-3">英文标题</th>
              <th className="px-4 py-3">状态</th>
              <th className="px-4 py-3">发布时间</th>
              <th className="px-4 py-3">作者</th>
              <th className="px-4 py-3">更新时间</th>
              <th className="px-4 py-3 text-right">操作</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={8} className="px-4 py-8 text-center text-gray-400">
                  加载中…
                </td>
              </tr>
            ) : items.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-4 py-8 text-center text-gray-400">
                  暂无数据
                </td>
              </tr>
            ) : (
              items.map((item) => (
                <tr key={item.id} className="border-b hover:bg-gray-50">
                  <td className="px-4 py-3 font-mono text-xs text-gray-600">{item.slug}</td>
                  <td className="px-4 py-3">{item.translations.zh.title || '—'}</td>
                  <td className="px-4 py-3">{item.translations.en.title || '—'}</td>
                  <td className="px-4 py-3">
                    <StatusBadge status={item.status} />
                  </td>
                  <td className="px-4 py-3 text-gray-500 text-xs">{formatDate(item.publishedAt)}</td>
                  <td className="px-4 py-3 text-gray-500 text-xs">
                    {item.author?.email || item.author?.name || '—'}
                  </td>
                  <td className="px-4 py-3 text-gray-500 text-xs">{formatDate(item.updatedAt)}</td>
                  <td className="px-4 py-3 text-right whitespace-nowrap">
                    <Link
                      href={`/admin/articles/${item.id}/edit`}
                      className="text-blue-600 hover:underline mr-3"
                    >
                      编辑
                    </Link>
                    <span
                      className="text-gray-300 cursor-not-allowed"
                      title="前台文章页（/zh/articles/ 与 /en/articles/）将在后续阶段实现"
                    >
                      预览
                    </span>
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
