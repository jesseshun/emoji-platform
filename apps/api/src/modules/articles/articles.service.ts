import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ArticleListQuery, ArticleDetailQuery } from './dto/article-query.dto';
import { buildPaginationMeta } from '@emoji-platform/types';

/**
 * Public, read-only article data source for the frontend.
 *
 * Security / scope boundaries (Phase 5B):
 * - Only ever returns PUBLISHED articles (draft / archived are excluded).
 * - Never returns backend / admin fields, passwordHash, JWT_SECRET, or any
 *   plaintext sensitive data. The author is reduced to a display `name` only
 *   (no id / email / role).
 * - If a published article has no translation for the requested locale, the
 *   detail endpoint returns 404 (no empty pages, no fabricated translation).
 */
@Injectable()
export class ArticlesService {
  private readonly logger = new Logger(ArticlesService.name);

  constructor(private readonly prisma: PrismaService) {}

  async list(query: ArticleListQuery) {
    const { locale, page, limit } = query;

    const [articles, total] = await Promise.all([
      this.prisma.article.findMany({
        where: { status: 'published' },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: [{ publishedAt: 'desc' }, { id: 'asc' }],
        include: {
          translations: { where: { locale } },
        },
      }),
      this.prisma.article.count({ where: { status: 'published' } }),
    ]);

    const data = articles.map((article) => ({
      id: article.id,
      slug: article.slug,
      coverImage: article.coverImage,
      publishedAt: article.publishedAt,
      status: article.status,
      translation: article.translations[0]
        ? {
            locale: article.translations[0].locale,
            title: article.translations[0].title,
            summary: article.translations[0].summary,
            seoTitle: article.translations[0].seoTitle,
            seoDescription: article.translations[0].seoDescription,
          }
        : null,
    }));

    return {
      data,
      meta: buildPaginationMeta(page, limit, total),
    };
  }

  async findBySlug(slug: string, query: ArticleDetailQuery) {
    const { locale } = query;

    const article = await this.prisma.article.findFirst({
      where: { slug, status: 'published' },
      include: {
        translations: { where: { locale } },
      },
    });

    if (!article) {
      throw new NotFoundException(`Article with slug "${slug}" not found`);
    }

    const translation = article.translations[0];
    if (!translation) {
      // Published article exists but has no translation for the requested
      // locale: return 404 instead of rendering an empty / undefined page.
      throw new NotFoundException(`Article "${slug}" has no ${locale} translation`);
    }

    // Resolve author display name only (never expose admin id / email / role).
    let author: { name: string } | null = null;
    if (article.authorId) {
      const admin = await this.prisma.adminUser.findUnique({
        where: { id: article.authorId },
        select: { name: true },
      });
      if (admin && admin.name) {
        author = { name: admin.name };
      }
    }

    // Related articles: latest published articles excluding the current one.
    const related = await this.prisma.article.findMany({
      where: {
        status: 'published',
        id: { not: article.id },
      },
      take: 6,
      orderBy: [{ publishedAt: 'desc' }, { id: 'asc' }],
      include: {
        translations: { where: { locale } },
      },
    });

    return {
      data: {
        article: {
          id: article.id,
          slug: article.slug,
          coverImage: article.coverImage,
          publishedAt: article.publishedAt,
          updatedAt: article.updatedAt,
          status: article.status,
          author,
          translation: {
            locale: translation.locale,
            title: translation.title,
            summary: translation.summary,
            content: translation.content,
            seoTitle: translation.seoTitle,
            seoDescription: translation.seoDescription,
            keywords: translation.keywords,
          },
        },
        relatedArticles: related.map((a) => ({
          id: a.id,
          slug: a.slug,
          coverImage: a.coverImage,
          publishedAt: a.publishedAt,
          translation: a.translations[0]
            ? {
                locale: a.translations[0].locale,
                title: a.translations[0].title,
                summary: a.translations[0].summary,
              }
            : null,
        })),
      },
    };
  }
}
