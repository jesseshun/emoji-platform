'use client';

import { SeoEntityList } from '@/components/SeoEntityList';

export default function AdminSeoTopicsPage() {
  return (
    <SeoEntityList
      entityType="topic"
      title="🔍 专题 SEO"
      description="管理专题翻译（zh / en）的 seoTitle 与 seoDescription，检查 SEO 完整度。"
    />
  );
}
