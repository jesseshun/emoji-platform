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
