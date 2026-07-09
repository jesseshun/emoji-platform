import { BadRequestException } from '@nestjs/common';

export type CategoryStatusValue = 'draft' | 'published' | 'archived';

const VALID_STATUSES: CategoryStatusValue[] = ['draft', 'published', 'archived'];

const SLUG_PATTERN = /^[a-z0-9-]+$/;

export interface CategoryTranslationInput {
  name: string;
  description?: string | null;
  seoTitle?: string | null;
  seoDescription?: string | null;
}

export interface AdminCategoryCreateInput {
  slug: string;
  parentId?: string | null;
  iconEmoji?: string | null;
  sortOrder?: number;
  status: CategoryStatusValue;
  translations: {
    zh: CategoryTranslationInput;
    en: CategoryTranslationInput;
  };
}

export interface AdminCategoryUpdateInput {
  slug?: string;
  parentId?: string | null;
  iconEmoji?: string | null;
  sortOrder?: number;
  status?: CategoryStatusValue;
  translations?: {
    zh?: Partial<CategoryTranslationInput>;
    en?: Partial<CategoryTranslationInput>;
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

function parseTranslation(
  value: unknown,
  locale: 'zh' | 'en',
  required: boolean,
): CategoryTranslationInput {
  if (typeof value !== 'object' || value === null) {
    throw new BadRequestException(`${locale} 翻译数据格式不正确`);
  }
  const obj = value as Record<string, unknown>;
  const name = asOptionalString(obj.name);
  if (required && !name) {
    throw new BadRequestException(`${locale} name 不能为空`);
  }
  return {
    name: name ?? '',
    description: asOptionalString(obj.description),
    seoTitle: asOptionalString(obj.seoTitle),
    seoDescription: asOptionalString(obj.seoDescription),
  };
}

export function parseAdminCategoryCreateBody(body: Record<string, unknown>): AdminCategoryCreateInput {
  if (typeof body !== 'object' || body === null) {
    throw new BadRequestException('请求体格式不正确');
  }

  const rawSlug = asString(body.slug, 'slug').trim();
  if (!rawSlug) {
    throw new BadRequestException('slug 不能为空');
  }
  if (!SLUG_PATTERN.test(rawSlug)) {
    throw new BadRequestException('slug 只能包含小写字母、数字和短横线（例如 smiling-face）');
  }

  const rawStatus = asString(body.status, 'status');
  if (!VALID_STATUSES.includes(rawStatus as CategoryStatusValue)) {
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

  const parentId = asOptionalString(body.parentId);

  const translations = body.translations as Record<string, unknown> | undefined;
  if (typeof translations !== 'object' || translations === null) {
    throw new BadRequestException('translations 不能为空');
  }

  return {
    slug: rawSlug,
    parentId,
    iconEmoji: asOptionalString(body.iconEmoji),
    sortOrder,
    status: rawStatus as CategoryStatusValue,
    translations: {
      zh: parseTranslation(translations.zh, 'zh', true),
      en: parseTranslation(translations.en, 'en', true),
    },
  };
}

export function parseAdminCategoryUpdateBody(body: Record<string, unknown>): AdminCategoryUpdateInput {
  if (typeof body !== 'object' || body === null) {
    throw new BadRequestException('请求体格式不正确');
  }

  const input: AdminCategoryUpdateInput = {};

  if (body.slug !== undefined) {
    const rawSlug = asString(body.slug, 'slug').trim();
    if (!rawSlug) {
      throw new BadRequestException('slug 不能为空');
    }
    if (!SLUG_PATTERN.test(rawSlug)) {
      throw new BadRequestException('slug 只能包含小写字母、数字和短横线（例如 smiling-face）');
    }
    input.slug = rawSlug;
  }

  if (body.status !== undefined) {
    const rawStatus = asString(body.status, 'status');
    if (!VALID_STATUSES.includes(rawStatus as CategoryStatusValue)) {
      throw new BadRequestException('status 只能是 draft / published / archived');
    }
    input.status = rawStatus as CategoryStatusValue;
  }

  if (body.sortOrder !== undefined && body.sortOrder !== null && body.sortOrder !== '') {
    const n = Number(body.sortOrder);
    if (!Number.isFinite(n)) {
      throw new BadRequestException('sortOrder 必须是数字');
    }
    input.sortOrder = Math.trunc(n);
  }

  if (body.parentId !== undefined) {
    input.parentId = asOptionalString(body.parentId);
  }

  if (body.iconEmoji !== undefined) {
    input.iconEmoji = asOptionalString(body.iconEmoji);
  }

  if (body.translations !== undefined) {
    const translations = body.translations as Record<string, unknown> | undefined;
    if (typeof translations !== 'object' || translations === null) {
      throw new BadRequestException('translations 格式不正确');
    }
    const result: { zh?: Partial<CategoryTranslationInput>; en?: Partial<CategoryTranslationInput> } = {};
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

function pickTranslationFields(value: unknown, locale: 'zh' | 'en'): Partial<CategoryTranslationInput> {
  if (typeof value !== 'object' || value === null) {
    throw new BadRequestException(`${locale} 翻译数据格式不正确`);
  }
  const obj = value as Record<string, unknown>;
  const out: Partial<CategoryTranslationInput> = {};
  if (obj.name !== undefined) {
    const name = asOptionalString(obj.name);
    if (name === null) {
      throw new BadRequestException(`${locale} name 不能为空`);
    }
    out.name = name;
  }
  if (obj.description !== undefined) out.description = asOptionalString(obj.description);
  if (obj.seoTitle !== undefined) out.seoTitle = asOptionalString(obj.seoTitle);
  if (obj.seoDescription !== undefined) out.seoDescription = asOptionalString(obj.seoDescription);
  return out;
}

export function parseCategoryStatusUpdateBody(body: Record<string, unknown>): CategoryStatusValue {
  if (typeof body !== 'object' || body === null) {
    throw new BadRequestException('请求体格式不正确');
  }
  const rawStatus = asString(body.status, 'status');
  if (!VALID_STATUSES.includes(rawStatus as CategoryStatusValue)) {
    throw new BadRequestException('status 只能是 draft / published / archived');
  }
  return rawStatus as CategoryStatusValue;
}
