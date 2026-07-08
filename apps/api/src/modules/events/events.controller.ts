import { Controller, Post, Body } from '@nestjs/common';
import { EventsService } from './events.service';
import { CopyEventBody, parseCopyEventBody } from './dto/copy-event.dto';

@Controller('events')
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  @Post('copy')
  async recordCopy(@Body() body: CopyEventBody) {
    const parsed = parseCopyEventBody(body);
    const result = await this.eventsService.recordCopy(parsed);
    return {
      success: true,
      data: result,
    };
  }
}
