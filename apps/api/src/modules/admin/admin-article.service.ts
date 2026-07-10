/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { AdminJwtPayload } from './admin-auth.guard';
import { AdminArticleListQuery } from './dto/admin-article-query.dto';
import {
  AdminArticleCreateInput,
  AdminArticleUpdateInput,
  ArticleStatusValue,
  ArticleTranslationInput,
} from './dto/admin-article-body.dto';
import { buildPaginationMeta } from '@emoji-platform/types';

const SITE_URL =
  process.env.SITE_URL || process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

export interface AuthorSummary {
  id: string | null;
  name: string | null;
  email: string | null;
}

export interface ArticleTranslationDetail {
  title: string | null;
  summary: string | null;
  content: string | null;
  seoTitle: string | null;
  seoDescription: string | null;
  keywords: unknown;
}

export interface ArticleDetail {
  id: string;
  slug: string;
  coverImage: string | null;
  authorId: string | null;
  author: AuthorSummary;
  status: string;
  publishedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  translations: { zh: ArticleTranslationDetail | null; en: ArticleTranslationDetail | null };
  previewLinks: { zh: string; en: string };
}

@Injectable()
export class AdminArticleService {
  private readonly logger = new Logger(AdminArticleService.name);

  constructor(private readonly prisma: PrismaService) {}

  // ─── List ──────────────────────────────────────────────

  async list(query: AdminArticleListQuery) {
    const { page, limit, q, status } = query;

    const where: Record<string, unknown> = {};
    if (status) {
      where.status = status;
    }
    if (q) {
      where.OR = [
        { slug: { contains: q, mode: 'insensitive' } },
        {
          translations: {
            some: { title: { contains: q, mode: 'insensitive' } },
          },
        },
      ];
    }

    const [articles, total] = await Promise.all([
      this.prisma.article.findMany({
        where: where as any,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: [{ publishedAt: 'desc' }, { updatedAt: 'desc' }, { id: 'asc' }],
        include: {
          translations: true,
        },
      }),
      this.prisma.article.count({ where: where as any }),
    ]);

    // Batch-load author summaries to avoid N+1 per row.
    const authorIds = Array.from(
      new Set((articles as any[]).map((a) => a.authorId).filter(Boolean) as string[]),
    );
    const authors = new Map<string, AuthorSummary>();
    if (authorIds.length > 0) {
      const found = await this.prisma.adminUser.findMany({
        where: { id: { in: authorIds } },
        select: { id: true, name: true, email: true },
      });
      for (const u of found) {
        authors.set(u.id, { id: u.id, name: u.name ?? null, email: u.email });
      }
    }

    const data = (articles as any[]).map((article: any) =>
      this.formatListItem(article, authors.get(article.authorId) ?? null),
    );

    return {
      data,
      meta: buildPaginationMeta(page, limit, total),
    };
  }

  private formatListItem(article: any, author: AuthorSummary | null) {
    const zh = article.translations?.find((t: any) => t.locale === 'zh');
    const en = article.translations?.find((t: any) => t.locale === 'en');

    return {
      id: article.id,
      slug: article.slug,
      coverImage: article.coverImage,
      status: article.status,
      publishedAt: article.publishedAt,
      author: author ?? { id: article.authorId ?? null, name: null, email: null },
      translations: {
        zh: { title: zh?.title ?? null, complete: !!zh?.title },
        en: { title: en?.title ?? null, complete: !!en?.title },
      },
      updatedAt: article.updatedAt,
      previewLinks: this.previewLinks(article.slug),
    };
  }

  // ─── Detail ────────────────────────────────────────────

  async getById(id: string): Promise<{ data: ArticleDetail }> {
    const article = await this.prisma.article.findUnique({
      where: { id },
      include: {
        translations: true,
      },
    });
    if (!article) {
      throw new NotFoundException(`Article with id "${id}" not found`);
    }
    return { data: await this.formatDetail(article as any) };
  }

  private async formatDetail(article: any): Promise<ArticleDetail> {
    const author: AuthorSummary =
      article.authorId != null
        ? ((await this.prisma.adminUser.findUnique({
            where: { id: article.authorId },
            select: { id: true, name: true, email: true },
          })) as AuthorSummary) ?? { id: article.authorId, name: null, email: null }
        : { id: null, name: null, email: null };

    const formatTranslation = (locale: string): ArticleTranslationDetail | null => {
      const t = article.translations?.find((x: any) => x.locale === locale);
      if (!t) return null;
      return {
        title: t.title,
        summary: t.summary,
        content: t.content,
        seoTitle: t.seoTitle,
        seoDescription: t.seoDescription,
        keywords: t.keywords,
      };
    };

    return {
      id: article.id,
      slug: article.slug,
      coverImage: article.coverImage,
      authorId: article.authorId,
      author,
      status: article.status,
      publishedAt: article.publishedAt,
      createdAt: article.createdAt,
      updatedAt: article.updatedAt,
      translations: {
        zh: formatTranslation('zh'),
        en: formatTranslation('en'),
      },
      previewLinks: this.previewLinks(article.slug),
    };
  }

  // ─── Create ────────────────────────────────────────────

  async create(input: AdminArticleCreateInput, admin: AdminJwtPayload) {
    const existing = await this.prisma.article.findUnique({ where: { slug: input.slug } });
    if (existing) {
      throw new BadRequestException(`slug "${input.slug}" 已存在`);
    }

    // When publishing without an explicit publishedAt, set it to now.
    const publishedAt =
      input.status === 'published' && !input.publishedAt ? new Date() : (input.publishedAt ?? null);

    const created = await this.prisma.$transaction(async (tx: any) => {
      const article = await tx.article.create({
        data: {
          slug: input.slug,
          coverImage: input.coverImage ?? null,
          authorId: input.authorId ?? null,
          status: input.status,
          publishedAt,
        },
      });
      await tx.articleTranslation.create({
        data: this.translationCreateData(article.id, 'zh', input.translations.zh),
      });
      await tx.articleTranslation.create({
        data: this.translationCreateData(article.id, 'en', input.translations.en),
      });
      return article;
    });

    const full = await this.formatDetail(
      (await this.prisma.article.findUnique({
        where: { id: created.id },
        include: { translations: true },
      })) as any,
    );

    await this.recordAudit({
      adminUserId: admin.sub,
      action: 'article.create',
      entityType: 'article',
      entityId: created.id,
      newData: this.snapshot(full),
    });

    return { data: full };
  }

  // ─── Update ────────────────────────────────────────────

  async update(id: string, input: AdminArticleUpdateInput, admin: AdminJwtPayload) {
    const existing = await this.prisma.article.findUnique({
      where: { id },
      include: { translations: true },
    });
    if (!existing) {
      throw new NotFoundException(`Article with id "${id}" not found`);
    }

    if (input.slug && input.slug !== existing.slug) {
      const slugConflict = await this.prisma.article.findUnique({ where: { slug: input.slug } });
      if (slugConflict) {
        throw new BadRequestException(`slug "${input.slug}" 已存在`);
      }
    }

    const oldSnapshot = await this.snapshotFromId(id);

    // Determine publishedAt: explicit value wins; if publishing and none set yet, set now.
    let publishedAt: Date | null | undefined;
    if (input.publishedAt !== undefined) {
      publishedAt = input.publishedAt;
    } else if (input.status === 'published' && !existing.publishedAt) {
      publishedAt = new Date();
    }

    await this.prisma.$transaction(async (tx: any) => {
      const data: Record<string, unknown> = {};
      if (input.slug !== undefined) data.slug = input.slug;
      if (input.coverImage !== undefined) data.coverImage = input.coverImage ?? null;
      if (input.authorId !== undefined) data.authorId = input.authorId ?? null;
      if (input.status !== undefined) data.status = input.status;
      if (publishedAt !== undefined) data.publishedAt = publishedAt;

      if (Object.keys(data).length > 0) {
        await tx.article.update({ where: { id }, data });
      }

      if (input.translations?.zh) {
        await this.upsertTranslation(tx, id, 'zh', input.translations.zh);
      }
      if (input.translations?.en) {
        await this.upsertTranslation(tx, id, 'en', input.translations.en);
      }
    });

    const full = await this.formatDetail(await this.prisma.article.findUnique({
      where: { id },
      include: { translations: true },
    }) as any);

    await this.recordAudit({
      adminUserId: admin.sub,
      action: 'article.update',
      entityType: 'article',
      entityId: id,
      oldData: oldSnapshot,
      newData: this.snapshot(full),
    });

    return { data: full };
  }

  // ─── Status ────────────────────────────────────────────

  async setStatus(id: string, status: ArticleStatusValue, admin: AdminJwtPayload) {
    const existing = await this.prisma.article.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException(`Article with id "${id}" not found`);
    }
    if (existing.status === status) {
      return { data: { id, status } };
    }

    const oldStatus = existing.status;
    const data: Record<string, unknown> = { status };
    // When transitioning into published and no date is set, stamp it now.
    if (status === 'published' && !existing.publishedAt) {
      data.publishedAt = new Date();
    }

    await this.prisma.article.update({ where: { id }, data });

    await this.recordAudit({
      adminUserId: admin.sub,
      action: 'article.status_update',
      entityType: 'article',
      entityId: id,
      oldData: { status: oldStatus },
      newData: { status },
    });

    return { data: { id, status } };
  }

  // ─── Helpers ──────────────────────────────────────────

  private translationCreateData(
    articleId: string,
    locale: 'zh' | 'en',
    t: ArticleTranslationInput,
  ) {
    return {
      articleId,
      locale,
      title: t.title,
      summary: t.summary ?? null,
      content: t.content ?? null,
      seoTitle: t.seoTitle ?? null,
      seoDescription: t.seoDescription ?? null,
      keywords: (t.keywords ?? []) as any,
    };
  }

  private async upsertTranslation(
    tx: any,
    articleId: string,
    locale: 'zh' | 'en',
    t: Partial<ArticleTranslationInput>,
  ) {
    const data: Record<string, unknown> = {};
    if (t.title !== undefined) data.title = t.title;
    if (t.summary !== undefined) data.summary = t.summary ?? null;
    if (t.content !== undefined) data.content = t.content ?? null;
    if (t.seoTitle !== undefined) data.seoTitle = t.seoTitle ?? null;
    if (t.seoDescription !== undefined) data.seoDescription = t.seoDescription ?? null;
    if (t.keywords !== undefined) data.keywords = (t.keywords ?? []) as any;

    await tx.articleTranslation.upsert({
      where: { articleId_locale: { articleId, locale } },
      create: {
        articleId,
        locale,
        title: (t.title as string) ?? '',
        ...data,
      },
      update: data,
    });
  }

  private async snapshotFromId(id: string): Promise<Record<string, unknown>> {
    const article = await this.prisma.article.findUnique({
      where: { id },
      include: { translations: true },
    });
    if (!article) return {};
    return this.snapshot(await this.formatDetail(article as any));
  }

  private snapshot(article: ArticleDetail): Record<string, unknown> {
    const pickTranslation = (locale: string) => {
      const t = (article.translations as any)[locale];
      if (!t) return null;
      return {
        title: t.title,
        summary: t.summary,
        content: t.content,
        seoTitle: t.seoTitle,
        seoDescription: t.seoDescription,
        keywords: t.keywords,
      };
    };

    return {
      slug: article.slug,
      coverImage: article.coverImage,
      authorId: article.authorId,
      status: article.status,
      publishedAt: article.publishedAt,
      translations: {
        zh: pickTranslation('zh'),
        en: pickTranslation('en'),
      },
    };
  }

  private previewLinks(slug: string): { zh: string; en: string } {
    // Front-end article pages are not implemented in this phase (Phase 4C-3 only
    // covers admin management). Links point to the intended future routes.
    return {
      zh: `${SITE_URL}/zh/articles/${slug}/`,
      en: `${SITE_URL}/en/articles/${slug}/`,
    };
  }

  private async recordAudit(params: {
    adminUserId: string;
    action: string;
    entityType: string;
    entityId: string;
    oldData?: unknown;
    newData?: unknown;
    ipAddress?: string | null;
  }): Promise<void> {
    try {
      await this.prisma.auditLog.create({
        data: {
          adminUserId: params.adminUserId,
          action: params.action,
          entityType: params.entityType,
          entityId: params.entityId,
          oldData: (params.oldData ?? undefined) as any,
          newData: (params.newData ?? undefined) as any,
          ipAddress: params.ipAddress ?? null,
        },
      });
    } catch (error) {
      // Audit-log write failure must not silently pass — record server-side.
      // The main operation still succeeds (consistent with Phase 4B/4C-1/4C-2).
      this.logger.error(
        `audit log write failed for ${params.action} ${params.entityType}:${params.entityId}`,
        error instanceof Error ? error.stack : String(error),
      );
    }
  }
}
