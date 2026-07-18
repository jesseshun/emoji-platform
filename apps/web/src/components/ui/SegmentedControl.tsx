'use client';

import { useState } from 'react';

interface SegmentedControlOption {
  value: string;
  label: string;
}

interface SegmentedControlProps {
  options: SegmentedControlOption[];
  value: string;
  onChange: (value: string) => void;
  className?: string;
  size?: 'sm' | 'md';
}

export function SegmentedControl({
  options,
  value,
  onChange,
  className = '',
  size = 'md',
}: SegmentedControlProps) {
  const [activeEl, setActiveEl] = useState<HTMLElement | null>(null);

  return (
    <div
      role="radiogroup"
      className={`
        inline-flex items-center bg-bg-subtle rounded-xl p-1 border border-border-subtle
        ${size === 'sm' ? 'gap-0.5' : 'gap-1'}
        ${className}
      `}
    >
      {options.map((opt) => {
        const isActive = opt.value === value;
        return (
          <button
            key={opt.value}
            role="radio"
            aria-checked={isActive}
            type="button"
            ref={isActive ? (el) => setActiveEl(el) : undefined}
            onClick={() => onChange(opt.value)}
            className={`
              relative z-10 font-medium rounded-[10px] transition-all duration-fast
              ${size === 'sm' ? 'px-2.5 py-1 text-xs' : 'px-4 py-1.5 text-sm'}
              ${isActive
                ? 'text-text-primary shadow-sm'
                : 'text-text-secondary hover:text-text-primary'
              }
            `}
            style={isActive ? { backgroundColor: 'var(--color-surface)' } : undefined}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
