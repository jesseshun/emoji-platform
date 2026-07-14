import { BadRequestException, Controller, Get, Query } from '@nestjs/common';
import { RecommendationService, type RecommendationEntityType } from './recommendations.service';
import { DEFAULT_LOCALE, isLocale, type Locale } from '@emoji-platform/types';

const VALID_ENTITY_TYPES: RecommendationEntityType[] = ['emoji', 'category', 'topic', 'article'];

/**
 * Public, read-only recommendation endpoint (Phase 6D).
 *
 * No admin auth required. Only published content is recommended.
 *
 *   GET /api/v1/recommendations?entityType=emoji&slug=grinning-face&locale=zh&limit=8
 *
 * - `entityType` must be one of emoji | category | topic | article (else 400).
 * - `slug` is required (else 400) and must resolve to a published entity (else 404).
 * - `locale` invalid / missing falls back to the default locale (`en`).
 * - `limit` defaults to 8 and is capped at 20.
 */
@Controller('recommendations')
export class RecommendationController {
  constructor(private readonly recommendationService: RecommendationService) {}

  @Get()
  async get(@Query() query: Record<string, string | undefined>) {
    const rawType = (query.entityType ?? '').toLowerCase();
    if (!(VALID_ENTITY_TYPES as string[]).includes(rawType)) {
      throw new BadRequestException(
        `Invalid entityType "${query.entityType}". Supported: emoji, category, topic, article`,
      );
    }
    const entityType = rawType as RecommendationEntityType;

    const slug = (query.slug ?? '').trim();
    if (!slug) {
      throw new BadRequestException('slug is required');
    }

    const locale: Locale = isLocale(query.locale ?? '') ? (query.locale as Locale) : DEFAULT_LOCALE;

    let limit: number | undefined;
    if (query.limit !== undefined && query.limit !== '') {
      const parsed = parseInt(query.limit, 10);
      limit = Number.isNaN(parsed) ? undefined : parsed;
    }

    const data = await this.recommendationService.getRecommendations(entityType, slug, locale, limit);
    return { success: true, data };
  }
}
