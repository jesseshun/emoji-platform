import type { Metadata } from 'next';
import { PublicPageHeader } from '@/components/PublicPageHeader';
import { ToolCard } from '@/components/ToolCard';
import { PageContainer } from '@/components/ui';

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
    <PageContainer className="py-8 sm:py-12 lg:py-16">
      <PublicPageHeader
        eyebrow="工具目录"
        title="更快找到、理解和使用 Emoji"
        description="这里集中展示正在规划中的 Emoji 辅助工具。当前没有可执行的独立工具，开放后会在本页提供明确入口。"
        note="当前状态：4 项规划中。页面不会把未完成的功能伪装成可用工具。"
      />
      <div className="grid gap-8 py-8 sm:py-10 lg:grid-cols-[16rem_minmax(0,1fr)] lg:gap-12">
        <aside aria-label="工具状态说明">
          <p className="text-sm font-semibold text-text-primary">开发队列</p>
          <p className="mt-2 text-sm leading-6 text-text-secondary">
            工具将以准确、快速和本地优先的交互为目标。上线前仅展示用途，不提供无效按钮。
          </p>
        </aside>
        <ol className="rounded-[8px] border border-border-subtle bg-surface p-4 sm:p-6">
          {tools.map((tool, index) => (
            <ToolCard
              key={tool.title}
              {...tool}
              index={String(index + 1).padStart(2, '0')}
              badge="规划中"
            />
          ))}
        </ol>
      </div>
    </PageContainer>
  );
}
