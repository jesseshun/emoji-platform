'use client';

import { useState, useCallback } from 'react';
import { showToast } from './Toast';
import { recordCopyEvent } from '@/lib/api';
import { copyText } from '@/lib/clipboard';
import type { Locale } from '@/lib/types';

interface CopyButtonProps {
  emojiChar: string;
  emojiId: string;
  locale: Locale;
}

export function CopyButton({ emojiChar, emojiId, locale }: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    const ok = await copyText(emojiChar);
    if (!ok) {
      showToast(locale === 'zh' ? '复制失败，请重试' : 'Copy failed, please try again');
      return;
    }

    setCopied(true);
    showToast(locale === 'zh' ? `已复制 ${emojiChar}` : `Copied! ${emojiChar}`);

    // Fire-and-forget copy event. A recording failure must never block the
    // copy UX, so we swallow errors silently.
    recordCopyEvent(emojiId, locale, typeof window !== 'undefined' ? window.location.pathname : undefined).catch(
      () => {
        // intentionally ignored
      },
    );

    setTimeout(() => setCopied(false), 1500);
  }, [emojiChar, emojiId, locale]);

  return (
    <button
      type="button"
      onClick={handleCopy}
      aria-label={locale === 'zh' ? '复制 Emoji' : 'Copy emoji'}
      className={`inline-flex items-center justify-center min-h-[36px] min-w-[44px] text-xs px-2.5 py-1 rounded-md border transition ${
        copied
          ? 'bg-green-50 border-green-300 text-green-700'
          : 'bg-white border-gray-200 text-gray-500 hover:border-gray-400 hover:text-gray-700'
      }`}
    >
      {copied ? `✓ ${locale === 'zh' ? '已复制' : 'Copied'}` : `📋 ${locale === 'zh' ? '复制' : 'Copy'}`}
    </button>
  );
}
