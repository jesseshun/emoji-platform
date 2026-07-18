import Link from 'next/link';
import type { ArticleDetailData, Locale } from '@/lib/types';
import { ArticleBody } from '@/components/ArticleBody';
import { ArticleCard } from '@/components/ArticleCard';
import { Breadcrumb } from '@/components/Breadcrumb';
import { EmptyState } from '@/components/EmptyState';
import { JsonLd } from '@/components/JsonLd';
import { RelatedEmojis } from '@/components/RelatedEmojis';
import { RelatedTopics } from '@/components/RelatedTopics';

interface ArticleDetailViewProps {
  data: ArticleDetailData;
  jsonLd: Record<string, unknown>;
  locale: Locale;
}

function formatDate(value: string | null, locale: Locale): string | null {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleDateString(locale === 'zh' ? 'zh-CN' : 'en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

function parseKeywords(raw: unknown): string[] {
  if (Array.isArray(raw)) {
    return raw.filter((keyword): keyword is string => typeof keyword === 'string' && keyword.trim().length > 0);
  }

  if (typeof raw !== 'string' || !raw.trim()) return [];

  try {
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed)
      ? parsed.filter((keyword): keyword is string => typeof keyword === 'string' && keyword.trim().length > 0)
      : [];
  } catch {
    return [];
  }
}

export function ArticleDetailView({ data, jsonLd, locale }: ArticleDetailViewProps) {
  const { article, relatedArticles, relatedTopics, relatedEmojis } = data;
  const isZh = locale === 'zh';
  const title = article.translation?.title || article.slug;
  const summary = article.translation?.summary || null;
  const content = article.translation?.content?.trim() || null;
  const authorName = article.author?.name || null;
  const publishedLabel = formatDate(article.publishedAt, locale);
  const updatedLabel = formatDate(article.updatedAt, locale);
  const keywords = parseKeywords(article.translation?.keywords);
  const visibleRelatedArticles = relatedArticles.filter(
    (related) => related.translation?.locale === locale && related.translation.title,
  );
  const visibleRelatedTopics = relatedTopics.filter(
    (topic) => topic.translation?.locale === locale && topic.translation.title,
  );
  const visibleRelatedEmojis = relatedEmojis.filter(
    (emoji) => emoji.translation?.locale === locale && emoji.translation.name,
  );

  return (
    <div className="mx-auto max-w-content px-4 py-8 sm:px-6 sm:py-12">
      <Breadcrumb
        locale={locale}
        items={[
          { label: isZh ? '文章' : 'Articles', href: `/${locale}/articles` },
          { label: title },
        ]}
      />
      <JsonLd data={jsonLd} />

      <article>
        <header className="mx-auto max-w-[50rem] pb-8 pt-5 text-center sm:pb-10 sm:pt-8">
          <p className="mb-4 text-xs font-medium text-text-muted">{isZh ? '文章' : 'Article'}</p>
          <h1 className="text-pretty text-3xl font-semibold leading-tight text-text-primary sm:text-4xl lg:text-5xl">
            {title}
          </h1>
          {summary && (
            <p className="mx-auto mt-5 max-w-[42rem] text-pretty text-base leading-relaxed text-text-secondary sm:text-lg">
              {summary}
            </p>
          )}

          {(authorName || publishedLabel || updatedLabel) && (
            <dl className="mt-7 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-sm text-text-muted">
              {authorName && (
                <div className="flex items-center gap-1.5">
                  <dt className="sr-only">{isZh ? '作者' : 'Author'}</dt>
                  <dd className="font-medium text-text-secondary">{authorName}</dd>
                </div>
              )}
              {publishedLabel && (
                <div className="flex items-center gap-1.5">
                  <dt>{isZh ? '发布' : 'Published'}</dt>
                  <dd><time className="tabular-nums" dateTime={article.publishedAt || undefined}>{publishedLabel}</time></dd>
                </div>
              )}
              {updatedLabel && (
                <div className="flex items-center gap-1.5">
                  <dt>{isZh ? '更新' : 'Updated'}</dt>
                  <dd><time className="tabular-nums" dateTime={article.updatedAt || undefined}>{updatedLabel}</time></dd>
                </div>
              )}
            </dl>
          )}

          {keywords.length > 0 && (
            <ul className="mt-6 flex flex-wrap justify-center gap-2" aria-label={isZh ? '关键词' : 'Keywords'}>
              {keywords.map((keyword) => (
                <li key={keyword} className="rounded-[6px] border border-border-subtle bg-bg-subtle px-2.5 py-1 text-xs text-text-secondary">
                  {keyword}
                </li>
              ))}
            </ul>
          )}
        </header>

        {article.coverImage && (
          <figure className="mx-auto mb-10 max-w-[58rem] sm:mb-12">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={article.coverImage}
              alt={title}
              className="aspect-[16/8] h-auto w-full rounded-[8px] border border-border-subtle object-cover"
            />
          </figure>
        )}

        <div className="mx-auto max-w-[46rem] border-t border-border-subtle pt-2 sm:pt-4">
          {content ? (
            <ArticleBody content={content} locale={locale} title={title} />
          ) : (
            <EmptyState
              icon="📄"
              title={isZh ? '正文暂不可用' : 'Article body unavailable'}
              description={isZh ? '这篇文章目前没有可显示的正文。' : 'This article does not currently have body content to display.'}
            />
          )}
        </div>
      </article>

      <div className="mx-auto mt-14 max-w-[58rem] border-t border-border-subtle pt-2 sm:mt-16">
        {visibleRelatedEmojis.length > 0 && (
          <RelatedEmojis emojis={visibleRelatedEmojis} locale={locale} />
        )}

        {visibleRelatedTopics.length > 0 && (
          <RelatedTopics topics={visibleRelatedTopics} locale={locale} />
        )}

        {visibleRelatedArticles.length > 0 && (
          <section className="mt-10 border-t border-border-subtle pt-8">
            <div className="mb-5 flex items-end justify-between gap-4">
              <h2 className="text-2xl font-semibold text-text-primary">
                {isZh ? '相关文章' : 'Related articles'}
              </h2>
              <Link href={`/${locale}/articles`} className="shrink-0 text-sm font-medium text-text-link transition-colors duration-fast hover:text-text-link-hover">
                {isZh ? '查看全部' : 'View all'} <span aria-hidden="true">→</span>
              </Link>
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {visibleRelatedArticles.map((related) => (
                <ArticleCard key={related.id} article={related} locale={locale} />
              ))}
            </div>
          </section>
        )}

        <div className="mt-10 border-t border-border-subtle pt-8">
          <Link
            href={`/${locale}/articles`}
            className="inline-flex min-h-11 items-center gap-2 rounded-[8px] px-2 text-sm font-medium text-text-link transition-colors duration-fast hover:text-text-link-hover"
          >
            <span aria-hidden="true">←</span>
            {isZh ? '返回文章列表' : 'Back to articles'}
          </Link>
        </div>
      </div>
    </div>
  );
}
