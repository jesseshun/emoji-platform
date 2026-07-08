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
    <div className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md transition-shadow group">
      <Link href={`/${locale}/emoji/${emoji.slug}`} className="block">
        <div className="flex items-center justify-center h-16 mb-3">
          <span className="text-4xl leading-none">{emoji.emojiChar}</span>
        </div>
        <h3 className="text-sm font-medium text-gray-900 truncate mb-1">{name}</h3>
      </Link>
      {meaning && (
        <p className="text-xs text-gray-500 truncate mb-2">{meaning}</p>
      )}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 min-w-0">
          {categoryName && (
            <span className="text-xs text-gray-400 truncate">{categoryName}</span>
          )}
          {shortcode && (
            <span className="text-xs text-gray-300 font-mono truncate">{shortcode}</span>
          )}
        </div>
        <CopyButton emojiChar={emoji.emojiChar} emojiId={emoji.id} locale={locale} />
      </div>
    </div>
  );
}
