import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '授权说明',
  description: '了解 Emoji 的 Unicode 许可和使用条款。',
};

export default function ZhLicensePage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">授权说明</h1>

      <div className="prose prose-sm max-w-none space-y-6">
        <section>
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Emoji 字符与 Unicode 标准</h2>
          <p className="text-sm text-gray-600 leading-relaxed">
            本站展示的所有 Emoji 字符（如 😊、🎉、❤️ 等）均基于 Unicode 联盟制定的 Unicode 标准。
            Emoji 字符本身是 Unicode 标准的一部分，属于通用字符集，不受版权保护。
            任何人都可以自由使用这些字符进行显示、输入和传输。
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Emoji 字符与 Emoji 图片的区别</h2>
          <p className="text-sm text-gray-600 leading-relaxed">
            需要特别说明的是，Unicode 标准定义的 Emoji 字符与各平台（如 Apple、Google、Microsoft、
            Samsung 等）设计的 Emoji 图片不是一回事。Unicode 标准只规定了每个 Emoji 的含义和参考外观，
            而各平台会根据自己的设计风格绘制具体的 Emoji 图像。
          </p>
          <p className="text-sm text-gray-600 leading-relaxed mt-2">
            你在设备上看到的 Emoji 外观取决于你的操作系统和字体。例如，同一个 😊 字符在 iPhone、
            Android 和 Windows 上可能呈现不同的视觉效果。这些平台特定的 Emoji 图片受到各自厂商的
            版权和商标保护。
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-gray-900 mb-2">图片资源许可</h2>
          <p className="text-sm text-gray-600 leading-relaxed">
            本站不会提供未经授权的平台 Emoji 图片下载。如果你需要在自己的项目中使用 Emoji 图片资源，
            建议使用开源 Emoji 字体或图片集，例如：
          </p>
          <ul className="text-sm text-gray-600 list-disc pl-5 mt-2 space-y-1">
            <li>
              <strong>Noto Color Emoji</strong> — Google 开发的开源 Emoji 字体，使用
              SIL Open Font License 授权。
            </li>
            <li>
              <strong>OpenMoji</strong> — 开源 Emoji 项目，使用 Creative Commons
              Attribution-ShareAlike 4.0 许可。
            </li>
            <li>
              <strong>Twemoji</strong> — Twitter 的 Emoji 图片集，使用 Creative Commons
              Attribution 4.0 许可。
            </li>
          </ul>
          <p className="text-sm text-gray-600 leading-relaxed mt-2">
            如果本站后续展示以上任何开源 Emoji 图片资源，将明确标注 Provider、License 和
            Attribution 信息，确保符合相关许可要求。
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-gray-900 mb-2">本站内容许可</h2>
          <p className="text-sm text-gray-600 leading-relaxed">
            本站的原创文字内容（包括 Emoji 释义、分类描述、专题文章等）为原创作品，保留相关权利。
            未经许可，请勿大量复制或镜像本站内容。Emoji 字符数据来源于 Unicode 标准，属于公共领域信息。
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-gray-900 mb-2">免责声明</h2>
          <p className="text-sm text-gray-600 leading-relaxed">
            本站尽力保证 Emoji 信息的准确性，但不对此做任何明示或暗示的保证。Emoji 在不同平台上的
            显示效果可能有所差异，本站不对因使用本站信息而产生的任何后果承担责任。
          </p>
        </section>
      </div>
    </div>
  );
}
