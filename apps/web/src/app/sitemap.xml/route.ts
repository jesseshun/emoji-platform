import { NextResponse } from 'next/server';
import { getSiteUrl, wrapSitemapIndex, XML_HEADERS } from '@/lib/sitemap';

export const dynamic = 'force-dynamic';

/**
 * Sitemap index. References the public content sitemaps.
 *
 * Articles are intentionally NOT listed here: the article frontend detail
 * pages are not implemented yet (Phase 5B). The reserved /sitemaps/articles.xml
 * emits an empty urlset so crawlers are never pointed at non-existent pages.
 */
export async function GET() {
  const site = getSiteUrl();
  const subs = ['static', 'emojis', 'categories', 'topics'].map(
    (name) => `${site}/sitemaps/${name}.xml`,
  );
  const xml = wrapSitemapIndex(subs);
  return new NextResponse(xml, { headers: XML_HEADERS });
}
