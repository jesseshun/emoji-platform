import { NextResponse } from 'next/server';
import { getSiteUrl } from '@/lib/sitemap';

export const dynamic = 'force-dynamic';

/**
 * Dynamic robots.txt.
 *
 * - Allows crawling of all public frontend pages.
 * - Blocks the admin area (/admin/) and the admin API (/api/v1/admin/).
 * - References the sitemap index using NEXT_PUBLIC_SITE_URL (never hard-coded).
 *
 * Note: /admin/* is also enforced as noindex via the admin root layout meta
 * robots, independent of this file.
 */
export async function GET() {
  const site = getSiteUrl();
  const content = [
    'User-agent: *',
    'Allow: /',
    'Disallow: /admin/',
    'Disallow: /api/v1/admin/',
    '',
    `Sitemap: ${site}/sitemap.xml`,
    '',
  ].join('\n');

  return new NextResponse(content, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
}
