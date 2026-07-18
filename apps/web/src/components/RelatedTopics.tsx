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
    <section className="mt-10 border-t border-border-subtle pt-8">
      <h2 className="mb-5 text-2xl font-semibold text-text-primary">
        {locale === 'zh' ? '相关专题' : 'Related Topics'}
      </h2>
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        {display.map((topic) => (
          <Link
            key={topic.id}
            href={`/${locale}/topics/${topic.slug}`}
            className="group rounded-[8px] border border-border-subtle bg-surface p-4 transition-all duration-fast hover:-translate-y-0.5 hover:border-border-strong hover:shadow-sm active:translate-y-0 focus-visible:outline-none"
          >
            <h3 className="mb-1 text-sm font-semibold text-text-primary transition-colors duration-fast group-hover:text-text-link">
              {topic.translation?.title || topic.slug}
            </h3>
            {topic.translation?.summary && (
              <p className="line-clamp-2 text-xs leading-relaxed text-text-secondary">
                {topic.translation.summary}
              </p>
            )}
          </Link>
        ))}
      </div>
    </section>
  );
}
