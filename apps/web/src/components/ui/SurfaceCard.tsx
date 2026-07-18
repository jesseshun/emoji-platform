import { type ReactNode } from 'react';

interface SurfaceCardProps {
  children: ReactNode;
  className?: string;
  hoverable?: boolean;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  onClick?: () => void;
  as?: 'div' | 'article' | 'li';
}

const paddingMap = {
  none: '',
  sm: 'p-3 sm:p-4',
  md: 'p-4 sm:p-5',
  lg: 'p-5 sm:p-6',
};

export function SurfaceCard({
  children,
  className = '',
  hoverable = false,
  padding = 'md',
  onClick,
  as: Tag = 'div',
}: SurfaceCardProps) {
  const baseClasses = `
    bg-surface rounded-lg border border-border-subtle
    ${paddingMap[padding]}
    transition-all duration-fast
    ${hoverable ? 'hover:border-border hover:shadow-sm cursor-pointer' : ''}
    ${onClick ? 'focus-visible:ring-2 focus-visible:ring-[var(--color-border-focus)] focus-visible:outline-none' : ''}
    ${className}
  `.trim();

  return (
    <Tag
      {...(onClick ? { role: 'button' as const, tabIndex: 0, onClick } : {})}
      className={baseClasses}
    >
      {children}
    </Tag>
  );
}
