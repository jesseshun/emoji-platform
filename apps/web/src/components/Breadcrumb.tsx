import Link from 'next/link';
import type { Locale } from '@/lib/types';
import type { BreadcrumbItem as BreadcrumbItemType } from '@/lib/seo';
import { buildBreadcrumbList } from '@/lib/seo';
import { JsonLd } from './JsonLd';

interface BreadcrumbProps {
  locale: Locale;
  items: BreadcrumbItemType[];
}

const homeLabels: Record<Locale, string> = {
  zh: '首页',
  en: 'Home',
};

export function Breadcrumb({ locale, items }: BreadcrumbProps) {
  const homeItem: BreadcrumbItemType = {
    label: homeLabels[locale],
    href: `/${locale}`,
  };

  const allItems = [homeItem, ...items];
  const ldJson = buildBreadcrumbList(allItems);

  return (
    <>
      <JsonLd data={ldJson} />
      <nav aria-label="Breadcrumb" className="mb-4">
        <ol className="flex flex-wrap items-center gap-1 text-xs text-text-muted">
          {allItems.map((item, index) => {
            const isLast = index === allItems.length - 1;
            return (
              <li key={index} className="flex items-center gap-1">
                {index > 0 && (
                  <span className="text-border mx-0.5 select-none" aria-hidden="true">
                    /
                  </span>
                )}
                {!isLast && item.href ? (
                  <Link
                    href={item.href}
                    className="hover:text-text-link transition-colors duration-fast"
                  >
                    {item.label}
                  </Link>
                ) : (
                  <span className={`font-medium ${isLast ? 'text-text-primary' : ''}`}>
                    {item.label}
                  </span>
                )}
              </li>
            );
          })}
        </ol>
      </nav>
    </>
  );
}
