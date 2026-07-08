import { DEFAULT_LOCALE, isLocale } from '@emoji-platform/types';
import { BadRequestException } from '@nestjs/common';

export interface CopyEventBody {
  emojiId: string;
  locale?: string;
  pageUrl?: string;
}

export interface ParsedCopyEvent {
  emojiId: string;
  locale: 'zh' | 'en';
  pageUrl?: string;
}

export function parseCopyEventBody(body: CopyEventBody): ParsedCopyEvent {
  if (!body.emojiId || typeof body.emojiId !== 'string') {
    throw new BadRequestException('emojiId is required and must be a string');
  }

  let locale: 'zh' | 'en' = DEFAULT_LOCALE;
  if (body.locale) {
    if (!isLocale(body.locale)) {
      throw new BadRequestException(`Invalid locale "${body.locale}". Supported: zh, en`);
    }
    locale = body.locale;
  }

  return {
    emojiId: body.emojiId,
    locale,
    pageUrl: body.pageUrl || undefined,
  };
}
