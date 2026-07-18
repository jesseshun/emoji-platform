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
  return (
    <span className="whitespace-nowrap rounded-[6px] border border-border-subtle bg-bg-subtle px-2 py-0.5 text-[11px] font-medium text-text-secondary">
      {label}
    </span>
  );
}

function firstKeywords(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.filter((item): item is string => typeof item === 'string' && item.trim().length > 0).slice(0, 2);
  }
  if (typeof value === 'string') {
    try {
      const parsed: unknown = JSON.parse(value);
      if (Array.isArray(parsed)) {
        return parsed.filter((item): item is string => typeof item === 'string' && item.trim().length > 0).slice(0, 2);
      }
    } catch {
      return [];
    }
  }
  return [];
}

export function SearchResultCard({ item, locale, query }: SearchResultCardProps) {
  if (item.type === 'emoji') {
    const name = item.translation?.name || item.slug;
    const meaning = item.translation?.oneLineMeaning;
    const categoryName = item.category?.name;
    const shortcode = item.shortcode;
    const keywords = firstKeywords(item.translation?.keywords);
    return (
      <article className="group flex min-h-[190px] flex-col rounded-[8px] border border-border-subtle bg-surface p-5 transition-all duration-fast hover:border-border-strong hover:shadow-sm">
        <div className="mb-3 flex items-start justify-between gap-3">
          <TypeBadge item={item} locale={locale} />
          {shortcode && <span className="max-w-[55%] truncate font-mono text-xs text-text-muted">{shortcode}</span>}
        </div>
        <Link href={`/${locale}/emoji/${item.slug}`} className="flex min-w-0 flex-1 items-start gap-4 rounded-[6px] focus-visible:outline-none">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-[8px] bg-bg-subtle">
            <span className="text-4xl leading-none" role="img" aria-label={name}>{item.emojiChar}</span>
          </div>
          <div className="min-w-0 pt-0.5">
            <h3 className="mb-1 truncate text-base font-semibold text-text-primary transition-colors duration-fast group-hover:text-text-link">
              <Highlight text={name} query={query} />
            </h3>
            {meaning && (
              <p className="line-clamp-2 text-sm leading-relaxed text-text-secondary">
                <Highlight text={meaning} query={query} />
              </p>
            )}
            {keywords.length > 0 && (
              <p className="mt-2 truncate text-xs text-text-muted">{keywords.join(' · ')}</p>
            )}
          </div>
        </Link>
        <div className="mt-4 flex items-center justify-between gap-3 border-t border-border-subtle pt-3">
          <div className="min-w-0 truncate text-xs text-text-muted">
            {categoryName || (locale === 'zh' ? 'Emoji 详情' : 'Emoji details')}
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <Link href={`/${locale}/emoji/${item.slug}`} className="inline-flex min-h-9 items-center rounded-[8px] px-2 text-xs font-medium text-text-link hover:bg-accent-subtle">
              {locale === 'zh' ? '详情' : 'Details'} <span aria-hidden="true" className="ml-1">→</span>
            </Link>
            <CopyButton emojiChar={item.emojiChar} emojiId={item.id} locale={locale} />
          </div>
        </div>
      </article>
    );
  }

  if (item.type === 'category') {
    const name = item.name || item.slug;
    const href = `/${locale}/categories/${item.slug}`;
    return (
      <Link
        href={href}
        className="group block min-h-[190px] rounded-[8px] border border-border-subtle bg-surface p-5 transition-all duration-fast hover:border-border-strong hover:shadow-sm"
      >
        <div className="flex items-center gap-3 mb-3">
          <span className="text-3xl">{item.iconEmoji || '📁'}</span>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="truncate text-base font-semibold text-text-primary transition-colors group-hover:text-text-link">
                <Highlight text={name} query={query} />
              </h3>
              <TypeBadge item={item} locale={locale} />
            </div>
            {item.emojiCount > 0 && (
              <span className="text-xs text-text-muted">
                {item.emojiCount} {locale === 'zh' ? '个表情' : 'emojis'}
              </span>
            )}
          </div>
        </div>
        {item.description && (
          <p className="line-clamp-3 text-sm leading-relaxed text-text-secondary">
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
        className="group block min-h-[190px] rounded-[8px] border border-border-subtle bg-surface p-5 transition-all duration-fast hover:border-border-strong hover:shadow-sm"
      >
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 className="text-base font-semibold text-text-primary transition-colors group-hover:text-text-link">
            <Highlight text={title} query={query} />
          </h3>
          <TypeBadge item={item} locale={locale} />
        </div>
        {item.summary && (
          <p className="line-clamp-3 text-sm leading-relaxed text-text-secondary">
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
      className="group block min-h-[190px] overflow-hidden rounded-[8px] border border-border-subtle bg-surface transition-all duration-fast hover:border-border-strong hover:shadow-sm sm:flex"
    >
      {item.coverImage ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={item.coverImage} alt={title} className="h-36 w-full object-cover sm:h-auto sm:w-40" loading="lazy" />
      ) : (
        <div className="flex h-28 w-full items-center justify-center border-b border-border-subtle bg-bg-subtle text-sm font-medium text-text-muted sm:h-auto sm:w-40 sm:border-b-0 sm:border-r">
          {locale === 'zh' ? '文章' : 'Article'}
        </div>
      )}
      <div className="min-w-0 flex-1 p-5">
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 className="text-base font-semibold text-text-primary transition-colors group-hover:text-text-link">
            <Highlight text={title} query={query} />
          </h3>
          <TypeBadge item={item} locale={locale} />
        </div>
        {item.summary && <p className="line-clamp-3 text-sm leading-relaxed text-text-secondary">{item.summary}</p>}
        {date && <p className="mt-3 text-xs text-text-muted">{date}</p>}
      </div>
    </Link>
  );
}
