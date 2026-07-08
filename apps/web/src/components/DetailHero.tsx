import Link from 'next/link';
import { CopyButton } from './CopyButton';
import type { Locale } from '@/lib/types';

interface DetailHeroProps {
  emojiChar: string;
  emojiId: string;
  name: string | null;
  shortName: string | null;
  oneLineMeaning: string | null;
  locale: Locale;
  category?: {
    slug: string;
    name: string | null;
  } | null;
}

export function DetailHero({
  emojiChar,
  emojiId,
  name,
  shortName,
  oneLineMeaning,
  locale,
  category,
}: DetailHeroProps) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 sm:p-8 mb-8">
      <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
        {/* Large Emoji */}
        <div className="flex-shrink-0 w-24 h-24 flex items-center justify-center bg-gray-50 rounded-2xl border border-gray-100">
          <span className="text-5xl sm:text-6xl leading-none select-none">{emojiChar}</span>
        </div>

        {/* Info */}
        <div className="flex-1 text-center sm:text-left">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1">
            {emojiChar} {name || ''}
          </h1>

          {shortName && (
            <p className="text-sm text-gray-500 font-mono mb-2">{shortName}</p>
          )}

          {oneLineMeaning && (
            <p className="text-base text-gray-700 mb-4">{oneLineMeaning}</p>
          )}

          <div className="flex flex-wrap items-center gap-3 justify-center sm:justify-start">
            <CopyButton emojiChar={emojiChar} emojiId={emojiId} locale={locale} />

            {category && (
              <Link
                href={`/${locale}/categories/${category.slug}`}
                className="text-xs px-2.5 py-1 rounded-md border border-blue-200 bg-blue-50 text-blue-600 hover:bg-blue-100 transition"
              >
                {category.name || category.slug}
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
