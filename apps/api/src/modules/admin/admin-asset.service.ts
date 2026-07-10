/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { AdminJwtPayload } from './admin-auth.guard';
import {
  AdminAssetListQuery,
  AssetProvider,
  AssetFileType,
  AssetStatus,
  ASSET_PROVIDERS,
  ASSET_FILE_TYPES,
} from './dto/admin-asset-query.dto';
import {
  AdminAssetCreateInput,
  AdminAssetUpdateInput,
} from './dto/admin-asset-body.dto';
import { buildPaginationMeta } from '@emoji-platform/types';

interface EmojiAssetRecord {
  id: string;
  emojiId: string;
  provider: string | null;
  fileType: string | null;
  fileUrl: string | null;
  localPath: string | null;
  width: number | null;
  height: number | null;
  licenseName: string | null;
  licenseUrl: string | null;
  attribution: string | null;
  isDownloadable: boolean;
  status: string;
  createdAt: Date;
  updatedAt: Date;
  emoji?: any;
}

@Injectable()
export class AdminAssetService {
  private readonly logger = new Logger(AdminAssetService.name);

  constructor(private readonly prisma: PrismaService) {}

  // ─── Providers / File types (static allow-lists) ───

  providers(): { data: AssetProvider[] } {
    return { data: [...ASSET_PROVIDERS] };
  }

  fileTypes(): { data: AssetFileType[] } {
    return { data: [...ASSET_FILE_TYPES] };
  }

  // ─── List ──────────────────────────────────────────

  async list(query: AdminAssetListQuery) {
    const { page, limit, q, provider, fileType, status, emojiId, isDownloadable } = query;

    const where: Record<string, unknown> = {};

    if (provider && provider !== 'all') {
      where.provider = provider;
    }
    if (fileType && fileType !== 'all') {
      where.fileType = fileType;
    }
    if (status && status !== 'all') {
      where.status = status;
    }
    if (emojiId) {
      where.emojiId = emojiId;
    }
    if (isDownloadable === 'true') {
      where.isDownloadable = true;
    } else if (isDownloadable === 'false') {
      where.isDownloadable = false;
    }

    if (q) {
      where.OR = [
        { provider: { contains: q, mode: 'insensitive' } },
        { fileType: { contains: q, mode: 'insensitive' } },
        { fileUrl: { contains: q, mode: 'insensitive' } },
        { localPath: { contains: q, mode: 'insensitive' } },
        { licenseName: { contains: q, mode: 'insensitive' } },
        { attribution: { contains: q, mode: 'insensitive' } },
        {
          emoji: {
            OR: [
              { emojiChar: { contains: q, mode: 'insensitive' } },
              { slug: { contains: q, mode: 'insensitive' } },
              {
                translations: {
                  some: {
                    OR: [
                      { name: { contains: q, mode: 'insensitive' } },
                      { shortName: { contains: q, mode: 'insensitive' } },
                    ],
                  },
                },
              },
            ],
          },
        },
      ];
    }

    const [assets, total] = await Promise.all([
      this.prisma.emojiAsset.findMany({
        where: where as any,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: [{ status: 'asc' }, { updatedAt: 'desc' }],
        include: {
          emoji: {
            include: { translations: true },
          },
        },
      }),
      this.prisma.emojiAsset.count({ where: where as any }),
    ]);

    const data = assets.map((asset: EmojiAssetRecord) => this.formatListItem(asset));

    return {
      data,
      meta: buildPaginationMeta(page, limit, total),
    };
  }

  private formatListItem(asset: EmojiAssetRecord) {
    const zh = asset.emoji?.translations?.find((t: any) => t.locale === 'zh');
    const en = asset.emoji?.translations?.find((t: any) => t.locale === 'en');
    return {
      id: asset.id,
      emojiId: asset.emojiId,
      emoji: asset.emoji
        ? {
            id: asset.emoji.id,
            emojiChar: asset.emoji.emojiChar,
            slug: asset.emoji.slug,
            name: zh?.name ?? en?.name ?? null,
          }
        : null,
      provider: asset.provider,
      fileType: asset.fileType,
      fileUrl: asset.fileUrl,
      localPath: asset.localPath,
      width: asset.width,
      height: asset.height,
      licenseName: asset.licenseName,
      licenseUrl: asset.licenseUrl,
      attribution: asset.attribution,
      isDownloadable: asset.isDownloadable,
      status: asset.status,
      createdAt: asset.createdAt,
      updatedAt: asset.updatedAt,
    };
  }

  // ─── Detail ─────────────────────────────────────────

  async getById(id: string) {
    const asset = await this.prisma.emojiAsset.findUnique({
      where: { id },
      include: {
        emoji: {
          include: { translations: true },
        },
      },
    });

    if (!asset) {
      throw new NotFoundException(`Asset with id "${id}" not found`);
    }

    return { data: this.formatDetail(asset as EmojiAssetRecord) };
  }

  private formatDetail(asset: EmojiAssetRecord) {
    const zh = asset.emoji?.translations?.find((t: any) => t.locale === 'zh');
    const en = asset.emoji?.translations?.find((t: any) => t.locale === 'en');
    return {
      id: asset.id,
      emojiId: asset.emojiId,
      emoji: asset.emoji
        ? {
            id: asset.emoji.id,
            emojiChar: asset.emoji.emojiChar,
            slug: asset.emoji.slug,
            name: zh?.name ?? en?.name ?? null,
          }
        : null,
      provider: asset.provider,
      fileType: asset.fileType,
      fileUrl: asset.fileUrl,
      localPath: asset.localPath,
      width: asset.width,
      height: asset.height,
      licenseName: asset.licenseName,
      licenseUrl: asset.licenseUrl,
      attribution: asset.attribution,
      isDownloadable: asset.isDownloadable,
      status: asset.status,
      createdAt: asset.createdAt,
      updatedAt: asset.updatedAt,
    };
  }

  // ─── Create ─────────────────────────────────────────

  async create(input: AdminAssetCreateInput, admin: AdminJwtPayload) {
    const emoji = await this.prisma.emoji.findUnique({ where: { id: input.emojiId } });
    if (!emoji) {
      throw new NotFoundException(`emojiId "${input.emojiId}" 无效：关联的 Emoji 不存在`);
    }

    const asset = await this.prisma.emojiAsset.create({
      data: {
        emojiId: input.emojiId,
        provider: input.provider,
        fileType: input.fileType,
        fileUrl: input.fileUrl ?? null,
        localPath: input.localPath ?? null,
        width: input.width ?? null,
        height: input.height ?? null,
        licenseName: input.licenseName ?? null,
        licenseUrl: input.licenseUrl ?? null,
        attribution: input.attribution ?? null,
        isDownloadable: input.isDownloadable,
        status: input.status,
      },
    });

    const full = await this.prisma.emojiAsset.findUnique({
      where: { id: asset.id },
      include: { emoji: { include: { translations: true } } },
    });

    await this.recordAudit({
      adminUserId: admin.sub,
      action: 'asset.create',
      entityType: 'asset',
      entityId: asset.id,
      newData: this.snapshot(full as EmojiAssetRecord),
    });

    return { data: this.formatDetail(full as EmojiAssetRecord) };
  }

  // ─── Update ─────────────────────────────────────────

  async update(id: string, input: AdminAssetUpdateInput, admin: AdminJwtPayload) {
    const existing = await this.prisma.emojiAsset.findUnique({
      where: { id },
      include: { emoji: { include: { translations: true } } },
    });
    if (!existing) {
      throw new NotFoundException(`Asset with id "${id}" not found`);
    }

    if (input.emojiId !== undefined) {
      const emoji = await this.prisma.emoji.findUnique({ where: { id: input.emojiId } });
      if (!emoji) {
        throw new NotFoundException(`emojiId "${input.emojiId}" 无效：关联的 Emoji 不存在`);
      }
    }

    const oldSnapshot = this.snapshot(existing as EmojiAssetRecord);

    const data: Record<string, unknown> = {};
    if (input.emojiId !== undefined) data.emojiId = input.emojiId;
    if (input.provider !== undefined) data.provider = input.provider;
    if (input.fileType !== undefined) data.fileType = input.fileType;
    if ('fileUrl' in input) data.fileUrl = input.fileUrl ?? null;
    if ('localPath' in input) data.localPath = input.localPath ?? null;
    if (input.width !== undefined) data.width = input.width ?? null;
    if (input.height !== undefined) data.height = input.height ?? null;
    if ('licenseName' in input) data.licenseName = input.licenseName ?? null;
    if ('licenseUrl' in input) data.licenseUrl = input.licenseUrl ?? null;
    if ('attribution' in input) data.attribution = input.attribution ?? null;
    if (input.isDownloadable !== undefined) data.isDownloadable = input.isDownloadable;
    if (input.status !== undefined) data.status = input.status;

    await this.prisma.emojiAsset.update({ where: { id }, data });

    const full = await this.prisma.emojiAsset.findUnique({
      where: { id },
      include: { emoji: { include: { translations: true } } },
    });

    await this.recordAudit({
      adminUserId: admin.sub,
      action: 'asset.update',
      entityType: 'asset',
      entityId: id,
      oldData: oldSnapshot,
      newData: this.snapshot(full as EmojiAssetRecord),
    });

    return { data: this.formatDetail(full as EmojiAssetRecord) };
  }

  // ─── Status ─────────────────────────────────────────

  async setStatus(id: string, status: AssetStatus, admin: AdminJwtPayload) {
    const existing = await this.prisma.emojiAsset.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException(`Asset with id "${id}" not found`);
    }
    if (existing.status === status) {
      return { data: { id, status } };
    }

    const oldStatus = existing.status;
    await this.prisma.emojiAsset.update({ where: { id }, data: { status } });

    await this.recordAudit({
      adminUserId: admin.sub,
      action: 'asset.status_update',
      entityType: 'asset',
      entityId: id,
      oldData: { status: oldStatus },
      newData: { status },
    });

    return { data: { id, status } };
  }

  // ─── Delete (hard delete; schema has no soft-delete field) ───

  async delete(id: string, admin: AdminJwtPayload) {
    const existing = await this.prisma.emojiAsset.findUnique({
      where: { id },
      include: { emoji: { include: { translations: true } } },
    });
    if (!existing) {
      throw new NotFoundException(`Asset with id "${id}" not found`);
    }

    // Record the audit log BEFORE the row is removed.
    await this.recordAudit({
      adminUserId: admin.sub,
      action: 'asset.delete',
      entityType: 'asset',
      entityId: id,
      oldData: this.snapshot(existing as EmojiAssetRecord),
    });

    await this.prisma.emojiAsset.delete({ where: { id } });

    return { data: { id, deleted: true } };
  }

  // ─── Helpers ──────────────────────────────────────

  private snapshot(asset: EmojiAssetRecord): Record<string, unknown> {
    const pickEmoji = () => {
      if (!asset.emoji) return null;
      const zh = asset.emoji.translations?.find((t: any) => t.locale === 'zh');
      const en = asset.emoji.translations?.find((t: any) => t.locale === 'en');
      return {
        id: asset.emoji.id,
        emojiChar: asset.emoji.emojiChar,
        slug: asset.emoji.slug,
        name: zh?.name ?? en?.name ?? null,
      };
    };

    return {
      emojiId: asset.emojiId,
      emoji: pickEmoji(),
      provider: asset.provider,
      fileType: asset.fileType,
      fileUrl: asset.fileUrl,
      localPath: asset.localPath,
      width: asset.width,
      height: asset.height,
      licenseName: asset.licenseName,
      licenseUrl: asset.licenseUrl,
      attribution: asset.attribution,
      isDownloadable: asset.isDownloadable,
      status: asset.status,
    };
  }

  private async recordAudit(params: {
    adminUserId: string;
    action: string;
    entityType: string;
    entityId: string;
    oldData?: unknown;
    newData?: unknown;
    ipAddress?: string | null;
  }): Promise<void> {
    try {
      await this.prisma.auditLog.create({
        data: {
          adminUserId: params.adminUserId,
          action: params.action,
          entityType: params.entityType,
          entityId: params.entityId,
          oldData: (params.oldData ?? undefined) as any,
          newData: (params.newData ?? undefined) as any,
          ipAddress: params.ipAddress ?? null,
        },
      });
    } catch (error) {
      // Per spec: audit-log write failure must not silently pass — at minimum
      // record it server-side. The main operation still succeeds.
      this.logger.error(
        `audit log write failed for ${params.action} ${params.entityType}:${params.entityId}`,
        error instanceof Error ? error.stack : String(error),
      );
    }
  }
}
