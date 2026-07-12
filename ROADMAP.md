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

## Phase 5 - SEO Automation, Sitemap, and Public Content Scale

- Meilisearch
- Sitemap generation
- SEO checks
- Popular emoji stats
- Search logs
- Copy stats

## Phase 6 - Search Infrastructure and Advanced Discovery

> 按 Phase 5E 收尾结论，原 ROADMAP 中 Phase 6「Deployment and Long-term Maintenance」重命名为本阶段。搜索基础设施与高级发现能力规划中：在保持现有动态渲染架构与 SEO 边界（sitemap / robots / noindex / published-only）的前提下推进，遵守既有约束——**不接入 Meilisearch、不生成 AI 内容、不批量生成低质量内容、不改为纯静态站**，除非经明确确认。

- 搜索体验与索引能力增强（评估可选方案，不强制 Meilisearch）
- 高级发现 / 关联能力（复用现有 internal-linking 与结构化数据）
- 性能与抓取预算持续优化

## Phase 7 - Deployment and Long-term Maintenance

> 原 ROADMAP 的部署与长期维护工作顺延至本阶段。

- Production Docker
- Nginx
- HTTPS
- Backups
- Monitoring
- Search Console
- CDN
