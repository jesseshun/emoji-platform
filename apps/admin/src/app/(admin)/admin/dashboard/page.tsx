'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/components/AuthProvider';
import {
  getDashboard,
  AdminDashboardData,
  AdminApiError,
} from '@/lib/adminApi';

function formatDate(value: string): string {
  const d = new Date(value);
  if (isNaN(d.getTime())) return '—';
  return d.toLocaleString('zh-CN', { hour12: false });
}

function StatCard({ label, value, accent }: { label: string; value: number; accent?: string }) {
  return (
    <div className="bg-white rounded-lg border p-4">
      <div className="text-sm text-gray-500 mb-1">{label}</div>
      <div className={`text-2xl font-bold ${accent ?? 'text-gray-900'}`}>{value}</div>
    </div>
  );
}

export default function AdminDashboardPage() {
  const { admin } = useAuth();
  const [data, setData] = useState<AdminDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const res = await getDashboard();
        if (active) setData(res);
      } catch (err) {
        if (active) {
          if (err instanceof AdminApiError) {
            setError(err.message || '加载仪表盘失败');
          } else {
            setError('加载仪表盘失败，请稍后重试');
          }
        }
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  if (loading) {
    return <div className="text-gray-500">正在加载仪表盘…</div>;
  }

  if (error) {
    return (
      <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded px-3 py-2">
        {error}
      </div>
    );
  }

  if (!data) return null;

  const { stats, recentEmojis } = data;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-1">📊 仪表盘</h1>
      <p className="text-gray-500 mb-6">系统概览与关键数据统计。</p>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <StatCard label="Emoji 总数" value={stats.emojiTotal} />
        <StatCard label="已发布" value={stats.publishedEmojiTotal} accent="text-green-600" />
        <StatCard label="草稿" value={stats.draftEmojiTotal} accent="text-amber-600" />
        <StatCard label="已下线" value={stats.archivedEmojiTotal} accent="text-gray-500" />
        <StatCard label="分类总数" value={stats.categoryTotal} />
        <StatCard label="专题总数" value={stats.topicTotal} />
        <StatCard label="今日搜索" value={stats.todaySearchTotal} />
        <StatCard label="今日复制" value={stats.todayCopyTotal} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg border p-5">
          <h2 className="text-sm font-semibold text-gray-700 mb-3">最近更新的 Emoji</h2>
          {recentEmojis.length === 0 ? (
            <p className="text-gray-400 text-sm">暂无数据</p>
          ) : (
            <ul className="divide-y text-sm">
              {recentEmojis.map((e) => (
                <li key={e.id} className="py-2 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-xl">{e.emojiChar}</span>
                    <div className="min-w-0">
                      <div className="font-medium truncate">{e.name || e.slug}</div>
                      <div className="text-gray-400 text-xs truncate">{e.slug}</div>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-xs px-2 py-0.5 rounded bg-gray-100 text-gray-600">
                      {e.status}
                    </span>
                    <div className="text-gray-400 text-xs mt-1">{formatDate(e.updatedAt)}</div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="bg-white rounded-lg border p-5">
          <h2 className="text-sm font-semibold text-gray-700 mb-3">当前登录管理员</h2>
          <dl className="text-sm space-y-1">
            <div className="flex justify-between">
              <dt className="text-gray-500">邮箱</dt>
              <dd className="font-medium">{admin?.email ?? '—'}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-500">姓名</dt>
              <dd className="font-medium">{admin?.name || '—'}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-500">角色</dt>
              <dd className="font-medium">{admin?.role ?? '—'}</dd>
            </div>
          </dl>
          <Link
            href="/admin/emojis"
            className="inline-block mt-4 text-sm text-blue-600 hover:underline"
          >
            前往表情管理 →
          </Link>
        </div>
      </div>
    </div>
  );
}
