import { CategoryCard } from '@/components/CategoryCard';
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
    <section className="mt-10 border-t border-border-subtle pt-8">
      <h2 className="mb-4 text-xl font-semibold text-text-primary">
        {locale === 'zh' ? '相关分类' : 'Related Categories'}
      </h2>
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        {display.map((category) => (
          <CategoryCard key={category.id} category={category} locale={locale} variant="compact" />
        ))}
      </div>
    </section>
  );
}
