'use client';

import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@/components/AuthProvider';
import {
  getSearchAnalyticsOverview,
  getSearchAnalyticsQueries,
  getSearchAnalyticsNoResults,
  getSearchAnalyticsProviderHealth,
  postSearchTuningApply,
  SearchAnalyticsOverview,
  SearchAnalyticsQueryItem,
  SearchAnalyticsNoResultItem,
  SearchAnalyticsProviderHealth,
  SearchAnalyticsPaginationMeta,
  SearchAnalyticsTuningSuggestion,
  AdminApiError,
} from '@/lib/adminApi';

const LOCALE_OPTIONS = [
  { value: 'all', label: '全部语言' },
  { value: 'zh', label: '中文 (zh)' },
  { value: 'en', label: '英文 (en)' },
];

const HAS_RESULTS_OPTIONS = [
  { value: 'all', label: '全部' },
  { value: 'true', label: '有结果' },
  { value: 'false', label: '仅零结果' },
];

function fmtDate(value: string | null): string {
  if (!value) return '—';
  const d = new Date(value);
  if (isNaN(d.getTime())) return '—';
  return d.toLocaleString('zh-CN', { hour12: false });
}

function num(value: number | null | undefined): string {
  if (value === null || value === undefined) return '—';
  return String(value);
}

function pct(value: number): string {
  return `${(value * 100).toFixed(1)}%`;
}

function SummaryCard({ label, value, sub }: { label: string; value: string | number; sub?: string }) {
  return (
    <div className="bg-white rounded-lg border p-4">
      <div className="text-sm text-gray-500 mb-1">{label}</div>
      <div className="text-2xl font-semibold text-gray-800">{value}</div>
      {sub && <div className="text-xs text-gray-400 mt-1">{sub}</div>}
    </div>
  );
}

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

function PriorityBadge({ priority }: { priority: SearchAnalyticsTuningSuggestion['priority'] }) {
  const cls =
    priority === 'high'
      ? 'bg-red-100 text-red-700'
      : priority === 'medium'
        ? 'bg-amber-100 text-amber-700'
        : 'bg-gray-100 text-gray-600';
  return <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${cls}`}>{priority}</span>;
}

function Field({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex justify-between items-center py-1.5 border-b last:border-0">
      <span className="text-gray-500 text-sm">{label}</span>
      <span className="text-gray-800 text-sm font-medium text-right">{value}</span>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-lg border p-4 mb-6">
      <h2 className="font-semibold text-gray-800 mb-3">{title}</h2>
      {children}
    </div>
  );
}

export default function AdminSearchAnalyticsPage() {
  const { admin } = useAuth();
  const isSuperAdmin = admin?.role === 'super_admin';

  const [overview, setOverview] = useState<SearchAnalyticsOverview | null>(null);
  const [providerHealth, setProviderHealth] = useState<SearchAnalyticsProviderHealth | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // ── Queries table state ──
  const [queryItems, setQueryItems] = useState<SearchAnalyticsQueryItem[]>([]);
  const [queryMeta, setQueryMeta] = useState<SearchAnalyticsPaginationMeta>({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 1,
  });
  const [qQ, setQQ] = useState('');
  const [qLocale, setQLocale] = useState('all');
  const [qHasResults, setQHasResults] = useState('all');
  const [qPage, setQPage] = useState(1);

  // ── No-results table state ──
  const [noResultItems, setNoResultItems] = useState<SearchAnalyticsNoResultItem[]>([]);
  const [noResultMeta, setNoResultMeta] = useState<SearchAnalyticsPaginationMeta>({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 1,
  });
  const [nLocale, setNLocale] = useState('all');
  const [nPage, setNPage] = useState(1);

  const [tuning, setTuning] = useState<{ kind: 'idle' | 'loading' | 'success' | 'error'; message: string }>({
    kind: 'idle',
    message: '',
  });

  const refreshOverview = useCallback(async () => {
    try {
      const [ov, ph] = await Promise.all([
        getSearchAnalyticsOverview(),
        getSearchAnalyticsProviderHealth(),
      ]);
      setOverview(ov);
      setProviderHealth(ph);
      setError('');
    } catch (err) {
      setError(err instanceof AdminApiError ? err.message || '加载失败' : '加载失败');
    }
  }, []);

  const loadQueries = useCallback(async () => {
    try {
      const res = await getSearchAnalyticsQueries({
        page: qPage,
        limit: 20,
        q: qQ.trim() || undefined,
        locale: qLocale as 'zh' | 'en' | 'all',
        hasResults: qHasResults === 'all' ? undefined : (qHasResults as 'true' | 'false'),
      });
      setQueryItems(res.data);
      setQueryMeta(res.meta);
    } catch {
      // non-fatal; table area shows empty
    }
  }, [qPage, qQ, qLocale, qHasResults]);

  const loadNoResults = useCallback(async () => {
    try {
      const res = await getSearchAnalyticsNoResults({
        page: nPage,
        limit: 20,
        locale: nLocale as 'zh' | 'en' | 'all',
      });
      setNoResultItems(res.data);
      setNoResultMeta(res.meta);
    } catch {
      // non-fatal
    }
  }, [nPage, nLocale]);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const [ov, ph] = await Promise.all([
          getSearchAnalyticsOverview(),
          getSearchAnalyticsProviderHealth(),
        ]);
        if (!active) return;
        setOverview(ov);
        setProviderHealth(ph);
      } catch (err) {
        if (active) setError(err instanceof AdminApiError ? err.message || '加载失败' : '加载失败');
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    loadQueries();
  }, [loadQueries]);

  useEffect(() => {
    loadNoResults();
  }, [loadNoResults]);

  const onQuerySearch = (e: React.FormEvent) => {
    e.preventDefault();
    setQPage(1);
    setTimeout(loadQueries, 0);
  };

  const changeQPage = (next: number) => {
    setQPage(next);
    setTimeout(loadQueries, 0);
  };

  const changeNPage = (next: number) => {
    setNPage(next);
    setTimeout(loadNoResults, 0);
  };

  const onApplyTuning = async () => {
    setTuning({ kind: 'loading', message: '' });
    try {
      const res = await postSearchTuningApply();
      setTuning({
        kind: res.applied ? 'success' : 'error',
        message: res.message,
      });
      await refreshOverview();
    } catch (err) {
      setTuning({
        kind: 'error',
        message:
          err instanceof AdminApiError
            ? `操作失败（${err.status}）：${err.message || '无权限或 Meilisearch 未配置'}`
            : '操作失败',
      });
    }
  };

  if (loading) return <div className="text-gray-500">加载中…</div>;
  if (error && !overview) {
    return (
      <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded px-3 py-2">
        {error}
      </div>
    );
  }

  return (
    <div>
      <div className="mb-4">
        <h1 className="text-2xl font-bold mb-1">📊 搜索分析</h1>
        <p className="text-gray-500 text-sm">
          Phase 6E 搜索分析与基础调优。基于搜索日志（search_logs）的只读聚合与规则化建议（不使用 AI）。
          仅展示不可逆的粗粒度信息，绝不返回明文 IP / API Key。
        </p>
      </div>

      {/* Overview summary cards */}
      {overview && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <SummaryCard label="总搜索数" value={overview.totalSearches} />
          <SummaryCard label="今日搜索" value={overview.todaySearches} />
          <SummaryCard label="零结果搜索" value={overview.zeroResultSearches} sub={`零结果率 ${pct(overview.zeroResultRate)}`} />
          <SummaryCard
            label="语言分布 (zh/en/其他)"
            value={overview.searchesByLocale.zh + overview.searchesByLocale.en + overview.searchesByLocale.other}
            sub={`zh ${overview.searchesByLocale.zh} · en ${overview.searchesByLocale.en} · 其他 ${overview.searchesByLocale.other}`}
          />
        </div>
      )}

      {/* Locale + provider support */}
      {overview && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
          <Section title="语言分布">
            <Field label="中文 (zh)" value={num(overview.searchesByLocale.zh)} />
            <Field label="英文 (en)" value={num(overview.searchesByLocale.en)} />
            <Field label="其他 / 未标注" value={num(overview.searchesByLocale.other)} />
          </Section>
          <Section title="Provider 占比">
            {overview.searchesByProvider.supported ? (
              <>
                <Field label="database" value={num(overview.searchesByProvider.database)} />
                <Field label="meilisearch" value={num(overview.searchesByProvider.meilisearch)} />
              </>
            ) : (
              <p className="text-sm text-gray-500 leading-relaxed">
                {overview.searchesByProvider.note}
              </p>
            )}
          </Section>
        </div>
      )}

      {/* Top queries */}
      {overview && overview.topQueries.length > 0 && (
        <Section title="热门搜索词 (Top 10)">
          <div className="flex flex-wrap gap-2">
            {overview.topQueries.map((t) => (
              <span
                key={t.query}
                className="inline-flex items-center gap-1 bg-gray-100 rounded-full px-3 py-1 text-sm"
              >
                {t.query} <span className="text-gray-400">· {t.count}</span>
              </span>
            ))}
          </div>
        </Section>
      )}

      {/* Top zero-result queries */}
      {overview && overview.topZeroResultQueries.length > 0 && (
        <Section title="热门零结果词 (Top 10)">
          <div className="flex flex-wrap gap-2">
            {overview.topZeroResultQueries.map((t) => (
              <span
                key={t.query}
                className="inline-flex items-center gap-1 bg-red-50 text-red-700 rounded-full px-3 py-1 text-sm"
              >
                {t.query} <span className="opacity-70">· {t.count}</span>
              </span>
            ))}
          </div>
        </Section>
      )}

      {/* Recent searches (NO ipHash / userAgent / plaintext IP) */}
      {overview && (
        <Section title="最近搜索 (最新 10 条)">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-600">
                <tr>
                  <th className="text-left px-3 py-2 font-medium">关键词</th>
                  <th className="text-left px-3 py-2 font-medium">语言</th>
                  <th className="text-left px-3 py-2 font-medium">结果数</th>
                  <th className="text-left px-3 py-2 font-medium">国家</th>
                  <th className="text-left px-3 py-2 font-medium">时间</th>
                </tr>
              </thead>
              <tbody>
                {overview.recentSearches.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-3 py-10 text-center text-gray-400">
                      暂无搜索日志
                    </td>
                  </tr>
                ) : (
                  overview.recentSearches.map((it) => (
                    <tr key={it.id} className="border-t">
                      <td className="px-3 py-2">{it.query ?? '—'}</td>
                      <td className="px-3 py-2">{it.locale ?? '—'}</td>
                      <td className="px-3 py-2">{num(it.resultCount)}</td>
                      <td className="px-3 py-2">{it.country ?? '—'}</td>
                      <td className="px-3 py-2 whitespace-nowrap">{fmtDate(it.createdAt)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          <p className="text-xs text-gray-400 mt-3">说明：本表不展示明文 IP、ipHash 或 User Agent。</p>
        </Section>
      )}

      {/* Provider health summary */}
      {providerHealth && (
        <Section title="Meilisearch / Provider 状态">
          <Field
            label="当前搜索 Provider"
            value={
              <StatusBadge ok={providerHealth.currentProvider === 'database'} label={providerHealth.currentProvider} />
            }
          />
          <Field label="Fallback Provider" value={<span>{providerHealth.fallbackProvider}</span>} />
          <Field
            label="Meilisearch 是否已配置"
            value={<StatusBadge ok={providerHealth.meilisearchConfigured} label={providerHealth.meilisearchConfigured ? '已配置' : '未配置'} />}
          />
          <Field
            label="Meilisearch 是否可连接"
            value={<StatusBadge ok={providerHealth.meilisearchReachable} label={providerHealth.meilisearchReachable ? '可连接' : '不可连接'} />}
          />
          <Field
            label="索引是否就绪"
            value={<StatusBadge ok={providerHealth.indexReady} label={providerHealth.indexReady ? '已就绪' : '未就绪'} />}
          />
          <Field label="文档数量" value={<span>{providerHealth.documentCount}</span>} />
          <Field
            label="Fallback 建议"
            value={
              <StatusBadge ok={!providerHealth.fallbackRecommended} label={providerHealth.fallbackRecommended ? '建议保持 fallback' : '无需 fallback'} />
            }
          />
          <ul className="list-disc pl-5 space-y-1 text-sm text-gray-600 mt-2">
            {providerHealth.notes.map((n, i) => (
              <li key={i}>{n}</li>
            ))}
          </ul>
        </Section>
      )}

      {/* Tuning suggestions */}
      {overview && overview.tuningSuggestions.length > 0 && (
        <Section title="基础调优建议 (规则生成，非 AI)">
          <div className="space-y-3">
            {overview.tuningSuggestions.map((s, i) => (
              <div key={i} className="border rounded p-3">
                <div className="flex items-center gap-2 mb-1">
                  <PriorityBadge priority={s.priority} />
                  <span className="font-medium text-gray-800">{s.title}</span>
                  <span className="text-xs text-gray-400">· {s.category}</span>
                </div>
                <p className="text-sm text-gray-600 mb-1">{s.detail}</p>
                <p className="text-sm text-blue-700">{s.suggestedAction}</p>
              </div>
            ))}
          </div>
        </Section>
      )}

      {/* Conservative tuning apply (super_admin only) */}
      {isSuperAdmin && (
        <Section title="保守调优应用 (仅 super_admin)">
          <p className="text-xs text-gray-500 mb-3">
            仅重新应用 Phase 6B 既定的保守 Meilisearch 设置（可搜索 / 可过滤 / 可排序字段与默认 ranking 规则），
            不修改核心 ranking 逻辑，不自动改写任何内容。操作会写入 audit_logs（search.tuning_settings_update）。
          </p>
          <button
            type="button"
            disabled={tuning.kind === 'loading'}
            onClick={onApplyTuning}
            className="px-3 py-1.5 rounded bg-gray-800 text-white text-sm font-medium disabled:opacity-50"
          >
            应用保守调优设置
          </button>
          {tuning.kind === 'loading' && <div className="mt-3 text-sm text-blue-600">进行中…</div>}
          {tuning.kind === 'success' && (
            <div className="mt-3 text-sm text-green-700 bg-green-50 border border-green-200 rounded px-3 py-2">
              {tuning.message}
            </div>
          )}
          {tuning.kind === 'error' && (
            <div className="mt-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded px-3 py-2">
              {tuning.message}
            </div>
          )}
        </Section>
      )}

      {/* Queries analytics table */}
      <Section title="搜索词分析 (按 关键词 + 语言 聚合)">
        <form
          onSubmit={onQuerySearch}
          className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-4"
        >
          <div>
            <label className="block text-xs text-gray-500 mb-1">关键词</label>
            <input
              className="w-full border rounded px-2 py-1.5 text-sm"
              value={qQ}
              onChange={(e) => setQQ(e.target.value)}
              placeholder="搜索 query"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">语言</label>
            <select
              className="w-full border rounded px-2 py-1.5 text-sm"
              value={qLocale}
              onChange={(e) => setQLocale(e.target.value)}
            >
              {LOCALE_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">结果情况</label>
            <select
              className="w-full border rounded px-2 py-1.5 text-sm"
              value={qHasResults}
              onChange={(e) => setQHasResults(e.target.value)}
            >
              {HAS_RESULTS_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-end">
            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded px-3 py-1.5 text-sm"
            >
              筛选
            </button>
          </div>
        </form>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-600">
              <tr>
                <th className="text-left px-3 py-2 font-medium">关键词</th>
                <th className="text-left px-3 py-2 font-medium">语言</th>
                <th className="text-right px-3 py-2 font-medium">次数</th>
                <th className="text-right px-3 py-2 font-medium">平均结果数</th>
                <th className="text-right px-3 py-2 font-medium">零结果次数</th>
                <th className="text-left px-3 py-2 font-medium">最近搜索</th>
              </tr>
            </thead>
            <tbody>
              {queryItems.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-3 py-10 text-center text-gray-400">
                    暂无数据
                  </td>
                </tr>
              ) : (
                queryItems.map((it, i) => (
                  <tr key={`${it.query}-${it.locale}-${i}`} className="border-t">
                    <td className="px-3 py-2">{it.query ?? '—'}</td>
                    <td className="px-3 py-2">{it.locale ?? '—'}</td>
                    <td className="px-3 py-2 text-right">{num(it.count)}</td>
                    <td className="px-3 py-2 text-right">{num(it.avgResultCount)}</td>
                    <td className="px-3 py-2 text-right">{num(it.zeroResultCount)}</td>
                    <td className="px-3 py-2 whitespace-nowrap">{fmtDate(it.lastSearchedAt)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between px-1 py-3 border-t text-sm text-gray-500">
          <span>
            共 {queryMeta.total} 条 · 第 {queryMeta.page} / {queryMeta.totalPages} 页
          </span>
          <div className="flex gap-2">
            <button
              disabled={queryMeta.page <= 1}
              onClick={() => changeQPage(queryMeta.page - 1)}
              className="px-3 py-1 border rounded disabled:opacity-40"
            >
              上一页
            </button>
            <button
              disabled={queryMeta.page >= queryMeta.totalPages}
              onClick={() => changeQPage(queryMeta.page + 1)}
              className="px-3 py-1 border rounded disabled:opacity-40"
            >
              下一页
            </button>
          </div>
        </div>
      </Section>

      {/* No-result analytics table */}
      <Section title="零结果搜索分析">
        <form className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
          <div>
            <label className="block text-xs text-gray-500 mb-1">语言</label>
            <select
              className="w-full border rounded px-2 py-1.5 text-sm"
              value={nLocale}
              onChange={(e) => {
                setNLocale(e.target.value);
                setNPage(1);
                setTimeout(loadNoResults, 0);
              }}
            >
              {LOCALE_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>
        </form>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-600">
              <tr>
                <th className="text-left px-3 py-2 font-medium">关键词</th>
                <th className="text-left px-3 py-2 font-medium">语言</th>
                <th className="text-right px-3 py-2 font-medium">次数</th>
                <th className="text-left px-3 py-2 font-medium">最近搜索</th>
                <th className="text-left px-3 py-2 font-medium">建议动作</th>
              </tr>
            </thead>
            <tbody>
              {noResultItems.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-3 py-10 text-center text-gray-400">
                    暂无零结果搜索
                  </td>
                </tr>
              ) : (
                noResultItems.map((it, i) => (
                  <tr key={`${it.query}-${it.locale}-${i}`} className="border-t">
                    <td className="px-3 py-2">{it.query ?? '—'}</td>
                    <td className="px-3 py-2">{it.locale ?? '—'}</td>
                    <td className="px-3 py-2 text-right">{num(it.count)}</td>
                    <td className="px-3 py-2 whitespace-nowrap">{fmtDate(it.lastSearchedAt)}</td>
                    <td className="px-3 py-2 text-xs text-gray-600 max-w-md">{it.suggestedAction}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between px-1 py-3 border-t text-sm text-gray-500">
          <span>
            共 {noResultMeta.total} 条 · 第 {noResultMeta.page} / {noResultMeta.totalPages} 页
          </span>
          <div className="flex gap-2">
            <button
              disabled={noResultMeta.page <= 1}
              onClick={() => changeNPage(noResultMeta.page - 1)}
              className="px-3 py-1 border rounded disabled:opacity-40"
            >
              上一页
            </button>
            <button
              disabled={noResultMeta.page >= noResultMeta.totalPages}
              onClick={() => changeNPage(noResultMeta.page + 1)}
              className="px-3 py-1 border rounded disabled:opacity-40"
            >
              下一页
            </button>
          </div>
        </div>
      </Section>

      {/* Search-after-copy correlation note */}
      {overview && (
        <Section title="搜索后复制关联">
          {overview.topCopiedAfterSearch.supported ? (
            <p className="text-sm text-gray-600">已支持：{overview.topCopiedAfterSearch.emojis.length} 个表情的复制关联。</p>
          ) : (
            <p className="text-sm text-gray-500 leading-relaxed">
              {overview.topCopiedAfterSearch.note}
            </p>
          )}
        </Section>
      )}

      <p className="text-xs text-gray-400 mt-6">
        说明：本页为后台分析视图，noindex / nofollow。所有数据均为只读聚合；搜索日志不含明文 IP，
        API 响应不返回 passwordHash / JWT_SECRET / Meilisearch API Key。调优建议为规则生成，不使用 AI，
        不自动改写内容。
      </p>
    </div>
  );
}
