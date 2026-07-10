/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { AdminJwtPayload } from './admin-auth.guard';
import { AdminTopicListQuery } from './dto/admin-topic-query.dto';
import {
  AdminTopicCreateInput,
  AdminTopicUpdateInput,
  TopicStatusValue,
  TopicTranslationInput,
  TopicEmojiBindInput,
} from './dto/admin-topic-body.dto';
import { buildPaginationMeta, isLocale } from '@emoji-platform/types';

const SITE_URL = process.env.SITE_URL || process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

function previewLinks(slug: string): { zh: string; en: string } {
  return {
    zh: `${SITE_URL}/zh/topics/${slug}/`,
    en: `${SITE_URL}/en/topics/${slug}/`,
  };
}

export interface TopicEmojiBinding {
  id: string;
  emojiId: string;
  sortOrder: number;
  note: string | null;
  emoji: {
    id: string;
    slug: string;
    emojiChar: string;
    name: string | null;
  };
}

export interface TopicTranslationDetail {
  title: string | null;
  summary: string | null;
  content: string | null;
  seoTitle: string | null;
  seoDescription: string | null;
  faqJson: unknown;
}

export interface TopicDetail {
  id: string;
  slug: string;
  coverImage: string | null;
  topicType: string | null;
  status: string;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
  translations: { zh: TopicTranslationDetail | null; en: TopicTranslationDetail | null };
  emojis: TopicEmojiBinding[];
  previewLinks: { zh: string; en: string };
}

@Injectable()
export class AdminTopicService {
  private readonly logger = new Logger(AdminTopicService.name);

  constructor(private readonly prisma: PrismaService) {}

  // ─── List ──────────────────────────────────────────────

  async list(query: AdminTopicListQuery) {
    const { page, limit, q, status } = query;

    const where: Record<string, unknown> = {};
    if (status) {
      where.status = status;
    }
    if (q) {
      where.OR = [
        { slug: { contains: q, mode: 'insensitive' } },
        {
          translations: {
            some: { title: { contains: q, mode: 'insensitive' } },
          },
        },
      ];
    }

    const [topics, total] = await Promise.all([
      this.prisma.topic.findMany({
        where: where as any,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: [{ sortOrder: 'asc' }, { id: 'asc' }],
        include: {
          translations: true,
          _count: {
            select: {
              topicEmojis: true,
            },
          },
        },
      }),
      this.prisma.topic.count({ where: where as any }),
    ]);

    const data = topics.map((topic: any) => this.formatListItem(topic));

    return {
      data,
      meta: buildPaginationMeta(page, limit, total),
    };
  }

  private formatListItem(topic: any) {
    const zh = topic.translations?.find((t: any) => t.locale === 'zh');
    const en = topic.translations?.find((t: any) => t.locale === 'en');

    return {
      id: topic.id,
      slug: topic.slug,
      coverImage: topic.coverImage,
      topicType: topic.topicType,
      sortOrder: topic.sortOrder,
      status: topic.status,
      emojiCount: topic._count?.topicEmojis ?? 0,
      translations: {
        zh: { title: zh?.title ?? null, complete: !!zh?.title },
        en: { title: en?.title ?? null, complete: !!en?.title },
      },
      updatedAt: topic.updatedAt,
      previewLinks: previewLinks(topic.slug),
    };
  }

  // ─── Detail ────────────────────────────────────────────

  async getById(id: string): Promise<{ data: TopicDetail }> {
    const topic = await this.prisma.topic.findUnique({
      where: { id },
      include: {
        translations: true,
        topicEmojis: {
          orderBy: { sortOrder: 'asc' },
          include: {
            emoji: {
              include: {
                translations: true,
              },
            },
          },
        },
      },
    });
    if (!topic) {
      throw new NotFoundException(`Topic with id "${id}" not found`);
    }
    return { data: this.formatDetail(topic as any) };
  }

  private getFullTopic(id: string): Promise<TopicDetail> {
    return this.getById(id).then((r) => r.data);
  }

  private formatDetail(topic: any): TopicDetail {
    const formatTranslation = (locale: string): TopicTranslationDetail | null => {
      const t = topic.translations?.find((x: any) => x.locale === locale);
      if (!t) return null;
      return {
        title: t.title,
        summary: t.summary,
        content: t.content,
        seoTitle: t.seoTitle,
        seoDescription: t.seoDescription,
        faqJson: t.faqJson,
      };
    };

    const emojis: TopicEmojiBinding[] = (topic.topicEmojis ?? []).map((te: any) => {
      const zhName = te.emoji.translations?.find((t: any) => t.locale === 'zh')?.name;
      const enName = te.emoji.translations?.find((t: any) => t.locale === 'en')?.name;
      return {
        id: te.id,
        emojiId: te.emojiId,
        sortOrder: te.sortOrder,
        note: te.note,
        emoji: {
          id: te.emoji.id,
          slug: te.emoji.slug,
          emojiChar: te.emoji.emojiChar,
          name: zhName ?? enName ?? null,
        },
      };
    });

    return {
      id: topic.id,
      slug: topic.slug,
      coverImage: topic.coverImage,
      topicType: topic.topicType,
      status: topic.status,
      sortOrder: topic.sortOrder,
      createdAt: topic.createdAt,
      updatedAt: topic.updatedAt,
      translations: {
        zh: formatTranslation('zh'),
        en: formatTranslation('en'),
      },
      emojis,
      previewLinks: previewLinks(topic.slug),
    };
  }

  // ─── Create ────────────────────────────────────────────

  async create(input: AdminTopicCreateInput, admin: AdminJwtPayload) {
    const existing = await this.prisma.topic.findUnique({ where: { slug: input.slug } });
    if (existing) {
      throw new BadRequestException(`slug "${input.slug}" 已存在`);
    }

    const created = await this.prisma.$transaction(async (tx: any) => {
      const topic = await tx.topic.create({
        data: {
          slug: input.slug,
          coverImage: input.coverImage ?? null,
          topicType: input.topicType ?? null,
          status: input.status,
          sortOrder: input.sortOrder ?? 0,
        },
      });
      await tx.topicTranslation.create({
        data: this.translationCreateData(topic.id, 'zh', input.translations.zh),
      });
      await tx.topicTranslation.create({
        data: this.translationCreateData(topic.id, 'en', input.translations.en),
      });
      return topic;
    });

    const full = await this.getFullTopic(created.id);

    await this.recordAudit({
      adminUserId: admin.sub,
      action: 'topic.create',
      entityType: 'topic',
      entityId: created.id,
      newData: this.snapshot(full),
    });

    return { data: full };
  }

  // ─── Update ────────────────────────────────────────────

  async update(id: string, input: AdminTopicUpdateInput, admin: AdminJwtPayload) {
    const existing = await this.prisma.topic.findUnique({
      where: { id },
      include: { translations: true },
    });
    if (!existing) {
      throw new NotFoundException(`Topic with id "${id}" not found`);
    }

    if (input.slug && input.slug !== existing.slug) {
      const slugConflict = await this.prisma.topic.findUnique({ where: { slug: input.slug } });
      if (slugConflict) {
        throw new BadRequestException(`slug "${input.slug}" 已存在`);
      }
    }

    const oldSnapshot = this.snapshot(await this.getFullTopic(id));

    await this.prisma.$transaction(async (tx: any) => {
      const data: Record<string, unknown> = {};
      if (input.slug !== undefined) data.slug = input.slug;
      if (input.coverImage !== undefined) data.coverImage = input.coverImage ?? null;
      if (input.topicType !== undefined) data.topicType = input.topicType ?? null;
      if (input.sortOrder !== undefined) data.sortOrder = input.sortOrder;
      if (input.status !== undefined) data.status = input.status;

      if (Object.keys(data).length > 0) {
        await tx.topic.update({ where: { id }, data });
      }

      if (input.translations?.zh) {
        await this.upsertTranslation(tx, id, 'zh', input.translations.zh);
      }
      if (input.translations?.en) {
        await this.upsertTranslation(tx, id, 'en', input.translations.en);
      }
    });

    const full = await this.getFullTopic(id);

    await this.recordAudit({
      adminUserId: admin.sub,
      action: 'topic.update',
      entityType: 'topic',
      entityId: id,
      oldData: oldSnapshot,
      newData: this.snapshot(full),
    });

    return { data: full };
  }

  // ─── Status ────────────────────────────────────────────

  async setStatus(id: string, status: TopicStatusValue, admin: AdminJwtPayload) {
    const existing = await this.prisma.topic.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException(`Topic with id "${id}" not found`);
    }
    if (existing.status === status) {
      return { data: { id, status } };
    }

    const oldStatus = existing.status;
    await this.prisma.topic.update({ where: { id }, data: { status } });

    await this.recordAudit({
      adminUserId: admin.sub,
      action: 'topic.status_update',
      entityType: 'topic',
      entityId: id,
      oldData: { status: oldStatus },
      newData: { status },
    });

    return { data: { id, status } };
  }

  // ─── Emoji bindings (bind / unbind / reorder) ──────────

  async setEmojis(id: string, items: TopicEmojiBindInput[], admin: AdminJwtPayload) {
    const existing = await this.prisma.topic.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException(`Topic with id "${id}" not found`);
    }

    const oldSnapshot = this.snapshot(await this.getFullTopic(id));

    // Validate that every referenced emoji exists before mutating.
    if (items.length > 0) {
      const emojiIds = items.map((it) => it.emojiId);
      const found = await this.prisma.emoji.findMany({
        where: { id: { in: emojiIds } },
        select: { id: true },
      });
      if (found.length !== new Set(emojiIds).size) {
        throw new BadRequestException('存在无效的 emojiId');
      }
    }

    await this.prisma.$transaction(async (tx: any) => {
      await tx.topicEmoji.deleteMany({ where: { topicId: id } });
      if (items.length > 0) {
        await tx.topicEmoji.createMany({
          data: items.map((it, index) => ({
            topicId: id,
            emojiId: it.emojiId,
            sortOrder: index,
            note: it.note ?? null,
          })),
        });
      }
    });

    const full = await this.getFullTopic(id);

    await this.recordAudit({
      adminUserId: admin.sub,
      action: 'topic.update_emojis',
      entityType: 'topic',
      entityId: id,
      oldData: oldSnapshot,
      newData: this.snapshot(full),
    });

    return { data: full };
  }

  // ─── Emoji options (for the binding selector) ──────────

  async emojiOptions(locale: string) {
    const safeLocale = isLocale(locale) ? locale : 'zh';
    const emojis = await this.prisma.emoji.findMany({
      orderBy: [{ sortOrder: 'asc' }, { id: 'asc' }],
      include: {
        translations: { where: { locale: safeLocale as any } },
      },
    });

    return {
      data: emojis.map((e: any) => ({
        id: e.id,
        slug: e.slug,
        emojiChar: e.emojiChar,
        name: e.translations[0]?.name ?? null,
      })),
    };
  }

  // ─── Helpers ──────────────────────────────────────────

  private translationCreateData(
    topicId: string,
    locale: 'zh' | 'en',
    t: TopicTranslationInput,
  ) {
    return {
      topicId,
      locale,
      title: t.title,
      summary: t.summary ?? null,
      content: t.content ?? null,
      seoTitle: t.seoTitle ?? null,
      seoDescription: t.seoDescription ?? null,
      faqJson: (t.faqJson ?? []) as any,
    };
  }

  private async upsertTranslation(
    tx: any,
    topicId: string,
    locale: 'zh' | 'en',
    t: Partial<TopicTranslationInput>,
  ) {
    const data: Record<string, unknown> = {};
    if (t.title !== undefined) data.title = t.title;
    if (t.summary !== undefined) data.summary = t.summary ?? null;
    if (t.content !== undefined) data.content = t.content ?? null;
    if (t.seoTitle !== undefined) data.seoTitle = t.seoTitle ?? null;
    if (t.seoDescription !== undefined) data.seoDescription = t.seoDescription ?? null;
    if (t.faqJson !== undefined) data.faqJson = (t.faqJson ?? []) as any;

    await tx.topicTranslation.upsert({
      where: { topicId_locale: { topicId, locale } },
      create: {
        topicId,
        locale,
        title: (t.title as string) ?? '',
        ...data,
      },
      update: data,
    });
  }

  private snapshot(topic: TopicDetail): Record<string, unknown> {
    const pickTranslation = (locale: string) => {
      const t = (topic.translations as any)[locale];
      if (!t) return null;
      return {
        title: t.title,
        summary: t.summary,
        content: t.content,
        seoTitle: t.seoTitle,
        seoDescription: t.seoDescription,
        faqJson: t.faqJson,
      };
    };

    return {
      slug: topic.slug,
      coverImage: topic.coverImage,
      topicType: topic.topicType,
      sortOrder: topic.sortOrder,
      status: topic.status,
      translations: {
        zh: pickTranslation('zh'),
        en: pickTranslation('en'),
      },
      emojis: (topic.emojis ?? []).map((e) => ({
        emojiId: e.emojiId,
        sortOrder: e.sortOrder,
        note: e.note,
      })),
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
      // Audit-log write failure must not silently pass — at minimum record it
      // server-side. The main operation still succeeds (consistent with Phase 4B/4C-1).
      this.logger.error(
        `audit log write failed for ${params.action} ${params.entityType}:${params.entityId}`,
        error instanceof Error ? error.stack : String(error),
      );
    }
  }
}
