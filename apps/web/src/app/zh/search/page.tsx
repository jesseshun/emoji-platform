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
  const title = query ? `“${query}” 的搜索结果` : '搜索表情';
  const description = query
    ? `搜索与“${query}”相关的 Emoji 表情符号，支持按名称、关键词、Unicode 编码搜索与一键复制。`
    : '搜索 Emoji 表情符号，输入关键词快速找到你需要的表情。';
  // The base search landing page (/zh/search) is indexable and listed in the
  // sitemap. Search *result* pages (with a ?q= query) are low-value for search
  // engines and must not be crawled in bulk (crawl budget): they are noindexed
  // and their canonical/hreflang consolidate back to the base search page.
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

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">搜索表情</h1>
        <p className="text-sm text-gray-500 mb-4">
          输入 Emoji、关键词或 Unicode 编码进行搜索。
        </p>
        <SearchBox locale="zh" defaultValue={query} />
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
        title="输入关键词开始搜索"
        description="在上方搜索框中输入 Emoji 名称、关键词或 Unicode 编码，即可查找表情符号。"
      />
      <RecommendedEmojis locale="zh" title="热门表情" viewAllHref="/zh/emojis" />
    </>
  );
}

async function SearchResults({ query, page }: { query: string; page: number }) {
  try {
    const data = await searchEmojis('zh', query, page, 30);

    if (!data.data || data.data.length === 0) {
      return (
        <>
          <EmptyState
            icon="😕"
            title={`未找到与“${query}”相关的表情`}
            description="请尝试使用其他关键词搜索，或浏览全部分类查找。"
            action={
              <Link
                href="/zh/categories"
                className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition"
              >
                浏览全部分类
              </Link>
            }
          />
          <RecommendedEmojis locale="zh" title="热门表情" viewAllHref="/zh/emojis" />
        </>
      );
    }

    return (
      <>
        <p className="text-sm text-gray-500 mb-4">
          找到 {data.meta.total} 个与 “{query}” 相关的结果
        </p>
        <EmojiGrid emojis={data.data} locale="zh" />
        <Pagination
          locale="zh"
          page={page}
          totalPages={data.meta.totalPages}
          basePath={`/zh/search?q=${encodeURIComponent(query)}`}
        />
      </>
    );
  } catch (error) {
    return (
      <>
        <ErrorState message={getErrorMessage(error)} />
        <RecommendedEmojis locale="zh" title="热门表情" viewAllHref="/zh/emojis" />
      </>
    );
  }
}
