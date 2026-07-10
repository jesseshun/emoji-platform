import { BadRequestException } from '@nestjs/common';
import { DEFAULT_PAGE, DEFAULT_LIMIT, MAX_LIMIT } from '@emoji-platform/types';

export type AssetStatus = 'draft' | 'published' | 'archived';
export type AssetProvider = 'noto' | 'openmoji' | 'twemoji' | 'custom';
export type AssetFileType = 'svg' | 'png' | 'webp' | 'gif';

export const ASSET_STATUS_VALUES: AssetStatus[] = ['draft', 'published', 'archived'];
export const ASSET_PROVIDER_VALUES: AssetProvider[] = ['noto', 'openmoji', 'twemoji', 'custom'];
export const ASSET_FILE_TYPE_VALUES: AssetFileType[] = ['svg', 'png', 'webp', 'gif'];

// Only these providers are license-compliant for our platform. Anything else
// (apple / samsung / microsoft / wechat / qq …) is rejected on purpose — see
// Phase 4D-1 security rules. The allow-list is the authoritative guard.
export const ASSET_PROVIDERS: AssetProvider[] = ASSET_PROVIDER_VALUES;
export const ASSET_FILE_TYPES: AssetFileType[] = ASSET_FILE_TYPE_VALUES;

export interface AdminAssetListQuery {
  page: number;
  limit: number;
  q?: string;
  provider?: AssetProvider | 'all';
  fileType?: AssetFileType | 'all';
  status?: AssetStatus | 'all';
  emojiId?: string;
  isDownloadable?: 'true' | 'false' | 'all';
}

export function parseAdminAssetListQuery(
  query: Record<string, string | undefined>,
): AdminAssetListQuery {
  let page = parseInt(query.page ?? '', 10);
  let limit = parseInt(query.limit ?? '', 10);
  if (isNaN(page) || page < 1) page = DEFAULT_PAGE;
  if (isNaN(limit) || limit < 1) limit = DEFAULT_LIMIT;
  if (limit > MAX_LIMIT) limit = MAX_LIMIT;

  const statusRaw = query.status ?? 'all';
  let status: AssetStatus | 'all' = 'all';
  if (statusRaw && statusRaw !== 'all') {
    if (!ASSET_STATUS_VALUES.includes(statusRaw as AssetStatus)) {
      throw new BadRequestException(
        `无效的 status "${statusRaw}"。支持：draft, published, archived, all`,
      );
    }
    status = statusRaw as AssetStatus;
  }

  const providerRaw = query.provider ?? 'all';
  let provider: AssetProvider | 'all' = 'all';
  if (providerRaw && providerRaw !== 'all') {
    if (!ASSET_PROVIDER_VALUES.includes(providerRaw as AssetProvider)) {
      throw new BadRequestException(
        `无效的 provider "${providerRaw}"。支持：noto, openmoji, twemoji, custom`,
      );
    }
    provider = providerRaw as AssetProvider;
  }

  const fileTypeRaw = query.fileType ?? 'all';
  let fileType: AssetFileType | 'all' = 'all';
  if (fileTypeRaw && fileTypeRaw !== 'all') {
    if (!ASSET_FILE_TYPE_VALUES.includes(fileTypeRaw as AssetFileType)) {
      throw new BadRequestException(
        `无效的 fileType "${fileTypeRaw}"。支持：svg, png, webp, gif`,
      );
    }
    fileType = fileTypeRaw as AssetFileType;
  }

  const isDlRaw = query.isDownloadable ?? 'all';
  let isDownloadable: 'true' | 'false' | 'all' = 'all';
  if (isDlRaw && isDlRaw !== 'all') {
    if (isDlRaw !== 'true' && isDlRaw !== 'false') {
      throw new BadRequestException(
        `无效的 isDownloadable "${isDlRaw}"。支持：true, false, all`,
      );
    }
    isDownloadable = isDlRaw;
  }

  return {
    page,
    limit,
    q: query.q?.trim() || undefined,
    provider,
    fileType,
    status,
    emojiId: query.emojiId || undefined,
    isDownloadable,
  };
}
