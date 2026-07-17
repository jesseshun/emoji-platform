'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCommandPalette } from './CommandPalette';
import type { Locale } from '@/lib/types';

interface HomeHeroProps {
  locale: Locale;
}

const COPY: Record<Locale, {
  title: string;
  subtitle: string;
  placeholder: string;
  search: string;
  openPalette: string;
  typeLabel: string;
}> = {
  zh: {
    title: '搜索、理解、复制和发现每一个 Emoji',
    subtitle: '输入 Emoji、关键词或 Unicode 编码，快速找到你想要的表情符号。',
    placeholder: '搜索 Emoji、关键词、Unicode 编码...',
    search: '搜索',
    openPalette: '打开命令面板',
    typeLabel: '快速浏览',
  },
  en: {
    title: 'Search, understand, copy and discover every emoji',
    subtitle: 'Type an emoji, keyword, or Unicode codepoint to find exactly what you need.',
    placeholder: 'Search emojis, keywords, Unicode...',
    search: 'Search',
    openPalette: 'Open command palette',
    typeLabel: 'Quick browse',
  },
};

const TYPE_CHIPS: Record<Locale, { label: string; href: string; icon: string }[]> = {
  zh: [
    { label: '表情', href: '/emojis', icon: '🔣' },
    { label: '分类', href: '/categories', icon: '📂' },
    { label: '专题', href: '/topics', icon: '📚' },
    { label: '文章', href: '/articles', icon: '📄' },
  ],
  en: [
    { label: 'Emojis', href: '/emojis', icon: '🔣' },
    { label: 'Categories', href: '/categories', icon: '📂' },
    { label: 'Topics', href: '/topics', icon: '📚' },
    { label: 'Articles', href: '/articles', icon: '📄' },
  ],
};

export function HomeHero({ locale }: HomeHeroProps) {
  const [query, setQuery] = useState('');
  const [focused, setFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const { open: openPalette } = useCommandPalette();
  const c = COPY[locale];
  const prefix = `/${locale}`;

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = query.trim();
    if (!trimmed) {
      inputRef.current?.focus();
      return;
    }
    router.push(`${prefix}/search?q=${encodeURIComponent(trimmed)}`);
  };

  return (
    <section className="relative overflow-hidden">
      {/* Soft low-saturation gradient accent (decorative, not dominant) */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-[420px] opacity-60
                   bg-[radial-gradient(60%_120%_at_50%_0%,rgba(0,122,255,0.06),transparent_70%)]"
      />

      <div className="relative mx-auto max-w-content px-4 sm:px-6 pt-16 sm:pt-24 pb-12 sm:pb-16">
        <div className="text-center max-w-2xl mx-auto">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-tight text-text-primary mb-4">
            {c.title}
          </h1>
          <p className="text-base sm:text-lg text-text-secondary mb-8">{c.subtitle}</p>

          {/* Main search box — visual core */}
          <form onSubmit={submit} className="relative w-full max-w-xl mx-auto">
            <div
              className={`flex items-center gap-2 rounded-2xl bg-surface border pl-4 pr-2 py-2
                          transition-all duration-normal shadow-xs
                          ${focused ? 'border-accent ring-[3px] ring-accent-subtle shadow-card-hover' : 'border-border-subtle'}`}
            >
              <svg width="20" height="20" viewBox="0 0 16 16" fill="none" className="text-text-muted shrink-0" aria-hidden="true">
                <path
                  d="M7 12A5 5 0 107 2a5 5 0 000 10zM13 13l-3-3"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onFocus={() => setFocused(true)}
                onBlur={() => setFocused(false)}
                placeholder={c.placeholder}
                aria-label={c.search}
                className="flex-1 bg-transparent outline-none text-base text-text-primary placeholder:text-text-muted py-1.5"
              />
              {query ? (
                <button
                  type="button"
                  onClick={() => {
                    setQuery('');
                    inputRef.current?.focus();
                  }}
                  className="p-1.5 rounded-lg text-text-muted hover:text-text-primary hover:bg-bg-subtle transition-colors"
                  aria-label={locale === 'zh' ? '清空' : 'Clear'}
                >
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path d="M4 4l8 8M12 4L4 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                </button>
              ) : (
                <kbd className="hidden sm:inline-flex items-center px-1.5 py-0.5 text-[11px] font-medium text-text-muted bg-bg-subtle rounded border border-border-subtle leading-none shrink-0">
                  ⌘K
                </kbd>
              )}
              <button
                type="submit"
                className="px-4 py-2 text-sm font-medium bg-accent text-white rounded-xl
                           hover:bg-accent-hover active:bg-accent-hover transition-colors duration-fast shrink-0"
              >
                {c.search}
              </button>
            </div>
          </form>

          {/* Secondary: open Command Palette */}
          <button
            type="button"
            onClick={openPalette}
            className="mt-3 text-sm text-text-muted hover:text-text-link transition-colors duration-fast"
          >
            {locale === 'zh' ? '或按 ⌘K 打开命令面板快速搜索' : 'or press ⌘K to open the command palette'}
          </button>

          {/* Quick browse chips (real listing pages) */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-2">
            <span className="text-xs text-text-muted mr-1">{c.typeLabel}</span>
            {TYPE_CHIPS[locale].map((chip) => (
              <button
                key={chip.href}
                type="button"
                onClick={() => router.push(chip.href)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-pill text-sm
                           bg-surface border border-border-subtle text-text-secondary
                           hover:text-text-primary hover:border-border transition-all duration-fast"
              >
                <span aria-hidden="true">{chip.icon}</span>
                {chip.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
