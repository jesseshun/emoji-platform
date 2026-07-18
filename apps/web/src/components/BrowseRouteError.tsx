'use client';

import { ErrorState } from '@/components/ErrorState';
import type { Locale } from '@/lib/types';

export function BrowseRouteError({ locale, reset }: { locale: Locale; reset: () => void }) {
  return (
    <div className="mx-auto max-w-content px-4 py-12 sm:px-6">
      <ErrorState
        locale={locale}
        message={locale === 'zh' ? '页面暂时无法加载，请重试。' : 'This page could not be loaded. Please try again.'}
        onRetry={reset}
      />
    </div>
  );
}
