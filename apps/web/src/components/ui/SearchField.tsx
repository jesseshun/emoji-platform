'use client';

import { forwardRef } from 'react';

interface SearchFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  onClear?: () => void;
  showShortcut?: boolean;
  shortcutLabel?: string;
}

export const SearchField = forwardRef<HTMLInputElement, SearchFieldProps>(
  ({ className = '', onClear, showShortcut, shortcutLabel = '⌘ K', value, ...props }, ref) => (
    <div className="relative w-full">
      {/* Search icon */}
      <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
          <path
            d="M7 12A5 5 0 107 2a5 5 0 000 10zM13 13l-3-3"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>

      <input
        ref={ref}
        type="text"
        value={value}
        className={`
          w-full h-10 pl-10 pr-${onClear ? (showShortcut ? '24' : '16') : (showShortcut ? '20' : '10')}
          text-sm bg-surface rounded-xl border border-border-subtle
          placeholder:text-text-muted text-text-primary
          focus:outline-none focus:border-border focus:ring-[3px] focus:ring-accent-subtle
          transition-all duration-fast
          ${className}
        `}
        {...props}
      />

      {value && onClear && (
        <button
          type="button"
          onClick={onClear}
          className="absolute right-3 top-1/2 -translate-y-1/2 w-6 h-6 flex items-center justify-center
                     rounded-full text-text-muted hover:text-text-primary hover:bg-bg-subtle
                     transition-colors duration-fast"
          aria-label="Clear search"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M3.5 3.5l7 7M10.5 3.5l-7 7" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
          </svg>
        </button>
      )}

      {showShortcut && !value && (
        <kbd className="
          absolute right-3 top-1/2 -translate-y-1/2 hidden sm:inline-flex items-center px-1.5 py-0.5
          text-[11px] font-medium text-text-muted bg-bg-subtle border border-border-subtle rounded leading-none
        ">
          {shortcutLabel}
        </kbd>
      )}
    </div>
  )
);

SearchField.displayName = 'SearchField';
