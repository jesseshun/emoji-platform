import type { PaginationMeta } from '@emoji-platform/types';
import type { ArticleItem, Locale } from '@/lib/types';
import { ArticleCard } from '@/components/ArticleCard';
import { EmptyState } from '@/components/EmptyState';
import { Pagination } from '@/components/Pagination';

interface ArticleListViewProps {
  articles: ArticleItem[];
  meta: PaginationMeta;
  locale: Locale;
}

export function ArticleListView({ articles, meta, locale }: ArticleListViewProps) {
  const isZh = locale === 'zh';
  const visibleArticles = articles.filter(
    (article) => article.translation?.locale === locale && article.translation.title,
  );
  const featured = meta.page === 1 ? visibleArticles[0] : null;
  const remaining = featured ? visibleArticles.slice(1) : visibleArticles;
  const basePath = `/${locale}/articles`;

  return (
    <div className="mx-auto max-w-content px-4 py-8 sm:px-6 sm:py-12">
      <header className="mb-10 border-b border-border-subtle pb-8 sm:mb-12 sm:flex sm:items-end sm:justify-between sm:gap-10">
        <div className="max-w-2xl">
          <h1 className="text-pretty text-3xl font-semibold leading-tight text-text-primary sm:text-4xl">
            {isZh ? '文章' : 'Articles'}
          </h1>
          <p className="mt-4 text-pretty text-base leading-relaxed text-text-secondary">
            {isZh
              ? '从语境、文化与技术标准出发，深入理解 Emoji 的含义与使用方式。'
              : 'Explore emoji meaning and usage through context, culture, and technical standards.'}
          </p>
        </div>
        <div className="mt-5 flex shrink-0 items-center gap-3 text-xs text-text-muted sm:mt-0 sm:pb-1">
          <span className="tabular-nums">
            {isZh ? `${meta.total.toLocaleString('zh-CN')} 篇已发布` : `${meta.total.toLocaleString('en-US')} published`}
          </span>
          <span className="h-3 w-px bg-border" aria-hidden="true" />
          <span>{isZh ? '按发布时间排列' : 'Newest first'}</span>
        </div>
      </header>

      {visibleArticles.length === 0 ? (
        <EmptyState
          icon="📄"
          title={isZh ? '暂无文章' : 'No articles available'}
          description={isZh ? '当前语言暂无已发布文章。' : 'There are no published articles in this language yet.'}
        />
      ) : (
        <>
          {featured && (
            <section aria-label={isZh ? '最新文章' : 'Latest article'}>
              <ArticleCard article={featured} locale={locale} variant="featured" headingLevel={2} />
            </section>
          )}

          {remaining.length > 0 && (
            <section className={featured ? 'mt-10 sm:mt-12' : ''} aria-label={isZh ? '文章列表' : 'Article list'}>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {remaining.map((article) => (
                  <ArticleCard key={article.id} article={article} locale={locale} headingLevel={2} />
                ))}
              </div>
            </section>
          )}
        </>
      )}

      <Pagination
        locale={locale}
        page={meta.page}
        totalPages={meta.totalPages}
        basePath={basePath}
      />
    </div>
  );
}
