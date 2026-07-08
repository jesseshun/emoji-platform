import Link from 'next/link';
import type { TopicItem, Locale } from '@/lib/types';

interface TopicCardProps {
  topic: TopicItem;
  locale: Locale;
}

const topicTypeLabels: Record<string, Record<Locale, string>> = {
  collection: { zh: '合集', en: 'Collection' },
  guide: { zh: '指南', en: 'Guide' },
  article: { zh: '文章', en: 'Article' },
};

export function TopicCard({ topic, locale }: TopicCardProps) {
  const title = topic.translation?.title || topic.slug;
  const summary = topic.translation?.summary;
  const topicType = topic.topicType;
  const typeLabel = topicType
    ? topicTypeLabels[topicType]?.[locale] || topicType
    : null;

  return (
    <Link
      href={`/${locale}/topics/${topic.slug}`}
      className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow group block"
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <h3 className="text-base font-semibold text-gray-900 group-hover:text-purple-600 transition-colors">
          {title}
        </h3>
        {typeLabel && (
          <span className="text-xs px-2 py-0.5 rounded-full bg-purple-50 text-purple-600 whitespace-nowrap">
            {typeLabel}
          </span>
        )}
      </div>
      {summary && (
        <p className="text-sm text-gray-500 line-clamp-2">{summary}</p>
      )}
    </Link>
  );
}
