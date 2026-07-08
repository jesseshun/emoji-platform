import { JsonLd } from './JsonLd';
import { buildFaqPage } from '@/lib/seo';
import type { FaqItem } from '@/lib/seo';

interface FaqBlockProps {
  faqs: FaqItem[];
}

export function FaqBlock({ faqs }: FaqBlockProps) {
  if (!faqs || faqs.length === 0) return null;

  const ldJson = buildFaqPage(faqs);

  return (
    <>
      <JsonLd data={ldJson} />
      <section className="mt-8">
        <h2 className="text-xl font-bold text-gray-900 mb-4">FAQ</h2>
        <div className="space-y-3">
          {faqs.map((faq, index) => (
            <details
              key={index}
              className="bg-white rounded-lg border border-gray-200 group"
            >
              <summary className="px-4 py-3 cursor-pointer text-sm font-medium text-gray-900 hover:text-blue-600 transition-colors select-none">
                {faq.question}
              </summary>
              <div className="px-4 pb-3 text-sm text-gray-600 leading-relaxed">
                {faq.answer}
              </div>
            </details>
          ))}
        </div>
      </section>
    </>
  );
}
