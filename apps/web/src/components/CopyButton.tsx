'use client';

import { useState, useCallback } from 'react';
import { useCopyAction } from '@/lib/useCopyAction';
import type { Locale } from '@/lib/types';

interface CopyButtonProps {
  emojiChar: string;
  emojiId: string;
  locale: Locale;
  variant?: 'default' | 'primary';
}

export function CopyButton({ emojiChar, emojiId, locale, variant = 'default' }: CopyButtonProps) {
  const [copied, setCopied] = useState(false);
  const copy = useCopyAction({ locale, emojiId });

  const handleCopy = useCallback(async (event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    const ok = await copy({
      value: emojiChar,
      successMessage: locale === 'zh' ? `已复制 ${emojiChar}` : `Copied ${emojiChar}`,
    });
    if (!ok) return;

    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }, [copy, emojiChar, locale]);

  const primary = variant === 'primary';
  const label = copied
    ? (locale === 'zh' ? '已复制' : 'Copied')
    : (locale === 'zh' ? '复制 Emoji' : 'Copy emoji');

  return (
    <button
      type="button"
      onClick={handleCopy}
      aria-label={`${label}: ${emojiChar}`}
      title={label}
      className={`inline-flex min-w-[44px] items-center justify-center gap-1.5 rounded-[8px] border font-medium transition-all duration-fast active:translate-y-px ${primary ? 'min-h-11 px-4 text-sm' : 'min-h-9 px-2.5 text-xs'} ${
        copied
          ? 'bg-success-subtle border-transparent text-success'
          : primary
            ? 'border-text-primary bg-text-primary text-text-inverse shadow-xs hover:opacity-90'
            : 'border-border bg-surface text-text-secondary hover:border-border-strong hover:text-text-primary'
      }`}
    >
      <span aria-hidden="true">{copied ? '✓' : '⧉'}</span>
      <span>{primary ? label : copied ? (locale === 'zh' ? '已复制' : 'Copied') : (locale === 'zh' ? '复制' : 'Copy')}</span>
    </button>
  );
}
