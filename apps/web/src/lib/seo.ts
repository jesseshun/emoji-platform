import type { Metadata } from 'next';
import type { Locale } from './types';

// ─── Site URL ──────────────────────────────────────────

export function getSiteUrl(): string {
  return process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
}

// ─── Canonical ─────────────────────────────────────────

export function buildCanonical(locale: Locale, path: string): string {
  const siteUrl = getSiteUrl();
  // path should start with /, e.g. /emoji/grinning-face
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${siteUrl}/${locale}${normalizedPath}`;
}

// ─── Hreflang ──────────────────────────────────────────

export interface HreflangEntry {
  locale: Locale;
  url: string;
}

export function buildHreflang(locale: Locale, path: string): {
  languages: Record<string, string>;
  xDefault: string;
} {
  const siteUrl = getSiteUrl();
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;

  const languages: Record<string, string> = {
    zh: `${siteUrl}/zh${normalizedPath}`,
    en: `${siteUrl}/en${normalizedPath}`,
  };

  // x-default points to English
  const xDefault = `${siteUrl}/en${normalizedPath}`;

  return { languages, xDefault };
}

// ─── Detail Page Metadata Helpers ──────────────────────

interface DetailSeoInput {
  locale: Locale;
  path: string;
  title: string;
  description: string;
  ogImage?: string;
}

export function buildDetailMetadata(input: DetailSeoInput): Metadata {
  const { locale, path, title, description, ogImage } = input;
  const canonical = buildCanonical(locale, path);
  const { languages, xDefault } = buildHreflang(locale, path);

  return {
    title,
    description,
    alternates: {
      canonical,
      languages: {
        zh: languages.zh,
        en: languages.en,
        'x-default': xDefault,
      },
    },
    openGraph: {
      title,
      description,
      type: 'article',
      locale: locale === 'zh' ? 'zh_CN' : 'en_US',
      url: canonical,
      ...(ogImage ? { images: [ogImage] } : {}),
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
  };
}

// ─── Safe text helpers ─────────────────────────────────

/** Returns the value or an empty string if null/undefined. */
export function safeText(value: string | null | undefined): string {
  return value ?? '';
}

/** Returns the value or undefined if empty — for optional metadata fields. */
export function optionalText(value: string | null | undefined): string | undefined {
  if (!value || value.trim() === '') return undefined;
  return value;
}

// ─── Breadcrumb item type ──────────────────────────────

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

export function buildBreadcrumbList(items: BreadcrumbItem[]) {
  const siteUrl = getSiteUrl();
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem' as const,
      position: index + 1,
      name: item.label,
      ...(item.href ? { item: item.href.startsWith('http') ? item.href : `${siteUrl}${item.href}` } : {}),
    })),
  };
}

// ─── FAQ JSON-LD ───────────────────────────────────────

export interface FaqItem {
  question: string;
  answer: string;
}

export function buildFaqPage(faqs: FaqItem[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question' as const,
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer' as const,
        text: faq.answer,
      },
    })),
  };
}

// ─── Article JSON-LD ───────────────────────────────────

export interface ArticleJsonLdInput {
  locale: Locale;
  path: string;
  headline: string;
  description: string;
  datePublished?: string | null;
  dateModified?: string | null;
  image?: string | null;
  authorName?: string | null;
  publisherName?: string;
}

/**
 * Builds a BlogPosting JSON-LD object for article detail pages.
 *
 * Guarantees no `undefined` / `null` keys in the output (omitted instead),
 * never fabricates author info, and uses NEXT_PUBLIC_SITE_URL for URLs.
 */
export function buildArticleJsonLd(input: ArticleJsonLdInput): Record<string, unknown> {
  const { locale, path, headline, description, datePublished, dateModified, image, authorName, publisherName } = input;
  const siteUrl = getSiteUrl();
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  const canonical = `${siteUrl}/${locale}${normalizedPath}`;

  const jsonLd: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: headline || '',
    description: description || '',
    inLanguage: locale === 'zh' ? 'zh-Hans' : 'en',
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': canonical,
    },
    publisher: {
      '@type': 'Organization',
      name: publisherName,
    },
  };

  if (datePublished) jsonLd.datePublished = datePublished;
  if (dateModified) jsonLd.dateModified = dateModified;
  if (image) jsonLd.image = image;
  if (authorName) {
    jsonLd.author = {
      '@type': 'Person',
      name: authorName,
    };
  }

  return jsonLd;
}
