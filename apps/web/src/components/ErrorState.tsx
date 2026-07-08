'use client';

import Link from 'next/link';

interface ErrorStateProps {
  message?: string;
  onRetryUrl?: string;
}

export function ErrorState({
  message = 'Something went wrong. Please try again later.',
  onRetryUrl,
}: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <div className="text-4xl mb-4">⚠️</div>
      <h2 className="text-lg font-semibold text-gray-900 mb-2">Error</h2>
      <p className="text-sm text-gray-500 text-center max-w-md mb-4">{message}</p>
      {onRetryUrl ? (
        <Link
          href={onRetryUrl}
          className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition"
        >
          Try again
        </Link>
      ) : (
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition"
        >
          Try again
        </button>
      )}
    </div>
  );
}
