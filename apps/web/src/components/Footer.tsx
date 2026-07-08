import Link from 'next/link';
import type { Locale } from '@/lib/types';

interface FooterProps {
  locale: Locale;
}

export function Footer({ locale }: FooterProps) {
  const prefix = `/${locale}`;

  return (
    <footer className="bg-white border-t border-gray-200 py-8 mt-auto">
      <div className="max-w-6xl mx-auto px-4">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 mb-6">
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-2">
              {locale === 'zh' ? '浏览' : 'Browse'}
            </h3>
            <div className="flex flex-col gap-1">
              <Link href={`${prefix}/emojis`} className="text-sm text-gray-500 hover:text-blue-600 transition">
                {locale === 'zh' ? '表情列表' : 'Emojis'}
              </Link>
              <Link href={`${prefix}/categories`} className="text-sm text-gray-500 hover:text-blue-600 transition">
                {locale === 'zh' ? '分类浏览' : 'Categories'}
              </Link>
              <Link href={`${prefix}/topics`} className="text-sm text-gray-500 hover:text-blue-600 transition">
                {locale === 'zh' ? '专题内容' : 'Topics'}
              </Link>
              <Link href={`${prefix}/tools`} className="text-sm text-gray-500 hover:text-blue-600 transition">
                {locale === 'zh' ? '实用工具' : 'Tools'}
              </Link>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-2">
              {locale === 'zh' ? '搜索' : 'Search'}
            </h3>
            <div className="flex flex-col gap-1">
              <Link href={`${prefix}/search`} className="text-sm text-gray-500 hover:text-blue-600 transition">
                {locale === 'zh' ? '搜索表情' : 'Search Emojis'}
              </Link>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-2">
              {locale === 'zh' ? '关于' : 'About'}
            </h3>
            <div className="flex flex-col gap-1">
              <Link href={`${prefix}/about`} className="text-sm text-gray-500 hover:text-blue-600 transition">
                {locale === 'zh' ? '关于我们' : 'About Us'}
              </Link>
              <Link href={`${prefix}/license`} className="text-sm text-gray-500 hover:text-blue-600 transition">
                {locale === 'zh' ? '授权说明' : 'License'}
              </Link>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-2">
              {locale === 'zh' ? '语言' : 'Language'}
            </h3>
            <div className="flex flex-col gap-1">
              <Link href="/zh/" className="text-sm text-gray-500 hover:text-blue-600 transition">
                中文
              </Link>
              <Link href="/en/" className="text-sm text-gray-500 hover:text-blue-600 transition">
                English
              </Link>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-100 pt-4 text-center text-xs text-gray-400">
          <p>&copy; {new Date().getFullYear()} Emoji Platform. {locale === 'zh' ? '版权所有。' : 'All rights reserved.'}</p>
          <p className="mt-1">
            {locale === 'zh'
              ? '本项目为原创内容，Emoji 字符基于 Unicode 标准。'
              : 'Original content. Emoji characters are based on the Unicode Standard.'}
          </p>
        </div>
      </div>
    </footer>
  );
}
