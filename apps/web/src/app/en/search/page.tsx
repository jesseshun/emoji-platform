import type { Metadata } from 'next';
import { SearchBox } from '@/components/SearchBox';
import { SearchResultsView } from '@/components/SearchResultsView';
import { EmptyState } from '@/components/EmptyState';
import { ErrorState } from '@/components/ErrorState';
import { RecommendedEmojis } from '@/components/RecommendedEmojis';
import { search, getErrorMessage } from '@/lib/api';
import type { SearchTypeFilter } from '@/lib/types';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
const VALID_TYPES: SearchTypeFilter[] = ['all', 'emoji', 'category', 'topic', 'article'];

function normalizeType(raw: string | undefined): SearchTypeFilter {
  const t = (raw || '').toLowerCase();
  return (VALID_TYPES as string[]).includes(t) ? (t as SearchTypeFilter) : 'all';
}

interface Props {
  searchParams: Promise<{ q?: string; page?: string; type?: string }>;
}

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const { q } = await searchParams;
  const query = (q || '').trim();
  const title = query ? `Search results for "${query}"` : 'Search';
  const description = query
    ? `Search results for "${query}". Find emojis, categories, topics, and articles by name, keyword, or Unicode codepoint, with one-click copy.`
    : 'Search emojis, categories, topics, and articles. Type a keyword to find what you need.';
  // The base search landing page (/en/search) is indexable and listed in the
  // sitemap. Search *result* pages (with a ?q= query) are low-value for search
  // engines and must not be crawled in bulk (crawl budget): they are noindexed
  // and their canonical consolidates back to the base search page.
  const zhBase = `${siteUrl}/zh/search`;
  const enBase = `${siteUrl}/en/search`;

  return {
    title,
    description,
    ...(query ? { robots: { index: false, follow: true } } : {}),
    alternates: {
      canonical: enBase,
      languages: {
        zh: zhBase,
        en: enBase,
        'x-default': enBase,
      },
    },
  };
}

export default async function EnSearchPage({ searchParams }: Props) {
  const params = await searchParams;
  const query = (params.q || '').trim();
  const page = Math.max(1, parseInt(params.page || '1', 10) || 1);
  const type = normalizeType(params.type);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Search</h1>
        <p className="text-sm text-gray-500 mb-4">
          Search across emojis, categories, topics, and articles, with type filters and one-click copy.
        </p>
        <SearchBox locale="en" defaultValue={query} />
      </div>

      {!query ? <SearchLanding /> : <SearchResults query={query} page={page} type={type} />}
    </div>
  );
}

function SearchLanding() {
  return (
    <>
      <EmptyState
        icon="🔍"
        title="Enter a keyword to search"
        description="Type an emoji name, keyword, or Unicode codepoint in the search box above to find emojis, categories, topics, and articles."
      />
      <RecommendedEmojis locale="en" title="Popular Emojis" viewAllHref="/en/emojis" />
    </>
  );
}

async function SearchResults({
  query,
  page,
  type,
}: {
  query: string;
  page: number;
  type: SearchTypeFilter;
}) {
  try {
    const res = await search('en', query, { type, page, limit: 30 });
    return (
      <SearchResultsView
        locale="en"
        query={query}
        initialType={type}
        initialData={res.data}
        initialMeta={res.meta}
        initialPage={page}
      />
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
