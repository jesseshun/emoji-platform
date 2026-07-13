'use client';

import { useEffect, useState } from 'react';
import {
  getSearchInfrastructureStatus,
  SearchInfrastructureStatus,
  AdminApiError,
} from '@/lib/adminApi';

const ENTITY_LABELS: Record<
  'emoji' | 'category' | 'topic' | 'article',
  string
> = {
  emoji: 'Emoji',
  category: 'Category',
  topic: 'Topic',
  article: 'Article',
};

function StatusBadge({ ok, label }: { ok: boolean; label: string }) {
  return (
    <span
      className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${
        ok
          ? 'bg-green-100 text-green-700'
          : 'bg-gray-100 text-gray-600'
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

export default function AdminSearchInfrastructurePage() {
  const [data, setData] = useState<SearchInfrastructureStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const res = await getSearchInfrastructureStatus();
        if (active) setData(res);
      } catch (err) {
        if (active) {
          setError(
            err instanceof AdminApiError
              ? err.message || '加载失败'
              : '加载失败',
          );
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

  if (error) {
    return (
      <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded px-3 py-2">
        {error}
      </div>
    );
  }

  if (!data) return null;

  return (
    <div>
      <div className="mb-4">
        <h1 className="text-2xl font-bold mb-1">🔍 搜索基础设施</h1>
        <p className="text-gray-500 text-sm">
          Phase 6A 搜索基础设施规划与状态（只读）。当前使用 database provider 保留现有数据库搜索行为，
          Meilisearch 计划在 Phase 6B 接入。
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        <div className="bg-white rounded-lg border p-4">
          <h2 className="font-semibold text-gray-800 mb-3">Provider 状态</h2>
          <Field
            label="当前搜索 Provider"
            value={<StatusBadge ok={data.currentProvider === 'database'} label={data.currentProvider} />}
          />
          <Field
            label="Fallback Provider"
            value={<span>{data.fallbackProvider}</span>}
          />
          <Field
            label="Meilisearch 是否已配置"
            value={<StatusBadge ok={false} label={data.meilisearchConfigured ? '已配置' : '未配置'} />}
          />
          <Field
            label="Meilisearch 是否已启用"
            value={<StatusBadge ok={false} label={data.meilisearchEnabled ? '已启用' : '未启用'} />}
          />
        </div>

        <div className="bg-white rounded-lg border p-4">
          <h2 className="font-semibold text-gray-800 mb-3">索引状态</h2>
          <Field
            label="索引就绪 (indexReady)"
            value={<StatusBadge ok={false} label={data.indexReady ? '已就绪' : '未就绪'} />}
          />
          <Field
            label="最近索引时间 (lastIndexedAt)"
            value={<span>{data.lastIndexedAt ?? '—'}</span>}
          />
          <Field
            label="计划索引实体数"
            value={<span>{data.indexEntitiesPlanned.length}</span>}
          />
        </div>
      </div>

      <div className="bg-white rounded-lg border p-4 mb-6">
        <h2 className="font-semibold text-gray-800 mb-3">计划索引实体</h2>
        <div className="flex flex-wrap gap-2">
          {data.indexEntitiesPlanned.map((e) => (
            <span
              key={e}
              className="inline-block px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-sm font-medium"
            >
              {ENTITY_LABELS[e] ?? e}
            </span>
          ))}
          <span className="inline-block px-3 py-1 rounded-full bg-gray-100 text-gray-500 text-sm">
            Asset（暂不纳入）
          </span>
        </div>
        <p className="text-xs text-gray-500 mt-3">
          Asset 暂不纳入搜索索引：Asset 是资源 / 授权管理对象，不是主要公开搜索对象，进入搜索可能引入版权、
          授权、重复内容风险。后续如有资源下载站能力，再单独规划。
        </p>
      </div>

      <div className="bg-white rounded-lg border p-4 mb-6">
        <h2 className="font-semibold text-gray-800 mb-3">风险边界</h2>
        <ul className="list-disc pl-5 space-y-1 text-sm text-gray-600">
          <li>不索引 draft / archived 内容（仅 published 进入外部索引）。</li>
          <li>不索引 /admin 及任何 admin-only 字段。</li>
          <li>不索引敏感数据（无 passwordHash、无 JWT_SECRET、无明文敏感 IP）。</li>
          <li>多语言搜索默认带 locale filter（/zh 默认 zh，/en 默认 en）。</li>
          <li>Phase 6A 未创建真实索引、未接入 Meilisearch、未安装 Meilisearch SDK。</li>
        </ul>
      </div>

      <div className="bg-white rounded-lg border p-4 mb-6">
        <h2 className="font-semibold text-gray-800 mb-3">Phase 6B 说明</h2>
        <p className="text-sm text-gray-600 leading-relaxed">
          下一阶段（Phase 6B - Meilisearch Integration）将基于本阶段的 SearchProvider 抽象接入 Meilisearch，
          实现 Emoji / Category / Topic / Article 的外部索引与高级发现能力。接入需经明确确认，且保持现有
          SEO 边界（sitemap / robots / noindex / published-only）不变。
        </p>
      </div>

      {data.notes && (
        <div className="bg-gray-50 border rounded p-4 text-sm text-gray-600 leading-relaxed">
          {data.notes}
        </div>
      )}
    </div>
  );
}
