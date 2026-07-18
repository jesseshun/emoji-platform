import Link from 'next/link';
import { ArticleCard } from '@/components/ArticleCard';
import { Breadcrumb } from '@/components/Breadcrumb';
import { CategoryCard } from '@/components/CategoryCard';
import { EmojiGrid } from '@/components/EmojiGrid';
import { EmptyState } from '@/components/EmptyState';
import { Pagination } from '@/components/Pagination';
import { RelatedCategories } from '@/components/RelatedCategories';
import { RelatedTopics } from '@/components/RelatedTopics';
import type {
  CategoryDetailData,
  CategoryEmoji,
  CategoryItem,
  EmojiBase,
  Locale,
  RecommendationData,
} from '@/lib/types';
import { safeText } from '@/lib/seo';

interface CategoryDetailViewProps {
  locale: Locale;
  slug: string;
  page: number;
  data: CategoryDetailData;
  meta: { total: number; totalPages: number };
  categories: CategoryItem[];
  recommendations: RecommendationData | null;
}

function mapEmoji(emoji: CategoryEmoji): EmojiBase {
  return {
    id: emoji.id,
    emojiChar: emoji.emojiChar,
    slug: emoji.slug,
    unicodeCodepoint: emoji.unicodeCodepoint,
    shortcode: emoji.shortcode,
    category: null,
    translation: emoji.translation
      ? {
          name: emoji.translation.name,
          shortName: emoji.translation.shortName,
          oneLineMeaning: emoji.translation.oneLineMeaning,
          keywords: null,
          seoTitle: null,
          seoDescription: null,
          locale: emoji.translation.locale,
        }
      : null,
  };
}

export function CategoryDetailView({
  locale,
  slug,
  page,
  data,
  meta,
  categories,
  recommendations,
}: CategoryDetailViewProps) {
  const isZh = locale === 'zh';
  const { category, emojis, relatedTopics } = data;
  const name = safeText(category.translation?.name) || category.slug;
  const description = category.translation?.description || null;
  const icon = category.iconEmoji || '📁';
  const parent = category.parentId
    ? categories.find((item) => item.id === category.parentId) ?? null
    : null;
  const children = categories.filter((item) => item.parentId === category.id);
  const navigationIds = new Set([category.id, parent?.id, ...children.map((item) => item.id)].filter(Boolean));
  const relatedCategories = (recommendations?.relatedCategories ?? [])
    .filter((item) => !navigationIds.has(item.id));
  const relatedArticles = recommendations?.relatedArticles ?? [];
  const emojiList = emojis.map(mapEmoji);
  const countLabel = isZh
    ? `${meta.total.toLocaleString('zh-CN')} 个表情`
    : `${meta.total.toLocaleString('en-US')} ${meta.total === 1 ? 'emoji' : 'emojis'}`;

  return (
    <div className="mx-auto max-w-content px-4 py-8 sm:px-6 sm:py-12">
      <Breadcrumb
        locale={locale}
        items={[
          { label: isZh ? 'Emoji 分类' : 'Categories', href: `/${locale}/categories` },
          { label: name },
        ]}
      />

      <header className="border-b border-border-subtle pb-8 sm:pb-10">
        <div className="flex min-w-0 items-start gap-4 sm:gap-6">
          <span
            className="flex h-16 w-16 shrink-0 items-center justify-center rounded-[8px] border border-border-subtle bg-surface text-4xl sm:h-20 sm:w-20 sm:text-5xl"
            aria-hidden="true"
          >
            {icon}
          </span>
          <div className="min-w-0 flex-1 pt-1">
            <p className="mb-2 text-xs font-semibold text-text-muted">{isZh ? '分类' : 'CATEGORY'}</p>
            <h1 className="break-words text-3xl font-semibold leading-tight text-text-primary sm:text-4xl">{name}</h1>
            {description && (
              <p className="mt-3 max-w-2xl text-sm leading-relaxed text-text-secondary sm:text-base">{description}</p>
            )}
            <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs tabular-nums text-text-muted">
              <span>{countLabel}</span>
              {parent && (
                <Link href={`/${locale}/categories/${parent.slug}`} className="font-medium text-text-link hover:text-text-link-hover">
                  {isZh ? '上级分类：' : 'Parent: '}{parent.translation?.name || parent.slug}
                </Link>
              )}
            </div>
          </div>
        </div>
      </header>

      {(parent || children.length > 0) && (
        <nav className="border-b border-border-subtle py-8" aria-label={isZh ? '分类层级导航' : 'Category hierarchy'}>
          <div className="mb-4 flex items-end justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold text-text-primary">{isZh ? '分类层级' : 'Category hierarchy'}</h2>
              <p className="mt-1 text-sm text-text-secondary">
                {isZh ? '在当前分类的上下级之间继续浏览。' : 'Continue through the parent and child categories.'}
              </p>
            </div>
          </div>
          {parent && (
            <div className="mb-3">
              <p className="mb-2 text-xs text-text-muted">{isZh ? '上级分类' : 'Parent category'}</p>
              <CategoryCard category={parent} locale={locale} variant="compact" />
            </div>
          )}
          {children.length > 0 && (
            <div>
              <p className="mb-2 text-xs text-text-muted">{isZh ? '子分类' : 'Subcategories'}</p>
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                {children.map((child) => (
                  <CategoryCard key={child.id} category={child} locale={locale} variant="compact" />
                ))}
              </div>
            </div>
          )}
        </nav>
      )}

      <section className="pt-8 sm:pt-10" aria-labelledby="category-emojis-heading">
        <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 id="category-emojis-heading" className="text-xl font-semibold text-text-primary">
              {isZh ? '分类中的 Emoji' : 'Emojis in this category'}
            </h2>
            <p className="mt-1 text-sm text-text-secondary">{countLabel}</p>
          </div>
          {meta.totalPages > 1 && (
            <span className="text-xs tabular-nums text-text-muted">
              {isZh ? `第 ${page} / ${meta.totalPages} 页` : `Page ${page} of ${meta.totalPages}`}
            </span>
          )}
        </div>
        {emojiList.length > 0 ? (
          <>
            <EmojiGrid emojis={emojiList} locale={locale} />
            <Pagination locale={locale} page={page} totalPages={meta.totalPages} basePath={`/${locale}/categories/${slug}`} />
          </>
        ) : (
          <EmptyState
            icon={icon}
            title={isZh ? '该分类暂无 Emoji' : 'No emojis in this category'}
            description={isZh ? '这个分类暂未收录已发布的 Emoji。' : 'This category does not currently contain any published emojis.'}
          />
        )}
      </section>

      {relatedTopics.length > 0 && <RelatedTopics topics={relatedTopics} locale={locale} />}
      <RelatedCategories categories={relatedCategories} locale={locale} />

      {relatedArticles.length > 0 && (
        <section className="mt-10 border-t border-border-subtle pt-8">
          <h2 className="mb-4 text-xl font-semibold text-text-primary">{isZh ? '相关文章' : 'Related articles'}</h2>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
            {relatedArticles.map((article) => (
              <ArticleCard key={article.id} article={article} locale={locale} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
