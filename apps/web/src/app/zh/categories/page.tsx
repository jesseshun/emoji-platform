import type { Metadata } from 'next';

export const dynamic = 'force-dynamic';
import { BrowsePageHeader } from '@/components/BrowsePageHeader';
import { CategoryTree } from '@/components/CategoryTree';
import { EmptyState } from '@/components/EmptyState';
import { ErrorState } from '@/components/ErrorState';
import { getCategories, getErrorMessage } from '@/lib/api';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

export const metadata: Metadata = {
  title: '表情分类',
  description: '按分类浏览 Emoji 表情符号，快速找到你需要的表情。',
  alternates: {
    canonical: `${siteUrl}/zh/categories`,
    languages: {
      zh: `${siteUrl}/zh/categories`,
      en: `${siteUrl}/en/categories`,
      'x-default': `${siteUrl}/en/categories`,
    },
  },
};

export default async function ZhCategoriesPage() {
  try {
    const data = await getCategories('zh');

    if (!data.data || data.data.length === 0) {
      return (
        <div className="mx-auto max-w-content px-4 py-8 sm:px-6 sm:py-12">
          <BrowsePageHeader locale="zh" kind="categories" total={0} />
          <EmptyState
            icon="📁"
            title="暂无分类数据"
            description="分类数据正在准备中，请稍后再来。"
          />
        </div>
      );
    }

    return (
      <div className="mx-auto max-w-content px-4 py-8 sm:px-6 sm:py-12">
        <BrowsePageHeader
          locale="zh"
          kind="categories"
          total={data.data.length}
          secondaryCount={data.data.filter((category) => category.parentId !== null).length}
        />
        <CategoryTree categories={data.data} locale="zh" />
      </div>
    );
  } catch (error) {
    return (
      <div className="mx-auto max-w-content px-4 py-8 sm:px-6 sm:py-12">
        <BrowsePageHeader locale="zh" kind="categories" />
        <ErrorState message={getErrorMessage(error, 'zh')} locale="zh" />
      </div>
    );
  }
}
