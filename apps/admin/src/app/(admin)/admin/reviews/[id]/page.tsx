'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  getReview,
  updateReviewStatus,
  ReviewDetail,
  AdminApiError,
  SubmissionStatus,
  SUBMISSION_TYPE_LABELS,
  SUBMISSION_STATUS_LABELS,
  SUBMISSION_STATUS_BADGE,
} from '@/lib/adminApi';

const STATUS_ACTIONS: { value: SubmissionStatus; label: string; cls: string }[] = [
  { value: 'pending', label: '待审核', cls: 'bg-amber-600 hover:bg-amber-700' },
  { value: 'approved', label: '通过', cls: 'bg-green-600 hover:bg-green-700' },
  { value: 'rejected', label: '拒绝', cls: 'bg-red-600 hover:bg-red-700' },
  { value: 'spam', label: '垃圾', cls: 'bg-gray-600 hover:bg-gray-700' },
];

function fmtDate(value: string): string {
  const d = new Date(value);
  if (isNaN(d.getTime())) return '—';
  return d.toLocaleString('zh-CN', { hour12: false });
}

export default function AdminReviewDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const id = params.id;

  const [detail, setDetail] = useState<ReviewDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [adminNote, setAdminNote] = useState('');
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [saveOk, setSaveOk] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    setSaveOk(false);
    try {
      const res = await getReview(id);
      setDetail(res);
      setAdminNote(res.adminNote ?? '');
    } catch (err) {
      setError(err instanceof AdminApiError ? err.message || '加载失败' : '加载失败');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  const onStatusChange = async (status: SubmissionStatus) => {
    setSaving(true);
    setSaveError('');
    setSaveOk(false);
    try {
      const res = await updateReviewStatus(id, status, adminNote);
      setDetail(res);
      setSaveOk(true);
      setTimeout(() => router.refresh(), 300);
    } catch (err) {
      if (err instanceof AdminApiError && err.status === 403) {
        setSaveError('当前角色无权审核（需要 super_admin 或 reviewer）');
      } else {
        setSaveError(err instanceof AdminApiError ? err.message || '操作失败' : '操作失败');
      }
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="text-gray-500">加载中…</div>;
  if (error)
    return (
      <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded px-3 py-2">
        {error}
      </div>
    );
  if (!detail) return null;

  return (
    <div>
      <div className="mb-4">
        <Link href="/admin/reviews" className="text-sm text-blue-600 hover:underline">
          ← 返回审核列表
        </Link>
        <h1 className="text-2xl font-bold mt-2 mb-1">审核详情</h1>
        <p className="text-gray-500 text-sm">提交 ID：{detail.id}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white rounded-lg border p-4 space-y-3">
          <div>
            <span className="text-xs text-gray-400">表情</span>
            <div className="text-3xl">{detail.emoji?.emojiChar ?? '—'}</div>
            {detail.emoji && (
              <div className="text-sm text-gray-500">
                {detail.emoji.name ?? '—'} · /{detail.emoji.slug}
              </div>
            )}
          </div>
          <Field label="类型" value={SUBMISSION_TYPE_LABELS[detail.type] ?? detail.type} />
          <Field label="语言" value={detail.locale} />
          <Field
            label="状态"
            value={
              <span
                className={`inline-block rounded-full px-2 py-0.5 text-xs ${
                  SUBMISSION_STATUS_BADGE[detail.status] ?? 'bg-gray-100'
                }`}
              >
                {SUBMISSION_STATUS_LABELS[detail.status] ?? detail.status}
              </span>
            }
          />
          <Field label="提交者" value={detail.userName ?? '—'} />
          <Field label="邮箱" value={detail.userEmail ?? '—'} />
          <Field label="创建时间" value={fmtDate(detail.createdAt)} />
          <Field label="更新时间" value={fmtDate(detail.updatedAt)} />
        </div>

        <div className="bg-white rounded-lg border p-4 space-y-4">
          <div>
            <span className="text-xs text-gray-400">提交内容</span>
            <p className="mt-1 whitespace-pre-wrap bg-gray-50 rounded p-3 text-sm">
              {detail.content ?? '—'}
            </p>
          </div>

          <div>
            <label className="block text-xs text-gray-500 mb-1">审核备注 (adminNote)</label>
            <textarea
              className="w-full border rounded px-2 py-1.5 text-sm"
              rows={3}
              value={adminNote}
              onChange={(e) => setAdminNote(e.target.value)}
              placeholder="可选：审核备注"
            />
          </div>

          <div>
            <span className="block text-xs text-gray-500 mb-2">切换审核状态</span>
            <div className="flex flex-wrap gap-2">
              {STATUS_ACTIONS.map((a) => (
                <button
                  key={a.value}
                  disabled={saving || detail.status === a.value}
                  onClick={() => onStatusChange(a.value)}
                  className={`px-3 py-1.5 rounded text-white text-sm disabled:opacity-40 ${a.cls}`}
                >
                  {a.label}
                  {detail.status === a.value ? '（当前）' : ''}
                </button>
              ))}
            </div>
          </div>

          {saveError && (
            <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded px-3 py-2">
              {saveError}
            </div>
          )}
          {saveOk && !saveError && (
            <div className="text-sm text-green-600 bg-green-50 border border-green-200 rounded px-3 py-2">
              审核状态已更新，已写入 audit_logs。
            </div>
          )}
        </div>
      </div>

      <p className="text-xs text-gray-400 mt-6">
        说明：审核写操作需要 super_admin 或 reviewer 角色；其余运营角色可查看详情但无法切换状态（会返回 403）。
      </p>
    </div>
  );
}

function Field({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex justify-between text-sm">
      <span className="text-gray-400">{label}</span>
      <span className="text-gray-800 text-right">{value}</span>
    </div>
  );
}
