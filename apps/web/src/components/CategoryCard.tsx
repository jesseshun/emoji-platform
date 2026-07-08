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
      className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow group block"
    >
      <div className="flex items-center gap-3 mb-3">
        <span className="text-3xl">{icon}</span>
        <div>
          <h3 className="text-base font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
            {name}
          </h3>
          {category.emojiCount > 0 && (
            <span className="text-xs text-gray-400">
              {category.emojiCount} {locale === 'zh' ? '个表情' : 'emojis'}
            </span>
          )}
        </div>
      </div>
      {description && (
        <p className="text-sm text-gray-500 line-clamp-2">{description}</p>
      )}
    </Link>
  );
}
