import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ParsedCopyEvent } from './dto/copy-event.dto';

@Injectable()
export class EventsService {
  private readonly logger = new Logger(EventsService.name);

  constructor(private readonly prisma: PrismaService) {}

  async recordCopy(data: ParsedCopyEvent) {
    // Validate emoji exists
    const emoji = await this.prisma.emoji.findUnique({
      where: { id: data.emojiId },
    });

    if (!emoji) {
      throw new NotFoundException(`Emoji with id "${data.emojiId}" not found`);
    }

    await this.prisma.copyEvent.create({
      data: {
        emojiId: data.emojiId,
        locale: data.locale,
        pageUrl: data.pageUrl ?? null,
        ipHash: null, // left empty for now
      },
    });

    this.logger.log(`Copy event recorded for emoji ${emoji.emojiChar} (${data.emojiId})`);

    return { recorded: true };
  }
}
