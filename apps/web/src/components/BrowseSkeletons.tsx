import type { Locale } from '@/lib/types';

function LoadingLabel({ locale }: { locale: Locale }) {
  return (
    <span className="sr-only">
      {locale === 'zh' ? '正在加载内容' : 'Loading content'}
    </span>
  );
}

export function SearchResultsSkeleton({ locale, count = 6 }: { locale: Locale; count?: number }) {
  return (
    <div role="status" aria-live="polite" aria-busy="true">
      <LoadingLabel locale={locale} />
      <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
        {Array.from({ length: count }, (_, index) => (
          <div key={index} className="min-h-[156px] animate-pulse rounded-[8px] border border-border-subtle bg-surface p-5">
            <div className="mb-5 flex items-center gap-4">
              <div className="h-14 w-14 shrink-0 rounded-[8px] bg-bg-muted" />
              <div className="min-w-0 flex-1 space-y-2.5">
                <div className="h-3 w-16 rounded bg-bg-muted" />
                <div className="h-4 w-2/3 rounded bg-bg-muted" />
                <div className="h-3 w-full rounded bg-bg-subtle" />
              </div>
            </div>
            <div className="h-9 w-full rounded-[8px] bg-bg-subtle" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function EmojiGridSkeleton({ locale, count = 12 }: { locale: Locale; count?: number }) {
  return (
    <div role="status" aria-live="polite" aria-busy="true">
      <LoadingLabel locale={locale} />
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:gap-4 lg:grid-cols-4 xl:grid-cols-5">
        {Array.from({ length: count }, (_, index) => (
          <div key={index} className="h-[220px] animate-pulse rounded-[8px] border border-border-subtle bg-surface p-4">
            <div className="mx-auto mb-5 h-20 w-20 rounded-[8px] bg-bg-muted" />
            <div className="mb-2 h-4 w-3/4 rounded bg-bg-muted" />
            <div className="mb-5 h-3 w-full rounded bg-bg-subtle" />
            <div className="h-10 w-full rounded-[8px] bg-bg-subtle" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function EmojiDetailSkeleton({ locale }: { locale: Locale }) {
  return (
    <div className="mx-auto max-w-content px-4 py-8 sm:px-6 sm:py-12" role="status" aria-live="polite" aria-busy="true">
      <LoadingLabel locale={locale} />
      <div className="mb-5 h-4 w-64 max-w-full animate-pulse rounded bg-bg-muted" />
      <div className="grid animate-pulse gap-6 rounded-[8px] border border-border-subtle bg-surface p-6 sm:grid-cols-[9rem_minmax(0,1fr)] sm:p-8">
        <div className="mx-auto h-36 w-36 rounded-[8px] bg-bg-muted" />
        <div className="space-y-4 py-2">
          <div className="h-3 w-24 rounded bg-bg-muted" />
          <div className="h-8 w-2/3 rounded bg-bg-muted" />
          <div className="h-4 w-full rounded bg-bg-subtle" />
          <div className="h-11 w-36 rounded-[8px] bg-bg-muted" />
        </div>
      </div>
      <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <div className="h-80 animate-pulse rounded-[8px] bg-surface" />
        <div className="h-72 animate-pulse rounded-[8px] bg-surface" />
      </div>
    </div>
  );
}

export function CategoryListSkeleton({ locale }: { locale: Locale }) {
  return (
    <div className="mx-auto max-w-content px-4 py-8 sm:px-6 sm:py-12" role="status" aria-live="polite" aria-busy="true">
      <LoadingLabel locale={locale} />
      <div className="mb-10 animate-pulse border-b border-border-subtle pb-8">
        <div className="mb-4 h-3 w-24 rounded bg-bg-muted" />
        <div className="h-9 w-64 max-w-full rounded bg-bg-muted" />
        <div className="mt-4 h-4 w-[34rem] max-w-full rounded bg-bg-subtle" />
      </div>
      <div className="overflow-hidden rounded-[8px] border border-border-subtle bg-surface">
        {Array.from({ length: 5 }, (_, index) => (
          <div key={index} className="flex animate-pulse items-center gap-4 border-b border-border-subtle p-4 last:border-b-0">
            <div className="h-12 w-12 shrink-0 rounded-[8px] bg-bg-muted" />
            <div className="min-w-0 flex-1 space-y-2">
              <div className="h-4 w-48 max-w-full rounded bg-bg-muted" />
              <div className="h-3 w-3/4 rounded bg-bg-subtle" />
            </div>
            <div className="h-9 w-9 shrink-0 rounded-[8px] bg-bg-subtle" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function TopicListSkeleton({ locale }: { locale: Locale }) {
  return (
    <div className="mx-auto max-w-content px-4 py-8 sm:px-6 sm:py-12" role="status" aria-live="polite" aria-busy="true">
      <LoadingLabel locale={locale} />
      <div className="mb-10 animate-pulse border-b border-border-subtle pb-8">
        <div className="mb-4 h-3 w-24 rounded bg-bg-muted" />
        <div className="h-9 w-56 max-w-full rounded bg-bg-muted" />
        <div className="mt-4 h-4 w-[30rem] max-w-full rounded bg-bg-subtle" />
      </div>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {Array.from({ length: 4 }, (_, index) => (
          <div key={index} className="grid min-h-[230px] animate-pulse overflow-hidden rounded-[8px] border border-border-subtle bg-surface sm:grid-cols-[10rem_minmax(0,1fr)]">
            <div className="h-28 bg-bg-muted sm:h-full" />
            <div className="space-y-3 p-5">
              <div className="h-5 w-2/3 rounded bg-bg-muted" />
              <div className="h-3 w-full rounded bg-bg-subtle" />
              <div className="h-3 w-4/5 rounded bg-bg-subtle" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function BrowseDetailSkeleton({ locale }: { locale: Locale }) {
  return (
    <div className="mx-auto max-w-content px-4 py-8 sm:px-6 sm:py-12" role="status" aria-live="polite" aria-busy="true">
      <LoadingLabel locale={locale} />
      <div className="mb-6 h-4 w-64 max-w-full animate-pulse rounded bg-bg-muted" />
      <div className="flex animate-pulse items-start gap-5 border-b border-border-subtle pb-10">
        <div className="h-20 w-20 shrink-0 rounded-[8px] bg-bg-muted" />
        <div className="min-w-0 flex-1 space-y-4 py-1">
          <div className="h-3 w-20 rounded bg-bg-muted" />
          <div className="h-9 w-2/3 rounded bg-bg-muted" />
          <div className="h-4 w-full rounded bg-bg-subtle" />
        </div>
      </div>
      <div className="mt-10">
        <EmojiGridSkeleton locale={locale} count={10} />
      </div>
    </div>
  );
}

export function ArticleListSkeleton({ locale }: { locale: Locale }) {
  return (
    <div className="mx-auto max-w-content px-4 py-8 sm:px-6 sm:py-12" role="status" aria-live="polite" aria-busy="true">
      <LoadingLabel locale={locale} />
      <div className="mb-12 animate-pulse border-b border-border-subtle pb-8">
        <div className="h-10 w-48 max-w-full rounded bg-bg-muted" />
        <div className="mt-4 h-4 w-[34rem] max-w-full rounded bg-bg-subtle" />
      </div>
      <div className="grid min-h-[22rem] animate-pulse overflow-hidden rounded-[8px] border border-border-subtle bg-surface sm:grid-cols-2">
        <div className="min-h-48 bg-bg-muted" />
        <div className="space-y-4 p-6 sm:p-8">
          <div className="h-3 w-24 rounded bg-bg-muted" />
          <div className="h-8 w-4/5 rounded bg-bg-muted" />
          <div className="h-4 w-full rounded bg-bg-subtle" />
          <div className="h-4 w-3/4 rounded bg-bg-subtle" />
        </div>
      </div>
      <div className="mt-10 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 3 }, (_, index) => (
          <div key={index} className="animate-pulse overflow-hidden rounded-[8px] border border-border-subtle bg-surface">
            <div className="aspect-[16/9] bg-bg-muted" />
            <div className="space-y-3 p-5">
              <div className="h-3 w-20 rounded bg-bg-muted" />
              <div className="h-5 w-4/5 rounded bg-bg-muted" />
              <div className="h-3 w-full rounded bg-bg-subtle" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function ArticleDetailSkeleton({ locale }: { locale: Locale }) {
  return (
    <div className="mx-auto max-w-content px-4 py-8 sm:px-6 sm:py-12" role="status" aria-live="polite" aria-busy="true">
      <LoadingLabel locale={locale} />
      <div className="mb-6 h-4 w-64 max-w-full animate-pulse rounded bg-bg-muted" />
      <div className="mx-auto max-w-[50rem] animate-pulse py-8 text-center">
        <div className="mx-auto h-3 w-20 rounded bg-bg-muted" />
        <div className="mx-auto mt-5 h-10 w-4/5 rounded bg-bg-muted" />
        <div className="mx-auto mt-5 h-4 w-2/3 rounded bg-bg-subtle" />
        <div className="mx-auto mt-7 h-4 w-72 max-w-full rounded bg-bg-subtle" />
      </div>
      <div className="mx-auto mt-8 max-w-[46rem] animate-pulse space-y-5 border-t border-border-subtle pt-10">
        <div className="h-4 w-full rounded bg-bg-subtle" />
        <div className="h-4 w-11/12 rounded bg-bg-subtle" />
        <div className="h-7 w-1/2 rounded bg-bg-muted" />
        <div className="h-4 w-full rounded bg-bg-subtle" />
        <div className="h-4 w-4/5 rounded bg-bg-subtle" />
      </div>
    </div>
  );
}
