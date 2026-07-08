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
  oneLineMeaning,
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
    <section className="mt-8">
      <h2 className="text-xl font-bold text-gray-900 mb-4">
        {locale === 'zh' ? '含义与用法' : 'Meaning & Usage'}
      </h2>
      <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
        {sections.map(
          (s) =>
            s.content && (
              <div key={s.key}>
                <h3 className="text-sm font-semibold text-gray-700 mb-1">
                  {labels[s.key]?.[locale] || s.key}
                </h3>
                <p className="text-sm text-gray-600 leading-relaxed">{s.content}</p>
              </div>
            ),
        )}
      </div>
    </section>
  );
}
