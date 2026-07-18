'use client';

import { useState, useCallback } from 'react';
import { useCopyAction } from '@/lib/useCopyAction';
import type { Locale } from '@/lib/types';

interface CopyValueButtonProps {
  value: string;
  label?: string;
  locale: Locale;
  emojiId?: string;
}

export function CopyValueButton({ value, label, locale, emojiId }: CopyValueButtonProps) {
  const [copied, setCopied] = useState(false);
  const copy = useCopyAction({ locale, emojiId });

  const handleCopy = useCallback(async () => {
    const msg = locale === 'zh' ? '已复制' : 'Copied';
    const ok = await copy({ value, successMessage: label ? `${msg}: ${label}` : msg });
    if (!ok) return;

    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }, [copy, label, locale, value]);

  const actionLabel = locale === 'zh' ? '复制' : 'Copy';

  return (
    <button
      type="button"
      onClick={handleCopy}
      aria-label={`${actionLabel} ${label || value}`}
      title={`${actionLabel} ${label || value}`}
      className={`inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-[8px] border text-sm transition-all duration-fast active:translate-y-px ${
        copied
          ? 'border-transparent bg-success-subtle text-success'
          : 'border-border bg-surface text-text-muted hover:border-border-strong hover:text-text-primary'
      }`}
    >
      <span aria-hidden="true">{copied ? '✓' : '⧉'}</span>
    </button>
  );
}
