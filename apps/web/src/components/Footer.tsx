import Link from 'next/link';
import type { Locale } from '@/lib/types';

interface FooterProps {
  locale: Locale;
}

const footerSections = [
  {
    zh: '浏览',
    en: 'Browse',
    items: (prefix: string) => [
      { href: `${prefix}/emojis`, zh: '表情列表', en: 'Emojis' },
      { href: `${prefix}/categories`, zh: '分类浏览', en: 'Categories' },
      { href: `${prefix}/topics`, zh: '专题内容', en: 'Topics' },
      { href: `${prefix}/articles`, zh: '文章指南', en: 'Articles' },
      { href: `${prefix}/tools`, zh: '实用工具', en: 'Tools' },
    ],
  },
  {
    zh: '搜索',
    en: 'Search',
    items: (prefix: string) => [
      { href: `${prefix}/search`, zh: '搜索表情', en: 'Search Emojis' },
    ],
  },
  {
    zh: '关于',
    en: 'About',
    items: (prefix: string) => [
      { href: `${prefix}/about`, zh: '关于我们', en: 'About Us' },
      { href: `${prefix}/license`, zh: '授权说明', en: 'License' },
    ],
  },
];

export function Footer({ locale }: FooterProps) {
  const prefix = `/${locale}`;
  const year = new Date().getFullYear();

  return (
    <footer className="mt-auto border-t border-border-subtle bg-surface">
      <div className="mx-auto max-w-content px-4 sm:px-6">
        {/* Links Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-8 py-10">
          {footerSections.map((section) => (
            <div key={section.en}>
              <h3 className="text-xs font-semibold text-text-primary uppercase tracking-wider mb-3">
                {locale === 'zh' ? section.zh : section.en}
              </h3>
              <ul className="space-y-2.5">
                {section.items(prefix).map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className="text-sm text-text-secondary hover:text-text-link transition-colors duration-fast"
                    >
                      {locale === 'zh' ? item.zh : item.en}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* Language / Extra */}
          <div>
            <h3 className="text-xs font-semibold text-text-primary uppercase tracking-wider mb-3">
              {locale === 'zh' ? '语言' : 'Language'}
            </h3>
            <ul className="space-y-2.5">
              <li>
                <Link
                  href="/zh/"
                  className={`text-sm transition-colors duration-fast ${
                    locale === 'zh'
                      ? 'text-accent font-medium'
                      : 'text-text-secondary hover:text-text-link'
                  }`}
                >
                  中文
                </Link>
              </li>
              <li>
                <Link
                  href="/en/"
                  className={`text-sm transition-colors duration-fast ${
                    locale === 'en'
                      ? 'text-accent font-medium'
                      : 'text-text-secondary hover:text-text-link'
                  }`}
                >
                  English
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-border-subtle py-5 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-text-muted">
            &copy; {year} Emoji Platform.{' '}
            {locale === 'zh' ? '版权所有。' : 'All rights reserved.'}
          </p>
          <p className="text-xs text-text-muted">
            {locale === 'zh'
              ? '本项目为原创内容，Emoji 字符基于 Unicode 标准。'
              : 'Original content. Emoji characters are based on the Unicode Standard.'}
          </p>
        </div>
      </div>
    </footer>
  );
}
