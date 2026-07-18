// Shared helpers for sitemap / robots route handlers in apps/web.
//
// IMPORTANT: apps/web must NEVER import Prisma. All published-entity data is
// fetched from the public read-only sitemap API exposed by apps/api, keeping
// the planned monorepo architecture intact.

const API_BASE = process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

export type SitemapLocale = 'zh' | 'en' | 'x-default';

export interface SitemapEntity {
  slug: string;
  updatedAt: string;
  createdAt: string;
}

/** Absolute site URL (no trailing slash). Driven by NEXT_PUBLIC_SITE_URL. */
export function getSiteUrl(): string {
  return SITE_URL.replace(/\/+$/, '');
}

/**
 * Fetches published entities from the public sitemap API.
 * Returns an empty array on any failure so sitemaps degrade gracefully.
 */
export async function fetchSitemapEntities(
  type: 'emojis' | 'categories' | 'topics' | 'articles',
): Promise<SitemapEntity[]> {
  try {
    const res = await fetch(`${API_BASE}/api/v1/sitemap/${type}`, {
      cache: 'no-store',
      headers: { Accept: 'application/json' },
    });
    if (!res.ok) return [];
    const json = (await res.json()) as { success?: boolean; data?: SitemapEntity[] };
    return Array.isArray(json.data) ? json.data : [];
  } catch {
    return [];
  }
}

/** XML-escapes text content / attribute values. */
export function escapeXml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

export interface UrlEntryOptions {
  loc: string;
  lastmod?: string;
  changefreq?: string;
  priority?: string;
  alternates?: { locale: SitemapLocale; href: string }[];
}

/** Builds a single <url> element (indented two spaces). */
export function buildUrlEntry(opts: UrlEntryOptions): string {
  const parts: string[] = [`    <loc>${escapeXml(opts.loc)}</loc>`];

  if (opts.alternates && opts.alternates.length > 0) {
    for (const alt of opts.alternates) {
      parts.push(
        `    <xhtml:link rel="alternate" hreflang="${escapeXml(alt.locale)}" href="${escapeXml(alt.href)}"/>`,
      );
    }
  }

  if (opts.lastmod) parts.push(`    <lastmod>${escapeXml(opts.lastmod)}</lastmod>`);
  if (opts.changefreq) parts.push(`    <changefreq>${escapeXml(opts.changefreq)}</changefreq>`);
  if (opts.priority) parts.push(`    <priority>${escapeXml(opts.priority)}</priority>`);

  return `  <url>\n${parts.join('\n')}\n  </url>`;
}

/** Wraps <url> entries in a <urlset> with the xhtml namespace for hreflang. */
export function wrapUrlset(entries: string[]): string {
  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">',
    ...entries,
    '</urlset>',
  ].join('\n');
}

/** Wraps <sitemap> entries in a <sitemapindex>. */
export function wrapSitemapIndex(locs: string[]): string {
  const items = locs.map(
    (loc) => `  <sitemap>\n    <loc>${escapeXml(loc)}</loc>\n  </sitemap>`,
  );
  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...items,
    '</sitemapindex>',
  ].join('\n');
}

/** Common XML response headers. */
export const XML_HEADERS: Record<string, string> = {
  'Content-Type': 'application/xml; charset=utf-8',
};
