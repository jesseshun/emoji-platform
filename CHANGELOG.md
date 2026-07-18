# Changelog

## UI Redesign — Batch 4A: Article Reading Experience

- **Article lists** (`/zh/articles`, `/en/articles`): Rebuilt the bilingual published-article browser around the existing API order, pagination metadata, translations, cover URLs, titles, summaries, dates, slugs, and local fallback. The first item receives a restrained featured layout and remaining items use a responsive two-column grid; no popularity, recommendation, author, category, or topic data is fabricated.
- **Article detail** (`/zh/articles/[slug]`, `/en/articles/[slug]`): Added the shared `ArticleDetailView` with Breadcrumb JSON-LD, real title/summary/author/published/updated/keywords, responsive cover, bounded reading width, related Emoji/topic/article sections, and a back path. Empty associations do not render empty cards; the API exposes no article-category relation, so no category module is invented.
- **Safe article body**: Added `ArticleBody`, a React-node Markdown renderer for headings, paragraphs, emphasis, links, images, lists, quotes, fenced code, and mobile-scrollable tables. Article text no longer uses body `dangerouslySetInnerHTML`; unsafe URL protocols are rejected and external links retain `noopener noreferrer`.
- **Route states**: Added localized list/detail loading and error boundaries plus article not-found states. Missing body content shows a clear accessible empty state instead of a blank page. Draft and nonexistent slugs remain API 404 and resolve to the scoped article Not Found UI.
- **Responsive and accessibility**: Article lists and details use the existing 8px/token system, stable media geometry, semantic article/time/list/table markup, one page-level `h1`, visible focus states, accessible loading/error/empty states, responsive images, wrapping Breadcrumbs, and reduced-motion behavior.
- **SEO preserved**: Existing title, description, canonical, hreflang, html lang, Open Graph, BlogPosting JSON-LD, datePublished/dateModified/author/publisher behavior, and published-only article sitemap remain unchanged.
- **Boundaries preserved**: No API endpoint/DTO/business-logic changes, no Prisma schema/database-structure changes, no public route/slug/query changes, no SEO-generation changes, no Preview Docker architecture changes, no Admin changes, no Tencent Cloud deployment, and no Batch 4B work.

## UI Redesign — Batch 3B: Category & Topic Experience

- **Category lists** (`/zh/categories`, `/en/categories`): Replaced the flat equal-card grid with a real hierarchy browser built from the existing category payload (`parentId`, API order, translations, icon, and `emojiCount`). Parent rows expand/collapse through dedicated `aria-expanded` / `aria-controls` buttons; orphaned, self-referential, or cyclic structures degrade to safe roots instead of crashing.
- **Category detail** (`/zh/categories/[slug]`, `/en/categories/[slug]`): Added the shared `CategoryDetailView` with Breadcrumb JSON-LD, real parent/child navigation, existing category pagination, the Batch 3A Emoji grid/copy actions, related topics, recommendation-backed categories, and recommendation-backed articles. Category list/recommendation failures are secondary and do not replace a successfully loaded category.
- **Topic lists** (`/zh/topics`, `/en/topics`): Added the shared browse header with real totals/page state and redesigned `TopicCard` into a two-column content card using the existing title, summary, topic type, publish date, cover URL, slug, and API order. `TopicCover` keeps real images and provides a local neutral fallback for missing/broken covers.
- **Topic detail** (`/zh/topics/[slug]`, `/en/topics/[slug]`): Added the shared `TopicDetailView` with Breadcrumb JSON-LD, real type/date/summary/content/FAQ, the saved Emoji binding order, categories derived only from bound Emoji category relations, related topics, and recommendation-backed articles. Empty associations are explicit without invented counts or content.
- **Route states and shared navigation**: Added localized list/detail loading and error boundaries, category/topic detail not-found states, pagination overflow hardening, long Breadcrumb wrapping, and token-aligned related-category/topic sections.
- **Responsive and accessibility**: Validated zh/en list/detail routes at 375, 430, 768, 1024, and 1440px with no horizontal overflow. Category tree keyboard/ARIA state, semantic headings/nav/regions, loading busy states, focus-visible, reduced-motion behavior, and mobile touch targets are retained.
- **Copy verification**: Reused the Batch 3A `EmojiCard` copy path without adding a second handler. One local topic-detail copy click produced one success toast and increased `copy_events` by exactly one.
- **Boundaries preserved**: No API endpoint/DTO/business-logic changes, no Prisma schema/database changes, no public route/slug/query changes, no SEO-generation changes, no Preview Docker architecture changes, no Admin changes, no Tencent Cloud deployment, and no Batch 4 work.

## UI Redesign — Batch 3A: Search & Emoji Experience

- **Search pages** (`/zh/search`, `/en/search`): Rebuilt the operational search layout around the existing `q`, `type`, and `page` parameters. Added desktop segmented filters, a mobile result-type popover, real clear-filter actions, compact pagination, URL history entries, popstate handling, request-race protection, and localized loading/empty/error/retry states.
- **Typed search results**: Restyled `SearchResultCard` for the existing emoji/category/topic/article union. Emoji results expose real character/name/meaning/keywords/shortcode/category fields plus isolated copy and detail actions; all other types retain their real fields and original links without emoji-only actions.
- **Emoji browser** (`/zh/emojis`, `/en/emojis`): Added a focused library header using the real list total/page metadata, a stable responsive grid, and a 220px unified Emoji card with accessible emoji names, independent details/copy controls, and graceful missing-field behavior.
- **Emoji detail** (`/zh/emoji/[slug]`, `/en/emoji/[slug]`): Reorganized the existing detail payload into a prominent emoji hero, primary copy action, locale counterpart link, copyable-value panel, definition-list technical data, meanings/usage, examples, keywords, FAQ, licensed assets, related emojis, and related topics. Missing fields remain hidden.
- **Copy behavior**: Added one shared `useCopyAction` path for `CopyButton`, `CopyArea`, and `CopyValueButton`. Each action calls the clipboard helper once, records one fire-and-forget copy event only after success, and sends a success/error variant to the single globally mounted accessible Toast container.
- **Route states**: Added scoped loading and error boundaries for search, emoji lists, and emoji details, plus localized emoji not-found states. Skeletons use stable result/grid/detail geometry and announce busy state to assistive technology.
- **Boundaries preserved**: No API endpoint/DTO/business-logic changes, no Prisma schema/database changes, no route/slug/query changes, no SEO generation changes, no Preview Docker changes, no Admin changes, no Batch 3B category/topic page work, and no deployment.

## UI Redesign — Batch 2: Homepage, Navigation & Global Search

- **Command Palette** (`apps/web/src/components/CommandPalette.tsx`): New Raycast-style global search overlay. `CommandPaletteProvider` mounts a global ⌘K/Ctrl+K listener and restores focus to the trigger element on close via `triggerRef`. `useCommandPalette()` exposes a safe no-op `open()` for non-provider contexts. The overlay performs debounced (220ms) `search(locale, q, {type:'all', limit:12})`, supports ↑/↓/Enter/Esc keyboard navigation, quick-link shortcuts when empty, and Skeleton/Empty/Error states. Emoji selection fires `recordCopyEvent` + `showToast(..., 'success')`. zh/en label maps: `PALETTE_LABELS`, `TYPE_LABELS`, `QUICK_LINKS`.
- **HomeHero** (`apps/web/src/components/HomeHero.tsx`): New client component. macOS/Raycast-style primary search box (focus ring `ring-accent-subtle`, clear button, ⌘K hint), secondary "open command palette" button, and quick-browse chips linking to the real `/emojis`, `/categories`, `/topics`, `/articles` pages. Soft low-saturation radial-gradient accent (decorative). zh/en copy via `COPY` and `TYPE_CHIPS` maps.
- **Homepages** (`apps/web/src/app/zh/page.tsx`, `apps/web/src/app/en/page.tsx`): Rewritten to `HomeHero` + `DiscoverySection` + CTA. Removed the fake "即将上线 / Coming soon" ToolCard section. Preserved `getDiscovery(locale)` + `ErrorState` fallback and all existing metadata.
- **Header** (`apps/web/src/components/Header.tsx`): Desktop search button and mobile search icon now trigger the Command Palette (`useCommandPalette().open`) instead of navigating to the search page. All real nav links, language switcher, and mobile drawer are unchanged; aria-labels preserved.
- **DiscoverySection** (`apps/web/src/components/DiscoverySection.tsx`): Upgraded to `SectionHeader` with token-styled "view all" links; container `max-w-content-wide`; spacing `space-y-14`. Preserved conditional rendering (no empty/undefined blocks) and all `getDiscovery` links.
- **Card tokens** (`EmojiCard`, `CategoryCard`, `TopicCard`, `ArticleCard`): Unified to `bg-surface rounded-lg border-border-subtle hover:border-border hover:shadow-sm` with `focus-visible` ring on links. `TopicCard` uses the `Badge` component for its type label; `ArticleCard` cover fallback uses `from-accent-subtle to-bg-muted`. `group-hover:text-accent` replaces the old blue/purple hover. Light + dark mode verified.
- **CopyButton** (`apps/web/src/components/CopyButton.tsx`): Aligned to design tokens (surface bg, border tokens, success state uses `bg-success-subtle text-success`); copy success now calls `showToast(..., 'success')`; copy failure calls `'error'`. `recordCopyEvent` remains fire-and-forget.
- **Toast unification** (`apps/web/src/components/Toast.tsx`): The legacy file is now a thin compatibility shim that re-exports `showToast`/`ToastContainer` from `@/components/ui/Toast`. This wires previously dead copy-feedback (old container was never mounted) back to the live mounted container, and eliminates the duplicate toast implementation — without touching detail-page call sites (`CopyArea`, `CopyValueButton`).
- **Layout** (`apps/web/src/app/layout.tsx`): Wrapped children in `CommandPaletteProvider` so ⌘K works app-wide; body classes switched to `bg-bg text-text-primary`.
- **No API changes**, **no Prisma schema changes**, **no database changes**, **no route modifications**, **no SEO changes**, **no Admin changes**, **no Preview Docker changes**. All real data sources, search params, search logs, analytics, copy events, discovery, recommendations, Meilisearch/DB fallback, multi-locale routing, canonical/hreflang/JSON-LD/metadata/sitemap/robots/noindex, Auth/RBAC preserved.

## UI Redesign — Batch 1: Design System & Global Shell

- **Design Tokens**: Established complete CSS variable system with 20+ tokens covering background, surface, text hierarchy, borders, semantic colors (accent/success/warning/danger), shadows, header surface; full light + dark mode token sets.
- **Tailwind Config** (`apps/web/tailwind.config.js`): Extended with custom colors (bg/surface/text/border/accent), border-radius scale (10–24px + pill), shadow levels (xs–glow + card-hover), blur levels (header/popover/modal), transition durations (fast/normal/slow), animation keyframes (fadeIn/Out, slideUp/Down, scaleIn, toastIn/Out, slideRight/LeftIn), z-index layers, font-size scale (2xs–5xl), max-width tokens, system font stack. `darkMode: 'class'` enabled for future dark mode support.
- **Tailwind Config** (`apps/admin/tailwind.config.js`): Extended with admin-specific tokens (admin-bg/admin-sidebar colors), matching radius/shadow/font scales, and utility component classes (admin-card/admin-input/admin-btn-*/admin-badge-*/admin-table*).
- **Global CSS** (`apps/web/src/app/globals.css`): Complete rewrite with CSS variable definitions (light + dark), base layer (font smoothing, focus-visible, selection color, reduced-motion, skip-to-content), component layer placeholder.
- **Admin Global CSS** (`apps/admin/src/app/globals.css`): Extended with base layer styles and reusable utility classes for cards, inputs, buttons, badges, tables.
- **Header** (`apps/web/src/components/Header.tsx`): Full redesign — macOS-style semi-transparent backdrop-blur header with scroll shadow detection; clear navigation active state with bottom indicator pill; desktop search button with ⌘K shortcut hint; responsive mobile hamburger menu with slide-out drawer panel; Escape key to close mobile menu; language switcher integrated; all original link addresses preserved; client component with proper accessibility.
- **Footer** (`apps/web/src/components/Footer.tsx`): Full redesign — clean grouped layout (Browse/Search/About/Language); subtle top border; proper link hover states; language toggle showing current locale; copyright and Unicode attribution preserved; no fake social accounts or features added.
- **Base Component Library** (`apps/web/src/components/ui/`): Created 22 components:
  - Layout: `PageContainer`, `SectionHeader`, `SurfaceCard`
  - Buttons: `PrimaryButton`, `SecondaryButton`, `GhostButton`, `IconButton`
  - Input: `SearchField`, `FilterChip`, `SegmentedControl`
  - Display: `Badge`, `StatusBadge`, `Tooltip`
  - Feedback: `ToastContainer/showToast` (with variant support: default/success/warning/error), `Dialog` (focus trap + Escape close), `Drawer` (slide animation)
  - State: `LoadingSkeleton` (+ Card/List/Table patterns)
- **Upgraded Components**: `EmptyState`, `ErrorState` (new button styling), `Pagination` (new selected state with solid bg), `Breadcrumb` (new text tokens).
- **Admin Framework**: Upgraded root layout (antialiased body, refined bg); redesigned AdminLayout with refined sidebar (subtle borders, better active state), new topbar (backdrop blur, page title indicator), consistent spacing.
- **Documentation**: Created comprehensive `docs/ui/UI_DESIGN_SYSTEM.md` covering design philosophy, all tokens, radius/shadow/type/spacing/motion specs, dark mode rules, accessibility requirements, component catalog, z-index layers, responsive breakpoints, prohibited patterns, and future batch reuse guide.
- **No API changes**, **no Prisma schema changes**, **no database changes**, **no route modifications**, **no deployment**.

## Phase 7C (preparation — 7C-1 only)

- Turned `docker-compose.preview.yml` from a template into an **executable** compose: `nginx`/`web`/`admin`/`api`/`postgres` always up, `meilisearch` behind the optional `search` profile; three-port Nginx access (`:80` web, `:8081` admin, `:8082` api); required-var guards (`${VAR:?...}`), `service_healthy` ordering, healthchecks, json-file log rotation, named volumes.
- `apps/api/Dockerfile`: multi-stage NestJS build that compiles the `types`→`shared`→`api` workspace `dist` it imports at runtime; non-root `appuser`; regenerates the Prisma client; runs `prisma`/`tsx` via direct binaries (no pnpm workspace deps-check); no `.env`/secrets in image.
- `apps/web/Dockerfile` & `apps/admin/Dockerfile`: Next.js `standalone` multi-stage builds; bake `NEXT_PUBLIC_*` (public only) at build time; non-root `nextjs` user; build the `shared`/`types` `dist` they consume.
- Added `typescript` as `devDependency` to `packages/types`, `packages/shared`, `packages/ui` so workspace builds resolve `tsc` self-contained.
- Added `.dockerignore` (excludes `.git`, `node_modules`, `.next`, `dist`, logs, all real `.env*`, local DB/Meili data; keeps `*.example`).
- `nginx/preview.conf.template`: official envsubst template; three server blocks, `server_tokens off`, WebSocket upgrade, `X-Forwarded-*`, `client_max_body_size 20m`, `X-Robots-Tag: noindex, nofollow, noarchive` on every port; `server_name _`; no HTTPS/cert; no PG/Meili exposure.
- `scripts/preview/*`: `validate-env`, `config`, `build`, `up`, `down`, `status`, `logs`, `migrate`, `seed` — `set -euo pipefail`, no secret output, check `.env.preview` + required vars, use `docker compose -f docker-compose.preview.yml -p <project>`, `prisma migrate deploy`, explicit idempotent seed; `down` preserves volumes.
- `package.json`: added `preview:validate/config/build/up/down/status/logs/migrate/seed` wrappers (existing scripts untouched).
- `nginx/preview.conf.example` rewritten as a reference doc pointing to the template.
- Local Docker validation passed with a throwaway project + random test credentials: `compose config`; build `web`/`admin`/`api`; `up`/`ps`/health; `migrate` (`prisma migrate deploy`) + `seed`; Web (`/`, `/zh/`, `/en/`, `/zh/search?q=开心`, `/en/search?q=happy`, `/robots.txt`, `/sitemap.xml`); Admin (login redirect, `/admin/search/infrastructure`, `/admin/search/analytics`); API (`/health`, `/status` → `database:connected`, `/search` provider `database`, `/discovery/home`, `/recommendations`, admin endpoints 401); `X-Robots-Tag` noindex on all three ports; Postgres/Meilisearch not on host ports; optional Meilisearch profile config-valid + boots healthy; DB fallback (`SEARCH_PROVIDER=meilisearch` with Meili down → `fallbackUsed:true`); secret scan clean (no test creds in repo, `.env.*` gitignored, no secrets in images, no DB URL in logs).
- Docs: added `docs/deployment/phase-7c-preview-docker-deployment.md` and `docs/deployment/tencent-cloud-preview-server-checklist.md` (placeholders only).
- **Phase 7C-2 (real Tencent Cloud deployment) NOT performed**: no real server connected, no SSH, no security-group change, no DNS, no real IP/domain/password/JWT/Meili-key/PAT, no real `.env.preview`, no `phase-7c-complete` tag, HANDOFF remains Phase 7B completed.

## Phase 7B

- Replaced `apps/api/src/main.ts` hardcoded localhost CORS with env-driven `buildAllowedCorsOrigins()` (reads `CORS_ORIGIN` / `ADMIN_ALLOWED_ORIGINS` / `WEB_BASE_URL` / `ADMIN_BASE_URL`)
- Multi-origin support: comma-separated, auto trim, ignore empty values, dedupe; falls back to `localhost:3000/3001` when all empty (local dev works out of the box)
- No `*` with credentials: non-allowlisted origins rejected, allowlisted origins echoed explicitly
- Moved cookie `secure`/`domain` to `resolveCookieSecure()` / `resolveCookieDomain()` reading `COOKIE_SECURE` / `COOKIE_DOMAIN` (explicit priority; default true in production/preview, false in local dev; empty domain → browser default)
- Removed weak JWT_SECRET `'change_me'` default in `admin.module.ts`: fail-fast in production/preview when missing, dev-only warned placeholder otherwise
- Added `apps/api/src/common/security-config.ts` config helper (no sensitive value logged)
- Updated `.env.example` with Phase 7B variables (`CORS_ORIGIN`, `ADMIN_ALLOWED_ORIGINS`, `WEB_BASE_URL`, `ADMIN_BASE_URL`, `API_BASE_URL`, `COOKIE_SECURE`, `COOKIE_DOMAIN`, `RATE_LIMIT_ENABLED`, `PREVIEW_NOINDEX`)
- Updated `.env.preview.example` (marked Phase 7B implemented; `APP_ENV=preview`, `API_BASE_URL`, `PREVIEW_NOINDEX` added)
- Added `.env.production.example` template (placeholders only, not committed)
- Hardened `.gitignore` to ignore all real `.env*` variants (`.env`, `.env.local`, `.env.preview`, `.env.production`, `.env.development`, `.env.staging`, `.env.*.local`) while keeping `.env.example` / `.env.preview.example` / `.env.production.example` committable
- Documented preview noindex/robots strategy via `PREVIEW_NOINDEX=true` + Nginx `X-Robots-Tag: noindex` + `robots.txt` Disallow (no SEO submission, no domestic CDN)
- Added docs/deployment/phase-7b-preview-config-hardening.md
- Updated docs/deployment/preview-environment-strategy.md and phase-7a-preview-architecture.md (Phase 7B items marked landed)
- Did NOT deploy, did NOT connect real servers, did NOT write real IP/password/token/JWT/Meili-key/PAT, did NOT submit `.env`/`.env.preview`/`.env.production`, did NOT modify business functionality, did NOT modify Prisma schema, did NOT convert to pure static site
- pnpm install/db:generate/lint/typecheck/build all green

## Phase 7A

- Added preview deployment architecture plan (docs/deployment/phase-7a-preview-architecture.md)
- Added Tencent Cloud domestic small-server preview deployment strategy
- Added unfiled-domain and ICP risk notes for domestic-server preview
- Added preview Docker Compose plan (docs/deployment/preview-docker-plan.md + docker-compose.preview.yml template)
- Added preview environment variable strategy (.env.preview.example template + preview-environment-strategy.md)
- Added preview security and SEO strategy (preview-security-and-seo.md): noindex, no domestic CDN, no SEO submission, admin not public
- Added overseas and domestic production path options (production-path-options.md): Route A (overseas/no-ICP) and Route B (domestic/ICP+CDN)
- Compared three preview access modes: IP+port, preview subdomain, SSH tunnel/internal
- Compared web/admin/api routing modes (subdomain recommended vs single-domain path)
- Documented resource sizing: 1C2G close Meilisearch (DB fallback), 2C4G full stack, swap, container memory limits
- Confirmed API CORS is hardcoded to localhost and must be env-driven (CORS_ORIGIN) in Phase 7B
- All templates use placeholders only — no real IP/password/token/JWT/Meili-key/PAT written
- Did NOT deploy, did NOT connect real servers, did NOT modify business code or Prisma schema, did NOT convert to pure static site
- pnpm install/db:generate/lint/typecheck/build all green

## Phase 6F

- Completed Phase 6 final acceptance
- Verified Phase 6A search infrastructure planning (SearchProvider interface, DatabaseSearchProvider, MeilisearchSearchProvider, SearchService DI+fallback, infrastructure status API/page)
- Verified Phase 6B Meilisearch integration (Docker service, SDK, SearchIndexService, index rebuild/settings/status APIs, audit_logs, published-only indexing)
- Verified Phase 6C advanced search UX (SearchResultsView, typed results, type filter, safe highlighting, loading/empty/error/fallback states, copy, result links, locale/SEO boundary)
- Verified Phase 6D discovery and recommendations (Discovery API, Recommendation API with 400/404, published-only, keyword-overlap, DiscoverySection/RelatedCategories, homepage integration)
- Verified Phase 6E search analytics and tuning (admin analytics page, overview/queries/no-results/provider-health APIs, rule-based tuning, 401/403 auth, noindex)
- Verified database fallback (Meilisearch stop → search works via database)
- Verified sitemap and robots boundaries (no /admin, no /api/v1/admin, robots blocks admin)
- Verified security boundaries (no passwordHash/JWT_SECRET/Meilisearch API key/plaintext IP in any API response)
- pnpm install/db:generate/db:migrate/db:seed/lint/typecheck/build all green
- No AI content generated, no personalized recommendations, no user profiling, no pure static site conversion

## Phase 6E

- Added admin Search Analytics module (Phase 6E) under `admin/search/analytics`, read-only aggregations over `search_logs` (no writes, no AI):
  - `GET /api/v1/admin/search/analytics/overview` — totalSearches / todaySearches / zeroResultSearches / zeroResultRate / searchesByLocale / topQueries / topZeroResultQueries / recentSearches / providerStatus / rule-based tuningSuggestions.
  - `GET /api/v1/admin/search/analytics/queries` — query-level analytics grouped by (query, locale) with count / avgResultCount / zeroResultCount / lastSearchedAt; filters page / limit / locale / q / hasResults / dateFrom / dateTo.
  - `GET /api/v1/admin/search/analytics/no-results` — zero-result analytics grouped by (query, locale) with count / lastSearchedAt / suggestedAction; filters page / limit / locale / dateFrom / dateTo.
  - `GET /api/v1/admin/search/analytics/provider-health` — live Meilisearch / database fallback snapshot (currentProvider / fallbackProvider / meilisearchConfigured / meilisearchReachable / indexReady / documentCount / fallbackRecommended / notes), reusing SearchService + SearchIndexService. No API key leaked.
- Added rule-based `tuningSuggestions` (no AI, no ML, no content auto-generation): high zero-result rate, frequent zero-result queries, zh/en zero-result imbalance, Meilisearch unreachable, index not ready.
- Added conservative `POST /api/v1/admin/search/analytics/tuning/apply-settings` (super_admin only) that re-applies the Phase 6B settings via SearchIndexService and writes `audit_logs` `search.tuning_settings_update`; returns `available:false` when Meilisearch is not configured. No core ranking logic changed, no content auto-rewritten.
- Added admin page `/admin/search/analytics` (noindex, inherits admin root layout): overview cards, locale distribution, provider-support note, top queries / zero-result queries, recent searches (no plaintext IP / ipHash / userAgent), query analytics table, no-result analytics table, provider-health summary, tuning suggestions, and (super_admin only) a conservative tuning-apply button.
- Added role helpers `canViewSearchAnalytics` (super_admin / editor / seo_manager / analyst) and `canManageSearchTuning` (super_admin); all analytics endpoints are admin-auth-guarded (401 when unauthenticated, 403 when insufficient role).
- Security: no plaintext IP, no passwordHash, no JWT_SECRET, no Meilisearch API key in any analytics response; `searchesByProvider` and `topCopiedAfterSearch` are explicitly reported as unsupported (no per-request provider recorded; no session linkage between search and copy events).
- Preserved Phase 6B Meilisearch provider / database fallback, Phase 6C Advanced Search UX, Phase 6D Discovery / Recommendation, and Phase 5 sitemap / robots / indexing; `/admin/search/analytics` remains noindex and is not in any sitemap; did not modify Prisma schema.
- `lint` / `typecheck` / `build` green.
- Did NOT develop AI auto-tuning, did NOT develop personalized recommendations, did NOT develop user profiling, did NOT bulk-generate low-quality pages, did NOT change core ranking logic, did NOT convert to a pure static site.

## Phase 6D

- Added public read-only discovery API `GET /api/v1/discovery/home` returning `featuredEmojis` / `featuredCategories` / `featuredTopics` / `latestArticles` (all `published`-only, no admin fields, no `passwordHash` / `JWT_SECRET` / plaintext IP).
- Added public read-only recommendation API `GET /api/v1/recommendations` with `entityType` (`emoji` / `category` / `topic` / `article`), `slug`, `locale`, and `limit`:
  - Invalid `entityType` → `400`; missing / non-existent `slug` → `404`; invalid / missing `locale` → graceful fallback to default (`en`); `limit` default `8`, capped at `20`.
  - Returns `relatedEmojis` / `relatedCategories` / `relatedTopics` / `relatedArticles` (inapplicable types return empty arrays).
- Recommendation rules (simple, explainable, no AI): emoji → same-category + same-topic + keyword-near emojis (exclude self, 8–12); category → child/sibling categories + related topics + keyword-related articles; topic → bound emojis + shared-emoji topics + keyword-related articles; article → keyword-related articles + topics + emojis. Only `published` content, never `draft` / `archived`.
- Recommendation logic is **database-only** (pure Prisma, keyword-overlap token scoring). Meilisearch is NOT a hard dependency: recommendations keep working when Meilisearch is down, and public pages never crash on recommendation failure (frontend silently degrades to empty).
- Added `DiscoveryModule` and `RecommendationModule` (new `@Controller('discovery')` / `@Controller('recommendations')`, public, no admin guard) and registered them in `AppModule`.
- Frontend: added `DiscoverySection` + `RelatedCategories` components; added `getDiscovery()` / `getRecommendations()` API wrappers and `DiscoveryHomeData` / `RecommendationData` types.
- Homepage (`/zh/`, `/en/`) now renders the discovery module (featured emojis / categories / topics / latest articles) via `DiscoverySection`.
- Category detail pages (`/zh/categories/[slug]`, `/en/categories/[slug]`) show related categories (children / siblings) and related articles from the recommendation API.
- Topic detail pages (`/zh/topics/[slug]`, `/en/topics/[slug]`) show related articles from the recommendation API.
- Emoji / article detail pages keep their existing related modules (Phase 6C / 5C); recommendations API is available for all four entity types.
- Added read-only admin page `/admin/discovery` (auth-guarded via `(admin)` group, `noindex` via root layout) showing discovery / recommendation API status, supported entity types, current recommendation rules, and Meilisearch assist / fallback status (reuses `/api/v1/admin/search/infrastructure/status`).
- Preserved SEO / sitemap boundaries: recommendations are page-content only; no new sitemap / robots entries; recommendation result pages are not indexed; `/admin/*` remains `noindex`.
- Preserved Phase 6B Meilisearch provider / database fallback, Phase 6C Advanced Search UX, and Phase 5 sitemap / robots / indexing; did not modify Prisma schema.
- `lint` / `typecheck` / `build` green.
- Did NOT develop Phase 6E search analytics, did NOT tune search analytics, did NOT generate AI content, did NOT develop personalized recommendations, did NOT develop user profiling, did NOT bulk-generate low-quality pages, did NOT convert to a pure static site, did NOT modify Prisma schema.

## Phase 6C

- Added advanced public search UX on top of the Phase 6B Meilisearch/database search: refactored `/zh/search` and `/en/search` into a unified `SearchResultsView` client component (server reads `searchParams` for first-paint SSR; client handles type filter, pagination, and loading/empty/error/fallback states).
- Added typed search result display across emoji / category / topic / article, each rendered as a dedicated card with correct detail-page links (`/{locale}/emoji|categories|topics|articles/{slug}`).
- Added search `type` filter (`all` / `emoji` / `category` / `topic` / `article`) with per-type counts from `meta.totalByType`; URL synced via `history.replaceState` on client filter/page change.
- Added safe highlighting using React text-node splitting (query regex-escaped, case-insensitive); no `dangerouslySetInnerHTML`, no XSS risk.
- Added one-click copy of emoji from search result cards.
- Surfaced transparent provider/fallback status in response `meta` (`provider` = `database`|`meilisearch`, `fallbackUsed`); preserved Meilisearch/database fallback and search-log recording (query, locale, resultCount unchanged).
- Added API compatibility: `GET /api/v1/search` accepts optional `type`; response `data[]` is `UnifiedSearchResultItem` union with `meta.totalByType`, while keeping the legacy emoji-shaped `SearchResultItem`.
- Preserved SEO boundary: `/zh/search` `/en/search` base indexable; `?q=` results `noindex, follow` with canonical/hreflang consolidated to base; `/admin` still `noindex`; not converted to a pure static site.
- Updated README / PROJECT_HANDOFF / CHANGELOG for Phase 6C.
- Did NOT develop Phase 6D recommendation system, did NOT tune search analytics, did NOT generate AI content, did NOT bulk-generate low-quality pages, did NOT modify Prisma schema, did NOT convert to a pure static site.

## Phase 6B

- Added `meilisearch` Docker service to `docker-compose.yml` (image `getmeili/meilisearch:v1.8`, container `emoji-meilisearch`, port 7700, `MEILI_ENV=development`, `MEILI_MASTER_KEY` sourced from `MEILISEARCH_API_KEY` placeholder, persisted `meilisearch_data` volume).
- Added `meilisearch` SDK dependency to `apps/api`.
- Implemented real `MeilisearchSearchProvider` implementing the `SearchProvider` interface: supports `q` / `locale` / `limit`; filters public search to `type = 'emoji'` (compatible response shape with `/api/v1/search`); records `search_logs` exactly once; throws a recognizable error on Meilisearch failure.
- `SearchService` selects the active provider and transparently falls back to the database provider when Meilisearch fails; fallback logging never prints the API key or secret.
- Implemented `SearchIndexService` with `rebuildAll` / `rebuildEntity` / `indexDocument` / `deleteDocument` / `getIndexStatus` / `configureIndexSettings`; indexes only `published` emoji / category / topic / article into the single index `emoji_platform_search` (composite `documentId` = `{type}:{locale}:{id}`); never indexes Asset, draft / archived, or admin content; no sensitive fields; safe to re-run; does not mutate the database.
- Configured Meilisearch settings: `searchableAttributes` (emojiChar, shortcode, title, keywords, aliases, unicodeCodepoint, slug, description, categoryNames, topicTitles, summary), `filterableAttributes` (type, locale, status), `sortableAttributes` (updatedAt, publishedAt), default ranking rules.
- Unified Meilisearch env naming: `.env.example` uses `MEILISEARCH_API_KEY` / `MEILISEARCH_INDEX_PREFIX` / `SEARCH_PROVIDER`; `docker-compose.yml` passes `MEILISEARCH_API_KEY` to both the meilisearch and api services; empty/missing Meilisearch vars do not crash startup and fall back to database.
- Extended `GET /api/v1/admin/search/infrastructure/status` with real Meilisearch status (`meilisearchReachable`, `indexName`, `indexReady`, `documentCount`).
- Added admin search index APIs: `POST /api/v1/admin/search/index/rebuild` (`{"entityType":"all"|"emoji"|"category"|"topic"|"article"}`), `GET /api/v1/admin/search/index/status`, `POST /api/v1/admin/search/index/settings`.
- Added role checks via `role.util.ts`: `canViewSearchInfrastructure` (super_admin/editor/seo_manager/analyst), `canManageSearchIndex` (super_admin/editor), `canManageSearchSettings` (super_admin); 401 when unauthenticated, 403 when insufficient role.
- Added audit logs for search index operations: `search.index_rebuild` and `search.index_settings_update` (entityType=`search`, entityId=indexName, no API key / passwordHash / JWT_SECRET / plaintext IP).
- Updated `/admin/search/infrastructure` page: live index status, rebuild-all / per-entity buttons, apply-settings button, last-result table, error display, and security-boundary notes; no API key shown.
- Updated README / PROJECT_HANDOFF / CHANGELOG for Phase 6B.
- Did NOT develop advanced search UX, did NOT develop recommendation/autocomplete, did NOT develop search analytics tuning, did NOT generate AI content, did NOT bulk-generate pages, did NOT index Asset, did NOT modify Prisma schema, did NOT convert to a pure static site.

## Phase 6A

- Added search provider abstraction (`apps/api/src/modules/search/`): `SearchProvider` interface, `search.types.ts`, `search.config.ts`.
- Added `DatabaseSearchProvider` as the default provider, preserving existing database search behavior (locale-aware, published-only, paginated, search-log recording).
- Added `MeilisearchSearchProvider` as a Phase 6B stub (`isAvailable()` returns false, no SDK, no connection, no real index).
- `SearchService` now selects the provider from config and falls back to database when Meilisearch is unavailable; public `search()` signature unchanged.
- Added search infrastructure status API `GET /api/v1/admin/search/infrastructure/status` (admin-auth-guarded, read-only, no secret leakage).
- Added search infrastructure admin page `/admin/search/infrastructure` (inherits admin `noindex, nofollow`).
- Added search index planning documentation `docs/search-infrastructure-plan.md` (entities, fields, multilingual strategy, ranking strategy, fallback, Phase 6B boundary).
- Added Meilisearch configuration placeholders to `.env.example` (`SEARCH_PROVIDER=database`, `MEILISEARCH_API_KEY`, `MEILISEARCH_INDEX_PREFIX`); empty Meilisearch vars do not cause startup failure.
- Preserved existing database search behavior; public `/zh/search` and `/en/search` unaffected.
- Did NOT integrate Meilisearch, did NOT install Meilisearch SDK, did NOT start Meilisearch container, did NOT create real search indexes, did NOT build advanced search UI, did NOT build recommendation algorithms, did NOT modify Prisma schema, did NOT refactor the whole frontend search, did NOT break Admin CMS / sitemap / robots / indexing, did NOT generate AI content, did NOT bulk-generate pages, did NOT convert to a pure static site.

## Phase 5E

- Completed Phase 5 final acceptance (verified Phase 5A–5D outcomes end-to-end).
- Verified sitemap and robots automation: `/sitemap.xml` index + `static` / `emojis` / `categories` / `topics` / `articles` sub-sitemaps all return `200` with valid XML, exclude `/admin`, `/api/v1/admin/`, `draft`, `archived`, `undefined`, `null`; `robots.txt` allows public pages, disallows `/admin/` and `/api/v1/admin/`, and references the sitemap via `NEXT_PUBLIC_SITE_URL`.
- Verified public article pages: list/detail return `200`; Article API returns `published` only; missing / draft / archived return `404`; canonical / hreflang / `html lang` / `BlogPosting` JSON-LD correct and free of `undefined` / `null`.
- Verified SEO quality checker: `/admin/seo/quality` and `/admin/seo/quality/issues` require auth (`401` unauthenticated, `403` insufficient), `overview` / `issues` return `200`, `run` is read-only (does not rewrite content), 11 issue types present.
- Verified internal linking: `/admin/seo/internal-links/suggestions` returns real, existing links (articles + topics), excludes draft / archived, no AI, no Meilisearch.
- Verified structured data: metadata / canonical / hreflang / JSON-LD contain no `undefined` / `null`, do not fabricate author / date / image; sitemap and canonical are consistent.
- Verified crawl budget boundaries: search query result pages emit `noindex, follow` and are excluded from sitemap; draft / archived return `404`; admin is `noindex, nofollow` and excluded from sitemap.
- Verified public web pages (20 paths) and admin pages (12 paths): correct `200` / `404` behavior, no `undefined` / `null` in visible content, admin `noindex`, unauthenticated admin access client-redirects to `/admin/login`.
- Verified security boundaries: `apps/web` and `apps/admin` never import `@prisma/client`; API responses do not leak `passwordHash` / `JWT_SECRET` / plaintext IP; no Meilisearch integration; no AI content generation; not converted to a pure static site; no competitor code / UI / content / assets copied.
- Ran command acceptance: `pnpm install`, `pnpm db:generate`, `pnpm db:migrate`, `pnpm db:seed`, `pnpm lint`, `pnpm typecheck`, `pnpm build` — all passed with 0 errors and 0 warnings.
- Did NOT develop Phase 6, did NOT add new business modules, did NOT integrate Meilisearch, did NOT generate AI content, did NOT bulk-generate low-quality content, did NOT convert to a pure static site, did NOT refactor Admin CMS / Web frontend, did NOT copy competitor code / UI / content / assets, did NOT modify Prisma schema.

## Phase 5D

- Hardened public page metadata (title / description / canonical never undefined / null via `safeText` / `optionalText`).
- Hardened canonical and hreflang handling (zh canonical → zh, en canonical → en; hreflang outputs zh / en / x-default with x-default defaulting to en).
- Hardened JSON-LD structured data (`BreadcrumbList` + `FAQPage` / `BlogPosting` via `apps/web/src/lib/seo.ts`; no undefined / null keys; URLs from `NEXT_PUBLIC_SITE_URL`; no fabricated fields).
- Verified sitemap and robots crawl boundaries (`/sitemap.xml` index + `static / emojis / categories / topics / articles` sub-sitemaps exclude `/admin`, `/api/v1/admin/`, draft / archived, and undefined; `robots.txt` blocks `/admin/` and `/api/v1/admin/` and references the sitemap).
- Fixed missing / draft / archived public detail pages to return HTTP 404 (emoji / category / topic / article detail pages now use `ApiError.status === 404` + `notFound()` instead of a fragile message check).
- Added `noindex, follow` to search query result pages (`/zh/search?q=...`, `/en/search?q=...`) with canonical / hreflang consolidated to the base search page to protect crawl budget.
- Verified admin exclusion from sitemap and `noindex,nofollow` on `/admin/*`.
- Verified public page performance basics (no Prisma access from `apps/web` or `apps/admin`; no Admin code in public pages; images carry `alt`; list-page canonicals consolidate pagination).
- Verified SEO Quality Checker compatibility (endpoints intact and guarded; published-only data source; no draft / archived; no undefined / null in JSON-LD).
- Did NOT convert to a pure static site, did NOT integrate Meilisearch, did NOT generate AI content, did NOT add new CMS CRUD, did NOT break Admin CMS / Sitemap / public pages.
- `lint` / `typecheck` / `build` green.

## Phase 5C

- Added SEO quality checker overview backend (`AdminSeoQualityService` + `AdminSeoQualityController` under `admin/seo`).
- Added `GET /api/v1/admin/seo/quality/overview`: total checked, passed count, issue/warning counts, issues by entity type, issues by issue type, and recent issues.
- Added `GET /api/v1/admin/seo/quality/issues`: paginated + filterable issue list (page / limit / entityType / issueType / severity / locale / q) with entity summary, issue type, severity, message, recommended action, edit URL, and public URL.
- Added `POST /api/v1/admin/seo/quality/run`: on-demand read-only re-check; never writes to the database or modifies entity data.
- Added `GET /api/v1/admin/seo/internal-links/suggestions`: basic internal-link suggestions for an entity (related emoji / category / topic / article) computed from existing published data by keyword/title overlap — no AI, no Meilisearch, no content rewriting.
- Implemented 11 SEO issue types: missingSeoTitle, missingSeoDescription, titleTooShort, titleTooLong, descriptionTooShort, descriptionTooLong, missingCanonicalPreview, missingHreflangPreview, missingJsonLd, sitemapMismatch, noInternalLinks.
- Added admin pages `/admin/seo/quality` (overview) and `/admin/seo/quality/issues` (issue list with filters, pagination, and quick jump to the SEO edit page); added a "SEO 质量检查" entry to the admin sidebar.
- Enhanced public article detail pages (`/zh/articles/{slug}/`, `/en/articles/{slug}/`) with related topics and related emojis modules (keyword-overlap, published-only, excludes draft/archived) via the public `GET /api/v1/articles/{slug}` API.
- Added `canViewSeoQuality` (super_admin / editor / seo_manager / reviewer / analyst) and `canRunSeoQualityCheck` (super_admin / editor / seo_manager) role helpers; all quality endpoints are guarded by `AdminAuthGuard` (401 when unauthenticated, 403 when unauthorized).
- Updated README, PROJECT_HANDOFF.md, and this changelog. `lint` / `typecheck` / `build` green.
- Did NOT build a complex SEO scorer, did NOT auto-rewrite title/description, did NOT bulk-generate content, did NOT integrate Meilisearch, did NOT build search-ranking prediction, did NOT build an outbound-link system, did NOT convert to a pure static site.

## Phase 5A

- Added sitemap index at `/sitemap.xml` (App Router route handler, `force-dynamic`): a `<sitemapindex>`
  referencing `static` / `emojis` / `categories` / `topics` sub-sitemaps; `articles` is intentionally
  omitted until the article frontend pages ship in Phase 5B.
- Added static sitemap `/sitemaps/static.xml`: public landing/listing pages only (`/zh`, `/en`,
  `/zh/emojis`, `/en/emojis`, `/zh/categories`, `/en/categories`, `/zh/topics`, `/en/topics`,
  `/zh/search`, `/en/search`); search *result* pages (`?q=...`) are not bulk-added.
- Added Emoji sitemap `/sitemaps/emojis.xml`: one URL per locale for every `published` emoji, with
  `xhtml:link` hreflang (`zh` / `en` / `x-default`), `lastmod` (entity `updatedAt`), `changefreq=monthly`,
  `priority=0.8`.
- Added Category sitemap `/sitemaps/categories.xml`: published categories, `weekly` / `0.7`.
- Added Topic sitemap `/sitemaps/topics.xml`: published topics, `weekly` / `0.7`.
- Added Article sitemap boundary handling `/sitemaps/articles.xml`: reserved empty `<urlset>` (article
  frontend detail pages are not implemented yet); it is not listed in the sitemap index so crawlers are
  never pointed at non-existent pages. It can be enabled in Phase 5B without API changes.
- Added public read-only sitemap API in `apps/api` (`SitemapModule`, no admin auth):
  `GET /api/v1/sitemap/{emojis,categories,topics,articles}` returns only `published` entities
  (`slug` + `updatedAt` + `createdAt`), supports `limit` (max 50,000) / `offset` for future
  sharding, and never exposes backend fields or `passwordHash`.
- Updated robots rules via dynamic `/robots.txt` (`apps/web` route handler): `Allow: /`,
  `Disallow: /admin/`, `Disallow: /api/v1/admin/`, and `Sitemap: {NEXT_PUBLIC_SITE_URL}/sitemap.xml`
  (no hard-coded production domain).
- Ensured admin routes are excluded from sitemap: `apps/web` never imports Prisma and only fetches
  published public data; `/admin/*` stays `noindex,nofollow` via the admin root layout and is never
  emitted into any sitemap.
- Ensured draft and archived content are excluded from sitemap: all sitemap data is filtered by
  `status = 'published'`; `undefined`/`null` slugs are dropped.
- Linked admin SEO status: `robots-status` / `sitemap-status` now probe the live web routes
  (`/robots.txt`, `/sitemap.xml`) so the `/admin/seo` status reflects the actual dynamic output;
  degrades gracefully when web is not running. No new SEO center features were added.
- Verified architecture constraints: `apps/web` fetches all sitemap data through `apps/api` (no Prisma
  import); no Meilisearch integration; no AI content generation; no pure-static-site conversion.
- Ran `pnpm install`, `pnpm db:generate`, `pnpm db:migrate`, `pnpm db:seed`, `pnpm lint`,
  `pnpm typecheck`, and `pnpm build` — all pass with 0 errors. Did NOT develop article detail pages,
  did NOT bulk-generate low-quality pages, did NOT add a complex SEO scorer.
- Updated README (Phase 5A section), PROJECT_HANDOFF.md (Phase 5A completed, next = Phase 5B), and
  this changelog.

## Phase 5B

- Added public article list pages `/zh/articles/` and `/en/articles/`: published-only listing with
  title, summary, cover image, publish date, pagination, empty state, and mobile-friendly layout.
- Added public article detail pages `/zh/articles/{slug}/` and `/en/articles/{slug}/`: title, summary,
  `content`, cover image, author display name, publish date, and a back-to-list link; related articles;
  `canonical` / `hreflang` (zh / en / x-default) / `html lang` correctly set; `BlogPosting` JSON-LD
  injected (`headline`, `description`, `inLanguage`, `datePublished`, `dateModified`, `image`, `author`,
  `mainEntityOfPage`, `publisher`) with no `undefined`/`null` keys and no fabricated author info.
- Added Article public API in `apps/api` (`ArticlesModule`, no admin auth): `GET /api/v1/articles`
  (list, page/limit/locale) and `GET /api/v1/articles/{slug}` (detail). Both return only `published`
  articles with the requested-locale `translation`, author display name only (no id/email/role), and
  `relatedArticles` (latest published, excluding current). `slug` not found or no translation for the
  requested locale returns `404`; `limit` is capped at `MAX_LIMIT` (100). No `passwordHash`/`JWT_SECRET`
  or admin fields are exposed.
- Added Article SEO metadata: list pages use zh/en `title`/`description` with correct canonical/hreflang
  and are indexable; detail pages use `seoTitle` (fallback `title`) for title and `seoDescription`
  (fallback `summary`) for description, plus Open Graph `publishedTime`/`modifiedTime`/`authors`.
- Enabled Article sitemap: `/sitemaps/articles.xml` now emits one `<url>` per published article with
  zh/en detail URLs, hreflang alternates, `lastmod` (entity `updatedAt`), `changefreq=weekly`,
  `priority=0.7`; `/sitemap.xml` index now includes the `articles` sub-sitemap. `robots.txt` does not
  block article pages; `/admin/*` remains noindex and out of every sitemap.
- Ensured draft and archived articles are excluded from both public pages (404) and the sitemap
  (`status = 'published'` filter). Missing current-locale translation returns 404 instead of rendering
  an empty/undefined page. `apps/web` still never imports Prisma and fetches all data via `apps/api`.
- Added content quality boundary documentation in README: no AI auto-generation, no bulk low-quality
  pages, no copying competitor articles, only published articles with real content are indexed, and all
  future content must follow original / licensed / quality-reviewed rules.
- Ran `pnpm install`, `pnpm db:generate`, `pnpm db:migrate`, `pnpm db:seed`, `pnpm lint`,
  `pnpm typecheck`, and `pnpm build` — all pass with 0 errors. Did NOT develop Phase 5C SEO Quality
  Checker, did NOT build complex internal linking, did NOT integrate Meilisearch, did NOT auto-generate
  AI content, did NOT bulk-generate low-quality pages, did NOT convert to a pure static site.
- Updated README (Phase 5B section, next = Phase 5C), PROJECT_HANDOFF.md (Phase 5B completed, next =
  Phase 5C), and this changelog.

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
