# Changelog

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
