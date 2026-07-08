import Link from 'next/link';

export function Header() {
  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-6xl mx-auto flex items-center justify-between px-4 py-3">
        <Link href="/" className="text-xl font-bold text-blue-600">
          😊 Emoji Platform
        </Link>
        <nav className="flex gap-4 text-sm">
          <Link href="/zh/emojis/" className="hover:text-blue-600 transition">
            表情列表
          </Link>
          <Link href="/zh/categories/" className="hover:text-blue-600 transition">
            分类
          </Link>
          <Link href="/zh/topics/" className="hover:text-blue-600 transition">
            专题
          </Link>
          <Link href="/zh/tools/" className="hover:text-blue-600 transition">
            工具
          </Link>
        </nav>
      </div>
    </header>
  );
}
