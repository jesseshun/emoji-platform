'use client';

import { useEffect, useState, useCallback } from 'react';
import {
  listCopyEvents,
  getCopyEventsSummary,
  CopyEventItem,
  CopyEventsSummary,
  AdminApiError,
  CopyEventsQuery,
} from '@/lib/adminApi';

const LOCALE_OPTIONS = [
  { value: 'all', label: '全部语言' },
  { value: 'zh', label: '中文 (zh)' },
  { value: 'en', label: '英文 (en)' },
];

function fmtDate(value: string): string {
  const d = new Date(value);
  if (isNaN(d.getTime())) return '—';
  return d.toLocaleString('zh-CN', { hour12: false });
}

function SummaryCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="bg-white rounded-lg border p-4">
      <div className="text-sm text-gray-500 mb-1">{label}</div>
      <div className="text-2xl font-semibold text-gray-800">{value}</div>
    </div>
  );
}

export default function AdminCopyEventsPage() {
  const [items, setItems] = useState<CopyEventItem[]>([]);
  const [meta, setMeta] = useState({ page: 1, limit: 30, total: 0, totalPages: 1 });
  const [summary, setSummary] = useState<CopyEventsSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [locale, setLocale] = useState('all');
  const [emojiId, setEmojiId] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [page, setPage] = useState(1);

  const buildQuery = useCallback((): CopyEventsQuery => {
    const query: CopyEventsQuery = { page, limit: 30 };
    if (locale !== 'all') query.locale = locale as 'zh' | 'en';
    if (emojiId.trim()) query.emojiId = emojiId.trim();
    if (dateFrom) query.dateFrom = dateFrom;
    if (dateTo) query.dateTo = dateTo;
    return query;
  }, [page, locale, emojiId, dateFrom, dateTo]);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [listRes, sumRes] = await Promise.all([
        listCopyEvents(buildQuery()),
        getCopyEventsSummary(),
      ]);
      setItems(listRes.data);
      setMeta(listRes.meta);
      setSummary(sumRes);
    } catch (err) {
      setError(err instanceof AdminApiError ? err.message || '加载失败' : '加载失败');
    } finally {
      setLoading(false);
    }
  }, [buildQuery]);

  useEffect(() => {
    load();
  }, [load]);

  const onSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    setTimeout(load, 0);
  };

  const changePage = (next: number) => {
    setPage(next);
    setTimeout(load, 0);
  };

  return (
    <div>
      <div className="mb-4">
        <h1 className="text-2xl font-bold mb-1">📋 复制日志</h1>
        <p className="text-gray-500 text-sm">
          查看用户复制 Emoji 的行为记录，包括表情、语言、来源页面。所有日志均不展示明文 IP，仅显示 ipHash 与粗略国家。
        </p>
      </div>

      {summary && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
          <SummaryCard label="总复制数" value={summary.totalCopies} />
          <SummaryCard label="今日复制" value={summary.todayCopies} />
          <SummaryCard
            label="语言分布 (zh/en/其他)"
            value={summary.copiesByLocale.zh + summary.copiesByLocale.en + summary.copiesByLocale.other}
          />
          <SummaryCard
            label="最热复制表情数"
            value={summary.topCopiedEmojis.length}
          />
        </div>
      )}

      {summary && summary.topCopiedEmojis.length > 0 && (
        <div className="bg-white rounded-lg border p-4 mb-5">
          <h2 className="font-semibold text-gray-800 mb-3">最常被复制的表情</h2>
          <div className="flex flex-wrap gap-3">
            {summary.topCopiedEmojis.map((e) => (
              <span
                key={e.emojiId}
                className="inline-flex items-center gap-1 bg-gray-100 rounded-full px-3 py-1 text-sm"
                title={e.emojiSlug ?? ''}
              >
                <span className="text-lg">{e.emojiChar ?? '—'}</span>
                <span>{e.count}</span>
              </span>
            ))}
          </div>
        </div>
      )}

      <form
        onSubmit={onSearch}
        className="bg-white rounded-lg border p-4 mb-4 grid grid-cols-1 md:grid-cols-4 gap-3"
      >
        <div>
          <label className="block text-xs text-gray-500 mb-1">语言</label>
          <select
            className="w-full border rounded px-2 py-1.5 text-sm"
            value={locale}
            onChange={(e) => setLocale(e.target.value)}
          >
            {LOCALE_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1">Emoji ID</label>
          <input
            className="w-full border rounded px-2 py-1.5 text-sm"
            value={emojiId}
            onChange={(e) => setEmojiId(e.target.value)}
            placeholder="按 emojiId 筛选"
          />
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1">起始日期</label>
          <input
            type="date"
            className="w-full border rounded px-2 py-1.5 text-sm"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
          />
        </div>
        <div className="flex items-end gap-2">
          <div className="flex-1">
            <label className="block text-xs text-gray-500 mb-1">结束日期</label>
            <input
              type="date"
              className="w-full border rounded px-2 py-1.5 text-sm"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
            />
          </div>
          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white rounded px-3 py-1.5 text-sm"
          >
            筛选
          </button>
        </div>
      </form>

      {loading && <div className="text-gray-500">加载中…</div>}
      {error && (
        <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded px-3 py-2 mb-4">
          {error}
        </div>
      )}

      {!loading && !error && (
        <div className="bg-white rounded-lg border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-600">
                <tr>
                  <th className="text-left px-3 py-2 font-medium">表情</th>
                  <th className="text-left px-3 py-2 font-medium">Slug</th>
                  <th className="text-left px-3 py-2 font-medium">语言</th>
                  <th className="text-left px-3 py-2 font-medium">来源页面</th>
                  <th className="text-left px-3 py-2 font-medium">国家</th>
                  <th className="text-left px-3 py-2 font-medium">User Agent</th>
                  <th className="text-left px-3 py-2 font-medium">IP Hash</th>
                  <th className="text-left px-3 py-2 font-medium">时间</th>
                </tr>
              </thead>
              <tbody>
                {items.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-3 py-10 text-center text-gray-400">
                      暂无复制日志
                    </td>
                  </tr>
                ) : (
                  items.map((it) => (
                    <tr key={it.id} className="border-t">
                      <td className="px-3 py-2 text-lg">{it.emojiChar ?? '—'}</td>
                      <td className="px-3 py-2">{it.emojiSlug ?? '—'}</td>
                      <td className="px-3 py-2">{it.locale ?? '—'}</td>
                      <td className="px-3 py-2 max-w-xs truncate" title={it.pageUrl ?? ''}>
                        {it.pageUrl ?? '—'}
                      </td>
                      <td className="px-3 py-2">{it.country ?? '—'}</td>
                      <td className="px-3 py-2 max-w-xs truncate" title={it.userAgent ?? ''}>
                        {it.userAgent ?? '—'}
                      </td>
                      <td className="px-3 py-2 max-w-xs truncate" title={it.ipHash ?? ''}>
                        {it.ipHash ?? '—'}
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap">{fmtDate(it.createdAt)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between px-3 py-3 border-t text-sm text-gray-500">
            <span>
              共 {meta.total} 条 · 第 {meta.page} / {meta.totalPages} 页
            </span>
            <div className="flex gap-2">
              <button
                disabled={meta.page <= 1}
                onClick={() => changePage(meta.page - 1)}
                className="px-3 py-1 border rounded disabled:opacity-40"
              >
                上一页
              </button>
              <button
                disabled={meta.page >= meta.totalPages}
                onClick={() => changePage(meta.page + 1)}
                className="px-3 py-1 border rounded disabled:opacity-40"
              >
                下一页
              </button>
            </div>
          </div>
        </div>
      )}

      <p className="text-xs text-gray-400 mt-6">
        说明：本阶段仅做后台复制日志查看与统计，不接入 Meilisearch、不生成 sitemap、不修改前台复制逻辑。敏感 IP
        以 ipHash（不可逆）形式展示，绝不返回明文 IP。
      </p>
    </div>
  );
}
