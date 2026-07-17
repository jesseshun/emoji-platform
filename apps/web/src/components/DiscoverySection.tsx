import Link from 'next/link';
import type { DiscoveryHomeData, Locale } from '@/lib/types';
import { EmojiGrid } from '@/components/EmojiGrid';
import { CategoryCard } from '@/components/CategoryCard';
import { TopicCard } from '@/components/TopicCard';
import { ArticleCard } from '@/components/ArticleCard';
import { SectionHeader } from '@/components/ui/SectionHeader';

interface DiscoverySectionProps {
  data: DiscoveryHomeData;
  locale: Locale;
}

const VIEW_ALL_CLASS =
  'text-sm font-medium text-text-link hover:text-text-link-hover transition-colors duration-fast';

/**
 * Phase 6D homepage discovery module.
 *
 * Curated, published-only content: featured emojis, featured categories,
 * featured topics, and latest articles. Each subsection is only rendered when
 * it has data, so no empty / undefined / null blocks appear.
 */
export function DiscoverySection({ data, locale }: DiscoverySectionProps) {
  const { featuredEmojis, featuredCategories, featuredTopics, latestArticles } = data;

  const labels = {
    emojis: locale === 'zh' ? '热门表情' : 'Popular Emojis',
    categories: locale === 'zh' ? '精选分类' : 'Featured Categories',
    topics: locale === 'zh' ? '精选专题' : 'Featured Topics',
    articles: locale === 'zh' ? '最新文章' : 'Latest Articles',
    allEmojis: locale === 'zh' ? '查看全部 →' : 'View all →',
    allCategories: locale === 'zh' ? '查看全部分类 →' : 'View all categories →',
    allTopics: locale === 'zh' ? '查看全部专题 →' : 'View all topics →',
    allArticles: locale === 'zh' ? '查看全部文章 →' : 'View all articles →',
  };

  return (
    <div className="space-y-14">
      {featuredEmojis && featuredEmojis.length > 0 && (
        <section className="max-w-content-wide mx-auto px-4 sm:px-6">
          <SectionHeader
            title={labels.emojis}
            action={
              <Link href={`/${locale}/emojis`} className={VIEW_ALL_CLASS}>
                {labels.allEmojis}
              </Link>
            }
          />
          <EmojiGrid emojis={featuredEmojis} locale={locale} />
        </section>
      )}

      {featuredCategories && featuredCategories.length > 0 && (
        <section className="max-w-content-wide mx-auto px-4 sm:px-6">
          <SectionHeader
            title={labels.categories}
            action={
              <Link href={`/${locale}/categories`} className={VIEW_ALL_CLASS}>
                {labels.allCategories}
              </Link>
            }
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {featuredCategories.map((cat) => (
              <CategoryCard key={cat.id} category={cat} locale={locale} />
            ))}
          </div>
        </section>
      )}

      {featuredTopics && featuredTopics.length > 0 && (
        <section className="max-w-content-wide mx-auto px-4 sm:px-6">
          <SectionHeader
            title={labels.topics}
            action={
              <Link href={`/${locale}/topics`} className={VIEW_ALL_CLASS}>
                {labels.allTopics}
              </Link>
            }
          />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {featuredTopics.map((topic) => (
              <TopicCard key={topic.id} topic={topic} locale={locale} />
            ))}
          </div>
        </section>
      )}

      {latestArticles && latestArticles.length > 0 && (
        <section className="max-w-content-wide mx-auto px-4 sm:px-6">
          <SectionHeader
            title={labels.articles}
            action={
              <Link href={`/${locale}/articles`} className={VIEW_ALL_CLASS}>
                {labels.allArticles}
              </Link>
            }
          />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {latestArticles.map((article) => (
              <ArticleCard key={article.id} article={article} locale={locale} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
