import { NextResponse } from 'next/server';
import { wrapUrlset, XML_HEADERS } from '@/lib/sitemap';

export const dynamic = 'force-dynamic';

/**
 * Reserved article sitemap. The article frontend detail pages are NOT
 * implemented yet (Phase 5B), so we emit an empty <urlset> and deliberately
 * omit this file from the sitemap index (/sitemap.xml). This avoids pointing
 * crawlers at non-existent pages. Once Phase 5B ships article pages, this
 * route can fetch published articles from the sitemap API and the index can
 * include it — no API-side change required.
 */
export async function GET() {
  const xml = wrapUrlset([]);
  return new NextResponse(xml, { headers: XML_HEADERS });
}
