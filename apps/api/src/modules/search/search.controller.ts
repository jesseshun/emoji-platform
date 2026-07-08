import { Controller, Get, Query, Req } from '@nestjs/common';
import { Request } from 'express';
import { SearchService } from './search.service';
import { parseSearchQuery } from './dto/search-query.dto';

@Controller('search')
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @Get()
  async search(
    @Query() query: Record<string, string | undefined>,
    @Req() req: Request,
  ) {
    const parsed = parseSearchQuery(query);
    const userAgent = req.headers['user-agent'];
    const result = await this.searchService.search(parsed, userAgent);
    return {
      success: true,
      data: result.data,
      meta: result.meta,
    };
  }
}
