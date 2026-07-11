import { Controller, Get, Query } from '@nestjs/common';
import { SitemapService, SitemapEntry } from './sitemap.service';

function parseLimit(value: string | undefined): number {
  const n = Number(value);
  if (!Number.isFinite(n) || n <= 0) return SitemapService.MAX_LIMIT;
  return Math.min(Math.floor(n), SitemapService.MAX_LIMIT);
}

function parseOffset(value: string | undefined): number {
  const n = Number(value);
  if (!Number.isFinite(n) || n < 0) return 0;
  return Math.floor(n);
}

/**
 * Public, unauthenticated read-only endpoints that feed sitemap generation.
 * They only ever return published entities (slug + timestamps); no admin
 * auth, no backend fields, no passwordHash.
 */
@Controller('sitemap')
export class SitemapController {
  constructor(private readonly sitemapService: SitemapService) {}

  @Get('emojis')
  async emojis(
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
  ): Promise<{ success: true; data: SitemapEntry[] }> {
    const data = await this.sitemapService.getEmojis(parseLimit(limit), parseOffset(offset));
    return { success: true, data };
  }

  @Get('categories')
  async categories(
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
  ): Promise<{ success: true; data: SitemapEntry[] }> {
    const data = await this.sitemapService.getCategories(parseLimit(limit), parseOffset(offset));
    return { success: true, data };
  }

  @Get('topics')
  async topics(
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
  ): Promise<{ success: true; data: SitemapEntry[] }> {
    const data = await this.sitemapService.getTopics(parseLimit(limit), parseOffset(offset));
    return { success: true, data };
  }

  @Get('articles')
  async articles(
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
  ): Promise<{ success: true; data: SitemapEntry[] }> {
    const data = await this.sitemapService.getArticles(parseLimit(limit), parseOffset(offset));
    return { success: true, data };
  }
}
