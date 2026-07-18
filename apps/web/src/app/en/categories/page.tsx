import type { Metadata } from 'next';

export const dynamic = 'force-dynamic';
import { BrowsePageHeader } from '@/components/BrowsePageHeader';
import { CategoryTree } from '@/components/CategoryTree';
import { EmptyState } from '@/components/EmptyState';
import { ErrorState } from '@/components/ErrorState';
import { getCategories, getErrorMessage } from '@/lib/api';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

export const metadata: Metadata = {
  title: 'Emoji Categories',
  description: 'Browse Emoji characters by category.',
  alternates: {
    canonical: `${siteUrl}/en/categories`,
    languages: {
      zh: `${siteUrl}/zh/categories`,
      en: `${siteUrl}/en/categories`,
      'x-default': `${siteUrl}/en/categories`,
    },
  },
};

export default async function EnCategoriesPage() {
  try {
    const data = await getCategories('en');

    if (!data.data || data.data.length === 0) {
      return (
        <div className="mx-auto max-w-content px-4 py-8 sm:px-6 sm:py-12">
          <BrowsePageHeader locale="en" kind="categories" total={0} />
          <EmptyState
            icon="📁"
            title="No categories available"
            description="Category data is being prepared. Please check back later."
          />
        </div>
      );
    }

    return (
      <div className="mx-auto max-w-content px-4 py-8 sm:px-6 sm:py-12">
        <BrowsePageHeader
          locale="en"
          kind="categories"
          total={data.data.length}
          secondaryCount={data.data.filter((category) => category.parentId !== null).length}
        />
        <CategoryTree categories={data.data} locale="en" />
      </div>
    );
  } catch (error) {
    return (
      <div className="mx-auto max-w-content px-4 py-8 sm:px-6 sm:py-12">
        <BrowsePageHeader locale="en" kind="categories" />
        <ErrorState message={getErrorMessage(error, 'en')} locale="en" />
      </div>
    );
  }
}
