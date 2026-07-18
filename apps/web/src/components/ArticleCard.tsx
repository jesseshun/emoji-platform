import Link from 'next/link';
import type { ArticleItem, Locale } from '@/lib/types';

interface ArticleCardProps {
  article: ArticleItem;
  locale: Locale;
  variant?: 'default' | 'featured';
  headingLevel?: 2 | 3;
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

export function ArticleCard({
  article,
  locale,
  variant = 'default',
  headingLevel = 3,
}: ArticleCardProps) {
  const title = article.translation?.title || article.slug;
  const summary = article.translation?.summary;
  const date = formatDate(article.publishedAt, locale);
  const isFeatured = variant === 'featured';
  const Heading = headingLevel === 2 ? 'h2' : 'h3';
  const articleLabel = locale === 'zh' ? '文章' : 'Article';

  return (
    <article className="min-w-0">
      <Link
        href={`/${locale}/articles/${article.slug}`}
        className={`group grid min-w-0 overflow-hidden rounded-[8px] border border-border-subtle bg-surface transition-all duration-fast hover:-translate-y-0.5 hover:border-border-strong hover:shadow-sm active:translate-y-0 focus-visible:outline-none ${
          isFeatured
            ? 'sm:grid-cols-[minmax(0,1.08fr)_minmax(18rem,0.92fr)]'
            : 'h-full grid-rows-[auto_1fr]'
        }`}
      >
        <div className={`relative overflow-hidden border-border-subtle ${isFeatured ? 'aspect-[16/9] border-b sm:aspect-auto sm:min-h-[22rem] sm:border-b-0 sm:border-r' : 'aspect-[16/9] border-b'}`}>
          {article.coverImage ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={article.coverImage}
              alt={title}
              className="h-full w-full object-cover transition-transform duration-slow group-hover:scale-[1.015]"
              loading="lazy"
            />
          ) : (
            <div className="flex h-full min-h-[10rem] w-full flex-col items-center justify-center gap-3 bg-bg-muted px-6 text-center">
              <span className="text-4xl leading-none" aria-hidden="true">📄</span>
              <span className="text-xs font-medium text-text-muted">{articleLabel}</span>
            </div>
          )}
        </div>

        <div className={`flex min-w-0 flex-col ${isFeatured ? 'p-6 sm:p-8' : 'p-5'}`}>
          <div className="mb-4 flex min-w-0 items-center justify-between gap-4 text-xs text-text-muted">
            <span>{articleLabel}</span>
            {date && <time className="shrink-0 tabular-nums" dateTime={article.publishedAt || undefined}>{date}</time>}
          </div>
          <Heading className={`text-pretty font-semibold leading-tight text-text-primary transition-colors duration-fast group-hover:text-text-link ${isFeatured ? 'text-2xl sm:text-3xl' : 'text-lg'}`}>
            {title}
          </Heading>
          {summary && (
            <p className={`mt-3 text-pretty leading-relaxed text-text-secondary ${isFeatured ? 'line-clamp-4 text-base' : 'line-clamp-3 text-sm'}`}>
              {summary}
            </p>
          )}
          <span className="mt-auto pt-6 text-sm font-medium text-text-link">
            {locale === 'zh' ? '阅读全文' : 'Read article'} <span aria-hidden="true">→</span>
          </span>
        </div>
      </Link>
    </article>
  );
}
