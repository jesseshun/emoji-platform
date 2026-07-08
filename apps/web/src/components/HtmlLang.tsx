'use client';

import { usePathname } from 'next/navigation';
import { useEffect } from 'react';

/**
 * Sets the <html lang> attribute based on the current locale path.
 * zh/* → lang="zh", en/* → lang="en", otherwise → lang="en"
 */
export function HtmlLang() {
  const pathname = usePathname();

  useEffect(() => {
    const lang = pathname.startsWith('/zh') ? 'zh' : 'en';
    document.documentElement.lang = lang;
  }, [pathname]);

  return null;
}
