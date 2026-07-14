import Link from 'next/link';
import type { CategoryItem, Locale } from '@/lib/types';

interface RelatedCategoriesProps {
  categories: CategoryItem[];
  locale: Locale;
}

/**
 * Phase 6D: "related categories" module for the category detail page.
 * Renders child / sibling categories with real, published-only links.
 */
export function RelatedCategories({ categories, locale }: RelatedCategoriesProps) {
  if (!categories || categories.length === 0) return null;

  const display = categories.slice(0, 6);

  return (
    <section className="mt-8">
      <h2 className="text-xl font-bold text-gray-900 mb-4">
        {locale === 'zh' ? '相关分类' : 'Related Categories'}
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {display.map((category) => {
          const name = category.translation?.name || category.slug;
          const description = category.translation?.description;
          const icon = category.iconEmoji || '📁';
          return (
            <Link
              key={category.id}
              href={`/${locale}/categories/${category.slug}`}
              className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow group"
            >
              <div className="flex items-center gap-3 mb-1">
                <span className="text-2xl">{icon}</span>
                <h3 className="text-sm font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                  {name}
                </h3>
              </div>
              {category.emojiCount > 0 && (
                <span className="text-xs text-gray-400">
                  {category.emojiCount} {locale === 'zh' ? '个表情' : 'emojis'}
                </span>
              )}
              {description && (
                <p className="text-xs text-gray-500 line-clamp-2 mt-1">{description}</p>
              )}
            </Link>
          );
        })}
      </div>
    </section>
  );
}
