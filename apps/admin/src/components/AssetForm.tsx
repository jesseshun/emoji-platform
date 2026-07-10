'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/components/AuthProvider';
import {
  createAsset,
  updateAsset,
  updateAssetStatus,
  deleteAsset,
  getEmojiOptions,
  EmojiOption,
  AdminAssetDetail,
  AssetProvider,
  AssetFileType,
  AssetStatus,
  AdminApiError,
  ASSET_PROVIDERS,
  ASSET_FILE_TYPES,
} from '@/lib/adminApi';

interface AssetFormState {
  emojiId: string;
  provider: AssetProvider;
  fileType: AssetFileType;
  fileUrl: string;
  localPath: string;
  width: string;
  height: string;
  licenseName: string;
  licenseUrl: string;
  attribution: string;
  isDownloadable: boolean;
  status: AssetStatus;
}

const EMPTY_STATE: AssetFormState = {
  emojiId: '',
  provider: 'noto',
  fileType: 'svg',
  fileUrl: '',
  localPath: '',
  width: '',
  height: '',
  licenseName: '',
  licenseUrl: '',
  attribution: '',
  isDownloadable: false,
  status: 'draft',
};

const PROVIDER_LICENSE_HINT: Record<string, string> = {
  noto: 'SIL Open Font License 1.1（如 Google Noto Emoji）',
  openmoji: 'CC BY-SA 4.0（OpenMoji Project）',
  twemoji: 'CC BY 4.0（Twemoji）',
  custom: '自定义来源：必须填写 licenseName 与 attribution',
};

function stateFromDetail(d: AdminAssetDetail): AssetFormState {
  return {
    emojiId: d.emojiId ?? '',
    provider: (d.provider as AssetProvider) ?? 'noto',
    fileType: (d.fileType as AssetFileType) ?? 'svg',
    fileUrl: d.fileUrl ?? '',
    localPath: d.localPath ?? '',
    width: d.width != null ? String(d.width) : '',
    height: d.height != null ? String(d.height) : '',
    licenseName: d.licenseName ?? '',
    licenseUrl: d.licenseUrl ?? '',
    attribution: d.attribution ?? '',
    isDownloadable: !!d.isDownloadable,
    status: (d.status as AssetStatus) ?? 'draft',
  };
}

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="block text-xs text-gray-500 mb-1">{label}</span>
      {children}
      {hint && <p className="text-xs text-gray-400 mt-1">{hint}</p>}
    </label>
  );
}

export function AssetForm({
  mode,
  assetId,
  initial,
}: {
  mode: 'create' | 'edit';
  assetId?: string;
  initial?: AdminAssetDetail | null;
}) {
  const router = useRouter();
  const { admin } = useAuth();
  const [state, setState] = useState<AssetFormState>(EMPTY_STATE);
  const [emojiOptions, setEmojiOptions] = useState<EmojiOption[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [statusBusy, setStatusBusy] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const canManage = admin?.role === 'super_admin' || admin?.role === 'editor';

  useEffect(() => {
    if (mode === 'edit' && initial) {
      setState(stateFromDetail(initial));
    }
  }, [mode, initial]);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const opts = await getEmojiOptions('zh');
        if (active) setEmojiOptions(opts);
      } catch {
        // Non-fatal: the emoji selector simply stays empty.
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  const update = (field: keyof AssetFormState, value: string | boolean) =>
    setState((prev) => ({ ...prev, [field]: value }));

  const selectedEmoji = useMemo(
    () => emojiOptions.find((e) => e.id === state.emojiId) ?? null,
    [emojiOptions, state.emojiId],
  );

  // Live license-rule flags (drive both blocking errors and soft hints).
  const needLicenseName = state.isDownloadable || state.provider === 'custom';
  const needAttribution = state.provider === 'custom';

  const licenseHint = useMemo(() => {
    if (!state.licenseUrl.trim() && needLicenseName) {
      return '建议填写授权链接（licenseUrl），便于前台注明出处。';
    }
    if (!state.licenseUrl.trim()) {
      return '建议填写授权链接（licenseUrl）。';
    }
    return '';
  }, [state.licenseUrl, needLicenseName]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!state.emojiId) {
      setError('请选择关联的 Emoji');
      return;
    }
    if (!state.fileUrl.trim() && !state.localPath.trim()) {
      setError('fileUrl 与 localPath 至少填写一项');
      return;
    }
    if (state.width.trim() && (!/^\d+$/.test(state.width.trim()) || parseInt(state.width, 10) <= 0)) {
      setError('width 必须是正整数');
      return;
    }
    if (state.height.trim() && (!/^\d+$/.test(state.height.trim()) || parseInt(state.height, 10) <= 0)) {
      setError('height 必须是正整数');
      return;
    }
    if (state.isDownloadable && !state.licenseName.trim()) {
      setError('当 isDownloadable = true 时，licenseName 为必填项');
      return;
    }
    if (state.provider === 'custom' && !state.licenseName.trim()) {
      setError('provider 为 custom 时，licenseName 为必填项');
      return;
    }
    if (state.provider === 'custom' && !state.attribution.trim()) {
      setError('provider 为 custom 时，attribution 为必填项');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        emojiId: state.emojiId,
        provider: state.provider,
        fileType: state.fileType,
        fileUrl: state.fileUrl.trim() || null,
        localPath: state.localPath.trim() || null,
        width: state.width.trim() ? parseInt(state.width, 10) : null,
        height: state.height.trim() ? parseInt(state.height, 10) : null,
        licenseName: state.licenseName.trim() || null,
        licenseUrl: state.licenseUrl.trim() || null,
        attribution: state.attribution.trim() || null,
        isDownloadable: state.isDownloadable,
        status: state.status,
      };

      if (mode === 'create') {
        const created = await createAsset(payload);
        setSuccess('创建成功，正在跳转…');
        router.push(`/admin/assets/${created.id}/edit`);
      } else if (assetId) {
        await updateAsset(assetId, payload);
        setSuccess('保存成功');
      }
    } catch (err) {
      if (err instanceof AdminApiError) {
        setError(err.message || '保存失败');
      } else {
        setError('保存失败，请稍后重试');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleQuickStatus = async (status: AssetStatus) => {
    if (!assetId) return;
    setStatusBusy(true);
    setError('');
    setSuccess('');
    try {
      await updateAssetStatus(assetId, status);
      setState((prev) => ({ ...prev, status }));
      setSuccess(`状态已切换为 ${status}`);
    } catch (err) {
      if (err instanceof AdminApiError) {
        setError(err.message || '状态切换失败');
      } else {
        setError('状态切换失败，请稍后重试');
      }
    } finally {
      setStatusBusy(false);
    }
  };

  const handleDelete = async () => {
    if (!assetId) return;
    if (!window.confirm('确定删除该 Asset 吗？此操作不可恢复。')) return;
    setDeleting(true);
    setError('');
    setSuccess('');
    try {
      await deleteAsset(assetId);
      router.push('/admin/assets');
    } catch (err) {
      if (err instanceof AdminApiError) {
        setError(err.message || '删除失败');
      } else {
        setError('删除失败，请稍后重试');
      }
      setDeleting(false);
    }
  };

  const inputCls =
    'w-full px-3 py-2 border rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500';

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">
          {mode === 'create' ? '🖼️ 新建素材 / 授权' : '编辑素材 / 授权'}
        </h1>
        <Link href="/admin/assets" className="text-sm text-blue-600 hover:underline">
          ← 返回列表
        </Link>
      </div>

      {!canManage && (
        <div className="text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded px-3 py-2 mb-3">
          当前角色（{admin?.role}）仅有只读权限，无法保存修改。
        </div>
      )}

      {error && (
        <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded px-3 py-2 mb-3">
          {error}
        </div>
      )}
      {success && (
        <div className="text-sm text-green-700 bg-green-50 border border-green-200 rounded px-3 py-2 mb-3">
          {success}
        </div>
      )}

      <div className="bg-white rounded-lg border p-5 mb-4">
        <p className="text-xs text-gray-500 mb-3">
          ⚠️ Emoji 字符本身与平台图片设计不是一回事。图片资源（如 Noto / OpenMoji / Twemoji 或自定义来源）必须遵守对应 provider 的开源许可证，并在授权链接与出处（attribution）中正确标注。
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="关联 Emoji *">
            <div className="flex gap-2 items-center">
              <select
                value={state.emojiId}
                onChange={(e) => update('emojiId', e.target.value)}
                className={inputCls}
              >
                <option value="">请选择 Emoji</option>
                {emojiOptions.map((o) => (
                  <option key={o.id} value={o.id}>
                    {o.emojiChar} {o.name || o.slug}
                  </option>
                ))}
              </select>
              {selectedEmoji && (
                <span className="text-2xl shrink-0" title={selectedEmoji.slug}>
                  {selectedEmoji.emojiChar}
                </span>
              )}
            </div>
          </Field>

          <Field label="Provider *">
            <select
              value={state.provider}
              onChange={(e) => update('provider', e.target.value)}
              className={inputCls}
            >
              {ASSET_PROVIDERS.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
            <p className="text-xs text-gray-400 mt-1">
              {PROVIDER_LICENSE_HINT[state.provider] ?? ''}
            </p>
          </Field>

          <Field label="File Type *">
            <select
              value={state.fileType}
              onChange={(e) => update('fileType', e.target.value)}
              className={inputCls}
            >
              {ASSET_FILE_TYPES.map((f) => (
                <option key={f} value={f}>
                  {f}
                </option>
              ))}
            </select>
          </Field>

          <Field label="状态">
            <select
              value={state.status}
              onChange={(e) => update('status', e.target.value)}
              className={inputCls}
            >
              <option value="draft">draft</option>
              <option value="published">published</option>
              <option value="archived">archived</option>
            </select>
          </Field>

          <Field
            label="File URL (fileUrl)"
            hint="远程图片地址（与 localPath 至少填一项）"
          >
            <input
              value={state.fileUrl}
              onChange={(e) => update('fileUrl', e.target.value)}
              className={inputCls}
              placeholder="https://…"
            />
          </Field>

          <Field
            label="Local Path (localPath)"
            hint="本地存储路径（与 fileUrl 至少填一项）"
          >
            <input
              value={state.localPath}
              onChange={(e) => update('localPath', e.target.value)}
              className={inputCls}
              placeholder="/assets/…"
            />
          </Field>

          <Field label="Width">
            <input
              type="number"
              min={1}
              value={state.width}
              onChange={(e) => update('width', e.target.value)}
              className={inputCls}
              placeholder="如 160"
            />
          </Field>

          <Field label="Height">
            <input
              type="number"
              min={1}
              value={state.height}
              onChange={(e) => update('height', e.target.value)}
              className={inputCls}
              placeholder="如 160"
            />
          </Field>

          <Field
            label={`License Name ${needLicenseName ? '*' : ''}`}
            hint="授权名称，例如 CC BY 4.0 / SIL Open Font License 1.1"
          >
            <input
              value={state.licenseName}
              onChange={(e) => update('licenseName', e.target.value)}
              className={inputCls}
              placeholder="CC BY 4.0"
            />
          </Field>

          <Field label="License URL (licenseUrl)" hint={licenseHint || undefined}>
            <input
              value={state.licenseUrl}
              onChange={(e) => update('licenseUrl', e.target.value)}
              className={inputCls}
              placeholder="https://creativecommons.org/licenses/…"
            />
          </Field>

          <div className="md:col-span-2">
            <Field
              label={`Attribution ${needAttribution ? '*' : ''}`}
              hint="图片出处 / 版权署名（provider 为 custom 时必填）"
            >
              <input
                value={state.attribution}
                onChange={(e) => update('attribution', e.target.value)}
                className={inputCls}
                placeholder="如 Twemoji / OpenMoji Project"
              />
            </Field>
          </div>

          <div className="md:col-span-2">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={state.isDownloadable}
                onChange={(e) => update('isDownloadable', e.target.checked)}
                className="h-4 w-4"
              />
              <span>
                Is Downloadable（允许下载）
                {state.isDownloadable && (
                  <span className="text-amber-600"> — 开启时 licenseName 为必填</span>
                )}
              </span>
            </label>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3 pt-2 border-t pt-4">
        <button
          type="button"
          onClick={handleSubmit}
          disabled={submitting || !canManage}
          className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm disabled:opacity-50"
        >
          {submitting ? '保存中…' : mode === 'create' ? '创建' : '保存'}
        </button>

        {mode === 'edit' && assetId && canManage && (
          <div className="flex items-center gap-2 ml-2">
            <span className="text-xs text-gray-400">快捷状态:</span>
            {(['published', 'draft', 'archived'] as AssetStatus[]).map((s) => (
              <button
                key={s}
                type="button"
                disabled={statusBusy}
                onClick={() => handleQuickStatus(s)}
                className="px-3 py-1.5 border rounded text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50"
              >
                {s}
              </button>
            ))}
          </div>
        )}

        {mode === 'edit' && assetId && canManage && (
          <button
            type="button"
            onClick={handleDelete}
            disabled={deleting}
            className="ml-auto px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded text-sm disabled:opacity-50"
          >
            {deleting ? '删除中…' : '删除'}
          </button>
        )}
      </div>
    </div>
  );
}
