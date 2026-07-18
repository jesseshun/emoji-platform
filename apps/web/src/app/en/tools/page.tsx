import type { Metadata } from 'next';
import { PublicPageHeader } from '@/components/PublicPageHeader';
import { ToolCard } from '@/components/ToolCard';
import { PageContainer } from '@/components/ui';

export const metadata: Metadata = {
  title: 'Tools',
  description: 'Emoji-related tools collection.',
};

const tools = [
  {
    icon: '📋',
    title: 'Emoji Copy Tool',
    description: 'Quickly browse and copy popular emoji characters with category filters.',
  },
  {
    icon: '🔍',
    title: 'Unicode Lookup',
    description: 'Find Unicode codepoints, version info, and official names for any emoji.',
  },
  {
    icon: '🎨',
    title: 'Emoji Combiner',
    description: 'Combine multiple emojis into unique and creative expressions.',
  },
  {
    icon: '✍️',
    title: 'Emoji Caption Generator',
    description: 'Generate social media captions with emojis for any occasion.',
  },
];

export default function EnToolsPage() {
  return (
    <PageContainer className="py-8 sm:py-12 lg:py-16">
      <PublicPageHeader
        eyebrow="Tool directory"
        title="Find, understand, and use emoji faster"
        description="This directory presents the emoji utilities currently being considered. There are no runnable standalone tools yet; clear launch links will appear here when they are ready."
        note="Current status: 4 items planned. Unfinished features are never presented as working tools."
      />
      <div className="grid gap-8 py-8 sm:py-10 lg:grid-cols-[16rem_minmax(0,1fr)] lg:gap-12">
        <aside aria-label="Tool status note">
          <p className="text-sm font-semibold text-text-primary">Development queue</p>
          <p className="mt-2 text-sm leading-6 text-text-secondary">
            Tools will prioritize accuracy, speed, and local-first interactions. Until launch, this page describes intent without dead controls.
          </p>
        </aside>
        <ol className="rounded-[8px] border border-border-subtle bg-surface p-4 sm:p-6">
          {tools.map((tool, index) => (
            <ToolCard
              key={tool.title}
              {...tool}
              index={String(index + 1).padStart(2, '0')}
              badge="Planned"
            />
          ))}
        </ol>
      </div>
    </PageContainer>
  );
}
