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
  const title = query ? `“${query}” 的搜索结果` : '搜索';
  const description = query
    ? `搜索与“${query}”相关的 Emoji 表情符号、分类、专题与文章，支持按名称、关键词、Unicode 编码搜索与一键复制。`
    : '搜索 Emoji 表情符号、分类、专题与文章，输入关键词快速找到你需要的内容。';
  // The base search landing page (/zh/search) is indexable and listed in the
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
      canonical: zhBase,
      languages: {
        zh: zhBase,
        en: enBase,
        'x-default': enBase,
      },
    },
  };
}

export default async function ZhSearchPage({ searchParams }: Props) {
  const params = await searchParams;
  const query = (params.q || '').trim();
  const page = Math.max(1, parseInt(params.page || '1', 10) || 1);
  const type = normalizeType(params.type);

  return (
    <div className="mx-auto max-w-content px-4 py-8 sm:px-6 sm:py-12">
      <header className="mb-8 border-b border-border-subtle pb-8 sm:mb-10">
        <p className="mb-3 text-xs font-semibold text-text-muted">全站搜索</p>
        <h1 className="text-3xl font-semibold text-text-primary sm:text-4xl">搜索 Emoji 与内容</h1>
        <p className="mb-6 mt-3 max-w-2xl text-sm leading-relaxed text-text-secondary sm:text-base">
          跨 Emoji、分类、专题与文章搜索，支持类型筛选与一键复制。
        </p>
        <div className="max-w-3xl">
          <SearchBox locale="zh" defaultValue={query} autoFocus={!query} />
        </div>
      </header>

      {!query ? <SearchLanding /> : <SearchResults query={query} page={page} type={type} />}
    </div>
  );
}

function SearchLanding() {
  return (
    <>
      <EmptyState
        icon="⌕"
        title="输入关键词开始搜索"
        description="在上方搜索框中输入 Emoji 名称、关键词或 Unicode 编码，即可查找表情符号、分类、专题与文章。"
      />
      <RecommendedEmojis locale="zh" title="热门表情" viewAllHref="/zh/emojis" />
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
    const res = await search('zh', query, { type, page, limit: 30 });
    return (
      <SearchResultsView
        locale="zh"
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
        <ErrorState message={getErrorMessage(error, 'zh')} locale="zh" />
        <RecommendedEmojis locale="zh" title="热门表情" viewAllHref="/zh/emojis" />
      </>
    );
  }
}
