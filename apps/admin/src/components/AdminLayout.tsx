'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/components/AuthProvider';

const navItems = [
  { href: '/admin/dashboard', label: '仪表盘' },
  { href: '/admin/emojis', label: '表情管理' },
  { href: '/admin/categories', label: '分类管理' },
  { href: '/admin/topics', label: '专题管理' },
  { href: '/admin/articles', label: '文章管理' },
  { href: '/admin/assets', label: '素材管理' },
  { href: '/admin/seo', label: 'SEO 管理' },
  { href: '/admin/seo/quality', label: 'SEO 质量检查' },
  { href: '/admin/search/infrastructure', label: '搜索基础设施' },
  { href: '/admin/search-logs', label: '搜索日志' },
  { href: '/admin/copy-events', label: '复制日志' },
  { href: '/admin/reviews', label: '审核管理' },
  { href: '/admin/analytics', label: '统计分析' },
  { href: '/admin/settings', label: '系统设置' },
];

export function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { admin, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
  };

  return (
    <div className="flex min-h-screen">
      <aside className="w-60 bg-gray-900 text-white flex-shrink-0 flex flex-col">
        <div className="px-5 py-4 border-b border-gray-700">
          <Link href="/admin/dashboard" className="text-lg font-bold">
            😊 Admin
          </Link>
        </div>
        <nav className="px-3 py-4 flex-1">
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
        <div className="px-4 py-3 border-t border-gray-700 text-sm">
          {admin && (
            <div className="mb-2">
              <div className="text-gray-200 truncate" title={admin.email}>
                {admin.email}
              </div>
              <div className="text-gray-400 text-xs">角色：{admin.role}</div>
            </div>
          )}
          <button
            onClick={handleLogout}
            className="w-full py-2 bg-red-600 hover:bg-red-700 rounded text-white text-sm"
          >
            退出登录
          </button>
        </div>
      </aside>
      <main className="flex-1 p-6">{children}</main>
    </div>
  );
}
