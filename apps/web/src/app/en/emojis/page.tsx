import type { Metadata } from 'next';
import { SearchBox } from '@/components/SearchBox';
import { EmojiGrid } from '@/components/EmojiGrid';
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
        <div className="max-w-6xl mx-auto px-4 py-8">
          <EmptyState
            icon="😊"
            title="No emojis available"
            description="Emoji data is being prepared. Please check back later."
          />
        </div>
      );
    }

    return (
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Emoji List</h1>
          <p className="text-sm text-gray-500 mb-4">
            Browse all emoji characters. Click to view details and copy.
          </p>
          <SearchBox locale="en" />
        </div>

        <EmojiGrid emojis={data.data} locale="en" />

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
      <div className="max-w-6xl mx-auto px-4 py-8">
        <ErrorState message={getErrorMessage(error)} />
      </div>
    );
  }
}
