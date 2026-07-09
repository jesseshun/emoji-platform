'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { Locale } from '@/lib/types';

interface ErrorStateProps {
  message?: string;
  onRetryUrl?: string;
  locale?: Locale;
}

export function ErrorState({ message, onRetryUrl, locale }: ErrorStateProps) {
  // Derive the locale from the current path when not explicitly provided, so
  // every call site gets a localized message without extra wiring.
  const pathname = usePathname();
  const resolved: Locale = locale ?? (pathname?.startsWith('/zh') ? 'zh' : 'en');

  const title = resolved === 'zh' ? '出错了' : 'Error';
  const defaultMessage =
    resolved === 'zh' ? '发生了一点问题，请稍后重试。' : 'Something went wrong. Please try again later.';
  const retryLabel = resolved === 'zh' ? '重试' : 'Try again';

  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="text-4xl mb-4">⚠️</div>
      <h2 className="text-lg font-semibold text-gray-900 mb-2">{title}</h2>
      <p className="text-sm text-gray-500 max-w-md mb-4">{message || defaultMessage}</p>
      {onRetryUrl ? (
        <Link
          href={onRetryUrl}
          className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition"
        >
          {retryLabel}
        </Link>
      ) : (
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition"
        >
          {retryLabel}
        </button>
      )}
    </div>
  );
}
