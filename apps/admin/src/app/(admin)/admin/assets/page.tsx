'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/components/AuthProvider';
import {
  listAssets,
  AdminAssetListItem,
  AdminAssetListMeta,
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

function sourceLabel(item: AdminAssetListItem): string {
  return item.fileUrl || item.localPath || '—';
}

export default function AdminAssetsPage() {
  const { admin } = useAuth();
  const [items, setItems] = useState<AdminAssetListItem[]>([]);
  const [meta, setMeta] = useState<AdminAssetListMeta>({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 1,
  });
  const [q, setQ] = useState('');
  const [provider, setProvider] = useState('all');
  const [fileType, setFileType] = useState('all');
  const [status, setStatus] = useState('all');
  const [isDownloadable, setIsDownloadable] = useState('all');
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchList = useCallback(
    async (p: number) => {
      setLoading(true);
      setError('');
      try {
        const res = await listAssets({
          page: p,
          limit: 20,
          q: q.trim() || undefined,
          provider,
          fileType,
          status,
          isDownloadable,
        });
        setItems(res.data);
        setMeta(res.meta);
        setPage(p);
      } catch (err) {
        if (err instanceof AdminApiError) {
          setError(err.message || '加载素材列表失败');
        } else {
          setError('加载素材列表失败，请稍后重试');
        }
      } finally {
        setLoading(false);
      }
    },
    [q, provider, fileType, status, isDownloadable],
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
          <h1 className="text-2xl font-bold mb-1">🖼️ 素材 / 授权管理</h1>
          <p className="text-gray-500 text-sm">
            管理 Emoji 的图片资源与授权信息（provider / fileType / license / attribution）。
          </p>
        </div>
        {canManage && (
          <Link
            href="/admin/assets/create"
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm"
          >
            + 新建素材
          </Link>
        )}
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
            placeholder="provider / license / emoji"
            className="w-full px-3 py-2 border rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1">Provider</label>
          <select
            value={provider}
            onChange={(e) => setProvider(e.target.value)}
            className="px-3 py-2 border rounded text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">全部</option>
            <option value="noto">noto</option>
            <option value="openmoji">openmoji</option>
            <option value="twemoji">twemoji</option>
            <option value="custom">custom</option>
          </select>
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1">File Type</label>
          <select
            value={fileType}
            onChange={(e) => setFileType(e.target.value)}
            className="px-3 py-2 border rounded text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">全部</option>
            <option value="svg">svg</option>
            <option value="png">png</option>
            <option value="webp">webp</option>
            <option value="gif">gif</option>
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
          <label className="block text-xs text-gray-500 mb-1">可下载</label>
          <select
            value={isDownloadable}
            onChange={(e) => setIsDownloadable(e.target.value)}
            className="px-3 py-2 border rounded text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">全部</option>
            <option value="true">可下载</option>
            <option value="false">不可下载</option>
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
            setProvider('all');
            setFileType('all');
            setStatus('all');
            setIsDownloadable('all');
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
              <th className="px-4 py-3">Emoji</th>
              <th className="px-4 py-3">Provider</th>
              <th className="px-4 py-3">File Type</th>
              <th className="px-4 py-3">来源 (URL / Path)</th>
              <th className="px-4 py-3">License</th>
              <th className="px-4 py-3">可下载</th>
              <th className="px-4 py-3">状态</th>
              <th className="px-4 py-3">更新时间</th>
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
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{item.emoji?.emojiChar ?? '—'}</span>
                      <span className="text-xs text-gray-500">
                        {item.emoji?.name ?? item.emoji?.slug ?? '—'}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-gray-600">{item.provider ?? '—'}</td>
                  <td className="px-4 py-3 font-mono text-xs text-gray-600">{item.fileType ?? '—'}</td>
                  <td className="px-4 py-3 max-w-[200px] truncate text-xs text-gray-500" title={sourceLabel(item)}>
                    {sourceLabel(item)}
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-500">{item.licenseName ?? '—'}</td>
                  <td className="px-4 py-3">
                    {item.isDownloadable ? (
                      <span className="text-xs px-2 py-0.5 rounded bg-blue-100 text-blue-700">是</span>
                    ) : (
                      <span className="text-xs px-2 py-0.5 rounded bg-gray-100 text-gray-600">否</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={item.status} />
                  </td>
                  <td className="px-4 py-3 text-gray-500 text-xs">{formatDate(item.updatedAt)}</td>
                  <td className="px-4 py-3 text-right whitespace-nowrap">
                    <Link
                      href={`/admin/assets/${item.id}/edit`}
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
