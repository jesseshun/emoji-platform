import { type ButtonHTMLAttributes, forwardRef } from 'react';

interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  label: string; // Required for a11y
}

const sizeMap = {
  sm: 'w-7 h-7 [&>svg]:w-3.5 [&>svg]:h-3.5',
  md: 'w-9 h-9 [&>svg]:w-[18px] [&>svg]:h-[18px]',
  lg: 'w-11 h-11 [&>svg]:w-5 [&>svg]:h-5',
};

const variantMap = {
  default: 'text-text-secondary hover:text-text-primary hover:bg-bg-subtle border border-transparent hover:border-border-subtle',
  ghost: 'text-text-secondary hover:text-text-primary hover:bg-bg-subtle',
  danger: 'text-danger hover:bg-danger-subtle',
};

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ label, variant = 'ghost', size = 'md', className = '', children, ...props }, ref) => (
    <button
      ref={ref}
      type="button"
      aria-label={label}
      className={`
        inline-flex items-center justify-center rounded-lg
        transition-colors duration-fast select-none
        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-border-focus)]
        disabled:opacity-50 disabled:pointer-events-none
        ${sizeMap[size]} ${variantMap[variant]} ${className}
      `}
      {...props}
    >
      {children}
    </button>
  )
);

IconButton.displayName = 'IconButton';
