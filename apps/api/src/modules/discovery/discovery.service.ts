import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { DEFAULT_LOCALE, type Locale } from '@emoji-platform/types';

/**
 * Phase 6D DiscoveryService.
 *
 * Builds the homepage discovery module from published, public data only.
 *
 * - `featuredEmojis`: curated published emojis (sortOrder ascending).
 * - `featuredCategories`: all published categories (with emojiCount).
 * - `featuredTopics`: latest published topics.
 * - `latestArticles`: latest published articles.
 *
 * Rules / boundaries:
 * - Only ever returns PUBLISHED content (draft / archived excluded).
 * - No admin fields, no passwordHash / JWT_SECRET / plaintext IP.
 * - Pure database queries; does NOT depend on Meilisearch being available.
 * - No AI, no personalization, no user profiling.
 */
@Injectable()
export class DiscoveryService {
  private readonly logger = new Logger(DiscoveryService.name);

  constructor(private readonly prisma: PrismaService) {}

  async getHome(locale: Locale = DEFAULT_LOCALE) {
    const [emojis, categories, topics, articles] = await Promise.all([
      this.prisma.emoji.findMany({
        where: { status: 'published' },
        take: 12,
        orderBy: [{ sortOrder: 'asc' }, { id: 'asc' }],
        include: {
          translations: { where: { locale } },
          category: {
            include: { translations: { where: { locale } } },
          },
        },
      }),
      this.prisma.category.findMany({
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
      }),
      this.prisma.topic.findMany({
        where: { status: 'published' },
        take: 3,
        orderBy: [{ publishedAt: 'desc' }, { sortOrder: 'asc' }],
        include: { translations: { where: { locale } } },
      }),
      this.prisma.article.findMany({
        where: { status: 'published' },
        take: 4,
        orderBy: [{ publishedAt: 'desc' }, { id: 'asc' }],
        include: { translations: { where: { locale } } },
      }),
    ]);

    return {
      featuredEmojis: emojis.map((e) => this.formatEmojiListItem(e, locale)),
      featuredCategories: categories.map((c) => this.formatCategoryItem(c, locale)),
      featuredTopics: topics.map((t) => this.formatTopicItem(t, locale)),
      latestArticles: articles.map((a) => this.formatArticleItem(a, locale)),
    };
  }

  // ─── Formatters (public, published-only shapes) ──────

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private formatEmojiListItem(emoji: any, _locale: Locale) {
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
  private formatCategoryItem(category: any, _locale: Locale) {
    const translation = category.translations[0] ?? null;
    return {
      id: category.id,
      slug: category.slug,
      iconEmoji: category.iconEmoji,
      parentId: category.parentId,
      sortOrder: category.sortOrder,
      emojiCount: (category._count?.emojis ?? 0) + (category._count?.subEmojis ?? 0),
      translation: translation
        ? {
            locale: translation.locale,
            name: translation.name,
            description: translation.description,
            seoTitle: translation.seoTitle,
            seoDescription: translation.seoDescription,
          }
        : null,
    };
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private formatTopicItem(topic: any, _locale: Locale) {
    const translation = topic.translations[0] ?? null;
    return {
      id: topic.id,
      slug: topic.slug,
      coverImage: topic.coverImage,
      topicType: topic.topicType,
      publishedAt: topic.publishedAt,
      translation: translation
        ? {
            locale: translation.locale,
            title: translation.title,
            summary: translation.summary,
            seoTitle: translation.seoTitle,
            seoDescription: translation.seoDescription,
          }
        : null,
    };
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private formatArticleItem(article: any, _locale: Locale) {
    const translation = article.translations[0] ?? null;
    return {
      id: article.id,
      slug: article.slug,
      coverImage: article.coverImage,
      publishedAt: article.publishedAt,
      status: article.status,
      translation: translation
        ? {
            locale: translation.locale,
            title: translation.title,
            summary: translation.summary,
            seoTitle: translation.seoTitle,
            seoDescription: translation.seoDescription,
          }
        : null,
    };
  }
}
