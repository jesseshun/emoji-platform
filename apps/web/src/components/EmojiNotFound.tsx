import Link from 'next/link';
import { EmptyState } from '@/components/EmptyState';
import type { Locale } from '@/lib/types';

export function EmojiNotFound({ locale }: { locale: Locale }) {
  return (
    <div className="mx-auto max-w-content px-4 py-12 sm:px-6">
      <EmptyState
        icon="⌕"
        title={locale === 'zh' ? '未找到这个 Emoji' : 'Emoji not found'}
        description={locale === 'zh' ? '它可能已下线，或当前链接不正确。' : 'It may no longer be published, or the link may be incorrect.'}
        action={(
          <Link href={`/${locale}/emojis`} className="inline-flex min-h-11 items-center rounded-[8px] bg-text-primary px-4 text-sm font-medium text-text-inverse">
            {locale === 'zh' ? '浏览全部 Emoji' : 'Browse all emojis'}
          </Link>
        )}
      />
    </div>
  );
}
