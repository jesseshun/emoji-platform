import type { Metadata } from 'next';
import Link from 'next/link';

export const dynamic = 'force-dynamic';
import { SearchBox } from '@/components/SearchBox';
import { EmojiGrid } from '@/components/EmojiGrid';
import { CategoryCard } from '@/components/CategoryCard';
import { TopicCard } from '@/components/TopicCard';
import { ToolCard } from '@/components/ToolCard';
import { ErrorState } from '@/components/ErrorState';
import { getEmojis, getCategories, getTopics, getErrorMessage } from '@/lib/api';

export const metadata: Metadata = {
  title: 'Emoji Platform - Discover Every Emoji',
  description: 'Search, copy, and understand every emoji. Find emoji meanings, Unicode codes, usage examples, and more.',
};

const tools = [
  {
    icon: '📋',
    title: 'Emoji Copy Tool',
    description: 'Quickly browse and copy popular emoji characters',
  },
  {
    icon: '🔍',
    title: 'Unicode Lookup',
    description: 'Find Unicode codepoints and version info for any emoji',
  },
  {
    icon: '🎨',
    title: 'Emoji Combiner',
    description: 'Combine multiple emojis into creative expressions',
  },
  {
    icon: '✍️',
    title: 'Emoji Caption Generator',
    description: 'Generate social media captions with emojis for any occasion',
  },
];

export default async function EnHomePage() {
  let emojiData;
  let categoryData;
  let topicData;

  try {
    [emojiData, categoryData, topicData] = await Promise.all([
      getEmojis('en', 1, 12),
      getCategories('en'),
      getTopics('en', 1, 3),
    ]);
  } catch (error) {
    return <ErrorState message={getErrorMessage(error)} />;
  }

  return (
    <div>
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-blue-50 to-white py-16 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            Search, copy, and understand every emoji
          </h1>
          <p className="text-base sm:text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
            Find emoji meanings, Unicode codes, usage examples, and social media combinations.
          </p>
          <SearchBox locale="en" />
        </div>
      </section>

      {/* Recommended Emojis */}
      {emojiData && emojiData.data && emojiData.data.length > 0 && (
        <section className="max-w-6xl mx-auto px-4 py-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">Recommended Emojis</h2>
            <Link
              href="/en/emojis"
              className="text-sm text-blue-600 hover:text-blue-700 transition"
            >
              View all →
            </Link>
          </div>
          <EmojiGrid emojis={emojiData.data} locale="en" />
        </section>
      )}

      {/* Category Entry */}
      {categoryData && categoryData.data && categoryData.data.length > 0 && (
        <section className="max-w-6xl mx-auto px-4 py-12 bg-white">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">Categories</h2>
            <Link
              href="/en/categories"
              className="text-sm text-blue-600 hover:text-blue-700 transition"
            >
              View all categories →
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {categoryData.data.slice(0, 6).map((cat: typeof categoryData.data[number]) => (
              <CategoryCard key={cat.id} category={cat} locale="en" />
            ))}
          </div>
        </section>
      )}

      {/* Topic Entry */}
      {topicData && topicData.data && topicData.data.length > 0 && (
        <section className="max-w-6xl mx-auto px-4 py-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">Featured Topics</h2>
            <Link
              href="/en/topics"
              className="text-sm text-blue-600 hover:text-blue-700 transition"
            >
              View all topics →
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {topicData.data.map((topic: typeof topicData.data[number]) => (
              <TopicCard key={topic.id} topic={topic} locale="en" />
            ))}
          </div>
        </section>
      )}

      {/* Tool Entry */}
      <section className="max-w-6xl mx-auto px-4 py-12 bg-white">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">Tools</h2>
          <Link
            href="/en/tools"
            className="text-sm text-blue-600 hover:text-blue-700 transition"
          >
            View all tools →
          </Link>
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
      </section>

      {/* Intro Section */}
      <section className="max-w-6xl mx-auto px-4 py-12">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-xl font-bold text-gray-900 mb-4">About Emoji Platform</h2>
          <p className="text-sm text-gray-600 leading-relaxed">
            Emoji Platform is a free emoji dictionary and search tool dedicated to helping users
            quickly find, understand, and use emoji characters. We offer bilingual support in
            Chinese and English, category browsing, keyword search, and one-click copy.
            All emoji characters are based on the Unicode Standard, and content is continuously updated.
          </p>
        </div>
      </section>
    </div>
  );
}
