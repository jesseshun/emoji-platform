import Link from 'next/link';

interface PaginationProps {
  locale: 'zh' | 'en';
  page: number;
  totalPages: number;
  basePath: string;
}

export function Pagination({ locale, page, totalPages, basePath }: PaginationProps) {
  if (totalPages <= 1) return null;

  const pages: (number | '...')[] = [];
  const range = 1;

  for (let i = 1; i <= totalPages; i++) {
    if (i === 1 || i === totalPages || (i >= page - range && i <= page + range)) {
      pages.push(i);
    } else if (pages[pages.length - 1] !== '...') {
      pages.push('...');
    }
  }

  const buildUrl = (p: number) => {
    const separator = basePath.includes('?') ? '&' : '?';
    return `${basePath}${separator}page=${p}`;
  };

  return (
    <nav className="flex items-center justify-center gap-1 mt-8" aria-label="Pagination">
      {page > 1 && (
        <Link
          href={buildUrl(page - 1)}
          className="px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition"
        >
          {locale === 'zh' ? '上一页' : 'Prev'}
        </Link>
      )}

      {pages.map((p, i) =>
        p === '...' ? (
          <span key={`dots-${i}`} className="px-2 text-gray-400">
            ...
          </span>
        ) : (
          <Link
            key={p}
            href={buildUrl(p)}
            className={`px-3 py-2 text-sm rounded-lg transition ${
              p === page
                ? 'bg-blue-600 text-white font-medium'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
            }`}
          >
            {p}
          </Link>
        ),
      )}

      {page < totalPages && (
        <Link
          href={buildUrl(page + 1)}
          className="px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition"
        >
          {locale === 'zh' ? '下一页' : 'Next'}
        </Link>
      )}
    </nav>
  );
}
