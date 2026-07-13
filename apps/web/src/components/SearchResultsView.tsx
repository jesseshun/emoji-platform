'use client';

import { useState, useEffect } from 'react';
import type { Locale, SearchItem, SearchMeta, SearchTypeFilter } from '@/lib/types';
import { SearchResultCard } from './SearchResultCard';
import { LoadingState } from './LoadingState';
import { EmptyState } from './EmptyState';
import { ErrorState } from './ErrorState';
import { search } from '@/lib/api';

const FILTERS: { value: SearchTypeFilter; label: Record<Locale, string> }[] = [
  { value: 'all', label: { zh: '全部', en: 'All' } },
  { value: 'emoji', label: { zh: '表情', en: 'Emojis' } },
  { value: 'category', label: { zh: '分类', en: 'Categories' } },
  { value: 'topic', label: { zh: '专题', en: 'Topics' } },
  { value: 'article', label: { zh: '文章', en: 'Articles' } },
];

interface Props {
  locale: Locale;
  query: string;
  initialType: SearchTypeFilter;
  initialData: SearchItem[];
  initialMeta: SearchMeta;
  initialPage: number;
}

/**
 * Client-side search results experience (Phase 6C).
 *
 * Receives the SSR-rendered results as initial props (good for SEO / first
 * paint) and then handles type filtering and pagination client-side with a
 * proper loading / empty / error / fallback UI. The URL is kept in sync with
 * `history.replaceState` so the view is shareable and survives refresh without
 * triggering a duplicate server round-trip.
 */
export function SearchResultsView({
  locale,
  query,
  initialType,
  initialData,
  initialMeta,
  initialPage,
}: Props) {
  const [type, setType] = useState<SearchTypeFilter>(initialType);
  const [page, setPage] = useState<number>(initialPage);
  const [data, setData] = useState<SearchItem[]>(initialData);
  const [meta, setMeta] = useState<SearchMeta>(initialMeta);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Re-sync from server props on a real navigation / refresh (URL changed and
  // the server component re-rendered). Client-side filter changes use
  // replaceState and do not re-run this, so local state is preserved.
  useEffect(() => {
    setType(initialType);
    setPage(initialPage);
    setData(initialData);
    setMeta(initialMeta);
    setError(null);
    setLoading(false);
  }, [initialType, initialPage, initialData, initialMeta]);

  const buildUrl = (t: SearchTypeFilter, p: number) => {
    const params = new URLSearchParams();
    params.set('q', query);
    params.set('type', t);
    if (p > 1) params.set('page', String(p));
    return `/${locale}/search?${params.toString()}`;
  };

  const syncUrl = (t: SearchTypeFilter, p: number) => {
    if (typeof window !== 'undefined') {
      window.history.replaceState(window.history.state, '', buildUrl(t, p));
    }
  };

  const run = (t: SearchTypeFilter, p: number) => {
    const limit = meta.limit || 30;
    setLoading(true);
    setError(null);
    search(locale, query, { type: t, page: p, limit })
      .then((res) => {
        setData(res.data);
        setMeta(res.meta);
      })
      .catch((e: unknown) => {
        setError(
          e instanceof Error
            ? e.message
            : locale === 'zh'
              ? '加载失败，请重试'
              : 'Failed to load, please try again',
        );
      })
      .finally(() => setLoading(false));
  };

  const changeType = (t: SearchTypeFilter) => {
    if (t === type && page === 1) return;
    setType(t);
    setPage(1);
    syncUrl(t, 1);
    run(t, 1);
  };

  const changePage = (p: number) => {
    if (p === page) return;
    setPage(p);
    syncUrl(type, p);
    run(type, p);
  };

  const labelFor = (v: SearchTypeFilter) => FILTERS.find((f) => f.value === v)?.label[locale] ?? v;
  const countByType: Record<Exclude<SearchTypeFilter, 'all'>, number> = {
    emoji: meta.totalByType.emoji,
    category: meta.totalByType.category,
    topic: meta.totalByType.topic,
    article: meta.totalByType.article,
  };

  return (
    <div>
      {/* Type filter tabs */}
      <div
        className="flex flex-wrap gap-2 mb-4"
        role="tablist"
        aria-label={locale === 'zh' ? '搜索类型筛选' : 'Search type filter'}
      >
        {FILTERS.map((f) => {
          const active = f.value === type;
          const count = f.value === 'all' ? meta.total : countByType[f.value] ?? 0;
          return (
            <button
              key={f.value}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => changeType(f.value)}
              className={`px-3 py-1.5 text-sm rounded-full border transition ${
                active
                  ? 'bg-blue-600 border-blue-600 text-white'
                  : 'bg-white border-gray-200 text-gray-600 hover:border-gray-400'
              }`}
            >
              {f.label[locale]}
              {typeof count === 'number' && count > 0 ? (
                <span className={`ml-1.5 ${active ? 'text-blue-100' : 'text-gray-400'}`}>{count}</span>
              ) : null}
            </button>
          );
        })}
      </div>

      {/* Total + fallback notice */}
      <div className="flex items-center gap-3 mb-4">
        <p className="text-sm text-gray-500">
          {locale === 'zh'
            ? `找到 ${meta.total} 个与 “${query}” 相关的结果`
            : `Found ${meta.total} results for “${query}”`}
        </p>
        {meta.fallbackUsed && (
          <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-500">
            {locale === 'zh' ? '正在使用基础搜索结果' : 'Using basic search results'}
          </span>
        )}
      </div>

      {error ? (
        <ErrorState message={error} />
      ) : loading ? (
        <LoadingState />
      ) : data.length === 0 ? (
        <EmptyState
          icon="😕"
          title={
            locale === 'zh'
              ? `未找到与“${query}”相关的${type === 'all' ? '' : labelFor(type) + ' '}结果`
              : `No ${type === 'all' ? '' : `${labelFor(type)} `}results found for “${query}”`
          }
          description={
            locale === 'zh'
              ? '请尝试使用其他关键词，或浏览全部分类查找。'
              : 'Try using different keywords, or browse by category instead.'
          }
        />
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {data.map((item) => (
              <SearchResultCard key={`${item.type}-${item.id}`} item={item} locale={locale} query={query} />
            ))}
          </div>

          {meta.totalPages > 1 && (
            <nav className="flex items-center justify-center gap-1 mt-8" aria-label="Pagination">
              {page > 1 && (
                <button
                  type="button"
                  onClick={() => changePage(page - 1)}
                  className="px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition"
                >
                  {locale === 'zh' ? '上一页' : 'Prev'}
                </button>
              )}
              {Array.from({ length: meta.totalPages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => changePage(p)}
                  className={`px-3 py-2 text-sm rounded-lg transition ${
                    p === page
                      ? 'bg-blue-600 text-white font-medium'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  {p}
                </button>
              ))}
              {page < meta.totalPages && (
                <button
                  type="button"
                  onClick={() => changePage(page + 1)}
                  className="px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition"
                >
                  {locale === 'zh' ? '下一页' : 'Next'}
                </button>
              )}
            </nav>
          )}
        </>
      )}
    </div>
  );
}
