import type { Metadata } from 'next';
import { ArticleListView } from '@/components/ArticleListView';
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
    return <ArticleListView articles={data.data || []} meta={data.meta} locale="zh" />;
  } catch (error) {
    return (
      <div className="mx-auto max-w-content px-4 py-12 sm:px-6">
        <ErrorState locale="zh" message={getErrorMessage(error, 'zh')} />
      </div>
    );
  }
}
