import { NextResponse } from 'next/server';
import { getSiteUrl, buildUrlEntry, wrapUrlset, XML_HEADERS } from '@/lib/sitemap';

export const dynamic = 'force-dynamic';

interface StaticPage {
  path: string;
  changefreq: string;
  priority: string;
}

// Public list / landing pages only. Search *result* pages (?q=...) are never
// added to the sitemap — only the base /search entry is included.
const STATIC_PAGES: StaticPage[] = [
  { path: '/zh', changefreq: 'weekly', priority: '0.9' },
  { path: '/en', changefreq: 'weekly', priority: '0.9' },
  { path: '/zh/emojis', changefreq: 'weekly', priority: '0.7' },
  { path: '/en/emojis', changefreq: 'weekly', priority: '0.7' },
  { path: '/zh/categories', changefreq: 'weekly', priority: '0.7' },
  { path: '/en/categories', changefreq: 'weekly', priority: '0.7' },
  { path: '/zh/topics', changefreq: 'weekly', priority: '0.7' },
  { path: '/en/topics', changefreq: 'weekly', priority: '0.7' },
  { path: '/zh/search', changefreq: 'daily', priority: '0.6' },
  { path: '/en/search', changefreq: 'daily', priority: '0.6' },
];

export async function GET() {
  const site = getSiteUrl();
  const entries = STATIC_PAGES.map((page) =>
    buildUrlEntry({
      loc: `${site}${page.path}`,
      changefreq: page.changefreq,
      priority: page.priority,
    }),
  );
  const xml = wrapUrlset(entries);
  return new NextResponse(xml, { headers: XML_HEADERS });
}
