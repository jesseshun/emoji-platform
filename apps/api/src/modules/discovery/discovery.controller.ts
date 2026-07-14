import { Controller, Get, Query } from '@nestjs/common';
import { DiscoveryService } from './discovery.service';
import { DEFAULT_LOCALE, isLocale, type Locale } from '@emoji-platform/types';

/**
 * Public, read-only discovery endpoints (Phase 6D).
 *
 * No admin auth required. Only published content is returned.
 */
@Controller('discovery')
export class DiscoveryController {
  constructor(private readonly discoveryService: DiscoveryService) {}

  /**
   * GET /api/v1/discovery/home
   *
   * Returns the homepage discovery module: featured emojis, featured
   * categories, featured topics, and latest articles (all published).
   *
   * An invalid / missing `locale` falls back to the default locale (`en`)
   * instead of 400, so a hand-edited URL never breaks the discovery module.
   */
  @Get('home')
  async getHome(@Query() query: Record<string, string | undefined>) {
    const locale: Locale = isLocale(query.locale ?? '') ? (query.locale as Locale) : DEFAULT_LOCALE;
    const data = await this.discoveryService.getHome(locale);
    return { success: true, data };
  }
}
