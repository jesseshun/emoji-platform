'use client';

import { useEffect, useState } from 'react';
import {
  getSearchInfrastructureStatus,
  SearchInfrastructureStatus,
  AdminApiError,
} from '@/lib/adminApi';

function StatusBadge({ ok, label }: { ok: boolean; label: string }) {
  return (
    <span
      className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${
        ok ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
      }`}
    >
      {label}
    </span>
  );
}

function Field({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex justify-between items-center py-1.5 border-b last:border-0">
      <span className="text-gray-500 text-sm">{label}</span>
      <span className="text-gray-800 text-sm font-medium text-right">{value}</span>
    </div>
  );
}

export default function AdminDiscoveryPage() {
  const [infra, setInfra] = useState<SearchInfrastructureStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const infraRes = await getSearchInfrastructureStatus();
        if (!active) return;
        setInfra(infraRes);
      } catch (err) {
        if (active) {
          setError(err instanceof AdminApiError ? err.message || '加载失败' : '加载失败');
        }
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  if (loading) {
    return <div className="text-gray-500">加载中…</div>;
  }

  const meiliUsed = infra ? infra.meilisearchEnabled : false;

  return (
    <div>
      <div className="mb-4">
        <h1 className="text-2xl font-bold mb-1">🔎 发现与推荐</h1>
        <p className="text-gray-500 text-sm">
          Phase 6D Discovery &amp; Recommendation Enhancements 状态说明。公开只读，无需登录。
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        <div className="bg-white rounded-lg border p-4">
          <h2 className="font-semibold text-gray-800 mb-3">公开 API 状态</h2>
          <Field
            label="Discovery API"
            value={
              <StatusBadge
                ok
                label="GET /api/v1/discovery/home（公开只读）"
              />
            }
          />
          <Field
            label="Recommendation API"
            value={
              <StatusBadge
                ok
                label="GET /api/v1/recommendations（公开只读）"
              />
            }
          />
          <Field
            label="是否需要登录"
            value={<span>否（公开只读）</span>}
          />
          <Field
            label="返回内容范围"
            value={<span>仅 published 公开内容</span>}
          />
        </div>

        <div className="bg-white rounded-lg border p-4">
          <h2 className="font-semibold text-gray-800 mb-3">推荐数据源与 Fallback</h2>
          <Field
            label="推荐主数据源"
            value={<span>数据库（Prisma，published 过滤）</span>}
          />
          <Field
            label="Meilisearch 是否作为辅助"
            value={
              <StatusBadge
                ok={false}
                label="否（推荐不依赖 Meilisearch）"
              />
            }
          />
          <Field
            label="Meilisearch 不可用时"
            value={<span>推荐仍可用（数据库兜底）</span>}
          />
          <Field
            label="搜索 Provider（参考）"
            value={
              <span>
                {infra ? infra.currentProvider : '—'} → fallback{' '}
                {infra ? infra.fallbackProvider : '—'}
              </span>
            }
          />
          <Field
            label="Meilisearch 是否启用（参考）"
            value={
              <StatusBadge
                ok={meiliUsed}
                label={meiliUsed ? '已启用' : '未启用 / 不用于推荐'}
              />
            }
          />
        </div>
      </div>

      <div className="bg-white rounded-lg border p-4 mb-6">
        <h2 className="font-semibold text-gray-800 mb-3">支持的实体类型</h2>
        <div className="flex flex-wrap gap-2">
          {(['emoji', 'category', 'topic', 'article'] as const).map((e) => (
            <span
              key={e}
              className="inline-block px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-sm font-medium"
            >
              {e}
            </span>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-lg border p-4 mb-6">
        <h2 className="font-semibold text-gray-800 mb-3">当前推荐规则（简单、可解释）</h2>
        <ul className="list-disc pl-5 space-y-1 text-sm text-gray-600">
          <li>
            <span className="font-medium">Emoji</span>：同分类 Emoji + 同专题 Emoji + 关键词相近
            Emoji，排除自身，最多 8–12 个。
          </li>
          <li>
            <span className="font-medium">Category</span>：子分类 / 同级分类 + 关联专题 + 关键词相关文章。
          </li>
          <li>
            <span className="font-medium">Topic</span>：专题关联 Emoji + 共享 Emoji 的专题 + 关键词相关文章。
          </li>
          <li>
            <span className="font-medium">Article</span>：关键词相关文章 + 关键词相关专题 + 关键词相关 Emoji。
          </li>
          <li>关键词重叠打分（tokenize + 交集计数），无 AI、无个性化、无用户画像。</li>
          <li>只推荐 published 内容，排除 draft / archived。</li>
        </ul>
      </div>

      <div className="bg-white rounded-lg border p-4 mb-6">
        <h2 className="font-semibold text-gray-800 mb-3">风险边界</h2>
        <ul className="list-disc pl-5 space-y-1 text-sm text-gray-600">
          <li>不返回 draft / archived / admin 字段。</li>
          <li>不返回 passwordHash / JWT_SECRET / 明文敏感 IP / Meilisearch API Key。</li>
          <li>推荐仅为页面内容增强，不新增 sitemap / robots 条目，推荐结果页不进入索引。</li>
          <li>推荐失败不影响详情页渲染（前端静默降级为空）。</li>
          <li>本页面 noindex（后台统一设置），仅管理员可见。</li>
        </ul>
      </div>

      {error && (
        <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded px-3 py-2">
          {error}
        </div>
      )}
    </div>
  );
}
