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
      <h2 className="mb-4 text-xl font-semibold text-text-primary">
        {locale === 'zh' ? '相关 Emoji' : 'Related Emojis'}
      </h2>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
        {display.map((emoji) => (
          <div
            key={emoji.id}
            className="rounded-[8px] border border-border-subtle bg-surface p-3 transition-all duration-fast hover:border-border-strong hover:shadow-sm"
          >
            <Link href={`/${locale}/emoji/${emoji.slug}`} className="mb-2 block rounded-[6px] text-center">
              <span className="text-3xl leading-none" role="img" aria-label={emoji.translation?.name || emoji.slug}>{emoji.emojiChar}</span>
            </Link>
            <p className="mb-2 truncate text-center text-xs text-text-primary">
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
