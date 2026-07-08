import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Emoji Platform - 中文',
  description: '全球 Emoji 词典与搜索平台',
};

export default function ZhLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
