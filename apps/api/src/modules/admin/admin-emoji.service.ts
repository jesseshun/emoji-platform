/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { AdminJwtPayload } from './admin-auth.guard';
import {
  AdminEmojiListQuery,
} from './dto/admin-emoji-query.dto';
import {
  AdminEmojiCreateInput,
  AdminEmojiUpdateInput,
  EmojiStatusValue,
  EmojiTranslationInput,
} from './dto/admin-emoji-body.dto';
import { buildPaginationMeta } from '@emoji-platform/types';

const SITE_URL = process.env.SITE_URL || 'http://localhost:3000';

function previewLinks(slug: string): { zh: string; en: string } {
  return {
    zh: `${SITE_URL}/zh/emoji/${slug}/`,
    en: `${SITE_URL}/en/emoji/${slug}/`,
  };
}

function startOfToday(): Date {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

interface EmojiRecord {
  id: string;
  emojiChar: string;
  slug: string;
  unicodeCodepoint: string | null;
  htmlDecimal: string | null;
  htmlHex: string | null;
  shortcode: string | null;
  emojiVersion: string | null;
  unicodeVersion: string | null;
  categoryId: string | null;
  subcategoryId: string | null;
  sortOrder: number;
  status: string;
  manualWeight: number;
  createdAt: Date;
  updatedAt: Date;
  category?: any;
  translations?: any[];
}

@Injectable()
export class AdminEmojiService {
  private readonly logger = new Logger(AdminEmojiService.name);

  constructor(private readonly prisma: PrismaService) {}

  // ─── Dashboard ─────────────────────────────────────────

  async getDashboard(admin: AdminJwtPayload) {
    const todayStart = startOfToday();

    const [
      emojiTotal,
      publishedEmojiTotal,
      draftEmojiTotal,
      archivedEmojiTotal,
      categoryTotal,
      topicTotal,
      todaySearchTotal,
      todayCopyTotal,
      recentEmojis,
    ] = await Promise.all([
      this.prisma.emoji.count(),
      this.prisma.emoji.count({ where: { status: 'published' } }),
      this.prisma.emoji.count({ where: { status: 'draft' } }),
      this.prisma.emoji.count({ where: { status: 'archived' } }),
      this.prisma.category.count(),
      this.prisma.topic.count(),
      this.prisma.searchLog.count({ where: { createdAt: { gte: todayStart } } }),
      this.prisma.copyEvent.count({ where: { createdAt: { gte: todayStart } } }),
      this.prisma.emoji.findMany({
        orderBy: { updatedAt: 'desc' },
        take: 5,
        include: {
          translations: true,
          category: {
            include: { translations: true },
          },
        },
      }),
    ]);

    return {
      stats: {
        emojiTotal,
        publishedEmojiTotal,
        draftEmojiTotal,
        archivedEmojiTotal,
        categoryTotal,
        topicTotal,
        todaySearchTotal,
        todayCopyTotal,
      },
      recentEmojis: recentEmojis.map((e: EmojiRecord) => this.formatRecentEmoji(e)),
      admin: {
        id: admin.sub,
        email: admin.email,
        name: admin.name ?? null,
        role: admin.role,
      },
    };
  }

  private formatRecentEmoji(emoji: EmojiRecord) {
    const zh = emoji.translations?.find((t: any) => t.locale === 'zh');
    const en = emoji.translations?.find((t: any) => t.locale === 'en');
    return {
      id: emoji.id,
      emojiChar: emoji.emojiChar,
      slug: emoji.slug,
      status: emoji.status,
      updatedAt: emoji.updatedAt,
      name: zh?.name ?? en?.name ?? null,
      previewLinks: previewLinks(emoji.slug),
    };
  }

  // ─── List ──────────────────────────────────────────────

  async list(query: AdminEmojiListQuery) {
    const { page, limit, q, categoryId, status } = query;

    const where: Record<string, unknown> = {};

    if (categoryId) {
      where.categoryId = categoryId;
    }

    if (status && status !== 'all') {
      where.status = status;
    }

    if (q) {
      where.OR = [
        { emojiChar: { contains: q, mode: 'insensitive' } },
        { slug: { contains: q, mode: 'insensitive' } },
        { unicodeCodepoint: { contains: q, mode: 'insensitive' } },
        { shortcode: { contains: q, mode: 'insensitive' } },
        {
          translations: {
            some: {
              OR: [
                { name: { contains: q, mode: 'insensitive' } },
                { shortName: { contains: q, mode: 'insensitive' } },
                { oneLineMeaning: { contains: q, mode: 'insensitive' } },
              ],
            },
          },
        },
      ];
    }

    const [emojis, total] = await Promise.all([
      this.prisma.emoji.findMany({
        where: where as any,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: [{ status: 'asc' }, { updatedAt: 'desc' }],
        include: {
          category: {
            include: { translations: true },
          },
          translations: true,
        },
      }),
      this.prisma.emoji.count({ where: where as any }),
    ]);

    const data = emojis.map((emoji: EmojiRecord) => this.formatEmojiListItem(emoji));

    return {
      data,
      meta: buildPaginationMeta(page, limit, total),
    };
  }

  private formatEmojiListItem(emoji: EmojiRecord) {
    const zh = emoji.translations?.find((t: any) => t.locale === 'zh');
    const en = emoji.translations?.find((t: any) => t.locale === 'en');
    const categoryName =
      emoji.category?.translations?.find((t: any) => t.locale === 'zh')?.name ??
      emoji.category?.translations?.find((t: any) => t.locale === 'en')?.name ??
      null;

    return {
      id: emoji.id,
      emojiChar: emoji.emojiChar,
      slug: emoji.slug,
      unicodeCodepoint: emoji.unicodeCodepoint,
      shortcode: emoji.shortcode,
      category: emoji.category
        ? {
            id: emoji.category.id,
            slug: emoji.category.slug,
            iconEmoji: emoji.category.iconEmoji,
            name: categoryName,
          }
        : null,
      status: emoji.status,
      updatedAt: emoji.updatedAt,
      manualWeight: emoji.manualWeight,
      translations: {
        zh: {
          name: zh?.name ?? null,
          complete: !!zh?.name,
        },
        en: {
          name: en?.name ?? null,
          complete: !!en?.name,
        },
      },
      previewLinks: previewLinks(emoji.slug),
    };
  }

  // ─── Detail ────────────────────────────────────────────

  async getById(id: string) {
    const emoji = await this.prisma.emoji.findUnique({
      where: { id },
      include: {
        category: {
          include: { translations: true },
        },
        translations: true,
      },
    });

    if (!emoji) {
      throw new NotFoundException(`Emoji with id "${id}" not found`);
    }

    return {
      data: this.formatEmojiDetail(emoji as EmojiRecord),
    };
  }

  private formatEmojiDetail(emoji: EmojiRecord) {
    const categoryName =
      emoji.category?.translations?.find((t: any) => t.locale === 'zh')?.name ??
      emoji.category?.translations?.find((t: any) => t.locale === 'en')?.name ??
      null;

    const formatTranslation = (locale: string) => {
      const t = emoji.translations?.find((x: any) => x.locale === locale);
      if (!t) return null;
      return {
        locale: t.locale,
        name: t.name,
        shortName: t.shortName,
        oneLineMeaning: t.oneLineMeaning,
        meaning: t.meaning,
        usageNotes: t.usageNotes,
        formalUsageNotes: t.formalUsageNotes,
        informalUsageNotes: t.informalUsageNotes,
        socialUsageNotes: t.socialUsageNotes,
        examples: t.examples,
        keywords: t.keywords,
        faqJson: t.faqJson,
        seoTitle: t.seoTitle,
        seoDescription: t.seoDescription,
        status: t.status,
        reviewStatus: t.reviewStatus,
      };
    };

    return {
      id: emoji.id,
      emojiChar: emoji.emojiChar,
      slug: emoji.slug,
      unicodeCodepoint: emoji.unicodeCodepoint,
      htmlDecimal: emoji.htmlDecimal,
      htmlHex: emoji.htmlHex,
      shortcode: emoji.shortcode,
      emojiVersion: emoji.emojiVersion,
      unicodeVersion: emoji.unicodeVersion,
      categoryId: emoji.categoryId,
      subcategoryId: emoji.subcategoryId,
      status: emoji.status,
      manualWeight: emoji.manualWeight,
      createdAt: emoji.createdAt,
      updatedAt: emoji.updatedAt,
      category: emoji.category
        ? {
            id: emoji.category.id,
            slug: emoji.category.slug,
            iconEmoji: emoji.category.iconEmoji,
            name: categoryName,
          }
        : null,
      translations: {
        zh: formatTranslation('zh'),
        en: formatTranslation('en'),
      },
      previewLinks: previewLinks(emoji.slug),
    };
  }

  // ─── Create ────────────────────────────────────────────

  async create(input: AdminEmojiCreateInput, admin: AdminJwtPayload) {
    const existing = await this.prisma.emoji.findUnique({ where: { slug: input.slug } });
    if (existing) {
      throw new BadRequestException(`slug "${input.slug}" 已存在`);
    }

    if (input.categoryId) {
      const category = await this.prisma.category.findUnique({
        where: { id: input.categoryId },
      });
      if (!category) {
        throw new BadRequestException(`categoryId "${input.categoryId}" 无效`);
      }
    }

    const emoji = await this.prisma.$transaction(async (tx: any) => {
      const created = await tx.emoji.create({
        data: {
          emojiChar: input.emojiChar,
          slug: input.slug,
          unicodeCodepoint: input.unicodeCodepoint ?? null,
          htmlDecimal: input.htmlDecimal ?? null,
          htmlHex: input.htmlHex ?? null,
          shortcode: input.shortcode ?? null,
          emojiVersion: input.emojiVersion ?? null,
          unicodeVersion: input.unicodeVersion ?? null,
          categoryId: input.categoryId ?? null,
          status: input.status,
          manualWeight: input.manualWeight ?? 0,
        },
      });

      await this.writeTranslations(tx, created.id, input.translations.zh, input.translations.en);
      return created;
    });

    const full = await this.prisma.emoji.findUnique({
      where: { id: emoji.id },
      include: { translations: true, category: { include: { translations: true } } },
    });

    await this.recordAudit({
      adminUserId: admin.sub,
      action: 'emoji.create',
      entityType: 'emoji',
      entityId: emoji.id,
      newData: this.snapshot(full as EmojiRecord),
    });

    return { data: this.formatEmojiDetail(full as EmojiRecord) };
  }

  // ─── Update ────────────────────────────────────────────

  async update(id: string, input: AdminEmojiUpdateInput, admin: AdminJwtPayload) {
    const existing = await this.prisma.emoji.findUnique({
      where: { id },
      include: { translations: true },
    });
    if (!existing) {
      throw new NotFoundException(`Emoji with id "${id}" not found`);
    }

    if (input.slug && input.slug !== existing.slug) {
      const slugConflict = await this.prisma.emoji.findUnique({
        where: { slug: input.slug },
      });
      if (slugConflict) {
        throw new BadRequestException(`slug "${input.slug}" 已存在`);
      }
    }

    if (input.categoryId !== undefined && input.categoryId) {
      const category = await this.prisma.category.findUnique({
        where: { id: input.categoryId },
      });
      if (!category) {
        throw new BadRequestException(`categoryId "${input.categoryId}" 无效`);
      }
    }

    const oldSnapshot = this.snapshot(existing as EmojiRecord);

    const updated = await this.prisma.$transaction(async (tx: any) => {
      const data: Record<string, unknown> = {};
      if (input.emojiChar !== undefined) data.emojiChar = input.emojiChar;
      if (input.slug !== undefined) data.slug = input.slug;
      if (input.unicodeCodepoint !== undefined) data.unicodeCodepoint = input.unicodeCodepoint ?? null;
      if (input.htmlDecimal !== undefined) data.htmlDecimal = input.htmlDecimal ?? null;
      if (input.htmlHex !== undefined) data.htmlHex = input.htmlHex ?? null;
      if (input.shortcode !== undefined) data.shortcode = input.shortcode ?? null;
      if (input.emojiVersion !== undefined) data.emojiVersion = input.emojiVersion ?? null;
      if (input.unicodeVersion !== undefined) data.unicodeVersion = input.unicodeVersion ?? null;
      if (input.categoryId !== undefined) data.categoryId = input.categoryId ?? null;
      if (input.status !== undefined) data.status = input.status;
      if (input.manualWeight !== undefined) data.manualWeight = input.manualWeight;

      const updatedEmoji = await tx.emoji.update({ where: { id }, data });

      if (input.translations?.zh) {
        await this.upsertTranslation(tx, id, 'zh', input.translations.zh);
      }
      if (input.translations?.en) {
        await this.upsertTranslation(tx, id, 'en', input.translations.en);
      }

      return updatedEmoji;
    });

    const full = await this.prisma.emoji.findUnique({
      where: { id: updated.id },
      include: { translations: true, category: { include: { translations: true } } },
    });

    await this.recordAudit({
      adminUserId: admin.sub,
      action: 'emoji.update',
      entityType: 'emoji',
      entityId: id,
      oldData: oldSnapshot,
      newData: this.snapshot(full as EmojiRecord),
    });

    return { data: this.formatEmojiDetail(full as EmojiRecord) };
  }

  // ─── Status ────────────────────────────────────────────

  async setStatus(id: string, status: EmojiStatusValue, admin: AdminJwtPayload) {
    const existing = await this.prisma.emoji.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException(`Emoji with id "${id}" not found`);
    }
    if (existing.status === status) {
      return { data: { id, status } };
    }

    const oldStatus = existing.status;
    await this.prisma.emoji.update({ where: { id }, data: { status } });

    await this.recordAudit({
      adminUserId: admin.sub,
      action: 'emoji.status_update',
      entityType: 'emoji',
      entityId: id,
      oldData: { status: oldStatus },
      newData: { status },
    });

    return { data: { id, status } };
  }

  // ─── Category options ──────────────────────────────────

  async categoryOptions(locale: string) {
    const categories = await this.prisma.category.findMany({
      orderBy: [{ sortOrder: 'asc' }, { id: 'asc' }],
      include: {
        translations: { where: { locale: locale as any } },
      },
    });

    return {
      data: categories.map((cat: any) => ({
        id: cat.id,
        slug: cat.slug,
        iconEmoji: cat.iconEmoji,
        name: cat.translations[0]?.name ?? null,
      })),
    };
  }

  // ─── Helpers ──────────────────────────────────────────

  private async writeTranslations(
    tx: any,
    emojiId: string,
    zh: EmojiTranslationInput,
    en: EmojiTranslationInput,
  ) {
    await tx.emojiTranslation.create({
      data: this.translationCreateData(emojiId, 'zh', zh),
    });
    await tx.emojiTranslation.create({
      data: this.translationCreateData(emojiId, 'en', en),
    });
  }

  private translationCreateData(
    emojiId: string,
    locale: 'zh' | 'en',
    t: EmojiTranslationInput,
  ) {
    return {
      emojiId,
      locale,
      name: t.name,
      shortName: t.shortName ?? null,
      oneLineMeaning: t.oneLineMeaning ?? null,
      meaning: t.meaning ?? null,
      usageNotes: t.usageNotes ?? null,
      formalUsageNotes: t.formalUsageNotes ?? null,
      informalUsageNotes: t.informalUsageNotes ?? null,
      socialUsageNotes: t.socialUsageNotes ?? null,
      examples: t.examples ?? [],
      keywords: t.keywords ?? [],
      faqJson: t.faqJson ?? [],
      seoTitle: t.seoTitle ?? null,
      seoDescription: t.seoDescription ?? null,
      status: t.status ?? 'draft',
      reviewStatus: t.reviewStatus ?? 'pending',
    };
  }

  private async upsertTranslation(
    tx: any,
    emojiId: string,
    locale: 'zh' | 'en',
    t: Partial<EmojiTranslationInput>,
  ) {
    const data: Record<string, unknown> = {};
    if (t.name !== undefined) data.name = t.name;
    if (t.shortName !== undefined) data.shortName = t.shortName ?? null;
    if (t.oneLineMeaning !== undefined) data.oneLineMeaning = t.oneLineMeaning ?? null;
    if (t.meaning !== undefined) data.meaning = t.meaning ?? null;
    if (t.usageNotes !== undefined) data.usageNotes = t.usageNotes ?? null;
    if (t.formalUsageNotes !== undefined) data.formalUsageNotes = t.formalUsageNotes ?? null;
    if (t.informalUsageNotes !== undefined) data.informalUsageNotes = t.informalUsageNotes ?? null;
    if (t.socialUsageNotes !== undefined) data.socialUsageNotes = t.socialUsageNotes ?? null;
    if (t.examples !== undefined) data.examples = t.examples ?? [];
    if (t.keywords !== undefined) data.keywords = t.keywords ?? [];
    if (t.faqJson !== undefined) data.faqJson = t.faqJson ?? [];
    if (t.seoTitle !== undefined) data.seoTitle = t.seoTitle ?? null;
    if (t.seoDescription !== undefined) data.seoDescription = t.seoDescription ?? null;
    if (t.status !== undefined) data.status = t.status;
    if (t.reviewStatus !== undefined) data.reviewStatus = t.reviewStatus;

    await tx.emojiTranslation.upsert({
      where: { emojiId_locale: { emojiId, locale } },
      create: {
        emojiId,
        locale,
        name: (t.name as string) ?? '',
        ...data,
      },
      update: data,
    });
  }

  private snapshot(emoji: EmojiRecord): Record<string, unknown> {
    const pickTranslation = (locale: string) => {
      const t = emoji.translations?.find((x: any) => x.locale === locale);
      if (!t) return null;
      return {
        name: t.name,
        shortName: t.shortName,
        oneLineMeaning: t.oneLineMeaning,
        meaning: t.meaning,
        usageNotes: t.usageNotes,
        formalUsageNotes: t.formalUsageNotes,
        informalUsageNotes: t.informalUsageNotes,
        socialUsageNotes: t.socialUsageNotes,
        examples: t.examples,
        keywords: t.keywords,
        faqJson: t.faqJson,
        seoTitle: t.seoTitle,
        seoDescription: t.seoDescription,
        status: t.status,
        reviewStatus: t.reviewStatus,
      };
    };

    return {
      emojiChar: emoji.emojiChar,
      slug: emoji.slug,
      unicodeCodepoint: emoji.unicodeCodepoint,
      htmlDecimal: emoji.htmlDecimal,
      htmlHex: emoji.htmlHex,
      shortcode: emoji.shortcode,
      emojiVersion: emoji.emojiVersion,
      unicodeVersion: emoji.unicodeVersion,
      categoryId: emoji.categoryId,
      status: emoji.status,
      manualWeight: emoji.manualWeight,
      translations: {
        zh: pickTranslation('zh'),
        en: pickTranslation('en'),
      },
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
