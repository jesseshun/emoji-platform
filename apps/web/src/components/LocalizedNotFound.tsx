import Link from 'next/link';
import { headers } from 'next/headers';
import { BrowseNotFound } from './BrowseNotFound';
import { EmojiNotFound } from './EmojiNotFound';
import { EmptyState } from './EmptyState';
import type { Locale } from '@/lib/types';

export function LocalizedNotFound({ locale }: { locale: Locale }) {
  const path = headers().get('x-locale-path') ?? '';
  const section = path.split('/').filter(Boolean)[1];

  if (section === 'emoji') {
    return <EmojiNotFound locale={locale} />;
  }
  if (section === 'categories') {
    return <BrowseNotFound locale={locale} kind="category" />;
  }
  if (section === 'topics') {
    return <BrowseNotFound locale={locale} kind="topic" />;
  }
  if (section === 'articles') {
    return <BrowseNotFound locale={locale} kind="article" />;
  }

  const isZh = locale === 'zh';
  return (
    <div className="mx-auto max-w-content px-4 py-12 sm:px-6">
      <EmptyState
        icon="404"
        title={isZh ? '页面未找到' : 'Page not found'}
        description={isZh ? '当前链接不存在或已失效。' : 'This link does not exist or is no longer available.'}
        action={(
          <Link
            href={`/${locale}`}
            className="inline-flex min-h-11 items-center rounded-[8px] bg-text-primary px-4 text-sm font-medium text-text-inverse"
          >
            {isZh ? '返回首页' : 'Back to home'}
          </Link>
        )}
      />
    </div>
  );
}
