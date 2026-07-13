import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { SearchIndexService } from '../search/search-index.service';
import {
  SearchEntityType,
  SearchIndexStatus,
  SearchIndexRebuildResult,
  SearchIndexRebuildEntityResult,
  SearchIndexSettingsResult,
} from '../search/search.types';

const VALID_ENTITY_TYPES: ('all' | SearchEntityType)[] = [
  'all',
  'emoji',
  'category',
  'topic',
  'article',
];

/**
 * Admin search index management (Phase 6B).
 *
 * Wraps SearchIndexService with role-protected operations and audit logging:
 *   - search.index_rebuild
 *   - search.index_settings_update
 *
 * Audit logs never contain the Meilisearch API key, passwordHash, JWT_SECRET,
 * or a plaintext sensitive IP. The ipAddress field is intentionally left null
 * (consistent with the rest of the audit trail).
 */
@Injectable()
export class AdminSearchIndexService {
  private readonly logger = new Logger(AdminSearchIndexService.name);

  constructor(
    private readonly searchIndexService: SearchIndexService,
    private readonly prisma: PrismaService,
  ) {}

  getIndexStatus(): Promise<SearchIndexStatus> {
    return this.searchIndexService.getIndexStatus();
  }

  parseEntityType(raw: unknown): 'all' | SearchEntityType {
    if (
      typeof raw !== 'string' ||
      !VALID_ENTITY_TYPES.includes(raw as 'all' | SearchEntityType)
    ) {
      throw new BadRequestException(
        `Invalid entityType. Expected one of: ${VALID_ENTITY_TYPES.join(', ')}.`,
      );
    }
    return raw as 'all' | SearchEntityType;
  }

  async rebuild(
    entityType: 'all' | SearchEntityType,
    adminUserId: string,
  ): Promise<SearchIndexRebuildResult> {
    let result: SearchIndexRebuildResult;
    const indexName = this.searchIndexService.getIndexName();

    if (entityType === 'all') {
      result = await this.searchIndexService.rebuildAll();
    } else {
      const single: SearchIndexRebuildEntityResult =
        await this.searchIndexService.rebuildEntity(entityType);
      result = {
        entityType,
        provider: 'meilisearch',
        indexName,
        totalIndexed: single.indexed,
        perEntity: [single],
        durationMs: 0,
        finishedAt: new Date().toISOString(),
      };
    }

    await this.recordAudit({
      adminUserId,
      action: 'search.index_rebuild',
      entityType: 'search',
      entityId: indexName,
      newData: {
        entityType: result.entityType,
        provider: result.provider,
        indexName: result.indexName,
        totalIndexed: result.totalIndexed,
        perEntity: result.perEntity,
      },
    });

    return result;
  }

  async applySettings(
    adminUserId: string,
  ): Promise<SearchIndexSettingsResult> {
    const result = await this.searchIndexService.configureIndexSettings();

    await this.recordAudit({
      adminUserId,
      action: 'search.index_settings_update',
      entityType: 'search',
      entityId: result.indexName,
      newData: {
        indexName: result.indexName,
        searchableAttributes: result.searchableAttributes,
        filterableAttributes: result.filterableAttributes,
        sortableAttributes: result.sortableAttributes,
        rankingRules: result.rankingRules,
      },
    });

    return result;
  }

  private async recordAudit(params: {
    adminUserId: string;
    action: string;
    entityType: string;
    entityId: string;
    newData?: unknown;
  }): Promise<void> {
    try {
      await this.prisma.auditLog.create({
        data: {
          adminUserId: params.adminUserId,
          action: params.action,
          entityType: params.entityType,
          entityId: params.entityId,
          oldData: undefined,
          newData: (params.newData ?? undefined) as Prisma.InputJsonValue | undefined,
          ipAddress: null,
        },
      });
    } catch (error) {
      this.logger.error(
        `audit log write failed for ${params.action} ${params.entityType}:${params.entityId}`,
        error instanceof Error ? error.stack : String(error),
      );
    }
  }
}
