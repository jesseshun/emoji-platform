/* eslint-disable @typescript-eslint/no-explicit-any */
import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { buildPaginationMeta } from '@emoji-platform/types';
import { SearchLogsQuery, CopyEventsQuery } from './dto/admin-logs-query.dto';

// Phase 4D-3: Search Logs + Copy Events read services.
//
// Sensitive-data rules:
// - SearchLog / CopyEvent models never store a plaintext IP; they store `ipHash`
//   (currently null from the public event endpoints) and a coarse `country`.
// - We never select admin-sensitive fields (e.g. AuditLog.ipAddress) here.
// - Output intentionally exposes only ipHash (not reconstructable to an IP) and
//   coarse country. No passwordHash or raw IP is ever returned.

interface DateRange {
  gte?: Date;
  lte?: Date;
}

function buildDateRange(dateFrom?: string, dateTo?: string): DateRange {
  const range: DateRange = {};
  if (dateFrom) {
    range.gte = new Date(dateFrom);
  }
  if (dateTo) {
    // Include the whole end day if only a date (no time) is provided.
    const end = new Date(dateTo);
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateTo)) {
      end.setUTCHours(23, 59, 59, 999);
    }
    range.lte = end;
  }
  return range;
}

function startOfToday(): Date {
  const now = new Date();
  now.setUTCHours(0, 0, 0, 0);
  return now;
}

@Injectable()
export class AdminLogsService {
  private readonly logger = new Logger(AdminLogsService.name);

  constructor(private readonly prisma: PrismaService) {}

  // ─── Search Logs ─────────────────────────────────────

  async listSearchLogs(query: SearchLogsQuery) {
    const where: any = {};
    if (query.locale !== 'all') where.locale = query.locale;
    if (query.q) {
      where.query = { contains: query.q, mode: 'insensitive' };
    }
    const dateRange = buildDateRange(query.dateFrom, query.dateTo);
    if (dateRange.gte || dateRange.lte) where.createdAt = dateRange;
    if (query.minResultCount !== undefined || query.maxResultCount !== undefined) {
      where.resultCount = {};
      if (query.minResultCount !== undefined) where.resultCount.gte = query.minResultCount;
      if (query.maxResultCount !== undefined) where.resultCount.lte = query.maxResultCount;
    }

    const [rows, total] = await Promise.all([
      this.prisma.searchLog.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (query.page - 1) * query.limit,
        take: query.limit,
      }),
      this.prisma.searchLog.count({ where }),
    ]);

    const data = rows.map((row: any) => this.formatSearchLog(row));
    return { data, meta: buildPaginationMeta(query.page, query.limit, total) };
  }

  private formatSearchLog(row: any) {
    return {
      id: row.id,
      query: row.query ?? null,
      locale: row.locale ?? null,
      country: row.country ?? null,
      resultCount: row.resultCount ?? null,
      userAgent: row.userAgent ?? null,
      // Only the non-reversible hash is returned; never a plaintext IP.
      ipHash: row.ipHash ?? null,
      createdAt: row.createdAt,
    };
  }

  async searchLogsSummary() {
    const totalSearches = await this.prisma.searchLog.count();
    const todaySearches = await this.prisma.searchLog.count({
      where: { createdAt: { gte: startOfToday() } },
    });
    const zeroResultSearches = await this.prisma.searchLog.count({
      where: { resultCount: 0 },
    });

    const byLocale = await this.prisma.searchLog.groupBy({
      by: ['locale'],
      _count: { _all: true },
    });
    const searchesByLocale: Record<string, number> = { zh: 0, en: 0, other: 0 };
    for (const g of byLocale) {
      const key = g.locale === 'zh' || g.locale === 'en' ? g.locale : 'other';
      searchesByLocale[key] = g._count._all;
    }

    const topRaw = await this.prisma.searchLog.groupBy({
      by: ['query'],
      where: { query: { not: null } },
      _count: { _all: true },
      orderBy: { _count: { query: 'desc' } },
      take: 10,
    });
    const topQueries = topRaw
      .filter((t: any) => t.query)
      .map((t: any) => ({ query: t.query, count: t._count._all }));

    return {
      totalSearches,
      todaySearches,
      zeroResultSearches,
      topQueries,
      searchesByLocale,
    };
  }

  // ─── Copy Events ─────────────────────────────────────

  async listCopyEvents(query: CopyEventsQuery) {
    const where: any = {};
    if (query.locale !== 'all') where.locale = query.locale;
    if (query.emojiId) where.emojiId = query.emojiId;
    const dateRange = buildDateRange(query.dateFrom, query.dateTo);
    if (dateRange.gte || dateRange.lte) where.createdAt = dateRange;

    const [rows, total] = await Promise.all([
      this.prisma.copyEvent.findMany({
        where,
        include: { emoji: { select: { emojiChar: true, slug: true } } },
        orderBy: { createdAt: 'desc' },
        skip: (query.page - 1) * query.limit,
        take: query.limit,
      }),
      this.prisma.copyEvent.count({ where }),
    ]);

    const data = rows.map((row: any) => this.formatCopyEvent(row));
    return { data, meta: buildPaginationMeta(query.page, query.limit, total) };
  }

  private formatCopyEvent(row: any) {
    return {
      id: row.id,
      emojiId: row.emojiId ?? null,
      emojiChar: row.emoji?.emojiChar ?? null,
      emojiSlug: row.emoji?.slug ?? null,
      locale: row.locale ?? null,
      country: row.country ?? null,
      pageUrl: row.pageUrl ?? null,
      userAgent: row.userAgent ?? null,
      ipHash: row.ipHash ?? null,
      createdAt: row.createdAt,
    };
  }

  async copyEventsSummary() {
    const totalCopies = await this.prisma.copyEvent.count();
    const todayCopies = await this.prisma.copyEvent.count({
      where: { createdAt: { gte: startOfToday() } },
    });

    const byLocale = await this.prisma.copyEvent.groupBy({
      by: ['locale'],
      _count: { _all: true },
    });
    const copiesByLocale: Record<string, number> = { zh: 0, en: 0, other: 0 };
    for (const g of byLocale) {
      const key = g.locale === 'zh' || g.locale === 'en' ? g.locale : 'other';
      copiesByLocale[key] = g._count._all;
    }

    // Top copied emojis (by id) with their char/slug for readability.
    const topRaw = await this.prisma.copyEvent.groupBy({
      by: ['emojiId'],
      where: { emojiId: { not: null } },
      _count: { _all: true },
      orderBy: { _count: { emojiId: 'desc' } },
      take: 10,
    });
    const topIds = topRaw.map((t: any) => t.emojiId).filter(Boolean) as string[];
    const emojiMap = new Map<string, { emojiChar: string; slug: string }>();
    if (topIds.length) {
      const emojis = await this.prisma.emoji.findMany({
        where: { id: { in: topIds } },
        select: { id: true, emojiChar: true, slug: true },
      });
      for (const e of emojis) emojiMap.set(e.id, { emojiChar: e.emojiChar, slug: e.slug });
    }
    const topCopiedEmojis = topRaw
      .filter((t: any) => t.emojiId)
      .map((t: any) => {
        const info = emojiMap.get(t.emojiId) ?? { emojiChar: null, slug: null };
        return {
          emojiId: t.emojiId,
          emojiChar: info.emojiChar,
          emojiSlug: info.slug,
          count: t._count._all,
        };
      });

    return {
      totalCopies,
      todayCopies,
      topCopiedEmojis,
      copiesByLocale,
    };
  }
}
