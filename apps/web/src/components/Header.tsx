import Link from 'next/link';
import { LanguageSwitcher } from './LanguageSwitcher';
import type { Locale } from '@/lib/types';

interface HeaderProps {
  locale: Locale;
}

export function Header({ locale }: HeaderProps) {
  const prefix = `/${locale}`;

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-6xl mx-auto flex items-center justify-between px-4 py-3">
        <Link href={prefix} className="text-xl font-bold text-blue-600 whitespace-nowrap">
          😊 Emoji Platform
        </Link>

        <nav className="hidden sm:flex items-center gap-1 text-sm">
          <Link
            href={`${prefix}/emojis`}
            className="px-3 py-1.5 rounded-lg text-gray-600 hover:text-blue-600 hover:bg-blue-50 transition"
          >
            {locale === 'zh' ? '表情列表' : 'Emojis'}
          </Link>
          <Link
            href={`${prefix}/categories`}
            className="px-3 py-1.5 rounded-lg text-gray-600 hover:text-blue-600 hover:bg-blue-50 transition"
          >
            {locale === 'zh' ? '分类' : 'Categories'}
          </Link>
          <Link
            href={`${prefix}/topics`}
            className="px-3 py-1.5 rounded-lg text-gray-600 hover:text-blue-600 hover:bg-blue-50 transition"
          >
            {locale === 'zh' ? '专题' : 'Topics'}
          </Link>
          <Link
            href={`${prefix}/tools`}
            className="px-3 py-1.5 rounded-lg text-gray-600 hover:text-blue-600 hover:bg-blue-50 transition"
          >
            {locale === 'zh' ? '工具' : 'Tools'}
          </Link>
        </nav>

        <div className="flex items-center gap-2">
          {/* Mobile nav - simplified */}
          <div className="sm:hidden flex items-center gap-1 text-xs">
            <Link href={`${prefix}/emojis`} className="px-2 py-1 text-gray-500 hover:text-blue-600">
              {locale === 'zh' ? '表情' : 'Emojis'}
            </Link>
            <Link href={`${prefix}/categories`} className="px-2 py-1 text-gray-500 hover:text-blue-600">
              {locale === 'zh' ? '分类' : 'Cat.'}
            </Link>
          </div>
          <LanguageSwitcher />
        </div>
      </div>
    </header>
  );
}
