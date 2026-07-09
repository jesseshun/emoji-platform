import type { Locale } from '@/lib/types';
import { CopyValueButton } from './CopyValueButton';

interface EmojiTechInfoProps {
  emojiChar: string;
  unicodeCodepoint: string | null;
  htmlDecimal: string | null;
  htmlHex: string | null;
  shortcode: string | null;
  emojiVersion: string | null;
  unicodeVersion: string | null;
  categoryName: string | null;
  subcategoryName: string | null;
  locale: Locale;
  emojiId?: string;
}

const fieldLabels: Record<string, Record<string, string>> = {
  emojiChar: { zh: 'Emoji 字符', en: 'Emoji Character' },
  unicodeCodepoint: { zh: 'Unicode Code Point', en: 'Unicode Code Point' },
  htmlDecimal: { zh: 'HTML Decimal', en: 'HTML Decimal' },
  htmlHex: { zh: 'HTML Hex', en: 'HTML Hex' },
  shortcode: { zh: 'Shortcode', en: 'Shortcode' },
  emojiVersion: { zh: 'Emoji 版本', en: 'Emoji Version' },
  unicodeVersion: { zh: 'Unicode 版本', en: 'Unicode Version' },
  category: { zh: '分类', en: 'Category' },
  subcategory: { zh: '子分类', en: 'Subcategory' },
};

export function EmojiTechInfo({
  emojiChar,
  unicodeCodepoint,
  htmlDecimal,
  htmlHex,
  shortcode,
  emojiVersion,
  unicodeVersion,
  categoryName,
  subcategoryName,
  locale,
  emojiId,
}: EmojiTechInfoProps) {
  const rows: { key: string; value: string; copyable: boolean }[] = [
    { key: 'emojiChar', value: emojiChar, copyable: true },
    ...(unicodeCodepoint ? [{ key: 'unicodeCodepoint', value: unicodeCodepoint, copyable: true }] : []),
    ...(htmlDecimal ? [{ key: 'htmlDecimal', value: htmlDecimal, copyable: true }] : []),
    ...(htmlHex ? [{ key: 'htmlHex', value: htmlHex, copyable: true }] : []),
    ...(shortcode ? [{ key: 'shortcode', value: shortcode, copyable: true }] : []),
    ...(emojiVersion ? [{ key: 'emojiVersion', value: emojiVersion, copyable: false }] : []),
    ...(unicodeVersion ? [{ key: 'unicodeVersion', value: unicodeVersion, copyable: false }] : []),
    ...(categoryName ? [{ key: 'category', value: categoryName, copyable: false }] : []),
    ...(subcategoryName ? [{ key: 'subcategory', value: subcategoryName, copyable: false }] : []),
  ];

  return (
    <section className="mt-8">
      <h2 className="text-xl font-bold text-gray-900 mb-4">
        {locale === 'zh' ? '技术信息' : 'Technical Information'}
      </h2>
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="divide-y divide-gray-100">
          {rows.map((row) => (
            <div
              key={row.key}
              className="flex flex-col sm:flex-row sm:items-center gap-2 px-4 py-3"
            >
              <span className="text-xs font-medium text-gray-500 w-32 flex-shrink-0">
                {fieldLabels[row.key]?.[locale] || row.key}
              </span>
              <span className="text-sm text-gray-900 font-mono break-all flex-1">
                {row.value}
              </span>
              {row.copyable && (
                <CopyValueButton value={row.value} locale={locale} emojiId={emojiId} />
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
