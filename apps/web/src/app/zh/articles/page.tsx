import type { Metadata } from 'next';
import { ArticleCard } from '@/components/ArticleCard';
import { Pagination } from '@/components/Pagination';
import { EmptyState } from '@/components/EmptyState';
import { ErrorState } from '@/components/ErrorState';
import { getArticles, getErrorMessage } from '@/lib/api';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

export const metadata: Metadata = {
  title: '文章',
  description: 'Emoji 相关文章与内容，深入了解 Emoji 的含义、历史与文化。',
  alternates: {
    canonical: `${siteUrl}/zh/articles`,
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

export default async function ZhArticlesPage({ searchParams }: Props) {
  const params = await searchParams;
  const page = Math.max(1, parseInt(params.page || '1', 10) || 1);

  try {
    const data = await getArticles('zh', page, 30);

    if (!data.data || data.data.length === 0) {
      return (
        <div className="max-w-6xl mx-auto px-4 py-8">
          <EmptyState
            icon="📄"
            title="暂无文章"
            description="文章正在准备中，请稍后再来。"
          />
        </div>
      );
    }

    return (
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">文章</h1>
          <p className="text-sm text-gray-500">
            浏览 Emoji 相关文章与内容，深入了解 Emoji 的含义、历史与文化。
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {data.data.map((article: typeof data.data[number]) => (
            <ArticleCard key={article.id} article={article} locale="zh" />
          ))}
        </div>

        <Pagination
          locale="zh"
          page={page}
          totalPages={data.meta.totalPages}
          basePath="/zh/articles"
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
