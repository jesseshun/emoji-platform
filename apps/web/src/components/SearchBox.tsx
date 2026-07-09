'use client';

import { useState, useRef } from 'react';
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
  const [submitting, setSubmitting] = useState(false);
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

  const doSearch = (raw: string) => {
    const trimmed = raw.trim();
    if (!trimmed) {
      // Empty query: keep focus, do not navigate. Behavior is consistent
      // across desktop and mobile.
      inputRef.current?.focus();
      return;
    }
    setSubmitting(true);
    router.push(`/${locale}/search?q=${encodeURIComponent(trimmed)}`);
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

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-xl mx-auto">
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={placeholder || defaultPlaceholder}
          autoFocus={autoFocus}
          aria-label={locale === 'zh' ? '搜索 Emoji' : 'Search emojis'}
          className="w-full px-4 py-3 pr-20 text-base rounded-xl border border-gray-300 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
        />
        {query ? (
          <button
            type="button"
            onClick={clearInput}
            aria-label={locale === 'zh' ? '清空' : 'Clear'}
            className="absolute right-16 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition"
          >
            ✕
          </button>
        ) : null}
        <button
          type="submit"
          disabled={submitting}
          className="absolute right-2 top-1/2 -translate-y-1/2 px-3 py-1.5 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-60 transition"
        >
          {locale === 'zh' ? '搜索' : 'Search'}
        </button>
      </div>
    </form>
  );
}
