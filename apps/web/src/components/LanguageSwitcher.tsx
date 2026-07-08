'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';

export function LanguageSwitcher() {
  const pathname = usePathname();
  const currentLocale = pathname.startsWith('/zh') ? 'zh' : 'en';
  const targetLocale = currentLocale === 'zh' ? 'en' : 'zh';

  // Replace locale prefix in pathname
  const targetPath = pathname.replace(/^\/(zh|en)/, `/${targetLocale}`) || `/${targetLocale}`;

  return (
    <Link
      href={targetPath}
      className="text-sm px-3 py-1.5 rounded-md border border-gray-300 text-gray-600 hover:text-gray-900 hover:border-gray-400 transition"
    >
      {targetLocale === 'zh' ? '中文' : 'English'}
    </Link>
  );
}
