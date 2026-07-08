'use client';

import { useState, useCallback } from 'react';
import { showToast } from './Toast';
import type { Locale } from '@/lib/types';

interface CopyValueButtonProps {
  value: string;
  label?: string;
  locale: Locale;
}

export function CopyValueButton({ value, label, locale }: CopyValueButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      const msg = locale === 'zh' ? '已复制' : 'Copied';
      showToast(label ? `${msg}: ${label}` : msg);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      showToast(locale === 'zh' ? '复制失败，请重试' : 'Copy failed, please try again');
    }
  }, [value, label, locale]);

  return (
    <button
      type="button"
      onClick={handleCopy}
      className={`inline-flex items-center gap-1 px-2.5 py-1 text-xs rounded-md border transition ${
        copied
          ? 'bg-green-50 border-green-300 text-green-700'
          : 'bg-white border-gray-200 text-gray-500 hover:border-gray-400 hover:text-gray-700'
      }`}
    >
      {copied ? '✓' : '📋'}
      <span className="font-mono truncate max-w-[200px]">{value}</span>
    </button>
  );
}
