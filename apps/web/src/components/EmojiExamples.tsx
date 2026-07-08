import type { Locale } from '@/lib/types';

interface ExampleItem {
  text: string;
  context?: string;
}

interface EmojiExamplesProps {
  examples: unknown | null;
  locale: Locale;
}

export function EmojiExamples({ examples, locale }: EmojiExamplesProps) {
  if (!examples) return null;

  let parsed: ExampleItem[] = [];

  try {
    if (typeof examples === 'string') {
      parsed = JSON.parse(examples);
    } else if (Array.isArray(examples)) {
      parsed = examples as ExampleItem[];
    }
  } catch {
    return null;
  }

  if (!Array.isArray(parsed) || parsed.length === 0) return null;

  return (
    <section className="mt-8">
      <h2 className="text-xl font-bold text-gray-900 mb-4">
        {locale === 'zh' ? '使用示例' : 'Usage Examples'}
      </h2>
      <div className="space-y-3">
        {parsed.map((item, index) => (
          <div
            key={index}
            className="bg-white rounded-lg border border-gray-200 p-4"
          >
            <p className="text-sm text-gray-800 leading-relaxed">{item.text}</p>
            {item.context && (
              <span className="inline-block mt-2 text-xs text-gray-400 bg-gray-50 px-2 py-0.5 rounded">
                {item.context}
              </span>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
