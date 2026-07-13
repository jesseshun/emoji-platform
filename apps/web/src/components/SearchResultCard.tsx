import Link from 'next/link';
import type { Locale, SearchItem } from '@/lib/types';
import { CopyButton } from './CopyButton';
import { Highlight } from './Highlight';

interface SearchResultCardProps {
  item: SearchItem;
  locale: Locale;
  query: string;
}

const typeLabels: Record<string, Record<Locale, string>> = {
  emoji: { zh: '表情', en: 'Emoji' },
  category: { zh: '分类', en: 'Category' },
  topic: { zh: '专题', en: 'Topic' },
  article: { zh: '文章', en: 'Article' },
};

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

function TypeBadge({ item, locale }: { item: SearchItem; locale: Locale }) {
  const label = typeLabels[item.type]?.[locale] ?? item.type;
  const color =
    item.type === 'emoji'
      ? 'bg-blue-50 text-blue-600'
      : item.type === 'category'
        ? 'bg-green-50 text-green-600'
        : item.type === 'topic'
          ? 'bg-purple-50 text-purple-600'
          : 'bg-amber-50 text-amber-600';
  return (
    <span className={`text-[11px] px-2 py-0.5 rounded-full ${color} whitespace-nowrap`}>{label}</span>
  );
}

export function SearchResultCard({ item, locale, query }: SearchResultCardProps) {
  if (item.type === 'emoji') {
    const name = item.translation?.name || item.slug;
    const meaning = item.translation?.oneLineMeaning;
    const categoryName = item.category?.name;
    const shortcode = item.shortcode;
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md transition-shadow group">
        <div className="flex items-start justify-between gap-2 mb-2">
          <TypeBadge item={item} locale={locale} />
        </div>
        <Link href={`/${locale}/emoji/${item.slug}`} className="block">
          <div className="flex items-center justify-center h-16 mb-3">
            <span className="text-4xl leading-none">{item.emojiChar}</span>
          </div>
          <h3 className="text-sm font-medium text-gray-900 truncate mb-1">
            <Highlight text={name} query={query} />
          </h3>
        </Link>
        {meaning && (
          <p className="text-xs text-gray-500 truncate mb-2">
            <Highlight text={meaning} query={query} />
          </p>
        )}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 min-w-0">
            {categoryName && <span className="text-xs text-gray-400 truncate">{categoryName}</span>}
            {shortcode && (
              <span className="text-xs text-gray-300 font-mono truncate">{shortcode}</span>
            )}
          </div>
          <CopyButton emojiChar={item.emojiChar} emojiId={item.id} locale={locale} />
        </div>
      </div>
    );
  }

  if (item.type === 'category') {
    const name = item.name || item.slug;
    const href = `/${locale}/categories/${item.slug}`;
    return (
      <Link
        href={href}
        className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow group block"
      >
        <div className="flex items-center gap-3 mb-3">
          <span className="text-3xl">{item.iconEmoji || '📁'}</span>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="text-base font-semibold text-gray-900 group-hover:text-green-600 transition-colors truncate">
                <Highlight text={name} query={query} />
              </h3>
              <TypeBadge item={item} locale={locale} />
            </div>
            {item.emojiCount > 0 && (
              <span className="text-xs text-gray-400">
                {item.emojiCount} {locale === 'zh' ? '个表情' : 'emojis'}
              </span>
            )}
          </div>
        </div>
        {item.description && (
          <p className="text-sm text-gray-500 line-clamp-2">
            <Highlight text={item.description} query={query} />
          </p>
        )}
      </Link>
    );
  }

  if (item.type === 'topic') {
    const title = item.title || item.slug;
    return (
      <Link
        href={`/${locale}/topics/${item.slug}`}
        className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow group block"
      >
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 className="text-base font-semibold text-gray-900 group-hover:text-purple-600 transition-colors">
            <Highlight text={title} query={query} />
          </h3>
          <TypeBadge item={item} locale={locale} />
        </div>
        {item.summary && (
          <p className="text-sm text-gray-500 line-clamp-2">
            <Highlight text={item.summary} query={query} />
          </p>
        )}
      </Link>
    );
  }

  // article
  const title = item.title || item.slug;
  const date = formatDate(item.publishedAt, locale);
  return (
    <Link
      href={`/${locale}/articles/${item.slug}`}
      className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-md transition-shadow group block"
    >
      {item.coverImage ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={item.coverImage} alt={title} className="w-full h-40 object-cover" loading="lazy" />
      ) : (
        <div className="w-full h-40 bg-gradient-to-br from-purple-50 to-blue-50 flex items-center justify-center text-3xl">
          📄
        </div>
      )}
      <div className="p-5">
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 className="text-base font-semibold text-gray-900 group-hover:text-purple-600 transition-colors">
            <Highlight text={title} query={query} />
          </h3>
          <TypeBadge item={item} locale={locale} />
        </div>
        {item.summary && <p className="text-sm text-gray-500 line-clamp-2">{item.summary}</p>}
        {date && <p className="text-xs text-gray-400 mt-3">{date}</p>}
      </div>
    </Link>
  );
}
