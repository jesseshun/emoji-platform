'use client';

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
  useCallback,
  type ReactNode,
} from 'react';
import { useRouter } from 'next/navigation';
import { search, recordCopyEvent } from '@/lib/api';
import { copyText } from '@/lib/clipboard';
import { showToast } from '@/components/ui/Toast';
import { LoadingSkeleton } from '@/components/ui/LoadingSkeleton';
import type { Locale, SearchItem, SearchResponse } from '@/lib/types';

interface CommandPaletteContextValue {
  open: () => void;
  close: () => void;
  toggle: () => void;
  isOpen: boolean;
}

const CommandPaletteContext = createContext<CommandPaletteContextValue | null>(null);

export function useCommandPalette() {
  const ctx = useContext(CommandPaletteContext);
  if (!ctx) {
    // Safe no-op fallback when used outside provider (should not happen).
    return {
      open: () => {},
      close: () => {},
      toggle: () => {},
      isOpen: false,
    };
  }
  return ctx;
}

interface ProviderProps {
  locale: Locale;
  children: ReactNode;
}

export function CommandPaletteProvider({ locale, children }: ProviderProps) {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();
  const triggerRef = useRef<HTMLElement | null>(null);

  const open = useCallback(() => {
    triggerRef.current = (document.activeElement as HTMLElement) || null;
    setIsOpen(true);
  }, []);

  const close = useCallback(() => {
    setIsOpen(false);
    // Restore focus to the element that opened the palette.
    requestAnimationFrame(() => {
      triggerRef.current?.focus?.();
      triggerRef.current = null;
    });
  }, []);

  const toggle = useCallback(() => {
    setIsOpen((v) => {
      if (!v) triggerRef.current = (document.activeElement as HTMLElement) || null;
      return !v;
    });
  }, []);

  // Global Cmd/Ctrl+K listener.
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        toggle();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [toggle]);

  const value: CommandPaletteContextValue = { open, close, toggle, isOpen };

  return (
    <CommandPaletteContext.Provider value={value}>
      {children}
      {isOpen && <CommandPaletteOverlay locale={locale} onClose={close} router={router} />}
    </CommandPaletteContext.Provider>
  );
}

/* ───────────────────────────────────────────────────────
   Palette Overlay
   ─────────────────────────────────────────────────────── */

interface OverlayProps {
  locale: Locale;
  onClose: () => void;
  router: ReturnType<typeof useRouter>;
}

function CommandPaletteOverlay({ locale, onClose, router }: OverlayProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const prefix = `/${locale}`;
  const labels = PALETTE_LABELS[locale];

  // Focus the input on mount.
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Esc closes.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  // Lock body scroll while open.
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  // Debounced search.
  useEffect(() => {
    const q = query.trim();
    if (!q) {
      setResults([]);
      setLoading(false);
      setError(null);
      return;
    }
    setLoading(true);
    setError(null);
    const controller = new AbortController();
    const timer = setTimeout(async () => {
      try {
        const res: SearchResponse = await search(locale, q, {
          type: 'all',
          limit: 12,
        });
        if (!controller.signal.aborted) {
          setResults(res.data);
          setActiveIndex(0);
          setLoading(false);
        }
      } catch {
        if (!controller.signal.aborted) {
          setResults([]);
          setError(labels.searchError);
          setLoading(false);
        }
      }
    }, 220);
    return () => {
      controller.abort();
      clearTimeout(timer);
    };
  }, [query, locale, labels]);

  const performCopy = useCallback(
    async (item: SearchItem) => {
      if (item.type !== 'emoji') return;
      const ok = await copyText(item.emojiChar);
      if (!ok) {
        showToast(
          locale === 'zh' ? '复制失败，请重试' : 'Copy failed, please try again',
          'error',
        );
        return;
      }
      showToast(
        locale === 'zh' ? `已复制 ${item.emojiChar}` : `Copied! ${item.emojiChar}`,
        'success',
      );
      // Fire-and-forget copy event; never block UX on failure.
      recordCopyEvent(
        item.id,
        locale,
        typeof window !== 'undefined' ? window.location.pathname : undefined,
      ).catch(() => {});
      onClose();
    },
    [locale, onClose],
  );

  const goToResult = useCallback(
    (item: SearchItem) => {
      if (item.type === 'emoji') {
        router.push(`${prefix}/emoji/${item.slug}`);
      } else if (item.type === 'category') {
        router.push(`${prefix}/categories/${item.slug}`);
      } else if (item.type === 'topic') {
        router.push(`${prefix}/topics/${item.slug}`);
      } else if (item.type === 'article') {
        router.push(`${prefix}/articles/${item.slug}`);
      }
      onClose();
    },
    [router, prefix, onClose],
  );

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, Math.max(results.length - 1, 0)));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const item = results[activeIndex];
      if (item) {
        if (item.type === 'emoji') {
          performCopy(item);
        } else {
          goToResult(item);
        }
      } else if (query.trim()) {
        // No result selected → go to full search page.
        router.push(`${prefix}/search?q=${encodeURIComponent(query.trim())}`);
        onClose();
      }
    }
  };

  // Quick links when query is empty.
  const quickLinks = QUICK_LINKS[locale];

  return (
    <div className="fixed inset-0 z-modal flex items-start justify-center px-4 pt-[12vh] sm:pt-[16vh]">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/30 backdrop-blur-[2px] animate-fade-in"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Panel */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label={labels.title}
        className="relative w-full max-w-xl max-h-[70vh] flex flex-col
                   bg-surface-elevated rounded-2xl border border-border-subtle
                   shadow-lg animate-scale-in overflow-hidden"
      >
        {/* Search input */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-border-subtle">
          <svg width="18" height="18" viewBox="0 0 16 16" fill="none" className="text-text-muted shrink-0" aria-hidden="true">
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
            onKeyDown={onKeyDown}
            placeholder={labels.placeholder}
            aria-label={labels.searchLabel}
            className="flex-1 bg-transparent outline-none text-[15px] text-text-primary placeholder:text-text-muted"
          />
          {query && (
            <button
              onClick={() => {
                setQuery('');
                inputRef.current?.focus();
              }}
              className="p-1 rounded-md text-text-muted hover:text-text-primary hover:bg-bg-subtle transition-colors"
              aria-label={labels.clear}
            >
              <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
                <path d="M4 4l8 8M12 4L4 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </button>
          )}
          <kbd className="hidden sm:inline-flex items-center px-1.5 py-0.5 text-[11px] font-medium text-text-muted bg-bg-subtle rounded border border-border-subtle leading-none">
            ESC
          </kbd>
        </div>

        {/* Results */}
        <div ref={listRef} className="flex-1 overflow-y-auto p-2">
          {!query.trim() && (
            <div className="px-2 py-2">
              <p className="text-xs font-medium text-text-muted uppercase tracking-wider px-2 py-1.5">
                {labels.quickLinks}
              </p>
              {quickLinks.map((link) => (
                <button
                  key={link.href}
                  onClick={() => {
                    router.push(link.href);
                    onClose();
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left
                             text-text-primary hover:bg-bg-subtle transition-colors duration-fast"
                >
                  <span className="text-lg">{link.icon}</span>
                  <span className="text-sm font-medium">{link.label}</span>
                </button>
              ))}
            </div>
          )}

          {query.trim() && loading && (
            <div className="space-y-2 p-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <LoadingSkeleton key={i} className="h-12 rounded-lg" />
              ))}
            </div>
          )}

          {query.trim() && !loading && error && (
            <div className="flex flex-col items-center justify-center py-10 px-4 text-center">
              <span className="text-3xl mb-3" role="img" aria-hidden="true">⚠️</span>
              <p className="text-sm text-text-secondary mb-3">{error}</p>
              <button
                onClick={() => setQuery((q) => q + ' ')}
                className="px-3 py-1.5 text-sm font-medium rounded-lg bg-accent text-white hover:bg-accent-hover transition-colors"
              >
                {labels.retry}
              </button>
            </div>
          )}

          {query.trim() && !loading && !error && results.length === 0 && (
            <div className="flex flex-col items-center justify-center py-10 px-4 text-center">
              <span className="text-3xl mb-3" role="img" aria-hidden="true">🔍</span>
              <p className="text-sm text-text-secondary">{labels.noResults}</p>
            </div>
          )}

          {!loading && !error && results.length > 0 && (
            <ul role="listbox" aria-label={labels.results} className="space-y-0.5">
              {results.map((item, i) => (
                <li key={`${item.type}-${item.id}`} role="option" aria-selected={i === activeIndex}>
                  <ResultRow
                    item={item}
                    active={i === activeIndex}
                    locale={locale}
                    onHover={() => setActiveIndex(i)}
                    onActivate={() => (item.type === 'emoji' ? performCopy(item) : goToResult(item))}
                  />
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Footer hint */}
        <div className="flex items-center justify-between px-4 py-2.5 border-t border-border-subtle text-xs text-text-muted">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <kbd className="px-1 py-0.5 bg-bg-subtle rounded border border-border-subtle text-[10px]">↑</kbd>
              <kbd className="px-1 py-0.5 bg-bg-subtle rounded border border-border-subtle text-[10px]">↓</kbd>
              {labels.navigate}
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1 py-0.5 bg-bg-subtle rounded border border-border-subtle text-[10px]">↵</kbd>
              {labels.open}
            </span>
          </div>
          <span>{labels.escToClose}</span>
        </div>
      </div>
    </div>
  );
}

/* ───────────────────────────────────────────────────────
   Result Row
   ─────────────────────────────────────────────────────── */

function ResultRow({
  item,
  active,
  locale,
  onHover,
  onActivate,
}: {
  item: SearchItem;
  active: boolean;
  locale: Locale;
  onHover: () => void;
  onActivate: () => void;
}) {
  const typeLabel = TYPE_LABELS[locale][item.type];
  const title = getResultTitle(item);
  const subtitle = getResultSubtitle(item);

  return (
    <div
      onMouseEnter={onHover}
      onClick={onActivate}
      className={`flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-colors duration-fast ${
        active ? 'bg-accent-subtle' : 'hover:bg-bg-subtle'
      }`}
    >
      {/* Icon */}
      <span className="flex items-center justify-center w-9 h-9 rounded-lg bg-bg-subtle text-lg shrink-0">
        {item.type === 'emoji' ? item.emojiChar : getTypeIcon(item.type)}
      </span>

      {/* Text */}
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-text-primary truncate">{title}</span>
          <span className="text-[10px] uppercase tracking-wide px-1.5 py-0.5 rounded-full bg-bg-muted text-text-muted shrink-0">
            {typeLabel}
          </span>
        </div>
        {subtitle && <p className="text-xs text-text-muted truncate">{subtitle}</p>}
      </div>

      {/* Action hint */}
      {item.type === 'emoji' ? (
        <span className="text-[11px] text-text-muted shrink-0">{locale === 'zh' ? '复制' : 'Copy'}</span>
      ) : (
        <span className="text-[11px] text-text-muted shrink-0">{locale === 'zh' ? '打开' : 'Open'}</span>
      )}
    </div>
  );
}

/* ───────────────────────────────────────────────────────
   Helpers
   ─────────────────────────────────────────────────────── */

function getTypeIcon(type: SearchItem['type']) {
  switch (type) {
    case 'category':
      return '📂';
    case 'topic':
      return '📚';
    case 'article':
      return '📄';
    default:
      return '🔣';
  }
}

function getResultTitle(item: SearchItem): string {
  switch (item.type) {
    case 'emoji':
      return item.translation?.name || item.slug;
    case 'category':
      return item.name || item.slug;
    case 'topic':
      return item.title || item.slug;
    case 'article':
      return item.title || item.slug;
    default:
      // Unreachable: SearchItem is a closed union exhausted above.
      return '';
  }
}

function getResultSubtitle(item: SearchItem): string | null {
  switch (item.type) {
    case 'emoji':
      return item.translation?.oneLineMeaning || item.shortcode || null;
    case 'category':
      return item.description
        ? `${item.emojiCount} ${item.emojiCount === 1 ? 'emoji' : 'emojis'}`
        : `${item.emojiCount} ${item.emojiCount === 1 ? 'emoji' : 'emojis'}`;
    case 'topic':
      return item.summary;
    case 'article':
      return item.summary;
    default:
      return null;
  }
}

/* ───────────────────────────────────────────────────────
   Static label/config maps
   ─────────────────────────────────────────────────────── */

const PALETTE_LABELS: Record<Locale, {
  title: string;
  placeholder: string;
  searchLabel: string;
  clear: string;
  quickLinks: string;
  results: string;
  noResults: string;
  searchError: string;
  retry: string;
  navigate: string;
  open: string;
  escToClose: string;
}> = {
  zh: {
    title: '全局搜索',
    placeholder: '搜索 Emoji、分类、专题或文章...',
    searchLabel: '搜索',
    clear: '清空',
    quickLinks: '快速导航',
    results: '搜索结果',
    noResults: '没有找到相关结果',
    searchError: '搜索失败，请稍后重试',
    retry: '重试',
    navigate: '选择',
    open: '打开',
    escToClose: 'Esc 关闭',
  },
  en: {
    title: 'Search',
    placeholder: 'Search emojis, categories, topics or articles...',
    searchLabel: 'Search',
    clear: 'Clear',
    quickLinks: 'Quick navigation',
    results: 'Results',
    noResults: 'No results found',
    searchError: 'Search failed, please try again',
    retry: 'Retry',
    navigate: 'navigate',
    open: 'open',
    escToClose: 'Esc to close',
  },
};

const TYPE_LABELS: Record<Locale, Record<SearchItem['type'], string>> = {
  zh: { emoji: '表情', category: '分类', topic: '专题', article: '文章' },
  en: { emoji: 'Emoji', category: 'Category', topic: 'Topic', article: 'Article' },
};

const QUICK_LINKS: Record<Locale, { icon: string; label: string; href: string }[]> = {
  zh: [
    { icon: '🔣', label: '浏览全部表情', href: '/zh/emojis' },
    { icon: '📂', label: '浏览全部分类', href: '/zh/categories' },
    { icon: '📚', label: '浏览全部专题', href: '/zh/topics' },
    { icon: '📄', label: '查看文章指南', href: '/zh/articles' },
    { icon: '🔍', label: '高级搜索页面', href: '/zh/search' },
  ],
  en: [
    { icon: '🔣', label: 'Browse all emojis', href: '/en/emojis' },
    { icon: '📂', label: 'Browse all categories', href: '/en/categories' },
    { icon: '📚', label: 'Browse all topics', href: '/en/topics' },
    { icon: '📄', label: 'Read articles & guides', href: '/en/articles' },
    { icon: '🔍', label: 'Advanced search page', href: '/en/search' },
  ],
};
