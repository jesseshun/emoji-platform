import type { Locale } from '@/lib/types';

interface EmojiMeaningSectionProps {
  oneLineMeaning: string | null;
  meaning: string | null;
  usageNotes: string | null;
  formalUsageNotes: string | null;
  informalUsageNotes: string | null;
  socialUsageNotes: string | null;
  locale: Locale;
}

const labels: Record<string, Record<string, string>> = {
  meaning: { zh: '含义解释', en: 'Meaning' },
  usageNotes: { zh: '使用说明', en: 'Usage Notes' },
  formalUsageNotes: { zh: '正式场合', en: 'Formal Usage' },
  informalUsageNotes: { zh: '非正式场合', en: 'Informal Usage' },
  socialUsageNotes: { zh: '社交媒体', en: 'Social Media' },
};

export function EmojiMeaningSection({
  oneLineMeaning: _oneLineMeaning,
  meaning,
  usageNotes,
  formalUsageNotes,
  informalUsageNotes,
  socialUsageNotes,
  locale,
}: EmojiMeaningSectionProps) {
  const sections: { key: string; content: string | null }[] = [
    { key: 'meaning', content: meaning },
    { key: 'usageNotes', content: usageNotes },
    { key: 'formalUsageNotes', content: formalUsageNotes },
    { key: 'informalUsageNotes', content: informalUsageNotes },
    { key: 'socialUsageNotes', content: socialUsageNotes },
  ];

  const hasContent = sections.some((s) => s.content);

  if (!hasContent) return null;

  return (
    <section>
      <h2 className="mb-4 text-xl font-semibold text-text-primary">
        {locale === 'zh' ? '含义与用法' : 'Meaning & Usage'}
      </h2>
      <div className="space-y-0 overflow-hidden rounded-[8px] border border-border-subtle bg-surface">
        {sections.map(
          (s) =>
            s.content && (
              <div key={s.key} className="border-b border-border-subtle p-5 last:border-b-0 sm:p-6">
                <h3 className="mb-2 text-sm font-semibold text-text-primary">
                  {labels[s.key]?.[locale] || s.key}
                </h3>
                <p className="break-words text-sm leading-7 text-text-secondary">{s.content}</p>
              </div>
            ),
        )}
      </div>
    </section>
  );
}
