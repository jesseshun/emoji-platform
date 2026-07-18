import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getTopicDetail, getRecommendations, getErrorMessage, ApiError } from '@/lib/api';
import { buildDetailMetadata, optionalText, safeText } from '@/lib/seo';
import { TopicDetailView } from '@/components/TopicDetailView';
import { ErrorState } from '@/components/ErrorState';
import type { RecommendationData } from '@/lib/types';

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;

  try {
    const result = await getTopicDetail(slug, 'en');
    const topic = result.data.topic;
    const title = safeText(topic.translation?.title || topic.slug);
    const seoTitle = optionalText(topic.translation?.seoTitle) || `${title} Emojis: Copyable Symbols, Combos, and Captions`;
    const description = optionalText(topic.translation?.seoDescription) || topic.translation?.summary || `Explore ${title} related emojis. Copy with one click.`;

    return buildDetailMetadata({
      locale: 'en',
      path: `/topics/${slug}`,
      title: seoTitle,
      description,
    });
  } catch {
    return buildDetailMetadata({
      locale: 'en',
      path: `/topics/${slug}`,
      title: 'Emoji Topic',
      description: 'Emoji topic detail',
    });
  }
}

export default async function EnTopicDetailPage({ params }: Props) {
  const { slug } = await params;

  try {
    const result = await getTopicDetail(slug, 'en');
    let recommendations: RecommendationData | null = null;
    try {
      recommendations = (await getRecommendations('topic', slug, 'en', 4)).data;
    } catch {
      recommendations = null;
    }

    return <TopicDetailView locale="en" data={result.data} recommendations={recommendations} />;
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
