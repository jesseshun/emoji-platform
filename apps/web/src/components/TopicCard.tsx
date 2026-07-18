import Link from 'next/link';
import { Badge } from '@/components/ui/Badge';
import { TopicCover } from '@/components/TopicCover';
import type { TopicItem, Locale } from '@/lib/types';

interface TopicCardProps {
  topic: TopicItem;
  locale: Locale;
}

const topicTypeLabels: Record<string, Record<Locale, string>> = {
  collection: { zh: '合集', en: 'Collection' },
  guide: { zh: '指南', en: 'Guide' },
  article: { zh: '文章', en: 'Article' },
  trending: { zh: '热门', en: 'Trending' },
};

function formatDate(value: string | null, locale: Locale): string | null {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleDateString(locale === 'zh' ? 'zh-CN' : 'en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function TopicCard({ topic, locale }: TopicCardProps) {
  const title = topic.translation?.title || topic.slug;
  const summary = topic.translation?.summary;
  const topicType = topic.topicType;
  const typeLabel = topicType
    ? topicTypeLabels[topicType]?.[locale] || topicType
    : null;
  const publishedAt = formatDate(topic.publishedAt, locale);

  return (
    <Link
      href={`/${locale}/topics/${topic.slug}`}
      className="group grid min-h-[230px] min-w-0 overflow-hidden rounded-[8px] border border-border-subtle bg-surface transition-all duration-fast hover:border-border-strong hover:shadow-sm focus-visible:outline-none sm:grid-cols-[10rem_minmax(0,1fr)]"
    >
      <TopicCover
        src={topic.coverImage}
        alt={title}
        imageClassName="h-40 w-full border-b border-border-subtle object-cover sm:h-full sm:border-b-0 sm:border-r"
        fallbackClassName="flex h-28 items-center justify-center border-b border-border-subtle bg-bg-subtle sm:h-full sm:border-b-0 sm:border-r"
      />
      <div className="flex min-w-0 flex-col p-5">
        <div className="mb-3 flex min-w-0 items-start justify-between gap-3">
          <h3 className="min-w-0 text-lg font-semibold leading-snug text-text-primary transition-colors duration-fast group-hover:text-text-link">
            {title}
          </h3>
          {typeLabel && <Badge variant="neutral" className="shrink-0 rounded-[6px]">{typeLabel}</Badge>}
        </div>
        {summary ? (
          <p className="line-clamp-3 text-sm leading-relaxed text-text-secondary">{summary}</p>
        ) : (
          <p className="text-xs text-text-muted">{topic.slug}</p>
        )}
        <div className="mt-auto flex items-center justify-between gap-3 pt-5 text-xs text-text-muted">
          {publishedAt ? <time dateTime={topic.publishedAt || undefined}>{publishedAt}</time> : <span />}
          <span className="font-medium text-text-link" aria-hidden="true">→</span>
        </div>
      </div>
    </Link>
  );
}
