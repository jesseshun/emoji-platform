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
    <article className="group flex h-[220px] min-w-0 flex-col rounded-[8px] border border-border-subtle bg-surface p-4 transition-all duration-fast hover:border-border-strong hover:shadow-sm">
      <Link
        href={`/${locale}/emoji/${emoji.slug}`}
        className="block min-w-0 rounded-[6px] focus-visible:outline-none"
      >
        <div className="mb-3 flex h-[76px] items-center justify-center rounded-[8px] bg-bg-subtle transition-colors duration-fast group-hover:bg-bg-muted">
          <span className="text-5xl leading-none" role="img" aria-label={name}>{emoji.emojiChar}</span>
        </div>
        <h3 className="mb-1 truncate text-sm font-semibold text-text-primary transition-colors duration-fast group-hover:text-text-link">
          {name}
        </h3>
      </Link>
      {meaning && (
        <p className="line-clamp-2 min-h-[2.25rem] text-xs leading-[1.125rem] text-text-secondary">{meaning}</p>
      )}
      <div className="mt-auto flex min-w-0 items-center justify-between gap-2 border-t border-border-subtle pt-3">
        <div className="flex min-w-0 items-center gap-1.5">
          {categoryName && (
            <span className="text-xs text-text-muted truncate">{categoryName}</span>
          )}
          {shortcode && (
            <span className="text-xs text-text-muted font-mono truncate opacity-70">
              {shortcode}
            </span>
          )}
        </div>
        <div className="flex shrink-0 items-center gap-1">
          <Link
            href={`/${locale}/emoji/${emoji.slug}`}
            className="inline-flex min-h-9 items-center rounded-[8px] px-2 text-xs font-medium text-text-link hover:bg-accent-subtle"
            aria-label={`${locale === 'zh' ? '查看详情' : 'View details'}: ${name}`}
          >
            <span aria-hidden="true">→</span>
          </Link>
          <CopyButton emojiChar={emoji.emojiChar} emojiId={emoji.id} locale={locale} />
        </div>
      </div>
    </article>
  );
}
