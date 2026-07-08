import type { Metadata } from 'next';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';

export const metadata: Metadata = {
  title: {
    default: 'Emoji 平台 - 发现每一个表情符号',
    template: '%s | Emoji 平台',
  },
  description: '发现、搜索和复制你喜欢的每一个 Emoji 表情符号。支持中文和英文界面。',
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
