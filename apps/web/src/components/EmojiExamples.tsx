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
      <h2 className="mb-4 text-xl font-semibold text-text-primary">
        {locale === 'zh' ? '使用示例' : 'Usage Examples'}
      </h2>
      <div className="space-y-3">
        {parsed.map((item, index) => (
          <div
            key={index}
            className="rounded-[8px] border border-border-subtle bg-surface p-5"
          >
            <p className="break-words text-sm leading-7 text-text-primary">{item.text}</p>
            {item.context && (
              <span className="mt-2 inline-block rounded-[6px] bg-bg-subtle px-2 py-0.5 text-xs text-text-muted">
                {item.context}
              </span>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
