import { BadRequestException } from '@nestjs/common';

export type ArticleStatusValue = 'draft' | 'published' | 'archived';

const VALID_STATUSES: ArticleStatusValue[] = ['draft', 'published', 'archived'];

const SLUG_PATTERN = /^[a-z0-9-]+$/;

export interface ArticleTranslationInput {
  title: string;
  summary?: string | null;
  content?: string | null;
  seoTitle?: string | null;
  seoDescription?: string | null;
  keywords?: unknown;
}

export interface AdminArticleCreateInput {
  slug: string;
  coverImage?: string | null;
  authorId?: string | null;
  status: ArticleStatusValue;
  publishedAt?: Date | null;
  translations: {
    zh: ArticleTranslationInput;
    en: ArticleTranslationInput;
  };
}

export interface AdminArticleUpdateInput {
  slug?: string;
  coverImage?: string | null;
  authorId?: string | null;
  status?: ArticleStatusValue;
  publishedAt?: Date | null;
  translations?: {
    zh?: Partial<ArticleTranslationInput>;
    en?: Partial<ArticleTranslationInput>;
  };
}

function asString(value: unknown, field: string): string {
  if (typeof value !== 'string') {
    throw new BadRequestException(`${field} 必须是字符串`);
  }
  return value;
}

function asOptionalString(value: unknown): string | null {
  if (value === undefined || value === null) return null;
  if (typeof value !== 'string') {
    throw new BadRequestException('文本字段必须是字符串');
  }
  const trimmed = value.trim();
  return trimmed === '' ? null : trimmed;
}

/**
 * Parses the keywords field. Accepts:
 * - undefined / null / empty string → null (schema default `[]` applies)
 * - a valid JSON value (array, object, scalar) → used as-is
 * - a non-JSON string → treated as a comma-separated list (split into an array)
 * Invalid input (non-JSON and no comma-separated tokens) throws BadRequestException.
 */
function parseKeywordsField(value: unknown, fieldName: string): unknown {
  if (value === undefined || value === null) return null;
  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (trimmed === '') return null;
    try {
      return JSON.parse(trimmed);
    } catch {
      const parts = trimmed
        .split(',')
        .map((s) => s.trim())
        .filter((s) => s.length > 0);
      if (parts.length === 0) {
        throw new BadRequestException(
          `${fieldName} 格式不正确（需为合法 JSON 或逗号分隔列表）`,
        );
      }
      return parts;
    }
  }
  if (Array.isArray(value)) return value;
  throw new BadRequestException(`${fieldName} 格式不正确`);
}

function parseTranslation(
  value: unknown,
  locale: 'zh' | 'en',
  required: boolean,
): ArticleTranslationInput {
  if (typeof value !== 'object' || value === null) {
    throw new BadRequestException(`${locale} 翻译数据格式不正确`);
  }
  const obj = value as Record<string, unknown>;
  const title = asOptionalString(obj.title);
  if (required && !title) {
    throw new BadRequestException(`${locale} title 不能为空`);
  }
  return {
    title: title ?? '',
    summary: asOptionalString(obj.summary),
    content: asOptionalString(obj.content),
    seoTitle: asOptionalString(obj.seoTitle),
    seoDescription: asOptionalString(obj.seoDescription),
    keywords: parseKeywordsField(obj.keywords, `${locale} keywords`),
  };
}

/**
 * Validate and normalize a publishedAt value. Accepts an ISO/date string
 * (e.g. "2024-01-15" or "2024-01-15T10:00:00.000Z") or a Date. Empty / null
 * returns null (clears the published date). Invalid input throws.
 */
export function parsePublishedAt(value: unknown, fieldName: string): Date | null {
  if (value === undefined || value === null) return null;
  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (trimmed === '') return null;
    const d = new Date(trimmed);
    if (isNaN(d.getTime())) {
      throw new BadRequestException(`${fieldName} 不是合法的日期格式`);
    }
    return d;
  }
  if (value instanceof Date) {
    if (isNaN(value.getTime())) {
      throw new BadRequestException(`${fieldName} 不是合法的日期格式`);
    }
    return value;
  }
  throw new BadRequestException(`${fieldName} 格式不正确`);
}

export function parseAdminArticleCreateBody(
  body: Record<string, unknown>,
): AdminArticleCreateInput {
  if (typeof body !== 'object' || body === null) {
    throw new BadRequestException('请求体格式不正确');
  }

  const rawSlug = asString(body.slug, 'slug').trim();
  if (!rawSlug) {
    throw new BadRequestException('slug 不能为空');
  }
  if (!SLUG_PATTERN.test(rawSlug)) {
    throw new BadRequestException('slug 只能包含小写字母、数字和短横线（例如 emoji-guide）');
  }

  const rawStatus = asString(body.status, 'status');
  if (!VALID_STATUSES.includes(rawStatus as ArticleStatusValue)) {
    throw new BadRequestException('status 只能是 draft / published / archived');
  }

  const translations = body.translations as Record<string, unknown> | undefined;
  if (typeof translations !== 'object' || translations === null) {
    throw new BadRequestException('translations 不能为空');
  }

  return {
    slug: rawSlug,
    coverImage: asOptionalString(body.coverImage),
    authorId: asOptionalString(body.authorId),
    status: rawStatus as ArticleStatusValue,
    publishedAt: parsePublishedAt(body.publishedAt, 'publishedAt'),
    translations: {
      zh: parseTranslation(translations.zh, 'zh', true),
      en: parseTranslation(translations.en, 'en', true),
    },
  };
}

export function parseAdminArticleUpdateBody(
  body: Record<string, unknown>,
): AdminArticleUpdateInput {
  if (typeof body !== 'object' || body === null) {
    throw new BadRequestException('请求体格式不正确');
  }

  const input: AdminArticleUpdateInput = {};

  if (body.slug !== undefined) {
    const rawSlug = asString(body.slug, 'slug').trim();
    if (!rawSlug) {
      throw new BadRequestException('slug 不能为空');
    }
    if (!SLUG_PATTERN.test(rawSlug)) {
      throw new BadRequestException('slug 只能包含小写字母、数字和短横线（例如 emoji-guide）');
    }
    input.slug = rawSlug;
  }

  if (body.status !== undefined) {
    const rawStatus = asString(body.status, 'status');
    if (!VALID_STATUSES.includes(rawStatus as ArticleStatusValue)) {
      throw new BadRequestException('status 只能是 draft / published / archived');
    }
    input.status = rawStatus as ArticleStatusValue;
  }

  if (body.coverImage !== undefined) {
    input.coverImage = asOptionalString(body.coverImage);
  }

  if (body.authorId !== undefined) {
    input.authorId = asOptionalString(body.authorId);
  }

  if (body.publishedAt !== undefined) {
    input.publishedAt = parsePublishedAt(body.publishedAt, 'publishedAt');
  }

  if (body.translations !== undefined) {
    const translations = body.translations as Record<string, unknown> | undefined;
    if (typeof translations !== 'object' || translations === null) {
      throw new BadRequestException('translations 格式不正确');
    }
    const result: { zh?: Partial<ArticleTranslationInput>; en?: Partial<ArticleTranslationInput> } = {};
    if (translations.zh !== undefined) {
      result.zh = pickTranslationFields(translations.zh, 'zh');
    }
    if (translations.en !== undefined) {
      result.en = pickTranslationFields(translations.en, 'en');
    }
    input.translations = result;
  }

  return input;
}

function pickTranslationFields(
  value: unknown,
  locale: 'zh' | 'en',
): Partial<ArticleTranslationInput> {
  if (typeof value !== 'object' || value === null) {
    throw new BadRequestException(`${locale} 翻译数据格式不正确`);
  }
  const obj = value as Record<string, unknown>;
  const out: Partial<ArticleTranslationInput> = {};
  if (obj.title !== undefined) {
    const title = asOptionalString(obj.title);
    if (title === null) {
      throw new BadRequestException(`${locale} title 不能为空`);
    }
    out.title = title;
  }
  if (obj.summary !== undefined) out.summary = asOptionalString(obj.summary);
  if (obj.content !== undefined) out.content = asOptionalString(obj.content);
  if (obj.seoTitle !== undefined) out.seoTitle = asOptionalString(obj.seoTitle);
  if (obj.seoDescription !== undefined) out.seoDescription = asOptionalString(obj.seoDescription);
  if (obj.keywords !== undefined) out.keywords = parseKeywordsField(obj.keywords, `${locale} keywords`);
  return out;
}

export function parseArticleStatusUpdateBody(body: Record<string, unknown>): ArticleStatusValue {
  if (typeof body !== 'object' || body === null) {
    throw new BadRequestException('请求体格式不正确');
  }
  const rawStatus = asString(body.status, 'status');
  if (!VALID_STATUSES.includes(rawStatus as ArticleStatusValue)) {
    throw new BadRequestException('status 只能是 draft / published / archived');
  }
  return rawStatus as ArticleStatusValue;
}
