# Emoji Platform Project Handoff

## Current Phase

Phase 4C-2 completed.

## Project Goal

Build a long-term maintainable global Emoji dictionary, copy, meaning, search, topic, CMS, and multilingual SEO platform.

## Planned Architecture

- pnpm monorepo
- apps/web: Next.js + TypeScript + Tailwind CSS
- apps/admin: Next.js + TypeScript + Tailwind CSS
- apps/api: NestJS + TypeScript
- PostgreSQL + Prisma
- Redis
- Meilisearch
- Docker Compose
- Long-term CMS and SEO content management

## Important Rules

- Do not rebuild this as a pure static Node.js site.
- Do not generate thousands of static HTML pages as the main architecture.
- Do not remove or bypass the planned apps/web, apps/admin, apps/api architecture.
- Do not bypass Prisma/PostgreSQL.
- Do not copy competitor code, UI, text, database, or image assets.
- Do not develop multiple phases at once.
- Do not perform large deletion or refactoring without confirmation.
- Always check git status before making changes.
- Always update this handoff document after each phase.
- Always commit and push after each completed phase.

## Completed Phases

- Phase 0: Project governance and repository initialization
- Phase 1: Monorepo base architecture
- Phase 2: Database and Prisma
- Phase 3A: Public Read-only API
- Phase 3B: Frontend basic pages
- Phase 3C: Emoji detail and SEO (post-acceptance fix: server-side `<html lang>` per locale; `pnpm typecheck` works on clean checkout)
- Phase 3D: Search and Copy Experience (SearchBox enhancements, search page UX, CopyButton/CopyValueButton/CopyArea copy-event tracking, EmptyState/ErrorState polish, mobile optimization, dynamic search metadata)
- Phase 4A: Admin auth and access control (admin login API, bcrypt passwordHash verification, JWT + httpOnly cookie `admin_token`, admin auth guard protecting `/admin/auth/me` and `/admin/health`, protected admin routes with redirect to `/admin/login`, logout, role read, admin noindex)
- Phase 4B: Admin dashboard and emoji management (admin dashboard API + UI with stats/recent emojis, emoji admin list with search/filter/pagination, emoji create/edit pages, emoji status switching, zh/en translation editing, SEO/examples/keywords/faqJson editing, category options API, emoji write operations recording audit_logs, role-based write permission `canManageEmoji`)
- Phase 4C-1: Category management (admin category list/create/edit pages, category admin APIs: list/detail/create/update/status/tree, zh/en translation editing, parent selection with cycle prevention, status switching, SEO title/description editing, category write operations recording audit_logs, role-based write permission `canManageCategory`)
- Phase 4C-2: Topic management (admin topic list/create/edit pages, topic admin APIs: list/detail/create/update/status, zh/en translation editing for title/summary/content/seoTitle/seoDescription/faqJson, status switching, Topic↔Emoji association management via `PUT /admin/topics/:id/emojis` (bind/unbind/reorder), emoji-options endpoint for the binding selector, topic write operations recording audit_logs, role-based write permission `canManageTopic`)

## Next Phase

Phase 4C-3 - Article Management
