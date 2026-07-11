import { NextResponse } from 'next/server';
import {
  getSiteUrl,
  fetchSitemapEntities,
  buildUrlEntry,
  wrapUrlset,
  XML_HEADERS,
} from '@/lib/sitemap';

export const dynamic = 'force-dynamic';

// Published topic detail pages (one URL per locale).
export async function GET() {
  const site = getSiteUrl();
  const entities = await fetchSitemapEntities('topics');

  const entries = entities.map((e) => {
    const zh = `${site}/zh/topics/${e.slug}`;
    const en = `${site}/en/topics/${e.slug}`;
    return buildUrlEntry({
      loc: zh,
      lastmod: e.updatedAt,
      changefreq: 'weekly',
      priority: '0.7',
      alternates: [
        { locale: 'zh', href: zh },
        { locale: 'en', href: en },
        { locale: 'x-default', href: en },
      ],
    });
  });

  const xml = wrapUrlset(entries);
  return new NextResponse(xml, { headers: XML_HEADERS });
}
