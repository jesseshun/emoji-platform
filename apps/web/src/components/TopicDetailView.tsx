import Link from 'next/link';
import { ArticleCard } from '@/components/ArticleCard';
import { Breadcrumb } from '@/components/Breadcrumb';
import { EmojiGrid } from '@/components/EmojiGrid';
import { EmptyState } from '@/components/EmptyState';
import { FaqBlock } from '@/components/FaqBlock';
import { RelatedTopics } from '@/components/RelatedTopics';
import { TopicCover } from '@/components/TopicCover';
import { Badge } from '@/components/ui/Badge';
import type { FaqItem } from '@/lib/seo';
import { safeText } from '@/lib/seo';
import type {
  EmojiBase,
  Locale,
  RecommendationData,
  TopicBoundEmoji,
  TopicDetailData,
} from '@/lib/types';

interface TopicDetailViewProps {
  locale: Locale;
  data: TopicDetailData;
  recommendations: RecommendationData | null;
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
    month: 'long',
    day: 'numeric',
  });
}

function parseFaqs(value: unknown): FaqItem[] {
  try {
    const parsed = typeof value === 'string' ? JSON.parse(value) : value;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((item): item is FaqItem => {
      if (!item || typeof item !== 'object') return false;
      const candidate = item as { question?: unknown; answer?: unknown };
      return typeof candidate.question === 'string' && typeof candidate.answer === 'string';
    });
  } catch {
    return [];
  }
}

function mapEmoji(emoji: TopicBoundEmoji): EmojiBase {
  return {
    id: emoji.id,
    emojiChar: emoji.emojiChar,
    slug: emoji.slug,
    unicodeCodepoint: emoji.unicodeCodepoint,
    shortcode: emoji.shortcode,
    category: emoji.category
      ? { id: emoji.category.id, slug: emoji.category.slug, name: emoji.category.name, iconEmoji: null }
      : null,
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

export function TopicDetailView({ locale, data, recommendations }: TopicDetailViewProps) {
  const isZh = locale === 'zh';
  const { topic, emojis, relatedTopics } = data;
  const title = safeText(topic.translation?.title) || topic.slug;
  const summary = topic.translation?.summary || null;
  const content = topic.translation?.content || null;
  const typeLabel = topic.topicType
    ? topicTypeLabels[topic.topicType]?.[locale] || topic.topicType
    : null;
  const publishedAt = formatDate(topic.publishedAt, locale);
  const faqs = parseFaqs(topic.translation?.faqJson);
  const emojiList = emojis.map(mapEmoji);
  const categoryMap = new Map<string, NonNullable<TopicBoundEmoji['category']>>();
  for (const emoji of emojis) {
    if (emoji.category && !categoryMap.has(emoji.category.id)) categoryMap.set(emoji.category.id, emoji.category);
  }
  const categories = [...categoryMap.values()];
  const relatedArticles = recommendations?.relatedArticles ?? [];

  return (
    <div className="mx-auto max-w-content px-4 py-8 sm:px-6 sm:py-12">
      <Breadcrumb
        locale={locale}
        items={[
          { label: isZh ? 'Emoji 专题' : 'Topics', href: `/${locale}/topics` },
          { label: title },
        ]}
      />

      <header className="border-b border-border-subtle pb-8 sm:pb-10">
        <div className={topic.coverImage ? 'grid gap-6 lg:grid-cols-[minmax(0,1fr)_22rem] lg:items-start' : ''}>
          <div className="min-w-0 pt-1">
            <div className="mb-4 flex flex-wrap items-center gap-3">
              <p className="text-xs font-semibold text-text-muted">{isZh ? '专题' : 'TOPIC'}</p>
              {typeLabel && <Badge variant="neutral" className="rounded-[6px]">{typeLabel}</Badge>}
              {publishedAt && <time dateTime={topic.publishedAt || undefined} className="text-xs text-text-muted">{publishedAt}</time>}
            </div>
            <h1 className="break-words text-3xl font-semibold leading-tight text-text-primary sm:text-4xl">{title}</h1>
            {summary && <p className="mt-4 max-w-2xl text-base leading-relaxed text-text-secondary sm:text-lg">{summary}</p>}
            <p className="mt-5 text-xs tabular-nums text-text-muted">
              {isZh ? `${emojiList.length.toLocaleString('zh-CN')} 个关联 Emoji` : `${emojiList.length.toLocaleString('en-US')} related emojis`}
            </p>
          </div>
          {topic.coverImage && (
            <TopicCover
              src={topic.coverImage}
              alt={title}
              imageClassName="aspect-[16/10] w-full rounded-[8px] border border-border-subtle object-cover"
              fallbackClassName="flex aspect-[16/10] w-full items-center justify-center rounded-[8px] border border-border-subtle bg-bg-subtle"
            />
          )}
        </div>
      </header>

      {content && (
        <section className="border-b border-border-subtle py-8 sm:py-10" aria-labelledby="topic-content-heading">
          <h2 id="topic-content-heading" className="mb-4 text-xl font-semibold text-text-primary">{isZh ? '专题说明' : 'About this topic'}</h2>
          <div
            className="max-w-3xl whitespace-normal break-words text-sm leading-7 text-text-secondary sm:text-base"
            dangerouslySetInnerHTML={{ __html: content.replace(/\n/g, '<br/>') }}
          />
        </section>
      )}

      {categories.length > 0 && (
        <nav className="border-b border-border-subtle py-8" aria-label={isZh ? '专题关联分类' : 'Topic categories'}>
          <h2 className="text-lg font-semibold text-text-primary">{isZh ? '关联分类' : 'Related categories'}</h2>
          <div className="mt-4 flex flex-wrap gap-2">
            {categories.map((category) => (
              <Link
                key={category.id}
                href={`/${locale}/categories/${category.slug}`}
                className="inline-flex min-h-10 items-center rounded-[8px] border border-border-subtle bg-surface px-3 text-sm font-medium text-text-secondary transition-colors duration-fast hover:border-border-strong hover:text-text-link"
              >
                {category.name || category.slug}
              </Link>
            ))}
          </div>
        </nav>
      )}

      <section className="pt-8 sm:pt-10" aria-labelledby="topic-emojis-heading">
        <div className="mb-5">
          <h2 id="topic-emojis-heading" className="text-xl font-semibold text-text-primary">{isZh ? '专题中的 Emoji' : 'Emojis in this topic'}</h2>
          <p className="mt-1 text-sm text-text-secondary">
            {isZh ? '按照专题的编排顺序浏览关联表情。' : 'Browse associated emojis in the topic’s editorial order.'}
          </p>
        </div>
        {emojiList.length > 0 ? (
          <EmojiGrid emojis={emojiList} locale={locale} />
        ) : (
          <EmptyState
            icon="#"
            title={isZh ? '该专题暂无关联 Emoji' : 'No emojis linked to this topic'}
            description={isZh ? '这个专题暂未收录关联 Emoji。' : 'This topic does not currently contain associated emojis.'}
          />
        )}
      </section>

      <FaqBlock faqs={faqs} />
      {relatedTopics.length > 0 && <RelatedTopics topics={relatedTopics} locale={locale} />}

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
