import Link from 'next/link';
import { EmptyState } from '@/components/EmptyState';
import type { Locale } from '@/lib/types';

export function BrowseNotFound({ locale, kind }: { locale: Locale; kind: 'category' | 'topic' | 'article' }) {
  const isZh = locale === 'zh';
  const isCategory = kind === 'category';
  const isArticle = kind === 'article';
  const labels = isCategory
    ? {
        icon: '📁',
        title: isZh ? '未找到这个分类' : 'Category not found',
        action: isZh ? '浏览全部分类' : 'Browse categories',
        path: 'categories',
      }
    : isArticle
      ? {
          icon: '📄',
          title: isZh ? '未找到这篇文章' : 'Article not found',
          action: isZh ? '浏览全部文章' : 'Browse articles',
          path: 'articles',
        }
      : {
          icon: '#',
          title: isZh ? '未找到这个专题' : 'Topic not found',
          action: isZh ? '浏览全部专题' : 'Browse topics',
          path: 'topics',
        };

  return (
    <div className="mx-auto max-w-content px-4 py-12 sm:px-6">
      <EmptyState
        icon={labels.icon}
        title={labels.title}
        description={isZh ? '它可能已下线，或当前链接不正确。' : 'It may no longer be published, or the link may be incorrect.'}
        action={(
          <Link
            href={`/${locale}/${labels.path}`}
            className="inline-flex min-h-11 items-center rounded-[8px] bg-text-primary px-4 text-sm font-medium text-text-inverse"
          >
            {labels.action}
          </Link>
        )}
      />
    </div>
  );
}
