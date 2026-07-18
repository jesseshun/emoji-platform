import type { ReactNode } from 'react';
import { headers } from 'next/headers';
import { notFound } from 'next/navigation';
import {
  ApiError,
  getArticleDetail,
  getCategoryDetail,
  getEmojiDetail,
  getTopicDetail,
} from './api';
import type { Locale } from './types';

type PublicDetailKind = 'article' | 'category' | 'emoji' | 'topic';

interface PublicDetailLayoutProps {
  children: ReactNode;
  params: Promise<{ slug: string }>;
}

async function ensurePublicDetailExists(
  kind: PublicDetailKind,
  slug: string,
  locale: Locale,
) {
  try {
    switch (kind) {
      case 'article':
        await getArticleDetail(slug, locale);
        break;
      case 'category':
        await getCategoryDetail(slug, locale, 1, 1);
        break;
      case 'emoji':
        await getEmojiDetail(slug, locale);
        break;
      case 'topic':
        await getTopicDetail(slug, locale);
        break;
    }
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      notFound();
    }
  }
}

export function createPublicDetailLayout(kind: PublicDetailKind, locale: Locale) {
  return async function PublicDetailLayout({ children, params }: PublicDetailLayoutProps) {
    const { slug } = await params;
    await ensurePublicDetailExists(kind, slug, locale);
    return children;
  };
}

export function createPublicCollectionLayout(
  kind: PublicDetailKind,
  locale: Locale,
  segment: string,
) {
  return async function PublicCollectionLayout({ children }: { children: ReactNode }) {
    const path = headers().get('x-locale-path') ?? '';
    const parts = path.split('/').filter(Boolean);

    if (parts.length === 3 && parts[0] === locale && parts[1] === segment) {
      await ensurePublicDetailExists(kind, decodeURIComponent(parts[2]), locale);
    }

    return children;
  };
}
