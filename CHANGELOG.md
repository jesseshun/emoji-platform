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
