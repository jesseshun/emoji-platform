/* eslint-disable @typescript-eslint/no-explicit-any */
import { Injectable, Logger } from '@nestjs/common';
import { type EnqueuedTask } from 'meilisearch';
import { PrismaService } from '../../prisma/prisma.service';
import { loadSearchConfig, SearchConfig } from './search.config';
import { createMeiliClient, isMeiliConfigured } from './meilisearch-client';
import {
  SearchEntityType,
  SearchIndexStatus,
  SearchIndexRebuildResult,
  SearchIndexRebuildEntityResult,
  SearchIndexSettingsResult,
} from './search.types';

/**
 * SearchIndexService (Phase 6B).
 *
 * Owns the Meilisearch index lifecycle: settings, status, and (re)building the
 * documents for published emoji / category / topic / article entities. It never
 * indexes Asset, draft / archived, or admin content. All operations are safe to
 * re-run and never touch the database (read-only source queries only).
 *
 * Failures are surfaced as thrown errors (never swallowed) so the admin API can
 * report a clear status. Missing Meilisearch configuration yields safe,
 * non-crashing status responses.
 */

// ─── Index settings (spec §7) ──────────────────────────
const SEARCHABLE_ATTRIBUTES = [
  'emojiChar',
  'shortcode',
  'title',
  'keywords',
  'aliases',
  'unicodeCodepoint',
  'slug',
  'description',
  'categoryNames',
  'topicTitles',
  'summary',
];

const FILTERABLE_ATTRIBUTES = ['type', 'locale', 'status'];

const SORTABLE_ATTRIBUTES = ['updatedAt', 'publishedAt'];

// Meilisearch default ranking rules (stable, predictable relevance).
const RANKING_RULES = ['words', 'typo', 'proximity', 'attribute', 'sort', 'exactness'];

const DOCUMENT_CHUNK = 1000;
const TASK_TIMEOUT_MS = 30_000;

// Unified document shape. One document per (entity, locale) pair.
export interface SearchDocument {
  documentId: string;
  id: string;
  type: SearchEntityType;
  locale: 'zh' | 'en';
  slug: string;
  title: string;
  description: string;
  keywords: string[];
  status: 'published';
  updatedAt: string;
  publicUrl: string;
  // emoji
  emojiChar?: string;
  unicodeCodepoint?: string | null;
  shortcode?: string | null;
  shortName?: string | null;
  aliases?: string[];
  categoryNames?: string[];
  topicTitles?: string[];
  categoryId?: string | null;
  categorySlug?: string | null;
  categoryName?: string | null;
  // category
  parentId?: string | null;
  parentName?: string | null;
  // topic
  topicType?: string | null;
  emojiCount?: number;
  // article
  summary?: string;
  publishedAt?: string | null;
}

@Injectable()
export class SearchIndexService {
  private readonly logger = new Logger(SearchIndexService.name);
  private readonly config: SearchConfig;
  private client = null as ReturnType<typeof createMeiliClient> | null;

  constructor(private readonly prisma: PrismaService) {
    this.config = loadSearchConfig();
  }

  getIndexName(): string {
    return this.config.meilisearch.indexName;
  }

  isConfigured(): boolean {
    return isMeiliConfigured(this.config.meilisearch);
  }

  private getClient(): ReturnType<typeof createMeiliClient> {
    if (!this.isConfigured()) {
      throw new Error('Meilisearch is not configured (missing host or api key).');
    }
    if (!this.client) {
      this.client = createMeiliClient(this.config.meilisearch);
    }
    return this.client;
  }

  private get index() {
    return this.getClient().index(this.config.meilisearch.indexName);
  }

  /** Ensures the index exists (creating it with the composite primary key). */
  private async ensureIndex(): Promise<void> {
    const client = this.getClient();
    const indexName = this.config.meilisearch.indexName;
    try {
      await client.index(indexName).fetchInfo();
      return;
    } catch {
      // index does not exist yet
    }
    const task = await client.createIndex(indexName, { primaryKey: 'documentId' });
    await this.waitFor(task);
  }

  /** Applies searchable / filterable / sortable / ranking settings to the index. */
  async configureIndexSettings(): Promise<SearchIndexSettingsResult> {
    const indexName = this.config.meilisearch.indexName;
    await this.ensureIndex();
    const task = await this.index.updateSettings({
      searchableAttributes: SEARCHABLE_ATTRIBUTES,
      filterableAttributes: FILTERABLE_ATTRIBUTES,
      sortableAttributes: SORTABLE_ATTRIBUTES,
      rankingRules: RANKING_RULES,
    });
    await this.waitFor(task);

    return {
      indexName,
      applied: true,
      searchableAttributes: SEARCHABLE_ATTRIBUTES,
      filterableAttributes: FILTERABLE_ATTRIBUTES,
      sortableAttributes: SORTABLE_ATTRIBUTES,
      rankingRules: RANKING_RULES,
      finishedAt: new Date().toISOString(),
    };
  }

  /**
   * Waits for a Meilisearch task and throws a clear error if it failed, so
   * rebuild / settings operations never silently swallow indexing failures.
   */
  private async waitFor(task: EnqueuedTask): Promise<void> {
    const result = await this.getClient().waitForTask(task.taskUid, {
      timeOutMs: TASK_TIMEOUT_MS,
    });
    if (result.status === 'failed') {
      const message = result.error?.message ?? 'unknown Meilisearch task failure';
      throw new Error(`Meilisearch task #${result.uid} failed: ${message}`);
    }
  }

  /** Read-only index status. Never throws — returns a safe status on any error. */
  async getIndexStatus(): Promise<SearchIndexStatus> {
    const indexName = this.config.meilisearch.indexName;
    const lastCheckedAt = new Date().toISOString();
    const safe: SearchIndexStatus = {
      indexName,
      exists: false,
      documentCount: 0,
      settingsConfigured: false,
      searchableAttributes: [],
      filterableAttributes: [],
      sortableAttributes: [],
      lastCheckedAt,
    };

    if (!this.isConfigured()) return safe;

    try {
      const client = this.getClient();
      let exists = false;
      try {
        await client.index(indexName).fetchInfo();
        exists = true;
      } catch {
        exists = false;
      }
      if (!exists) return { ...safe, lastCheckedAt };

      const [stats, settings] = await Promise.all([
        client.index(indexName).getStats(),
        client.index(indexName).getSettings(),
      ]);

      return {
        indexName,
        exists: true,
        documentCount: (stats as any).numberOfDocuments ?? 0,
        settingsConfigured:
          Array.isArray((settings as any).searchableAttributes) &&
          (settings as any).searchableAttributes.length > 0,
        searchableAttributes: (settings as any).searchableAttributes ?? [],
        filterableAttributes: (settings as any).filterableAttributes ?? [],
        sortableAttributes: (settings as any).sortableAttributes ?? [],
        lastCheckedAt,
      };
    } catch (err: any) {
      this.logger.warn(`getIndexStatus failed: ${err?.message ?? String(err)}`);
      return { ...safe, lastCheckedAt };
    }
  }

  async indexDocument(doc: SearchDocument): Promise<void> {
    const task = await this.index.addDocuments([this.cleanDoc(doc)], {
      primaryKey: 'documentId',
    });
    await this.waitFor(task);
  }

  async deleteDocument(documentId: string): Promise<void> {
    const task = await this.index.deleteDocument(documentId);
    await this.waitFor(task);
  }

  /** Rebuilds a single entity type (only published content). */
  async rebuildEntity(type: SearchEntityType): Promise<SearchIndexRebuildEntityResult> {
    const docs = await this.buildDocuments(type);
    await this.ensureIndex();

    let indexed = 0;
    for (let i = 0; i < docs.length; i += DOCUMENT_CHUNK) {
      const chunk = docs.slice(i, i + DOCUMENT_CHUNK).map((d) => this.cleanDoc(d));
      const task = await this.index.addDocuments(chunk, { primaryKey: 'documentId' });
      await this.waitFor(task);
      indexed += chunk.length;
    }

    return {
      type,
      indexed,
      skipped: 0,
    };
  }

  /** Rebuilds all four planned entity types. */
  async rebuildAll(): Promise<SearchIndexRebuildResult> {
    const types: SearchEntityType[] = ['emoji', 'category', 'topic', 'article'];
    const startedAt = Date.now();
    const perEntity: SearchIndexRebuildEntityResult[] = [];

    for (const type of types) {
      perEntity.push(await this.rebuildEntity(type));
    }

    const totalIndexed = perEntity.reduce((sum, r) => sum + r.indexed, 0);

    return {
      entityType: 'all',
      provider: 'meilisearch',
      indexName: this.config.meilisearch.indexName,
      totalIndexed,
      perEntity,
      durationMs: Date.now() - startedAt,
      finishedAt: new Date().toISOString(),
    };
  }

  // ─── Document builders (published only) ─────────────

  private async buildDocuments(type: SearchEntityType): Promise<SearchDocument[]> {
    switch (type) {
      case 'emoji':
        return this.buildEmojiDocuments();
      case 'category':
        return this.buildCategoryDocuments();
      case 'topic':
        return this.buildTopicDocuments();
      case 'article':
        return this.buildArticleDocuments();
      default:
        throw new Error(`Unsupported search entity type: ${type}`);
    }
  }

  private async buildEmojiDocuments(): Promise<SearchDocument[]> {
    const emojis = await this.prisma.emoji.findMany({
      where: { status: 'published' },
      include: {
        translations: true,
        category: { include: { translations: true } },
        topicEmojis: { include: { topic: { include: { translations: true } } } },
      },
    });

    const docs: SearchDocument[] = [];
    for (const emoji of emojis) {
      const categoryNames = (emoji.category?.translations ?? [])
        .map((ct) => ct.name)
        .filter((n): n is string => Boolean(n));
      const topicTitles = emoji.topicEmojis
        .flatMap((te) => (te.topic.translations ?? []).map((tt) => tt.title))
        .filter((t): t is string => Boolean(t));

      for (const t of emoji.translations) {
        const categoryT = emoji.category?.translations.find((ct) => ct.locale === t.locale);
        docs.push({
          documentId: `emoji_${t.locale}_${emoji.id}`,
          id: emoji.id,
          type: 'emoji',
          locale: t.locale,
          slug: emoji.slug,
          title: t.name ?? '',
          shortName: t.shortName ?? null,
          description: t.oneLineMeaning ?? '',
          keywords: asStringArray(t.keywords),
          status: 'published',
          updatedAt: emoji.updatedAt.toISOString(),
          publicUrl: `/${t.locale}/emoji/${emoji.slug}`,
          emojiChar: emoji.emojiChar,
          unicodeCodepoint: emoji.unicodeCodepoint ?? null,
          shortcode: emoji.shortcode ?? null,
          aliases: emoji.shortcode ? [emoji.shortcode] : [],
          categoryNames,
          topicTitles,
          categoryId: emoji.categoryId ?? null,
          categorySlug: emoji.category?.slug ?? null,
          categoryName: categoryT?.name ?? null,
        });
      }
    }
    return docs;
  }

  private async buildCategoryDocuments(): Promise<SearchDocument[]> {
    const categories = await this.prisma.category.findMany({
      where: { status: 'published' },
      include: {
        translations: true,
        parent: { include: { translations: true } },
      },
    });

    const docs: SearchDocument[] = [];
    for (const category of categories) {
      for (const t of category.translations) {
        const parentT = category.parent?.translations.find((pt) => pt.locale === t.locale);
        docs.push({
          documentId: `category_${t.locale}_${category.id}`,
          id: category.id,
          type: 'category',
          locale: t.locale,
          slug: category.slug,
          title: t.name ?? '',
          description: t.description ?? '',
          keywords: [],
          status: 'published',
          updatedAt: category.updatedAt.toISOString(),
          publicUrl: `/${t.locale}/categories/${category.slug}`,
          parentId: category.parentId ?? null,
          parentName: parentT?.name ?? null,
        });
      }
    }
    return docs;
  }

  private async buildTopicDocuments(): Promise<SearchDocument[]> {
    const topics = await this.prisma.topic.findMany({
      where: { status: 'published' },
      include: {
        translations: true,
        topicEmojis: true,
      },
    });

    const docs: SearchDocument[] = [];
    for (const topic of topics) {
      for (const t of topic.translations) {
        docs.push({
          documentId: `topic_${t.locale}_${topic.id}`,
          id: topic.id,
          type: 'topic',
          locale: t.locale,
          slug: topic.slug,
          title: t.title ?? '',
          description: t.summary ?? '',
          keywords: [],
          status: 'published',
          updatedAt: topic.updatedAt.toISOString(),
          publicUrl: `/${t.locale}/topics/${topic.slug}`,
          topicType: topic.topicType ?? null,
          emojiCount: topic.topicEmojis.length,
        });
      }
    }
    return docs;
  }

  private async buildArticleDocuments(): Promise<SearchDocument[]> {
    const articles = await this.prisma.article.findMany({
      where: { status: 'published' },
      include: { translations: true },
    });

    const docs: SearchDocument[] = [];
    for (const article of articles) {
      for (const t of article.translations) {
        docs.push({
          documentId: `article_${t.locale}_${article.id}`,
          id: article.id,
          type: 'article',
          locale: t.locale,
          slug: article.slug,
          title: t.title ?? '',
          description: t.summary ?? '',
          keywords: asStringArray(t.keywords),
          status: 'published',
          updatedAt: article.updatedAt.toISOString(),
          publishedAt: article.publishedAt ? article.publishedAt.toISOString() : null,
          publicUrl: `/${t.locale}/articles/${article.slug}`,
          summary: t.summary ?? '',
        });
      }
    }
    return docs;
  }

  /**
   * Removes null / undefined values so Meilisearch never stores the literal
   * string "null" or undefined keys. Required keys are always retained.
   */
  private cleanDoc(doc: SearchDocument): Record<string, any> {
    const out: Record<string, any> = {};
    for (const [key, value] of Object.entries(doc)) {
      if (value === null || value === undefined) continue;
      out[key] = value;
    }
    return out;
  }
}

/** Normalizes a JSON column (string[] | string | null) into string[]. */
function asStringArray(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.map((v) => String(v)).filter((v) => v.length > 0);
  }
  if (typeof value === 'string' && value.length > 0) {
    return [value];
  }
  return [];
}
