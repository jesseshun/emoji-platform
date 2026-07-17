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

  const prevLabel = locale === 'zh' ? '上一页' : 'Prev';
  const nextLabel = locale === 'zh' ? '下一页' : 'Next';

  return (
    <nav className="flex items-center justify-center gap-1 mt-8" aria-label="Pagination">
      {/* Prev */}
      {page > 1 ? (
        <Link
          href={buildUrl(page - 1)}
          className="
            inline-flex items-center justify-center min-w-[36px] h-9 px-3
            text-sm text-text-secondary hover:text-text-primary
            rounded-lg border border-transparent
            hover:bg-bg-subtle transition-all duration-fast
          "
        >
          {prevLabel}
        </Link>
      ) : (
        <span className="inline-flex items-center justify-center min-w-[36px] h-9 px-3 text-sm text-text-muted rounded-lg cursor-not-allowed">
          {prevLabel}
        </span>
      )}

      {/* Pages */}
      {pages.map((p, i) =>
        p === '...' ? (
          <span key={`dots-${i}`} className="inline-flex items-center justify-center w-9 h-9 text-sm text-text-muted">
            …
          </span>
        ) : (
          <Link
            key={p}
            href={buildUrl(p)}
            className={`
              inline-flex items-center justify-center min-w-[36px] h-9 px-2.5
              text-sm font-medium rounded-lg
              transition-all duration-fast
              ${
                p === page
                  ? 'bg-text-primary text-white shadow-xs'
                  : 'text-text-secondary hover:text-text-primary hover:bg-bg-subtle'
              }
            `}
            aria-current={p === page ? 'page' : undefined}
          >
            {p}
          </Link>
        ),
      )}

      {/* Next */}
      {page < totalPages ? (
        <Link
          href={buildUrl(page + 1)}
          className="
            inline-flex items-center justify-center min-w-[36px] h-9 px-3
            text-sm text-text-secondary hover:text-text-primary
            rounded-lg border border-transparent
            hover:bg-bg-subtle transition-all duration-fast
          "
        >
          {nextLabel}
        </Link>
      ) : (
        <span className="inline-flex items-center justify-center min-w-[36px] h-9 px-3 text-sm text-text-muted rounded-lg cursor-not-allowed">
          {nextLabel}
        </span>
      )}
    </nav>
  );
}
