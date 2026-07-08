import type { Metadata } from 'next';
import { ToolCard } from '@/components/ToolCard';

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
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Tools</h1>
        <p className="text-sm text-gray-500">
          Emoji-related tools collection. The following tools are under development.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {tools.map((tool) => (
          <ToolCard
            key={tool.title}
            icon={tool.icon}
            title={tool.title}
            description={tool.description}
            badge="Coming soon"
          />
        ))}
      </div>
    </div>
  );
}
