import Link from 'next/link';
import type { CategoryItem, Locale } from '@/lib/types';

interface CategoryCardProps {
  category: CategoryItem;
  locale: Locale;
  variant?: 'card' | 'row' | 'compact';
}

export function CategoryCard({ category, locale, variant = 'card' }: CategoryCardProps) {
  const name = category.translation?.name || category.slug;
  const description = category.translation?.description;
  const icon = category.iconEmoji || '📁';
  const countLabel = locale === 'zh'
    ? `${category.emojiCount.toLocaleString('zh-CN')} 个表情`
    : `${category.emojiCount.toLocaleString('en-US')} ${category.emojiCount === 1 ? 'emoji' : 'emojis'}`;
  const isRow = variant === 'row';
  const isCompact = variant === 'compact';

  return (
    <Link
      href={`/${locale}/categories/${category.slug}`}
      className={`group block min-w-0 rounded-[8px] transition-all duration-fast focus-visible:outline-none ${
        isRow
          ? 'px-3 py-4 hover:bg-bg-subtle sm:px-4'
          : isCompact
            ? 'border border-border-subtle bg-surface p-4 hover:border-border-strong hover:shadow-sm'
            : 'border border-border-subtle bg-surface p-5 hover:border-border-strong hover:shadow-sm'
      }`}
    >
      <div className={`flex min-w-0 items-start ${isCompact ? 'gap-3' : 'gap-4'}`}>
        <span
          className={`flex shrink-0 items-center justify-center rounded-[8px] bg-bg-subtle leading-none ${
            isCompact ? 'h-10 w-10 text-2xl' : 'h-12 w-12 text-3xl'
          }`}
          aria-hidden="true"
        >
          {icon}
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex min-w-0 items-center justify-between gap-3">
            <h3 className="truncate text-base font-semibold text-text-primary transition-colors duration-fast group-hover:text-text-link">
            {name}
            </h3>
            <span className="shrink-0 text-xs tabular-nums text-text-muted">{countLabel}</span>
          </div>
          {description && (
            <p className={`mt-1 text-sm leading-relaxed text-text-secondary ${isCompact ? 'line-clamp-2' : 'line-clamp-2 max-w-2xl'}`}>
              {description}
            </p>
          )}
          {!description && !isCompact && (
            <p className="mt-1 truncate text-xs text-text-muted">{category.slug}</p>
          )}
        </div>
      </div>
    </Link>
  );
}
