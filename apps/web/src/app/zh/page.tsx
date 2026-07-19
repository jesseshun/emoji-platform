import type { Metadata } from 'next';
import { HomeHero } from '@/components/HomeHero';
import { DiscoverySection } from '@/components/DiscoverySection';
import { ErrorState } from '@/components/ErrorState';
import { getDiscovery, getErrorMessage } from '@/lib/api';

export const dynamic = 'force-dynamic';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

export const metadata: Metadata = {
  title: 'Emoji 平台 - 发现每一个表情符号',
  description: '搜索、复制、理解每一个 Emoji。输入 Emoji、关键词、Unicode 编码或英文名称，快速找到你想要的表情符号。',
  alternates: {
    canonical: `${siteUrl}/zh`,
    languages: {
      zh: `${siteUrl}/zh`,
      en: `${siteUrl}/en`,
      'x-default': `${siteUrl}/en`,
    },
  },
};

export default async function ZhHomePage() {
  let discovery;

  try {
    const res = await getDiscovery('zh');
    discovery = res.data;
  } catch (error) {
    return <ErrorState message={getErrorMessage(error)} />;
  }

  return (
    <div className="min-h-screen">
      {/* Hero + main search */}
      <HomeHero locale="zh" />

      {/* Discovery: popular emojis, categories, topics, articles */}
      <DiscoverySection data={discovery} locale="zh" />

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
              开始探索 Emoji 世界
            </h2>
            <p className="text-text-secondary max-w-xl mx-auto mb-6">
              按分类浏览、按关键词搜索，或一键复制你喜欢的表情符号。所有内容基于 Unicode 标准，持续更新。
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <a
                href="/zh/emojis"
                className="inline-flex items-center px-5 py-2.5 text-sm font-medium rounded-xl
                           bg-accent text-white hover:bg-accent-hover transition-colors duration-fast"
              >
                浏览全部表情
              </a>
              <a
                href="/zh/categories"
                className="inline-flex items-center px-5 py-2.5 text-sm font-medium rounded-xl
                           bg-surface border border-border-subtle text-text-primary
                           hover:border-border transition-colors duration-fast"
              >
                按分类浏览
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
