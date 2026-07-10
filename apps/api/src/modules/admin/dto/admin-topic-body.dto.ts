import { BadRequestException } from '@nestjs/common';

export type TopicStatusValue = 'draft' | 'published' | 'archived';

const VALID_STATUSES: TopicStatusValue[] = ['draft', 'published', 'archived'];

const SLUG_PATTERN = /^[a-z0-9-]+$/;

export interface TopicTranslationInput {
  title: string;
  summary?: string | null;
  content?: string | null;
  seoTitle?: string | null;
  seoDescription?: string | null;
  faqJson?: unknown;
}

export interface AdminTopicCreateInput {
  slug: string;
  coverImage?: string | null;
  topicType?: string | null;
  sortOrder?: number;
  status: TopicStatusValue;
  translations: {
    zh: TopicTranslationInput;
    en: TopicTranslationInput;
  };
}

export interface AdminTopicUpdateInput {
  slug?: string;
  coverImage?: string | null;
  topicType?: string | null;
  sortOrder?: number;
  status?: TopicStatusValue;
  translations?: {
    zh?: Partial<TopicTranslationInput>;
    en?: Partial<TopicTranslationInput>;
  };
}

export interface TopicEmojiBindInput {
  emojiId: string;
  note?: string | null;
}

export interface TopicEmojiBindBody {
  items: TopicEmojiBindInput[];
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
 * Parses a JSON-ish field (faqJson). Accepts an already-parsed object/array, or
 * a string (textarea content). Empty strings are treated as "not provided"
 * (null). Invalid JSON throws a BadRequestException with a clear message.
 */
function parseJsonField(value: unknown, fieldName: string): unknown {
  if (value === undefined || value === null) return null;
  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (trimmed === '') return null;
    try {
      return JSON.parse(trimmed);
    } catch {
      throw new BadRequestException(`${fieldName} 不是合法的 JSON 格式`);
    }
  }
  if (typeof value === 'object') return value;
  throw new BadRequestException(`${fieldName} 格式不正确`);
}

function parseTranslation(
  value: unknown,
  locale: 'zh' | 'en',
  required: boolean,
): TopicTranslationInput {
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
    faqJson: parseJsonField(obj.faqJson, `${locale} faqJson`),
  };
}

export function parseAdminTopicCreateBody(body: Record<string, unknown>): AdminTopicCreateInput {
  if (typeof body !== 'object' || body === null) {
    throw new BadRequestException('请求体格式不正确');
  }

  const rawSlug = asString(body.slug, 'slug').trim();
  if (!rawSlug) {
    throw new BadRequestException('slug 不能为空');
  }
  if (!SLUG_PATTERN.test(rawSlug)) {
    throw new BadRequestException('slug 只能包含小写字母、数字和短横线（例如 heart-colors）');
  }

  const rawStatus = asString(body.status, 'status');
  if (!VALID_STATUSES.includes(rawStatus as TopicStatusValue)) {
    throw new BadRequestException('status 只能是 draft / published / archived');
  }

  const sortOrderRaw = body.sortOrder;
  let sortOrder = 0;
  if (sortOrderRaw !== undefined && sortOrderRaw !== null && sortOrderRaw !== '') {
    const n = Number(sortOrderRaw);
    if (!Number.isFinite(n)) {
      throw new BadRequestException('sortOrder 必须是数字');
    }
    sortOrder = Math.trunc(n);
  }

  const translations = body.translations as Record<string, unknown> | undefined;
  if (typeof translations !== 'object' || translations === null) {
    throw new BadRequestException('translations 不能为空');
  }

  return {
    slug: rawSlug,
    coverImage: asOptionalString(body.coverImage),
    topicType: asOptionalString(body.topicType),
    sortOrder,
    status: rawStatus as TopicStatusValue,
    translations: {
      zh: parseTranslation(translations.zh, 'zh', true),
      en: parseTranslation(translations.en, 'en', true),
    },
  };
}

export function parseAdminTopicUpdateBody(body: Record<string, unknown>): AdminTopicUpdateInput {
  if (typeof body !== 'object' || body === null) {
    throw new BadRequestException('请求体格式不正确');
  }

  const input: AdminTopicUpdateInput = {};

  if (body.slug !== undefined) {
    const rawSlug = asString(body.slug, 'slug').trim();
    if (!rawSlug) {
      throw new BadRequestException('slug 不能为空');
    }
    if (!SLUG_PATTERN.test(rawSlug)) {
      throw new BadRequestException('slug 只能包含小写字母、数字和短横线（例如 heart-colors）');
    }
    input.slug = rawSlug;
  }

  if (body.status !== undefined) {
    const rawStatus = asString(body.status, 'status');
    if (!VALID_STATUSES.includes(rawStatus as TopicStatusValue)) {
      throw new BadRequestException('status 只能是 draft / published / archived');
    }
    input.status = rawStatus as TopicStatusValue;
  }

  if (body.sortOrder !== undefined && body.sortOrder !== null && body.sortOrder !== '') {
    const n = Number(body.sortOrder);
    if (!Number.isFinite(n)) {
      throw new BadRequestException('sortOrder 必须是数字');
    }
    input.sortOrder = Math.trunc(n);
  }

  if (body.coverImage !== undefined) {
    input.coverImage = asOptionalString(body.coverImage);
  }

  if (body.topicType !== undefined) {
    input.topicType = asOptionalString(body.topicType);
  }

  if (body.translations !== undefined) {
    const translations = body.translations as Record<string, unknown> | undefined;
    if (typeof translations !== 'object' || translations === null) {
      throw new BadRequestException('translations 格式不正确');
    }
    const result: { zh?: Partial<TopicTranslationInput>; en?: Partial<TopicTranslationInput> } = {};
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

function pickTranslationFields(value: unknown, locale: 'zh' | 'en'): Partial<TopicTranslationInput> {
  if (typeof value !== 'object' || value === null) {
    throw new BadRequestException(`${locale} 翻译数据格式不正确`);
  }
  const obj = value as Record<string, unknown>;
  const out: Partial<TopicTranslationInput> = {};
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
  if (obj.faqJson !== undefined) out.faqJson = parseJsonField(obj.faqJson, `${locale} faqJson`);
  return out;
}

export function parseTopicStatusUpdateBody(body: Record<string, unknown>): TopicStatusValue {
  if (typeof body !== 'object' || body === null) {
    throw new BadRequestException('请求体格式不正确');
  }
  const rawStatus = asString(body.status, 'status');
  if (!VALID_STATUSES.includes(rawStatus as TopicStatusValue)) {
    throw new BadRequestException('status 只能是 draft / published / archived');
  }
  return rawStatus as TopicStatusValue;
}

/**
 * Parse the topic-emoji binding replace body. Expects `{ items: [{ emojiId, note? }] }`.
 * An empty array clears all bindings (unbind-all). Each emojiId must be a non-empty
 * string; the existence of each emoji is validated in the service layer.
 */
export function parseTopicEmojiBindBody(body: Record<string, unknown>): TopicEmojiBindBody {
  if (typeof body !== 'object' || body === null) {
    throw new BadRequestException('请求体格式不正确');
  }
  const rawItems = body.items;
  if (!Array.isArray(rawItems)) {
    throw new BadRequestException('items 必须是数组');
  }

  const items: TopicEmojiBindInput[] = rawItems.map((raw, index) => {
    if (typeof raw !== 'object' || raw === null) {
      throw new BadRequestException(`items[${index}] 格式不正确`);
    }
    const obj = raw as Record<string, unknown>;
    const emojiId = asString(obj.emojiId, `items[${index}].emojiId`).trim();
    if (!emojiId) {
      throw new BadRequestException(`items[${index}].emojiId 不能为空`);
    }
    return {
      emojiId,
      note: asOptionalString(obj.note),
    };
  });

  return { items };
}
