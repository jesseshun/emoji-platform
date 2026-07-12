import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getEmojiDetail, getErrorMessage, ApiError } from '@/lib/api';
import { buildDetailMetadata, optionalText, safeText } from '@/lib/seo';
import type { FaqItem } from '@/lib/seo';
import { DetailHero } from '@/components/DetailHero';
import { Breadcrumb } from '@/components/Breadcrumb';
import { CopyArea } from '@/components/CopyArea';
import { EmojiMeaningSection } from '@/components/EmojiMeaningSection';
import { EmojiExamples } from '@/components/EmojiExamples';
import { EmojiTechInfo } from '@/components/EmojiTechInfo';
import { EmojiKeywords } from '@/components/EmojiKeywords';
import { EmojiAssets } from '@/components/EmojiAssets';
import { RelatedEmojis } from '@/components/RelatedEmojis';
import { RelatedTopics } from '@/components/RelatedTopics';
import { FaqBlock } from '@/components/FaqBlock';
import { ErrorState } from '@/components/ErrorState';

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;

  try {
    const result = await getEmojiDetail(slug, 'en');
    const emoji = result.data;
    const name = safeText(emoji.translation?.name || emoji.slug);
    const title = optionalText(emoji.translation?.seoTitle) || `${emoji.emojiChar} ${name} Emoji - Meaning and Usage`;
    const description = optionalText(emoji.translation?.seoDescription) || `Learn the meaning of ${emoji.emojiChar} ${name} emoji. Copy, discover usage examples, and view Unicode technical details.`;

    return buildDetailMetadata({
      locale: 'en',
      path: `/emoji/${slug}`,
      title,
      description,
    });
  } catch {
    return buildDetailMetadata({
      locale: 'en',
      path: `/emoji/${slug}`,
      title: 'Emoji Detail',
      description: 'Emoji detail page',
    });
  }
}

export default async function EnEmojiDetailPage({ params }: Props) {
  const { slug } = await params;

  try {
    const result = await getEmojiDetail(slug, 'en');
    const emoji = result.data;

    const name = safeText(emoji.translation?.name);
    const categoryName = emoji.category?.name || null;
    const subcategoryName = emoji.subcategory?.name || null;

    // Build copy items
    const copyItems: { label: string; value: string; mono?: boolean }[] = [];
    if (emoji.emojiChar) copyItems.push({ label: emoji.emojiChar, value: emoji.emojiChar });
    if (emoji.unicodeCodepoint) copyItems.push({ label: emoji.unicodeCodepoint, value: emoji.unicodeCodepoint, mono: true });
    if (emoji.htmlDecimal) copyItems.push({ label: 'HTML Decimal', value: emoji.htmlDecimal, mono: true });
    if (emoji.htmlHex) copyItems.push({ label: 'HTML Hex', value: emoji.htmlHex, mono: true });
    if (emoji.shortcode) copyItems.push({ label: emoji.shortcode, value: emoji.shortcode, mono: true });

    // Parse FAQ
    let faqs: FaqItem[] = [];
    try {
      if (typeof emoji.translation?.faqJson === 'string') {
        faqs = JSON.parse(emoji.translation.faqJson);
      } else if (Array.isArray(emoji.translation?.faqJson)) {
        faqs = emoji.translation.faqJson as FaqItem[];
      }
    } catch {
      faqs = [];
    }

    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <Breadcrumb
          locale="en"
          items={[
            { label: 'All Emojis', href: '/en/emojis' },
            ...(categoryName
              ? [{ label: categoryName, href: `/en/categories/${emoji.category?.slug || ''}` }]
              : []),
            { label: `${emoji.emojiChar} ${name || emoji.slug}` },
          ]}
        />

        {/* Hero */}
        <DetailHero
          emojiChar={emoji.emojiChar}
          emojiId={emoji.id}
          name={name}
          shortName={emoji.translation?.shortName || null}
          oneLineMeaning={emoji.translation?.oneLineMeaning || null}
          locale="en"
          category={emoji.category}
        />

        {/* Copy Area */}
        <CopyArea items={copyItems} locale="en" emojiId={emoji.id} />

        {/* Meaning */}
        <EmojiMeaningSection
          oneLineMeaning={emoji.translation?.oneLineMeaning || null}
          meaning={emoji.translation?.meaning || null}
          usageNotes={emoji.translation?.usageNotes || null}
          formalUsageNotes={emoji.translation?.formalUsageNotes || null}
          informalUsageNotes={emoji.translation?.informalUsageNotes || null}
          socialUsageNotes={emoji.translation?.socialUsageNotes || null}
          locale="en"
        />

        {/* Examples */}
        <EmojiExamples examples={emoji.translation?.examples ?? null} locale="en" />

        {/* Tech Info */}
        <EmojiTechInfo
          emojiChar={emoji.emojiChar}
          unicodeCodepoint={emoji.unicodeCodepoint}
          htmlDecimal={emoji.htmlDecimal}
          htmlHex={emoji.htmlHex}
          shortcode={emoji.shortcode}
          emojiVersion={emoji.emojiVersion}
          unicodeVersion={emoji.unicodeVersion}
          categoryName={categoryName}
          subcategoryName={subcategoryName}
          locale="en"
          emojiId={emoji.id}
        />

        {/* Keywords */}
        <EmojiKeywords keywords={emoji.translation?.keywords ?? null} locale="en" />

        {/* FAQ */}
        <FaqBlock faqs={faqs} />

        {/* Assets */}
        <EmojiAssets assets={emoji.assets} locale="en" />

        {/* Related Emojis */}
        <RelatedEmojis emojis={emoji.relatedEmojis} locale="en" />

        {/* Related Topics */}
        <RelatedTopics topics={emoji.relatedTopics} locale="en" />
      </div>
    );
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      notFound();
    }
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <ErrorState message={getErrorMessage(error)} />
      </div>
    );
  }
}
