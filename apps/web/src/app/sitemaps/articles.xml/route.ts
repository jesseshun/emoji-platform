import { NextResponse } from 'next/server';
import { buildUrlEntry, fetchSitemapEntities, getSiteUrl, wrapUrlset, XML_HEADERS } from '@/lib/sitemap';

export const dynamic = 'force-dynamic';

/**
 * Article sitemap. Emits one <url> per published article, with both the
 * zh and en detail URLs plus hreflang alternates. Drafts / archived are
 * excluded by the public sitemap API (status = 'published' only).
 *
 * Enabled in Phase 5B: the article frontend detail pages now exist, so this
 * file is listed in the sitemap index (/sitemap.xml).
 */
export async function GET() {
  const site = getSiteUrl();
  const articles = await fetchSitemapEntities('articles');

  const entries = articles.map((article) => {
    const zhLoc = `${site}/zh/articles/${article.slug}`;
    const enLoc = `${site}/en/articles/${article.slug}`;
    return buildUrlEntry({
      loc: zhLoc,
      lastmod: article.updatedAt,
      changefreq: 'weekly',
      priority: '0.7',
      alternates: [
        { locale: 'zh', href: zhLoc },
        { locale: 'en', href: enLoc },
        { locale: 'x-default', href: enLoc },
      ],
    });
  });

  const xml = wrapUrlset(entries);
  return new NextResponse(xml, { headers: XML_HEADERS });
}
