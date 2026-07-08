'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navItems = [
  { href: '/admin/dashboard', label: '仪表盘' },
  { href: '/admin/emojis', label: '表情管理' },
  { href: '/admin/categories', label: '分类管理' },
  { href: '/admin/topics', label: '专题管理' },
  { href: '/admin/articles', label: '文章管理' },
  { href: '/admin/assets', label: '素材管理' },
  { href: '/admin/seo', label: 'SEO 管理' },
  { href: '/admin/search-logs', label: '搜索日志' },
  { href: '/admin/analytics', label: '统计分析' },
  { href: '/admin/settings', label: '系统设置' },
];

export function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="flex min-h-screen">
      <aside className="w-60 bg-gray-900 text-white flex-shrink-0">
        <div className="px-5 py-4 border-b border-gray-700">
          <Link href="/admin/dashboard" className="text-lg font-bold">
            😊 Admin
          </Link>
        </div>
        <nav className="px-3 py-4">
          <ul className="space-y-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={`block px-3 py-2 rounded text-sm transition ${
                      isActive
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                    }`}
                  >
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </aside>
      <main className="flex-1 p-6">{children}</main>
    </div>
  );
}
