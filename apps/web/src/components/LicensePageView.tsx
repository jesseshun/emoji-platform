import { PublicPageHeader } from '@/components/PublicPageHeader';
import { PageContainer } from '@/components/ui';

interface LicensePageViewProps {
  locale: 'zh' | 'en';
}

const externalLinkClass = 'font-medium text-text-link hover:text-text-link-hover';

export function LicensePageView({ locale }: LicensePageViewProps) {
  const zh = locale === 'zh';

  return (
    <PageContainer className="py-8 sm:py-12 lg:py-16">
      <PublicPageHeader
        eyebrow={zh ? '授权与归属' : 'License & attribution'}
        title={zh ? '字符、图像与内容的使用边界' : 'Usage boundaries for characters, artwork, and content'}
        description={zh
          ? 'Emoji 字符、Unicode 标准材料、平台绘制图像和本站原创内容属于不同层次。使用前，请先确认你面对的是哪一种资源。'
          : 'Emoji characters, Unicode materials, vendor artwork, and original site content are separate layers. Before reuse, identify which resource you are working with.'}
        note={zh
          ? '本页提供一般性归属说明，不构成法律意见。具体使用应以各权利方最新许可文本为准。'
          : 'This page offers general attribution information, not legal advice. Refer to each rights holder’s current license terms for your use case.'}
      />

      <div className="grid gap-10 py-10 lg:grid-cols-[15rem_minmax(0,1fr)] lg:gap-16">
        <nav aria-label={zh ? '授权说明目录' : 'License page contents'} className="lg:sticky lg:top-24 lg:self-start">
          <p className="text-xs font-semibold uppercase text-text-muted">{zh ? '目录' : 'On this page'}</p>
          <ol className="mt-3 space-y-2 text-sm text-text-secondary">
            <li><a className="hover:text-text-primary" href="#characters">01 · {zh ? 'Emoji 字符' : 'Emoji characters'}</a></li>
            <li><a className="hover:text-text-primary" href="#artwork">02 · {zh ? '平台图像' : 'Vendor artwork'}</a></li>
            <li><a className="hover:text-text-primary" href="#open-source">03 · {zh ? '开源资源' : 'Open-source sets'}</a></li>
            <li><a className="hover:text-text-primary" href="#site-content">04 · {zh ? '本站内容' : 'Site content'}</a></li>
            <li><a className="hover:text-text-primary" href="#disclaimer">05 · {zh ? '免责声明' : 'Disclaimer'}</a></li>
          </ol>
        </nav>

        <article className="max-w-3xl divide-y divide-border-subtle">
          <section id="characters" className="scroll-mt-24 pb-9">
            <p className="text-xs font-medium text-accent">01</p>
            <h2 className="mt-2 text-xl font-semibold text-text-primary">{zh ? 'Emoji 字符与 Unicode 标准' : 'Emoji characters and the Unicode Standard'}</h2>
            <p className="mt-4 text-base leading-7 text-text-secondary">
              {zh
                ? '本站显示的 Emoji 字符属于 Unicode 编码字符。字符可以在文本中输入、复制和传输；Unicode 发布的标准文本、数据文件与其他材料则适用 Unicode 自身的使用条款。'
                : 'Emoji shown on this site are Unicode-encoded characters. Characters can be entered, copied, and transmitted as text; standard text, data files, and other materials published by Unicode remain subject to Unicode’s own terms of use.'}
            </p>
            <a className={`mt-4 inline-flex text-sm ${externalLinkClass}`} href="https://www.unicode.org/license.html" target="_blank" rel="noreferrer">
              {zh ? '查看 Unicode 许可条款 ↗' : 'Review the Unicode license terms ↗'}
            </a>
          </section>

          <section id="artwork" className="scroll-mt-24 py-9">
            <p className="text-xs font-medium text-accent">02</p>
            <h2 className="mt-2 text-xl font-semibold text-text-primary">{zh ? '字符不等于平台绘制图像' : 'Characters are not vendor-drawn artwork'}</h2>
            <p className="mt-4 text-base leading-7 text-text-secondary">
              {zh
                ? 'Apple、Google、Microsoft、Samsung 等平台会为同一字符绘制不同外观。设备上看到的图像取决于操作系统与字体，这些具体图像可能受各厂商的版权、商标和许可条款保护。本站不提供未经授权的平台图像下载。'
                : 'Apple, Google, Microsoft, Samsung, and other vendors draw different artwork for the same character. What appears on a device depends on its operating system and fonts; that specific artwork may be protected by each vendor’s copyright, trademark, and license terms. This site does not offer unauthorized vendor artwork downloads.'}
            </p>
          </section>

          <section id="open-source" className="scroll-mt-24 py-9">
            <p className="text-xs font-medium text-accent">03</p>
            <h2 className="mt-2 text-xl font-semibold text-text-primary">{zh ? '开源 Emoji 资源' : 'Open-source emoji resources'}</h2>
            <p className="mt-4 text-base leading-7 text-text-secondary">
              {zh ? '需要图像或字体时，可以评估以下项目。每个项目的文件、版本和归属要求可能不同，请在发布前阅读其当前许可。' : 'When you need artwork or fonts, consider the projects below. Files, versions, and attribution requirements can differ, so review the current license before publishing.'}
            </p>
            <dl className="mt-6 divide-y divide-border-subtle rounded-[8px] border border-border-subtle bg-surface px-4 sm:px-5">
              <ResourceRow name="Noto Emoji" license="SIL Open Font License / Apache 2.0" href="https://github.com/googlefonts/noto-emoji" />
              <ResourceRow name="OpenMoji" license="CC BY-SA 4.0" href="https://openmoji.org/about/" />
              <ResourceRow name="Twemoji" license="CC BY 4.0 / MIT" href="https://github.com/jdecked/twemoji" />
            </dl>
          </section>

          <section id="site-content" className="scroll-mt-24 py-9">
            <p className="text-xs font-medium text-accent">04</p>
            <h2 className="mt-2 text-xl font-semibold text-text-primary">{zh ? '本站原创内容' : 'Original site content'}</h2>
            <p className="mt-4 text-base leading-7 text-text-secondary">
              {zh
                ? '本站原创释义、描述、分类文字、专题与文章保留相关权利。未经许可，请勿大规模复制、镜像或重新发布。引用单个 Emoji 字符不等同于复制本站的原创说明。'
                : 'Rights are reserved for original meanings, descriptions, category copy, topics, and articles on this site. Do not copy, mirror, or republish substantial portions without permission. Quoting an emoji character is not the same as copying this site’s original explanation.'}
            </p>
          </section>

          <section id="disclaimer" className="scroll-mt-24 pt-9">
            <p className="text-xs font-medium text-accent">05</p>
            <h2 className="mt-2 text-xl font-semibold text-text-primary">{zh ? '免责声明' : 'Disclaimer'}</h2>
            <p className="mt-4 text-base leading-7 text-text-secondary">
              {zh
                ? '我们努力保持信息准确，但不保证所有内容始终完整或适合特定用途。Emoji 的含义和显示可能因语境、平台、字体与版本而异。'
                : 'We work to keep information accurate but do not warrant that every item is always complete or suitable for a particular purpose. Emoji meaning and rendering can vary by context, platform, font, and version.'}
            </p>
          </section>
        </article>
      </div>
    </PageContainer>
  );
}

function ResourceRow({ name, license, href }: { name: string; license: string; href: string }) {
  return (
    <div className="grid gap-1 py-4 sm:grid-cols-[1fr_auto] sm:items-center sm:gap-4">
      <dt>
        <a className={`text-sm ${externalLinkClass}`} href={href} target="_blank" rel="noreferrer">{name} ↗</a>
      </dt>
      <dd className="text-xs text-text-secondary">{license}</dd>
    </div>
  );
}
