import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getCategoryDetail, getRecommendations, getErrorMessage, ApiError } from '@/lib/api';
import { buildDetailMetadata, optionalText, safeText } from '@/lib/seo';
import { Breadcrumb } from '@/components/Breadcrumb';
import { EmojiGrid } from '@/components/EmojiGrid';
import { Pagination } from '@/components/Pagination';
import { RelatedTopics } from '@/components/RelatedTopics';
import { RelatedCategories } from '@/components/RelatedCategories';
import { ArticleCard } from '@/components/ArticleCard';
import { ErrorState } from '@/components/ErrorState';
import type { EmojiBase, CategoryEmoji, RecommendationData } from '@/lib/types';

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
    const { category, emojis, relatedTopics } = result.data;
    const name = safeText(category.translation?.name);
    const description = category.translation?.description || null;
    const icon = category.iconEmoji || '📁';

    // Phase 6D: content-based recommendations (related categories / topics / articles).
    let rec: RecommendationData | null = null;
    try {
      rec = (await getRecommendations('category', slug, 'en', 4)).data;
    } catch {
      rec = null;
    }
    const recCategories = rec?.relatedCategories ?? [];
    const recArticles = rec?.relatedArticles ?? [];

    const emojiList: EmojiBase[] = emojis.map((e: CategoryEmoji) => ({
      id: e.id,
      emojiChar: e.emojiChar,
      slug: e.slug,
      unicodeCodepoint: e.unicodeCodepoint,
      shortcode: e.shortcode,
      category: null,
      translation: e.translation
        ? {
            name: e.translation.name,
            shortName: e.translation.shortName,
            oneLineMeaning: e.translation.oneLineMeaning,
            keywords: null,
            seoTitle: null,
            seoDescription: null,
            locale: e.translation.locale,
          }
        : null,
    }));

    return (
      <div className="max-w-6xl mx-auto px-4 py-8">
        <Breadcrumb
          locale="en"
          items={[
            { label: 'Categories', href: '/en/categories' },
            { label: `${icon} ${name || category.slug}` },
          ]}
        />

        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-8">
          <div className="flex items-center gap-4 mb-3">
            <span className="text-4xl">{icon}</span>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{name || category.slug}</h1>
              {description && (
                <p className="text-sm text-gray-500 mt-1">{description}</p>
              )}
            </div>
          </div>
          <p className="text-sm text-gray-400">
            {result.meta.total} {result.meta.total === 1 ? 'emoji' : 'emojis'}
          </p>
        </div>

        {emojiList.length > 0 ? (
          <>
            <EmojiGrid emojis={emojiList} locale="en" />
            <Pagination
              locale="en"
              page={page}
              totalPages={result.meta.totalPages}
              basePath={`/en/categories/${slug}`}
            />
          </>
        ) : (
          <p className="text-center text-gray-500 py-8">No emojis in this category yet</p>
        )}

        {relatedTopics && relatedTopics.length > 0 && (
          <RelatedTopics topics={relatedTopics} locale="en" />
        )}

        {/* Phase 6D: related categories (children / siblings) */}
        <RelatedCategories categories={recCategories} locale="en" />

        {/* Phase 6D: related articles (keyword overlap) */}
        {recArticles && recArticles.length > 0 && (
          <section className="mt-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Related Articles</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {recArticles.map((a) => (
                <ArticleCard key={a.id} article={a} locale="en" />
              ))}
            </div>
          </section>
        )}
      </div>
    );
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      notFound();
    }
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <ErrorState message={getErrorMessage(error)} />
      </div>
    );
  }
}
