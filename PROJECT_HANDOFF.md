# Emoji Platform Project Handoff

## Current Phase

Phase 3A completed.

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

## Next Phase

Phase 3B - Frontend Basic Pages
