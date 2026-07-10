'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import {
  listReviews,
  ReviewItem,
  AdminApiError,
  ReviewsQuery,
  SUBMISSION_TYPE_LABELS,
  SUBMISSION_STATUS_LABELS,
  SUBMISSION_STATUS_BADGE,
} from '@/lib/adminApi';

const STATUS_OPTIONS = [
  { value: 'all', label: '全部状态' },
  { value: 'pending', label: '待审核' },
  { value: 'approved', label: '已通过' },
  { value: 'rejected', label: '已拒绝' },
  { value: 'spam', label: '垃圾' },
];

const TYPE_OPTIONS = [
  { value: 'all', label: '全部类型' },
  { value: 'new_usage', label: '新用法' },
  { value: 'example', label: '示例' },
  { value: 'correction', label: '纠错' },
  { value: 'culture_note', label: '文化注释' },
  { value: 'translation_suggestion', label: '翻译建议' },
];

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

export default function AdminReviewsPage() {
  const [items, setItems] = useState<ReviewItem[]>([]);
  const [meta, setMeta] = useState({ page: 1, limit: 30, total: 0, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [status, setStatus] = useState('all');
  const [type, setType] = useState('all');
  const [locale, setLocale] = useState('all');
  const [q, setQ] = useState('');
  const [page, setPage] = useState(1);

  const buildQuery = useCallback((): ReviewsQuery => {
    const query: ReviewsQuery = { page, limit: 30 };
    if (status !== 'all') query.status = status as ReviewsQuery['status'];
    if (type !== 'all') query.type = type as ReviewsQuery['type'];
    if (locale !== 'all') query.locale = locale as 'zh' | 'en';
    if (q.trim()) query.q = q.trim();
    return query;
  }, [page, status, type, locale, q]);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await listReviews(buildQuery());
      setItems(res.data);
      setMeta(res.meta);
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
        <h1 className="text-2xl font-bold mb-1">✅ 审核管理</h1>
        <p className="text-gray-500 text-sm">
          管理用户提交（user_submissions）：示例、纠错、文化注释、翻译建议等。可进入详情页切换审核状态（通过 / 拒绝 /
          垃圾）。审核写操作需要 super_admin 或 reviewer 角色。
        </p>
      </div>

      <form
        onSubmit={onSearch}
        className="bg-white rounded-lg border p-4 mb-4 grid grid-cols-1 md:grid-cols-5 gap-3"
      >
        <div>
          <label className="block text-xs text-gray-500 mb-1">状态</label>
          <select
            className="w-full border rounded px-2 py-1.5 text-sm"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          >
            {STATUS_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1">类型</label>
          <select
            className="w-full border rounded px-2 py-1.5 text-sm"
            value={type}
            onChange={(e) => setType(e.target.value)}
          >
            {TYPE_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>
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
          <label className="block text-xs text-gray-500 mb-1">关键词</label>
          <input
            className="w-full border rounded px-2 py-1.5 text-sm"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="内容 / 用户名 / 邮箱"
          />
        </div>
        <div className="flex items-end">
          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded px-3 py-1.5 text-sm"
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
                  <th className="text-left px-3 py-2 font-medium">类型</th>
                  <th className="text-left px-3 py-2 font-medium">语言</th>
                  <th className="text-left px-3 py-2 font-medium">内容</th>
                  <th className="text-left px-3 py-2 font-medium">提交者</th>
                  <th className="text-left px-3 py-2 font-medium">状态</th>
                  <th className="text-left px-3 py-2 font-medium">时间</th>
                  <th className="text-left px-3 py-2 font-medium">操作</th>
                </tr>
              </thead>
              <tbody>
                {items.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-3 py-10 text-center text-gray-400">
                      暂无提交 / 审核记录
                    </td>
                  </tr>
                ) : (
                  items.map((it) => (
                    <tr key={it.id} className="border-t">
                      <td className="px-3 py-2 text-lg">{it.emojiChar ?? '—'}</td>
                      <td className="px-3 py-2">{SUBMISSION_TYPE_LABELS[it.type] ?? it.type}</td>
                      <td className="px-3 py-2">{it.locale ?? '—'}</td>
                      <td className="px-3 py-2 max-w-md truncate" title={it.content ?? ''}>
                        {it.content ?? '—'}
                      </td>
                      <td className="px-3 py-2">
                        {it.userName ?? '—'}
                        {it.userEmail ? (
                          <div className="text-xs text-gray-400 truncate" title={it.userEmail}>
                            {it.userEmail}
                          </div>
                        ) : null}
                      </td>
                      <td className="px-3 py-2">
                        <span
                          className={`inline-block rounded-full px-2 py-0.5 text-xs ${
                            SUBMISSION_STATUS_BADGE[it.status] ?? 'bg-gray-100'
                          }`}
                        >
                          {SUBMISSION_STATUS_LABELS[it.status] ?? it.status}
                        </span>
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap">{fmtDate(it.createdAt)}</td>
                      <td className="px-3 py-2">
                        <Link
                          href={`/admin/reviews/${it.id}`}
                          className="text-blue-600 hover:underline text-sm"
                        >
                          详情 / 审核
                        </Link>
                      </td>
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
        说明：审核状态写操作（通过 / 拒绝 / 垃圾）需要 super_admin 或 reviewer 角色；其余运营角色可查看列表与详情。
        审核操作会写入 audit_logs（action = review.update）。本阶段不接入 AI 审核、不开发复杂报表。
      </p>
    </div>
  );
}
