import { NextResponse } from 'next/server';
import {
  getSiteUrl,
  fetchSitemapEntities,
  buildUrlEntry,
  wrapUrlset,
  XML_HEADERS,
} from '@/lib/sitemap';

export const dynamic = 'force-dynamic';

// Published emoji detail pages (one URL per locale). draft / archived are
// excluded by the API; only `published` entities are returned.
export async function GET() {
  const site = getSiteUrl();
  const entities = await fetchSitemapEntities('emojis');

  const entries = entities.map((e) => {
    const zh = `${site}/zh/emoji/${e.slug}`;
    const en = `${site}/en/emoji/${e.slug}`;
    return buildUrlEntry({
      loc: zh,
      lastmod: e.updatedAt,
      changefreq: 'monthly',
      priority: '0.8',
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
