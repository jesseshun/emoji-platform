import type { Metadata } from 'next';
import { TopicCard } from '@/components/TopicCard';
import { Pagination } from '@/components/Pagination';
import { EmptyState } from '@/components/EmptyState';
import { ErrorState } from '@/components/ErrorState';
import { getTopics, getErrorMessage } from '@/lib/api';

export const metadata: Metadata = {
  title: '专题内容',
  description: 'Emoji 相关专题文章与内容，深入了解 Emoji 背后的故事。',
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
        <div className="max-w-6xl mx-auto px-4 py-8">
          <EmptyState
            icon="📝"
            title="暂无专题内容"
            description="专题内容正在准备中，请稍后再来。"
          />
        </div>
      );
    }

    return (
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">专题内容</h1>
          <p className="text-sm text-gray-500">
            浏览 Emoji 相关专题文章与内容，深入了解 Emoji 背后的故事和文化。
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
      <div className="max-w-6xl mx-auto px-4 py-8">
        <ErrorState message={getErrorMessage(error)} />
      </div>
    );
  }
}
