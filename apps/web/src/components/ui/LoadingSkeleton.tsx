interface LoadingSkeletonProps {
  className?: string;
  variant?: 'text' | 'circular' | 'rectangular';
}

const variantClasses = {
  text: 'rounded h-4',
  circular: 'rounded-full',
  rectangular: 'rounded-lg',
};

export function LoadingSkeleton({
  className = '',
  variant = 'text',
}: LoadingSkeletonProps) {
  return (
    <div
      className={`
        bg-bg-muted animate-pulse
        ${variantClasses[variant]}
        ${className}
      `}
      role="status"
      aria-label="Loading"
    >
      <span className="sr-only">Loading...</span>
    </div>
  );
}

/* ── Pre-built Skeleton Patterns ── */

export function CardSkeleton() {
  return (
    <div className="bg-surface rounded-lg border border-border-subtle p-4 space-y-3">
      <LoadingSkeleton className="w-12 h-12 rounded-xl" variant="rectangular" />
      <LoadingSkeleton className="w-2/3 h-4" />
      <LoadingSkeleton className="w-1/3 h-3" />
    </div>
  );
}

export function ListSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 p-3 rounded-lg border border-border-subtle">
          <LoadingSkeleton className="w-9 h-9 shrink-0" variant="circular" />
          <div className="flex-1 space-y-2">
            <LoadingSkeleton className="w-3/5 h-3.5" />
            <LoadingSkeleton className="w-1/4 h-3" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="w-full overflow-hidden rounded-lg border border-border-subtle">
      {/* Header */}
      <div className="bg-bg-subtle px-4 py-3 grid gap-4" style={{ gridTemplateColumns: '1fr 120px 100px' }}>
        <LoadingSkeleton className="h-3 w-20" />
        <LoadingSkeleton className="h-3 w-14" />
        <LoadingSkeleton className="h-3 w-12" />
      </div>
      {/* Rows */}
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          className="px-4 py-3 grid gap-4 items-center border-t border-border-subtle"
          style={{ gridTemplateColumns: '1fr 120px 100px' }}
        >
          <LoadingSkeleton className="h-4 w-3/5" />
          <LoadingSkeleton className="h-6 w-16 rounded-full" />
          <LoadingSkeleton className="h-3 w-10" />
        </div>
      ))}
    </div>
  );
}
