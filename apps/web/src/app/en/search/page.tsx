import type { Metadata } from 'next';
import Link from 'next/link';
import { SearchBox } from '@/components/SearchBox';
import { EmojiGrid } from '@/components/EmojiGrid';
import { Pagination } from '@/components/Pagination';
import { EmptyState } from '@/components/EmptyState';
import { ErrorState } from '@/components/ErrorState';
import { RecommendedEmojis } from '@/components/RecommendedEmojis';
import { searchEmojis, getErrorMessage } from '@/lib/api';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

interface Props {
  searchParams: Promise<{ q?: string; page?: string }>;
}

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const { q } = await searchParams;
  const query = (q || '').trim();
  const title = query ? `Search results for "${query}"` : 'Search Emojis';
  const description = query
    ? `Search results for "${query}". Find emojis by name, keyword, or Unicode codepoint and copy them with one click.`
    : 'Search Emoji characters by keyword, name, or Unicode codepoint.';
  const zhPath = query ? `${siteUrl}/zh/search?q=${encodeURIComponent(query)}` : `${siteUrl}/zh/search`;
  const enPath = query ? `${siteUrl}/en/search?q=${encodeURIComponent(query)}` : `${siteUrl}/en/search`;

  return {
    title,
    description,
    alternates: {
      canonical: enPath,
      languages: {
        zh: zhPath,
        en: enPath,
        'x-default': enPath,
      },
    },
  };
}

export default async function EnSearchPage({ searchParams }: Props) {
  const params = await searchParams;
  const query = (params.q || '').trim();
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

      {!query ? <SearchLanding /> : <SearchResults query={query} page={page} />}
    </div>
  );
}

async function SearchLanding() {
  return (
    <>
      <EmptyState
        icon="🔍"
        title="Enter a keyword to search"
        description="Type an emoji name, keyword, or Unicode codepoint in the search box above."
      />
      <RecommendedEmojis locale="en" title="Popular Emojis" viewAllHref="/en/emojis" />
    </>
  );
}

async function SearchResults({ query, page }: { query: string; page: number }) {
  try {
    const data = await searchEmojis('en', query, page, 30);

    if (!data.data || data.data.length === 0) {
      return (
        <>
          <EmptyState
            icon="😕"
            title={`No results found for "${query}"`}
            description="Try using different keywords, or browse by category instead."
            action={
              <Link
                href="/en/categories"
                className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition"
              >
                Browse categories
              </Link>
            }
          />
          <RecommendedEmojis locale="en" title="Popular Emojis" viewAllHref="/en/emojis" />
        </>
      );
    }

    return (
      <>
        <p className="text-sm text-gray-500 mb-4">
          Found {data.meta.total} results for &quot;{query}&quot;
        </p>
        <EmojiGrid emojis={data.data} locale="en" />
        <Pagination
          locale="en"
          page={page}
          totalPages={data.meta.totalPages}
          basePath={`/en/search?q=${encodeURIComponent(query)}`}
        />
      </>
    );
  } catch (error) {
    return (
      <>
        <ErrorState message={getErrorMessage(error)} />
        <RecommendedEmojis locale="en" title="Popular Emojis" viewAllHref="/en/emojis" />
      </>
    );
  }
}
