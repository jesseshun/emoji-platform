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
    const result = await getCategoryDetail(slug, 'en', 1, 1);
    const category = result.data.category;
    const name = safeText(category.translation?.name || category.slug);
    const title = optionalText(category.translation?.seoTitle) || `${name} Emojis: Copy, Meanings, and Usage`;
    const description = optionalText(category.translation?.seoDescription) || `Browse all ${name} emojis. Copy with one click, discover meanings and usage scenarios.`;

    return buildDetailMetadata({
      locale: 'en',
      path: `/categories/${slug}`,
      title,
      description,
    });
  } catch {
    return buildDetailMetadata({
      locale: 'en',
      path: `/categories/${slug}`,
      title: 'Emoji Category',
      description: 'Emoji category detail',
    });
  }
}

export default async function EnCategoryDetailPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const sp = await searchParams;
  const page = Math.max(1, parseInt(sp.page || '1', 10) || 1);

  try {
    const result = await getCategoryDetail(slug, 'en', page, 30);
    const [categoriesResult, recommendationsResult] = await Promise.allSettled([
      getCategories('en'),
      getRecommendations('category', slug, 'en', 4),
    ]);

    return <CategoryDetailView
      locale="en"
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
        <ErrorState message={getErrorMessage(error, 'en')} locale="en" />
      </div>
    );
  }
}
