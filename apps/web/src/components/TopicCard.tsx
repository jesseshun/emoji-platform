import Link from 'next/link';
import { Badge } from '@/components/ui/Badge';
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
      className="bg-surface rounded-lg border border-border-subtle p-5 hover:border-border hover:shadow-sm transition-all duration-fast group block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-border-focus)]"
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <h3 className="text-base font-semibold text-text-primary group-hover:text-accent transition-colors duration-fast">
          {title}
        </h3>
        {typeLabel && <Badge variant="default">{typeLabel}</Badge>}
      </div>
      {summary && (
        <p className="text-sm text-text-secondary line-clamp-2">{summary}</p>
      )}
    </Link>
  );
}
