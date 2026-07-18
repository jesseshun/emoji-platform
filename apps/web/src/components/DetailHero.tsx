import Link from 'next/link';
import { CopyButton } from './CopyButton';
import type { Locale } from '@/lib/types';

interface DetailHeroProps {
  emojiChar: string;
  emojiId: string;
  slug: string;
  name: string | null;
  shortName: string | null;
  oneLineMeaning: string | null;
  locale: Locale;
  category?: {
    slug: string;
    name: string | null;
  } | null;
}

export function DetailHero({
  emojiChar,
  emojiId,
  slug,
  name,
  shortName,
  oneLineMeaning,
  locale,
  category,
}: DetailHeroProps) {
  const displayName = name || shortName || slug;
  const otherLocale = locale === 'zh' ? 'en' : 'zh';

  return (
    <section className="overflow-hidden rounded-[8px] border border-border-subtle bg-surface shadow-sm">
      <div className="grid gap-6 p-6 sm:grid-cols-[9rem_minmax(0,1fr)] sm:items-center sm:p-8">
        <div className="mx-auto flex h-36 w-36 shrink-0 items-center justify-center rounded-[8px] border border-border-subtle bg-bg-subtle sm:mx-0">
          <span className="select-none text-7xl leading-none" role="img" aria-label={displayName}>{emojiChar}</span>
        </div>

        <div className="min-w-0 text-center sm:text-left">
          <div className="mb-3 flex flex-wrap items-center justify-center gap-2 sm:justify-start">
            <span className="rounded-[6px] border border-border-subtle bg-bg-subtle px-2 py-1 text-[11px] font-semibold text-text-secondary">
              {locale === 'zh' ? '中文释义' : 'ENGLISH DEFINITION'}
            </span>
            <Link href={`/${otherLocale}/emoji/${slug}`} hrefLang={otherLocale} className="text-xs font-medium text-text-link hover:text-text-link-hover">
              {locale === 'zh' ? '查看英文' : 'View in Chinese'}
            </Link>
          </div>
          <h1 className="break-words text-3xl font-semibold text-text-primary sm:text-4xl">
            {displayName}
          </h1>

          {shortName && (
            <p className="mt-2 break-all font-mono text-sm text-text-muted">{shortName}</p>
          )}

          {oneLineMeaning && (
            <p className="mt-3 max-w-2xl text-base leading-relaxed text-text-secondary">{oneLineMeaning}</p>
          )}

          <div className="mt-5 flex flex-wrap items-center justify-center gap-3 sm:justify-start">
            <CopyButton emojiChar={emojiChar} emojiId={emojiId} locale={locale} variant="primary" />

            {category && (
              <Link
                href={`/${locale}/categories/${category.slug}`}
                className="inline-flex min-h-11 items-center rounded-[8px] border border-border bg-bg-subtle px-3 text-sm font-medium text-text-secondary transition-colors duration-fast hover:border-border-strong hover:text-text-primary"
              >
                {category.name || category.slug}
              </Link>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
