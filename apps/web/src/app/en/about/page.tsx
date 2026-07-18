import type { Metadata } from 'next';
import Link from 'next/link';
import { PublicPageHeader } from '@/components/PublicPageHeader';
import { PageContainer } from '@/components/ui';

export const metadata: Metadata = {
  title: 'About Us',
  description: 'Learn about the Emoji Platform mission and features.',
};

export default function EnAboutPage() {
  return (
    <PageContainer className="py-8 sm:py-12 lg:py-16">
      <PublicPageHeader
        eyebrow="About the platform"
        title="Making every emoji easier to understand"
        description="Emoji Platform is a free bilingual emoji dictionary for finding characters, understanding context, and copying the right expression anywhere."
        note="We focus on clear information architecture, dependable character references, and a reading experience that stays out of the way."
      />

      <div className="grid gap-8 py-10 lg:grid-cols-[14rem_minmax(0,1fr)] lg:gap-16">
        <aside className="text-sm text-text-secondary" aria-label="Page contents">
          <p className="font-semibold text-text-primary">What we do</p>
          <ol className="mt-3 space-y-2">
            <li>01 · Find and browse</li>
            <li>02 · Understand and use</li>
            <li>03 · Content and rights</li>
          </ol>
        </aside>
        <div className="max-w-3xl space-y-12">
          <section aria-labelledby="about-find">
            <p className="text-xs font-medium text-text-muted">01 / FIND</p>
            <h2 id="about-find" className="mt-2 text-2xl font-semibold text-text-primary">Explore from a single character</h2>
            <p className="mt-4 text-base leading-7 text-text-secondary">
              Search and browse emoji, narrow the field by category or topic, and inspect names, meanings, Unicode codepoints, and related material. Chinese and English pages share the same core paths.
            </p>
          </section>
          <section aria-labelledby="about-use">
            <p className="text-xs font-medium text-text-muted">02 / USE</p>
            <h2 id="about-use" className="mt-2 text-2xl font-semibold text-text-primary">Turn information into expression</h2>
            <p className="mt-4 text-base leading-7 text-text-secondary">
              Detail pages place meaning, examples, and technical information in one reading flow, with copy actions close at hand. This helps with everyday messages, publishing, and development checks.
            </p>
          </section>
          <section aria-labelledby="about-principles" className="border-t border-border-subtle pt-8">
            <p className="text-xs font-medium text-text-muted">03 / PRINCIPLES</p>
            <h2 id="about-principles" className="mt-2 text-2xl font-semibold text-text-primary">Clear content boundaries and attribution</h2>
            <p className="mt-4 text-base leading-7 text-text-secondary">
              Character and standard references are based on the Unicode Standard; meanings, descriptions, and articles are platform content. Vendor-drawn emoji artwork has separate copyright and licensing terms and is not the same as the underlying character.
            </p>
            <Link href="/en/license" className="mt-5 inline-flex text-sm font-medium text-text-link hover:text-text-link-hover">
              Read the full license notes →
            </Link>
          </section>
        </div>
      </div>
    </PageContainer>
  );
}
