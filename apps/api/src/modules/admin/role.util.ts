import { ForbiddenException } from '@nestjs/common';

export type AdminRole =
  | 'super_admin'
  | 'editor'
  | 'seo_manager'
  | 'translator'
  | 'reviewer'
  | 'analyst';

// Write operations on Emoji (create / update / status change) are limited to
// these roles for Phase 4B. Other roles receive 403.
const EMOJI_WRITE_ROLES: AdminRole[] = ['super_admin', 'editor'];

// Read operations (list / detail / dashboard / category options) are visible to
// all known admin roles for Phase 4B.
const EMOJI_READ_ROLES: AdminRole[] = [
  'super_admin',
  'editor',
  'seo_manager',
  'translator',
  'reviewer',
  'analyst',
];

export function canManageEmoji(role: string | undefined | null): boolean {
  if (!role) return false;
  return EMOJI_WRITE_ROLES.includes(role as AdminRole);
}

export function canViewEmoji(role: string | undefined | null): boolean {
  if (!role) return false;
  return EMOJI_READ_ROLES.includes(role as AdminRole);
}

export function assertCanManageEmoji(role: string | undefined | null): void {
  if (!canManageEmoji(role)) {
    throw new ForbiddenException('当前角色无权执行该写操作（需要 super_admin 或 editor）');
  }
}

export function assertCanViewEmoji(role: string | undefined | null): void {
  if (!canViewEmoji(role)) {
    throw new ForbiddenException('当前角色无权访问该资源');
  }
}

// Category management (Phase 4C-1). Write = super_admin + editor (same as Emoji);
// read = all known admin roles. Kept as a separate, clearly named checker rather
// than reusing the emoji helpers, so role intent stays explicit.
const CATEGORY_WRITE_ROLES: AdminRole[] = ['super_admin', 'editor'];

const CATEGORY_READ_ROLES: AdminRole[] = [
  'super_admin',
  'editor',
  'seo_manager',
  'translator',
  'reviewer',
  'analyst',
];

export function canManageCategory(role: string | undefined | null): boolean {
  if (!role) return false;
  return CATEGORY_WRITE_ROLES.includes(role as AdminRole);
}

export function canViewCategory(role: string | undefined | null): boolean {
  if (!role) return false;
  return CATEGORY_READ_ROLES.includes(role as AdminRole);
}

export function assertCanManageCategory(role: string | undefined | null): void {
  if (!canManageCategory(role)) {
    throw new ForbiddenException('当前角色无权执行该写操作（需要 super_admin 或 editor）');
  }
}

export function assertCanViewCategory(role: string | undefined | null): void {
  if (!canViewCategory(role)) {
    throw new ForbiddenException('当前角色无权访问该资源');
  }
}

// Topic management (Phase 4C-2). Write = super_admin + editor (same as Category
// and Emoji); read = all known admin roles. Kept as a separate, clearly named
// checker so role intent stays explicit and independent of the category helper.
const TOPIC_WRITE_ROLES: AdminRole[] = ['super_admin', 'editor'];

const TOPIC_READ_ROLES: AdminRole[] = [
  'super_admin',
  'editor',
  'seo_manager',
  'translator',
  'reviewer',
  'analyst',
];

export function canManageTopic(role: string | undefined | null): boolean {
  if (!role) return false;
  return TOPIC_WRITE_ROLES.includes(role as AdminRole);
}

export function canViewTopic(role: string | undefined | null): boolean {
  if (!role) return false;
  return TOPIC_READ_ROLES.includes(role as AdminRole);
}

export function assertCanManageTopic(role: string | undefined | null): void {
  if (!canManageTopic(role)) {
    throw new ForbiddenException('当前角色无权执行该写操作（需要 super_admin 或 editor）');
  }
}

export function assertCanViewTopic(role: string | undefined | null): void {
  if (!canViewTopic(role)) {
    throw new ForbiddenException('当前角色无权访问该资源');
  }
}

// Article management (Phase 4C-3). Write = super_admin + editor (same as the
// other CMS entities); read = all known admin roles. Kept as a separate, clearly
// named checker so role intent stays explicit and independent of other helpers.
const ARTICLE_WRITE_ROLES: AdminRole[] = ['super_admin', 'editor'];

const ARTICLE_READ_ROLES: AdminRole[] = [
  'super_admin',
  'editor',
  'seo_manager',
  'translator',
  'reviewer',
  'analyst',
];

export function canManageArticle(role: string | undefined | null): boolean {
  if (!role) return false;
  return ARTICLE_WRITE_ROLES.includes(role as AdminRole);
}

export function canViewArticle(role: string | undefined | null): boolean {
  if (!role) return false;
  return ARTICLE_READ_ROLES.includes(role as AdminRole);
}

export function assertCanManageArticle(role: string | undefined | null): void {
  if (!canManageArticle(role)) {
    throw new ForbiddenException('当前角色无权执行该写操作（需要 super_admin 或 editor）');
  }
}

export function assertCanViewArticle(role: string | undefined | null): void {
  if (!canViewArticle(role)) {
    throw new ForbiddenException('当前角色无权访问该资源');
  }
}

// Asset / license management (Phase 4D-1). Write = super_admin + editor (same as
// the other CMS entities); read = all known admin roles. Kept as a separate, clearly
// named checker so role intent stays explicit and independent of other helpers.
const ASSET_WRITE_ROLES: AdminRole[] = ['super_admin', 'editor'];

const ASSET_READ_ROLES: AdminRole[] = [
  'super_admin',
  'editor',
  'seo_manager',
  'translator',
  'reviewer',
  'analyst',
];

export function canManageAsset(role: string | undefined | null): boolean {
  if (!role) return false;
  return ASSET_WRITE_ROLES.includes(role as AdminRole);
}

export function canViewAsset(role: string | undefined | null): boolean {
  if (!role) return false;
  return ASSET_READ_ROLES.includes(role as AdminRole);
}

export function assertCanManageAsset(role: string | undefined | null): void {
  if (!canManageAsset(role)) {
    throw new ForbiddenException('当前角色无权执行该写操作（需要 super_admin 或 editor）');
  }
}

export function assertCanViewAsset(role: string | undefined | null): void {
  if (!canViewAsset(role)) {
    throw new ForbiddenException('当前角色无权访问该资源');
  }
}

// SEO Management Center (Phase 4D-2). Write = super_admin + editor + seo_manager
// (seo_manager is granted SEO write authority here); read = all known admin roles.
// Kept as a separate, clearly named checker so role intent stays explicit and
// independent of the other CMS helpers.
const SEO_WRITE_ROLES: AdminRole[] = ['super_admin', 'editor', 'seo_manager'];

const SEO_READ_ROLES: AdminRole[] = [
  'super_admin',
  'editor',
  'seo_manager',
  'translator',
  'reviewer',
  'analyst',
];

export function canManageSeo(role: string | undefined | null): boolean {
  if (!role) return false;
  return SEO_WRITE_ROLES.includes(role as AdminRole);
}

export function canViewSeo(role: string | undefined | null): boolean {
  if (!role) return false;
  return SEO_READ_ROLES.includes(role as AdminRole);
}

export function assertCanManageSeo(role: string | undefined | null): void {
  if (!canManageSeo(role)) {
    throw new ForbiddenException(
      '当前角色无权执行该写操作（需要 super_admin、editor 或 seo_manager）',
    );
  }
}

export function assertCanViewSeo(role: string | undefined | null): void {
  if (!canViewSeo(role)) {
    throw new ForbiddenException('当前角色无权访问该资源');
  }
}

// SEO Quality Checker (Phase 5C). Read-only overview + issues list are visible to
// the same operational / content roles as the SEO management center plus reviewer
// and analyst; running an on-demand check (POST) is limited to the roles that
// own SEO write authority (super_admin, editor, seo_manager). Kept as clearly
// named helpers distinct from the management-center helpers.
const SEO_QUALITY_VIEW_ROLES: AdminRole[] = [
  'super_admin',
  'editor',
  'seo_manager',
  'reviewer',
  'analyst',
];

const SEO_QUALITY_RUN_ROLES: AdminRole[] = ['super_admin', 'editor', 'seo_manager'];

export function canViewSeoQuality(role: string | undefined | null): boolean {
  if (!role) return false;
  return SEO_QUALITY_VIEW_ROLES.includes(role as AdminRole);
}

export function canRunSeoQualityCheck(role: string | undefined | null): boolean {
  if (!role) return false;
  return SEO_QUALITY_RUN_ROLES.includes(role as AdminRole);
}

export function assertCanViewSeoQuality(role: string | undefined | null): void {
  if (!canViewSeoQuality(role)) {
    throw new ForbiddenException(
      '当前角色无权访问 SEO 质量检查（需要 super_admin / editor / seo_manager / reviewer / analyst）',
    );
  }
}

export function assertCanRunSeoQualityCheck(role: string | undefined | null): void {
  if (!canRunSeoQualityCheck(role)) {
    throw new ForbiddenException(
      '当前角色无权运行 SEO 检查（需要 super_admin / editor / seo_manager）',
    );
  }
}

// Logs viewing (Phase 4D-3): Search Logs + Copy Events are visible to operational
// and content roles. Read = super_admin, editor, seo_manager, reviewer, analyst.
// translator is intentionally excluded (logs are operational data, not translation
// content). Kept as a clearly named checker distinct from the CMS helpers.
const LOG_VIEW_ROLES: AdminRole[] = [
  'super_admin',
  'editor',
  'seo_manager',
  'reviewer',
  'analyst',
];

export function canViewLogs(role: string | undefined | null): boolean {
  if (!role) return false;
  return LOG_VIEW_ROLES.includes(role as AdminRole);
}

export function assertCanViewLogs(role: string | undefined | null): void {
  if (!canViewLogs(role)) {
    throw new ForbiddenException(
      '当前角色无权访问日志（需要 super_admin / editor / seo_manager / reviewer / analyst）',
    );
  }
}

// Review management (Phase 4D-3): user submissions / reviews status changes are
// limited to super_admin and reviewer. Read (list / detail) follows canViewLogs
// so the same operational roles can inspect submissions.
const REVIEW_WRITE_ROLES: AdminRole[] = ['super_admin', 'reviewer'];

export function canManageReview(role: string | undefined | null): boolean {
  if (!role) return false;
  return REVIEW_WRITE_ROLES.includes(role as AdminRole);
}

export function assertCanManageReview(role: string | undefined | null): void {
  if (!canManageReview(role)) {
    throw new ForbiddenException('当前角色无权审核（需要 super_admin 或 reviewer）');
  }
}

// Search infrastructure & index management (Phase 6B).
//   - Viewing status / infrastructure page: super_admin, editor, seo_manager, analyst.
//   - Rebuilding the index: super_admin, editor.
//   - Applying index settings (schema change): super_admin only.
// Read = super_admin, editor, seo_manager, analyst (operational + content roles).
// Rebuild = super_admin, editor.
// Settings = super_admin only.
const SEARCH_INFRA_VIEW_ROLES: AdminRole[] = [
  'super_admin',
  'editor',
  'seo_manager',
  'analyst',
];

const SEARCH_INDEX_MANAGE_ROLES: AdminRole[] = ['super_admin', 'editor'];

const SEARCH_SETTINGS_MANAGE_ROLES: AdminRole[] = ['super_admin'];

export function canViewSearchInfrastructure(role: string | undefined | null): boolean {
  if (!role) return false;
  return SEARCH_INFRA_VIEW_ROLES.includes(role as AdminRole);
}

export function canManageSearchIndex(role: string | undefined | null): boolean {
  if (!role) return false;
  return SEARCH_INDEX_MANAGE_ROLES.includes(role as AdminRole);
}

export function canManageSearchSettings(role: string | undefined | null): boolean {
  if (!role) return false;
  return SEARCH_SETTINGS_MANAGE_ROLES.includes(role as AdminRole);
}

export function assertCanViewSearchInfrastructure(role: string | undefined | null): void {
  if (!canViewSearchInfrastructure(role)) {
    throw new ForbiddenException(
      '当前角色无权访问搜索基础设施（需要 super_admin / editor / seo_manager / analyst）',
    );
  }
}

export function assertCanManageSearchIndex(role: string | undefined | null): void {
  if (!canManageSearchIndex(role)) {
    throw new ForbiddenException('当前角色无权重建搜索索引（需要 super_admin 或 editor）');
  }
}

export function assertCanManageSearchSettings(role: string | undefined | null): void {
  if (!canManageSearchSettings(role)) {
    throw new ForbiddenException('当前角色无权更新搜索索引设置（需要 super_admin）');
  }
}
