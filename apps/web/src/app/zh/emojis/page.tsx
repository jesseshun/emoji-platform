import type { Metadata } from 'next';
import { SearchBox } from '@/components/SearchBox';
import { EmojiGrid } from '@/components/EmojiGrid';
import { Pagination } from '@/components/Pagination';
import { EmptyState } from '@/components/EmptyState';
import { ErrorState } from '@/components/ErrorState';
import { getEmojis, getErrorMessage } from '@/lib/api';

import { getSiteUrl } from '@/lib/seo';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

export const metadata: Metadata = {
  title: '表情列表',
  description: '浏览全部 Emoji 表情符号，按分类筛选，一键复制。',
  alternates: {
    canonical: `${siteUrl}/zh/emojis`,
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

export default async function ZhEmojisPage({ searchParams }: Props) {
  const params = await searchParams;
  const page = Math.max(1, parseInt(params.page || '1', 10) || 1);

  try {
    const data = await getEmojis('zh', page, 30);

    if (!data.data || data.data.length === 0) {
      return (
        <div className="max-w-6xl mx-auto px-4 py-8">
          <EmptyState
            icon="😊"
            title="暂无表情数据"
            description="表情数据正在准备中，请稍后再来。"
          />
        </div>
      );
    }

    return (
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">表情列表</h1>
          <p className="text-sm text-gray-500 mb-4">
            浏览全部 Emoji 表情符号，点击即可查看详情和复制。
          </p>
          <SearchBox locale="zh" />
        </div>

        <EmojiGrid emojis={data.data} locale="zh" />

        <Pagination
          locale="zh"
          page={page}
          totalPages={data.meta.totalPages}
          basePath="/zh/emojis"
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
