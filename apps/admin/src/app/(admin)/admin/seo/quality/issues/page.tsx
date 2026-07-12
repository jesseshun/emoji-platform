'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import {
  listSeoQualityIssues,
  SeoIssue,
  SeoIssueType,
  SeoSeverity,
  SeoQualityIssuesResponse,
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

interface Filters {
  entityType: 'emoji' | 'category' | 'topic' | 'article' | 'all';
  issueType: SeoIssueType | 'all';
  severity: SeoSeverity | 'all';
  locale: 'zh' | 'en' | 'all';
  q: string;
}

const DEFAULT_FILTERS: Filters = {
  entityType: 'all',
  issueType: 'all',
  severity: 'all',
  locale: 'all',
  q: '',
};

function severityBadge(s: SeoSeverity) {
  return s === 'issue' ? (
    <span className="text-xs px-2 py-0.5 rounded-full bg-red-100 text-red-700">问题</span>
  ) : (
    <span className="text-xs px-2 py-0.5 rounded-full bg-amber-100 text-amber-700">警告</span>
  );
}

export default function AdminSeoQualityIssuesPage() {
  const [filters, setFilters] = useState<Filters>(DEFAULT_FILTERS);
  const [page, setPage] = useState(1);
  const [result, setResult] = useState<SeoQualityIssuesResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await listSeoQualityIssues({
        page,
        limit: 30,
        entityType: filters.entityType,
        issueType: filters.issueType,
        severity: filters.severity,
        locale: filters.locale,
        q: filters.q || undefined,
      });
      setResult(res);
    } catch (err) {
      setError(err instanceof AdminApiError ? err.message || '加载失败' : '加载失败');
    } finally {
      setLoading(false);
    }
  }, [page, filters]);

  useEffect(() => {
    load();
  }, [load]);

  const changeFilter = (patch: Partial<Filters>) => {
    setFilters((f) => ({ ...f, ...patch }));
    setPage(1);
  };

  const totalPages = result?.meta.totalPages ?? 1;

  return (
    <div>
      <div className="mb-4 flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold mb-1">🔍 SEO 问题列表</h1>
          <p className="text-gray-500 text-sm">
            按实体类型、问题类型、严重级别与语言筛选。点击「编辑」跳转到对应 SEO 编辑页。
          </p>
        </div>
        <Link
          href="/admin/seo/quality"
          className="text-sm px-3 py-2 rounded border border-gray-300 text-gray-700 hover:bg-gray-50 whitespace-nowrap"
        >
          ← 返回总览
        </Link>
      </div>

      {error && (
        <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded px-3 py-2 mb-4">
          {error}
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-lg border p-4 mb-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 text-sm">
        <label className="block">
          <span className="text-gray-500 block mb-1">实体类型</span>
          <select
            className="w-full border rounded px-2 py-1"
            value={filters.entityType}
            onChange={(e) =>
              changeFilter({
                entityType: e.target.value as Filters['entityType'],
              })
            }
          >
            <option value="all">全部</option>
            <option value="emoji">Emoji</option>
            <option value="category">分类</option>
            <option value="topic">专题</option>
            <option value="article">文章</option>
          </select>
        </label>

        <label className="block">
          <span className="text-gray-500 block mb-1">问题类型</span>
          <select
            className="w-full border rounded px-2 py-1"
            value={filters.issueType}
            onChange={(e) =>
              changeFilter({ issueType: e.target.value as Filters['issueType'] })
            }
          >
            <option value="all">全部</option>
            {ISSUE_TYPE_ORDER.map((it) => (
              <option key={it} value={it}>
                {ISSUE_TYPE_LABELS[it]}
              </option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="text-gray-500 block mb-1">严重级别</span>
          <select
            className="w-full border rounded px-2 py-1"
            value={filters.severity}
            onChange={(e) =>
              changeFilter({ severity: e.target.value as Filters['severity'] })
            }
          >
            <option value="all">全部</option>
            <option value="issue">问题</option>
            <option value="warning">警告</option>
          </select>
        </label>

        <label className="block">
          <span className="text-gray-500 block mb-1">语言</span>
          <select
            className="w-full border rounded px-2 py-1"
            value={filters.locale}
            onChange={(e) =>
              changeFilter({ locale: e.target.value as Filters['locale'] })
            }
          >
            <option value="all">全部</option>
            <option value="zh">中文</option>
            <option value="en">英文</option>
          </select>
        </label>

        <label className="block">
          <span className="text-gray-500 block mb-1">搜索</span>
          <input
            type="text"
            className="w-full border rounded px-2 py-1"
            placeholder="名称 / slug / ID"
            value={filters.q}
            onChange={(e) => changeFilter({ q: e.target.value })}
          />
        </label>
      </div>

      {/* Issue-type counts */}
      {result && (
        <div className="flex flex-wrap gap-2 mb-4 text-xs">
          {ISSUE_TYPE_ORDER.map((it) => (
            <span
              key={it}
              className="px-2 py-1 rounded-full bg-gray-100 text-gray-600"
              title={ISSUE_TYPE_LABELS[it]}
            >
              {ISSUE_TYPE_LABELS[it]}：{result.issuesByType[it] ?? 0}
            </span>
          ))}
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-lg border overflow-hidden">
        {loading ? (
          <div className="p-6 text-gray-500">加载中…</div>
        ) : !result || result.data.length === 0 ? (
          <div className="p-6 text-center text-gray-400">没有符合条件的问题 🎉</div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-500 text-xs">
              <tr>
                <th className="text-left px-3 py-2">级别</th>
                <th className="text-left px-3 py-2">实体</th>
                <th className="text-left px-3 py-2">问题</th>
                <th className="text-left px-3 py-2">建议</th>
                <th className="text-left px-3 py-2">操作</th>
              </tr>
            </thead>
            <tbody>
              {result.data.map((i: SeoIssue) => (
                <tr key={i.id} className="border-t hover:bg-gray-50">
                  <td className="px-3 py-2">{severityBadge(i.severity)}</td>
                  <td className="px-3 py-2">
                    <div className="font-medium text-gray-800">
                      [{ENTITY_LABELS[i.entityType]}] {i.nameOrTitle || i.slug || i.entityId}
                    </div>
                    <div className="text-xs text-gray-400">
                      {i.slug || ''}
                      {i.slug && i.locale !== 'all' ? ` · ${i.locale}` : ''}
                    </div>
                  </td>
                  <td className="px-3 py-2 text-gray-600">
                    <div className="font-medium">{ISSUE_TYPE_LABELS[i.issueType]}</div>
                    <div className="text-xs">{i.message}</div>
                  </td>
                  <td className="px-3 py-2 text-gray-500 text-xs max-w-xs">
                    {i.recommendedAction}
                  </td>
                  <td className="px-3 py-2">
                    <div className="flex flex-col gap-1">
                      <Link
                        href={i.editUrl}
                        className="text-xs text-blue-600 hover:underline whitespace-nowrap"
                      >
                        编辑 SEO →
                      </Link>
                      {i.publicUrl && (
                        <a
                          href={i.publicUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-xs text-gray-500 hover:underline whitespace-nowrap"
                        >
                          查看页面 ↗
                        </a>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      {result && totalPages > 1 && (
        <div className="flex items-center justify-center gap-3 mt-4 text-sm">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page <= 1}
            className="px-3 py-1 rounded border border-gray-300 disabled:opacity-50"
          >
            上一页
          </button>
          <span className="text-gray-600">
            {page} / {totalPages}（共 {result.meta.total} 条）
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page >= totalPages}
            className="px-3 py-1 rounded border border-gray-300 disabled:opacity-50"
          >
            下一页
          </button>
        </div>
      )}

      <p className="text-xs text-gray-400 mt-6">
        说明：问题列表为实时只读检查结果，不自动修改任何数据。若某实体同时缺少标题与描述，会分别列出两条记录。
      </p>
    </div>
  );
}
