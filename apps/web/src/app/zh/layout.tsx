import type { Metadata } from 'next';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

export const metadata: Metadata = {
  title: {
    default: 'Emoji 平台 - 发现每一个表情符号',
    template: '%s | Emoji 平台',
  },
  description: '发现、搜索和复制你喜欢的每一个 Emoji 表情符号。支持中文和英文界面。',
  alternates: {
    languages: {
      zh: `${siteUrl}/zh`,
      en: `${siteUrl}/en`,
      'x-default': `${siteUrl}/en`,
    },
  },
  openGraph: {
    title: 'Emoji 平台 - 发现每一个表情符号',
    description: '发现、搜索和复制你喜欢的每一个 Emoji 表情符号',
    type: 'website',
    locale: 'zh_CN',
  },
};

export default function ZhLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Header locale="zh" />
      <main className="flex-1">{children}</main>
      <Footer locale="zh" />
    </>
  );
}
