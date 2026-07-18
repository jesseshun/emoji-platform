'use client';

import { useState, useCallback } from 'react';
import { useCopyAction } from '@/lib/useCopyAction';
import type { Locale } from '@/lib/types';

interface CopyItem {
  label: string;
  value: string;
  mono?: boolean;
}

interface CopyAreaProps {
  items: CopyItem[];
  locale: Locale;
  emojiId?: string;
}

export function CopyArea({ items, locale, emojiId }: CopyAreaProps) {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const copy = useCopyAction({ locale, emojiId });

  const handleCopy = useCallback(
    async (item: CopyItem, index: number) => {
      const msg = locale === 'zh' ? '已复制' : 'Copied';
      const ok = await copy({ value: item.value, successMessage: `${msg}: ${item.label}` });
      if (!ok) return;

      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex((cur) => (cur === index ? null : cur)), 1500);
    },
    [copy, locale],
  );

  if (!items.length) return null;

  return (
    <section className="rounded-[8px] border border-border-subtle bg-surface p-4 shadow-xs" aria-labelledby="copy-values-title">
      <h2 id="copy-values-title" className="mb-3 text-sm font-semibold text-text-primary">
        {locale === 'zh' ? '复制字段' : 'Copy values'}
      </h2>
      <div className="grid gap-2">
        {items.map((item, index) => (
          <button
            key={`${item.label}-${item.value}`}
            type="button"
            onClick={() => handleCopy(item, index)}
            aria-label={`${locale === 'zh' ? '复制' : 'Copy'} ${item.label}: ${item.value}`}
            className={`group flex min-h-12 min-w-0 items-center justify-between gap-3 rounded-[8px] border px-3 text-left transition-all duration-fast ${
              copiedIndex === index
                ? 'border-success bg-success-subtle text-success'
                : 'border-border-subtle bg-bg-subtle text-text-secondary hover:border-border-strong hover:bg-bg-muted'
            }`}
          >
            <span className="min-w-0">
              <span className="block text-[11px] font-medium text-text-muted">{item.label}</span>
              <span className={`block truncate text-sm text-text-primary ${item.mono ? 'font-mono' : ''}`}>{item.value}</span>
            </span>
            <span className="shrink-0 text-base" aria-hidden="true">{copiedIndex === index ? '✓' : '⧉'}</span>
          </button>
        ))}
      </div>
    </section>
  );
}
