import { BadRequestException } from '@nestjs/common';

export interface SeoTranslationInput {
  seoTitle?: string | null;
  seoDescription?: string | null;
}

export interface SeoUpdateInput {
  translations: {
    zh?: SeoTranslationInput;
    en?: SeoTranslationInput;
  };
}

// Literal "undefined" / "null" strings must never be persisted as SEO text —
// the UI works with real strings or null. We reject them explicitly so a buggy
// payload cannot store the word "undefined" in a meta title/description.
function validateSeoField(value: unknown, field: string): string | null | undefined {
  if (value === undefined) return undefined; // not provided → leave unchanged
  if (value === null) return null; // explicit clear
  if (typeof value !== 'string') {
    throw new BadRequestException(`字段 ${field} 必须是字符串或 null`);
  }
  if (value === 'undefined' || value === 'null') {
    throw new BadRequestException(
      `字段 ${field} 不能保存字符串 "${value}"（请使用空字符串或 null 表示清空）`,
    );
  }
  return value;
}

export function parseSeoUpdateBody(body: Record<string, unknown>): SeoUpdateInput {
  if (!body || typeof body !== 'object') {
    throw new BadRequestException('请求体必须是对象');
  }

  const translations = body.translations;
  if (!translations || typeof translations !== 'object') {
    throw new BadRequestException('缺少 translations 对象');
  }

  const translationsObj = translations as Record<string, unknown>;
  const zhRaw = translationsObj.zh;
  const enRaw = translationsObj.en;

  if (zhRaw === undefined && enRaw === undefined) {
    throw new BadRequestException('translations 至少需要提供 zh 或 en 之一');
  }

  const parseLocale = (
    raw: unknown,
    locale: 'zh' | 'en',
  ): SeoTranslationInput | undefined => {
    if (raw === undefined) return undefined;
    if (typeof raw !== 'object' || raw === null) {
      throw new BadRequestException(`translations.${locale} 必须是对象`);
    }
    const localeObj = raw as Record<string, unknown>;
    return {
      seoTitle: validateSeoField(localeObj.seoTitle, `translations.${locale}.seoTitle`),
      seoDescription: validateSeoField(
        localeObj.seoDescription,
        `translations.${locale}.seoDescription`,
      ),
    };
  };

  const result: SeoUpdateInput = { translations: {} };
  const zh = parseLocale(zhRaw, 'zh');
  const en = parseLocale(enRaw, 'en');
  if (zh) result.translations.zh = zh;
  if (en) result.translations.en = en;

  return result;
}
