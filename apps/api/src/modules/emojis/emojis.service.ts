/* eslint-disable @typescript-eslint/no-explicit-any */
import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { EmojiListQuery, EmojiDetailQuery } from './dto/emoji-query.dto';
import { buildPaginationMeta } from '@emoji-platform/types';

@Injectable()
export class EmojisService {
  private readonly logger = new Logger(EmojisService.name);

  constructor(private readonly prisma: PrismaService) {}

  async list(query: EmojiListQuery) {
    const { locale, page, limit, category, q } = query;

    const where: Record<string, unknown> = {
      status: 'published',
    };

    // Filter by category slug
    if (category) {
      where.category = {
        slug: category,
        status: 'published',
      };
    }

    // Basic search
    if (q) {
      where.OR = [
        { emojiChar: { contains: q, mode: 'insensitive' } },
        { slug: { contains: q, mode: 'insensitive' } },
        { unicodeCodepoint: { contains: q, mode: 'insensitive' } },
        { shortcode: { contains: q, mode: 'insensitive' } },
        {
          translations: {
            some: {
              locale,
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
        orderBy: [{ sortOrder: 'asc' }, { id: 'asc' }],
        include: {
          category: {
            include: {
              translations: {
                where: { locale },
              },
            },
          },
          translations: {
            where: { locale },
          },
        },
      }),
      this.prisma.emoji.count({ where: where as any }),
    ]);

    const data = emojis.map((emoji) => this.formatEmojiListItem(emoji, locale));

    return {
      data,
      meta: buildPaginationMeta(page, limit, total),
    };
  }

  async findBySlug(slug: string, query: EmojiDetailQuery) {
    const { locale } = query;

    const emoji = await this.prisma.emoji.findFirst({
      where: { slug, status: 'published' },
      include: {
        category: {
          include: {
            translations: { where: { locale } },
          },
        },
        subcategory: {
          include: {
            translations: { where: { locale } },
          },
        },
        translations: {
          where: { locale },
        },
        assets: {
          where: { status: 'published' },
          take: 10,
        },
        topicEmojis: {
          include: {
            topic: {
              include: {
                translations: { where: { locale } },
              },
            },
          },
          where: {
            topic: { status: 'published' },
          },
          take: 6,
          orderBy: { sortOrder: 'asc' },
        },
      },
    });

    if (!emoji) {
      throw new NotFoundException(`Emoji with slug "${slug}" not found`);
    }

    // Related emojis: same category, excluding current, max 12
    const relatedEmojis = emoji.categoryId
      ? await this.prisma.emoji.findMany({
          where: {
            categoryId: emoji.categoryId,
            status: 'published',
            id: { not: emoji.id },
          },
          take: 12,
          orderBy: [{ sortOrder: 'asc' }, { id: 'asc' }],
          include: {
            translations: { where: { locale } },
          },
        })
      : [];

    // Related topics from bindings
    let relatedTopics = emoji.topicEmojis.map((te) => te.topic);

    // If no bound topics, return latest published topics (max 3)
    if (relatedTopics.length === 0) {
      relatedTopics = await this.prisma.topic.findMany({
        where: { status: 'published' },
        take: 3,
        orderBy: [{ publishedAt: 'desc' }, { sortOrder: 'asc' }],
        include: {
          translations: { where: { locale } },
        },
      });
    }

    return {
      data: this.formatEmojiDetail(emoji, locale, relatedEmojis, relatedTopics),
    };
  }

  // ─── Formatters ──────────────────────────────────────

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private formatEmojiListItem(emoji: any, _locale: string) {
    const translation = emoji.translations[0] ?? null;
    return {
      id: emoji.id,
      emojiChar: emoji.emojiChar,
      slug: emoji.slug,
      unicodeCodepoint: emoji.unicodeCodepoint,
      shortcode: emoji.shortcode,
      emojiVersion: emoji.emojiVersion,
      unicodeVersion: emoji.unicodeVersion,
      category: emoji.category
        ? {
            id: emoji.category.id,
            slug: emoji.category.slug,
            iconEmoji: emoji.category.iconEmoji,
            name: emoji.category.translations[0]?.name ?? null,
          }
        : null,
      translation: translation
        ? {
            locale: translation.locale,
            name: translation.name,
            shortName: translation.shortName,
            oneLineMeaning: translation.oneLineMeaning,
            keywords: translation.keywords,
            seoTitle: translation.seoTitle,
            seoDescription: translation.seoDescription,
          }
        : null,
    };
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private formatEmojiDetail(emoji: any, _locale: string, relatedEmojis: any[], relatedTopics: any[]) {
    const translation = emoji.translations[0] ?? null;
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
      status: emoji.status,
      category: emoji.category
        ? {
            id: emoji.category.id,
            slug: emoji.category.slug,
            iconEmoji: emoji.category.iconEmoji,
            name: emoji.category.translations[0]?.name ?? null,
          }
        : null,
      subcategory: emoji.subcategory
        ? {
            id: emoji.subcategory.id,
            slug: emoji.subcategory.slug,
            iconEmoji: emoji.subcategory.iconEmoji,
            name: emoji.subcategory.translations[0]?.name ?? null,
          }
        : null,
      translation: translation
        ? {
            locale: translation.locale,
            name: translation.name,
            shortName: translation.shortName,
            oneLineMeaning: translation.oneLineMeaning,
            meaning: translation.meaning,
            usageNotes: translation.usageNotes,
            formalUsageNotes: translation.formalUsageNotes,
            informalUsageNotes: translation.informalUsageNotes,
            socialUsageNotes: translation.socialUsageNotes,
            examples: translation.examples,
            keywords: translation.keywords,
            faqJson: translation.faqJson,
            seoTitle: translation.seoTitle,
            seoDescription: translation.seoDescription,
          }
        : null,
      assets: emoji.assets.map((asset: any) => ({
        id: asset.id,
        provider: asset.provider,
        fileType: asset.fileType,
        fileUrl: asset.fileUrl,
        width: asset.width,
        height: asset.height,
        licenseName: asset.licenseName,
        licenseUrl: asset.licenseUrl,
        attribution: asset.attribution,
      })),
      relatedEmojis: relatedEmojis.map((e) => ({
        id: e.id,
        emojiChar: e.emojiChar,
        slug: e.slug,
        shortcode: e.shortcode,
        translation: e.translations[0]
          ? {
              locale: e.translations[0].locale,
              name: e.translations[0].name,
              shortName: e.translations[0].shortName,
              oneLineMeaning: e.translations[0].oneLineMeaning,
            }
          : null,
      })),
      relatedTopics: relatedTopics.map((t) => ({
        id: t.id,
        slug: t.slug,
        topicType: t.topicType,
        coverImage: t.coverImage,
        translation: t.translations[0]
          ? {
              locale: t.translations[0].locale,
              title: t.translations[0].title,
              summary: t.translations[0].summary,
            }
          : null,
      })),
    };
  }
}
