import Link from 'next/link';
import type { ArticleItem, Locale } from '@/lib/types';

interface ArticleCardProps {
  article: ArticleItem;
  locale: Locale;
}

function formatDate(value: string | null, locale: Locale): string | null {
  if (!value) return null;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return null;
  return d.toLocaleDateString(locale === 'zh' ? 'zh-CN' : 'en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function ArticleCard({ article, locale }: ArticleCardProps) {
  const title = article.translation?.title || article.slug;
  const summary = article.translation?.summary;
  const date = formatDate(article.publishedAt, locale);

  return (
    <Link
      href={`/${locale}/articles/${article.slug}`}
      className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-md transition-shadow group block"
    >
      {article.coverImage ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={article.coverImage}
          alt={title}
          className="w-full h-40 object-cover"
          loading="lazy"
        />
      ) : (
        <div className="w-full h-40 bg-gradient-to-br from-purple-50 to-blue-50 flex items-center justify-center text-3xl">
          📄
        </div>
      )}
      <div className="p-5">
        <h3 className="text-base font-semibold text-gray-900 group-hover:text-purple-600 transition-colors mb-2">
          {title}
        </h3>
        {summary && <p className="text-sm text-gray-500 line-clamp-2">{summary}</p>}
        {date && <p className="text-xs text-gray-400 mt-3">{date}</p>}
      </div>
    </Link>
  );
}
