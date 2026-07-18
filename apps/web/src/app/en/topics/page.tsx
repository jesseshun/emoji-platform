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
  title: 'Topics',
  description: 'Emoji-related topic articles and content. Explore stories behind emojis.',
  alternates: {
    canonical: `${siteUrl}/en/topics`,
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

export default async function EnTopicsPage({ searchParams }: Props) {
  const params = await searchParams;
  const page = Math.max(1, parseInt(params.page || '1', 10) || 1);

  try {
    const data = await getTopics('en', page, 30);

    if (!data.data || data.data.length === 0) {
      return (
        <div className="mx-auto max-w-content px-4 py-8 sm:px-6 sm:py-12">
          <BrowsePageHeader locale="en" kind="topics" total={data.meta.total} page={page} totalPages={data.meta.totalPages} />
          <EmptyState
            icon="#"
            title={data.meta.total > 0 ? 'No topics on this page' : 'No topics available'}
            description={data.meta.total > 0 ? 'This page is beyond the available topic range.' : 'Topic content is being prepared. Please check back later.'}
            action={data.meta.total > 0 ? <Link href="/en/topics" className="inline-flex min-h-11 items-center rounded-[8px] bg-text-primary px-4 text-sm font-medium text-text-inverse">Return to page one</Link> : undefined}
          />
        </div>
      );
    }

    return (
      <div className="mx-auto max-w-content px-4 py-8 sm:px-6 sm:py-12">
        <BrowsePageHeader locale="en" kind="topics" total={data.meta.total} page={page} totalPages={data.meta.totalPages} />
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
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
      <div className="mx-auto max-w-content px-4 py-8 sm:px-6 sm:py-12">
        <BrowsePageHeader locale="en" kind="topics" />
        <ErrorState message={getErrorMessage(error, 'en')} locale="en" />
      </div>
    );
  }
}
