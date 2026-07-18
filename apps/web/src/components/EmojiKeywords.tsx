import Link from 'next/link';
import type { Locale } from '@/lib/types';

interface EmojiKeywordsProps {
  keywords: string[] | null | unknown;
  locale: Locale;
}

export function EmojiKeywords({ keywords, locale }: EmojiKeywordsProps) {
  let parsed: string[] = [];

  try {
    if (Array.isArray(keywords)) {
      parsed = keywords;
    } else if (typeof keywords === 'string') {
      parsed = JSON.parse(keywords);
    }
  } catch {
    return null;
  }

  if (!Array.isArray(parsed) || parsed.length === 0) return null;

  return (
    <section className="rounded-[8px] border border-border-subtle bg-surface p-4 shadow-xs">
      <h2 className="mb-3 text-sm font-semibold text-text-primary">
        {locale === 'zh' ? '关键词' : 'Keywords'}
      </h2>
      <div className="flex flex-wrap gap-2">
        {parsed.map((kw, index) => (
          <Link
            key={index}
            href={`/${locale}/search?q=${encodeURIComponent(kw)}`}
            className="inline-block min-h-8 rounded-[8px] bg-bg-subtle px-2.5 py-1.5 text-xs text-text-secondary transition-colors duration-fast hover:bg-accent-subtle hover:text-text-link"
          >
            {kw}
          </Link>
        ))}
      </div>
    </section>
  );
}
