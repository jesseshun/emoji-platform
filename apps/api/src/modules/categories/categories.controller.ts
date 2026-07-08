import { Controller, Get, Param, Query } from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { parseCategoryListQuery, parseCategoryDetailQuery } from './dto/category-query.dto';

@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Get()
  async list(@Query() query: Record<string, string | undefined>) {
    const parsed = parseCategoryListQuery(query);
    const result = await this.categoriesService.list(parsed);
    return {
      success: true,
      data: result.data,
    };
  }

  @Get(':slug')
  async detail(
    @Param('slug') slug: string,
    @Query() query: Record<string, string | undefined>,
  ) {
    const parsed = parseCategoryDetailQuery(query);
    const result = await this.categoriesService.findBySlug(slug, parsed);
    return {
      success: true,
      data: result.data,
      meta: result.meta,
    };
  }
}
