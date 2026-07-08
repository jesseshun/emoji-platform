export const APP_NAME = 'Emoji Platform';

export const SUPPORTED_LOCALES = ['zh', 'en'] as const;

export const DEFAULT_LOCALE = 'zh' as const;

export function isLocale(value: string): value is 'zh' | 'en' {
  return SUPPORTED_LOCALES.includes(value as 'zh' | 'en');
}
