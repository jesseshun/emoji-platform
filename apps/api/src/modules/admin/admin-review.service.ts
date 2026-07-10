/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { AdminJwtPayload } from './admin-auth.guard';
import { buildPaginationMeta } from '@emoji-platform/types';
import { ReviewQuery } from './dto/admin-review-query.dto';

// Phase 4D-3: Review Management over the existing `user_submissions` model.
//
// The schema already provides UserSubmission (id, emojiId, type, locale, content,
// userName, userEmail, status, adminNote, timestamps) plus a SubmissionStatus enum
// (pending/approved/rejected/spam). There is no separate Review model; submissions
// ARE the review queue. We therefore implement Review Management on top of it
// instead of returning a "schema not available" placeholder.
//
// Sensitive-data rules:
// - Never return admin-sensitive fields (no passwordHash, no raw IP).
// - userEmail is shown as provided by the submitter (operational review context),
//   but it is not an admin secret; it is the submitter's own contact field.

const VALID_STATUSES = ['pending', 'approved', 'rejected', 'spam'];

@Injectable()
export class AdminReviewService {
  private readonly logger = new Logger(AdminReviewService.name);

  constructor(private readonly prisma: PrismaService) {}

  async listReviews(query: ReviewQuery) {
    const where: any = {};
    if (query.status !== 'all') where.status = query.status;
    if (query.type !== 'all') where.type = query.type;
    if (query.locale !== 'all') where.locale = query.locale;
    if (query.emojiId) where.emojiId = query.emojiId;
    if (query.q) {
      where.OR = [
        { content: { contains: query.q, mode: 'insensitive' } },
        { userName: { contains: query.q, mode: 'insensitive' } },
        { userEmail: { contains: query.q, mode: 'insensitive' } },
      ];
    }

    const [rows, total] = await Promise.all([
      this.prisma.userSubmission.findMany({
        where,
        include: {
          emoji: { select: { emojiChar: true, slug: true } },
        },
        orderBy: [{ status: 'asc' }, { createdAt: 'desc' }],
        skip: (query.page - 1) * query.limit,
        take: query.limit,
      }),
      this.prisma.userSubmission.count({ where }),
    ]);

    const data = rows.map((row: any) => this.formatReview(row));
    return { data, meta: buildPaginationMeta(query.page, query.limit, total) };
  }

  async getReview(id: string) {
    const row = await this.prisma.userSubmission.findUnique({
      where: { id },
      include: {
        emoji: {
          select: {
            id: true,
            emojiChar: true,
            slug: true,
            translations: {
              where: { locale: 'en' },
              select: { name: true },
            },
          },
        },
      },
    });
    if (!row) {
      throw new NotFoundException(`未找到提交/审核记录 "${id}"`);
    }
    return this.formatReviewDetail(row);
  }

  async updateReviewStatus(
    id: string,
    status: string,
    adminNote: string | undefined,
    admin: AdminJwtPayload,
  ) {
    if (!VALID_STATUSES.includes(status)) {
      throw new BadRequestException(
        `无效的审核状态 "${status}"（允许：pending / approved / rejected / spam）`,
      );
    }

    const existing = await this.prisma.userSubmission.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException(`未找到提交/审核记录 "${id}"`);
    }

    const oldData = { id: existing.id, status: existing.status, adminNote: existing.adminNote ?? null };

    const updated = await this.prisma.userSubmission.update({
      where: { id },
      data: {
        status: status as any,
        adminNote: adminNote === undefined ? existing.adminNote : adminNote,
      },
      include: {
        emoji: { select: { emojiChar: true, slug: true } },
      },
    });

    await this.recordAudit({
      adminUserId: admin.sub,
      action: 'review.update',
      entityType: 'user_submission',
      entityId: id,
      oldData,
      newData: { id, status: updated.status, adminNote: updated.adminNote ?? null },
    });

    return this.formatReviewDetail(updated);
  }

  private formatReview(row: any) {
    return {
      id: row.id,
      type: row.type,
      locale: row.locale,
      status: row.status,
      content: row.content ?? null,
      userName: row.userName ?? null,
      userEmail: row.userEmail ?? null,
      emojiId: row.emojiId ?? null,
      emojiChar: row.emoji?.emojiChar ?? null,
      emojiSlug: row.emoji?.slug ?? null,
      createdAt: row.createdAt,
      adminNote: row.adminNote ?? null,
    };
  }

  private formatReviewDetail(row: any) {
    const emojiName = row.emoji?.translations?.[0]?.name ?? null;
    return {
      id: row.id,
      type: row.type,
      locale: row.locale,
      status: row.status,
      content: row.content ?? null,
      userName: row.userName ?? null,
      userEmail: row.userEmail ?? null,
      adminNote: row.adminNote ?? null,
      emoji: row.emoji
        ? {
            id: row.emoji.id,
            emojiChar: row.emoji.emojiChar,
            slug: row.emoji.slug,
            name: emojiName,
          }
        : null,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    };
  }

  private async recordAudit(params: {
    adminUserId: string;
    action: string;
    entityType: string;
    entityId: string;
    oldData?: unknown;
    newData?: unknown;
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
          ipAddress: null,
        },
      });
    } catch (error) {
      this.logger.error(
        `audit log write failed for ${params.action} ${params.entityType}:${params.entityId}`,
        error instanceof Error ? error.stack : String(error),
      );
    }
  }
}
