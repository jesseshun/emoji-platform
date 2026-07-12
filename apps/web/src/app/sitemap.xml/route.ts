import { NextResponse } from 'next/server';
import { getSiteUrl, wrapSitemapIndex, XML_HEADERS } from '@/lib/sitemap';

export const dynamic = 'force-dynamic';

/**
 * Sitemap index. References the public content sitemaps.
 *
 * Articles are included since Phase 5B (article frontend detail pages ship
 * and /sitemaps/articles.xml is enabled). All listed sitemaps only contain
 * published entities; /admin/* is never included and stays noindex.
 */
export async function GET() {
  const site = getSiteUrl();
  const subs = ['static', 'emojis', 'categories', 'topics', 'articles'].map(
    (name) => `${site}/sitemaps/${name}.xml`,
  );
  const xml = wrapSitemapIndex(subs);
  return new NextResponse(xml, { headers: XML_HEADERS });
}
