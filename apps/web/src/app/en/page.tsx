import type { Metadata } from 'next';
import { HomeHero } from '@/components/HomeHero';
import { DiscoverySection } from '@/components/DiscoverySection';
import { ErrorState } from '@/components/ErrorState';
import { getDiscovery, getErrorMessage } from '@/lib/api';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Emoji Platform - Discover Every Emoji',
  description: 'Search, copy, and understand every emoji. Find emoji meanings, Unicode codes, usage examples, and more.',
};

export default async function EnHomePage() {
  let discovery;

  try {
    const res = await getDiscovery('en');
    discovery = res.data;
  } catch (error) {
    return <ErrorState message={getErrorMessage(error)} />;
  }

  return (
    <div className="min-h-screen">
      {/* Hero + main search */}
      <HomeHero locale="en" />

      {/* Discovery: popular emojis, categories, topics, articles */}
      <DiscoverySection data={discovery} locale="en" />

      {/* Call to action */}
      <section className="mx-auto max-w-content px-4 sm:px-6 py-16">
        <div className="relative overflow-hidden rounded-2xl bg-surface border border-border-subtle px-6 py-12 sm:px-12 text-center">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 opacity-50
                       bg-[radial-gradient(80%_120%_at_50%_120%,rgba(0,122,255,0.07),transparent_70%)]"
          />
          <div className="relative">
            <h2 className="text-2xl sm:text-3xl font-semibold text-text-primary mb-3">
              Start exploring the world of emoji
            </h2>
            <p className="text-text-secondary max-w-xl mx-auto mb-6">
              Browse by category, search by keyword, or copy your favorite emoji in one click.
              Everything is based on the Unicode Standard and continuously updated.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <a
                href="/en/emojis"
                className="inline-flex items-center px-5 py-2.5 text-sm font-medium rounded-xl
                           bg-accent text-white hover:bg-accent-hover transition-colors duration-fast"
              >
                Browse all emojis
              </a>
              <a
                href="/en/categories"
                className="inline-flex items-center px-5 py-2.5 text-sm font-medium rounded-xl
                           bg-surface border border-border-subtle text-text-primary
                           hover:border-border transition-colors duration-fast"
              >
                Browse by category
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
