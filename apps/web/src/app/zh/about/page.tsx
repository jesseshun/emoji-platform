import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '关于我们',
  description: '了解 Emoji 平台的使命与功能。',
};

export default function ZhAboutPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">关于 Emoji 平台</h1>

      <div className="prose prose-sm max-w-none space-y-6">
        <section>
          <h2 className="text-lg font-semibold text-gray-900 mb-2">这是什么？</h2>
          <p className="text-sm text-gray-600 leading-relaxed">
            Emoji 平台是一个免费的在线 Emoji 词典与搜索工具。我们致力于帮助用户快速查找、
            理解和使用 Emoji 表情符号。无论你是想了解某个 Emoji 的含义，还是需要找到合适的
            表情来表达情感，这里都能帮到你。
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-gray-900 mb-2">可以用来做什么？</h2>
          <ul className="text-sm text-gray-600 list-disc pl-5 space-y-1">
            <li>搜索和浏览数千个 Emoji 表情符号</li>
            <li>查看每个 Emoji 的名称、含义和 Unicode 编码</li>
            <li>按分类浏览，快速找到特定类型的表情</li>
            <li>一键复制 Emoji，粘贴到任何地方使用</li>
            <li>阅读 Emoji 相关的专题文章，了解表情背后的文化</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-gray-900 mb-2">面向哪些用户？</h2>
          <p className="text-sm text-gray-600 leading-relaxed">
            我们的平台面向所有对 Emoji 感兴趣的用户。无论你是社交媒体用户、内容创作者、设计师、
            开发者，还是单纯对 Emoji 文化感到好奇的人，都能在这里找到有价值的信息。
            我们提供中英文双语界面，服务全球用户。
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-gray-900 mb-2">数据和授权原则</h2>
          <p className="text-sm text-gray-600 leading-relaxed">
            Emoji 字符数据来源于 Unicode 联盟发布的 Unicode 标准，属于公共领域信息。
            本站的原创文字内容（释义、描述、文章等）为原创作品。我们不复制任何竞品的内容、
            界面设计或数据。关于图片资源的授权，请参阅我们的
            <a href="/zh/license" className="text-blue-600 hover:text-blue-700">授权说明</a>页面。
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-gray-900 mb-2">持续更新</h2>
          <p className="text-sm text-gray-600 leading-relaxed">
            Emoji 世界在不断发展。Unicode 联盟每年都会批准新的 Emoji，我们的平台也会持续跟进更新。
            后续我们计划增加更多实用工具、更丰富的专题内容，以及更完善的搜索体验。
            如果你有任何建议或反馈，欢迎通过 GitHub 与我们联系。
          </p>
        </section>
      </div>
    </div>
  );
}
