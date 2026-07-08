import type { Metadata } from 'next';

export const dynamic = 'force-dynamic';
import { CategoryCard } from '@/components/CategoryCard';
import { EmptyState } from '@/components/EmptyState';
import { ErrorState } from '@/components/ErrorState';
import { getCategories, getErrorMessage } from '@/lib/api';

export const metadata: Metadata = {
  title: 'Emoji Categories',
  description: 'Browse Emoji characters by category.',
};

export default async function EnCategoriesPage() {
  try {
    const data = await getCategories('en');

    if (!data.data || data.data.length === 0) {
      return (
        <div className="max-w-6xl mx-auto px-4 py-8">
          <EmptyState
            icon="📂"
            title="No categories available"
            description="Category data is being prepared. Please check back later."
          />
        </div>
      );
    }

    return (
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Emoji Categories</h1>
          <p className="text-sm text-gray-500">
            Browse emoji characters by category. Click a category to see its emojis.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {data.data.map((cat: typeof data.data[number]) => (
            <CategoryCard key={cat.id} category={cat} locale="en" />
          ))}
        </div>
      </div>
    );
  } catch (error) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8">
        <ErrorState message={getErrorMessage(error)} />
      </div>
    );
  }
}
