'use client';

import { useEffect, useRef, useCallback, type ReactNode } from 'react';

interface DrawerProps {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
  side?: 'left' | 'right';
  title?: string;
}

export function Drawer({ open, onClose, children, side = 'right', title }: DrawerProps) {
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleEsc);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  const slideClass =
    side === 'right'
      ? 'animate-slide-right-in'
      : 'animate-slide-left-in';

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-modal" role="dialog" aria-modal="true">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/20 backdrop-blur-[2px] animate-fade-in"
        onClick={onClose}
        aria-hidden="true"
      />
      {/* Panel */}
      <div
        ref={contentRef}
        tabIndex={-1}
        className={`
          absolute top-0 bottom-0 w-full max-w-sm
          ${side === 'right' ? 'right-0' : 'left-0'}
          bg-surface-elevated shadow-lg border-l border-border-subtle flex flex-col ${slideClass}
        `}
      >
        {title && (
          <div className="flex items-center justify-between px-5 py-4 border-b border-border-subtle shrink-0">
            <h2 className="text-base font-semibold text-text-primary">{title}</h2>
            <button
              onClick={onClose}
              className="p-1.5 -mr-1.5 rounded-lg text-text-muted hover:text-text-primary hover:bg-bg-subtle transition-colors duration-fast"
              aria-label="Close drawer"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M3 3l10 10M13 3L3 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </button>
          </div>
        )}
        {!title && (
          <div className="flex justify-end p-3 border-b border-border-subtle shrink-0">
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-text-muted hover:text-text-primary hover:bg-bg-subtle transition-colors duration-fast"
              aria-label="Close drawer"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M3 3l10 10M13 3L3 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </button>
          </div>
        )}
        <div className="flex-1 overflow-y-auto">{children}</div>
      </div>
    </div>
  );
}
