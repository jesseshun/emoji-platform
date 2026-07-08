import type { Metadata } from 'next';
import { SearchBox } from '@/components/SearchBox';
import { EmojiGrid } from '@/components/EmojiGrid';
import { Pagination } from '@/components/Pagination';
import { EmptyState } from '@/components/EmptyState';
import { ErrorState } from '@/components/ErrorState';
import { searchEmojis, getErrorMessage } from '@/lib/api';

export const metadata: Metadata = {
  title: '搜索表情',
  description: '搜索 Emoji 表情符号，输入关键词快速找到你需要的表情。',
};

interface Props {
  searchParams: Promise<{ q?: string; page?: string }>;
}

export default async function ZhSearchPage({ searchParams }: Props) {
  const params = await searchParams;
  const query = params.q?.trim() || '';
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

      {!query ? (
        <EmptyState
          icon="🔍"
          title="输入关键词开始搜索"
          description="在上方搜索框中输入 Emoji 名称、关键词或 Unicode 编码，即可查找表情符号。"
        />
      ) : (
        <SearchResults locale="zh" query={query} page={page} />
      )}
    </div>
  );
}

async function SearchResults({
  locale,
  query,
  page,
}: {
  locale: 'zh';
  query: string;
  page: number;
}) {
  try {
    const data = await searchEmojis(locale, query, page, 30);

    if (!data.data || data.data.length === 0) {
      return (
        <EmptyState
          icon="😕"
          title={`未找到与"${query}"相关的表情`}
          description="请尝试使用其他关键词搜索，或浏览全部分类查找。"
        />
      );
    }

    return (
      <>
        <p className="text-sm text-gray-500 mb-4">
          找到 {data.meta.total} 个与 &quot;{query}&quot; 相关的结果
        </p>
        <EmojiGrid emojis={data.data} locale={locale} />
        <Pagination
          locale={locale}
          page={page}
          totalPages={data.meta.totalPages}
          basePath={`/zh/search?q=${encodeURIComponent(query)}`}
        />
      </>
    );
  } catch (error) {
    return <ErrorState message={getErrorMessage(error)} />;
  }
}
