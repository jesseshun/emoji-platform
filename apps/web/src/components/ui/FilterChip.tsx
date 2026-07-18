import { type ButtonHTMLAttributes, forwardRef } from 'react';

interface FilterChipProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  selected?: boolean;
  size?: 'sm' | 'md';
}

const sizeClasses = {
  sm: 'text-xs px-2.5 py-1',
  md: 'text-sm px-3.5 py-1.5',
};

export const FilterChip = forwardRef<HTMLButtonElement, FilterChipProps>(
  ({ children, selected, size = 'md', className = '', ...props }, ref) => (
    <button
      ref={ref}
      type="button"
      className={`
        inline-flex items-center font-medium rounded-full border transition-all duration-fast select-none
        ${sizeClasses[size]}
        ${
          selected
            ? 'bg-text-primary text-white border-transparent shadow-xs'
            : 'bg-surface text-text-secondary border-border-subtle hover:border-border hover:text-text-primary'
        }
        disabled:opacity-50 disabled:pointer-events-none
        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-border-focus)]
        ${className}
      `.trim()}
      {...props}
    >
      {children}
    </button>
  )
);

FilterChip.displayName = 'FilterChip';
