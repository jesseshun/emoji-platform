import type { Metadata } from 'next';
import Link from 'next/link';
import { PublicPageHeader } from '@/components/PublicPageHeader';
import { PageContainer } from '@/components/ui';

export const metadata: Metadata = {
  title: '关于我们',
  description: '了解 Emoji 平台的使命与功能。',
};

export default function ZhAboutPage() {
  return (
    <PageContainer className="py-8 sm:py-12 lg:py-16">
      <PublicPageHeader
        eyebrow="关于平台"
        title="让每一个 Emoji 都更容易被理解"
        description="Emoji 平台是一部免费的中英双语 Emoji 词典，帮助人们查找字符、理解语境，并把合适的表达复制到任何地方。"
        note="我们专注于清晰的信息结构、可靠的字符资料和不打扰阅读的使用体验。"
      />

      <div className="grid gap-8 py-10 lg:grid-cols-[14rem_minmax(0,1fr)] lg:gap-16">
        <aside className="text-sm text-text-secondary" aria-label="页面目录">
          <p className="font-semibold text-text-primary">我们的工作</p>
          <ol className="mt-3 space-y-2">
            <li>01 · 查找与浏览</li>
            <li>02 · 理解与使用</li>
            <li>03 · 内容与授权</li>
          </ol>
        </aside>
        <div className="max-w-3xl space-y-12">
          <section aria-labelledby="about-find">
            <p className="text-xs font-medium text-text-muted">01 / FIND</p>
            <h2 id="about-find" className="mt-2 text-2xl font-semibold text-text-primary">从一个字符开始探索</h2>
            <p className="mt-4 text-base leading-7 text-text-secondary">
              你可以搜索和浏览 Emoji，按分类或专题缩小范围，并查看名称、含义、Unicode 编码与相关内容。中文和英文页面提供相同的核心浏览路径。
            </p>
          </section>
          <section aria-labelledby="about-use">
            <p className="text-xs font-medium text-text-muted">02 / USE</p>
            <h2 id="about-use" className="mt-2 text-2xl font-semibold text-text-primary">把信息变成可用的表达</h2>
            <p className="mt-4 text-base leading-7 text-text-secondary">
              详情页把释义、示例和技术信息放在同一条阅读路径中，并提供复制操作。无论是日常沟通、内容创作还是开发检查，都能更快确认字符及其语境。
            </p>
          </section>
          <section aria-labelledby="about-principles" className="border-t border-border-subtle pt-8">
            <p className="text-xs font-medium text-text-muted">03 / PRINCIPLES</p>
            <h2 id="about-principles" className="mt-2 text-2xl font-semibold text-text-primary">内容边界清楚，来源各自归属</h2>
            <p className="mt-4 text-base leading-7 text-text-secondary">
              字符与标准信息以 Unicode 标准为基础；本站释义、描述和文章属于平台内容。平台厂商绘制的 Emoji 图像拥有独立的版权与许可，不能与字符本身混为一谈。
            </p>
            <Link href="/zh/license" className="mt-5 inline-flex text-sm font-medium text-text-link hover:text-text-link-hover">
              查看完整授权说明 →
            </Link>
          </section>
        </div>
      </div>
    </PageContainer>
  );
}
