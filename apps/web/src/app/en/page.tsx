import Link from 'next/link';

export default function EnHomePage() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <section className="text-center py-12">
        <h1 className="text-4xl font-bold mb-4">😊 Emoji Platform</h1>
        <p className="text-lg text-gray-600 mb-8">
          Discover, search, and copy every Emoji you love
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          <Link
            href="/en/emojis/"
            className="px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            Browse Emojis
          </Link>
          <Link
            href="/en/categories/"
            className="px-5 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
          >
            Categories
          </Link>
          <Link
            href="/en/topics/"
            className="px-5 py-2.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
          >
            Topics
          </Link>
          <Link
            href="/en/tools/"
            className="px-5 py-2.5 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition"
          >
            Tools
          </Link>
        </div>
      </section>
      <section className="grid md:grid-cols-3 gap-6 mt-8">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h2 className="text-xl font-semibold mb-2">🔍 Precise Search</h2>
          <p className="text-gray-600">
            Quickly find Emojis by keyword, category, or Unicode.
          </p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h2 className="text-xl font-semibold mb-2">📋 One-Click Copy</h2>
          <p className="text-gray-600">Click to copy any Emoji and paste it anywhere.</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h2 className="text-xl font-semibold mb-2">🌐 Multilingual</h2>
          <p className="text-gray-600">Support for Chinese and English interfaces.</p>
        </div>
      </section>
    </div>
  );
}
