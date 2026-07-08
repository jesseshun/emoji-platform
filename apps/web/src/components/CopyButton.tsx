'use client';

import { useState, useCallback } from 'react';
import { showToast } from './Toast';
import { recordCopyEvent } from '@/lib/api';
import type { Locale } from '@/lib/types';

interface CopyButtonProps {
  emojiChar: string;
  emojiId: string;
  locale: Locale;
}

export function CopyButton({ emojiChar, emojiId, locale }: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(emojiChar);
      setCopied(true);
      showToast(`Copied! ${emojiChar}`);

      // Fire-and-forget copy event
      recordCopyEvent(emojiId, locale, typeof window !== 'undefined' ? window.location.pathname : undefined).catch(() => {
        // Silently ignore copy event recording failures
      });

      setTimeout(() => setCopied(false), 1500);
    } catch {
      showToast('Copy failed, please try again');
    }
  }, [emojiChar, emojiId, locale]);

  return (
    <button
      type="button"
      onClick={handleCopy}
      className={`text-xs px-2.5 py-1 rounded-md border transition ${
        copied
          ? 'bg-green-50 border-green-300 text-green-700'
          : 'bg-white border-gray-200 text-gray-500 hover:border-gray-400 hover:text-gray-700'
      }`}
    >
      {copied ? '✓ Copied' : '📋 Copy'}
    </button>
  );
}
