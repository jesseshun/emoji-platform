'use client';

import { SeoEntityList } from '@/components/SeoEntityList';

export default function AdminSeoArticlesPage() {
  return (
    <SeoEntityList
      entityType="article"
      title="🔍 文章 SEO"
      description="管理文章翻译（zh / en）的 seoTitle 与 seoDescription，检查 SEO 完整度。前台文章详情页为规划路径。"
    />
  );
}
