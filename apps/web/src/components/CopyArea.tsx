'use client';

import { showToast } from './Toast';
import type { Locale } from '@/lib/types';

interface CopyItem {
  label: string;
  value: string;
  mono?: boolean;
}

interface CopyAreaProps {
  items: CopyItem[];
  locale: Locale;
}

export function CopyArea({ items, locale }: CopyAreaProps) {
  const handleCopy = async (item: CopyItem) => {
    try {
      await navigator.clipboard.writeText(item.value);
      const msg = locale === 'zh' ? '已复制' : 'Copied';
      showToast(`${msg}: ${item.label}`);
    } catch {
      showToast(locale === 'zh' ? '复制失败，请重试' : 'Copy failed, please try again');
    }
  };

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
            onClick={() => handleCopy(item)}
            className={`text-xs px-3 py-1.5 rounded-md border border-gray-200 bg-gray-50 hover:bg-gray-100 transition ${
              item.mono ? 'font-mono' : ''
            }`}
          >
            📋 {item.label.length > 18 ? `${item.label.slice(0, 18)}…` : item.label}
          </button>
        ))}
      </div>
    </section>
  );
}
