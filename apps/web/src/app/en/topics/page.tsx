import type { Metadata } from 'next';
import { TopicCard } from '@/components/TopicCard';
import { Pagination } from '@/components/Pagination';
import { EmptyState } from '@/components/EmptyState';
import { ErrorState } from '@/components/ErrorState';
import { getTopics, getErrorMessage } from '@/lib/api';

export const metadata: Metadata = {
  title: 'Topics',
  description: 'Emoji-related topic articles and content. Explore stories behind emojis.',
};

interface Props {
  searchParams: Promise<{ page?: string }>;
}

export default async function EnTopicsPage({ searchParams }: Props) {
  const params = await searchParams;
  const page = Math.max(1, parseInt(params.page || '1', 10) || 1);

  try {
    const data = await getTopics('en', page, 30);

    if (!data.data || data.data.length === 0) {
      return (
        <div className="max-w-6xl mx-auto px-4 py-8">
          <EmptyState
            icon="📝"
            title="No topics available"
            description="Topic content is being prepared. Please check back later."
          />
        </div>
      );
    }

    return (
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Topics</h1>
          <p className="text-sm text-gray-500">
            Browse emoji-related articles and content. Explore the stories and culture behind emojis.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {data.data.map((topic: typeof data.data[number]) => (
            <TopicCard key={topic.id} topic={topic} locale="en" />
          ))}
        </div>

        <Pagination
          locale="en"
          page={page}
          totalPages={data.meta.totalPages}
          basePath="/en/topics"
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
