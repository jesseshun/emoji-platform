# Emoji Platform Project Handoff

## Current Phase

Phase 5A completed.

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
- Phase 4C-3: Article management (admin article list/create/edit pages, article admin APIs: list/detail/create/update/status, zh/en translation editing for title/summary/content/seoTitle/seoDescription/keywords, coverImage/authorId/publishedAt editing, slug uniqueness + format validation, keywords JSON/comma-list parsing, status switching with auto publishedAt on publish, role-based write permission `canManageArticle`, article writes recording audit_logs; front-end article pages not implemented this phase)
- Phase 4D-1: Asset and license management (admin asset list/create/edit pages, asset admin APIs: list/detail/create/update/status/delete, provider/fileType allow-list validation, isDownloadable + license/attribution rules, emoji selector via `GET /api/v1/admin/emojis/options`, role-based write permission `canManageAsset`, asset writes recording audit_logs with no passwordHash leakage; hard delete supported)
- Phase 4D-2: SEO management center (admin SEO overview page `/admin/seo`; SEO entity list pages `/admin/seo/emojis` `/admin/seo/categories` `/admin/seo/topics` `/admin/seo/articles` with pagination/search/locale/status/completeness filters; SEO edit page `/admin/seo/{entityType}/{id}/edit` for emoji/category/topic/article with zh/en `seoTitle`/`seoDescription` editing, canonical/hreflang preview, and audit_logs `seo.update`; SEO admin APIs: `GET /admin/seo/overview`, `GET /admin/seo/entities`, `GET /admin/seo/entities/:entityType/:id`, `PATCH /admin/seo/entities/:entityType/:id`, `GET /admin/seo/robots-status`, `GET /admin/seo/sitemap-status`; reusable translation `seoTitle`/`seoDescription` fields, no new SEO table; SEO write role extended to `seo_manager`; no sitemap generation, no Meilisearch, no AI authoring, no pure-static-site conversion)
- Phase 4D-3: Search logs, copy logs, and review management (admin Search Logs page `/admin/search-logs` with pagination/keyword/locale/date-range/resultCount-range filters and `GET /api/v1/admin/search-logs` + `GET /api/v1/admin/search-logs/summary`; admin Copy Events page `/admin/copy-events` with pagination/locale/emojiId/date-range filters and `GET /api/v1/admin/copy-events` + `GET /api/v1/admin/copy-events/summary`; admin Review Management list `/admin/reviews` and detail `/admin/reviews/[id]` implemented on the existing `user_submissions` model (no placeholder, no new Review table), with `GET /api/v1/admin/reviews`, `GET /api/v1/admin/reviews/:id`, `PATCH /api/v1/admin/reviews/:id/status` writing audit_logs `review.update`; log viewing role `canViewLogs` = super_admin/editor/seo_manager/reviewer/analyst; review write role `canManageReview` = super_admin/reviewer; all log/review APIs guarded by AdminAuthGuard; sensitive data handling returns only non-reversible ipHash and coarse country, never plaintext IP or passwordHash; no Meilisearch, no sitemap generation, no AI review, no Analytics charts, no static-site conversion)
- Phase 4D-4: Phase 4 Admin CMS acceptance and security hardening (full regression of all admin modules; permission-matrix verification across super_admin/editor/seo_manager/translator/reviewer/analyst; confirmed 401/403/404/400 behaviors; `passwordHash`/`JWT_SECRET`/plaintext-IP leakage checks pass; confirmed `apps/admin` and `apps/web` never import Prisma (all data goes through the API); confirmed `/admin/*` is `noindex,nofollow` via the admin root layout; confirmed `audit_logs` coverage for emoji/category/topic/article/asset/seo/review with no sensitive fields; `lint`/`typecheck`/`build` all green; README/CHANGELOG updated; did NOT add new CMS modules, did NOT add new CRUD, did NOT integrate Meilisearch, did NOT generate sitemap, did NOT add AI tooling, did NOT convert to a pure static site)
- Phase 5A: Sitemap, robots, and indexing automation (`apps/web` App Router route handlers: `/sitemap.xml` index + `/sitemaps/{static,emojis,categories,topics,articles}.xml` + dynamic `/robots.txt`; entity URLs exclude draft/archived and `/admin`; articles sitemap reserved as empty and not listed in the index until Phase 5B; `apps/web` fetches published entities via new public read-only `GET /api/v1/sitemap/{emojis,categories,topics,articles}` API and never imports Prisma; `robots-status`/`sitemap-status` now probe the live web routes; `lint`/`typecheck`/`build` green; did NOT develop article detail pages, did NOT add AI content, did NOT bulk-generate low-quality pages, did NOT integrate Meilisearch, did NOT build a complex SEO scorer, did NOT convert to a pure static site)

## Next Phase

Phase 5B - Public Article Pages and Content Scale
