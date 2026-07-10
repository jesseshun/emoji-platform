'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getSeoOverview, SeoOverview, SeoStats, AdminApiError } from '@/lib/adminApi';

const ENTITY_LABELS: { key: 'emoji' | 'category' | 'topic' | 'article'; label: string; href: string }[] = [
  { key: 'emoji', label: 'Emoji SEO', href: '/admin/seo/emojis' },
  { key: 'category', label: '分类 SEO', href: '/admin/seo/categories' },
  { key: 'topic', label: '专题 SEO', href: '/admin/seo/topics' },
  { key: 'article', label: '文章 SEO', href: '/admin/seo/articles' },
];

function StatsCard({ label, href, stats }: { label: string; href: string; stats: SeoStats }) {
  return (
    <Link
      href={href}
      className="block bg-white rounded-lg border p-4 hover:shadow-sm transition"
    >
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-gray-800">{label}</h3>
        <span className="text-xs text-blue-600">查看 →</span>
      </div>
      <div className="grid grid-cols-2 gap-2 text-sm">
        <div className="text-gray-500">
          总计 <span className="font-semibold text-gray-800">{stats.total}</span>
        </div>
        <div className="text-green-600">
          完整 <span className="font-semibold">{stats.complete}</span>
        </div>
        <div className="text-amber-600">
          缺标题 <span className="font-semibold">{stats.missingTitle}</span>
        </div>
        <div className="text-amber-600">
          缺描述 <span className="font-semibold">{stats.missingDescription}</span>
        </div>
      </div>
    </Link>
  );
}

export default function AdminSeoPage() {
  const [data, setData] = useState<SeoOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const res = await getSeoOverview();
        if (active) setData(res);
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
  }, []);

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
  if (!data) return null;

  const statsMap: Record<'emoji' | 'category' | 'topic' | 'article', SeoStats> = {
    emoji: data.emojiSeoStats,
    category: data.categorySeoStats,
    topic: data.topicSeoStats,
    article: data.articleSeoStats,
  };

  return (
    <div>
      <div className="mb-4">
        <h1 className="text-2xl font-bold mb-1">🔍 SEO 管理中心</h1>
        <p className="text-gray-500 text-sm">
          统一管理 Emoji / 分类 / 专题 / 文章的 seoTitle 与 seoDescription，检查 SEO 完整度与缺失项。
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {ENTITY_LABELS.map((e) => (
          <StatsCard key={e.key} label={e.label} href={e.href} stats={statsMap[e.key]} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        <div className="bg-white rounded-lg border p-4">
          <h2 className="font-semibold text-gray-800 mb-3">全局缺失概览</h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">缺失 seoTitle（全部语言）</span>
              <span className="font-semibold text-amber-600">{data.missingTitleCount}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">缺失 seoDescription（全部语言）</span>
              <span className="font-semibold text-amber-600">{data.missingDescriptionCount}</span>
            </div>
            <div className="border-t pt-2 mt-2">
              <div className="text-gray-500 mb-1">按语言缺失</div>
              <div className="grid grid-cols-2 gap-2">
                <div className="text-xs bg-gray-50 rounded p-2">
                  <div className="font-medium text-gray-700">中文 (zh)</div>
                  <div>缺标题：{data.missingByLocale.zh.missingTitle}</div>
                  <div>缺描述：{data.missingByLocale.zh.missingDescription}</div>
                </div>
                <div className="text-xs bg-gray-50 rounded p-2">
                  <div className="font-medium text-gray-700">英文 (en)</div>
                  <div>缺标题：{data.missingByLocale.en.missingTitle}</div>
                  <div>缺描述：{data.missingByLocale.en.missingDescription}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border p-4">
          <h2 className="font-semibold text-gray-800 mb-3">最近 SEO 更新</h2>
          {data.recentSeoUpdates.length === 0 ? (
            <p className="text-sm text-gray-400">暂无 SEO 更新记录</p>
          ) : (
            <ul className="space-y-2 text-sm max-h-64 overflow-y-auto">
              {data.recentSeoUpdates.map((u) => (
                <li key={u.id} className="border-b pb-2 last:border-0">
                  <div className="flex justify-between">
                    <span className="text-gray-700">{u.entityId ?? '—'}</span>
                    <span className="text-xs text-gray-400">
                      {new Date(u.createdAt).toLocaleString('zh-CN', { hour12: false })}
                    </span>
                  </div>
                  <div className="text-xs text-gray-500">操作：{u.action ?? '—'}</div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white rounded-lg border p-4">
          <h2 className="font-semibold text-gray-800 mb-3">robots.txt 状态</h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">是否检测到文件</span>
              <span className={data.robotsStatus.exists ? 'text-green-600' : 'text-gray-600'}>
                {data.robotsStatus.exists ? '已存在' : '未检测到'}
              </span>
            </div>
            <p className="text-xs text-gray-500">{data.robotsStatus.note}</p>
          </div>
        </div>

        <div className="bg-white rounded-lg border p-4">
          <h2 className="font-semibold text-gray-800 mb-3">sitemap.xml 状态</h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">是否检测到文件</span>
              <span className={data.sitemapStatus.exists ? 'text-green-600' : 'text-gray-600'}>
                {data.sitemapStatus.exists ? '已存在' : '未生成'}
              </span>
            </div>
            <p className="text-xs text-gray-500">{data.sitemapStatus.note}</p>
          </div>
        </div>
      </div>

      <p className="text-xs text-gray-400 mt-6">
        说明：本阶段仅做后台 SEO 管理与检查，不生成 sitemap、不自动写作、不修改前台路由结构。
        canonical / hreflang 为预览，前台文章详情页为规划路径（article）。
      </p>
    </div>
  );
}
