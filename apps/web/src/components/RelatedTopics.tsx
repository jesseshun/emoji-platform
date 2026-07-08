import Link from 'next/link';
import type { RelatedTopic, Locale } from '@/lib/types';

interface RelatedTopicsProps {
  topics: RelatedTopic[];
  locale: Locale;
}

export function RelatedTopics({ topics, locale }: RelatedTopicsProps) {
  if (!topics || topics.length === 0) return null;

  const display = topics.slice(0, 6);

  return (
    <section className="mt-8">
      <h2 className="text-xl font-bold text-gray-900 mb-4">
        {locale === 'zh' ? '相关专题' : 'Related Topics'}
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {display.map((topic) => (
          <Link
            key={topic.id}
            href={`/${locale}/topics/${topic.slug}`}
            className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow group"
          >
            <h3 className="text-sm font-semibold text-gray-900 group-hover:text-purple-600 transition-colors mb-1">
              {topic.translation?.title || topic.slug}
            </h3>
            {topic.translation?.summary && (
              <p className="text-xs text-gray-500 line-clamp-2">
                {topic.translation.summary}
              </p>
            )}
          </Link>
        ))}
      </div>
    </section>
  );
}
