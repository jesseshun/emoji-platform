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

// ─── Emoji Detail ──────────────────────────────────────

export interface EmojiAsset {
  id: string;
  provider: string;
  fileType: string;
  fileUrl: string;
  width: number | null;
  height: number | null;
  licenseName: string | null;
  licenseUrl: string | null;
  attribution: string | null;
}

export interface EmojiDetail {
  id: string;
  emojiChar: string;
  slug: string;
  unicodeCodepoint: string | null;
  htmlDecimal: string | null;
  htmlHex: string | null;
  shortcode: string | null;
  emojiVersion: string | null;
  unicodeVersion: string | null;
  category: {
    id: string;
    slug: string;
    iconEmoji: string | null;
    name: string | null;
  } | null;
  subcategory: {
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
    meaning: string | null;
    usageNotes: string | null;
    formalUsageNotes: string | null;
    informalUsageNotes: string | null;
    socialUsageNotes: string | null;
    examples: unknown | null;
    keywords: string[] | null;
    faqJson: unknown | null;
    seoTitle: string | null;
    seoDescription: string | null;
  } | null;
  assets: EmojiAsset[];
  relatedEmojis: RelatedEmoji[];
  relatedTopics: RelatedTopic[];
}

export interface RelatedEmoji {
  id: string;
  emojiChar: string;
  slug: string;
  shortcode: string | null;
  translation: {
    locale: string;
    name: string | null;
    shortName: string | null;
    oneLineMeaning: string | null;
  } | null;
}

export interface RelatedTopic {
  id: string;
  slug: string;
  topicType: string | null;
  coverImage: string | null;
  translation: {
    locale: string;
    title: string | null;
    summary: string | null;
  } | null;
}

// ─── Category Detail ───────────────────────────────────

export interface CategoryDetailData {
  category: {
    id: string;
    slug: string;
    iconEmoji: string | null;
    parentId: string | null;
    sortOrder: number;
    translation: {
      locale: string;
      name: string | null;
      description: string | null;
      seoTitle: string | null;
      seoDescription: string | null;
    } | null;
  };
  emojis: CategoryEmoji[];
  relatedTopics: RelatedTopic[];
}

export interface CategoryEmoji {
  id: string;
  emojiChar: string;
  slug: string;
  unicodeCodepoint: string | null;
  shortcode: string | null;
  translation: {
    locale: string;
    name: string | null;
    shortName: string | null;
    oneLineMeaning: string | null;
  } | null;
}

// ─── Topic Detail ──────────────────────────────────────

export interface TopicDetailData {
  topic: {
    id: string;
    slug: string;
    coverImage: string | null;
    topicType: string | null;
    publishedAt: string | null;
    translation: {
      locale: string;
      title: string | null;
      summary: string | null;
      content: string | null;
      seoTitle: string | null;
      seoDescription: string | null;
      faqJson: unknown | null;
    } | null;
  };
  emojis: TopicBoundEmoji[];
  relatedTopics: RelatedTopic[];
}

export interface TopicBoundEmoji {
  id: string;
  emojiChar: string;
  slug: string;
  unicodeCodepoint: string | null;
  shortcode: string | null;
  category: {
    id: string;
    slug: string;
    name: string | null;
  } | null;
  translation: {
    locale: string;
    name: string | null;
    shortName: string | null;
    oneLineMeaning: string | null;
  } | null;
}

// ─── Re-exports ────────────────────────────────────────

export type { Locale, PaginationMeta };
