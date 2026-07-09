import { BadRequestException } from '@nestjs/common';

export type EmojiStatusValue = 'draft' | 'published' | 'archived';
export type ReviewStatusValue = 'pending' | 'approved' | 'rejected' | 'needs_edit';

export const EMOJI_STATUS_VALUES: EmojiStatusValue[] = ['draft', 'published', 'archived'];
export const REVIEW_STATUS_VALUES: ReviewStatusValue[] = [
  'pending',
  'approved',
  'rejected',
  'needs_edit',
];

export interface EmojiTranslationInput {
  name: string;
  shortName?: string | null;
  oneLineMeaning?: string | null;
  meaning?: string | null;
  usageNotes?: string | null;
  formalUsageNotes?: string | null;
  informalUsageNotes?: string | null;
  socialUsageNotes?: string | null;
  examples?: unknown;
  keywords?: unknown;
  faqJson?: unknown;
  seoTitle?: string | null;
  seoDescription?: string | null;
  status?: EmojiStatusValue;
  reviewStatus?: ReviewStatusValue;
}

export interface AdminEmojiCreateInput {
  emojiChar: string;
  slug: string;
  unicodeCodepoint?: string | null;
  htmlDecimal?: string | null;
  htmlHex?: string | null;
  shortcode?: string | null;
  emojiVersion?: string | null;
  unicodeVersion?: string | null;
  categoryId?: string | null;
  status: EmojiStatusValue;
  manualWeight?: number;
  translations: { zh: EmojiTranslationInput; en: EmojiTranslationInput };
}

export interface AdminEmojiUpdateInput {
  emojiChar?: string;
  slug?: string;
  unicodeCodepoint?: string | null;
  htmlDecimal?: string | null;
  htmlHex?: string | null;
  shortcode?: string | null;
  emojiVersion?: string | null;
  unicodeVersion?: string | null;
  categoryId?: string | null;
  status?: EmojiStatusValue;
  manualWeight?: number;
  translations?: { zh?: Partial<EmojiTranslationInput>; en?: Partial<EmojiTranslationInput> };
}

function optStr(value: unknown): string | undefined {
  if (value === undefined || value === null) return undefined;
  if (typeof value === 'string') {
    const trimmed = value.trim();
    return trimmed === '' ? undefined : trimmed;
  }
  return String(value);
}

function parseOptionalInt(value: unknown): number | undefined {
  if (value === undefined || value === null || value === '') return undefined;
  const n = typeof value === 'string' ? parseInt(value, 10) : (value as number);
  if (typeof n !== 'number' || isNaN(n)) return undefined;
  return n;
}

/**
 * Parses a JSON-ish field. Accepts an already-parsed object/array, or a string
 * (textarea content). Empty strings are treated as "not provided" (undefined).
 * Invalid JSON throws a BadRequestException with a clear message.
 */
function parseJsonField(value: unknown, fieldName: string): unknown {
  if (value === undefined || value === null) return undefined;
  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (trimmed === '') return undefined;
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
  raw: unknown,
  locale: string,
  requireName: boolean,
): EmojiTranslationInput {
  if (!raw || typeof raw !== 'object') {
    throw new BadRequestException(`${locale} translation 不能为空`);
  }
  const obj = raw as Record<string, unknown>;

  const name = optStr(obj.name);
  if (requireName && !name) {
    throw new BadRequestException(`${locale} translation 的 name 不能为空`);
  }

  const statusRaw = optStr(obj.status);
  const status = statusRaw
    ? (validateEnum(statusRaw, EMOJI_STATUS_VALUES, `${locale} status`) as EmojiStatusValue)
    : undefined;

  const reviewRaw = optStr(obj.reviewStatus);
  const reviewStatus = reviewRaw
    ? (validateEnum(reviewRaw, REVIEW_STATUS_VALUES, `${locale} reviewStatus`) as ReviewStatusValue)
    : undefined;

  return {
    name: name ?? '',
    shortName: optStr(obj.shortName),
    oneLineMeaning: optStr(obj.oneLineMeaning),
    meaning: optStr(obj.meaning),
    usageNotes: optStr(obj.usageNotes),
    formalUsageNotes: optStr(obj.formalUsageNotes),
    informalUsageNotes: optStr(obj.informalUsageNotes),
    socialUsageNotes: optStr(obj.socialUsageNotes),
    examples: parseJsonField(obj.examples, `${locale} examples`),
    keywords: parseJsonField(obj.keywords, `${locale} keywords`),
    faqJson: parseJsonField(obj.faqJson, `${locale} faqJson`),
    seoTitle: optStr(obj.seoTitle),
    seoDescription: optStr(obj.seoDescription),
    status,
    reviewStatus,
  };
}

function validateEnum<T extends string>(value: string, allowed: T[], label: string): T {
  if (!allowed.includes(value as T)) {
    throw new BadRequestException(`无效的 ${label} "${value}"`);
  }
  return value as T;
}

function validateSlug(slug: string): void {
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
    throw new BadRequestException('slug 只能包含小写字母、数字和连字符，且不能以连字符开头或结尾');
  }
}

export function parseAdminEmojiCreateBody(body: unknown): AdminEmojiCreateInput {
  if (!body || typeof body !== 'object') {
    throw new BadRequestException('请求体格式不正确');
  }
  const obj = body as Record<string, unknown>;

  const emojiChar = optStr(obj.emojiChar);
  if (!emojiChar) {
    throw new BadRequestException('emojiChar 不能为空');
  }

  const slug = optStr(obj.slug);
  if (!slug) {
    throw new BadRequestException('slug 不能为空');
  }
  validateSlug(slug);

  const status = validateEnum(
    optStr(obj.status) ?? 'draft',
    EMOJI_STATUS_VALUES,
    'status',
  ) as EmojiStatusValue;

  const categoryIdRaw = obj.categoryId;
  const categoryId =
    categoryIdRaw === null || categoryIdRaw === undefined || categoryIdRaw === ''
      ? null
      : optStr(categoryIdRaw);

  const manualWeight = parseOptionalInt(obj.manualWeight);

  const translations = obj.translations;
  if (!translations || typeof translations !== 'object') {
    throw new BadRequestException('translations 不能为空');
  }
  const transObj = translations as Record<string, unknown>;
  const zh = parseTranslation(transObj.zh, 'zh', true);
  const en = parseTranslation(transObj.en, 'en', true);

  return {
    emojiChar,
    slug,
    unicodeCodepoint: optStr(obj.unicodeCodepoint),
    htmlDecimal: optStr(obj.htmlDecimal),
    htmlHex: optStr(obj.htmlHex),
    shortcode: optStr(obj.shortcode),
    emojiVersion: optStr(obj.emojiVersion),
    unicodeVersion: optStr(obj.unicodeVersion),
    categoryId: categoryId === undefined ? null : categoryId,
    status,
    manualWeight,
    translations: { zh, en },
  };
}

export function parseAdminEmojiUpdateBody(body: unknown): AdminEmojiUpdateInput {
  if (!body || typeof body !== 'object') {
    throw new BadRequestException('请求体格式不正确');
  }
  const obj = body as Record<string, unknown>;

  const result: AdminEmojiUpdateInput = {};

  if (obj.emojiChar !== undefined) {
    const emojiChar = optStr(obj.emojiChar);
    if (!emojiChar) throw new BadRequestException('emojiChar 不能为空');
    result.emojiChar = emojiChar;
  }

  if (obj.slug !== undefined) {
    const slug = optStr(obj.slug);
    if (!slug) throw new BadRequestException('slug 不能为空');
    validateSlug(slug);
    result.slug = slug;
  }

  if (obj.status !== undefined) {
    result.status = validateEnum(optStr(obj.status) ?? 'draft', EMOJI_STATUS_VALUES, 'status') as EmojiStatusValue;
  }

  if ('categoryId' in obj) {
    const categoryIdRaw = obj.categoryId;
    result.categoryId =
      categoryIdRaw === null || categoryIdRaw === undefined || categoryIdRaw === ''
        ? null
        : optStr(categoryIdRaw);
  }

  if (obj.unicodeCodepoint !== undefined) result.unicodeCodepoint = optStr(obj.unicodeCodepoint);
  if (obj.htmlDecimal !== undefined) result.htmlDecimal = optStr(obj.htmlDecimal);
  if (obj.htmlHex !== undefined) result.htmlHex = optStr(obj.htmlHex);
  if (obj.shortcode !== undefined) result.shortcode = optStr(obj.shortcode);
  if (obj.emojiVersion !== undefined) result.emojiVersion = optStr(obj.emojiVersion);
  if (obj.unicodeVersion !== undefined) result.unicodeVersion = optStr(obj.unicodeVersion);
  if (obj.manualWeight !== undefined) result.manualWeight = parseOptionalInt(obj.manualWeight);

  if (obj.translations !== undefined) {
    if (typeof obj.translations !== 'object' || obj.translations === null) {
      throw new BadRequestException('translations 格式不正确');
    }
    const transObj = obj.translations as Record<string, unknown>;
    const translations: { zh?: Partial<EmojiTranslationInput>; en?: Partial<EmojiTranslationInput> } = {};

    if (transObj.zh !== undefined) {
      translations.zh = parseTranslationPartial(transObj.zh, 'zh');
    }
    if (transObj.en !== undefined) {
      translations.en = parseTranslationPartial(transObj.en, 'en');
    }
    result.translations = translations;
  }

  return result;
}

function parseTranslationPartial(
  raw: unknown,
  locale: string,
): Partial<EmojiTranslationInput> {
  if (!raw || typeof raw !== 'object') {
    throw new BadRequestException(`${locale} translation 格式不正确`);
  }
  const obj = raw as Record<string, unknown>;
  const out: Partial<EmojiTranslationInput> = {};

  if (obj.name !== undefined) out.name = optStr(obj.name) ?? '';

  const optionalStrFields = [
    'shortName',
    'oneLineMeaning',
    'meaning',
    'usageNotes',
    'formalUsageNotes',
    'informalUsageNotes',
    'socialUsageNotes',
    'seoTitle',
    'seoDescription',
  ] as const;
  for (const f of optionalStrFields) {
    if (obj[f] !== undefined) out[f] = optStr(obj[f]);
  }

  if (obj.examples !== undefined) out.examples = parseJsonField(obj.examples, `${locale} examples`);
  if (obj.keywords !== undefined) out.keywords = parseJsonField(obj.keywords, `${locale} keywords`);
  if (obj.faqJson !== undefined) out.faqJson = parseJsonField(obj.faqJson, `${locale} faqJson`);

  if (obj.status !== undefined) {
    out.status = validateEnum(optStr(obj.status) ?? 'draft', EMOJI_STATUS_VALUES, `${locale} status`) as EmojiStatusValue;
  }
  if (obj.reviewStatus !== undefined) {
    out.reviewStatus = validateEnum(
      optStr(obj.reviewStatus) ?? 'pending',
      REVIEW_STATUS_VALUES,
      `${locale} reviewStatus`,
    ) as ReviewStatusValue;
  }

  return out;
}

export function parseEmojiStatusUpdateBody(body: unknown): EmojiStatusValue {
  if (!body || typeof body !== 'object') {
    throw new BadRequestException('请求体格式不正确');
  }
  const obj = body as Record<string, unknown>;
  const status = optStr(obj.status);
  if (!status) {
    throw new BadRequestException('status 不能为空');
  }
  return validateEnum(status, EMOJI_STATUS_VALUES, 'status') as EmojiStatusValue;
}
