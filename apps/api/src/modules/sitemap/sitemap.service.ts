import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

export interface SitemapEntry {
  slug: string;
  updatedAt: string;
  createdAt: string;
}

/**
 * Read-only public data source for sitemap generation.
 *
 * Only returns PUBLISHED entities (draft / archived are excluded) and never
 * exposes backend fields, passwordHash, or admin data. This service is meant
 * to be consumed by apps/web route handlers so that the web app never imports
 * Prisma directly.
 */
@Injectable()
export class SitemapService {
  private readonly logger = new Logger(SitemapService.name);

  /** Hard upper bound per sitemap slice (sitemap.org limit is 50,000 URLs). */
  static readonly MAX_LIMIT = 50_000;

  constructor(private readonly prisma: PrismaService) {}

  async getEmojis(limit = SitemapService.MAX_LIMIT, offset = 0): Promise<SitemapEntry[]> {
    return this.query('emoji', limit, offset);
  }

  async getCategories(limit = SitemapService.MAX_LIMIT, offset = 0): Promise<SitemapEntry[]> {
    return this.query('category', limit, offset);
  }

  async getTopics(limit = SitemapService.MAX_LIMIT, offset = 0): Promise<SitemapEntry[]> {
    return this.query('topic', limit, offset);
  }

  async getArticles(limit = SitemapService.MAX_LIMIT, offset = 0): Promise<SitemapEntry[]> {
    // Forward-compatible: article frontend pages are not implemented yet
    // (Phase 5B), but the data endpoint is ready so the web sitemap can be
    // enabled without API changes once article pages ship.
    return this.query('article', limit, offset);
  }

  private async query(
    model: 'emoji' | 'category' | 'topic' | 'article',
    limit: number,
    offset: number,
  ): Promise<SitemapEntry[]> {
    const take = Math.min(Math.max(1, Math.floor(limit)), SitemapService.MAX_LIMIT);
    const skip = Math.max(0, Math.floor(offset));

    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const delegate = (this.prisma as any)[model];
      const rows = await delegate.findMany({
        where: { status: 'published' },
        select: { slug: true, updatedAt: true, createdAt: true },
        orderBy: { updatedAt: 'desc' },
        take,
        skip,
      });

      return (rows as Array<{ slug: string | null; updatedAt: Date; createdAt: Date }>)
        .filter((r) => r.slug && r.slug.trim() !== '')
        .map((r) => ({
          slug: r.slug as string,
          updatedAt: r.updatedAt.toISOString(),
          createdAt: r.createdAt.toISOString(),
        }));
    } catch (error) {
      this.logger.error(`sitemap query failed for ${model}`, error instanceof Error ? error.stack : String(error));
      return [];
    }
  }
}
