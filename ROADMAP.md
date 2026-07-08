# Roadmap

## Phase 0 - Project Governance and Repository Initialization

- Initialize git repository
- Connect remote repository
- Create handoff and development rule documents
- Create roadmap and changelog
- Push initial commit

## Phase 1 - Monorepo Base Architecture

- pnpm workspace
- apps/web
- apps/admin
- apps/api
- packages/shared
- packages/ui
- packages/types
- Docker Compose
- Environment variables
- Basic health endpoints

## Phase 2 - Database and Prisma

- PostgreSQL
- Prisma
- Core database models
- Seed data
- Emoji import script
- Database health check

## Phase 3A - Public Read-only API

- Emoji list API
- Emoji detail API
- Category API
- Topic API
- Basic search API
- Copy event API

## Phase 3B - Frontend Basic Pages

- Home pages
- Emoji list pages
- Category pages
- Topic pages
- Search page
- Tools placeholder page
- About and license pages

## Phase 3C - Emoji Detail and SEO

- Emoji detail page
- Metadata
- Canonical
- Hreflang
- Breadcrumb schema
- FAQ schema

## Phase 3D - Search and Copy Experience

- Search UX
- CopyButton
- Copy event tracking
- Empty states
- Mobile optimization

## Phase 4 - Admin CMS

- Admin login
- Emoji management
- Category management
- Topic management
- Article management
- Asset license management
- SEO management

## Phase 5 - Search, Sitemap, Analytics and Automation

- Meilisearch
- Sitemap generation
- SEO checks
- Popular emoji stats
- Search logs
- Copy stats

## Phase 6 - Deployment and Long-term Maintenance

- Production Docker
- Nginx
- HTTPS
- Backups
- Monitoring
- Search Console
- CDN
