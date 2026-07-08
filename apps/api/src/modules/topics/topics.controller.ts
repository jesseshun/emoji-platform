import { Controller, Get, Param, Query } from '@nestjs/common';
import { TopicsService } from './topics.service';
import { parseTopicListQuery, parseTopicDetailQuery } from './dto/topic-query.dto';

@Controller('topics')
export class TopicsController {
  constructor(private readonly topicsService: TopicsService) {}

  @Get()
  async list(@Query() query: Record<string, string | undefined>) {
    const parsed = parseTopicListQuery(query);
    const result = await this.topicsService.list(parsed);
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
    const parsed = parseTopicDetailQuery(query);
    const result = await this.topicsService.findBySlug(slug, parsed);
    return {
      success: true,
      data: result.data,
    };
  }
}
