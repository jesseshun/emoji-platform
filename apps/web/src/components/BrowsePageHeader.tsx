import type { Locale } from '@/lib/types';

interface BrowsePageHeaderProps {
  locale: Locale;
  kind: 'categories' | 'topics';
  total?: number;
  secondaryCount?: number;
  page?: number;
  totalPages?: number;
}

export function BrowsePageHeader({
  locale,
  kind,
  total,
  secondaryCount,
  page,
  totalPages,
}: BrowsePageHeaderProps) {
  const isZh = locale === 'zh';
  const isCategories = kind === 'categories';
  const title = isCategories
    ? (isZh ? '按分类浏览 Emoji' : 'Browse emoji categories')
    : (isZh ? 'Emoji 专题' : 'Emoji topics');
  const description = isCategories
    ? (isZh
        ? '从主分类进入子分类，沿真实内容层级查找已发布的 Emoji。'
        : 'Move from parent categories into subcategories and explore published emojis through the real content hierarchy.')
    : (isZh
        ? '浏览已发布的 Emoji 合集、指南与专题内容。'
        : 'Browse published emoji collections, guides, and editorial topics.');
  const eyebrow = isCategories
    ? (isZh ? '分类索引' : 'CATEGORY INDEX')
    : (isZh ? '专题索引' : 'TOPIC INDEX');

  return (
    <header className="mb-8 border-b border-border-subtle pb-8 sm:mb-10">
      <p className="mb-3 text-xs font-semibold text-text-muted">{eyebrow}</p>
      <h1 className="text-3xl font-semibold text-text-primary sm:text-4xl">{title}</h1>
      <p className="mt-3 max-w-2xl text-sm leading-relaxed text-text-secondary sm:text-base">
        {description}
      </p>
      {typeof total === 'number' && (
        <div
          className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs tabular-nums text-text-muted"
          aria-label={isZh ? '列表状态' : 'List status'}
        >
          <span>
            {isCategories
              ? (isZh ? `共 ${total.toLocaleString('zh-CN')} 个分类` : `${total.toLocaleString('en-US')} categories`)
              : (isZh ? `共 ${total.toLocaleString('zh-CN')} 个专题` : `${total.toLocaleString('en-US')} topics`)}
          </span>
          {isCategories && typeof secondaryCount === 'number' && secondaryCount > 0 && (
            <span>
              {isZh
                ? `其中 ${secondaryCount.toLocaleString('zh-CN')} 个子分类`
                : `${secondaryCount.toLocaleString('en-US')} subcategories`}
            </span>
          )}
          {page && totalPages && totalPages > 1 && (
            <span>{isZh ? `第 ${page} / ${totalPages} 页` : `Page ${page} of ${totalPages}`}</span>
          )}
        </div>
      )}
    </header>
  );
}
