import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getCategoryDetail, getErrorMessage } from '@/lib/api';
import { buildDetailMetadata, optionalText, safeText } from '@/lib/seo';
import { Breadcrumb } from '@/components/Breadcrumb';
import { EmojiGrid } from '@/components/EmojiGrid';
import { Pagination } from '@/components/Pagination';
import { RelatedTopics } from '@/components/RelatedTopics';
import { ErrorState } from '@/components/ErrorState';
import type { EmojiBase, CategoryEmoji } from '@/lib/types';

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
      </div>
    );
  } catch (error) {
    if (error instanceof Error && error.message.includes('404')) {
      notFound();
    }
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <ErrorState message={getErrorMessage(error)} />
      </div>
    );
  }
}
