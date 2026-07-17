'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/components/AuthProvider';

const navItems = [
  { href: '/admin/dashboard', label: '仪表盘', group: null },
  { href: '/admin/emojis', label: '表情管理', group: 'content' },
  { href: '/admin/categories', label: '分类管理', group: 'content' },
  { href: '/admin/topics', label: '专题管理', group: 'content' },
  { href: '/admin/articles', label: '文章管理', group: 'content' },
  { href: '/admin/assets', label: '素材管理', group: 'content' },
  { href: '/admin/seo', label: 'SEO 管理', group: 'seo' },
  { href: '/admin/seo/quality', label: 'SEO 质量检查', group: 'seo' },
  { href: '/admin/search/infrastructure', label: '搜索基础设施', group: 'search' },
  { href: '/admin/discovery', label: '发现与推荐', group: 'search' },
  { href: '/admin/search-logs', label: '搜索日志', group: 'analytics' },
  { href: '/admin/search/analytics', label: '搜索分析', group: 'analytics' },
  { href: '/admin/copy-events', label: '复制日志', group: 'analytics' },
  { href: '/admin/reviews', label: '审核管理', group: 'review' },
  { href: '/admin/analytics', label: '统计分析', group: 'analytics' },
  { href: '/admin/settings', label: '系统设置', group: 'system' },
];

export function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { admin, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
  };

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="w-60 bg-[#1C1C1E] text-white flex-shrink-0 flex flex-col border-r border-white/[0.06]">
        {/* Logo */}
        <div className="px-5 py-4 border-b border-white/[0.08]">
          <Link
            href="/admin/dashboard"
            className="flex items-center gap-2.5 text-[15px] font-semibold tracking-tight hover:opacity-80 transition-opacity duration-fast"
          >
            <span className="text-lg" role="img">😊</span>
            <span>Admin</span>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="px-3 py-4 flex-1 overflow-y-auto">
          <ul className="space-y-0.5">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={`
                      block px-3 py-2 rounded-[10px] text-[13px] font-medium
                      transition-all duration-fast
                      ${isActive
                        ? 'bg-white/12 text-white'
                        : 'text-gray-400 hover:text-gray-200 hover:bg-white/[0.05]'
                      }
                    `}
                  >
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* User & Logout */}
        <div className="px-4 py-3 border-t border-white/[0.08]">
          {admin && (
            <div className="mb-2.5 px-1">
              <div className="text-sm text-gray-200 truncate" title={admin.email}>
                {admin.email}
              </div>
              <div className="text-xs text-gray-500 mt-0.5">角色：{admin.role}</div>
            </div>
          )}
          <button
            onClick={handleLogout}
            className="
              w-full py-2 bg-red-500/90 hover:bg-red-500 active:bg-red-600
              rounded-lg text-white text-sm font-medium
              transition-colors duration-fast
            "
          >
            退出登录
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 min-w-0 flex flex-col">
        {/* Top Bar */}
        <header className="h-14 bg-white/80 backdrop-blur-md border-b border-black/[0.04] sticky top-0 z-sticky px-6 flex items-center justify-between shrink-0">
          <div className="text-sm text-text-muted">
            {navItems.find((item) => pathname === item.href)?.label ?? 'Admin'}
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-text-muted hidden sm:inline">
              Emoji Platform Admin
            </span>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 p-6">{children}</div>
      </main>
    </div>
  );
}
