'use client';

import { useEffect, useRef, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import type { Locale } from '@/lib/types';

interface SearchBoxProps {
  locale: Locale;
  placeholder?: string;
  defaultValue?: string;
  autoFocus?: boolean;
}

export function SearchBox({ locale, placeholder, defaultValue = '', autoFocus }: SearchBoxProps) {
  const [query, setQuery] = useState(defaultValue);
  const [submitting, startTransition] = useTransition();
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setQuery(defaultValue);
  }, [defaultValue]);

  const doSearch = (raw: string) => {
    const trimmed = raw.trim();
    if (!trimmed) {
      // Empty query: keep focus, do not navigate. Behavior is consistent
      // across desktop and mobile.
      inputRef.current?.focus();
      return;
    }
    startTransition(() => {
      router.push(`/${locale}/search?q=${encodeURIComponent(trimmed)}`);
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    doSearch(query);
  };

  const clearInput = () => {
    setQuery('');
    inputRef.current?.focus();
  };

  const defaultPlaceholder =
    locale === 'zh'
      ? '搜索 Emoji、关键词、Unicode 编码...'
      : 'Search emojis, keywords, Unicode...';

  const searchLabel = locale === 'zh' ? '搜索' : 'Search';

  return (
    <form onSubmit={handleSubmit} className="w-full" role="search">
      <div className="relative flex min-h-14 items-center rounded-[8px] border border-border bg-surface shadow-sm transition-all duration-fast focus-within:border-border-focus focus-within:ring-[3px] focus-within:ring-accent-subtle">
        <span className="pointer-events-none absolute left-4 text-text-muted" aria-hidden="true">
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <circle cx="8" cy="8" r="5.25" stroke="currentColor" strokeWidth="1.5" />
            <path d="m12 12 3.5 3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </span>
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={placeholder || defaultPlaceholder}
          autoFocus={autoFocus}
          aria-label={locale === 'zh' ? '搜索 Emoji' : 'Search emojis'}
          autoComplete="off"
          enterKeyHint="search"
          spellCheck={false}
          className="min-w-0 flex-1 bg-transparent py-3.5 pl-12 pr-2 text-base text-text-primary placeholder:text-text-muted focus:outline-none"
        />
        {query ? (
          <button
            type="button"
            onClick={clearInput}
            aria-label={locale === 'zh' ? '清空' : 'Clear'}
            title={locale === 'zh' ? '清空搜索' : 'Clear search'}
            className="mr-1 inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-[8px] text-text-muted transition-colors duration-fast hover:bg-bg-subtle hover:text-text-primary"
          >
            <span aria-hidden="true">×</span>
          </button>
        ) : null}
        <button
          type="submit"
          disabled={submitting}
          className="mr-1.5 inline-flex min-h-11 shrink-0 items-center justify-center rounded-[8px] bg-text-primary px-4 text-sm font-semibold text-text-inverse shadow-xs transition-all duration-fast hover:opacity-90 active:translate-y-px disabled:cursor-wait disabled:opacity-60 sm:px-5"
        >
          {submitting ? (locale === 'zh' ? '搜索中' : 'Searching') : searchLabel}
        </button>
      </div>
    </form>
  );
}
