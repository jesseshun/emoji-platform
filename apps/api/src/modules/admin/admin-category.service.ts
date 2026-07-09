/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { AdminJwtPayload } from './admin-auth.guard';
import { AdminCategoryListQuery } from './dto/admin-category-query.dto';
import {
  AdminCategoryCreateInput,
  AdminCategoryUpdateInput,
  CategoryStatusValue,
  CategoryTranslationInput,
} from './dto/admin-category-body.dto';
import { buildPaginationMeta, isLocale } from '@emoji-platform/types';

const SITE_URL = process.env.SITE_URL || process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

function previewLinks(slug: string): { zh: string; en: string } {
  return {
    zh: `${SITE_URL}/zh/categories/${slug}/`,
    en: `${SITE_URL}/en/categories/${slug}/`,
  };
}

export interface CategoryDetail {
  id: string;
  slug: string;
  iconEmoji: string | null;
  parentId: string | null;
  sortOrder: number;
  status: string;
  createdAt: Date;
  updatedAt: Date;
  parent: { id: string; slug: string; iconEmoji: string | null; name: string | null } | null;
  children: { id: string; slug: string; name: string | null }[];
  translations: { zh: CategoryTranslationDetail | null; en: CategoryTranslationDetail | null };
  previewLinks: { zh: string; en: string };
}

export interface CategoryTranslationDetail {
  name: string | null;
  description: string | null;
  seoTitle: string | null;
  seoDescription: string | null;
}

@Injectable()
export class AdminCategoryService {
  private readonly logger = new Logger(AdminCategoryService.name);

  constructor(private readonly prisma: PrismaService) {}

  // ─── List ──────────────────────────────────────────────

  async list(query: AdminCategoryListQuery) {
    const { page, limit, q, status, parentId } = query;

    const where: Record<string, unknown> = {};
    if (status) {
      where.status = status;
    }
    if (parentId !== undefined) {
      where.parentId = parentId;
    }
    if (q) {
      where.OR = [
        { slug: { contains: q, mode: 'insensitive' } },
        {
          translations: {
            some: { name: { contains: q, mode: 'insensitive' } },
          },
        },
      ];
    }

    const [categories, total] = await Promise.all([
      this.prisma.category.findMany({
        where: where as any,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: [{ sortOrder: 'asc' }, { id: 'asc' }],
        include: {
          translations: true,
          parent: { include: { translations: true } },
          _count: {
            select: {
              emojis: true,
              subEmojis: true,
            },
          },
        },
      }),
      this.prisma.category.count({ where: where as any }),
    ]);

    const data = categories.map((cat: any) => this.formatListItem(cat));

    return {
      data,
      meta: buildPaginationMeta(page, limit, total),
    };
  }

  private formatListItem(cat: any) {
    const zh = cat.translations?.find((t: any) => t.locale === 'zh');
    const en = cat.translations?.find((t: any) => t.locale === 'en');
    const parentName =
      cat.parent?.translations?.find((t: any) => t.locale === 'zh')?.name ??
      cat.parent?.translations?.find((t: any) => t.locale === 'en')?.name ??
      null;

    return {
      id: cat.id,
      slug: cat.slug,
      iconEmoji: cat.iconEmoji,
      sortOrder: cat.sortOrder,
      status: cat.status,
      parentId: cat.parentId,
      parent: cat.parent
        ? {
            id: cat.parent.id,
            slug: cat.parent.slug,
            iconEmoji: cat.parent.iconEmoji,
            name: parentName,
          }
        : null,
      emojiCount: (cat._count?.emojis ?? 0) + (cat._count?.subEmojis ?? 0),
      translations: {
        zh: { name: zh?.name ?? null, complete: !!zh?.name },
        en: { name: en?.name ?? null, complete: !!en?.name },
      },
      updatedAt: cat.updatedAt,
      previewLinks: previewLinks(cat.slug),
    };
  }

  // ─── Detail ────────────────────────────────────────────

  async getById(id: string): Promise<{ data: CategoryDetail }> {
    const category = await this.prisma.category.findUnique({
      where: { id },
      include: {
        translations: true,
        parent: { include: { translations: true } },
        children: { include: { translations: true } },
      },
    });
    if (!category) {
      throw new NotFoundException(`Category with id "${id}" not found`);
    }
    return { data: this.formatDetail(category as any) };
  }

  private getFullCategory(id: string): Promise<CategoryDetail> {
    return this.getById(id).then((r) => r.data);
  }

  private formatDetail(cat: any): CategoryDetail {
    const formatTranslation = (locale: string): CategoryTranslationDetail | null => {
      const t = cat.translations?.find((x: any) => x.locale === locale);
      if (!t) return null;
      return {
        name: t.name,
        description: t.description,
        seoTitle: t.seoTitle,
        seoDescription: t.seoDescription,
      };
    };

    const parentName =
      cat.parent?.translations?.find((t: any) => t.locale === 'zh')?.name ??
      cat.parent?.translations?.find((t: any) => t.locale === 'en')?.name ??
      null;

    return {
      id: cat.id,
      slug: cat.slug,
      iconEmoji: cat.iconEmoji,
      parentId: cat.parentId,
      sortOrder: cat.sortOrder,
      status: cat.status,
      createdAt: cat.createdAt,
      updatedAt: cat.updatedAt,
      parent: cat.parent
        ? {
            id: cat.parent.id,
            slug: cat.parent.slug,
            iconEmoji: cat.parent.iconEmoji,
            name: parentName,
          }
        : null,
      children: (cat.children ?? []).map((c: any) => {
        const name =
          c.translations?.find((t: any) => t.locale === 'zh')?.name ??
          c.translations?.find((t: any) => t.locale === 'en')?.name ??
          null;
        return { id: c.id, slug: c.slug, name };
      }),
      translations: {
        zh: formatTranslation('zh'),
        en: formatTranslation('en'),
      },
      previewLinks: previewLinks(cat.slug),
    };
  }

  // ─── Create ────────────────────────────────────────────

  async create(input: AdminCategoryCreateInput, admin: AdminJwtPayload) {
    const existing = await this.prisma.category.findUnique({ where: { slug: input.slug } });
    if (existing) {
      throw new BadRequestException(`slug "${input.slug}" 已存在`);
    }

    if (input.parentId) {
      const parent = await this.prisma.category.findUnique({ where: { id: input.parentId } });
      if (!parent) {
        throw new BadRequestException(`parentId "${input.parentId}" 无效`);
      }
    }

    const created = await this.prisma.$transaction(async (tx: any) => {
      const category = await tx.category.create({
        data: {
          slug: input.slug,
          parentId: input.parentId ?? null,
          iconEmoji: input.iconEmoji ?? null,
          sortOrder: input.sortOrder ?? 0,
          status: input.status,
        },
      });
      await tx.categoryTranslation.create({
        data: this.translationCreateData(category.id, 'zh', input.translations.zh),
      });
      await tx.categoryTranslation.create({
        data: this.translationCreateData(category.id, 'en', input.translations.en),
      });
      return category;
    });

    const full = await this.getFullCategory(created.id);

    await this.recordAudit({
      adminUserId: admin.sub,
      action: 'category.create',
      entityType: 'category',
      entityId: created.id,
      newData: this.snapshot(full),
    });

    return { data: full };
  }

  // ─── Update ────────────────────────────────────────────

  async update(id: string, input: AdminCategoryUpdateInput, admin: AdminJwtPayload) {
    const existing = await this.prisma.category.findUnique({
      where: { id },
      include: { translations: true },
    });
    if (!existing) {
      throw new NotFoundException(`Category with id "${id}" not found`);
    }

    if (input.slug && input.slug !== existing.slug) {
      const slugConflict = await this.prisma.category.findUnique({ where: { slug: input.slug } });
      if (slugConflict) {
        throw new BadRequestException(`slug "${input.slug}" 已存在`);
      }
    }

    if (input.parentId !== undefined && input.parentId) {
      const parent = await this.prisma.category.findUnique({ where: { id: input.parentId } });
      if (!parent) {
        throw new BadRequestException(`parentId "${input.parentId}" 无效`);
      }
      if (input.parentId === id) {
        throw new BadRequestException('不能将分类的父级设为自身');
      }
      if (await this.createsCycle(id, input.parentId)) {
        throw new BadRequestException('父级分类会造成循环引用');
      }
    }

    const oldSnapshot = this.snapshot(await this.getFullCategory(id));

    await this.prisma.$transaction(async (tx: any) => {
      const data: Record<string, unknown> = {};
      if (input.slug !== undefined) data.slug = input.slug;
      if (input.parentId !== undefined) data.parentId = input.parentId ?? null;
      if (input.iconEmoji !== undefined) data.iconEmoji = input.iconEmoji ?? null;
      if (input.sortOrder !== undefined) data.sortOrder = input.sortOrder;
      if (input.status !== undefined) data.status = input.status;

      if (Object.keys(data).length > 0) {
        await tx.category.update({ where: { id }, data });
      }

      if (input.translations?.zh) {
        await this.upsertTranslation(tx, id, 'zh', input.translations.zh);
      }
      if (input.translations?.en) {
        await this.upsertTranslation(tx, id, 'en', input.translations.en);
      }
    });

    const full = await this.getFullCategory(id);

    await this.recordAudit({
      adminUserId: admin.sub,
      action: 'category.update',
      entityType: 'category',
      entityId: id,
      oldData: oldSnapshot,
      newData: this.snapshot(full),
    });

    return { data: full };
  }

  // ─── Status ────────────────────────────────────────────

  async setStatus(id: string, status: CategoryStatusValue, admin: AdminJwtPayload) {
    const existing = await this.prisma.category.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException(`Category with id "${id}" not found`);
    }
    if (existing.status === status) {
      return { data: { id, status } };
    }

    const oldStatus = existing.status;
    await this.prisma.category.update({ where: { id }, data: { status } });

    await this.recordAudit({
      adminUserId: admin.sub,
      action: 'category.status_update',
      entityType: 'category',
      entityId: id,
      oldData: { status: oldStatus },
      newData: { status },
    });

    return { data: { id, status } };
  }

  // ─── Tree (parent selector) ────────────────────────────

  async tree(locale: string, exclude?: string) {
    const safeLocale = isLocale(locale) ? locale : 'zh';
    const categories = await this.prisma.category.findMany({
      orderBy: [{ sortOrder: 'asc' }, { id: 'asc' }],
      include: {
        translations: { where: { locale: safeLocale as any } },
      },
    });

    const nodes: any[] = categories.map((c: any) => ({
      id: c.id,
      slug: c.slug,
      iconEmoji: c.iconEmoji,
      status: c.status,
      sortOrder: c.sortOrder,
      name: c.translations[0]?.name ?? null,
      parentId: c.parentId,
      children: [] as any[],
    }));

    const byId = new Map<string, any>();
    nodes.forEach((n) => byId.set(n.id, n));

    const roots: any[] = [];
    nodes.forEach((n) => {
      if (n.parentId && byId.has(n.parentId)) {
        byId.get(n.parentId).children.push(n);
      } else {
        roots.push(n);
      }
    });

    const prune = (list: any[]): any[] =>
      list
        .filter((n) => n.id !== exclude)
        .map((n) => ({ ...n, children: prune(n.children) }));

    return { data: prune(roots) };
  }

  // ─── Category options (for emoji create form) ──────────

  async categoryOptions(locale: string) {
    const safeLocale = isLocale(locale) ? locale : 'zh';
    const categories = await this.prisma.category.findMany({
      orderBy: [{ sortOrder: 'asc' }, { id: 'asc' }],
      include: {
        translations: { where: { locale: safeLocale as any } },
      },
    });

    return {
      data: categories.map((cat: any) => ({
        id: cat.id,
        slug: cat.slug,
        iconEmoji: cat.iconEmoji,
        name: cat.translations[0]?.name ?? null,
      })),
    };
  }

  // ─── Helpers ──────────────────────────────────────────

  /**
   * Walk up the parent chain starting from `newParentId`. Returns true if the
   * chain reaches `currentId` (a cycle) or loops on itself (defensive).
   */
  private async createsCycle(currentId: string, newParentId: string): Promise<boolean> {
    let pid: string | null = newParentId;
    const visited = new Set<string>();
    while (pid) {
      if (pid === currentId) return true;
      if (visited.has(pid)) return true;
      visited.add(pid);
      const row: { parentId: string | null } | null = await this.prisma.category.findUnique({
        where: { id: pid },
        select: { parentId: true },
      });
      pid = row?.parentId ?? null;
    }
    return false;
  }

  private translationCreateData(
    categoryId: string,
    locale: 'zh' | 'en',
    t: CategoryTranslationInput,
  ) {
    return {
      categoryId,
      locale,
      name: t.name,
      description: t.description ?? null,
      seoTitle: t.seoTitle ?? null,
      seoDescription: t.seoDescription ?? null,
    };
  }

  private async upsertTranslation(
    tx: any,
    categoryId: string,
    locale: 'zh' | 'en',
    t: Partial<CategoryTranslationInput>,
  ) {
    const data: Record<string, unknown> = {};
    if (t.name !== undefined) data.name = t.name;
    if (t.description !== undefined) data.description = t.description ?? null;
    if (t.seoTitle !== undefined) data.seoTitle = t.seoTitle ?? null;
    if (t.seoDescription !== undefined) data.seoDescription = t.seoDescription ?? null;

    await tx.categoryTranslation.upsert({
      where: { categoryId_locale: { categoryId, locale } },
      create: {
        categoryId,
        locale,
        name: (t.name as string) ?? '',
        ...data,
      },
      update: data,
    });
  }

  private snapshot(cat: CategoryDetail): Record<string, unknown> {
    const pickTranslation = (locale: string) => {
      const t = (cat.translations as any)[locale];
      if (!t) return null;
      return {
        name: t.name,
        description: t.description,
        seoTitle: t.seoTitle,
        seoDescription: t.seoDescription,
      };
    };

    return {
      slug: cat.slug,
      parentId: cat.parentId,
      iconEmoji: cat.iconEmoji,
      sortOrder: cat.sortOrder,
      status: cat.status,
      translations: {
        zh: pickTranslation('zh'),
        en: pickTranslation('en'),
      },
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
      // Audit-log write failure must not silently pass — at minimum record it
      // server-side. The main operation still succeeds (consistent with Phase 4B).
      this.logger.error(
        `audit log write failed for ${params.action} ${params.entityType}:${params.entityId}`,
        error instanceof Error ? error.stack : String(error),
      );
    }
  }
}
