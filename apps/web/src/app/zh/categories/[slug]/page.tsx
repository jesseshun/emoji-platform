import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getCategories, getCategoryDetail, getRecommendations, getErrorMessage, ApiError } from '@/lib/api';
import { buildDetailMetadata, optionalText, safeText } from '@/lib/seo';
import { CategoryDetailView } from '@/components/CategoryDetailView';
import { ErrorState } from '@/components/ErrorState';

interface Props {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ page?: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;

  try {
    const result = await getCategoryDetail(slug, 'zh', 1, 1);
    const category = result.data.category;
    const name = safeText(category.translation?.name || category.slug);
    const title = optionalText(category.translation?.seoTitle) || `${name} Emoji 大全：复制、含义和使用场景`;
    const description = optionalText(category.translation?.seoDescription) || `浏览全部 ${name} Emoji 表情符号。一键复制，了解含义和使用场景。`;

    return buildDetailMetadata({
      locale: 'zh',
      path: `/categories/${slug}`,
      title,
      description,
    });
  } catch {
    return buildDetailMetadata({
      locale: 'zh',
      path: `/categories/${slug}`,
      title: 'Emoji 分类',
      description: 'Emoji 分类详情',
    });
  }
}

export default async function ZhCategoryDetailPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const sp = await searchParams;
  const page = Math.max(1, parseInt(sp.page || '1', 10) || 1);

  try {
    const result = await getCategoryDetail(slug, 'zh', page, 30);
    const [categoriesResult, recommendationsResult] = await Promise.allSettled([
      getCategories('zh'),
      getRecommendations('category', slug, 'zh', 4),
    ]);

    return <CategoryDetailView
      locale="zh"
      slug={slug}
      page={page}
      data={result.data}
      meta={result.meta}
      categories={categoriesResult.status === 'fulfilled' ? categoriesResult.value.data : []}
      recommendations={recommendationsResult.status === 'fulfilled' ? recommendationsResult.value.data : null}
    />;
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      notFound();
    }
    return (
      <div className="mx-auto max-w-content px-4 py-12 sm:px-6">
        <ErrorState message={getErrorMessage(error, 'zh')} locale="zh" />
      </div>
    );
  }
}
