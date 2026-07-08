import Link from 'next/link';

export default function ZhHomePage() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <section className="text-center py-12">
        <h1 className="text-4xl font-bold mb-4">😊 Emoji 平台</h1>
        <p className="text-lg text-gray-600 mb-8">
          发现、搜索和复制你喜欢的每一个 Emoji 表情符号
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          <Link
            href="/zh/emojis/"
            className="px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            浏览表情列表
          </Link>
          <Link
            href="/zh/categories/"
            className="px-5 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
          >
            按分类浏览
          </Link>
          <Link
            href="/zh/topics/"
            className="px-5 py-2.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
          >
            专题内容
          </Link>
          <Link
            href="/zh/tools/"
            className="px-5 py-2.5 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition"
          >
            实用工具
          </Link>
        </div>
      </section>
      <section className="grid md:grid-cols-3 gap-6 mt-8">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h2 className="text-xl font-semibold mb-2">🔍 精准搜索</h2>
          <p className="text-gray-600">通过关键词、分类或 Unicode 快速找到你需要的 Emoji。</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h2 className="text-xl font-semibold mb-2">📋 一键复制</h2>
          <p className="text-gray-600">点击即可复制 Emoji，随时随地粘贴使用。</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h2 className="text-xl font-semibold mb-2">🌐 多语言支持</h2>
          <p className="text-gray-600">支持中文和英文界面，满足不同用户需求。</p>
        </div>
      </section>
    </div>
  );
}
