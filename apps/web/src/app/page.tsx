import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="flex flex-col items-center justify-center py-24 px-4">
      <h1 className="text-4xl font-bold mb-4">😊 Emoji Platform</h1>
      <p className="text-lg text-gray-600 mb-8 text-center max-w-md">
        全球 Emoji 词典与搜索平台 — 探索、搜索、复制你喜欢的每一个表情符号。
      </p>
      <div className="flex gap-4">
        <Link
          href="/zh/"
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          中文版
        </Link>
        <Link
          href="/en/"
          className="px-6 py-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition"
        >
          English
        </Link>
      </div>
    </div>
  );
}
