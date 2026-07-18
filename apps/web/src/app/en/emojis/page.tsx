import type { Metadata } from 'next';
import { EmojiGrid } from '@/components/EmojiGrid';
import { EmojiBrowseHeader } from '@/components/EmojiBrowseHeader';
import { Pagination } from '@/components/Pagination';
import { EmptyState } from '@/components/EmptyState';
import { ErrorState } from '@/components/ErrorState';
import { getEmojis, getErrorMessage } from '@/lib/api';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

export const metadata: Metadata = {
  title: 'Emoji List',
  description: 'Browse all Emoji characters, filter by category, and copy with one click.',
  alternates: {
    canonical: `${siteUrl}/en/emojis`,
    languages: {
      zh: `${siteUrl}/zh/emojis`,
      en: `${siteUrl}/en/emojis`,
      'x-default': `${siteUrl}/en/emojis`,
    },
  },
};

interface Props {
  searchParams: Promise<{ page?: string }>;
}

export default async function EnEmojisPage({ searchParams }: Props) {
  const params = await searchParams;
  const page = Math.max(1, parseInt(params.page || '1', 10) || 1);

  try {
    const data = await getEmojis('en', page, 30);

    if (!data.data || data.data.length === 0) {
      return (
        <div className="mx-auto max-w-content px-4 py-8 sm:px-6 sm:py-12">
          <EmojiBrowseHeader locale="en" total={0} />
          <EmptyState
            icon="😊"
            title="No emojis available"
            description="Emoji data is being prepared. Please check back later."
          />
        </div>
      );
    }

    return (
      <div className="mx-auto max-w-content px-4 py-8 sm:px-6 sm:py-12">
        <EmojiBrowseHeader
          locale="en"
          total={data.meta.total}
          page={page}
          totalPages={data.meta.totalPages}
        />

        <section aria-label="Emoji list">
          <EmojiGrid emojis={data.data} locale="en" />
        </section>

        <Pagination
          locale="en"
          page={page}
          totalPages={data.meta.totalPages}
          basePath="/en/emojis"
        />
      </div>
    );
  } catch (error) {
    return (
      <div className="mx-auto max-w-content px-4 py-8 sm:px-6 sm:py-12">
        <EmojiBrowseHeader locale="en" />
        <ErrorState message={getErrorMessage(error, 'en')} locale="en" />
      </div>
    );
  }
}
