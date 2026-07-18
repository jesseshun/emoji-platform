import type { EmojiBase, Locale } from '@/lib/types';
import { EmojiCard } from './EmojiCard';

interface EmojiGridProps {
  emojis: EmojiBase[];
  locale: Locale;
}

export function EmojiGrid({ emojis, locale }: EmojiGridProps) {
  if (!emojis || emojis.length === 0) return null;

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:gap-4 lg:grid-cols-4 xl:grid-cols-5">
      {emojis.map((emoji) => (
        <EmojiCard key={emoji.id} emoji={emoji} locale={locale} />
      ))}
    </div>
  );
}
