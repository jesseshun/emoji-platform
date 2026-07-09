'use client';

import { useState, useCallback } from 'react';
import { showToast } from './Toast';
import { recordCopyEvent } from '@/lib/api';
import { copyText } from '@/lib/clipboard';
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

  const handleCopy = useCallback(
    async (item: CopyItem, index: number) => {
      const ok = await copyText(item.value);
      if (!ok) {
        showToast(locale === 'zh' ? '复制失败，请重试' : 'Copy failed, please try again');
        return;
      }

      const msg = locale === 'zh' ? '已复制' : 'Copied';
      showToast(`${msg}: ${item.label}`);

      if (emojiId) {
        recordCopyEvent(emojiId, locale, typeof window !== 'undefined' ? window.location.pathname : undefined).catch(
          () => {
            // intentionally ignored
          },
        );
      }

      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex((cur) => (cur === index ? null : cur)), 1500);
    },
    [locale, emojiId],
  );

  return (
    <section className="mt-6 bg-white rounded-xl border border-gray-200 p-5">
      <h2 className="text-sm font-semibold text-gray-700 mb-3">
        {locale === 'zh' ? '复制' : 'Copy'}
      </h2>
      <div className="flex flex-wrap gap-2">
        {items.map((item, index) => (
          <button
            key={index}
            type="button"
            onClick={() => handleCopy(item, index)}
            className={`inline-flex items-center gap-1 min-h-[36px] text-xs px-3 py-1.5 rounded-md border transition ${
              copiedIndex === index
                ? 'bg-green-50 border-green-300 text-green-700'
                : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
            }`}
          >
            {copiedIndex === index ? '✓' : '📋'}{' '}
            {item.label.length > 18 ? `${item.label.slice(0, 18)}…` : item.label}
          </button>
        ))}
      </div>
    </section>
  );
}
