'use client';

import { useEffect, useState, useCallback } from 'react';
import {
  getSearchInfrastructureStatus,
  getSearchIndexStatus,
  postSearchIndexRebuild,
  postSearchIndexSettings,
  SearchInfrastructureStatus,
  SearchIndexStatus,
  SearchIndexRebuildResult,
  SearchInfraEntityType,
  AdminApiError,
} from '@/lib/adminApi';

const ENTITY_LABELS: Record<SearchInfraEntityType, string> = {
  emoji: 'Emoji',
  category: 'Category',
  topic: 'Topic',
  article: 'Article',
};

type OperationState =
  | { kind: 'idle' }
  | { kind: 'loading'; label: string }
  | { kind: 'success'; message: string }
  | { kind: 'error'; message: string };

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

export default function AdminSearchInfrastructurePage() {
  const [infra, setInfra] = useState<SearchInfrastructureStatus | null>(null);
  const [index, setIndex] = useState<SearchIndexStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [op, setOp] = useState<OperationState>({ kind: 'idle' });
  const [lastResult, setLastResult] = useState<SearchIndexRebuildResult | null>(null);

  const refresh = useCallback(async () => {
    try {
      const [infraRes, indexRes] = await Promise.all([
        getSearchInfrastructureStatus(),
        getSearchIndexStatus(),
      ]);
      setInfra(infraRes);
      setIndex(indexRes);
      setError('');
    } catch (err) {
      setError(
        err instanceof AdminApiError ? err.message || '加载失败' : '加载失败',
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const [infraRes, indexRes] = await Promise.all([
          getSearchInfrastructureStatus(),
          getSearchIndexStatus(),
        ]);
        if (!active) return;
        setInfra(infraRes);
        setIndex(indexRes);
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

  async function runRebuild(entityType: 'all' | SearchInfraEntityType, label: string) {
    setOp({ kind: 'loading', label });
    setLastResult(null);
    try {
      const data = await postSearchIndexRebuild(entityType);
      setLastResult(data);
      setOp({
        kind: 'success',
        message: `重建完成：${label} 共索引 ${data.totalIndexed} 条文档。`,
      });
      await refresh();
    } catch (err) {
      setOp({
        kind: 'error',
        message:
          err instanceof AdminApiError
            ? `操作失败（${err.status}）：${err.message || '无权限或 Meilisearch 未配置'}`
            : '操作失败',
      });
    }
  }

  async function runApplySettings() {
    setOp({ kind: 'loading', label: '应用索引设置' });
    try {
      const data = await postSearchIndexSettings();
      setOp({
        kind: 'success',
        message: `索引设置已应用（${data.searchableAttributes.length} 个可搜索字段，${data.filterableAttributes.length} 个可过滤字段）。`,
      });
      await refresh();
    } catch (err) {
      setOp({
        kind: 'error',
        message:
          err instanceof AdminApiError
            ? `操作失败（${err.status}）：${err.message || '无权限或 Meilisearch 未配置'}`
            : '操作失败',
      });
    }
  }

  if (loading) {
    return <div className="text-gray-500">加载中…</div>;
  }

  if (error && !infra) {
    return (
      <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded px-3 py-2">
        {error}
      </div>
    );
  }

  if (!infra) return null;

  return (
    <div>
      <div className="mb-4">
        <h1 className="text-2xl font-bold mb-1">🔍 搜索基础设施</h1>
        <p className="text-gray-500 text-sm">
          Phase 6B Meilisearch 接入状态与索引管理。当前 search provider：
          <span className="font-semibold">{infra.currentProvider}</span>；
          fallback：<span className="font-semibold">{infra.fallbackProvider}</span>。
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        <div className="bg-white rounded-lg border p-4">
          <h2 className="font-semibold text-gray-800 mb-3">Provider 状态</h2>
          <Field
            label="当前搜索 Provider"
            value={
              <StatusBadge
                ok={infra.currentProvider === 'database'}
                label={infra.currentProvider}
              />
            }
          />
          <Field label="Fallback Provider" value={<span>{infra.fallbackProvider}</span>} />
          <Field
            label="Meilisearch 是否已配置"
            value={
              <StatusBadge ok={infra.meilisearchConfigured} label={infra.meilisearchConfigured ? '已配置' : '未配置'} />
            }
          />
          <Field
            label="Meilisearch 是否可连接"
            value={
              <StatusBadge ok={infra.meilisearchReachable} label={infra.meilisearchReachable ? '可连接' : '不可连接'} />
            }
          />
          <Field
            label="Meilisearch 是否启用"
            value={
              <StatusBadge ok={infra.meilisearchEnabled} label={infra.meilisearchEnabled ? '已启用' : '未启用'} />
            }
          />
        </div>

        <div className="bg-white rounded-lg border p-4">
          <h2 className="font-semibold text-gray-800 mb-3">索引状态</h2>
          <Field label="索引名 (indexName)" value={<span>{infra.indexName || '—'}</span>} />
          <Field
            label="索引就绪 (indexReady)"
            value={<StatusBadge ok={infra.indexReady} label={infra.indexReady ? '已就绪' : '未就绪'} />}
          />
          <Field
            label="文档数量 (documentCount)"
            value={<span>{infra.documentCount}</span>}
          />
          <Field label="最近索引时间 (lastIndexedAt)" value={<span>{infra.lastIndexedAt ?? '—'}</span>} />
          <Field
            label="计划索引实体数"
            value={<span>{infra.plannedEntities.length}</span>}
          />
        </div>
      </div>

      {index && (
        <div className="bg-white rounded-lg border p-4 mb-6">
          <h2 className="font-semibold text-gray-800 mb-3">索引实时探测</h2>
          <Field
            label="索引是否存在"
            value={<StatusBadge ok={index.exists} label={index.exists ? '存在' : '不存在'} />}
          />
          <Field
            label="设置是否已应用"
            value={
              <StatusBadge ok={index.settingsConfigured} label={index.settingsConfigured ? '已应用' : '未应用'} />
            }
          />
          <Field label="可搜索字段" value={<span>{index.searchableAttributes.join(', ') || '—'}</span>} />
          <Field label="可过滤字段" value={<span>{index.filterableAttributes.join(', ') || '—'}</span>} />
          <Field label="可排序字段" value={<span>{index.sortableAttributes.join(', ') || '—'}</span>} />
          <Field label="最近探测" value={<span>{index.lastCheckedAt}</span>} />
        </div>
      )}

      <div className="bg-white rounded-lg border p-4 mb-6">
        <h2 className="font-semibold text-gray-800 mb-3">索引操作</h2>
        <p className="text-xs text-gray-500 mb-3">
          仅索引 published 内容（emoji / category / topic / article）。重建幂等，可重复执行。
        </p>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            disabled={op.kind === 'loading'}
            onClick={() => runRebuild('all', '全部')}
            className="px-3 py-1.5 rounded bg-blue-600 text-white text-sm font-medium disabled:opacity-50"
          >
            重建全部索引
          </button>
          {(Object.keys(ENTITY_LABELS) as SearchInfraEntityType[]).map((e) => (
            <button
              key={e}
              type="button"
              disabled={op.kind === 'loading'}
              onClick={() => runRebuild(e, ENTITY_LABELS[e])}
              className="px-3 py-1.5 rounded bg-white border border-gray-300 text-gray-700 text-sm font-medium disabled:opacity-50"
            >
              重建 {ENTITY_LABELS[e]}
            </button>
          ))}
          <button
            type="button"
            disabled={op.kind === 'loading'}
            onClick={runApplySettings}
            className="px-3 py-1.5 rounded bg-gray-800 text-white text-sm font-medium disabled:opacity-50"
          >
            应用索引设置
          </button>
        </div>

        {op.kind === 'loading' && (
          <div className="mt-3 text-sm text-blue-600">{op.label} 进行中…</div>
        )}
        {op.kind === 'success' && (
          <div className="mt-3 text-sm text-green-700 bg-green-50 border border-green-200 rounded px-3 py-2">
            {op.message}
          </div>
        )}
        {op.kind === 'error' && (
          <div className="mt-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded px-3 py-2">
            {op.message}
          </div>
        )}

        {lastResult && (
          <div className="mt-4">
            <h3 className="text-sm font-semibold text-gray-700 mb-2">上次重建结果</h3>
            <table className="w-full text-sm border">
              <thead>
                <tr className="bg-gray-50">
                  <th className="text-left px-2 py-1">实体</th>
                  <th className="text-right px-2 py-1">索引数</th>
                  <th className="text-right px-2 py-1">跳过</th>
                </tr>
              </thead>
              <tbody>
                {lastResult.perEntity.map((r) => (
                  <tr key={r.type} className="border-t">
                    <td className="px-2 py-1">{ENTITY_LABELS[r.type] ?? r.type}</td>
                    <td className="px-2 py-1 text-right">{r.indexed}</td>
                    <td className="px-2 py-1 text-right">{r.skipped}</td>
                  </tr>
                ))}
                <tr className="border-t font-semibold">
                  <td className="px-2 py-1">合计</td>
                  <td className="px-2 py-1 text-right">{lastResult.totalIndexed}</td>
                  <td className="px-2 py-1 text-right">—</td>
                </tr>
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="bg-white rounded-lg border p-4 mb-6">
        <h2 className="font-semibold text-gray-800 mb-3">计划索引实体</h2>
        <div className="flex flex-wrap gap-2">
          {infra.plannedEntities.map((e) => (
            <span
              key={e}
              className="inline-block px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-sm font-medium"
            >
              {ENTITY_LABELS[e] ?? e}
            </span>
          ))}
          <span className="inline-block px-3 py-1 rounded-full bg-gray-100 text-gray-500 text-sm">
            Asset（不纳入）
          </span>
        </div>
      </div>

      <div className="bg-white rounded-lg border p-4 mb-6">
        <h2 className="font-semibold text-gray-800 mb-3">风险边界</h2>
        <ul className="list-disc pl-5 space-y-1 text-sm text-gray-600">
          <li>不索引 draft / archived 内容（仅 published 进入外部索引）。</li>
          <li>不索引 /admin 及任何 admin-only 字段。</li>
          <li>不索引 Asset（避免版权 / 授权 / 重复内容风险）。</li>
          <li>不索引敏感数据（无 passwordHash、无 JWT_SECRET、无明文敏感 IP）。</li>
          <li>不泄露 Meilisearch API Key（本页与 API 响应均不含密钥）。</li>
          <li>SEARCH_PROVIDER=database 时系统完全回到数据库搜索；Meilisearch 不可用时自动 fallback。</li>
          <li>多语言搜索带 locale filter（/zh 默认 zh，/en 默认 en）。</li>
        </ul>
      </div>

      {infra.notes && (
        <div className="bg-gray-50 border rounded p-4 text-sm text-gray-600 leading-relaxed">
          {infra.notes}
        </div>
      )}
    </div>
  );
}
