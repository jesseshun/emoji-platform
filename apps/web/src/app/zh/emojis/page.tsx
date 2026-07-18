import type { Metadata } from 'next';
import { EmojiGrid } from '@/components/EmojiGrid';
import { EmojiBrowseHeader } from '@/components/EmojiBrowseHeader';
import { Pagination } from '@/components/Pagination';
import { EmptyState } from '@/components/EmptyState';
import { ErrorState } from '@/components/ErrorState';
import { getEmojis, getErrorMessage } from '@/lib/api';

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
        <div className="mx-auto max-w-content px-4 py-8 sm:px-6 sm:py-12">
          <EmojiBrowseHeader locale="zh" total={0} />
          <EmptyState
            icon="😊"
            title="暂无表情数据"
            description="表情数据正在准备中，请稍后再来。"
          />
        </div>
      );
    }

    return (
      <div className="mx-auto max-w-content px-4 py-8 sm:px-6 sm:py-12">
        <EmojiBrowseHeader
          locale="zh"
          total={data.meta.total}
          page={page}
          totalPages={data.meta.totalPages}
        />

        <section aria-label="Emoji 列表">
          <EmojiGrid emojis={data.data} locale="zh" />
        </section>

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
      <div className="mx-auto max-w-content px-4 py-8 sm:px-6 sm:py-12">
        <EmojiBrowseHeader locale="zh" />
        <ErrorState message={getErrorMessage(error, 'zh')} locale="zh" />
      </div>
    );
  }
}
