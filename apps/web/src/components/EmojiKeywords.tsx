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
    <section className="mt-8">
      <h2 className="text-xl font-bold text-gray-900 mb-4">
        {locale === 'zh' ? '关键词' : 'Keywords'}
      </h2>
      <div className="flex flex-wrap gap-2">
        {parsed.map((kw, index) => (
          <Link
            key={index}
            href={`/${locale}/search?q=${encodeURIComponent(kw)}`}
            className="inline-block text-xs px-3 py-1.5 rounded-full bg-gray-100 text-gray-600 hover:bg-blue-50 hover:text-blue-600 transition-colors"
          >
            {kw}
          </Link>
        ))}
      </div>
    </section>
  );
}
