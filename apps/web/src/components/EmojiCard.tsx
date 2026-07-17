import Link from 'next/link';
import { CopyButton } from './CopyButton';
import type { EmojiBase, Locale } from '@/lib/types';

interface EmojiCardProps {
  emoji: EmojiBase;
  locale: Locale;
}

export function EmojiCard({ emoji, locale }: EmojiCardProps) {
  const name = emoji.translation?.name || emoji.slug;
  const meaning = emoji.translation?.oneLineMeaning;
  const categoryName = emoji.category?.name;
  const shortcode = emoji.shortcode;

  return (
    <div className="bg-surface rounded-lg border border-border-subtle p-4 hover:border-border hover:shadow-sm transition-all duration-fast group">
      <Link
        href={`/${locale}/emoji/${emoji.slug}`}
        className="block rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-border-focus)]"
      >
        <div className="flex items-center justify-center h-16 mb-3">
          <span className="text-4xl leading-none">{emoji.emojiChar}</span>
        </div>
        <h3 className="text-sm font-medium text-text-primary truncate mb-1 group-hover:text-accent transition-colors duration-fast">
          {name}
        </h3>
      </Link>
      {meaning && (
        <p className="text-xs text-text-secondary truncate mb-2">{meaning}</p>
      )}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 min-w-0">
          {categoryName && (
            <span className="text-xs text-text-muted truncate">{categoryName}</span>
          )}
          {shortcode && (
            <span className="text-xs text-text-muted font-mono truncate opacity-70">
              {shortcode}
            </span>
          )}
        </div>
        <CopyButton emojiChar={emoji.emojiChar} emojiId={emoji.id} locale={locale} />
      </div>
    </div>
  );
}
