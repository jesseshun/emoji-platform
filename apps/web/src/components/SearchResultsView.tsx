'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type { Locale, SearchItem, SearchMeta, SearchTypeFilter } from '@/lib/types';
import { SearchResultCard } from './SearchResultCard';
import { SearchResultsSkeleton } from './BrowseSkeletons';
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

function paginationItems(current: number, total: number): (number | 'ellipsis')[] {
  if (total <= 7) return Array.from({ length: total }, (_, index) => index + 1);

  const pages = Array.from(new Set([1, total, current - 1, current, current + 1]))
    .filter((item) => item >= 1 && item <= total)
    .sort((a, b) => a - b);
  const result: (number | 'ellipsis')[] = [];
  pages.forEach((item, index) => {
    if (index > 0 && item - pages[index - 1] > 1) result.push('ellipsis');
    result.push(item);
  });
  return result;
}

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
 * `history.pushState` so the view is shareable, survives refresh, and supports
 * browser back/forward without triggering a duplicate server round-trip.
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
  const [filterOpen, setFilterOpen] = useState(false);
  const requestId = useRef(0);

  // Re-sync from server props on a real navigation / refresh (URL changed and
  // the server component re-rendered). Client-side filter changes use
  // pushState and do not re-run this, so local state is preserved.
  useEffect(() => {
    requestId.current += 1;
    setType(initialType);
    setPage(initialPage);
    setData(initialData);
    setMeta(initialMeta);
    setError(null);
    setLoading(false);
    setFilterOpen(false);
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
      window.history.pushState(window.history.state, '', buildUrl(t, p));
    }
  };

  const run = useCallback((t: SearchTypeFilter, p: number) => {
    const id = ++requestId.current;
    const limit = meta.limit || 30;
    setLoading(true);
    setError(null);
    search(locale, query, { type: t, page: p, limit })
      .then((res) => {
        if (id !== requestId.current) return;
        setData(res.data);
        setMeta(res.meta);
      })
      .catch((e: unknown) => {
        if (id !== requestId.current) return;
        setError(
          e instanceof Error
            ? e.message
            : locale === 'zh'
              ? '加载失败，请重试'
              : 'Failed to load, please try again',
        );
      })
      .finally(() => {
        if (id === requestId.current) setLoading(false);
      });
  }, [locale, meta.limit, query]);

  useEffect(() => {
    const handlePopState = () => {
      const params = new URLSearchParams(window.location.search);
      if ((params.get('q') || '').trim() !== query) return;

      const rawType = (params.get('type') || 'all').toLowerCase();
      const nextType = FILTERS.some((filter) => filter.value === rawType)
        ? (rawType as SearchTypeFilter)
        : 'all';
      const parsedPage = Number.parseInt(params.get('page') || '1', 10);
      const nextPage = Number.isFinite(parsedPage) && parsedPage > 0 ? parsedPage : 1;

      setType(nextType);
      setPage(nextPage);
      setFilterOpen(false);
      run(nextType, nextPage);
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [query, run]);

  useEffect(() => {
    if (!filterOpen) return;
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setFilterOpen(false);
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [filterOpen]);

  const changeType = (t: SearchTypeFilter) => {
    if (t === type && page === 1) {
      setFilterOpen(false);
      return;
    }
    setType(t);
    setPage(1);
    setFilterOpen(false);
    syncUrl(t, 1);
    run(t, 1);
  };

  const changePage = (p: number) => {
    if (p === page) return;
    setPage(p);
    syncUrl(type, p);
    run(type, p);
    document.getElementById('search-results')?.scrollIntoView({
      behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth',
      block: 'start',
    });
  };

  const labelFor = (v: SearchTypeFilter) => FILTERS.find((f) => f.value === v)?.label[locale] ?? v;
  const countByType: Record<Exclude<SearchTypeFilter, 'all'>, number> = {
    emoji: meta.totalByType.emoji,
    category: meta.totalByType.category,
    topic: meta.totalByType.topic,
    article: meta.totalByType.article,
  };
  const pages = paginationItems(page, meta.totalPages);

  return (
    <section id="search-results" aria-labelledby="search-results-summary" className="scroll-mt-24">
      <div className="relative mb-4 md:hidden">
        <button
          type="button"
          aria-expanded={filterOpen}
          aria-controls="mobile-search-filters"
          onClick={() => setFilterOpen((open) => !open)}
          className="flex min-h-11 w-full items-center justify-between rounded-[8px] border border-border bg-surface px-4 text-sm font-medium text-text-primary shadow-xs"
        >
          <span>{locale === 'zh' ? '结果类型' : 'Result type'}</span>
          <span className="flex items-center gap-2 text-text-secondary">
            {labelFor(type)}
            <span aria-hidden="true">{filterOpen ? '↑' : '↓'}</span>
          </span>
        </button>
        {filterOpen && (
          <div id="mobile-search-filters" className="absolute left-0 right-0 top-full z-dropdown mt-2 grid grid-cols-2 gap-2 rounded-[8px] border border-border bg-surface p-3 shadow-lg">
            {FILTERS.map((f) => {
              const active = f.value === type;
              const count = f.value === 'all' ? meta.total : countByType[f.value] ?? 0;
              return (
                <button
                  key={f.value}
                  type="button"
                  aria-pressed={active}
                  onClick={() => changeType(f.value)}
                  className={`flex min-h-10 items-center justify-between rounded-[8px] border px-3 text-sm font-medium ${
                    active
                      ? 'border-text-primary bg-text-primary text-text-inverse'
                      : 'border-border-subtle bg-surface text-text-secondary hover:border-border-strong hover:text-text-primary'
                  }`}
                >
                  <span>{f.label[locale]}</span>
                  <span className={active ? 'text-text-inverse-secondary' : 'text-text-muted'}>{count}</span>
                </button>
              );
            })}
            {type !== 'all' && (
              <button type="button" onClick={() => changeType('all')} className="col-span-2 min-h-10 rounded-[8px] text-sm font-medium text-text-link hover:bg-accent-subtle">
                {locale === 'zh' ? '清除筛选' : 'Clear filter'}
              </button>
            )}
          </div>
        )}
      </div>

      <div
        className="mb-5 hidden flex-wrap items-center gap-2 md:flex"
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
              className={`inline-flex min-h-10 items-center rounded-[8px] border px-3 text-sm font-medium transition-all duration-fast active:translate-y-px ${
                active
                  ? 'border-text-primary bg-text-primary text-text-inverse shadow-xs'
                  : 'border-border-subtle bg-surface text-text-secondary hover:border-border-strong hover:text-text-primary'
              }`}
            >
              {f.label[locale]}
              {typeof count === 'number' && count > 0 ? (
                <span className={`ml-2 ${active ? 'text-text-inverse-secondary' : 'text-text-muted'}`}>{count}</span>
              ) : null}
            </button>
          );
        })}
        {type !== 'all' && (
          <button type="button" onClick={() => changeType('all')} className="ml-auto min-h-10 text-sm font-medium text-text-link hover:text-text-link-hover">
            {locale === 'zh' ? '清除筛选' : 'Clear filter'}
          </button>
        )}
      </div>

      <div className="mb-5 flex flex-wrap items-center gap-x-3 gap-y-2 border-b border-border-subtle pb-4">
        <p id="search-results-summary" className="min-w-0 break-words text-sm text-text-secondary" aria-live="polite">
          {locale === 'zh'
            ? `找到 ${meta.total} 个与“${query}”相关的结果`
            : `Found ${meta.total} results for “${query}”`}
        </p>
        {meta.fallbackUsed && (
          <span className="rounded-[6px] bg-bg-muted px-2 py-1 text-xs text-text-secondary">
            {locale === 'zh' ? '基础搜索结果' : 'Basic search results'}
          </span>
        )}
      </div>

      <div aria-busy={loading}>
        {error ? (
          <ErrorState message={error} locale={locale} onRetry={() => run(type, page)} />
        ) : loading ? (
          <SearchResultsSkeleton locale={locale} />
        ) : data.length === 0 ? (
          <EmptyState
            icon="⌕"
            title={
              locale === 'zh'
                ? `未找到与“${query}”相关的${type === 'all' ? '' : labelFor(type) + ' '}结果`
                : `No ${type === 'all' ? '' : `${labelFor(type)} `}results found for “${query}”`
            }
            description={
              locale === 'zh'
                ? '换一个关键词，或清除类型筛选后再试。'
                : 'Try another keyword or clear the result type filter.'
            }
            action={type !== 'all' ? (
              <button type="button" onClick={() => changeType('all')} className="min-h-10 rounded-[8px] bg-text-primary px-4 text-sm font-medium text-text-inverse">
                {locale === 'zh' ? '清除筛选' : 'Clear filter'}
              </button>
            ) : undefined}
          />
        ) : (
          <>
            <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
              {data.map((item) => (
                <SearchResultCard key={`${item.type}-${item.id}`} item={item} locale={locale} query={query} />
              ))}
            </div>

            {meta.totalPages > 1 && (
              <nav className="mt-8 flex flex-wrap items-center justify-center gap-1" aria-label={locale === 'zh' ? '搜索结果分页' : 'Search result pagination'}>
                <button
                  type="button"
                  disabled={page <= 1}
                  onClick={() => changePage(page - 1)}
                  className="min-h-10 rounded-[8px] px-3 text-sm font-medium text-text-secondary hover:bg-bg-muted hover:text-text-primary disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {locale === 'zh' ? '上一页' : 'Prev'}
                </button>
                {pages.map((item, index) => item === 'ellipsis' ? (
                  <span key={`ellipsis-${index}`} className="inline-flex h-10 w-8 items-center justify-center text-text-muted" aria-hidden="true">…</span>
                ) : (
                  <button
                    key={item}
                    type="button"
                    aria-current={item === page ? 'page' : undefined}
                    onClick={() => changePage(item)}
                    className={`inline-flex h-10 min-w-10 items-center justify-center rounded-[8px] px-2 text-sm font-medium ${
                      item === page ? 'bg-text-primary text-text-inverse shadow-xs' : 'text-text-secondary hover:bg-bg-muted hover:text-text-primary'
                    }`}
                  >
                    {item}
                  </button>
                ))}
                <button
                  type="button"
                  disabled={page >= meta.totalPages}
                  onClick={() => changePage(page + 1)}
                  className="min-h-10 rounded-[8px] px-3 text-sm font-medium text-text-secondary hover:bg-bg-muted hover:text-text-primary disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {locale === 'zh' ? '下一页' : 'Next'}
                </button>
              </nav>
            )}
          </>
        )}
      </div>
    </section>
  );
}
