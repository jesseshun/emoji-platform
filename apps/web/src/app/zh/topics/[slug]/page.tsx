import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getTopicDetail, getErrorMessage } from '@/lib/api';
import { buildDetailMetadata, optionalText, safeText } from '@/lib/seo';
import type { FaqItem } from '@/lib/seo';
import { Breadcrumb } from '@/components/Breadcrumb';
import { EmojiGrid } from '@/components/EmojiGrid';
import { RelatedTopics } from '@/components/RelatedTopics';
import { FaqBlock } from '@/components/FaqBlock';
import { ErrorState } from '@/components/ErrorState';
import type { EmojiBase, TopicBoundEmoji } from '@/lib/types';

interface Props {
  params: Promise<{ slug: string }>;
}

const topicTypeLabels: Record<string, string> = {
  collection: '合集',
  guide: '指南',
  article: '文章',
  trending: '热门',
};

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
    const { topic, emojis, relatedTopics } = result.data;

    const title = safeText(topic.translation?.title);
    const summary = topic.translation?.summary || null;
    const content = topic.translation?.content || null;
    const topicType = topic.topicType;
    const typeLabel = topicType ? topicTypeLabels[topicType] || topicType : null;

    // Parse FAQ
    let faqs: FaqItem[] = [];
    try {
      if (typeof topic.translation?.faqJson === 'string') {
        faqs = JSON.parse(topic.translation.faqJson);
      } else if (Array.isArray(topic.translation?.faqJson)) {
        faqs = topic.translation.faqJson as FaqItem[];
      }
    } catch {
      faqs = [];
    }

    // Map emojis
    const emojiList: EmojiBase[] = emojis.map((e: TopicBoundEmoji) => ({
      id: e.id,
      emojiChar: e.emojiChar,
      slug: e.slug,
      unicodeCodepoint: e.unicodeCodepoint,
      shortcode: e.shortcode,
      category: e.category
        ? { id: e.category.id, slug: e.category.slug, name: e.category.name, iconEmoji: null }
        : null,
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
      <div className="max-w-4xl mx-auto px-4 py-8">
        <Breadcrumb
          locale="zh"
          items={[
            { label: 'Emoji 专题', href: '/zh/topics' },
            { label: title || topic.slug },
          ]}
        />

        {/* Header */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-8">
          <div className="flex items-start justify-between gap-2 mb-3">
            <h1 className="text-2xl font-bold text-gray-900">{title || topic.slug}</h1>
            {typeLabel && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-purple-50 text-purple-600 whitespace-nowrap">
                {typeLabel}
              </span>
            )}
          </div>
          {summary && <p className="text-sm text-gray-600 mb-4">{summary}</p>}
        </div>

        {/* Content */}
        {content && (
          <section className="mt-6 bg-white rounded-xl border border-gray-200 p-6">
            <div
              className="prose prose-sm max-w-none text-gray-700"
              dangerouslySetInnerHTML={{ __html: content.replace(/\n/g, '<br/>') }}
            />
          </section>
        )}

        {/* Bound Emojis */}
        {emojiList.length > 0 && (
          <section className="mt-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              {localeStr('zh', '收录表情', 'Emojis in this Topic')}
            </h2>
            <EmojiGrid emojis={emojiList} locale="zh" />
          </section>
        )}

        {/* FAQ */}
        <FaqBlock faqs={faqs} />

        {/* Related Topics */}
        {relatedTopics && relatedTopics.length > 0 && (
          <RelatedTopics topics={relatedTopics} locale="zh" />
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

function localeStr(locale: 'zh' | 'en', zh: string, en: string): string {
  return locale === 'zh' ? zh : en;
}
