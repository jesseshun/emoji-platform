import type { EmojiBase, Locale } from '@/lib/types';
import { EmojiCard } from './EmojiCard';

interface EmojiGridProps {
  emojis: EmojiBase[];
  locale: Locale;
}

export function EmojiGrid({ emojis, locale }: EmojiGridProps) {
  if (!emojis || emojis.length === 0) return null;

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
      {emojis.map((emoji) => (
        <EmojiCard key={emoji.id} emoji={emoji} locale={locale} />
      ))}
    </div>
  );
}
