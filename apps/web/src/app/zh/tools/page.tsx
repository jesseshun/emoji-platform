import type { Metadata } from 'next';
import { ToolCard } from '@/components/ToolCard';

export const metadata: Metadata = {
  title: '实用工具',
  description: 'Emoji 相关实用工具集合。',
};

const tools = [
  {
    icon: '📋',
    title: 'Emoji 复制工具',
    description: '快速浏览和复制常用 Emoji 表情符号，支持分类筛选和一键复制。',
  },
  {
    icon: '🔍',
    title: 'Emoji Unicode 查询',
    description: '查询任意 Emoji 的 Unicode 编码、版本信息和官方名称。',
  },
  {
    icon: '🎨',
    title: 'Emoji 组合生成器',
    description: '将多个 Emoji 自由组合，创造独特的表情表达。',
  },
  {
    icon: '✍️',
    title: 'Emoji 文案生成器',
    description: '根据场景和情感自动生成带有 Emoji 的社交媒体文案。',
  },
];

export default function ZhToolsPage() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">实用工具</h1>
        <p className="text-sm text-gray-500">
          Emoji 相关实用工具集合。以下工具正在开发中，敬请期待。
        </p>
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
    </div>
  );
}
