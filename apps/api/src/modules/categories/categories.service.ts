/* eslint-disable @typescript-eslint/no-explicit-any */
import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CategoryListQuery, CategoryDetailQuery } from './dto/category-query.dto';
import { buildPaginationMeta } from '@emoji-platform/types';

@Injectable()
export class CategoriesService {
  private readonly logger = new Logger(CategoriesService.name);

  constructor(private readonly prisma: PrismaService) {}

  async list(query: CategoryListQuery) {
    const { locale } = query;

    const categories = await this.prisma.category.findMany({
      where: { status: 'published' },
      orderBy: [{ sortOrder: 'asc' }, { id: 'asc' }],
      include: {
        translations: { where: { locale } },
        _count: {
          select: {
            emojis: { where: { status: 'published' } },
            subEmojis: { where: { status: 'published' } },
          },
        },
      },
    });

    const data = categories.map((cat) => ({
      id: cat.id,
      slug: cat.slug,
      iconEmoji: cat.iconEmoji,
      parentId: cat.parentId,
      sortOrder: cat.sortOrder,
      emojiCount: cat._count.emojis + cat._count.subEmojis,
      translation: cat.translations[0]
        ? {
            locale: cat.translations[0].locale,
            name: cat.translations[0].name,
            description: cat.translations[0].description,
            seoTitle: cat.translations[0].seoTitle,
            seoDescription: cat.translations[0].seoDescription,
          }
        : null,
    }));

    return { data };
  }

  async findBySlug(slug: string, query: CategoryDetailQuery) {
    const { locale, page, limit } = query;

    const category = await this.prisma.category.findFirst({
      where: { slug, status: 'published' },
      include: {
        translations: { where: { locale } },
      },
    });

    if (!category) {
      throw new NotFoundException(`Category with slug "${slug}" not found`);
    }

    // Fetch emojis in this category
    const [emojis, emojiTotal] = await Promise.all([
      this.prisma.emoji.findMany({
        where: {
          categoryId: category.id,
          status: 'published',
        },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: [{ sortOrder: 'asc' }, { id: 'asc' }],
        include: {
          translations: { where: { locale } },
          category: {
            include: {
              translations: { where: { locale } },
            },
          },
        },
      }),
      this.prisma.emoji.count({
        where: {
          categoryId: category.id,
          status: 'published',
        },
      }),
    ]);

    // Related topics: topics containing emojis from this category
    const emojiIds = emojis.map((e) => e.id);
    let relatedTopics: any[] = [];
    if (emojiIds.length > 0) {
      const topicEmojis = await this.prisma.topicEmoji.findMany({
        where: {
          emojiId: { in: emojiIds },
          topic: { status: 'published' },
        },
        include: {
          topic: {
            include: {
              translations: { where: { locale } },
            },
          },
        },
        distinct: ['topicId'],
        take: 6,
      });
      relatedTopics = topicEmojis.map((te) => te.topic);
    }

    return {
      data: {
        category: {
          id: category.id,
          slug: category.slug,
          iconEmoji: category.iconEmoji,
          parentId: category.parentId,
          sortOrder: category.sortOrder,
          translation: category.translations[0]
            ? {
                locale: category.translations[0].locale,
                name: category.translations[0].name,
                description: category.translations[0].description,
                seoTitle: category.translations[0].seoTitle,
                seoDescription: category.translations[0].seoDescription,
              }
            : null,
        },
        emojis: emojis.map((emoji) => ({
          id: emoji.id,
          emojiChar: emoji.emojiChar,
          slug: emoji.slug,
          unicodeCodepoint: emoji.unicodeCodepoint,
          shortcode: emoji.shortcode,
          translation: emoji.translations[0]
            ? {
                locale: emoji.translations[0].locale,
                name: emoji.translations[0].name,
                shortName: emoji.translations[0].shortName,
                oneLineMeaning: emoji.translations[0].oneLineMeaning,
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
      },
      meta: buildPaginationMeta(page, limit, emojiTotal),
    };
  }
}
