'use client';

import { SeoEntityList } from '@/components/SeoEntityList';

export default function AdminSeoCategoriesPage() {
  return (
    <SeoEntityList
      entityType="category"
      title="🔍 分类 SEO"
      description="管理分类翻译（zh / en）的 seoTitle 与 seoDescription，检查 SEO 完整度。"
    />
  );
}
