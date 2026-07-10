import { BadRequestException } from '@nestjs/common';
import {
  ASSET_STATUS_VALUES,
  ASSET_PROVIDER_VALUES,
  ASSET_FILE_TYPE_VALUES,
  AssetStatus,
  AssetProvider,
  AssetFileType,
} from './admin-asset-query.dto';

export interface AdminAssetCreateInput {
  emojiId: string;
  provider: AssetProvider;
  fileType: AssetFileType;
  fileUrl?: string | null;
  localPath?: string | null;
  width?: number | null;
  height?: number | null;
  licenseName?: string | null;
  licenseUrl?: string | null;
  attribution?: string | null;
  isDownloadable: boolean;
  status: AssetStatus;
}

export interface AdminAssetUpdateInput {
  emojiId?: string;
  provider?: AssetProvider;
  fileType?: AssetFileType;
  fileUrl?: string | null;
  localPath?: string | null;
  width?: number | null;
  height?: number | null;
  licenseName?: string | null;
  licenseUrl?: string | null;
  attribution?: string | null;
  isDownloadable?: boolean;
  status?: AssetStatus;
}

function optStr(value: unknown): string | undefined {
  if (value === undefined || value === null) return undefined;
  if (typeof value === 'string') {
    const trimmed = value.trim();
    return trimmed === '' ? undefined : trimmed;
  }
  return String(value);
}

// Accepts "true"/"false" strings or booleans. Empty/undefined → undefined.
function parseOptionalBool(value: unknown): boolean | undefined {
  if (value === undefined || value === null || value === '') return undefined;
  if (typeof value === 'boolean') return value;
  if (typeof value === 'string') {
    const v = value.trim().toLowerCase();
    if (v === 'true') return true;
    if (v === 'false') return false;
  }
  throw new BadRequestException('isDownloadable 只能是 true 或 false');
}

// Accepts positive integers only. Rejects 0, negatives, decimals, NaN.
function parseOptionalPositiveInt(value: unknown, field: string): number | undefined {
  if (value === undefined || value === null || value === '') return undefined;
  const n = typeof value === 'string' ? parseInt(value, 10) : (value as number);
  if (typeof n !== 'number' || isNaN(n)) {
    throw new BadRequestException(`${field} 必须是数字`);
  }
  if (!Number.isInteger(n) || n <= 0) {
    throw new BadRequestException(`${field} 必须是正整数`);
  }
  return n;
}

function validateEnum<T extends string>(value: string, allowed: T[], label: string): T {
  if (!allowed.includes(value as T)) {
    throw new BadRequestException(`无效的 ${label} "${value}"`);
  }
  return value as T;
}

function assertLicenseForDownloadable(
  isDownloadable: boolean,
  licenseName: string | undefined,
  context: string,
): void {
  if (isDownloadable && !licenseName) {
    throw new BadRequestException(
      `${context}：当 isDownloadable = true 时，licenseName 为必填项`,
    );
  }
}

function assertLicenseForCustom(
  provider: AssetProvider,
  licenseName: string | undefined,
  attribution: string | undefined,
  context: string,
): void {
  if (provider === 'custom') {
    if (!licenseName) {
      throw new BadRequestException(`${context}：provider 为 custom 时，licenseName 为必填项`);
    }
    if (!attribution) {
      throw new BadRequestException(`${context}：provider 为 custom 时，attribution 为必填项`);
    }
  }
}

export function parseAdminAssetCreateBody(body: unknown): AdminAssetCreateInput {
  if (!body || typeof body !== 'object') {
    throw new BadRequestException('请求体格式不正确');
  }
  const obj = body as Record<string, unknown>;

  const emojiId = optStr(obj.emojiId);
  if (!emojiId) {
    throw new BadRequestException('emojiId 不能为空');
  }

  const providerRaw = optStr(obj.provider);
  if (!providerRaw) {
    throw new BadRequestException('provider 不能为空');
  }
  const provider = validateEnum(
    providerRaw,
    ASSET_PROVIDER_VALUES,
    'provider',
  ) as AssetProvider;

  const fileTypeRaw = optStr(obj.fileType);
  if (!fileTypeRaw) {
    throw new BadRequestException('fileType 不能为空');
  }
  const fileType = validateEnum(
    fileTypeRaw,
    ASSET_FILE_TYPE_VALUES,
    'fileType',
  ) as AssetFileType;

  const fileUrl = optStr(obj.fileUrl);
  const localPath = optStr(obj.localPath);
  if (!fileUrl && !localPath) {
    throw new BadRequestException('fileUrl 与 localPath 至少填写一项');
  }

  const width = parseOptionalPositiveInt(obj.width, 'width');
  const height = parseOptionalPositiveInt(obj.height, 'height');

  const licenseName = optStr(obj.licenseName);
  const licenseUrl = optStr(obj.licenseUrl);
  const attribution = optStr(obj.attribution);

  const isDownloadable = (() => {
    const v = parseOptionalBool(obj.isDownloadable);
    return v === undefined ? false : v;
  })();

  const status = validateEnum(
    optStr(obj.status) ?? 'draft',
    ASSET_STATUS_VALUES,
    'status',
  ) as AssetStatus;

  // License / attribution rules.
  assertLicenseForDownloadable(isDownloadable, licenseName, '创建 Asset');
  assertLicenseForCustom(provider, licenseName, attribution, '创建 Asset');

  return {
    emojiId,
    provider,
    fileType,
    fileUrl: fileUrl ?? null,
    localPath: localPath ?? null,
    width: width ?? null,
    height: height ?? null,
    licenseName: licenseName ?? null,
    licenseUrl: licenseUrl ?? null,
    attribution: attribution ?? null,
    isDownloadable,
    status,
  };
}

export function parseAdminAssetUpdateBody(body: unknown): AdminAssetUpdateInput {
  if (!body || typeof body !== 'object') {
    throw new BadRequestException('请求体格式不正确');
  }
  const obj = body as Record<string, unknown>;

  const result: AdminAssetUpdateInput = {};

  if (obj.emojiId !== undefined) {
    const emojiId = optStr(obj.emojiId);
    if (!emojiId) throw new BadRequestException('emojiId 不能为空');
    result.emojiId = emojiId;
  }

  if (obj.provider !== undefined) {
    const providerRaw = optStr(obj.provider);
    if (!providerRaw) throw new BadRequestException('provider 不能为空');
    result.provider = validateEnum(providerRaw, ASSET_PROVIDER_VALUES, 'provider') as AssetProvider;
  }

  if (obj.fileType !== undefined) {
    const fileTypeRaw = optStr(obj.fileType);
    if (!fileTypeRaw) throw new BadRequestException('fileType 不能为空');
    result.fileType = validateEnum(fileTypeRaw, ASSET_FILE_TYPE_VALUES, 'fileType') as AssetFileType;
  }

  if ('fileUrl' in obj) {
    result.fileUrl = optStr(obj.fileUrl) ?? null;
  }
  if ('localPath' in obj) {
    result.localPath = optStr(obj.localPath) ?? null;
  }

  if (obj.width !== undefined) result.width = parseOptionalPositiveInt(obj.width, 'width') ?? null;
  if (obj.height !== undefined) result.height = parseOptionalPositiveInt(obj.height, 'height') ?? null;

  if ('licenseName' in obj) result.licenseName = optStr(obj.licenseName) ?? null;
  if ('licenseUrl' in obj) result.licenseUrl = optStr(obj.licenseUrl) ?? null;
  if ('attribution' in obj) result.attribution = optStr(obj.attribution) ?? null;

  if (obj.isDownloadable !== undefined) {
    const v = parseOptionalBool(obj.isDownloadable);
    if (v === undefined) throw new BadRequestException('isDownloadable 不能为空');
    result.isDownloadable = v;
  }

  if (obj.status !== undefined) {
    result.status = validateEnum(optStr(obj.status) ?? 'draft', ASSET_STATUS_VALUES, 'status') as AssetStatus;
  }

  // Cross-field license rules only when the relevant fields are provided.
  if (result.isDownloadable === true && result.licenseName === '') {
    throw new BadRequestException('更新 Asset：当 isDownloadable = true 时，licenseName 为必填项');
  }
  if (result.provider === 'custom') {
    if (result.licenseName === '') {
      throw new BadRequestException('更新 Asset：provider 为 custom 时，licenseName 为必填项');
    }
    if (result.attribution === '') {
      throw new BadRequestException('更新 Asset：provider 为 custom 时，attribution 为必填项');
    }
  }
  // If the update clears both file sources, reject (one must remain).
  if (result.fileUrl === '' && result.localPath === '') {
    throw new BadRequestException('更新 Asset：fileUrl 与 localPath 至少保留一项');
  }

  return result;
}

export function parseAssetStatusUpdateBody(body: unknown): AssetStatus {
  if (!body || typeof body !== 'object') {
    throw new BadRequestException('请求体格式不正确');
  }
  const obj = body as Record<string, unknown>;
  const status = optStr(obj.status);
  if (!status) {
    throw new BadRequestException('status 不能为空');
  }
  return validateEnum(status, ASSET_STATUS_VALUES, 'status') as AssetStatus;
}
