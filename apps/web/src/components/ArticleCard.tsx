import Link from 'next/link';
import type { ArticleItem, Locale } from '@/lib/types';

interface ArticleCardProps {
  article: ArticleItem;
  locale: Locale;
}

function formatDate(value: string | null, locale: Locale): string | null {
  if (!value) return null;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return null;
  return d.toLocaleDateString(locale === 'zh' ? 'zh-CN' : 'en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function ArticleCard({ article, locale }: ArticleCardProps) {
  const title = article.translation?.title || article.slug;
  const summary = article.translation?.summary;
  const date = formatDate(article.publishedAt, locale);

  return (
    <Link
      href={`/${locale}/articles/${article.slug}`}
      className="bg-surface rounded-lg border border-border-subtle overflow-hidden hover:border-border hover:shadow-sm transition-all duration-fast group block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-border-focus)]"
    >
      {article.coverImage ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={article.coverImage}
          alt={title}
          className="w-full h-40 object-cover"
          loading="lazy"
        />
      ) : (
        <div className="w-full h-40 bg-gradient-to-br from-accent-subtle to-bg-muted flex items-center justify-center text-3xl">
          📄
        </div>
      )}
      <div className="p-5">
        <h3 className="text-base font-semibold text-text-primary group-hover:text-accent transition-colors duration-fast mb-2">
          {title}
        </h3>
        {summary && <p className="text-sm text-text-secondary line-clamp-2">{summary}</p>}
        {date && <p className="text-xs text-text-muted mt-3">{date}</p>}
      </div>
    </Link>
  );
}
