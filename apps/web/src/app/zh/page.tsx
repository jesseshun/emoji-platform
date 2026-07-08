import type { Metadata } from 'next';
import Link from 'next/link';
import { SearchBox } from '@/components/SearchBox';
import { EmojiGrid } from '@/components/EmojiGrid';
import { CategoryCard } from '@/components/CategoryCard';
import { TopicCard } from '@/components/TopicCard';
import { ToolCard } from '@/components/ToolCard';
import { ErrorState } from '@/components/ErrorState';
import { getEmojis, getCategories, getTopics, getErrorMessage } from '@/lib/api';

export const metadata: Metadata = {
  title: 'Emoji 平台 - 发现每一个表情符号',
  description: '搜索、复制、理解每一个 Emoji。输入 Emoji、关键词、Unicode 编码或英文名称，快速找到你想要的表情符号。',
};

const tools = [
  {
    icon: '📋',
    title: 'Emoji 复制工具',
    description: '快速浏览和复制常用 Emoji 表情符号',
  },
  {
    icon: '🔍',
    title: 'Emoji Unicode 查询',
    description: '查询 Emoji 对应的 Unicode 编码和版本信息',
  },
  {
    icon: '🎨',
    title: 'Emoji 组合生成器',
    description: '将多个 Emoji 组合成创意表达',
  },
  {
    icon: '✍️',
    title: 'Emoji 文案生成器',
    description: '根据场景生成带 Emoji 的社交媒体文案',
  },
];

export default async function ZhHomePage() {
  let emojiData;
  let categoryData;
  let topicData;

  try {
    [emojiData, categoryData, topicData] = await Promise.all([
      getEmojis('zh', 1, 12),
      getCategories('zh'),
      getTopics('zh', 1, 3),
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
            搜索、复制、理解每一个 Emoji
          </h1>
          <p className="text-base sm:text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
            输入 Emoji、关键词、Unicode 编码或英文名称，快速找到你想要的表情符号。
          </p>
          <SearchBox locale="zh" />
        </div>
      </section>

      {/* Recommended Emojis */}
      {emojiData && emojiData.data && emojiData.data.length > 0 && (
        <section className="max-w-6xl mx-auto px-4 py-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">推荐表情</h2>
            <Link
              href="/zh/emojis"
              className="text-sm text-blue-600 hover:text-blue-700 transition"
            >
              查看全部 →
            </Link>
          </div>
          <EmojiGrid emojis={emojiData.data} locale="zh" />
        </section>
      )}

      {/* Category Entry */}
      {categoryData && categoryData.data && categoryData.data.length > 0 && (
        <section className="max-w-6xl mx-auto px-4 py-12 bg-white">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">表情分类</h2>
            <Link
              href="/zh/categories"
              className="text-sm text-blue-600 hover:text-blue-700 transition"
            >
              查看全部分类 →
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {categoryData.data.slice(0, 6).map((cat: typeof categoryData.data[number]) => (
              <CategoryCard key={cat.id} category={cat} locale="zh" />
            ))}
          </div>
        </section>
      )}

      {/* Topic Entry */}
      {topicData && topicData.data && topicData.data.length > 0 && (
        <section className="max-w-6xl mx-auto px-4 py-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">精选专题</h2>
            <Link
              href="/zh/topics"
              className="text-sm text-blue-600 hover:text-blue-700 transition"
            >
              查看全部专题 →
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {topicData.data.map((topic: typeof topicData.data[number]) => (
              <TopicCard key={topic.id} topic={topic} locale="zh" />
            ))}
          </div>
        </section>
      )}

      {/* Tool Entry */}
      <section className="max-w-6xl mx-auto px-4 py-12 bg-white">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">实用工具</h2>
          <Link
            href="/zh/tools"
            className="text-sm text-blue-600 hover:text-blue-700 transition"
          >
            查看全部工具 →
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {tools.map((tool) => (
            <ToolCard
              key={tool.title}
              icon={tool.icon}
              title={tool.title}
              description={tool.description}
              badge="即将上线"
            />
          ))}
        </div>
      </section>

      {/* Intro Section */}
      <section className="max-w-6xl mx-auto px-4 py-12">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-xl font-bold text-gray-900 mb-4">关于 Emoji 平台</h2>
          <p className="text-sm text-gray-600 leading-relaxed">
            Emoji 平台是一个免费的 Emoji 词典与搜索工具，致力于帮助用户快速查找、理解和使用 Emoji 表情符号。
            我们提供中英文双语界面，支持按分类浏览、按关键词搜索，以及一键复制功能。
            所有 Emoji 字符基于 Unicode 标准，内容持续更新。
          </p>
        </div>
      </section>
    </div>
  );
}
