import { type ButtonHTMLAttributes, forwardRef } from 'react';

type Size = 'sm' | 'md' | 'lg';
type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';

interface BaseButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  size?: Size;
  variant?: Variant;
  loading?: boolean;
  iconOnly?: boolean;
}

const sizeClasses: Record<Size, string> = {
  sm: 'px-3 py-1.5 text-xs gap-1.5',
  md: 'px-4 py-2 text-sm gap-2',
  lg: 'px-5 py-2.5 text-base gap-2.5',
};

const variantClasses: Record<Variant, string> = {
  primary:
    'bg-accent text-white hover:bg-accent-hover active:bg-[#0056b3] shadow-xs focus-visible:ring-2 focus-visible:ring-accent/40 disabled:opacity-50',
  secondary:
    'bg-surface text-text-primary border border-border hover:border-border-strong hover:bg-bg-subtle active:bg-bg-muted focus-visible:ring-2 focus-visible:ring-[var(--color-border-focus)] disabled:opacity-50',
  ghost:
    'text-text-secondary hover:text-text-primary hover:bg-bg-subtle active:bg-bg-muted focus-visible:ring-2 focus-visible:ring-[var(--color-border-focus)]',
  danger:
    'bg-danger text-white hover:bg-red-600 active:bg-[#d93229] shadow-xs focus-visible:ring-2 focus-visible:ring-danger/40 disabled:opacity-50',
};

export const PrimaryButton = forwardRef<HTMLButtonElement, BaseButtonProps>(
  ({ children, className = '', size = 'md', loading, iconOnly, ...props }, ref) => (
    <button
      ref={ref}
      className={`
        inline-flex items-center justify-center font-medium rounded-lg
        transition-all duration-fast select-none
        ${iconOnly ? '' : variantClasses.primary}
        ${iconOnly ? sizeClasses[size].replace(/px-\S+ /, '').replace(/py-\S+/, '') : sizeClasses[size]}
        ${className}
      `.trim()}
      disabled={loading || props.disabled}
      {...props}
    >
      {loading && <Spinner />}
      {children}
    </button>
  )
);

PrimaryButton.displayName = 'PrimaryButton';

export const SecondaryButton = forwardRef<HTMLButtonElement, BaseButtonProps>(
  ({ children, className = '', size = 'md', loading, ...props }, ref) => (
    <button
      ref={ref}
      className={`
        inline-flex items-center justify-center font-medium rounded-lg
        transition-all duration-fast select-none
        ${variantClasses.secondary} ${sizeClasses[size]}
        ${className}
      `.trim()}
      disabled={loading || props.disabled}
      {...props}
    >
      {loading && <Spinner />}
      {children}
    </button>
  )
);

SecondaryButton.displayName = 'SecondaryButton';

export const GhostButton = forwardRef<HTMLButtonElement, BaseButtonProps>(
  ({ children, className = '', size = 'md', loading, ...props }, ref) => (
    <button
      ref={ref}
      className={`
        inline-flex items-center justify-center font-medium rounded-lg
        transition-all duration-fast select-none
        ${variantClasses.ghost} ${sizeClasses[size]}
        ${className}
      `.trim()}
      disabled={loading || props.disabled}
      {...props}
    >
      {loading && <Spinner />}
      {children}
    </button>
  )
);

GhostButton.displayName = 'GhostButton';

/* ── Spinner ── */
function Spinner() {
  return (
    <svg
      className="animate-spin h-3.5 w-3.5"
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden="true"
    >
      <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="2" opacity="0.15" />
      <path d="M14 8a6 6 0 00-6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}
