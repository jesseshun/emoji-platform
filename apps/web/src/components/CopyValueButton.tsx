'use client';

import { useState, useCallback } from 'react';
import { showToast } from './Toast';
import { recordCopyEvent } from '@/lib/api';
import { copyText } from '@/lib/clipboard';
import type { Locale } from '@/lib/types';

interface CopyValueButtonProps {
  value: string;
  label?: string;
  locale: Locale;
  emojiId?: string;
}

export function CopyValueButton({ value, label, locale, emojiId }: CopyValueButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    const ok = await copyText(value);
    if (!ok) {
      showToast(locale === 'zh' ? '复制失败，请重试' : 'Copy failed, please try again');
      return;
    }

    setCopied(true);
    const msg = locale === 'zh' ? '已复制' : 'Copied';
    showToast(label ? `${msg}: ${label}` : msg);

    if (emojiId) {
      recordCopyEvent(emojiId, locale, typeof window !== 'undefined' ? window.location.pathname : undefined).catch(
        () => {
          // intentionally ignored
        },
      );
    }

    setTimeout(() => setCopied(false), 1500);
  }, [value, label, locale, emojiId]);

  return (
    <button
      type="button"
      onClick={handleCopy}
      aria-label={label ? `Copy ${label}` : 'Copy'}
      className={`inline-flex items-center gap-1 min-h-[36px] px-2.5 py-1 text-xs rounded-md border transition ${
        copied
          ? 'bg-green-50 border-green-300 text-green-700'
          : 'bg-white border-gray-200 text-gray-500 hover:border-gray-400 hover:text-gray-700'
      }`}
    >
      {copied ? '✓' : '📋'}
      <span className="font-mono truncate max-w-[140px] sm:max-w-[200px]">{value}</span>
    </button>
  );
}
