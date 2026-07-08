import type { Metadata } from 'next';
import { CategoryCard } from '@/components/CategoryCard';
import { EmptyState } from '@/components/EmptyState';
import { ErrorState } from '@/components/ErrorState';
import { getCategories, getErrorMessage } from '@/lib/api';

export const metadata: Metadata = {
  title: '表情分类',
  description: '按分类浏览 Emoji 表情符号，快速找到你需要的表情。',
};

export default async function ZhCategoriesPage() {
  try {
    const data = await getCategories('zh');

    if (!data.data || data.data.length === 0) {
      return (
        <div className="max-w-6xl mx-auto px-4 py-8">
          <EmptyState
            icon="📂"
            title="暂无分类数据"
            description="分类数据正在准备中，请稍后再来。"
          />
        </div>
      );
    }

    return (
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">表情分类</h1>
          <p className="text-sm text-gray-500">
            按分类浏览 Emoji 表情符号，点击分类查看其中的表情列表。
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {data.data.map((cat: typeof data.data[number]) => (
            <CategoryCard key={cat.id} category={cat} locale="zh" />
          ))}
        </div>
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
