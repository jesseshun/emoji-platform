import Link from 'next/link';
import { CopyButton } from './CopyButton';
import type { RelatedEmoji, Locale } from '@/lib/types';

interface RelatedEmojisProps {
  emojis: RelatedEmoji[];
  locale: Locale;
}

export function RelatedEmojis({ emojis, locale }: RelatedEmojisProps) {
  if (!emojis || emojis.length === 0) return null;

  const display = emojis.slice(0, 12);

  return (
    <section className="mt-8">
      <h2 className="text-xl font-bold text-gray-900 mb-4">
        {locale === 'zh' ? '相关 Emoji' : 'Related Emojis'}
      </h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
        {display.map((emoji) => (
          <div
            key={emoji.id}
            className="bg-white rounded-lg border border-gray-200 p-3 hover:shadow-sm transition-shadow"
          >
            <Link href={`/${locale}/emoji/${emoji.slug}`} className="block text-center mb-2">
              <span className="text-3xl leading-none">{emoji.emojiChar}</span>
            </Link>
            <p className="text-xs text-gray-700 text-center truncate mb-2">
              {emoji.translation?.name || emoji.slug}
            </p>
            <div className="flex justify-center">
              <CopyButton emojiChar={emoji.emojiChar} emojiId={emoji.id} locale={locale} />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
