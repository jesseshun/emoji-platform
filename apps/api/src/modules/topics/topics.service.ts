import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { TopicListQuery, TopicDetailQuery } from './dto/topic-query.dto';
import { buildPaginationMeta } from '@emoji-platform/types';

@Injectable()
export class TopicsService {
  private readonly logger = new Logger(TopicsService.name);

  constructor(private readonly prisma: PrismaService) {}

  async list(query: TopicListQuery) {
    const { locale, page, limit } = query;

    const [topics, total] = await Promise.all([
      this.prisma.topic.findMany({
        where: { status: 'published' },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: [{ sortOrder: 'asc' }, { publishedAt: 'desc' }, { id: 'asc' }],
        include: {
          translations: { where: { locale } },
        },
      }),
      this.prisma.topic.count({ where: { status: 'published' } }),
    ]);

    const data = topics.map((topic) => ({
      id: topic.id,
      slug: topic.slug,
      coverImage: topic.coverImage,
      topicType: topic.topicType,
      publishedAt: topic.publishedAt,
      translation: topic.translations[0]
        ? {
            locale: topic.translations[0].locale,
            title: topic.translations[0].title,
            summary: topic.translations[0].summary,
            seoTitle: topic.translations[0].seoTitle,
            seoDescription: topic.translations[0].seoDescription,
          }
        : null,
    }));

    return {
      data,
      meta: buildPaginationMeta(page, limit, total),
    };
  }

  async findBySlug(slug: string, query: TopicDetailQuery) {
    const { locale } = query;

    const topic = await this.prisma.topic.findFirst({
      where: { slug, status: 'published' },
      include: {
        translations: { where: { locale } },
      },
    });

    if (!topic) {
      throw new NotFoundException(`Topic with slug "${slug}" not found`);
    }

    // Fetch bound emojis
    const topicEmojis = await this.prisma.topicEmoji.findMany({
      where: { topicId: topic.id },
      include: {
        emoji: {
          include: {
            translations: { where: { locale } },
            category: {
              include: {
                translations: { where: { locale } },
              },
            },
          },
        },
      },
      orderBy: { sortOrder: 'asc' },
    });

    const emojis = topicEmojis.map((te) => ({
      id: te.emoji.id,
      emojiChar: te.emoji.emojiChar,
      slug: te.emoji.slug,
      unicodeCodepoint: te.emoji.unicodeCodepoint,
      shortcode: te.emoji.shortcode,
      category: te.emoji.category
        ? {
            id: te.emoji.category.id,
            slug: te.emoji.category.slug,
            name: te.emoji.category.translations[0]?.name ?? null,
          }
        : null,
      translation: te.emoji.translations[0]
        ? {
            locale: te.emoji.translations[0].locale,
            name: te.emoji.translations[0].name,
            shortName: te.emoji.translations[0].shortName,
            oneLineMeaning: te.emoji.translations[0].oneLineMeaning,
          }
        : null,
    }));

    // Related topics: latest published topics excluding current, max 6
    const relatedTopics = await this.prisma.topic.findMany({
      where: {
        status: 'published',
        id: { not: topic.id },
      },
      take: 6,
      orderBy: [{ publishedAt: 'desc' }, { sortOrder: 'asc' }],
      include: {
        translations: { where: { locale } },
      },
    });

    return {
      data: {
        topic: {
          id: topic.id,
          slug: topic.slug,
          coverImage: topic.coverImage,
          topicType: topic.topicType,
          publishedAt: topic.publishedAt,
          translation: topic.translations[0]
            ? {
                locale: topic.translations[0].locale,
                title: topic.translations[0].title,
                summary: topic.translations[0].summary,
                content: topic.translations[0].content,
                seoTitle: topic.translations[0].seoTitle,
                seoDescription: topic.translations[0].seoDescription,
                faqJson: topic.translations[0].faqJson,
              }
            : null,
        },
        emojis,
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
    };
  }
}
