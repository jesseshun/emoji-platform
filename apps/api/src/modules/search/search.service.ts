/* eslint-disable @typescript-eslint/no-explicit-any */
import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { SearchQuery } from './dto/search-query.dto';
import { buildPaginationMeta } from '@emoji-platform/types';

@Injectable()
export class SearchService {
  private readonly logger = new Logger(SearchService.name);

  constructor(private readonly prisma: PrismaService) {}

  async search(query: SearchQuery, userAgent?: string) {
    const { locale, q, page, limit } = query;

    // If query is empty, return empty results (no search log)
    if (!q) {
      return {
        data: [],
        meta: buildPaginationMeta(page, limit, 0),
      };
    }

    const where = {
      status: 'published' as const,
      OR: [
        { emojiChar: { contains: q, mode: 'insensitive' as const } },
        { slug: { contains: q, mode: 'insensitive' as const } },
        { unicodeCodepoint: { contains: q, mode: 'insensitive' as const } },
        { shortcode: { contains: q, mode: 'insensitive' as const } },
        {
          translations: {
            some: {
              locale,
              OR: [
                { name: { contains: q, mode: 'insensitive' as const } },
                { shortName: { contains: q, mode: 'insensitive' as const } },
                { oneLineMeaning: { contains: q, mode: 'insensitive' as const } },
              ],
            },
          },
        },
      ],
    };

    const [emojis, total] = await Promise.all([
      this.prisma.emoji.findMany({
        where: where as any,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: [{ sortOrder: 'asc' }, { id: 'asc' }],
        include: {
          category: {
            include: {
              translations: { where: { locale } },
            },
          },
          translations: { where: { locale } },
        },
      }),
      this.prisma.emoji.count({ where: where as any }),
    ]);

    // Record search log (fire-and-forget, don't fail the search)
    this.recordSearchLog(q, locale, total, userAgent).catch((err) => {
      this.logger.warn(`Failed to record search log: ${err.message}`);
    });

    const data = emojis.map((emoji) => {
      const translation = emoji.translations[0] ?? null;
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
              name: emoji.category.translations[0]?.name ?? null,
            }
          : null,
        translation: translation
          ? {
              name: translation.name,
              shortName: translation.shortName,
              oneLineMeaning: translation.oneLineMeaning,
              keywords: translation.keywords,
            }
          : null,
      };
    });

    return {
      data,
      meta: buildPaginationMeta(page, limit, total),
    };
  }

  private async recordSearchLog(
    q: string,
    locale: string,
    resultCount: number,
    userAgent?: string,
  ) {
    try {
      await this.prisma.searchLog.create({
        data: {
          query: q,
          locale: locale as any,
          resultCount,
          userAgent: userAgent ?? null,
          ipHash: null, // left empty for now
        },
      });
    } catch (error: any) {
      this.logger.warn(`Failed to write search log: ${error.message}`);
    }
  }
}
