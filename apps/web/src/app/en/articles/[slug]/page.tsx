import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getArticleDetail, getErrorMessage, ApiError } from '@/lib/api';
import { buildDetailMetadata, optionalText, safeText, buildArticleJsonLd } from '@/lib/seo';
import { ArticleDetailView } from '@/components/ArticleDetailView';
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
    const { article } = result.data;

    const title = safeText(article.translation?.title || article.slug);
    const summary = article.translation?.summary || null;
    const authorName = article.author?.name || null;

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

    return <ArticleDetailView data={result.data} jsonLd={jsonLd} locale="en" />;
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      notFound();
    }
    return (
      <div className="mx-auto max-w-content px-4 py-12 sm:px-6">
        <ErrorState locale="en" message={getErrorMessage(error, 'en')} />
      </div>
    );
  }
}
