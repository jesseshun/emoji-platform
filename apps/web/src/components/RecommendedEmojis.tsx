import Link from 'next/link';
import { getEmojis } from '@/lib/api';
import { EmojiGrid } from './EmojiGrid';
import type { Locale } from '@/lib/types';

interface RecommendedEmojisProps {
  locale: Locale;
  title: string;
  viewAllHref: string;
  limit?: number;
}

/**
 * Server component that fetches a few popular/recommended emojis and renders
 * them in a grid. Used on the search landing (empty query) and on the
 * no-results / error states so the page is never blank. A fetch failure is
 * swallowed and renders nothing — it must never break the search page.
 */
export async function RecommendedEmojis({
  locale,
  title,
  viewAllHref,
  limit = 12,
}: RecommendedEmojisProps) {
  let emojis: Awaited<ReturnType<typeof getEmojis>>['data'] | null = null;
  try {
    const data = await getEmojis(locale, 1, limit);
    emojis = data.data ?? null;
  } catch {
    emojis = null;
  }

  if (!emojis || emojis.length === 0) return null;

  return (
    <section className="mt-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
        <Link
          href={viewAllHref}
          className="text-sm text-blue-600 hover:text-blue-700 transition"
        >
          {locale === 'zh' ? '查看全部 →' : 'View all →'}
        </Link>
      </div>
      <EmojiGrid emojis={emojis} locale={locale} />
    </section>
  );
}
