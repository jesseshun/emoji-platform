import { Controller, Get, Param, Query } from '@nestjs/common';
import { EmojisService } from './emojis.service';
import { parseEmojiListQuery, parseEmojiDetailQuery } from './dto/emoji-query.dto';

@Controller('emojis')
export class EmojisController {
  constructor(private readonly emojisService: EmojisService) {}

  @Get()
  async list(@Query() query: Record<string, string | undefined>) {
    const parsed = parseEmojiListQuery(query);
    const result = await this.emojisService.list(parsed);
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
    const parsed = parseEmojiDetailQuery(query);
    const result = await this.emojisService.findBySlug(slug, parsed);
    return {
      success: true,
      data: result.data,
    };
  }
}
