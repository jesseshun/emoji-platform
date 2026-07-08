export { generateSlug, uniqueSlug } from './slug';

export const SUPPORTED_LOCALES = ['zh', 'en'] as const;

export const DEFAULT_LOCALE = 'en' as const;

export type Locale = 'zh' | 'en';

export function isLocale(value: string): value is Locale {
  return (SUPPORTED_LOCALES as readonly string[]).includes(value);
}
