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
        <ol className="flex flex-wrap items-center gap-1 text-sm text-gray-500">
          {allItems.map((item, index) => {
            const isLast = index === allItems.length - 1;
            return (
              <li key={index} className="flex items-center gap-1">
                {index > 0 && (
                  <span className="text-gray-300 mx-0.5" aria-hidden="true">
                    /
                  </span>
                )}
                {!isLast && item.href ? (
                  <Link
                    href={item.href}
                    className="text-gray-500 hover:text-blue-600 transition-colors"
                  >
                    {item.label}
                  </Link>
                ) : (
                  <span className={isLast ? 'text-gray-900 font-medium' : 'text-gray-500'}>
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
