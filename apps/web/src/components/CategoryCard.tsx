import Link from 'next/link';
import type { CategoryItem, Locale } from '@/lib/types';

interface CategoryCardProps {
  category: CategoryItem;
  locale: Locale;
}

export function CategoryCard({ category, locale }: CategoryCardProps) {
  const name = category.translation?.name || category.slug;
  const description = category.translation?.description;
  const icon = category.iconEmoji || '📁';

  return (
    <Link
      href={`/${locale}/categories/${category.slug}`}
      className="bg-surface rounded-lg border border-border-subtle p-5 hover:border-border hover:shadow-sm transition-all duration-fast group block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-border-focus)]"
    >
      <div className="flex items-center gap-3 mb-3">
        <span className="text-3xl">{icon}</span>
        <div>
          <h3 className="text-base font-semibold text-text-primary group-hover:text-accent transition-colors duration-fast">
            {name}
          </h3>
          {category.emojiCount > 0 && (
            <span className="text-xs text-text-muted">
              {category.emojiCount} {locale === 'zh' ? '个表情' : 'emojis'}
            </span>
          )}
        </div>
      </div>
      {description && (
        <p className="text-sm text-text-secondary line-clamp-2">{description}</p>
      )}
    </Link>
  );
}
