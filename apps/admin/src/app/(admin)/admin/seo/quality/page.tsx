'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import {
  getSeoQualityOverview,
  runSeoQualityCheck,
  SeoQualityOverview,
  SeoIssueType,
  SeoSeverity,
  AdminApiError,
} from '@/lib/adminApi';

const ENTITY_LABELS: Record<'emoji' | 'category' | 'topic' | 'article', string> = {
  emoji: 'Emoji',
  category: '分类',
  topic: '专题',
  article: '文章',
};

const ISSUE_TYPE_LABELS: Record<SeoIssueType, string> = {
  missingSeoTitle: '缺少 SEO 标题',
  missingSeoDescription: '缺少 SEO 描述',
  titleTooShort: '标题过短',
  titleTooLong: '标题过长',
  descriptionTooShort: '描述过短',
  descriptionTooLong: '描述过长',
  missingCanonicalPreview: '缺少 canonical 预览',
  missingHreflangPreview: '缺少 hreflang 预览',
  missingJsonLd: '缺少 JSON-LD 数据',
  sitemapMismatch: 'sitemap 收录不一致',
  noInternalLinks: '缺少内部链接',
};

const ISSUE_TYPE_ORDER: SeoIssueType[] = [
  'missingSeoTitle',
  'missingSeoDescription',
  'titleTooShort',
  'titleTooLong',
  'descriptionTooShort',
  'descriptionTooLong',
  'missingCanonicalPreview',
  'missingHreflangPreview',
  'missingJsonLd',
  'sitemapMismatch',
  'noInternalLinks',
];

function StatCard({ label, value, tone }: { label: string; value: number; tone: 'default' | 'green' | 'amber' | 'red' }) {
  const toneClass =
    tone === 'green'
      ? 'text-green-600'
      : tone === 'amber'
        ? 'text-amber-600'
        : tone === 'red'
          ? 'text-red-600'
          : 'text-gray-800';
  return (
    <div className="bg-white rounded-lg border p-4">
      <div className="text-sm text-gray-500 mb-1">{label}</div>
      <div className={`text-2xl font-bold ${toneClass}`}>{value}</div>
    </div>
  );
}

export default function AdminSeoQualityPage() {
  const [data, setData] = useState<SeoQualityOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState(false);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    try {
      const res = await getSeoQualityOverview();
      setData(res);
    } catch (err) {
      setError(err instanceof AdminApiError ? err.message || '加载失败' : '加载失败');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleRun = async () => {
    setRunning(true);
    setError('');
    try {
      const res = await runSeoQualityCheck();
      setData(res);
    } catch (err) {
      setError(
        err instanceof AdminApiError
          ? `运行检查失败：${err.message || '无权限或请求错误'}`
          : '运行检查失败',
      );
    } finally {
      setRunning(false);
    }
  };

  if (loading) {
    return <div className="text-gray-500">加载中…</div>;
  }
  if (error && !data) {
    return (
      <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded px-3 py-2">
        {error}
      </div>
    );
  }
  if (!data) return null;

  const severityBadge = (s: SeoSeverity) =>
    s === 'issue' ? (
      <span className="text-xs px-2 py-0.5 rounded-full bg-red-100 text-red-700">问题</span>
    ) : (
      <span className="text-xs px-2 py-0.5 rounded-full bg-amber-100 text-amber-700">警告</span>
    );

  return (
    <div>
      <div className="mb-4 flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold mb-1">🔍 SEO 质量检查</h1>
          <p className="text-gray-500 text-sm">
            实时扫描 Emoji / 分类 / 专题 / 文章的 SEO 字段、canonical / hreflang / JSON-LD 风险与内部链接机会。只读检查，不修改数据。
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/admin/seo/quality/issues"
            className="text-sm px-3 py-2 rounded border border-gray-300 text-gray-700 hover:bg-gray-50"
          >
            查看问题列表 →
          </Link>
          <button
            onClick={handleRun}
            disabled={running}
            className="text-sm px-3 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {running ? '检查中…' : '运行检查'}
          </button>
        </div>
      </div>

      {error && (
        <div className="text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded px-3 py-2 mb-4">
          {error}
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <StatCard label="检查总数" value={data.totalChecked} tone="default" />
        <StatCard label="通过数量" value={data.passedCount} tone="green" />
        <StatCard label="问题数 (issue)" value={data.issueCount} tone="red" />
        <StatCard label="警告数 (warning)" value={data.warningCount} tone="amber" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        <div className="bg-white rounded-lg border p-4">
          <h2 className="font-semibold text-gray-800 mb-3">按实体类型</h2>
          <div className="space-y-2 text-sm">
            {(['emoji', 'category', 'topic', 'article'] as const).map((t) => (
              <div key={t} className="flex justify-between">
                <span className="text-gray-500">{ENTITY_LABELS[t]}</span>
                <span>
                  <span className="text-red-600 mr-3">问题 {data.issuesByEntityType[t].issue}</span>
                  <span className="text-amber-600">警告 {data.issuesByEntityType[t].warning}</span>
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg border p-4">
          <h2 className="font-semibold text-gray-800 mb-3">按问题类型</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1 text-sm">
            {ISSUE_TYPE_ORDER.map((it) => (
              <div key={it} className="flex justify-between">
                <span className="text-gray-500">{ISSUE_TYPE_LABELS[it]}</span>
                <span className="font-semibold text-gray-800">{data.issuesByType[it]}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg border p-4">
        <h2 className="font-semibold text-gray-800 mb-3">最近发现的问题</h2>
        {data.recentIssues.length === 0 ? (
          <p className="text-sm text-gray-400">暂无问题 🎉</p>
        ) : (
          <ul className="space-y-2 text-sm max-h-80 overflow-y-auto">
            {data.recentIssues.map((i) => (
              <li key={i.id} className="border-b pb-2 last:border-0 flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    {severityBadge(i.severity)}
                    <span className="text-gray-700">
                      [{ENTITY_LABELS[i.entityType]}] {i.nameOrTitle || i.slug || i.entityId}
                    </span>
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {ISSUE_TYPE_LABELS[i.issueType]} · {i.message}
                  </div>
                </div>
                <Link
                  href={i.editUrl}
                  className="text-xs text-blue-600 hover:underline whitespace-nowrap"
                >
                  编辑 →
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>

      <p className="text-xs text-gray-400 mt-6">
        说明：本阶段仅做 SEO 质量检查与基础内部链接建议，不自动改写 title / description，不生成低质量内容，不接入 Meilisearch，不改为纯静态站。
      </p>
    </div>
  );
}
