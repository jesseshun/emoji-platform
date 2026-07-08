'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { Locale } from '@/lib/types';

interface SearchBoxProps {
  locale: Locale;
  placeholder?: string;
  defaultValue?: string;
}

export function SearchBox({ locale, placeholder, defaultValue = '' }: SearchBoxProps) {
  const [query, setQuery] = useState(defaultValue);
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = query.trim();
    if (!trimmed) return;
    router.push(`/${locale}/search?q=${encodeURIComponent(trimmed)}`);
  };

  const defaultPlaceholder =
    locale === 'zh'
      ? '搜索 Emoji、关键词、Unicode 编码...'
      : 'Search emojis, keywords, Unicode...';

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-xl mx-auto">
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={placeholder || defaultPlaceholder}
          className="w-full px-4 py-3 pr-12 text-base rounded-xl border border-gray-300 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
        />
        <button
          type="submit"
          className="absolute right-2 top-1/2 -translate-y-1/2 px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          {locale === 'zh' ? '搜索' : 'Search'}
        </button>
      </div>
    </form>
  );
}
