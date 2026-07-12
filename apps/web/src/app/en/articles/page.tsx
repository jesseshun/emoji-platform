import type { Metadata } from 'next';
import { ArticleCard } from '@/components/ArticleCard';
import { Pagination } from '@/components/Pagination';
import { EmptyState } from '@/components/EmptyState';
import { ErrorState } from '@/components/ErrorState';
import { getArticles, getErrorMessage } from '@/lib/api';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

export const metadata: Metadata = {
  title: 'Articles',
  description: 'Emoji-related articles and content. Explore the meaning, history, and culture of emojis.',
  alternates: {
    canonical: `${siteUrl}/en/articles`,
    languages: {
      zh: `${siteUrl}/zh/articles`,
      en: `${siteUrl}/en/articles`,
      'x-default': `${siteUrl}/en/articles`,
    },
  },
};

interface Props {
  searchParams: Promise<{ page?: string }>;
}

export default async function EnArticlesPage({ searchParams }: Props) {
  const params = await searchParams;
  const page = Math.max(1, parseInt(params.page || '1', 10) || 1);

  try {
    const data = await getArticles('en', page, 30);

    if (!data.data || data.data.length === 0) {
      return (
        <div className="max-w-6xl mx-auto px-4 py-8">
          <EmptyState
            icon="📄"
            title="No articles available"
            description="Article content is being prepared. Please check back later."
          />
        </div>
      );
    }

    return (
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Articles</h1>
          <p className="text-sm text-gray-500">
            Browse emoji-related articles and content. Explore the meaning, history, and culture of emojis.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {data.data.map((article: typeof data.data[number]) => (
            <ArticleCard key={article.id} article={article} locale="en" />
          ))}
        </div>

        <Pagination
          locale="en"
          page={page}
          totalPages={data.meta.totalPages}
          basePath="/en/articles"
        />
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
