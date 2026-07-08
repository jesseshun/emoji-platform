import type { EmojiAsset, Locale } from '@/lib/types';

interface EmojiAssetsProps {
  assets: EmojiAsset[];
  locale: Locale;
}

export function EmojiAssets({ assets, locale }: EmojiAssetsProps) {
  if (!assets || assets.length === 0) return null;

  return (
    <section className="mt-8">
      <h2 className="text-xl font-bold text-gray-900 mb-4">
        {locale === 'zh' ? '图片资源' : 'Image Assets'}
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {assets.map((asset) => (
          <div
            key={asset.id}
            className="bg-white rounded-lg border border-gray-200 p-4"
          >
            <div className="flex items-center gap-3 mb-3">
              <span className="text-xs px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 font-medium">
                {asset.provider}
              </span>
              <span className="text-xs text-gray-400 uppercase">{asset.fileType}</span>
            </div>
            <div className="text-xs text-gray-500 space-y-1">
              {asset.licenseName && (
                <p>
                  <span className="font-medium text-gray-600">
                    {locale === 'zh' ? '许可：' : 'License: '}
                  </span>
                  {asset.licenseUrl ? (
                    <a
                      href={asset.licenseUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-500 hover:underline"
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
                  <span className="font-medium text-gray-600">
                    {locale === 'zh' ? '归属：' : 'Attribution: '}
                  </span>
                  {asset.attribution}
                </p>
              )}
              {asset.width && asset.height && (
                <p>
                  <span className="font-medium text-gray-600">
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
