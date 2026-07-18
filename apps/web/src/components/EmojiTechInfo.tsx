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
    <section className="rounded-[8px] border border-border-subtle bg-surface p-4 shadow-xs">
      <h2 className="mb-3 text-sm font-semibold text-text-primary">
        {locale === 'zh' ? '技术信息' : 'Technical Information'}
      </h2>
      <dl className="divide-y divide-border-subtle">
          {rows.map((row) => (
            <div
              key={row.key}
              className="grid min-w-0 grid-cols-[minmax(0,1fr)_2.5rem] items-center gap-2 py-3 first:pt-0 last:pb-0"
            >
              <div className="min-w-0">
              <dt className="mb-1 text-[11px] font-medium text-text-muted">
                {fieldLabels[row.key]?.[locale] || row.key}
              </dt>
              <dd className="break-all font-mono text-sm text-text-primary">
                {row.value}
              </dd>
              </div>
              {row.copyable && (
                <CopyValueButton value={row.value} label={fieldLabels[row.key]?.[locale]} locale={locale} emojiId={emojiId} />
              )}
              {!row.copyable && <span aria-hidden="true" />}
            </div>
          ))}
      </dl>
    </section>
  );
}
