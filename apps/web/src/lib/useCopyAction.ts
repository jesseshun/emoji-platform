'use client';

import { useCallback } from 'react';
import { showToast } from '@/components/ui/Toast';
import { recordCopyEvent } from '@/lib/api';
import { copyText } from '@/lib/clipboard';
import type { Locale } from '@/lib/types';

interface CopyActionOptions {
  locale: Locale;
  emojiId?: string;
}

interface CopyRequest {
  value: string;
  successMessage: string;
}

export function useCopyAction({ locale, emojiId }: CopyActionOptions) {
  return useCallback(async ({ value, successMessage }: CopyRequest) => {
    const copied = await copyText(value);
    if (!copied) {
      showToast(locale === 'zh' ? '复制失败，请重试' : 'Copy failed. Please try again.', 'error');
      return false;
    }

    showToast(successMessage, 'success');
    if (emojiId) {
      void recordCopyEvent(
        emojiId,
        locale,
        typeof window !== 'undefined' ? window.location.pathname : undefined,
      ).catch(() => {
        // Analytics must never block or repeat the copy action.
      });
    }
    return true;
  }, [emojiId, locale]);
}
