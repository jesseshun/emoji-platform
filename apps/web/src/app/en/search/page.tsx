import type { Metadata } from 'next';
import { SearchBox } from '@/components/SearchBox';
import { EmojiGrid } from '@/components/EmojiGrid';
import { Pagination } from '@/components/Pagination';
import { EmptyState } from '@/components/EmptyState';
import { ErrorState } from '@/components/ErrorState';
import { searchEmojis, getErrorMessage } from '@/lib/api';

export const metadata: Metadata = {
  title: 'Search Emojis',
  description: 'Search Emoji characters by keyword, name, or Unicode codepoint.',
};

interface Props {
  searchParams: Promise<{ q?: string; page?: string }>;
}

export default async function EnSearchPage({ searchParams }: Props) {
  const params = await searchParams;
  const query = params.q?.trim() || '';
  const page = Math.max(1, parseInt(params.page || '1', 10) || 1);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Search Emojis</h1>
        <p className="text-sm text-gray-500 mb-4">
          Search by emoji name, keyword, or Unicode codepoint.
        </p>
        <SearchBox locale="en" defaultValue={query} />
      </div>

      {!query ? (
        <EmptyState
          icon="🔍"
          title="Enter a keyword to search"
          description="Type an emoji name, keyword, or Unicode codepoint in the search box above."
        />
      ) : (
        <SearchResults locale="en" query={query} page={page} />
      )}
    </div>
  );
}

async function SearchResults({
  locale,
  query,
  page,
}: {
  locale: 'en';
  query: string;
  page: number;
}) {
  try {
    const data = await searchEmojis(locale, query, page, 30);

    if (!data.data || data.data.length === 0) {
      return (
        <EmptyState
          icon="😕"
          title={`No results found for "${query}"`}
          description="Try using different keywords, or browse by category instead."
        />
      );
    }

    return (
      <>
        <p className="text-sm text-gray-500 mb-4">
          Found {data.meta.total} results for &quot;{query}&quot;
        </p>
        <EmojiGrid emojis={data.data} locale={locale} />
        <Pagination
          locale={locale}
          page={page}
          totalPages={data.meta.totalPages}
          basePath={`/en/search?q=${encodeURIComponent(query)}`}
        />
      </>
    );
  } catch (error) {
    return <ErrorState message={getErrorMessage(error)} />;
  }
}
