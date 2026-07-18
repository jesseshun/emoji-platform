import type { EmojiAsset, Locale } from '@/lib/types';

interface EmojiAssetsProps {
  assets: EmojiAsset[];
  locale: Locale;
}

export function EmojiAssets({ assets, locale }: EmojiAssetsProps) {
  if (!assets || assets.length === 0) return null;

  return (
    <section className="mt-8">
      <h2 className="mb-4 text-xl font-semibold text-text-primary">
        {locale === 'zh' ? '图片资源' : 'Image Assets'}
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {assets.map((asset) => (
          <div
            key={asset.id}
            className="rounded-[8px] border border-border-subtle bg-surface p-4"
          >
            <div className="flex items-center gap-3 mb-3">
              <span className="rounded-[6px] bg-bg-subtle px-2 py-0.5 text-xs font-medium text-text-secondary">
                {asset.provider}
              </span>
              <span className="text-xs uppercase text-text-muted">{asset.fileType}</span>
            </div>
            <div className="space-y-1 text-xs text-text-secondary">
              {asset.licenseName && (
                <p>
                  <span className="font-medium text-text-primary">
                    {locale === 'zh' ? '许可：' : 'License: '}
                  </span>
                  {asset.licenseUrl ? (
                    <a
                      href={asset.licenseUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-text-link hover:underline"
                    >
                      {asset.licenseName}
                    </a>
                  ) : (
                    asset.licenseName
                  )}
                </p>
              )}
              {asset.attribution && (
                <p>
                  <span className="font-medium text-text-primary">
                    {locale === 'zh' ? '归属：' : 'Attribution: '}
                  </span>
                  {asset.attribution}
                </p>
              )}
              {asset.width && asset.height && (
                <p>
                  <span className="font-medium text-text-primary">
                    {locale === 'zh' ? '尺寸：' : 'Size: '}
                  </span>
                  {asset.width} × {asset.height}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
