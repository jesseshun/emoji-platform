import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'License',
  description: 'Learn about Unicode licensing and usage terms for Emoji.',
};

export default function EnLicensePage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">License &amp; Attribution</h1>

      <div className="prose prose-sm max-w-none space-y-6">
        <section>
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Emoji Characters and the Unicode Standard</h2>
          <p className="text-sm text-gray-600 leading-relaxed">
            All emoji characters displayed on this site (such as 😊, 🎉, ❤️) are part of the
            Unicode Standard developed by the Unicode Consortium. Emoji characters themselves
            are part of the universal character set and are not subject to copyright protection.
            Anyone can freely use these characters for display, input, and transmission.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Emoji Characters vs. Emoji Images</h2>
          <p className="text-sm text-gray-600 leading-relaxed">
            It is important to distinguish between Unicode emoji characters and the emoji images
            designed by platform vendors (such as Apple, Google, Microsoft, Samsung, etc.).
            The Unicode Standard only defines the meaning and reference appearance of each emoji,
            while each platform designs its own emoji images according to its design guidelines.
          </p>
          <p className="text-sm text-gray-600 leading-relaxed mt-2">
            The emoji appearance you see on your device depends on your operating system and fonts.
            For example, the same 😊 character may look different on iPhone, Android, and Windows.
            These platform-specific emoji images are protected by the respective vendor&apos;s
            copyright and trademark rights.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Image Resource Licensing</h2>
          <p className="text-sm text-gray-600 leading-relaxed">
            This site does not provide unauthorized downloads of platform-specific emoji images.
            If you need to use emoji image resources in your own projects, we recommend using
            open-source emoji fonts or image sets, such as:
          </p>
          <ul className="text-sm text-gray-600 list-disc pl-5 mt-2 space-y-1">
            <li>
              <strong>Noto Color Emoji</strong> — Open-source emoji font by Google, licensed under
              the SIL Open Font License.
            </li>
            <li>
              <strong>OpenMoji</strong> — Open-source emoji project, licensed under Creative Commons
              Attribution-ShareAlike 4.0.
            </li>
            <li>
              <strong>Twemoji</strong> — Twitter&apos;s emoji image set, licensed under Creative Commons
              Attribution 4.0.
            </li>
          </ul>
          <p className="text-sm text-gray-600 leading-relaxed mt-2">
            If this site displays any of the above open-source emoji image resources in the future,
            the provider, license, and attribution information will be clearly indicated to ensure
            compliance with the respective license requirements.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Content License</h2>
          <p className="text-sm text-gray-600 leading-relaxed">
            The original written content on this site (including emoji meanings, category descriptions,
            topic articles, etc.) is original work with all rights reserved. Please do not copy or
            mirror large portions of this site&apos;s content without permission. Emoji character data
            is derived from the Unicode Standard and is in the public domain.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Disclaimer</h2>
          <p className="text-sm text-gray-600 leading-relaxed">
            While we strive to ensure the accuracy of emoji information, we make no warranties,
            express or implied, regarding its completeness or correctness. Emoji rendering may
            vary across platforms. We are not responsible for any consequences arising from the
            use of information on this site.
          </p>
        </section>
      </div>
    </div>
  );
}
