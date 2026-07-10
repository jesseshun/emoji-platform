'use client';

import { SeoEntityList } from '@/components/SeoEntityList';

export default function AdminSeoEmojisPage() {
  return (
    <SeoEntityList
      entityType="emoji"
      title="🔍 Emoji SEO"
      description="管理 Emoji 翻译（zh / en）的 seoTitle 与 seoDescription，检查 SEO 完整度。"
    />
  );
}
