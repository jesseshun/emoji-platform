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
    const result = await getTopicDetail(slug, 'zh');
    const topic = result.data.topic;
    const title = safeText(topic.translation?.title || topic.slug);
    const seoTitle = optionalText(topic.translation?.seoTitle) || `${title} Emoji 推荐：可复制表情符号、组合和文案`;
    const description = optionalText(topic.translation?.seoDescription) || topic.translation?.summary || `探索 ${title} 相关 Emoji 表情符号。支持一键复制。`;

    return buildDetailMetadata({
      locale: 'zh',
      path: `/topics/${slug}`,
      title: seoTitle,
      description,
    });
  } catch {
    return buildDetailMetadata({
      locale: 'zh',
      path: `/topics/${slug}`,
      title: 'Emoji 专题',
      description: 'Emoji 专题详情',
    });
  }
}

export default async function ZhTopicDetailPage({ params }: Props) {
  const { slug } = await params;

  try {
    const result = await getTopicDetail(slug, 'zh');
    let recommendations: RecommendationData | null = null;
    try {
      recommendations = (await getRecommendations('topic', slug, 'zh', 4)).data;
    } catch {
      recommendations = null;
    }

    return <TopicDetailView locale="zh" data={result.data} recommendations={recommendations} />;
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
