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
