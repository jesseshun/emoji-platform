import { Controller, Get, Param, Query } from '@nestjs/common';
import { ArticlesService } from './articles.service';
import { parseArticleListQuery, parseArticleDetailQuery } from './dto/article-query.dto';

/**
 * Public, unauthenticated article endpoints consumed by apps/web.
 * Only published articles are returned; no admin auth, no sensitive fields.
 */
@Controller('articles')
export class ArticlesController {
  constructor(private readonly articlesService: ArticlesService) {}

  @Get()
  async list(@Query() query: Record<string, string | undefined>) {
    const parsed = parseArticleListQuery(query);
    const result = await this.articlesService.list(parsed);
    return {
      success: true,
      data: result.data,
      meta: result.meta,
    };
  }

  @Get(':slug')
  async detail(
    @Param('slug') slug: string,
    @Query() query: Record<string, string | undefined>,
  ) {
    const parsed = parseArticleDetailQuery(query);
    const result = await this.articlesService.findBySlug(slug, parsed);
    return {
      success: true,
      data: result.data,
    };
  }
}
