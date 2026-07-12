import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getArticleDetail, getErrorMessage, ApiError } from '@/lib/api';
import { buildDetailMetadata, optionalText, safeText, buildArticleJsonLd } from '@/lib/seo';
import { Breadcrumb } from '@/components/Breadcrumb';
import { ArticleCard } from '@/components/ArticleCard';
import { RelatedTopics } from '@/components/RelatedTopics';
import { RelatedEmojis } from '@/components/RelatedEmojis';
import { ErrorState } from '@/components/ErrorState';
import { PUBLISHER_NAME } from '@/lib/constants';

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;

  try {
    const result = await getArticleDetail(slug, 'en');
    const article = result.data.article;
    const title = safeText(article.translation?.title || article.slug);
    const seoTitle = optionalText(article.translation?.seoTitle) || `${title}: Emoji Meaning, Usage, and Related Knowledge`;
    const description = optionalText(article.translation?.seoDescription) || article.translation?.summary || `Read the emoji article about ${title}.`;

    const base = buildDetailMetadata({
      locale: 'en',
      path: `/articles/${slug}`,
      title: seoTitle,
      description,
      ogImage: article.coverImage || undefined,
    });

    return {
      ...base,
      openGraph: {
        ...base.openGraph,
        type: 'article',
        ...(article.publishedAt ? { publishedTime: article.publishedAt } : {}),
        ...(article.updatedAt ? { modifiedTime: article.updatedAt } : {}),
        ...(article.author ? { authors: [article.author.name] } : {}),
      },
    };
  } catch {
    return buildDetailMetadata({
      locale: 'en',
      path: `/articles/${slug}`,
      title: 'Article',
      description: 'Emoji article detail',
    });
  }
}

export default async function EnArticleDetailPage({ params }: Props) {
  const { slug } = await params;

  try {
    const result = await getArticleDetail(slug, 'en');
    const { article, relatedArticles, relatedTopics, relatedEmojis } = result.data;

    const title = safeText(article.translation?.title || article.slug);
    const summary = article.translation?.summary || null;
    const content = article.translation?.content || null;

    const publishedLabel = article.publishedAt
      ? new Date(article.publishedAt).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        })
      : null;

    const authorName = article.author?.name || null;

    let keywords: string[] = [];
    try {
      const raw = article.translation?.keywords;
      if (Array.isArray(raw)) {
        keywords = raw.filter((k): k is string => typeof k === 'string');
      } else if (typeof raw === 'string') {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          keywords = parsed.filter((k): k is string => typeof k === 'string');
        }
      }
    } catch {
      keywords = [];
    }

    const jsonLd = buildArticleJsonLd({
      locale: 'en',
      path: `/articles/${slug}`,
      headline: title,
      description: summary || '',
      datePublished: article.publishedAt,
      dateModified: article.updatedAt,
      image: article.coverImage,
      authorName,
      publisherName: PUBLISHER_NAME,
    });

    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <Breadcrumb
          locale="en"
          items={[
            { label: 'Articles', href: '/en/articles' },
            { label: title || article.slug },
          ]}
        />

        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />

        {/* Header */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-8">
          {article.coverImage && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={article.coverImage}
              alt={title}
              className="w-full h-56 object-cover rounded-lg mb-5"
            />
          )}
          <h1 className="text-2xl font-bold text-gray-900 mb-3">{title}</h1>
          {publishedLabel && (
            <p className="text-xs text-gray-400 mb-3">
              {publishedLabel}
              {authorName ? ` · ${authorName}` : ''}
            </p>
          )}
          {summary && <p className="text-sm text-gray-600">{summary}</p>}
        </div>

        {/* Content */}
        {content && (
          <section className="mt-6 bg-white rounded-xl border border-gray-200 p-6">
            <div
              className="prose prose-sm max-w-none text-gray-700"
              dangerouslySetInnerHTML={{ __html: content.replace(/\n/g, '<br/>') }}
            />
          </section>
        )}

        {/* Keywords */}
        {keywords.length > 0 && (
          <section className="mt-6 flex flex-wrap gap-2">
            {keywords.map((kw) => (
              <span
                key={kw}
                className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-600"
              >
                {kw}
              </span>
            ))}
          </section>
        )}

        {/* Back link */}
        <div className="mt-8">
          <Link
            href="/en/articles"
            className="text-sm text-blue-600 hover:text-blue-800 transition-colors"
          >
            ← Back to Articles
          </Link>
        </div>

        {/* Related articles */}
        {relatedArticles && relatedArticles.length > 0 && (
          <section className="mt-10">
            <h2 className="text-xl font-bold text-gray-900 mb-4">More Articles</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {relatedArticles.map((a) => (
                <ArticleCard key={a.id} article={a} locale="en" />
              ))}
            </div>
          </section>
        )}

        {/* Related topics (internal linking, Phase 5C) */}
        {relatedTopics && relatedTopics.length > 0 && (
          <RelatedTopics topics={relatedTopics} locale="en" />
        )}

        {/* Related emojis (internal linking, Phase 5C) */}
        {relatedEmojis && relatedEmojis.length > 0 && (
          <RelatedEmojis emojis={relatedEmojis} locale="en" />
        )}
      </div>
    );
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      notFound();
    }
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <ErrorState message={getErrorMessage(error)} />
      </div>
    );
  }
}
