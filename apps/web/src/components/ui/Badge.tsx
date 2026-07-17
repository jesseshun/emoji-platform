import { type HTMLAttributes, forwardRef } from 'react';

type BadgeVariant = 'default' | 'success' | 'warning' | 'danger' | 'info' | 'neutral';
type BadgeSize = 'sm' | 'md';

interface BadgeProps extends HTMLAttributes<HTMLElement> {
  variant?: BadgeVariant;
  size?: BadgeSize;
  dot?: boolean;
}

const variantMap: Record<BadgeVariant, string> = {
  default: 'bg-accent-subtle text-accent',
  success: 'bg-success-subtle text-success',
  warning: 'bg-warning-subtle text-warning',
  danger: 'bg-danger-subtle text-danger',
  info: 'bg-blue-50 text-blue-600',
  neutral: 'bg-bg-muted text-text-secondary',
};

const sizeMap: Record<BadgeSize, string> = {
  sm: 'text-[11px] px-1.5 py-px',
  md: 'text-xs px-2 py-0.5',
};

export const Badge = forwardRef<HTMLElement, BadgeProps>(
  ({ variant = 'default', size = 'sm', dot, className = '', children, ...props }, ref) => (
    <span
      ref={ref as React.Ref<HTMLSpanElement>}
      className={`inline-flex items-center font-medium rounded-full whitespace-nowrap ${variantMap[variant]} ${sizeMap[size]} ${className}`}
      {...(props as React.HTMLAttributes<HTMLSpanElement>)}
    >
      {dot && (
        <span
          className={`mr-1 w-1.5 h-1.5 rounded-full currentColor`}
          style={{ opacity: 0.8 }}
        />
      )}
      {children}
    </span>
  )
);

Badge.displayName = 'Badge';

export function StatusBadge({
  status,
  label,
}: {
  status: 'online' | 'offline' | 'busy' | 'away';
  label: string;
}) {
  const colorMap = {
    online: 'bg-emerald-500',
    offline: 'bg-gray-400',
    busy: 'bg-red-500',
    away: 'bg-yellow-500',
  };

  return (
    <span className="inline-flex items-center gap-1.5 text-xs text-text-secondary">
      <span className={`relative flex h-2 w-2`}>
        <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-30 ${colorMap[status]}`} />
        <span className={`relative inline-flex rounded-full h-2 w-2 ${colorMap[status]}`} />
      </span>
      {label}
    </span>
  );
}
