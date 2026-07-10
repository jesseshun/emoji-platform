# Changelog

## Phase 4D-4

- Completed Phase 4 Admin CMS acceptance: regression-verified all admin modules end to end
  (Auth, Dashboard, Emoji, Category, Topic, Article, Asset, SEO, Search Logs, Copy Logs, Review
  Management) against a local PostgreSQL + the built API/admin/web apps.
- Verified admin auth and protected routes: login issues an httpOnly `admin_token` JWT; unauthenticated
  requests to protected admin APIs return `401 UNAUTHORIZED`; unauthenticated browser access to protected
  admin pages is redirected to `/admin/login` by the client-side `AuthProvider`; logout clears the cookie.
- Verified the admin API permission matrix at runtime with super_admin / editor-equivalent / seo_manager /
  translator / reviewer / analyst accounts: content write (emoji/category/topic/article/asset) is limited
  to `super_admin` + `editor` (others get `403`); SEO write is `super_admin` + `editor` + `seo_manager`;
  log viewing (`canViewLogs`) is `super_admin` / `editor` / `seo_manager` / `reviewer` / `analyst`
  (`translator` gets `403`); review status write (`canManageReview`) is `super_admin` / `reviewer`
  (other roles get `403`); valid requests return `200`/`201`, missing resources return `404`, invalid
  payloads return `400`.
- Verified CMS module behaviors: list/detail/create/update/status happy paths, slug uniqueness + format
  validation, parent/cycle prevention (category), emoji-binding replace (topic), keywords JSON/comma
  parsing and auto `publishedAt` (article), provider/fileType allow-list + license/attribution rules
  (asset), canonical/hreflang preview + `seo.update` audit (SEO), and `user_submissions`-based review
  status switching.
- Verified no `passwordHash` leakage: the login/`/me` responses return only `{ id, email, name, role }`
  via `toPublic()`; no API response, audit_log, or page exposes `passwordHash`.
- Verified no `JWT_SECRET` leakage: the secret is read only from the `JWT_SECRET` environment variable
  (dev fallback `change_me`), never hardcoded as a real value, never returned by any API, and never
  appears as a real secret in README.
- Verified no plaintext sensitive-IP leakage: `search_logs` / `copy_events` / `user_submissions` responses
  expose only the non-reversible `ipHash` and a coarse `country`; `audit_logs.ipAddress` is written as
  `null` for review/SEO operations; no plaintext IP is ever returned.
- Verified `apps/admin` and `apps/web` never import `@prisma/client`; all admin and frontend data access
  goes through the API layer (`apps/api`), preserving the planned monorepo architecture.
- Verified `/admin/*` is `noindex, nofollow`: the admin root layout sets
  `robots: { index: false, follow: false }`, so login, dashboard, and every CMS page are excluded from
  search engines and must stay out of any future sitemap.
- Verified `audit_logs` coverage: emoji/category/topic/article/asset each record `create` / `update` /
  `status_update` (+ `asset.delete`); SEO records `seo.update`; review records `review.update`. All audit
  payloads contain only entity data (no `passwordHash`, no `JWT_SECRET`, no plaintext IP), are wrapped in
  try/catch so a failed write never blocks the main operation, and carry the correct `adminUserId`.
- Verified frontend regression: `/zh/`, `/en/`, emoji/category/topic lists and detail pages, and
  `/zh/search?q=...` / `/en/search?q=...` all return HTTP 200, render real content (no `undefined` /
  `null` literals in the HTML), and are indexable (no `noindex`); frontend SEO is unaffected by the admin
  module; admin pages remain excluded.
- Ran `pnpm install`, `pnpm db:generate`, `pnpm db:migrate`, `pnpm db:seed`, `pnpm lint`, `pnpm typecheck`,
  and `pnpm build` — all pass with 0 errors (no warnings introduced by this phase; lint/typecheck/build
  were already green in Phase 4D-3). No rules were disabled to mask errors; isolated `eslint-disable
  @typescript-eslint/no-explicit-any` directives in the logs/review services are localized DTO mappers.
- Did NOT add new business modules, did NOT add new CMS CRUD, did NOT integrate Meilisearch, did NOT
  generate a sitemap, did NOT add AI tooling, did NOT change the architecture to a pure static site, did
  NOT modify the Prisma schema, and did NOT refactor frontend pages.
- Updated README (Phase 4D-4 section: completed scope, module list, permission/security notes, audit_logs
  coverage, noindex/admin-robots boundary, default test account, next phase = Phase 5), PROJECT_HANDOFF.md
  (Phase 4D-4 completed, next phase = Phase 5), and this changelog.

## Phase 4D-3

- Added Search Logs admin pages: `/admin/search-logs` with pagination, keyword (query) search,
  locale filter (zh / en / all), date-range filter, and resultCount range filter (min / max);
  displays query, locale, resultCount, country, userAgent, ipHash, and createdAt; empty and error
  states are handled with readable messages.
- Added Copy Events admin pages: `/admin/copy-events` with pagination, locale filter, emojiId
  filter, and date-range filter; displays emojiChar, emoji slug, locale, pageUrl, country,
  userAgent, ipHash, and createdAt; empty and error states handled.
- Added Review Management pages: `/admin/reviews` list (status / type / locale / keyword filters,
  links to detail) and `/admin/reviews/[id]` detail with status switch (pending / approved /
  rejected / spam) plus adminNote. Implemented on the existing `user_submissions` model — no
  placeholder page and no new Review table were added (the schema already provides `user_submissions`
  with `SubmissionStatus`).
- Added Search Logs admin APIs: `GET /api/v1/admin/search-logs` (page / limit / q / locale /
  dateFrom / dateTo / minResultCount / maxResultCount) and `GET /api/v1/admin/search-logs/summary`
  (totalSearches, todaySearches, zeroResultSearches, topQueries, searchesByLocale).
- Added Copy Events admin APIs: `GET /api/v1/admin/copy-events` (page / limit / locale / emojiId /
  dateFrom / dateTo) and `GET /api/v1/admin/copy-events/summary` (totalCopies, todayCopies,
  topCopiedEmojis, copiesByLocale).
- Added Review admin APIs: `GET /api/v1/admin/reviews` (page / limit / status / type / locale / q /
  emojiId), `GET /api/v1/admin/reviews/:id` (detail), and `PATCH /api/v1/admin/reviews/:id/status`
  (status + optional adminNote). The PATCH writes an `audit_logs` entry with `action = review.update`,
  `entityType = user_submission`, and `oldData` / `newData` carrying status + adminNote; it never
  writes `passwordHash` or a plaintext IP.
- Added log summaries and filters (pagination, keyword search, locale, date range, resultCount
  range for searches; locale / emojiId / date range for copies).
- Added sensitive data handling for logs: `search_logs` / `copy_events` store only a
  non-reversible `ipHash` and a coarse `country`; the admin APIs return `ipHash` / `country` but
  never a plaintext IP. `user_submissions.userEmail` is the submitter's own contact field and is
  shown only in the review context.
- Added permission helpers in `role.util.ts`: `canViewLogs` (super_admin / editor / seo_manager /
  reviewer / analyst — translator excluded as logs are operational data) and `canManageReview`
  (super_admin / reviewer). All log / review controllers are guarded by `AdminAuthGuard`; unauthenticated
  requests return 401, and insufficient role returns 403. `translator` gets 403 on log viewing;
  `editor` / `seo_manager` / `analyst` get 403 on review status writes.
- Extended seed data: 10 `search_logs`, 10 `copy_events` (already present), and 5 `user_submissions`
  covering pending / approved / rejected / spam statuses and example / culture_note / correction /
  translation_suggestion / new_usage types, so log and review management are demonstrable after
  `pnpm db:seed`.
- Did NOT integrate Meilisearch, did NOT generate sitemap, did NOT add AI review, did NOT build
  Analytics charts or complex reports, did NOT change the front-end search / copy logic, did NOT
  modify Prisma schema, and did NOT convert the project to a pure static site.
- Updated README (Phase 4D-3 section: Search Logs scope, Copy Events scope, Review Management scope,
  admin API list, permission notes, sensitive-data handling, audit_logs notes, default test account,
  next phase = Phase 4D-4), PROJECT_HANDOFF.md (Phase 4D-3 completed, next phase = Phase 4D-4), and
  this changelog.

## Phase 0

- Initialized project governance files.
- Added development rules.
- Added roadmap.
- Added project handoff document.
- Added `.gitignore` and `.editorconfig`.
- Initialized git repository and pushed to remote.

## Phase 1

- Added pnpm workspace monorepo.
- Added apps/web (Next.js + TypeScript + Tailwind CSS) with i18n placeholder routes.
- Added apps/admin (Next.js + TypeScript + Tailwind CSS) with 10 admin module placeholders.
- Added apps/api (NestJS + TypeScript) with health and status endpoints.
- Added packages/shared, packages/types, packages/ui.
- Added Docker Compose with postgres, redis, meilisearch, api, web, admin services.
- Added Dockerfiles for web, admin, api.
- Added `.env.example` with all required environment variables.
- Added `.prettierrc` and `.prettierignore`.
- Added ESLint configurations for all apps.
- Added health/status endpoints at `/api/v1/health` and `/api/v1/status`.
- Added placeholder routes for web (zh/en) and admin (10 modules).
- Updated README with full project documentation.

## Phase 2

- Added Prisma ORM with PostgreSQL datasource.
- Added 15 core data models: Emoji, EmojiTranslation, Category, CategoryTranslation, Topic, TopicTranslation, TopicEmoji, Article, ArticleTranslation, EmojiAsset, SearchLog, CopyEvent, UserSubmission, AdminUser, AuditLog.
- Added 6 enums: Locale, PublishStatus, ReviewStatus, AdminRole, SubmissionType, SubmissionStatus.
- Added database relationships: Emoji ↔ Category/Subcategory, Emoji ↔ Translations, Emoji ↔ Assets, Category hierarchy, Topic ↔ Emoji (M2M), Article ↔ Translations, AdminUser ↔ AuditLogs.
- Added Prisma migration system.
- Added seed script with 10 categories, 6 subcategories, 30 emojis with zh/en translations, 5 topics, 1 super admin, 10 search logs, 10 copy events, 6 emoji assets.
- Added super admin seed user (admin@example.com / admin123456) with bcrypt-hashed password.
- Added Emoji import script with sample data (25 emojis).
- Added slug utility functions (generateSlug, uniqueSlug) in packages/shared.
- Added database health check via `/api/v1/status` (database: "connected").
- Added PrismaService with NestJS lifecycle integration.
- Updated README with Phase 2 documentation, database initialization steps, and import script usage.
- Updated PROJECT_HANDOFF.md and ROADMAP.md for Phase 2 completion.
- Added package scripts: db:generate, db:migrate, db:seed, db:studio, import:emoji.

## Phase 3A

- Added public Emoji list API (`GET /api/v1/emojis`) with pagination, locale, category filter, and basic search.
- Added public Emoji detail API (`GET /api/v1/emojis/:slug`) with translations, category, subcategory, assets, related emojis, and related topics.
- Added public Category list API (`GET /api/v1/categories`) with emoji counts and translations.
- Added public Category detail API (`GET /api/v1/categories/:slug`) with paginated emojis and related topics.
- Added public Topic list API (`GET /api/v1/topics`) with pagination and translations.
- Added public Topic detail API (`GET /api/v1/topics/:slug`) with bound emojis and related topics.
- Added basic search API (`GET /api/v1/search`) using PostgreSQL/Prisma queries across emojiChar, slug, unicodeCodepoint, shortcode, and translations.
- Added copy event API (`POST /api/v1/events/copy`) with emoji validation.
- Added search log recording with fire-and-forget pattern (does not fail search on log error).
- Added unified API response format: `{ success, data, meta }` for success, `{ success, error: { code, message } }` for errors.
- Added locale parsing and validation (`zh`/`en`, defaults to `en`, throws 400 on invalid).
- Added pagination utilities: `page` (default 1), `limit` (default 30, max 100), with `meta: { page, limit, total, totalPages }`.
- Added DTO/validation for all API parameters with clear error messages.
- Added error handling: 400 for bad requests, 404 for not found, 500 for server errors.
- Updated `ResponseInterceptor` to support `meta` field.
- Updated `HttpExceptionFilter` to return `{ success: false, error: { code, message } }` format.
- Updated `packages/types` with pagination types, locale helpers, and API response types.
- Updated `packages/shared` to self-contain locale utilities (no cross-package runtime dependency).
- Built packages/types and packages/shared as CommonJS for runtime compatibility.
- Updated build script to ensure packages are built before apps/api.
- Updated README with Phase 3A API documentation, endpoints, query parameters, and examples.
- Updated PROJECT_HANDOFF.md and CHANGELOG.md for Phase 3A completion.

## Phase 3B

- Added frontend home pages (zh/en) with Hero search, recommended emojis, category/topic/tool entry cards, and intro section.
- Added Emoji list pages (zh/en) with SSR pagination, search box, EmojiCard grid, and pagination component.
- Added category index pages (zh/en) with CategoryCard grid.
- Added topic index pages (zh/en) with TopicCard grid and pagination.
- Added search pages (zh/en) with query-based search, result display, and empty state.
- Added tools placeholder pages (zh/en) with 4 tool cards showing "即将上线"/"Coming soon".
- Added license pages (zh/en) with original Unicode licensing content.
- Added about pages (zh/en) with original platform introduction content.
- Added frontend shared components: Header (locale-aware), Footer (with link sections), LanguageSwitcher, SearchBox, EmojiCard, EmojiGrid, CopyButton, CategoryCard, TopicCard, ToolCard, Pagination, EmptyState, LoadingState, ErrorState, Toast.
- Added API client layer (lib/api.ts) with fetch wrapper and all Phase 3A endpoint functions.
- Added frontend type definitions (lib/types.ts) for EmojiListItem, CategoryItem, TopicItem, SearchResultItem.
- Added CopyButton integration with copy event API (fire-and-forget pattern).
- Added SSR data fetching for all list pages (server components fetch from Phase 3A API).
- Added SEO metadata (title, description, Open Graph) for all pages.
- Added mobile responsive design for all pages and components.
- Added locale-aware navigation (Header, Footer, LanguageSwitcher).
- Moved Header/Footer from root layout to locale layouts for proper locale prop passing.
- Updated README with Phase 3B documentation.
- Updated PROJECT_HANDOFF.md and CHANGELOG.md for Phase 3B completion.

## Phase 3C

- Added Emoji detail pages (`/zh/emoji/[slug]/` and `/en/emoji/[slug]/`) with full modules: Hero, Copy Area, Meaning, Examples, Tech Info, Keywords, FAQ, Assets, Related Emojis, Related Topics.
- Added Category detail pages (`/zh/categories/[slug]/` and `/en/categories/[slug]/`) with emoji list, pagination, related topics, and Breadcrumb.
- Added Topic detail pages (`/zh/topics/[slug]/` and `/en/topics/[slug]/`) with bound emojis, content, FAQ, related topics, and Breadcrumb.
- Added SEO metadata enhancement for all detail pages: title, description, canonical, hreflang, Open Graph, Twitter Card.
- Fixed `html lang` attribute: dynamically set to `zh` or `en` based on current locale route.
- Added canonical URLs to all existing list pages (emojis, categories, topics, search).
- Added hreflang support (zh/en/x-default) for all detail pages and locale layouts.
- Added `NEXT_PUBLIC_SITE_URL` environment variable (default: `http://localhost:3000`).
- Added Breadcrumb component with BreadcrumbList JSON-LD structured data.
- Added FAQ component with FAQPage JSON-LD structured data.
- Added JsonLd component for rendering JSON-LD script tags.
- Added new components: DetailHero, CopyArea, CopyValueButton, EmojiMeaningSection, EmojiExamples, EmojiTechInfo, EmojiKeywords, EmojiAssets, RelatedEmojis, RelatedTopics, HtmlLang.
- Added SEO utility library (`lib/seo.ts`): canonical builder, hreflang builder, detail metadata builder, BreadcrumbList/FAQPage JSON-LD builders.
- Added detail page API client functions: `getEmojiDetail`, `getCategoryDetail`, `getTopicDetail`.
- Added detail page TypeScript types: `EmojiDetail`, `CategoryDetailData`, `TopicDetailData`, `RelatedEmoji`, `RelatedTopic`, `EmojiAsset`, `CategoryEmoji`, `TopicBoundEmoji`.
- Updated `.env.example` with `NEXT_PUBLIC_SITE_URL`.
- Updated README with Phase 3C documentation.
- Updated PROJECT_HANDOFF.md and CHANGELOG.md for Phase 3C completion.

## Phase 3C Fix (post-acceptance)

- Fixed `<html lang>` not being set server-side: the root layout now derives `lang` from the
  request locale path (via an `x-locale-path` request header set in `middleware.ts`), so `/zh/*`
  pages render `<html lang="zh">` and `/en/*` pages render `<html lang="en">` in the initial HTML.
  Previously the attribute was hardcoded to `en` and only corrected client-side by `HtmlLang`.
- Fixed `pnpm typecheck` failing on a clean checkout: the root `typecheck` script now builds
  `@emoji-platform/types` and `@emoji-platform/shared` before running `pnpm -r typecheck`, since
  those packages resolve their `types` entry from built `dist` output.

## Phase 3D

- Added `SearchBox` interaction enhancements: clear (✕) button, submit-disabled state to prevent
  double submission, locale-aware routing to `/zh/search` or `/en/search`, consistent empty-query
  behavior, and mobile-friendly spacing.
- Enhanced search pages (`/zh/search`, `/en/search`): dynamic `generateMetadata` that reflects the
  query in title/description/canonical/hreflang.
- Enhanced empty-query search state: shows a guidance `EmptyState` plus a "推荐表情 / Popular
  Emojis" recommended grid instead of a blank page.
- Enhanced no-results search state: `EmptyState` with the query highlighted plus a "browse
  categories" action and the recommended grid.
- Enhanced API-failure search state: localized `ErrorState` plus the recommended grid.
- Search results continue to render via `EmojiGrid`/`EmojiCard` with a result count.
- Added `lib/clipboard.ts` helper: prefers the async Clipboard API and falls back to a hidden
  textarea + `execCommand('copy')` for non-secure/older mobile browsers; never throws.
- Enhanced `CopyButton`: localized success/failure toasts, uses `copyText()`, keeps fire-and-forget
  copy-event recording that never blocks the copy UX.
- Enhanced `CopyValueButton`: added optional `emojiId`; when provided, copying Unicode / HTML
  decimal / HTML hex / shortcode now records a copy event, with localized toasts and `copyText()`.
- Enhanced `CopyArea`: added optional `emojiId`; each copy item records a copy event when present,
  with localized toasts and `copyText()`.
- Threaded `emojiId` from emoji detail pages (`zh`/`en`) into `EmojiTechInfo` → `CopyValueButton`
  and into `CopyArea`, so all copy targets on a detail page record copy events.
- Localized `ErrorState` via route-derived locale (`usePathname`), with proper zh/en titles and a
  "重试 / Try again" retry control; backward compatible (optional `locale` prop).
- Refined `EmptyState` layout (centered, action slot spacing).
- Mobile optimizations: `CopyButton`/`CopyValueButton`/`CopyArea` buttons have a ≥36px tap target;
  long Unicode/HTML strings truncate and use `break-all` so they never break the layout; `SearchBox`
  stays within its container on narrow screens.
- Added `RecommendedEmojis` server component used on search landing / no-results / error states;
  fetch failures are swallowed so the search page is never broken.
- Verified `search_logs` writes on both successful and zero-result searches, and `copy_events`
  writes from `CopyButton`/`CopyValueButton`/`CopyArea`; recording failures do not affect UX.
- Updated README (current phase, Phase 3D completed checklist, next phase = Phase 4),
  PROJECT_HANDOFF.md (Phase 3D completed, next phase = Phase 4), and this changelog.

## Phase 4A

- Added admin login API `POST /api/v1/admin/auth/login`:
  - Validates email/password (empty email/password/email format → 400 `BAD_REQUEST`).
  - Verifies credentials against the Phase 2 `admin_users` table using bcrypt `passwordHash` comparison; generic `401` on invalid email or password (no account-existence leak).
  - Inactive accounts (`status !== 'active'`) are rejected.
  - Returns `{ admin: { id, email, name, role }, token }`; `passwordHash` is never returned.
  - Sets an httpOnly Cookie `admin_token` (JWT) on the response; `sameSite: lax`, `secure` in production.
- Added admin current-user API `GET /api/v1/admin/auth/me` (requires token; returns current admin without `passwordHash`).
- Added admin logout API `POST /api/v1/admin/auth/logout` (clears the `admin_token` cookie, returns success).
- Added admin health API `GET /api/v1/admin/health` (requires token; used to verify admin auth).
- Added JWT support via `@nestjs/jwt`, configured from `JWT_SECRET` and `JWT_EXPIRES_IN` (already present in `.env.example`); secret is not hard-coded.
- Added `AdminAuthGuard` that reads the token from the `Authorization: Bearer` header or the `admin_token` cookie, verifies it with `JwtService`, and throws `401 UNAUTHORIZED` on missing/invalid/expired tokens.
- Added `AdminModule` and registered it in `AppModule`.
- Extended the unified error filter so `401` maps to code `UNAUTHORIZED` (and `403` → `FORBIDDEN`).
- Restructured the admin frontend with route groups:
  - `(auth)/admin/login` — real login form (email + password, client-side empty-field check, server-error and network-error messages, redirect to dashboard if already logged in).
  - `(admin)/admin/*` — protected pages (dashboard + 9 module placeholders) wrapped by an `AuthProvider` that calls `/me`; unauthenticated users are redirected to `/admin/login`.
  - `AuthProvider`/`useAuth` manage the admin session and expose a logout action.
- Enhanced `AdminLayout` sidebar to show the current admin email/role and a logout button.
- Added `src/lib/adminApi.ts` client that calls the admin API with `credentials: 'include'` (Cookie auto-send); the frontend never stores or reads the token or password.
- Added `noindex, nofollow` metadata to all admin pages (root layout `robots: { index: false, follow: false }`); README documents that `/admin/*` must be excluded from any future sitemap.
- Verified `pnpm install`, `db:generate`, `db:migrate`, `db:seed`, `lint`, `typecheck`, `build` all pass.
- Updated README (Phase 4A section, login account, admin login URL, Auth API list, token/cookie notes, protected pages, noindex note, next phase = Phase 4B), PROJECT_HANDOFF.md (Phase 4A completed, next phase = Phase 4B), and this changelog.

## Phase 4B

- Added admin dashboard API `GET /api/v1/admin/dashboard` (requires login): returns stats
  (emojiTotal / publishedEmojiTotal / draftEmojiTotal / archivedEmojiTotal / categoryTotal /
  topicTotal / todaySearchTotal / todayCopyTotal), up to 5 most recently updated emojis, and the
  current admin info. All counts computed from existing Prisma tables; no schema change.
- Added admin dashboard UI at `/admin/dashboard` with stat cards, recent-emojis list, and admin info.
- Added admin emoji list API `GET /api/v1/admin/emojis` with `page`, `limit` (max 100), `q`
  (matches emojiChar / slug / unicodeCodepoint / shortcode / translation name), `categoryId`, and
  `status` (draft / published / archived / all) filters; returns `data` + `meta` (page/limit/total/totalPages).
  Each item includes emojiChar, slug, unicodeCodepoint, shortcode, category, status, updatedAt,
  zh/en translation completion summary, and preview links (`/zh/emoji/{slug}/`, `/en/emoji/{slug}/`).
- Added admin emoji detail API `GET /api/v1/admin/emojis/{id}` (404 when not found) returning full
  base fields plus both zh/en translations (including examples / keywords / faqJson), category, and preview links.
- Added admin emoji create API `POST /api/v1/admin/emojis` (requires login + write role): validates
  emojiChar, slug uniqueness + format, categoryId existence, and zh/en translation `name`; writes the
  emoji row + both `emoji_translations`; records an `emoji.create` audit log; never returns passwordHash.
- Added admin emoji update API `PATCH /api/v1/admin/emojis/{id}` (requires login + write role): partial
  update of base fields and per-locale translations, JSON fields validated before save, records an
  `emoji.update` audit log with `oldData`/`newData` snapshots.
- Added admin emoji status API `PATCH /api/v1/admin/emojis/{id}/status` (requires login + write role):
  switches status among draft / published / archived (400 on invalid, 404 when missing), records an
  `emoji.status_update` audit log with old/new status.
- Added admin category options API `GET /api/v1/admin/categories/options` (requires login): returns
  `id`, `slug`, `iconEmoji`, and translation `name` for the requested `locale` (default `zh`); used by
  the emoji create/edit forms. No full category CRUD in this phase.
- Added Emoji admin UI: `/admin/emojis` (table with search/filter/pagination, edit + preview links,
  create button), `/admin/emojis/create` (create form), `/admin/emojis/[id]/edit` (edit form with
  base fields, zh/en translation sections in tabs, JSON fields with validation, quick status actions).
- Added `canManageEmoji(role)` / `canViewEmoji(role)` helpers: write ops limited to `super_admin` and
  `editor` (others get 403); read ops allowed for all known admin roles (others get 403).
- All admin emoji/category/dashboard write and read endpoints are protected by `AdminAuthGuard`
  (401 when unauthenticated); no sensitive fields (e.g. passwordHash) are ever returned; JWT secret is
  read from `JWT_SECRET` via `ConfigService` (never hard-coded); passwords are never logged.
- audit_logs writes are wrapped in try/catch: on failure the error is logged server-side and the main
  operation still succeeds; audit payloads contain only emoji data (no admin passwordHash).
- Updated README (Phase 4B section, admin dashboard + emoji management scope, admin emoji API list,
  emoji form field reference, JSON field editing notes, audit_logs notes, default test account, next
  phase = Phase 4C), PROJECT_HANDOFF.md (Phase 4B completed, next phase = Phase 4C), and this changelog.

## Phase 4C-1

- Added admin category list API `GET /api/v1/admin/categories` (requires login): supports `page`,
  `limit` (default 20, max 100), `q` (matches slug / translation name), `status` (draft / published /
  archived / all), and `parentId` (category id, or `none` for top-level). Returns `data` + `meta`
  (page/limit/total/totalPages). Each item includes slug, iconEmoji, sortOrder, status, parent summary,
  `emojiCount` (sum of direct + subcategory emojis), zh/en translation name + completion summary,
  updatedAt, and preview links (`/zh/categories/{slug}/`, `/en/categories/{slug}/`).
- Added admin category detail API `GET /api/v1/admin/categories/{id}` (404 when not found) returning
  base fields, both zh/en translations (name / description / seoTitle / seoDescription), parent summary,
  and children (id / slug / name).
- Added admin category create API `POST /api/v1/admin/categories` (requires login + write role): validates
  slug uniqueness + `^[a-z0-9-]+$` format, zh/en translation `name` required, `status` in
  (draft / published / archived), `sortOrder` numeric, and `parentId` existence; writes the category row +
  both `category_translations`; records a `category.create` audit log; never returns passwordHash.
- Added admin category update API `PATCH /api/v1/admin/categories/{id}` (requires login + write role):
  partial update of base fields and per-locale translations; validates slug uniqueness when changed,
  prevents setting parent to self, and prevents circular references (walks the ancestor chain); records a
  `category.update` audit log with `oldData`/`newData` snapshots.
- Added admin category status API `PATCH /api/v1/admin/categories/{id}/status` (requires login + write
  role): switches status among draft / published / archived (400 on invalid, 404 when missing); records a
  `category.status_update` audit log with old/new status.
- Added admin category tree API `GET /api/v1/admin/categories/tree` (requires login): returns the category
  hierarchy for the parent selector. Supports `locale` (default `zh`) for node names and `exclude` (a
  category id) to drop that node and its descendants — used to avoid selecting self/descendants as parent
  (backend cycle check is the authoritative safeguard). Nodes expose `id`, `slug`, `iconEmoji`, `status`,
  `sortOrder`, `name`, `children`.
- Added `canManageCategory(role)` / `canViewCategory(role)` helpers (kept distinct from the emoji
  helpers for explicit intent): write ops limited to `super_admin` and `editor` (others get 403); read
  ops allowed for all known admin roles (others get 403).
- Added Category admin UI: `/admin/categories` (table with search / parent / status filters + pagination,
  emoji count, zh/en names, edit + preview links, create button), `/admin/categories/create` (create
  form), `/admin/categories/[id]/edit` (edit form with base fields, zh/en translation sections in tabs,
  SEO fields, quick status actions, preview links). All read/write endpoints remain behind `AdminAuthGuard`
  (401 unauthenticated). Parent selection uses the tree API with self/descendant exclusion.
- Added category client helpers in `apps/admin/src/lib/adminApi.ts` (listCategories / getCategory /
  createCategory / updateCategory / updateCategoryStatus / getCategoryTree) and types mirroring the emoji
  client.
- No Prisma schema change: the `Category` / `CategoryTranslation` models already exist and were sufficient
  for this phase.
- audit_logs writes for category follow the Phase 4B pattern (try/catch, server-side error log on failure,
  main op still succeeds; payloads contain only category data — no admin passwordHash).
- Verified acceptance via automated API tests: 401 when unauthenticated, 403 for read-only roles on writes,
  list/tree/create/detail/update/status happy paths, slug uniqueness + format + required-name validation,
  self-parent and circular-reference prevention (400), 404 on missing id, and category audit logs present
  with no passwordHash leakage.
- Updated README (Phase 4C-1 section: scope, category admin API list, form field reference, tree API notes,
  audit_logs notes, default test account, next phase = Phase 4C-2), PROJECT_HANDOFF.md (Phase 4C-1
  completed, next phase = Phase 4C-2), and this changelog.

## Phase 4C-2

- Added admin topic list API `GET /api/v1/admin/topics` (requires login): supports `page`, `limit`
  (default 20, max 100), `q` (matches slug / translation title), and `status` (draft / published /
  archived / all) filters. Returns `data` + `meta` (page/limit/total/totalPages). Each item includes
  slug, coverImage, topicType, sortOrder, status, `emojiCount` (count of bound emojis), zh/en
  translation title + completion summary, updatedAt, and preview links (`/zh/topics/{slug}/`,
  `/en/topics/{slug}/`).
- Added admin topic detail API `GET /api/v1/admin/topics/:id` (404 when not found) returning base
  fields, both zh/en translations (title / summary / content / seoTitle / seoDescription / faqJson),
  and the bound emojis (id / emojiId / sortOrder / note / emoji: id·slug·emojiChar·name).
- Added admin topic create API `POST /api/v1/admin/topics` (requires login + write role): validates
  slug uniqueness + `^[a-z0-9-]+$` format, zh/en translation `title` required, `status` in
  (draft / published / archived), `sortOrder` numeric, and `topicType` / `coverImage` optional; writes
  the topic row + both `topic_translations`; records a `topic.create` audit log; never returns
  passwordHash.
- Added admin topic update API `PATCH /api/v1/admin/topics/:id` (requires login + write role): partial
  update of base fields and per-locale translations (faqJson validated as JSON before save); validates
  slug uniqueness when changed; records a `topic.update` audit log with `oldData`/`newData` snapshots.
- Added admin topic status API `PATCH /api/v1/admin/topics/:id/status` (requires login + write role):
  switches status among draft / published / archived (400 on invalid, 404 when missing); records a
  `topic.status_update` audit log with old/new status.
- Added admin topic-emoji binding API `PUT /api/v1/admin/topics/:id/emojis` (requires login + write
  role): replaces the full ordered set of emoji bindings in one call (bind / unbind / reorder). Body
  `{ items: [{ emojiId, note? }] }`; an empty array clears all bindings. Each `emojiId` is validated to
  exist (400 on invalid). Records a `topic.update_emojis` audit log with old/new bindings.
- Added admin topic emoji-options API `GET /api/v1/admin/topics/emoji-options` (requires login):
  returns `id`, `slug`, `emojiChar`, and translation `name` (default `zh`) for the binding selector.
- Added `canManageTopic(role)` / `canViewTopic(role)` helpers (kept distinct from the category/emoji
  helpers for explicit intent): write ops limited to `super_admin` and `editor` (others get 403); read
  ops allowed for all known admin roles (others get 403).
- Added Topic admin UI: `/admin/topics` (table with search / status filters + pagination, emoji count,
  zh/en titles, topicType, edit + preview links, create button), `/admin/topics/create` (create form),
  `/admin/topics/[id]/edit` (edit form with base fields, an Emoji-association manager — add / remove /
  reorder / per-binding note, zh/en translation sections in tabs, faqJson JSON textarea with
  validation, quick status actions, preview links). All read/write endpoints remain behind
  `AdminAuthGuard` (401 unauthenticated).
- No Prisma schema change: the `Topic` / `TopicTranslation` / `TopicEmoji` models already exist and were
  sufficient for this phase.
- audit_logs writes for topic follow the Phase 4B/4C-1 pattern (try/catch, server-side error log on
  failure, main op still succeeds; payloads contain only topic data — no admin passwordHash).
- Verified `pnpm typecheck`, `pnpm lint`, and `pnpm build` all pass.
- Updated README (Phase 4C-2 section: scope, topic admin API list, form field reference, emoji-binding
  notes, audit_logs notes, default test account, next phase = Phase 4C-3), PROJECT_HANDOFF.md
  (Phase 4C-2 completed, next phase = Phase 4C-3), and this changelog.

## Phase 4C-3

- Added admin article list API `GET /api/v1/admin/articles` (requires login): supports `page`, `limit`
  (default 20, max 100), `q` (matches slug / translation title), and `status` (draft / published /
  archived / all) filters. Returns `data` + `meta` (page/limit/total/totalPages). Each item includes
  slug, coverImage, status, `publishedAt`, author summary (id / name / email), zh/en translation title +
  completion summary, updatedAt, and preview links (`/zh/articles/{slug}/`, `/en/articles/{slug}/`).
- Added admin article detail API `GET /api/v1/admin/articles/:id` (404 when not found) returning base
  fields, both zh/en translations (title / summary / content / seoTitle / seoDescription / keywords),
  author summary, and preview links.
- Added admin article create API `POST /api/v1/admin/articles` (requires login + write role): validates
  slug uniqueness + `^[a-z0-9-]+$` format, zh/en translation `title` required, `status` in
  (draft / published / archived), parses `keywords` (JSON array or comma-separated list) and `publishedAt`
  (ISO/date string), writes the article row + both `article_translations`, auto-sets `publishedAt` when
  publishing without an explicit date, records an `article.create` audit log; never returns passwordHash.
- Added admin article update API `PATCH /api/v1/admin/articles/:id` (requires login + write role): partial
  update of base fields and per-locale translations; validates slug uniqueness when changed; parses
  `keywords` / `publishedAt`; on transition into `published` with no date set, stamps `publishedAt`;
  records an `article.update` audit log with `oldData`/`newData` snapshots.
- Added admin article status API `PATCH /api/v1/admin/articles/:id/status` (requires login + write role):
  switches status among draft / published / archived (400 on invalid, 404 when missing); stamps
  `publishedAt` when entering `published` with no date; records an `article.status_update` audit log with
  old/new status.
- Added `canManageArticle(role)` / `canViewArticle(role)` helpers (kept distinct from the
  emoji/category/topic helpers for explicit intent): write ops limited to `super_admin` and `editor`
  (others get 403); read ops allowed for all known admin roles (others get 403).
- Added Article admin UI: `/admin/articles` (table with search / status filters + pagination, slug,
  zh/en titles, status, publishedAt, author, updatedAt, edit link + disabled preview placeholder,
  create button), `/admin/articles/create` (create form), `/admin/articles/[id]/edit` (edit form with
  base fields, zh/en translation sections in tabs, SEO fields, keywords JSON/comma textarea, quick status
  actions, author read-only display, preview placeholder). All read/write endpoints remain behind
  `AdminAuthGuard` (401 unauthenticated).
- Added seed articles (`apps/api/prisma/seed.ts`): 3 sample articles
  (`how-to-read-emoji-meaning`, `emoji-history-and-unicode` published; `common-emoji-misuses` draft) with
  zh/en translations and keywords, authored by the super admin, for list-page acceptance.
- No Prisma schema change: the `Article` / `ArticleTranslation` models already exist and were sufficient
  for this phase. Front-end article pages (`/zh/articles/`, `/en/articles/`) are intentionally not
  implemented in this phase (next phase scope), so admin "preview" links are placeholders.
- audit_logs writes for article follow the Phase 4B/4C-1/4C-2 pattern (try/catch, server-side error log
  on failure, main op still succeeds; payloads contain only article data — no admin passwordHash).
- Verified `pnpm lint`, `pnpm typecheck`, and `pnpm build` all pass; verified API acceptance (401 when
  unauthenticated, 403 for read-only roles on writes, list/detail/create/update/status happy paths, slug
  uniqueness + format + required-title validation, keywords JSON/comma parsing, auto publishedAt on
  publish, 404 on missing id, article audit logs present with no passwordHash leakage).
- Updated README (Phase 4C-3 section: scope, article admin API list, form field reference, keywords
  editing notes, publishedAt behavior, audit_logs notes, default test account, seed data, next phase =
  Phase 4D), PROJECT_HANDOFF.md (Phase 4C-3 completed, next phase = Phase 4D), and this changelog.

## Phase 4D-1

- Added admin asset list API `GET /api/v1/admin/assets` (requires login): supports `page`, `limit`
  (default 20, max 100), `q` (matches provider / fileType / fileUrl / localPath / licenseName /
  attribution / emoji char·slug·name), `provider`, `fileType`, `status`, `emojiId`, and
  `isDownloadable` filters. Returns `data` + `meta` (page/limit/total/totalPages). Each item includes
  the associated Emoji summary (id / emojiChar / slug / name), provider, fileType, fileUrl,
  localPath, width, height, licenseName, licenseUrl, attribution, isDownloadable, status, and timestamps.
- Added admin asset detail API `GET /api/v1/admin/assets/:id` (404 when not found) returning the
  full asset edit payload with the associated Emoji summary.
- Added admin asset create API `POST /api/v1/admin/assets` (requires login + write role): validates
  emojiId existence, provider allow-list (`noto` / `openmoji` / `twemoji` / `custom`), fileType
  allow-list (`svg` / `png` / `webp` / `gif`), fileUrl/localPath at-least-one, positive-integer
  width/height, license rules, and status enum; records an `asset.create` audit log; never returns passwordHash.
- Added admin asset update API `PATCH /api/v1/admin/assets/:id` (requires login + write role):
  partial update with the same field validations, records an `asset.update` audit log with
  `oldData`/`newData` snapshots; never returns passwordHash.
- Added admin asset status API `PATCH /api/v1/admin/assets/:id/status` (requires login + write role):
  switches status among draft / published / archived (400 on invalid, 404 when missing); records an
  `asset.status_update` audit log with old/new status.
- Added admin asset delete API `DELETE /api/v1/admin/assets/:id` (requires login + write role): hard
  delete (the schema has no soft-delete field) with an `asset.delete` audit log written BEFORE the
  row is removed; 404 when missing.
- Added admin asset provider API `GET /api/v1/admin/assets/providers` returning the allow-list
  `[noto, openmoji, twemoji, custom]`.
- Added admin asset file-type API `GET /api/v1/admin/assets/file-types` returning `[svg, png, webp, gif]`.
- Added admin emoji-options API `GET /api/v1/admin/emojis/options` (requires login) returning
  `id` / `emojiChar` / `slug` / `name` for the Asset form's Emoji selector; no sensitive fields.
- Added Asset admin UI: `/admin/assets` (table with search / provider / fileType / status /
  isDownloadable filters + pagination, associated Emoji, provider·fileType·source·license·downloadable·
  status columns, edit link, create button), `/admin/assets/create` (create form),
  `/admin/assets/[id]/edit` (edit form with Emoji selector, provider/fileType, fileUrl/localPath,
  width/height, licenseName/licenseUrl, attribution, isDownloadable, status, quick-status actions,
  delete button with confirm).
- License / attribution rules: `provider` is restricted to the allow-list (Apple / Samsung / Microsoft /
  微信 / QQ and other unlicensed sources are rejected by design); `isDownloadable = true` requires
  `licenseName`; `provider = custom` requires both `licenseName` and `attribution`; the UI surfaces a
  clear notice that the Emoji character and platform image designs are different and that image
  resources must comply with the provider license; README documents the licensing boundary.
- All read and write asset endpoints are behind `AdminAuthGuard` (401 unauthenticated); read ops
  allowed for all known admin roles, write ops limited to `super_admin` and `editor` (403 otherwise)
  via `canViewAsset` / `canManageAsset` helpers kept distinct from the other CMS helpers.
- audit_logs writes for asset follow the Phase 4B/4C pattern (try/catch, server-side error log on
  failure, main op still succeeds; payloads contain only asset data — no admin passwordHash).
- Verified `pnpm lint`, `pnpm typecheck`, and `pnpm build` all pass (Prisma Client must be generated
  via `pnpm db:generate` first so service map callbacks are typed). Verified asset API acceptance
  against a local Postgres: 401 when unauthenticated; super_admin can list/create/update/status/
  delete; translator can list (200) but cannot create (403); list shows 6 seed assets; provider /
  file-type / emoji-options endpoints work; validation rejects missing emojiId, invalid provider
  (`apple`), isDownloadable-without-licenseName, custom-without-license/attribution, empty
  fileUrl+localPath, invalid fileType, and invalid status (all 400); 404 on missing id;
  audit_logs contain asset.create/update/status_update/delete with zero passwordHash leakage;
  login / me / asset responses never leak passwordHash.
- Updated README (Phase 4D-1 section: scope, asset admin API list, form field reference,
  provider / fileType notes, license & attribution rules, isDownloadable rules, audit_logs notes,
  default test account, next phase = Phase 4D-2), PROJECT_HANDOFF.md (Phase 4D-1 completed,
  next phase = Phase 4D-2), and this changelog.

## Phase 4D-2

- Added SEO management overview page `/admin/seo`: per-entity SEO completeness (total / complete /
  missingTitle / missingDescription / missingAny) for emoji / category / topic / article, global
  missing-title / missing-description counts, zh / en missing-by-locale counts, recent `seo.update`
  records, robots.txt / sitemap.xml status, and quick links to each entity's SEO list.
- Added SEO entity list pages `/admin/seo/emojis`, `/admin/seo/categories`, `/admin/seo/topics`,
  `/admin/seo/articles`: pagination, keyword search, locale filter (zh / en / all), status filter,
  and completeness filter (all / missingTitle / missingDescription / missingAny / complete); each
  row is an entity × locale with name/title, slug, locale, seoTitle, seoDescription, character
  lengths, completeness badge, front-end preview link, and edit link; canonical / hreflang preview
  data included in the API response.
- Added SEO edit page `/admin/seo/{entityType}/{id}/edit` (entityType ∈ emoji / category / topic /
  article): shows base info + zh / en translations, edits zh / en `seoTitle` / `seoDescription`,
  displays character-length hints, read-only canonical preview, read-only hreflang preview, front-end
  preview links, and saves; never renders `undefined` / `null` literals in the UI.
- Added SEO admin APIs (all behind `AdminAuthGuard`): `GET /api/v1/admin/seo/overview`,
  `GET /api/v1/admin/seo/entities` (entityType / page / limit / q / locale / status /
  completeness), `GET /api/v1/admin/seo/entities/:entityType/:id`,
  `PATCH /api/v1/admin/seo/entities/:entityType/:id`,
  `GET /api/v1/admin/seo/robots-status`, `GET /api/v1/admin/seo/sitemap-status`.
- SEO write API validates `entityType` (400 on invalid), entity existence (404), locale, and rejects
  literal `"undefined"` / `"null"` strings (400); updates the matching
  `EmojiTranslation` / `CategoryTranslation` / `TopicTranslation` / `ArticleTranslation`
  `seoTitle` / `seoDescription`, and returns the refreshed SEO data.
- Reused existing translation `seoTitle` / `seoDescription` fields — no new SEO table was added.
- canonical / hreflang previews generated from `SITE_URL` (env, default `http://localhost:3000`) and
  entity slug: emoji `/{locale}/emoji/{slug}/`, category `/{locale}/categories/{slug}/`,
  topic `/{locale}/topics/{slug}/`, article `/{locale}/articles/{slug}/` (article path marked
  `planned` / not active since the front-end article detail page is not implemented yet); hreflang
  set includes `zh`, `en`, and `x-default` (→ en).
- robots / sitemap status endpoints are read-only checks of `apps/web/public/robots.txt` and
  `sitemap.xml` (path overridable via `WEB_PUBLIC_DIR`); neither generates files nor submits to
  search engines. `/admin/*` remains noindex via page meta `robots: { index: false, follow: false }`.
- SEO read allowed for all known admin roles; SEO write limited to `super_admin`, `editor`, and
  `seo_manager` (403 otherwise) via new `canManageSeo` / `canViewSeo` helpers in `role.util.ts`.
- SEO updates record an `audit_logs` entry with `action = seo.update`, `entityType = seo`,
  `entityId = "{entityType}:{id}"`, and `oldData` / `newData` carrying zh / en `seoTitle` /
  `seoDescription` changes; no `passwordHash` is ever included, and audit-log write failure is
  logged server-side without blocking the main operation.
- Verified `pnpm lint`, `pnpm typecheck`, and `pnpm build` all pass. Verified SEO API acceptance
  against a local Postgres: 401 when unauthenticated; super_admin / seo_manager can read and update;
  translator (read-only) receives 403 on write; list / overview / detail / robots / sitemap endpoints
  work; `seo.update` appears in audit/recent-updates; invalid `entityType` and `"undefined"` / `"null"`
  payloads return 400; no `passwordHash` leakage; no sitemap generated; robots rules unchanged.
- Updated README (Phase 4D-2 section: scope, SEO admin pages, SEO admin API list, supported
  entityType, seoTitle / seoDescription management notes, canonical / hreflang preview rules, robots /
  sitemap status boundaries, audit_logs notes, default test account, next phase = Phase 4D-3),
  PROJECT_HANDOFF.md (Phase 4D-2 completed, next phase = Phase 4D-3), and this changelog.
