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
  const pathname = usePathname();
  const resolved: Locale = locale ?? (pathname?.startsWith('/zh') ? 'zh' : 'en');

  const title = resolved === 'zh' ? '出错了' : 'Error';
  const defaultMessage =
    resolved === 'zh'
      ? '发生了一点问题，请稍后重试。'
      : 'Something went wrong. Please try again later.';
  const retryLabel = resolved === 'zh' ? '重试' : 'Try again';

  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <span className="text-4xl mb-5" role="img" aria-hidden="true">⚠️</span>
      <h2 className="text-lg font-semibold text-text-primary mb-2">{title}</h2>
      <p className="text-sm text-text-secondary max-w-md mb-5 leading-relaxed">
        {message || defaultMessage}
      </p>
      {onRetryUrl ? (
        <Link
          href={onRetryUrl}
          className="
            inline-flex items-center px-4 py-2 text-sm font-medium rounded-lg
            bg-accent text-white hover:bg-accent-hover transition-colors duration-fast
            shadow-xs focus-visible:ring-2 focus-visible:ring-accent/40
          "
        >
          {retryLabel}
        </Link>
      ) : (
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="
            inline-flex items-center px-4 py-2 text-sm font-medium rounded-lg
            bg-accent text-white hover:bg-accent-hover transition-colors duration-fast
            shadow-xs focus-visible:ring-2 focus-visible:ring-accent/40
          "
        >
          {retryLabel}
        </button>
      )}
    </div>
  );
}
