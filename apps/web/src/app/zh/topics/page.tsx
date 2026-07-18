import type { Metadata } from 'next';
import Link from 'next/link';
import { BrowsePageHeader } from '@/components/BrowsePageHeader';
import { TopicCard } from '@/components/TopicCard';
import { Pagination } from '@/components/Pagination';
import { EmptyState } from '@/components/EmptyState';
import { ErrorState } from '@/components/ErrorState';
import { getTopics, getErrorMessage } from '@/lib/api';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

export const metadata: Metadata = {
  title: '专题内容',
  description: 'Emoji 相关专题文章与内容，深入了解 Emoji 背后的故事。',
  alternates: {
    canonical: `${siteUrl}/zh/topics`,
    languages: {
      zh: `${siteUrl}/zh/topics`,
      en: `${siteUrl}/en/topics`,
      'x-default': `${siteUrl}/en/topics`,
    },
  },
};

interface Props {
  searchParams: Promise<{ page?: string }>;
}

export default async function ZhTopicsPage({ searchParams }: Props) {
  const params = await searchParams;
  const page = Math.max(1, parseInt(params.page || '1', 10) || 1);

  try {
    const data = await getTopics('zh', page, 30);

    if (!data.data || data.data.length === 0) {
      return (
        <div className="mx-auto max-w-content px-4 py-8 sm:px-6 sm:py-12">
          <BrowsePageHeader locale="zh" kind="topics" total={data.meta.total} page={page} totalPages={data.meta.totalPages} />
          <EmptyState
            icon="#"
            title={data.meta.total > 0 ? '这一页没有专题' : '暂无专题内容'}
            description={data.meta.total > 0 ? '当前页超出已有专题范围。' : '专题内容正在准备中，请稍后再来。'}
            action={data.meta.total > 0 ? <Link href="/zh/topics" className="inline-flex min-h-11 items-center rounded-[8px] bg-text-primary px-4 text-sm font-medium text-text-inverse">返回第一页</Link> : undefined}
          />
        </div>
      );
    }

    return (
      <div className="mx-auto max-w-content px-4 py-8 sm:px-6 sm:py-12">
        <BrowsePageHeader locale="zh" kind="topics" total={data.meta.total} page={page} totalPages={data.meta.totalPages} />
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {data.data.map((topic: typeof data.data[number]) => (
            <TopicCard key={topic.id} topic={topic} locale="zh" />
          ))}
        </div>

        <Pagination
          locale="zh"
          page={page}
          totalPages={data.meta.totalPages}
          basePath="/zh/topics"
        />
      </div>
    );
  } catch (error) {
    return (
      <div className="mx-auto max-w-content px-4 py-8 sm:px-6 sm:py-12">
        <BrowsePageHeader locale="zh" kind="topics" />
        <ErrorState message={getErrorMessage(error, 'zh')} locale="zh" />
      </div>
    );
  }
}
