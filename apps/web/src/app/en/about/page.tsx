import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'About Us',
  description: 'Learn about the Emoji Platform mission and features.',
};

export default function EnAboutPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">About Emoji Platform</h1>

      <div className="prose prose-sm max-w-none space-y-6">
        <section>
          <h2 className="text-lg font-semibold text-gray-900 mb-2">What is this?</h2>
          <p className="text-sm text-gray-600 leading-relaxed">
            Emoji Platform is a free online emoji dictionary and search tool. We are dedicated
            to helping users quickly find, understand, and use emoji characters. Whether you
            want to know the meaning of a specific emoji or need to find the right expression
            for your message, you will find it here.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-gray-900 mb-2">What can you do here?</h2>
          <ul className="text-sm text-gray-600 list-disc pl-5 space-y-1">
            <li>Search and browse thousands of emoji characters</li>
            <li>View each emoji&apos;s name, meaning, and Unicode codepoint</li>
            <li>Browse by category to quickly find specific types of emojis</li>
            <li>Copy emojis with one click and paste them anywhere</li>
            <li>Read emoji-related articles and explore the culture behind the symbols</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Who is this for?</h2>
          <p className="text-sm text-gray-600 leading-relaxed">
            Our platform is for everyone interested in emojis. Whether you are a social media user,
            content creator, designer, developer, or simply curious about emoji culture, you will
            find valuable information here. We offer bilingual support in Chinese and English to
            serve users worldwide.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Data and Licensing Principles</h2>
          <p className="text-sm text-gray-600 leading-relaxed">
            Emoji character data is derived from the Unicode Standard published by the Unicode
            Consortium and is in the public domain. The original written content on this site
            (meanings, descriptions, articles, etc.) is original work. We do not copy any
            competitor&apos;s content, UI design, or data. For information about image resource
            licensing, please see our
            {' '}
            <a href="/en/license" className="text-blue-600 hover:text-blue-700">License</a> page.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Continuous Updates</h2>
          <p className="text-sm text-gray-600 leading-relaxed">
            The emoji world is constantly evolving. The Unicode Consortium approves new emojis
            every year, and our platform will keep up with these updates. We plan to add more
            practical tools, richer topic content, and an improved search experience in the future.
            If you have suggestions or feedback, feel free to reach out via GitHub.
          </p>
        </section>
      </div>
    </div>
  );
}
