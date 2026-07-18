import { SearchBox } from '@/components/SearchBox';
import type { Locale } from '@/lib/types';

interface EmojiBrowseHeaderProps {
  locale: Locale;
  total?: number;
  page?: number;
  totalPages?: number;
}

export function EmojiBrowseHeader({ locale, total, page, totalPages }: EmojiBrowseHeaderProps) {
  const isZh = locale === 'zh';
  return (
    <header className="mb-8 border-b border-border-subtle pb-8 sm:mb-10">
      <p className="mb-3 text-xs font-semibold text-text-muted">{isZh ? 'EMOJI 资料库' : 'EMOJI LIBRARY'}</p>
      <h1 className="text-3xl font-semibold text-text-primary sm:text-4xl">
        {isZh ? '浏览全部 Emoji' : 'Browse all emojis'}
      </h1>
      <p className="mt-3 max-w-2xl text-sm leading-relaxed text-text-secondary sm:text-base">
        {isZh
          ? '按统一顺序浏览已发布的 Emoji，查看含义、用法与 Unicode 信息，或直接复制使用。'
          : 'Browse published emojis in a consistent order, then open any item for meaning, usage, and Unicode details.'}
      </p>
      <div className="mt-6 max-w-3xl">
        <SearchBox locale={locale} />
      </div>
      {typeof total === 'number' && (
        <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-text-muted" aria-label={isZh ? '列表状态' : 'List status'}>
          <span>{isZh ? `共 ${total.toLocaleString('zh-CN')} 个 Emoji` : `${total.toLocaleString('en-US')} emojis`}</span>
          {page && totalPages && totalPages > 1 ? (
            <span>{isZh ? `第 ${page} / ${totalPages} 页` : `Page ${page} of ${totalPages}`}</span>
          ) : null}
        </div>
      )}
    </header>
  );
}
