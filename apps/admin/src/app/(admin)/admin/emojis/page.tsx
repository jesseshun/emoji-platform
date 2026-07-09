'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/components/AuthProvider';
import {
  listEmojis,
  getCategoryOptions,
  CategoryOption,
  AdminEmojiListItem,
  AdminEmojiListMeta,
  AdminApiError,
} from '@/lib/adminApi';

function formatDate(value: string): string {
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

export default function AdminEmojisPage() {
  const { admin } = useAuth();
  const [items, setItems] = useState<AdminEmojiListItem[]>([]);
  const [meta, setMeta] = useState<AdminEmojiListMeta>({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 1,
  });
  const [categories, setCategories] = useState<CategoryOption[]>([]);
  const [q, setQ] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [status, setStatus] = useState('all');
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Load category options once for the filter dropdown.
  useEffect(() => {
    let active = true;
    getCategoryOptions('zh')
      .then((opts) => {
        if (active) setCategories(opts);
      })
      .catch(() => {
        /* filter dropdown is optional; ignore failure */
      });
    return () => {
      active = false;
    };
  }, []);

  const fetchList = useCallback(
    async (p: number) => {
      setLoading(true);
      setError('');
      try {
        const res = await listEmojis({
          page: p,
          limit: 20,
          q: q.trim() || undefined,
          categoryId: categoryId || undefined,
          status,
        });
        setItems(res.data);
        setMeta(res.meta);
        setPage(p);
      } catch (err) {
        if (err instanceof AdminApiError) {
          setError(err.message || '加载表情列表失败');
        } else {
          setError('加载表情列表失败，请稍后重试');
        }
      } finally {
        setLoading(false);
      }
    },
    [q, categoryId, status],
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
          <h1 className="text-2xl font-bold mb-1">😊 表情管理</h1>
          <p className="text-gray-500 text-sm">管理平台全部 Emoji 表情数据。</p>
        </div>
        {canManage && (
          <Link
            href="/admin/emojis/create"
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm"
          >
            + 新建 Emoji
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
            placeholder="emojiChar / slug / 名称"
            className="w-full px-3 py-2 border rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1">分类</label>
          <select
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            className="px-3 py-2 border rounded text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">全部分类</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.iconEmoji ? `${c.iconEmoji} ` : ''}
                {c.name || c.slug}
              </option>
            ))}
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
            setCategoryId('');
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
              <th className="px-4 py-3">字符</th>
              <th className="px-4 py-3">Slug</th>
              <th className="px-4 py-3">分类</th>
              <th className="px-4 py-3">状态</th>
              <th className="px-4 py-3">翻译 (zh/en)</th>
              <th className="px-4 py-3">更新时间</th>
              <th className="px-4 py-3 text-right">操作</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-gray-400">
                  加载中…
                </td>
              </tr>
            ) : items.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-gray-400">
                  暂无数据
                </td>
              </tr>
            ) : (
              items.map((item) => (
                <tr key={item.id} className="border-b hover:bg-gray-50">
                  <td className="px-4 py-3 text-2xl">{item.emojiChar || '—'}</td>
                  <td className="px-4 py-3 font-mono text-xs text-gray-600">{item.slug}</td>
                  <td className="px-4 py-3">
                    {item.category ? (
                      <span>
                        {item.category.iconEmoji ? `${item.category.iconEmoji} ` : ''}
                        {item.category.name || item.category.slug}
                      </span>
                    ) : (
                      '—'
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={item.status} />
                  </td>
                  <td className="px-4 py-3 text-xs">
                    <div className="flex gap-2">
                      <span
                        className={item.translations.zh.complete ? 'text-green-600' : 'text-gray-400'}
                        title="中文翻译"
                      >
                        zh {item.translations.zh.complete ? '✓' : '✗'}
                      </span>
                      <span
                        className={item.translations.en.complete ? 'text-green-600' : 'text-gray-400'}
                        title="英文翻译"
                      >
                        en {item.translations.en.complete ? '✓' : '✗'}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-500 text-xs">{formatDate(item.updatedAt)}</td>
                  <td className="px-4 py-3 text-right whitespace-nowrap">
                    <Link
                      href={`/admin/emojis/${item.id}/edit`}
                      className="text-blue-600 hover:underline mr-3"
                    >
                      编辑
                    </Link>
                    <a
                      href={item.previewLinks.zh}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-500 hover:underline mr-2"
                    >
                      预览
                    </a>
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
