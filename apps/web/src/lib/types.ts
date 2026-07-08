import type { Locale, PaginationMeta } from '@emoji-platform/types';

// ─── Base Emoji (shared fields) ──────────────────────

export interface EmojiBase {
  id: string;
  emojiChar: string;
  slug: string;
  unicodeCodepoint: string | null;
  shortcode: string | null;
  category: {
    id: string;
    slug: string;
    name: string | null;
    iconEmoji?: string | null;
  } | null;
  translation: {
    name: string | null;
    shortName?: string | null;
    oneLineMeaning: string | null;
    keywords?: string[] | null;
    seoTitle?: string | null;
    seoDescription?: string | null;
    locale?: string;
  } | null;
}

// ─── Emoji ─────────────────────────────────────────────

export interface EmojiListItem extends EmojiBase {
  emojiVersion: string | null;
  unicodeVersion: string | null;
  category: {
    id: string;
    slug: string;
    iconEmoji: string | null;
    name: string | null;
  } | null;
  translation: {
    locale: string;
    name: string | null;
    shortName: string | null;
    oneLineMeaning: string | null;
    keywords: string[] | null;
    seoTitle: string | null;
    seoDescription: string | null;
  } | null;
}

// ─── Category ──────────────────────────────────────────

export interface CategoryItem {
  id: string;
  slug: string;
  iconEmoji: string | null;
  parentId: string | null;
  sortOrder: number;
  emojiCount: number;
  translation: {
    locale: string;
    name: string | null;
    description: string | null;
    seoTitle: string | null;
    seoDescription: string | null;
  } | null;
}

// ─── Topic ─────────────────────────────────────────────

export interface TopicItem {
  id: string;
  slug: string;
  coverImage: string | null;
  topicType: string | null;
  publishedAt: string | null;
  translation: {
    locale: string;
    title: string | null;
    summary: string | null;
    seoTitle: string | null;
    seoDescription: string | null;
  } | null;
}

// ─── Search ────────────────────────────────────────────

export interface SearchResultItem extends EmojiBase {
  category: {
    id: string;
    slug: string;
    name: string | null;
  } | null;
  translation: {
    name: string | null;
    shortName: string | null;
    oneLineMeaning: string | null;
    keywords: string[] | null;
  } | null;
}

// ─── Re-exports ────────────────────────────────────────

export type { Locale, PaginationMeta };
