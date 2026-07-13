# Emoji Platform

一个长期维护的全球 Emoji 平台项目。

## 项目目标

- Emoji 搜索
- Emoji 复制
- Emoji 含义解释
- Unicode 信息查询
- Emoji 分类浏览
- Emoji 专题页
- 多语言 SEO
- 后台 CMS 管理
- 搜索统计
- 后续支持海内外用户访问

## 当前阶段

**Phase 6B** - Meilisearch Integration 已完成（在 Phase 6A 的 SearchProvider 抽象之上接入真实 Meilisearch：新增 `meilisearch` Docker 服务、环境变量、`MeilisearchSearchProvider`、统一索引 `emoji_platform_search`、后台索引重建 / 设置 / 状态 API 与页面；公开搜索在 `SEARCH_PROVIDER=meilisearch` 时走 Meilisearch，不可用时自动 fallback 到 database；仅索引 published 的 emoji / category / topic / article，不索引 Asset / draft / archived / admin 内容，未改为纯静态站）。下一阶段：Phase 6C - Advanced Search UX。

## 技术栈

- **Monorepo**: pnpm workspace
- **前台 (Web)**: Next.js + TypeScript + Tailwind CSS
- **后台 (Admin)**: Next.js + TypeScript + Tailwind CSS
- **API**: NestJS + TypeScript
- **数据库**: PostgreSQL + Prisma
- **缓存**: Redis
- **搜索**: Meilisearch
- **容器化**: Docker Compose

## 目录结构

```
emoji-platform/
├── apps/
│   ├── web/          # 前台应用 (端口 3000)
│   ├── admin/        # 后台管理 (端口 3001)
│   └── api/          # API 服务 (端口 4000)
│       ├── prisma/
│       │   ├── schema.prisma  # Prisma 数据模型
│       │   └── seed.ts        # 种子数据脚本
│       └── src/
│           └── modules/
│               ├── emojis/     # Emoji 模块
│               ├── categories/ # 分类模块
│               ├── topics/     # 专题模块
│               ├── search/     # 搜索模块
│               └── events/     # 事件模块 (copy event)
├── packages/
│   ├── shared/       # 共享工具函数（含 slug 工具）
│   ├── types/        # 共享类型定义
│   └── ui/           # 共享 UI 组件
├── database/
│   ├── migrations/   # 数据库迁移文件
│   └── seeders/      # 种子数据
├── scripts/
│   └── import-unicode-data/  # Emoji 导入脚本
├── docker-compose.yml
├── .env.example
├── pnpm-workspace.yaml
└── package.json
```

## 环境变量

复制 `.env.example` 为 `.env` 并按需修改：

```bash
cp .env.example .env
cp .env apps/api/.env
```

关键环境变量说明：

| 变量 | 说明 | 默认值 |
|------|------|--------|
| `WEB_PORT` | 前台端口 | 3000 |
| `ADMIN_PORT` | 后台端口 | 3001 |
| `API_PORT` | API 端口 | 4000 |
| `DATABASE_URL` | PostgreSQL 连接 | `postgresql://postgres:postgres@localhost:5432/emoji_platform` |
| `REDIS_URL` | Redis 连接 | `redis://localhost:6379` |
| `MEILISEARCH_HOST` | Meilisearch 地址 | `http://localhost:7700` |
| `MEILISEARCH_API_KEY` | Meilisearch API Key（示例值，生产请替换；绝不写入真实密钥到仓库） | `dev_meili_master_key` |
| `MEILISEARCH_INDEX_PREFIX` | 搜索索引前缀（索引名 = `{前缀}_search`） | `emoji_platform` |
| `SEARCH_PROVIDER` | 搜索 provider：`database`（默认）或 `meilisearch` | `database` |
| `JWT_SECRET` | JWT 密钥 | `change_me` |
| `NEXT_PUBLIC_API_URL` | 前端 API 地址 | `http://localhost:4000` |
| `NEXT_PUBLIC_SITE_URL` | 站点 URL（用于 canonical/hreflang） | `http://localhost:3000` |

## 本地安装

```bash
# 确保已安装 pnpm（>= 8.0.0）和 Node.js（>= 18.0.0）
pnpm install
```

## 数据库初始化

Phase 2 引入了 PostgreSQL + Prisma。在首次使用前需要完成数据库初始化：

### 1. 启动 PostgreSQL

```bash
# 使用 Docker 启动 PostgreSQL
docker compose up -d postgres
```

### 2. 生成 Prisma Client

```bash
pnpm db:generate
```

### 3. 执行数据库迁移

```bash
pnpm db:migrate
```

### 4. 填充种子数据

```bash
pnpm db:seed
```

### 5. 导入 Emoji 数据

```bash
pnpm import:emoji
```

### Prisma Studio（数据库可视化）

```bash
pnpm db:studio
```

浏览器访问 `http://localhost:5555` 查看和编辑数据库。

## 本地启动

```bash
# 启动所有服务（前台 + 后台 + API）
pnpm dev

# 仅启动前台
pnpm dev:web

# 仅启动后台
pnpm dev:admin

# 仅启动 API
pnpm dev:api

# 或使用编译后的 JS 运行 API
pnpm build
cd apps/api && node dist/main.js
```

## Docker 启动

```bash
# 构建并启动所有服务
docker compose up --build

# 仅启动基础服务（PostgreSQL + Redis + Meilisearch）
docker compose up postgres redis meilisearch
```

> **注意**: 在 Docker 环境中，web/admin 使用 standalone 模式构建。由于 Next.js standalone 输出需要预构建，首次启动可能需要较长时间。如遇 Docker 构建问题，建议本地开发使用 `pnpm dev` 方式启动。

## Meilisearch 搜索集成（Phase 6B）

Phase 6B 在 Phase 6A 的 `SearchProvider` 抽象之上接入了真实 Meilisearch。

### 本地 Docker 启动

```bash
# 启动 Meilisearch（默认 master key 来自 .env 的 MEILISEARCH_API_KEY）
docker compose up -d meilisearch
docker ps
curl -f http://localhost:7700/health   # {"status":"available"}
```

### 环境变量

| 变量 | 说明 | 默认 |
|------|------|------|
| `SEARCH_PROVIDER` | `database`（默认，保留现有数据库搜索）或 `meilisearch` | `database` |
| `MEILISEARCH_HOST` | Meilisearch 地址 | `http://localhost:7700` |
| `MEILISEARCH_API_KEY` | Meilisearch API Key（`.env.example` 仅为示例值，生产请替换） | `dev_meili_master_key` |
| `MEILISEARCH_INDEX_PREFIX` | 索引前缀 | `emoji_platform` |

> 索引名 = `{MEILISEARCH_INDEX_PREFIX}_search`，即 `emoji_platform_search`（单索引 + `locale` 字段区分中英文）。

### Search provider 切换

- `SEARCH_PROVIDER=database`（默认）：公开搜索完全走 PostgreSQL，不连接 Meilisearch。
- `SEARCH_PROVIDER=meilisearch` 且 Meilisearch 可达：公开搜索走 Meilisearch。
- `SEARCH_PROVIDER=meilisearch` 但 Meilisearch 不可用：自动 fallback 到 database，用户无感知，搜索日志照常记录。

### 索引实体与字段

统一索引 `emoji_platform_search` 包含以下 **published** 内容（单索引，`type` + `locale` 作为可过滤字段）：

| 实体 | 额外字段 |
|------|----------|
| emoji | `emojiChar`, `unicodeCodepoint`, `shortcode`, `aliases`, `categoryNames`, `topicTitles` |
| category | `parentId`, `parentName` |
| topic | `topicType`, `emojiCount` |
| article | `summary`, `publishedAt` |

通用字段：`documentId`, `id`, `type`, `locale`, `slug`, `title`, `description`, `keywords`, `status`, `updatedAt`, `publicUrl`。

- **不索引** Asset、`draft` / `archived`、任何 admin 内容、敏感字段（无 `passwordHash` / `JWT_SECRET` / 明文 IP）。
- `searchableAttributes`：`emojiChar`, `shortcode`, `title`, `keywords`, `aliases`, `unicodeCodepoint`, `slug`, `description`, `categoryNames`, `topicTitles`, `summary`。
- `filterableAttributes`：`type`, `locale`, `status`。
- `sortableAttributes`：`updatedAt`, `publishedAt`。

### 索引重建（后台）

后台地址：`/admin/search/infrastructure`（需登录；查看=super_admin/editor/seo_manager/analyst，重建=super_admin/editor，设置=super_admin）。

- **重建全部 / 单实体**：触达 `POST /api/v1/admin/search/index/rebuild`（`{ "entityType": "all" | "emoji" | "category" | "topic" | "article" }`），仅索引 published 内容，幂等可重复执行。
- **应用索引设置**：`POST /api/v1/admin/search/index/settings`（super_admin）。
- **索引状态**：`GET /api/v1/admin/search/index/status`。
- 所有写操作记录 `audit_logs`（`search.index_rebuild` / `search.index_settings_update`），不含任何密钥或敏感 IP。

### fallback 与回滚

只要将 `SEARCH_PROVIDER=database`，系统即可完全回到数据库搜索；Meilisearch 容器停止、API Key 缺失都不会导致系统崩溃或公开搜索不可用。

### 安全边界

- 不索引 `draft` / `archived`；不索引 Asset；不索引 admin 内容。
- 不泄露 Meilisearch API Key（API 响应与后台页面均不含密钥）。
- 未改为纯静态站；sitemap / robots / public pages 不受影响。

## 访问地址

### 前台 (Web)

| 页面 | 地址 |
|------|------|
| 首页 | http://localhost:3000/ |
| 中文首页 | http://localhost:3000/zh/ |
| 英文首页 | http://localhost:3000/en/ |
| 表情列表 | http://localhost:3000/zh/emojis/ |
| 表情详情 | http://localhost:3000/zh/emoji/grinning-face/ |
| 分类浏览 | http://localhost:3000/zh/categories/ |
| 分类详情 | http://localhost:3000/zh/categories/smileys-emotion/ |
| 专题内容 | http://localhost:3000/zh/topics/ |
| 专题详情 | http://localhost:3000/zh/topics/heart-colors/ |
| 搜索 | http://localhost:3000/zh/search/ |
| 实用工具 | http://localhost:3000/zh/tools/ |

### 后台 (Admin)

| 页面 | 地址 |
|------|------|
| 登录 | http://localhost:3001/admin/login |
| 仪表盘 | http://localhost:3001/admin/dashboard |
| 表情管理 | http://localhost:3001/admin/emojis |
| 分类管理 | http://localhost:3001/admin/categories |
| 专题管理 | http://localhost:3001/admin/topics |
| 文章管理 | http://localhost:3001/admin/articles |
| 素材管理 | http://localhost:3001/admin/assets |
| SEO 管理 | http://localhost:3001/admin/seo |
| SEO 质量检查 | http://localhost:3001/admin/seo/quality |
| 搜索日志 | http://localhost:3001/admin/search-logs |
| 统计分析 | http://localhost:3001/admin/analytics |
| 系统设置 | http://localhost:3001/admin/settings |

## API 文档

### 基础信息

- **Base URL**: `http://localhost:4000/api/v1`
- **响应格式**: 统一 JSON 格式
  - 成功: `{ "success": true, "data": ..., "meta": ... }`
  - 失败: `{ "success": false, "error": { "code": "ERROR_CODE", "message": "..." } }`
- **Locale**: 所有接口支持 `locale=zh` 或 `locale=en`，默认 `en`
- **分页**: 列表接口支持 `page`（默认 1）和 `limit`（默认 30，最大 100）

### API 列表

| 方法 | 接口 | 说明 |
|------|------|------|
| GET | `/api/v1/health` | 健康检查 |
| GET | `/api/v1/status` | 状态查询（含数据库连接状态） |
| GET | `/api/v1/emojis` | Emoji 列表 |
| GET | `/api/v1/emojis/:slug` | Emoji 详情 |
| GET | `/api/v1/categories` | 分类列表 |
| GET | `/api/v1/categories/:slug` | 分类详情 |
| GET | `/api/v1/topics` | 专题列表 |
| GET | `/api/v1/topics/:slug` | 专题详情 |
| GET | `/api/v1/search` | 基础搜索（database 或 meilisearch，自动 fallback） |
| POST | `/api/v1/events/copy` | 记录复制事件 |
| GET | `/api/v1/admin/search/infrastructure/status` | 搜索基础设施状态（需登录，查看角色） |
| GET | `/api/v1/admin/search/index/status` | 索引实时状态（需登录，查看角色） |
| POST | `/api/v1/admin/search/index/rebuild` | 重建索引（需登录，super_admin/editor；body `{"entityType":"all"|"emoji"|"category"|"topic"|"article"}`） |
| POST | `/api/v1/admin/search/index/settings` | 应用索引设置（需登录，super_admin） |

### 示例请求

#### Emoji 列表

```bash
# 中文，第 1 页，每页 10 条
curl 'http://localhost:4000/api/v1/emojis?locale=zh&page=1&limit=10'

# 英文，按分类过滤
curl 'http://localhost:4000/api/v1/emojis?locale=en&category=smileys-emotion'

# 搜索
curl 'http://localhost:4000/api/v1/emojis?locale=zh&q=开心'
```

#### Emoji 详情

```bash
curl 'http://localhost:4000/api/v1/emojis/grinning-face?locale=zh'
curl 'http://localhost:4000/api/v1/emojis/grinning-face?locale=en'
```

#### 分类列表

```bash
curl 'http://localhost:4000/api/v1/categories?locale=zh'
```

#### 分类详情

```bash
curl 'http://localhost:4000/api/v1/categories/smileys-emotion?locale=zh&limit=10'
```

#### 专题列表

```bash
curl 'http://localhost:4000/api/v1/topics?locale=zh'
```

#### 专题详情

```bash
curl 'http://localhost:4000/api/v1/topics/heart-colors?locale=zh'
```

#### 搜索

```bash
curl --get 'http://localhost:4000/api/v1/search' --data-urlencode 'locale=zh' --data-urlencode 'q=开心'
curl --get 'http://localhost:4000/api/v1/search' --data-urlencode 'locale=en' --data-urlencode 'q=heart'
```

#### 复制事件

```bash
curl -X POST 'http://localhost:4000/api/v1/events/copy' \
  -H 'Content-Type: application/json' \
  -d '{"emojiId":"<real-emoji-id>","locale":"zh","pageUrl":"/zh/emoji/grinning-face/"}'
```

### 本地测试

```bash
# 1. 确保 PostgreSQL 运行
docker compose up -d postgres

# 2. 构建并启动 API
pnpm build
cd apps/api && node dist/main.js &

# 3. 测试接口
curl 'http://localhost:4000/api/v1/emojis?locale=zh&page=1&limit=5'
curl 'http://localhost:4000/api/v1/emojis/grinning-face?locale=zh'
curl 'http://localhost:4000/api/v1/categories?locale=zh'
curl 'http://localhost:4000/api/v1/topics?locale=zh'
curl --get 'http://localhost:4000/api/v1/search' --data-urlencode 'locale=zh' --data-urlencode 'q=开心'
```

## Emoji 导入脚本

使用 `scripts/import-unicode-data/import-emojis.ts` 导入 Emoji 数据：

```bash
# 使用默认文件 (scripts/import-unicode-data/sample-emojis.json)
pnpm import:emoji

# 指定自定义 JSON 文件
pnpm import:emoji /path/to/custom-emojis.json
```

导入脚本功能：
- 读取本地 JSON 文件
- 校验基础字段（emoji, name, unicode 必填）
- 自动生成 slug
- 自动创建分类和子分类
- 自动创建中英文分类翻译
- 自动创建中英文 Emoji 翻译
- 重复运行不会重复插入（基于 slug 去重）
- 输出详细导入报告

JSON 格式示例：

```json
{
  "emoji": "😀",
  "name": "grinning face",
  "unicode": "U+1F600",
  "category": "Smileys & Emotion",
  "subcategory": "face-smiling",
  "emojiVersion": "1.0",
  "unicodeVersion": "6.1",
  "shortcode": ":grinning:"
}
```

## 已完成阶段

### Phase 0 - Project Governance and Repository Initialization

- [x] 初始化 git 仓库
- [x] 连接远程仓库
- [x] 创建项目治理文档

### Phase 1 - Monorepo Base Architecture

- [x] pnpm workspace 配置
- [x] apps/web (Next.js + TypeScript + Tailwind CSS)
- [x] apps/admin (Next.js + TypeScript + Tailwind CSS)
- [x] apps/api (NestJS + TypeScript)
- [x] packages/shared, packages/types, packages/ui
- [x] Docker Compose 基础服务配置
- [x] 环境变量示例文件
- [x] 前台占位路由（中文/英文）
- [x] 后台占位路由（10 个模块）
- [x] API 健康检查与状态接口
- [x] 代码规范配置

### Phase 2 - Database and Prisma

- [x] PostgreSQL 数据库接入
- [x] Prisma ORM 接入
- [x] 15 个核心数据模型
- [x] 6 个枚举类型
- [x] 数据库迁移
- [x] 种子数据（10 分类 + 30 Emoji + 5 专题 + 管理员 + 日志）
- [x] Emoji 导入脚本
- [x] 数据库健康检查（/api/v1/status → database: "connected"）
- [x] Slug 工具函数

### Phase 3A - Public Read-only API

- [x] Emoji 列表 API（分页、locale、分类过滤、搜索）
- [x] Emoji 详情 API（slug、翻译、关联数据）
- [x] 分类列表 API（emoji 计数）
- [x] 分类详情 API（分页 emoji、关联专题）
- [x] 专题列表 API（分页）
- [x] 专题详情 API（绑定 emoji、关联专题）
- [x] 基础搜索 API（PostgreSQL/Prisma 搜索 + search_logs 记录）
- [x] 复制事件 API（POST /events/copy）
- [x] 统一响应格式和错误处理
- [x] Locale 解析和校验
- [x] 分页工具

### Phase 3B - Frontend Basic Pages

- [x] 中文首页 /zh/ 和英文首页 /en/（Hero 搜索区、推荐 Emoji、分类入口、专题入口、工具入口、介绍）
- [x] Emoji 总列表页 /zh/emojis/ 和 /en/emojis/（SSR 分页、EmojiCard 网格、搜索框）
- [x] 分类总览页 /zh/categories/ 和 /en/categories/（CategoryCard 网格）
- [x] 专题总览页 /zh/topics/ 和 /en/topics/（TopicCard 网格、分页）
- [x] 搜索页 /zh/search/ 和 /en/search/（关键词搜索、结果展示、空状态）
- [x] 工具入口页 /zh/tools/ 和 /en/tools/（4 个工具卡片占位）
- [x] 授权说明页 /zh/license/ 和 /en/license/（原创 Unicode 授权内容）
- [x] 关于页面 /zh/about/ 和 /en/about/（原创平台介绍内容）
- [x] 共享组件：Header、Footer、LanguageSwitcher、SearchBox、EmojiCard、EmojiGrid、CopyButton、CategoryCard、TopicCard、ToolCard、Pagination、EmptyState、LoadingState、ErrorState、Toast
- [x] API 客户端层（lib/api.ts）：fetch 封装 + 所有 Phase 3A 端点函数
- [x] 前端类型定义（lib/types.ts）：EmojiListItem、CategoryItem、TopicItem、SearchResultItem
- [x] CopyButton 集成 copy event API（fire-and-forget 模式）
- [x] SSR 数据获取（服务端组件直接从 Phase 3A API 获取数据）
- [x] SEO 基础元数据（title、description、Open Graph）
- [x] 移动端响应式设计
- [x] 语言感知导航（Header、Footer、LanguageSwitcher）

### Phase 3C - Emoji Detail and SEO

- [x] Emoji 详情页 `/zh/emoji/[slug]/` 和 `/en/emoji/[slug]/`（Hero、复制区、含义解释、使用示例、技术信息、关键词、FAQ、图片资源、相关 Emoji、相关专题）
- [x] 分类详情页 `/zh/categories/[slug]/` 和 `/en/categories/[slug]/`（分类信息、Emoji 列表、分页、相关专题、Breadcrumb）
- [x] 专题详情页 `/zh/topics/[slug]/` 和 `/en/topics/[slug]/`（专题信息、内容、绑定 Emoji、FAQ、相关专题、Breadcrumb）
- [x] SEO metadata 增强（title、description、Open Graph、Twitter Card）
- [x] `html lang` 动态修正（zh/en 根据路由自动切换）
- [x] canonical URL（每个语言页面指向自身）
- [x] hreflang 支持（zh / en / x-default）
- [x] BreadcrumbList JSON-LD 结构化数据
- [x] FAQPage JSON-LD 结构化数据
- [x] `NEXT_PUBLIC_SITE_URL` 环境变量
- [x] 新增组件：DetailHero、CopyArea、CopyValueButton、EmojiMeaningSection、EmojiExamples、EmojiTechInfo、EmojiKeywords、EmojiAssets、RelatedEmojis、RelatedTopics、Breadcrumb、FaqBlock、JsonLd、HtmlLang
- [x] SEO 工具库（lib/seo.ts）

### Phase 3D - Search and Copy Experience

- [x] SearchBox 交互增强（清空按钮、防重复提交、语言路由、移动端可用）
- [x] 搜索页体验增强（动态 metadata、空查询展示推荐表情、无结果 EmptyState + 推荐、API 失败 ErrorState）
- [x] 搜索结果使用 EmojiCard 网格展示并带结果数量
- [x] CopyButton 体验增强（本地化提示、剪贴板降级、复制可靠性）
- [x] CopyValueButton 复用并增强（支持传入 emojiId，复制时写入 copy 事件）
- [x] CopyArea 增强（支持传入 emojiId，每个复制项写入 copy 事件）
- [x] 新增剪贴板工具 lib/clipboard.ts（Clipboard API + execCommand 降级）
- [x] EmptyState / ErrorState 优化（ErrorState 按路由自动中文化）
- [x] 移动端搜索与复制体验优化（点击区 ≥36px、长 Unicode/HTML 字符串截断不溢出）
- [x] 搜索页基础 metadata 优化（title/description 随 query 动态变化）
- [x] search_logs 与 copy_events 写入验证通过

### Phase 4A - Admin Auth and Access Control

- [x] 后台登录页（邮箱 + 密码）真实可用
- [x] 使用 Phase 2 seed 的管理员账号登录（`admin@example.com` / `admin123456`）
- [x] 密码使用 bcrypt `passwordHash` 校验，不在任何响应中返回 `passwordHash`
- [x] 登录成功后跳转 `/admin/dashboard`
- [x] 未登录访问受保护后台页面自动跳转 `/admin/login`
- [x] 登录态通过 httpOnly Cookie（`admin_token`）保持，跨端口同源场景可用
- [x] 退出登录（清除 Cookie + 跳转 `/admin/login`）
- [x] 基础角色字段（`role`）读取并在后台侧边栏 / 仪表盘展示
- [x] 后台 API 鉴权保护（`admin/auth/me`、`admin/health` 需登录）
- [x] 后台全部页面 `noindex, nofollow`，不应被搜索引擎收录

#### 登录账号

| 邮箱 | 密码 | 角色 |
|------|------|------|
| `admin@example.com` | `admin123456` | `super_admin` |

> 该账号由 Phase 2 的种子脚本创建，密码以 bcrypt 哈希（`passwordHash`）存储，明文密码不会出现在任何 API 响应或前端代码中。

#### 后台登录地址

| 页面 | 地址 |
|------|------|
| 登录 | http://localhost:3001/admin/login |
| 仪表盘 | http://localhost:3001/admin/dashboard |

#### Auth API 列表

Base URL：`http://localhost:4000/api/v1`

| 方法 | 接口 | 说明 | 鉴权 |
|------|------|------|------|
| POST | `/api/v1/admin/auth/login` | 邮箱 + 密码登录，返回管理员信息与 token，并设置 `admin_token` Cookie | 不需要 |
| GET | `/api/v1/admin/auth/me` | 返回当前登录管理员信息（不含 `passwordHash`） | 需要 |
| POST | `/api/v1/admin/auth/logout` | 清除 Cookie，返回成功 | 不需要 |
| GET | `/api/v1/admin/health` | 后台鉴权健康检查 | 需要 |

登录成功返回示例：

```json
{
  "success": true,
  "data": {
    "admin": { "id": "…", "email": "admin@example.com", "name": "Super Admin", "role": "super_admin" },
    "token": "…"
  }
}
```

未登录 / token 失效访问受保护接口返回：

```json
{
  "success": false,
  "error": { "code": "UNAUTHORIZED", "message": "Unauthorized" }
}
```

#### Token 与 Cookie 说明

- 使用 **JWT**（由 `JWT_SECRET` 与 `JWT_EXPIRES_IN` 配置，定义在 `.env.example`）。
- 登录成功后，API 在响应中设置 **httpOnly Cookie** `admin_token`（跨端口同源场景下 `sameSite: lax` 可用，生产环境 `secure` 自动开启），同时响应体也返回 `token` 便于调试。
- 后台前端通过 `fetch(..., { credentials: 'include' })` 自动携带 Cookie，**前端不读取、不存储 token**，也不接触 `passwordHash` / 明文密码。
- 鉴权 Guard 依次从 `Authorization: Bearer <token>` 请求头或 `admin_token` Cookie 读取 token，无效或过期均返回 `401 UNAUTHORIZED`。
- 由于 Cookie 由 API 域（localhost:4000）写入，后台前端（localhost:3001）通过调用 `/admin/auth/me` 判断登录态，未登录访问受保护页面时客户端自动跳转到 `/admin/login`。

#### 受保护的后台页面

以下页面均需登录后才能访问，未登录会被重定向到 `/admin/login`：

`/admin/dashboard`、`/admin/emojis`、`/admin/categories`、`/admin/topics`、`/admin/articles`、`/admin/assets`、`/admin/seo`、`/admin/search-logs`、`/admin/analytics`、`/admin/settings`

本阶段这些页面仍为基础占位，但已受登录保护。

#### 后台不应被搜索引擎收录

后台所有页面已设置 `robots: { index: false, follow: false }`（即 `<meta name="robots" content="noindex, nofollow">`）。后续 Phase 5 生成 sitemap 时，应**排除所有 `/admin/*` 路径**。请勿将后台页面提交至搜索引擎。

## Phase 4B - Admin Dashboard and Emoji Management

本阶段完成后台**数据看板**与 **Emoji 内容管理（CRUD）**。

### 后台 Dashboard 范围

页面：`/admin/dashboard`（需登录）。展示基础统计：

- Emoji 总数 / 已发布数 / 草稿数 / 已下线数
- 分类总数 / 专题总数
- 今日搜索次数 / 今日复制次数
- 最近更新的 Emoji（最多 5 条）
- 当前登录管理员信息

后台 API：

| 方法 | 接口 | 说明 | 鉴权 |
|------|------|------|------|
| GET | `/api/v1/admin/dashboard` | 看板统计 + 最近更新 + 当前管理员 | 登录即可 |

### Emoji 管理范围

- 列表页 `/admin/emojis`：分页、关键词搜索、分类筛选、状态筛选、emojiChar / slug / 分类 / 状态 / zh·en 翻译完成情况 / 更新时间展示，提供编辑与预览链接、新建按钮。
- 新建页 `/admin/emojis/create`：基础信息 + zh/en 翻译 + 分类 + 状态，保存后跳转编辑页。
- 编辑页 `/admin/emojis/[id]/edit`：编辑基础信息、zh/en 翻译、SEO 标题/描述、examples / keywords / faqJson、分类、状态切换，并提供前台预览链接。

Emoji 后台 API 列表（Base URL：`http://localhost:4000/api/v1`）：

| 方法 | 接口 | 说明 | 鉴权 | 权限 |
|------|------|------|------|------|
| GET | `/api/v1/admin/emojis` | Emoji 列表（page/limit/q/categoryId/status） | 登录 | 可读角色 |
| GET | `/api/v1/admin/emojis/{id}` | Emoji 详情（完整编辑数据） | 登录 | 可读角色 |
| POST | `/api/v1/admin/emojis` | 新建 Emoji | 登录 | `super_admin` / `editor` |
| PATCH | `/api/v1/admin/emojis/{id}` | 更新 Emoji | 登录 | `super_admin` / `editor` |
| PATCH | `/api/v1/admin/emojis/{id}/status` | 切换状态（draft/published/archived） | 登录 | `super_admin` / `editor` |
| GET | `/api/v1/admin/categories/options` | 分类选项（id/slug/iconEmoji/name） | 登录 | 可读角色 |

> 可读角色：super_admin、editor、seo_manager、translator、reviewer、analyst。写操作仅 `super_admin` / `editor`，其余角色返回 403。未登录返回 401。

### Emoji 表单字段

基础信息：

`emojiChar`、`slug`、`unicodeCodepoint`、`htmlDecimal`、`htmlHex`、`shortcode`、`emojiVersion`、`unicodeVersion`、`categoryId`、`status`、`manualWeight`

每个 locale（zh / en）翻译字段：

`name`、`shortName`、`oneLineMeaning`、`meaning`、`usageNotes`、`formalUsageNotes`、`informalUsageNotes`、`socialUsageNotes`、`examples`、`keywords`、`faqJson`、`seoTitle`、`seoDescription`、`status`、`reviewStatus`

> `categoryId` 留空表示未分类；`slug` 需唯一，仅含小写字母、数字与连字符。

### JSON 字段编辑

`examples`、`keywords`、`faqJson` 为 JSON 字段，在表单中以文本框编辑：

- 保存前会校验 JSON 格式，格式错误会给出明确提示且**不会**写入错误 JSON。
- `examples` 推荐数组格式，如 `[{ "text": "…", "context": "…" }]`。
- `keywords` 推荐字符串数组，如 `["开心", "笑"]`。
- `faqJson` 推荐对象数组，如 `[{ "question": "…", "answer": "…" }]`。
- 编辑页加载时会把已有 JSON 正确回显为格式化文本。

### audit_logs 记录

以下操作会写入 `audit_logs`：

- `emoji.create`：创建 Emoji
- `emoji.update`：更新 Emoji
- `emoji.status_update`：切换 Emoji 状态

记录字段：`adminUserId`、`action`、`entityType=emoji`、`entityId`、`oldData`、`newData`、`ipAddress`（可空）。

- `oldData` / `newData` 仅包含 Emoji 相关数据，**不会**写入 `passwordHash`。
- audit log 写入失败时，服务端会记录错误日志，主操作流程仍正常完成。

### 默认测试账号

| 邮箱 | 密码 | 角色 |
|------|------|------|
| `admin@example.com` | `admin123456` | `super_admin` |

## Phase 4C-1 - Category Management

本阶段完成后台**分类管理（CRUD）**，包含分类列表、新建、编辑、状态切换、中英文翻译、父级分类选择与排序。

### 范围

- 列表页 `/admin/categories`：分页、关键词搜索（slug / 名称）、父级筛选、状态筛选；展示图标、slug、zh/en 名称、父级、排序、状态、Emoji 数量、更新时间，提供编辑与前台预览链接、新建按钮。
- 新建页 `/admin/categories/create`：基础信息 + zh/en 翻译 + 父级选择 + 状态，保存后跳转编辑页。
- 编辑页 `/admin/categories/[id]/edit`：编辑基础信息、zh/en 翻译、SEO 标题/描述、父级、排序、状态切换，并提供前台预览链接。
- 前台预览链接：`/zh/categories/{slug}/` 与 `/en/categories/{slug}/`。

### Category 后台 API 列表

Base URL：`http://localhost:4000/api/v1`

| 方法 | 接口 | 说明 | 鉴权 | 权限 |
|------|------|------|------|------|
| GET | `/api/v1/admin/categories` | 分类列表（page/limit/q/status/parentId） | 登录 | 可读角色 |
| GET | `/api/v1/admin/categories/tree` | 分类树（父级选择器用） | 登录 | 可读角色 |
| GET | `/api/v1/admin/categories/options` | 分类选项（Emoji 表单用） | 登录 | 可读角色 |
| GET | `/api/v1/admin/categories/{id}` | 分类详情（完整编辑数据 + 父级 + 子级） | 登录 | 可读角色 |
| POST | `/api/v1/admin/categories` | 新建分类 | 登录 | `super_admin` / `editor` |
| PATCH | `/api/v1/admin/categories/{id}` | 更新分类 | 登录 | `super_admin` / `editor` |
| PATCH | `/api/v1/admin/categories/{id}/status` | 切换状态（draft/published/archived） | 登录 | `super_admin` / `editor` |

> 可读角色：super_admin、editor、seo_manager、translator、reviewer、analyst。写操作仅 `super_admin` / `editor`，其余角色返回 403。未登录返回 401。

### Category 表单字段

基础信息：

`slug`、`parentId`、`iconEmoji`、`sortOrder`、`status`

每个 locale（zh / en）翻译字段：

`name`、`description`、`seoTitle`、`seoDescription`

> `parentId` 留空表示顶级分类；`slug` 需唯一，仅含小写字母、数字与连字符（`^[a-z0-9-]+$`）。`parentId` 不能选择自身，也不能造成循环引用（后端在更新时校验祖先链）。`seoTitle` / `seoDescription` 可空，保存时以 `null` 存储（不会写入空字符串）。

### 分类树接口说明

`GET /api/v1/admin/categories/tree` 返回分类层级结构，用于父级分类下拉框：

- 支持 `locale` 参数（默认 `zh`），控制节点 `name` 采用的语言。
- 支持 `exclude` 参数（分类 id），返回时会剔除该节点及其全部后代，便于在「编辑某分类」时避免将其自身或后代选为父级（同时后端仍有循环引用校验兜底）。
- 每个节点包含：`id`、`slug`、`iconEmoji`、`status`、`sortOrder`、`name`、`children`。

### audit_logs 记录

以下操作会写入 `audit_logs`：

- `category.create`：创建分类
- `category.update`：更新分类
- `category.status_update`：切换分类状态

记录字段：`adminUserId`、`action`、`entityType=category`、`entityId`、`oldData`、`newData`、`ipAddress`（可空）。

- `oldData` / `newData` 仅包含分类相关数据（slug / parentId / iconEmoji / sortOrder / status / 翻译），**不会**写入 `passwordHash`。
- audit log 写入失败时，服务端会记录错误日志，主操作流程仍正常完成。

### 默认测试账号

| 邮箱 | 密码 | 角色 |
|------|------|------|
| `admin@example.com` | `admin123456` | `super_admin` |

## Phase 4C-2 - Topic Management

本阶段完成后台**专题管理（CRUD）**，包含专题列表、新建、编辑、状态切换、中英文翻译，以及专题与 Emoji 的关联（绑定 / 解绑 / 排序）。

### 范围

- 列表页 `/admin/topics`：分页、关键词搜索（slug / 标题）、状态筛选；展示封面、slug、zh/en 标题、类型、排序、状态、Emoji 数量、更新时间，提供编辑与前台预览链接、新建按钮。
- 新建页 `/admin/topics/create`：基础信息 + zh/en 翻译 + 状态，保存后跳转编辑页（编辑页再关联 Emoji）。
- 编辑页 `/admin/topics/[id]/edit`：编辑基础信息、zh/en 翻译（title/summary/content/seoTitle/seoDescription/faqJson）、状态切换、Emoji 关联管理（添加 / 移除 / 排序 / 备注），并提供前台预览链接。

### Topic 后台 API 列表

Base URL：`http://localhost:4000/api/v1`

| 方法 | 接口 | 说明 | 鉴权 | 权限 |
|------|------|------|------|------|
| GET | `/api/v1/admin/topics` | 专题列表（page/limit/q/status） | 登录 | 可读角色 |
| GET | `/api/v1/admin/topics/emoji-options` | Emoji 选项（绑定选择器用） | 登录 | 可读角色 |
| GET | `/api/v1/admin/topics/{id}` | 专题详情（完整编辑数据 + 绑定 Emoji） | 登录 | 可读角色 |
| POST | `/api/v1/admin/topics` | 新建专题 | 登录 | `super_admin` / `editor` |
| PATCH | `/api/v1/admin/topics/{id}` | 更新专题 | 登录 | `super_admin` / `editor` |
| PATCH | `/api/v1/admin/topics/{id}/status` | 切换状态（draft/published/archived） | 登录 | `super_admin` / `editor` |
| PUT | `/api/v1/admin/topics/{id}/emojis` | 替换专题 Emoji 关联（绑定/解绑/排序） | 登录 | `super_admin` / `editor` |

> 可读角色：super_admin、editor、seo_manager、translator、reviewer、analyst。写操作仅 `super_admin` / `editor`，其余角色返回 403。未登录返回 401。

### Topic 表单字段

基础信息：

`slug`、`coverImage`、`topicType`、`sortOrder`、`status`

每个 locale（zh / en）翻译字段：

`title`、`summary`、`content`、`seoTitle`、`seoDescription`、`faqJson`

> `slug` 需唯一，仅含小写字母、数字与短横线（`^[a-z0-9-]+$`）。`title` 不能为空。`faqJson` 为 JSON 字段，保存前会校验格式，错误格式会被拒绝保存且不会写入。`seoTitle` / `seoDescription` / `summary` / `content` / `coverImage` / `topicType` 可空。

### 专题与 Emoji 关联

- 通过 `PUT /api/v1/admin/topics/{id}/emojis` 一次性替换该专题的 Emoji 关联集合：`{ "items": [{ "emojiId": "...", "note": "..." }] }`。
- 数组顺序即展示 / 关联顺序（排序）。空数组表示解绑全部。
- 每个 `emojiId` 在保存前会校验其存在，无效的 `emojiId` 返回 400。
- 绑定选择器数据来自 `GET /api/v1/admin/topics/emoji-options?locale=zh`。

### audit_logs 记录

以下操作会写入 `audit_logs`：

- `topic.create`：创建专题
- `topic.update`：更新专题
- `topic.status_update`：切换专题状态
- `topic.update_emojis`：变更专题 Emoji 关联

记录字段：`adminUserId`、`action`、`entityType=topic`、`entityId`、`oldData`、`newData`、`ipAddress`（可空）。

- `oldData` / `newData` 仅包含专题相关数据（slug / coverImage / topicType / sortOrder / status / 翻译 / Emoji 关联），**不会**写入 `passwordHash`。
- audit log 写入失败时，服务端会记录错误日志，主操作流程仍正常完成。

### 默认测试账号

| 邮箱 | 密码 | 角色 |
|------|------|------|
| `admin@example.com` | `admin123456` | `super_admin` |

## Phase 4C-3 - Article Management

本阶段完成后台**文章管理（CRUD）**，包含文章列表、新建、编辑、发布 / 草稿 / 归档状态切换，以及中英文翻译。

### 范围

- 列表页 `/admin/articles`：分页、关键词搜索（slug / 标题）、状态筛选；展示 slug、zh/en 标题、状态、发布时间、作者、更新时间，提供编辑链接、创建按钮。前台文章页（/zh/articles/ 与 /en/articles/）将在后续阶段实现，列表页的「预览」为占位禁用状态。
- 新建页 `/admin/articles/create`：基础信息 + zh/en 翻译 + 封面图 + SEO + 关键词 + 正文 + 状态 + 发布时间，保存后跳转编辑页（作者默认填充为当前登录管理员）。
- 编辑页 `/admin/articles/[id]/edit`：编辑基础信息、zh/en 翻译（title / summary / content / seoTitle / seoDescription / keywords）、状态切换、发布时间，并提供前台预览占位。

### Article 后台 API 列表

Base URL：`http://localhost:4000/api/v1`

| 方法 | 接口 | 说明 | 鉴权 | 权限 |
|------|------|------|------|------|
| GET | `/api/v1/admin/articles` | Article 列表（page/limit/q/status） | 登录 | 可读角色 |
| GET | `/api/v1/admin/articles/{id}` | Article 详情（完整编辑数据 + 翻译 + 作者摘要） | 登录 | 可读角色 |
| POST | `/api/v1/admin/articles` | 新建 Article | 登录 | `super_admin` / `editor` |
| PATCH | `/api/v1/admin/articles/{id}` | 更新 Article | 登录 | `super_admin` / `editor` |
| PATCH | `/api/v1/admin/articles/{id}/status` | 切换状态（draft/published/archived） | 登录 | `super_admin` / `editor` |

> 可读角色：super_admin、editor、seo_manager、translator、reviewer、analyst。写操作仅 `super_admin` / `editor`，其余角色返回 403。未登录返回 401。

### Article 表单字段

基础信息：

`slug`、`coverImage`、`authorId`、`status`、`publishedAt`

每个 locale（zh / en）翻译字段：

`title`、`summary`、`content`、`seoTitle`、`seoDescription`、`keywords`

> `slug` 需唯一，仅含小写字母、数字与短横线（`^[a-z0-9-]+$`）。`title` 中英文均不能为空。`seoTitle` / `seoDescription` / `summary` / `content` / `coverImage` / `authorId` 可空；这些字段保存时以 `null` 存储（不会写入空字符串）。`authorId` 在新建时默认填充为当前登录管理员 id（编辑页只读展示）。

### keywords 编辑说明

`keywords` 为 JSON 字段，在表单中以文本框编辑：

- 保存前会校验并解析，支持两种写法，错误格式会被拒绝保存且不会写入：
  - **合法 JSON**：如 `["开心", "笑"]` 或 `[{"term":"开心","weight":2}]`。
  - **逗号分隔列表**：如 `开心, 笑, 笑脸`（自动解析为字符串数组 `["开心","笑","笑脸"]`）。
- 空字符串视为「未提供」，保存后以 `null` 存储（schema 默认值 `[]` 生效）。
- 编辑页加载时会把已有 `keywords` 正确回显为格式化文本。

### 发布时间（publishedAt）说明

- `publishedAt` 为日期字段（`<input type="date">`）。
- 发布状态（`published`）下若未手动设置 `publishedAt`，保存时会**自动填充为当前时间**。
- 已设置过 `publishedAt` 的文章再次保存时，若未改该字段则保持原值；若清空则置为 `null`。
- 草稿 / 归档状态下 `publishedAt` 可为空。

### audit_logs 记录

以下操作会写入 `audit_logs`：

- `article.create`：创建 Article
- `article.update`：更新 Article
- `article.status_update`：切换 Article 状态

记录字段：`adminUserId`、`action`、`entityType=article`、`entityId`、`oldData`、`newData`、`ipAddress`（可空）。

- `oldData` / `newData` 仅包含 Article 相关数据（slug / coverImage / authorId / status / publishedAt / 翻译），**不会**写入 `passwordHash`。
- audit log 写入失败时，服务端会记录错误日志，主操作流程仍正常完成。

### 默认测试账号

| 邮箱 | 密码 | 角色 |
|------|------|------|
| `admin@example.com` | `admin123456` | `super_admin` |

### Seed 数据

`pnpm db:seed` 会创建 3 篇示例文章（`how-to-read-emoji-meaning`、`emoji-history-and-unicode` 为 published，`common-emoji-misuses` 为 draft），作者默认为超级管理员，用于列表页验收。

## Phase 4D-1 - Asset / License Management

本阶段完成后台 **Emoji 资源与授权管理（Asset / License）**，包含 Asset 列表、新建、编辑、状态切换、删除，以及 provider / fileType / license / attribution 编辑与校验。

### 范围

- 列表页 `/admin/assets`：分页、关键词搜索（provider / fileType / fileUrl / localPath / licenseName / attribution / Emoji）、provider 筛选、fileType 筛选、status 筛选、isDownloadable 筛选；展示关联 Emoji、provider、fileType、来源（fileUrl / localPath）、licenseName、isDownloadable、status、更新时间，提供编辑链接、创建按钮。
- 新建页 `/admin/assets/create`：选择关联 Emoji、设置 provider / fileType / fileUrl / localPath / width / height / licenseName / licenseUrl / attribution / isDownloadable / status，保存后跳转编辑页。
- 编辑页 `/admin/assets/[id]/edit`：编辑上述全部字段，快捷状态切换，并提供删除（硬删除，二次确认）。
- 关联 Emoji 选择器通过复用的 `GET /api/v1/admin/emojis/options` 获取（id / emojiChar / slug / name）。

### Asset 后台 API 列表

Base URL：`http://localhost:4000/api/v1`

| 方法 | 接口 | 说明 | 鉴权 | 权限 |
|------|------|------|------|------|
| GET | `/api/v1/admin/assets` | Asset 列表（page/limit/q/provider/fileType/status/emojiId/isDownloadable） | 登录 | 可读角色 |
| GET | `/api/v1/admin/assets/{id}` | Asset 详情（完整编辑数据 + 关联 Emoji 摘要） | 登录 | 可读角色 |
| POST | `/api/v1/admin/assets` | 新建 Asset | 登录 | `super_admin` / `editor` |
| PATCH | `/api/v1/admin/assets/{id}` | 更新 Asset | 登录 | `super_admin` / `editor` |
| PATCH | `/api/v1/admin/assets/{id}/status` | 切换状态（draft/published/archived） | 登录 | `super_admin` / `editor` |
| DELETE | `/api/v1/admin/assets/{id}` | 删除 Asset（硬删除；schema 无软删除字段） | 登录 | `super_admin` / `editor` |
| GET | `/api/v1/admin/assets/providers` | provider 允许列表 `[noto, openmoji, twemoji, custom]` | 登录 | 可读角色 |
| GET | `/api/v1/admin/assets/file-types` | fileType 允许列表 `[svg, png, webp, gif]` | 登录 | 可读角色 |
| GET | `/api/v1/admin/emojis/options` | Emoji 选项（id / emojiChar / slug / name），供 Asset 表单选择器 | 登录 | 可读角色 |

> 可读角色：super_admin、editor、seo_manager、translator、reviewer、analyst。写操作仅 `super_admin` / `editor`，其余角色返回 403。未登录返回 401。所有接口均不返回 `passwordHash`。

### Asset 表单字段

`emojiId`、`provider`、`fileType`、`fileUrl`、`localPath`、`width`、`height`、`licenseName`、`licenseUrl`、`attribution`、`isDownloadable`、`status`

### provider / fileType 说明

- `provider` 仅允许：`noto`、`openmoji`、`twemoji`、`custom`。该允许列表是授权合规的权威校验，**Apple / Samsung / Microsoft / 微信 / QQ** 等未授权平台 Emoji 图片来源会被直接拒绝。
- `fileType` 仅允许：`svg`、`png`、`webp`、`gif`。
- `fileUrl` 与 `localPath` 至少填写一项。

### 授权与 attribution 规则

- `isDownloadable = true` 时，`licenseName` 为必填项。
- `provider = custom` 时，`licenseName` 与 `attribution` 均为必填项。
- 后台 UI 明确提示：**Emoji 字符本身与平台图片设计不是一回事**，图片资源必须遵守对应 provider 的开源许可证，并正确填写授权链接（licenseUrl）与出处（attribution）。
- 授权边界说明：本项目仅集成已开源、可合规使用的 Emoji 图片资源（Noto / OpenMoji / Twemoji 等），不抓取或托管任何未授权平台的专有 Emoji 图片（如 Apple、Samsung、Microsoft、微信、QQ 等），也不将其设为可下载资源。自定义（custom）来源必须明确填写 license 与 attribution，由运营者自行承担授权合规责任。

### isDownloadable 规则

- `isDownloadable` 为布尔值；开启时强制要求 `licenseName`（明确授权），UI 同时提示建议填写 `licenseUrl`。

### audit_logs 记录

以下操作会写入 `audit_logs`：

- `asset.create`：创建 Asset
- `asset.update`：更新 Asset
- `asset.status_update`：切换 Asset 状态
- `asset.delete`：删除 Asset（在删除行之前写入）

记录字段：`adminUserId`、`action`、`entityType=asset`、`entityId`、`oldData`、`newData`、`ipAddress`（可空）。

- `oldData` / `newData` 仅包含 Asset 相关数据（emojiId / emoji / provider / fileType / fileUrl / localPath / width / height / licenseName / licenseUrl / attribution / isDownloadable / status），**不会**写入 `passwordHash`。
- audit log 写入失败时，服务端会记录错误日志，主操作流程仍正常完成。

### 默认测试账号

| 邮箱 | 密码 | 角色 |
|------|------|------|
| `admin@example.com` | `admin123456` | `super_admin` |

### Seed 数据

`pnpm db:seed` 会创建 6 个示例 Emoji Asset（provider 轮询 `noto` / `openmoji` / `twemoji`，status 均为 `published`，`isDownloadable = true`，并带对应开源许可证信息），用于列表页验收。

## Phase 4D-2 - SEO Management Center

本阶段完成后台 **SEO 管理中心**，统一管理 Emoji / 分类 / 专题 / 文章 四种实体的 `seoTitle` 与 `seoDescription`，提供 SEO 总览、实体列表、单实体编辑、canonical / hreflang 预览，以及 robots / sitemap 状态检查。**不**生成 sitemap、不接入 Meilisearch、不开发 AI 写作、不改为纯静态站。

### 范围

- SEO 总览页 `/admin/seo`：各实体 SEO 完整度（total / complete / missingTitle / missingDescription / missingAny）、全局缺失计数、按语言（zh / en）缺失计数、最近 seo.update 记录、robots.txt / sitemap.xml 状态、快捷入口（Emoji / 分类 / 专题 / 文章 SEO）。
- SEO 列表页 `/admin/seo/emojis`、`/admin/seo/categories`、`/admin/seo/topics`、`/admin/seo/articles`：分页、关键词搜索、locale 筛选（zh / en / all）、status 筛选、完整度筛选（all / missingTitle / missingDescription / missingAny / complete）；展示名称/标题、slug、locale、seoTitle、seoDescription、字符长度、完整度状态、前台预览链接、编辑按钮。列表以「实体 × locale」为行（一个实体在有 zh/en 翻译时对应两行）。
- SEO 编辑页 `/admin/seo/{entityType}/{id}/edit`（`entityType` ∈ `emoji` / `category` / `topic` / `article`）：展示实体基础信息与 zh / en 翻译，编辑 zh / en `seoTitle` / `seoDescription`，显示字符长度提示、canonical 预览、hreflang 预览、前台预览链接，保存后记录 audit_logs 并返回最新数据。
- canonical / hreflang 预览（只读）：依据实体类型与 slug 生成，见下文。

### SEO 后台页面列表

| 页面 | 说明 |
|------|------|
| `/admin/seo` | SEO 总览 |
| `/admin/seo/emojis` | Emoji SEO 列表 |
| `/admin/seo/categories` | 分类 SEO 列表 |
| `/admin/seo/topics` | 专题 SEO 列表 |
| `/admin/seo/articles` | 文章 SEO 列表 |
| `/admin/seo/{entityType}/{id}/edit` | SEO 编辑页（entityType = emoji / category / topic / article） |

### SEO 后台 API 列表

Base URL：`http://localhost:4000/api/v1`

| 方法 | 接口 | 说明 | 鉴权 | 权限 |
|------|------|------|------|------|
| GET | `/api/v1/admin/seo/overview` | SEO 总览（各实体统计、缺失计数、按语言缺失、最近 seo.update、robots / sitemap 状态） | 登录 | 可读角色 |
| GET | `/api/v1/admin/seo/entities?entityType=emoji` | SEO 实体列表（page/limit/q/locale/status/completeness 筛选，含 canonical / hreflang 预览） | 登录 | 可读角色 |
| GET | `/api/v1/admin/seo/entities/{entityType}/{id}` | 单个实体 SEO 编辑数据（zh/en translations + 基础信息 + canonical / hreflang 预览） | 登录 | 可读角色 |
| PATCH | `/api/v1/admin/seo/entities/{entityType}/{id}` | 更新 zh/en `seoTitle` / `seoDescription` | 登录 | `super_admin` / `editor` / `seo_manager` |
| GET | `/api/v1/admin/seo/robots-status` | robots.txt 状态检查（只读，不写入） | 登录 | 可读角色 |
| GET | `/api/v1/admin/seo/sitemap-status` | sitemap.xml 状态检查（只读，不生成） | 登录 | 可读角色 |

支持的 `entityType`：`emoji`、`category`、`topic`、`article`（非法值返回 400）。

> 可读角色：super_admin、editor、seo_manager、translator、reviewer、analyst。写操作（PATCH）仅 `super_admin` / `editor` / `seo_manager`，其余角色返回 403。未登录返回 401。所有接口均不返回 `passwordHash`。

### SEO 字段管理说明

- 本阶段**复用** `EmojiTranslation` / `CategoryTranslation` / `TopicTranslation` / `ArticleTranslation` 表中已有的 `seoTitle` / `seoDescription` 字段，**不新增**独立的 SEO 表。
- `seoTitle` / `seoDescription` 可为空（视为 SEO 不完整，UI 提示但不强制阻止保存，仅做字符长度建议：标题 10–70、描述 50–180）。
- 保存时拦截字面量字符串 `"undefined"` / `"null"`，避免污染元数据；空值以 `null` 或空字符串表示。
- 列表「完整度」判定：`complete`（标题与描述均非空）、`missingTitle`、`missingDescription`、`missingAny`（标题或描述缺失）。

### canonical / hreflang 预览说明

后台仅做预览，不重构前台 SEO。依据实体类型与 slug 生成（SITE_URL 取自环境变量 `SITE_URL`，默认 `http://localhost:3000`，不写死生产域名）：

| 实体 | zh 路径 | en 路径 |
|------|---------|---------|
| Emoji | `/zh/emoji/{slug}/` | `/en/emoji/{slug}/` |
| Category | `/zh/categories/{slug}/` | `/en/categories/{slug}/` |
| Topic | `/zh/topics/{slug}/` | `/en/topics/{slug}/` |
| Article | `/zh/articles/{slug}/` | `/en/articles/{slug}/` |

- hreflang 预览包含 `zh`、`en`、`x-default`（默认指向 en）。
- Article 前台详情页**尚未实现**，canonical / hreflang 显示为规划路径（`/zh/articles/{slug}/`、`/en/articles/{slug}/`），并标注 `planned / not active`，不强行创建前台文章详情页。

### robots / sitemap 状态边界

本阶段**仅做后台状态展示，不做完整 sitemap 系统**：

- `robots-status` 检查 `apps/web/public/robots.txt` 是否存在、是否疑似全局阻止收录、是否保护 admin noindex（只读，不写入）。该路径可通过环境变量 `WEB_PUBLIC_DIR` 覆盖。
- `sitemap-status` 检查 `apps/web/public/sitemap.xml` 是否存在；不存在时提示将在 Phase 5 / 专门 SEO automation 阶段处理。
- `/admin/*` 已通过页面 `meta robots: { index: false, follow: false }` 强制 noindex，不依赖 robots.txt，也不进入 sitemap。
- 不生成大量 sitemap 文件、不自动扫描数据库生成 sitemap、不开发搜索引擎提交功能、不修改 robots 规则导致前台不可收录。

### audit_logs 记录

以下操作会写入 `audit_logs`：

- `seo.update`：更新 SEO 字段

记录字段：`adminUserId`、`action=seo.update`、`entityType=seo`、`entityId`（格式 `{entityType}:{id}`，如 `emoji:xxxx`）、`oldData`、`newData`、`ipAddress`（可空）。

- `oldData` / `newData` 包含 `{ entityType, entityId, zh: { seoTitle, seoDescription }, en: { seoTitle, seoDescription } }` 的变更前后值，**不会**写入 `passwordHash`。
- audit log 写入失败时，服务端会记录错误日志，主操作流程仍正常完成。

### 默认测试账号

| 邮箱 | 密码 | 角色 |
|------|------|------|
| `admin@example.com` | `admin123456` | `super_admin` |

> 写操作需要 `super_admin` / `editor` / `seo_manager`。如需验收 403，可新增一个 `seo_manager` 或只读角色（如 `translator`）账号进行对比测试。

### Seed 数据

`pnpm db:seed` 创建的 Emoji（30）、分类（含子分类）、专题（5）、文章（3）均带 zh/en 翻译；本阶段在既有 `seoTitle` / `seoDescription` 上做管理与检查，不额外新增 SEO 种子数据。

## Phase 4D-3 - Search Logs, Copy Logs, and Review Management

本阶段完成后台 **Search Logs / Copy Logs / Review Management**，提供搜索日志、复制日志的查看/筛选/分页/摘要，以及基于 `user_submissions` 的审核管理（列表 / 详情 / 状态切换）。**不**接入 Meilisearch、不开发 Analytics 图表、不开发复杂报表、不开发数据导出、不生成 sitemap、不开发 AI 审核、不修改前台搜索/复制逻辑、不改为纯静态站。

> Review Management 直接复用既有 `user_submissions` 模型（含 `SubmissionStatus`：`pending` / `approved` / `rejected` / `spam`），不新增独立 Review 表，也不做占位页。

### 范围

**Search Logs（搜索日志）**

- 列表页 `/admin/search-logs`：分页、关键词（query）搜索、locale 筛选（zh / en / all）、日期范围筛选、resultCount 范围筛选（min / max）；展示 query、locale、resultCount、country、userAgent、ipHash、createdAt。
- 摘要 API `/api/v1/admin/search-logs/summary`：返回 `totalSearches`、`todaySearches`、`zeroResultSearches`、`topQueries`、`searchesByLocale`（zh / en / other）。

**Copy Logs（复制日志）**

- 列表页 `/admin/copy-events`：分页、locale 筛选、emojiId 筛选、日期范围筛选；展示 emojiChar、emoji slug、locale、pageUrl、country、userAgent、ipHash、createdAt。
- 摘要 API `/api/v1/admin/copy-events/summary`：返回 `totalCopies`、`todayCopies`、`topCopiedEmojis`、`copiesByLocale`（zh / en / other）。

**Review Management（审核管理）**

- 列表页 `/admin/reviews`：分页、status 筛选、type 筛选、locale 筛选、关键词搜索（content / userName / userEmail）；展示表情、类型、语言、内容、提交者、状态、时间，并链接到详情页。
- 详情页 `/admin/reviews/[id]`：展示提交完整信息（表情、类型、语言、状态、内容、提交者、邮箱、时间），可切换审核状态（pending / approved / rejected / spam）并填写 adminNote。
- 状态写操作仅 `super_admin` / `reviewer`；其余运营角色（`editor` / `seo_manager` / `analyst`）可查看，但切换状态会返回 403。

### 后台页面列表

| 页面 | 说明 |
|------|------|
| `/admin/search-logs` | 搜索日志列表 + 摘要 |
| `/admin/copy-events` | 复制日志列表 + 摘要 |
| `/admin/reviews` | 审核管理列表 |
| `/admin/reviews/[id]` | 审核详情与状态切换 |

### 后台 API 列表

Base URL：`http://localhost:4000/api/v1`

| 方法 | 接口 | 说明 | 鉴权 | 权限 |
|------|------|------|------|------|
| GET | `/api/v1/admin/search-logs` | 搜索日志列表（page/limit/q/locale/dateFrom/dateTo/minResultCount/maxResultCount） | 登录 | 日志查看角色 |
| GET | `/api/v1/admin/search-logs/summary` | 搜索日志摘要（总数/今日/零结果/热门词/语言分布） | 登录 | 日志查看角色 |
| GET | `/api/v1/admin/copy-events` | 复制日志列表（page/limit/locale/emojiId/dateFrom/dateTo） | 登录 | 日志查看角色 |
| GET | `/api/v1/admin/copy-events/summary` | 复制日志摘要（总数/今日/最热表情/语言分布） | 登录 | 日志查看角色 |
| GET | `/api/v1/admin/reviews` | 审核列表（page/limit/status/type/locale/q/emojiId） | 登录 | 日志查看角色 |
| GET | `/api/v1/admin/reviews/:id` | 审核详情（基于 user_submissions） | 登录 | 日志查看角色 |
| PATCH | `/api/v1/admin/reviews/:id/status` | 切换审核状态（status + 可选 adminNote） | 登录 | `super_admin` / `reviewer` |

> 日志查看角色：super_admin、editor、seo_manager、reviewer、analyst（translator 无日志查看权限，返回 403）。审核写操作仅 `super_admin` / `reviewer`，其余角色返回 403。未登录返回 401。所有接口均不返回 `passwordHash`。

### 权限说明

- `canViewLogs(role)`：日志（搜索日志 / 复制日志 / 审核列表与详情）查看权限。
- `canManageReview(role)`：审核状态写操作权限（切换 user_submissions 状态）。
- 新增可读角色 `reviewer`、`analyst` 用于运营查看；日志为运营数据，翻译角色 `translator` 默认不授予日志查看权限。

### 敏感数据处理说明

- `search_logs` / `copy_events` 模型**不存储明文 IP**，仅存储不可逆的 `ipHash`（当前由前台事件接口写入为 `null`）与粗略 `country`。后台列表仅展示 `ipHash` 与 `country`，**绝不返回明文 IP**。
- `user_submissions` 中的 `userEmail` 为提交者自行填写的联系字段（非管理员敏感数据），在审核上下文中展示；不返回任何 `passwordHash` 或管理员敏感字段。
- 所有 admin 日志 / 审核接口均经 `AdminAuthGuard` 保护，未登录返回 401。
- `/admin/*` 已通过页面 `meta robots: { index: false, follow: false }` 强制 noindex。

### audit_logs 记录

以下操作会写入 `audit_logs`：

- `review.update`：切换审核状态（或更新 adminNote）

记录字段：`adminUserId`、`action=review.update`、`entityType=user_submission`、`entityId`（submission id）、`oldData`（`{ id, status, adminNote }`）、`newData`（`{ id, status, adminNote }`）、`ipAddress`（可空）。

- `oldData` / `newData` **不会**写入 `passwordHash` 或任何明文 IP。
- 搜索日志 / 复制日志为只读查看，不写入 audit_logs。
- audit log 写入失败时，服务端记录错误日志，主操作流程仍正常完成。

### 默认测试账号

| 邮箱 | 密码 | 角色 |
|------|------|------|
| `admin@example.com` | `admin123456` | `super_admin` |

> 日志查看需要 super_admin / editor / seo_manager / reviewer / analyst。如需验收 403：
> - 日志查看 403：新增一个 `translator` 账号登录后访问日志接口。
> - 审核写 403：使用 `editor` / `seo_manager` / `analyst` 账号（非 super_admin / reviewer）访问 `PATCH /api/v1/admin/reviews/:id/status`。

### Seed 数据

`pnpm db:seed` 在既有 Emoji（30）、分类、专题（5）、文章（3）基础上，**新增**：

- 10 条 `search_logs`（含中英文 query、resultCount、country、ipHash、userAgent）。
- 10 条 `copy_events`（关联前 10 个 Emoji，含 locale、pageUrl、country、ipHash）。
- 5 条 `user_submissions`（覆盖 pending / approved / rejected / spam 状态与 example / culture_note / correction / translation_suggestion / new_usage 类型），用于审核管理验收。

## Phase 4D-4 - Admin CMS Acceptance and Security Hardening

本阶段为 **Phase 4 Admin CMS 的整体验收与安全加固**（Phase 4 后台 CMS 全模块回归 + 权限矩阵 + 安全 + audit_logs + 构建全绿）。不开发新业务模块、不新增 CMS CRUD、不接入 Meilisearch、不生成 sitemap、不开发 AI 工具、不改为纯静态站、不改 Prisma schema、不重构前台页面。

### 已完成范围（Phase 4 全部后台模块）

| 模块 | 页面 | 后台 API |
|------|------|----------|
| Auth | `/admin/login` | `POST /admin/auth/login`、`GET /admin/auth/me`、`POST /admin/auth/logout`、`GET /admin/health` |
| Dashboard | `/admin/dashboard` | `GET /admin/dashboard` |
| Emoji | `/admin/emojis`、`/admin/emojis/create`、`/admin/emojis/[id]/edit` | list/detail/create/update/status/options |
| Category | `/admin/categories`、`/admin/categories/create`、`/admin/categories/[id]/edit` | list/detail/create/update/status/tree/options |
| Topic | `/admin/topics`、`/admin/topics/create`、`/admin/topics/[id]/edit` | list/detail/create/update/status/emojis(PUT)/emoji-options |
| Article | `/admin/articles`、`/admin/articles/create`、`/admin/articles/[id]/edit` | list/detail/create/update/status |
| Asset | `/admin/assets`、`/admin/assets/create`、`/admin/assets/[id]/edit` | list/detail/create/update/status/delete/providers/file-types/emojis-options |
| SEO | `/admin/seo` 及 `emojis|categories|topics|articles` 列表与编辑页 | overview/entities(PATCH)/robots-status/sitemap-status |
| Search Logs | `/admin/search-logs` | list + summary |
| Copy Logs | `/admin/copy-events` | list + summary |
| Review | `/admin/reviews`、`/admin/reviews/[id]` | list/detail/`PATCH :id/status` |

### 权限与安全说明

- 所有后台 API 与页面均经 `AdminAuthGuard`（JWT + httpOnly `admin_token` Cookie）保护：未登录访问受保护 API 返回 `401`；未登录访问受保护页面由客户端 `AuthProvider` 重定向到 `/admin/login`。
- 权限矩阵（详见 `apps/api/src/modules/admin/role.util.ts`，命名清晰的 `canManage*` / `canView*` / `assertCan*` helper）：
  - `super_admin`：可读全部、可写全部后台内容模块与 SEO、可审核。
  - `editor`：可读主要模块；可管理 Emoji / Category / Topic / Article / Asset；可编辑 SEO。
  - `seo_manager`：可读主要模块；可编辑 SEO；**不可**管理内容模块。
  - `translator`：可读相关模块（含内容读、SEO 读、日志读）；**无任何写权限**。
  - `reviewer`：可读日志与 review；可管理 review 状态；**不可**写其他内容。
  - `analyst`：可读日志类数据；**无写权限**。
  - 权限不足返回 `403`，未登录返回 `401`，不存在资源返回 `404`，非法参数返回 `400`。
- **敏感字段不泄露**：
  - 登录 / `/me` 响应仅返回 `{ id, email, name, role }`（经 `toPublic()` 脱敏），绝不返回 `passwordHash`。
  - `JWT_SECRET` 仅从环境变量读取（开发兜底 `change_me`），绝不硬编码真实值、绝不返回到 API、README 中不出现真实密钥。
  - `search_logs` / `copy_events` / `user_submissions` 响应仅返回不可逆的 `ipHash` 与粗略 `country`，绝不返回明文 IP；`audit_logs.ipAddress` 在 review / SEO 操作中写 `null`。
- **架构约束**：`apps/admin` 与 `apps/web` 均不直接 import `@prisma/client`，全部数据经由 `apps/api` 的 API 层获取，未改为纯静态站。

### audit_logs 覆盖说明

以下操作均写入 `audit_logs`（`adminUserId` / `action` / `entityType` / `entityId` / `oldData` / `newData` / `ipAddress`）：

- Emoji：`emoji.create` / `emoji.update` / `emoji.status_update`
- Category：`category.create` / `category.update` / `category.status_update`
- Topic：`topic.create` / `topic.update` / `topic.status_update` / `topic.update_emojis`
- Article：`article.create` / `article.update` / `article.status_update`
- Asset：`asset.create` / `asset.update` / `asset.status_update` / `asset.delete`
- SEO：`seo.update`
- Review：`review.update`

记录字段仅含实体数据，**不含 `passwordHash` / `JWT_SECRET` / 明文 IP**；写入失败时仅服务端记录错误日志，不阻断主流程。

### noindex / admin robots 边界说明

- 后台根布局设置 `robots: { index: false, follow: false }`，因此 `/admin/login`、Dashboard 及全部 CMS 页面均为 `noindex, nofollow`，不应被搜索引擎收录，也不得进入任何未来的 sitemap。
- 前台页面（Web）保持可收录，未受 admin 模块影响。
- 本阶段仅做后台状态展示，未生成 sitemap、未接入 Meilisearch、未开发 AI 工具。

### 默认测试账号

| 邮箱 | 密码 | 角色 |
|------|------|------|
| `admin@example.com` | `admin123456` | `super_admin` |

> 验收时另用 `translator` / `seo_manager` / `reviewer` / `analyst` 账号对比验证 403 / 日志与审核边界（见 `role.util.ts`）。

### 构建与验收命令（本阶段执行，全部 0 error）

```
pnpm install
pnpm db:generate
pnpm db:migrate
pnpm db:seed
pnpm lint
pnpm typecheck
pnpm build
```

## Phase 5A - Sitemap, Robots, and Indexing Automation

本阶段完成全站 sitemap、robots 与索引边界自动化：sitemap index、实体 sitemap、动态 `robots.txt`，并联动后台 SEO 状态检查。不开发公开文章详情页、不开发 AI 内容生成、不批量生成低质量页面、不接入 Meilisearch、不做复杂 SEO 评分、不改为纯静态站生成器。

### Sitemap 自动化范围

- 在 `apps/web` 以 Next.js App Router **route handler**（动态 `force-dynamic`，运行时生成，非静态文件、非一次性生成）实现：
  - `/sitemap.xml` —— sitemap index，引用 `static` / `emojis` / `categories` / `topics` 四个子 sitemap。
  - `/sitemaps/static.xml` —— 公开落地/列表页（首页、`/emojis`、`/categories`、`/topics`、`/search`，中英各一）。
  - `/sitemaps/emojis.xml` / `categories.xml` / `topics.xml` —— 已发布实体的详情页（每实体中英双 URL + hreflang）。
  - `/sitemaps/articles.xml` —— **预留空 urlset**（见下方 Article 边界说明），暂不进入 sitemap index。
- `apps/web` **不直连 Prisma**：实体数据来自 `apps/api` 新增的公开只读 sitemap API（`GET /api/v1/sitemap/{emojis,categories,topics,articles}`），仅返回 `published` 实体的 `slug` + `updatedAt` + `createdAt`，无后台字段、无 `passwordHash`、无需 admin 鉴权。

### sitemap index 说明

- `/sitemap.xml` 为 `<sitemapindex>`，列出 `static` / `emojis` / `categories` / `topics` 四个子 sitemap 地址。
- **刻意不包含 `articles`**：文章前台详情页尚未实现（Phase 5B），避免指向不存在页面。

### 实体 sitemap 说明

- 每条 `<url>` 包含：
  - `<loc>`：`http://<NEXT_PUBLIC_SITE_URL>/zh|en/{segment}/{slug}`（**无尾部斜杠**，与前台 `canonical` 保持一致）。
  - `<xhtml:link rel="alternate" hreflang="zh|en|x-default">`：中英互链，`x-default` 指向英文。
  - `<lastmod>`：使用实体 `updatedAt`（ISO 8601）；未提供时回退 `createdAt`，**不使用当前时间伪造**。
  - `<changefreq>` / `<priority>`：emoji 详情 `monthly`/`0.8`；category / topic 详情 `weekly`/`0.7`；静态页 `weekly`~`daily` / `0.6`~`0.9`（首页 `0.9`）。

### robots.txt 规则说明

- `apps/web` 动态生成 `robots.txt`（`/robots.txt` route handler）：
  - `Allow: /` —— 允许抓取全部公开前台页。
  - `Disallow: /admin/` —— 禁止抓取后台。
  - `Disallow: /api/v1/admin/` —— 禁止抓取后台 API。
  - `Sitemap: {NEXT_PUBLIC_SITE_URL}/sitemap.xml` —— 引用 sitemap 索引，**不写死生产域名**（由 `NEXT_PUBLIC_SITE_URL` 驱动）。

### admin noindex 边界说明

- 后台根布局仍设置 `robots: { index: false, follow: false }`，`/admin/*`（含 `/admin/login` 与全部 CMS 页）均为 `noindex, nofollow`，独立于 `robots.txt`，**不会进入任何 sitemap**。

### draft / archived 不收录说明

- 所有 sitemap 数据经 `status = 'published'` 过滤：draft / archived 实体不返回、不进入 sitemap。
- `/sitemaps/articles.xml` 当前为空，且不在 index 中（文章前台页未实现）。

### query search 页面不批量加入 sitemap 说明

- 仅收录 `/zh/search` 与 `/en/search` 基础页；**搜索结果页（`?q=...`）不批量加入 sitemap**，避免低质量/重复 URL。

### sitemap 分片边界说明

- 单个 sitemap URL 上限 50,000、文件上限 50MB（sitemap.org 约束）；当前数据量小，暂不分片。
- 代码结构便于后续按 `entity + page` 分片：`apps/api` 的 sitemap API 已支持 `limit`（上限 50,000）/ `offset` 分页参数，web 端子 sitemap 可平滑切换为分片拉取。

### 后台 SEO 状态联动

- `apps/api` 的 `robots-status` / `sitemap-status` 改为**探测真实 web 路由**（`fetch` 实时探测 `/robots.txt` 与 `/sitemap.xml`），与实际动态 robots / sitemap 状态一致；未运行 web 时优雅降级并提示。未新增任何 SEO 管理中心复杂功能。

### 下一阶段 Phase 5B

**Phase 5B - Public Article Pages and Content Scale**（公开文章详情页与内容规模化）：实现文章前台详情页，启用 `/sitemaps/articles.xml` 并将其加入 sitemap index。

## Phase 5B - Public Article Pages and Content Scale

本阶段完成公开文章页面与内容规模化基础能力：公开文章列表页、公开文章详情页、中英文文章路由、文章 SEO metadata / canonical / hreflang、文章 JSON-LD、文章 sitemap 启用。不开发 AI 自动写文章、不批量生成低质量文章、不接入 Meilisearch、不开发复杂推荐算法、不开发 SEO 评分器、不改为纯静态站。

### Public Article Pages 范围

- 列表页 `/zh/articles/` 与 `/en/articles/`：展示 published 文章（标题、摘要、封面图、发布时间、阅读入口），支持分页，空状态可读，移动端可用。
- 详情页 `/zh/articles/{slug}/` 与 `/en/articles/{slug}/`：展示标题、摘要、正文 `content`、发布时间、封面图（如有）、作者（显示名）、返回文章列表链接；不存在 / draft / archived 返回 404；缺当前语言 translation 时返回 404（不渲染空白或 undefined 页面）。

### Article 公共路由

| 页面 | 地址 |
|------|------|
| 文章列表（中） | http://localhost:3000/zh/articles/ |
| 文章列表（英） | http://localhost:3000/en/articles/ |
| 文章详情（中） | http://localhost:3000/zh/articles/{slug}/ |
| 文章详情（英） | http://localhost:3000/en/articles/{slug}/ |

### Article 公共 API

Base URL：`http://localhost:4000/api/v1`

| 方法 | 接口 | 说明 | 鉴权 |
|------|------|------|------|
| GET | `/api/v1/articles` | 已发布文章列表（page/limit/locale） | 不需要 |
| GET | `/api/v1/articles/{slug}` | 已发布文章详情（含 zh/en translation、author 显示名、relatedArticles） | 不需要 |

- 仅返回 `published` 文章；draft / archived 不返回、不进 sitemap。
- 不返回后台敏感字段、不返回 `passwordHash` / `JWT_SECRET`；author 仅暴露显示 `name`。
- `slug` 不存在或该 locale 无 translation 返回 `404`；`limit` 上限 `MAX_LIMIT`（100）。

### Article SEO metadata

- 列表页：中英文 `title` / `description`，正确 `canonical` 与 `hreflang`（zh / en / x-default），Open Graph 基础字段，不 `noindex`。
- 详情页：`title` 用 `seoTitle`（缺失回退 `title`）；`description` 用 `seoDescription`（缺失回退 `summary`）；`canonical` / `hreflang` / `html lang` 正确；`openGraph` 带 `publishedTime` / `modifiedTime` / `authors`；draft / archived 不允许被索引（返回 404）。

### Article JSON-LD

详情页注入 `BlogPosting` 结构化数据：`headline`、`description`、`inLanguage`、`datePublished`、`dateModified`、`image`（如有）、`author`（如有）、`mainEntityOfPage`、`publisher`。不含 `undefined` / `null` 键；不编造作者信息；URL 由 `NEXT_PUBLIC_SITE_URL` 驱动，不写死生产域名。

### Article sitemap 启用

- `/sitemaps/articles.xml` 返回 published 文章的 `/zh/articles/{slug}/` 与 `/en/articles/{slug}/` 双语言 URL（含 hreflang、`lastmod`、`changefreq=weekly`、`priority=0.7`）。
- `/sitemap.xml` 索引已包含 `articles` 子 sitemap。
- `robots.txt` 不阻止文章页面；`/admin/*` 仍不进入 sitemap、仍 `noindex`。

### 内容质量边界

本阶段只上线页面能力，不批量生成低质量内容：

- 不批量复制竞品文章；不自动生成大量空文章页。
- 不把无正文、无标题、未发布文章收录。
- 文章列表展示 seed 数据与后台已有 published 文章。
- 后续内容规模化必须遵守**原创、授权、质量审核**要求：所有文章须为原创或可合规授权内容，发布前经人工质量审核，禁止抓取竞品文案/图片，禁止机器批量灌水。

## Phase 5D - Performance, Crawl Budget, and Structured Data Hardening

**Phase 5D** - 性能、抓取预算与结构化数据加固（已完成）。不改为纯静态站、不破坏已完成 Admin CMS / Sitemap / 公开页面、不接入 Meilisearch、不开发 AI 自动生成内容、不批量生成低质量内容、不开发新的 CMS CRUD、不复制竞品代码 / 文案 / 数据库 / 图片。

### 性能基础加固范围

- 公开页面（首页 / 列表页 / 详情页 / 文章页）逐个核查：重复请求、过大 JSON 响应、页面渲染 undefined / null、阻塞渲染大组件、图片缺失 width / height / alt、无意义 console error、前台直连 Prisma、Admin 代码泄漏。
- 仅做小范围、可逆修复，不大改架构；列表页 canonical 已统一指向基础列表页（分页 `?page=` 不生成独立索引 URL）。

### Crawl Budget 规则

- `/admin/*` 与 `/api/v1/admin/*` 不收录（`robots.txt` 禁止 + Admin 根布局 `noindex,nofollow`）。
- 缺失 / draft / archived 详情页统一返回 **404**（emoji / category / topic / article 公共接口仅返回 `published`，且详情页捕获 `ApiError.status === 404` 调用 `notFound()`）。
- search query 结果页（`/zh/search?q=...`、`/en/search?q=...`）输出 `noindex, follow`，canonical / hreflang 回指基础搜索页，避免无限多 query URL 被批量收录；基础搜索落地页 `/zh/search`、`/en/search` 仍可索引并已进入 sitemap。
- sitemap 仅包含公开、可索引、`published` 页面；不含 `/admin`、不含 `/api/v1/admin/`、不含 draft / archived。

### Structured Data 加固

- Emoji / Category / Topic 详情页保留 `BreadcrumbList`（含 FAQ 时附 `FAQPage`）；Article 详情页保留 `BreadcrumbList` + `BlogPosting`。
- 所有 JSON-LD 由 `apps/web/src/lib/seo.ts` 构造，保证**不包含 undefined / null 键**（缺失字段直接省略），URL 统一使用 `NEXT_PUBLIC_SITE_URL`，不编造不存在字段、不编造作者 / 日期 / publisher。

### Metadata / canonical / hreflang 规则

- `html lang` 由根布局中间件按路径（/zh → zh，/en → en）服务端设置。
- title / description / canonical 经 `safeText` / `optionalText` 兜底，不为 undefined / null。
- zh 页面 canonical 指向 zh，en 页面 canonical 指向 en；hreflang 同时输出 zh / en / x-default，x-default 默认指向 en。
- Open Graph `url` 与 canonical 一致；OG title / description 不为空。
- draft / archived 不生成可索引 metadata（接口 404 → 页面 404）。

### Sitemap / Robots 回归

- 复查 `/sitemap.xml` 索引与 `static / emojis / categories / topics / articles` 六个子 sitemap，XML 格式有效、index 引用正确、不含 admin / draft / undefined。
- `robots.txt` 禁止后台路径并包含 `Sitemap:`；SEO 管理中心 `robots-status` / `sitemap-status` 探测实时 web 路由仍准确。

## Phase 5C - SEO Quality Checker and Internal Linking

本阶段完成基础 SEO 质量检查与基础内部链接能力：后台质量检查页与 API、11 种 SEO 问题类型、内部链接建议、公开文章详情页相关专题/表情模块。**不**自动改写 title/description、不批量生成内容、不接入 Meilisearch、不开发复杂评分算法、不改为纯静态站、不复制竞品代码/文案/数据库/图片。

### SEO Quality Checker 范围

- 后台总览页 `/admin/seo/quality`：检查总数、通过数量、问题数、警告数、按实体类型统计（emoji / category / topic / article）、按问题类型统计、最近发现问题、一键「运行检查」、快捷跳转到 SEO 编辑页。
- 后台问题列表页 `/admin/seo/quality/issues`：分页 + 筛选（实体类型 / 问题类型 / 严重级别 / 语言 / 关键词），每条问题展示实体摘要、问题类型、严重程度、说明、建议操作、编辑入口、公开页入口。
- 实时只读扫描：每次请求基于数据库当前数据计算，不落库、不修改任何实体数据。

### SEO issue 类型说明

| issueType | 触发条件 | 严重程度 |
|------|------|------|
| `missingSeoTitle` | seoTitle 缺失（null / 空） | issue |
| `missingSeoDescription` | seoDescription 缺失 | issue |
| `titleTooShort` | seoTitle 长度 < 10 字符 | warning |
| `titleTooLong` | seoTitle 长度 > 70 字符 | warning |
| `descriptionTooShort` | seoDescription 长度 < 50 字符 | warning |
| `descriptionTooLong` | seoDescription 长度 > 180 字符 | warning |
| `missingCanonicalPreview` | 已发布页面 slug 无效（空 / 含 undefined / null / 非法格式），无法生成 canonical | issue |
| `missingHreflangPreview` | 已发布页面缺 zh 或 en 翻译，无法生成 hreflang 交替 | issue |
| `missingJsonLd` | 已发布 emoji/topic/article 因 slug 无效或双语名称均缺失，无法生成 JSON-LD | issue |
| `sitemapMismatch` | 已发布内容因 slug 无效无法正确进入 sitemap | issue |
| `noInternalLinks` | 实体缺少可关联的内部内容（如 emoji 无分类且无专题、category 下无 emoji、topic 无绑定 emoji、文章无其它已发布文章） | warning |

> 说明：canonical / hreflang / JSON-LD 为**风险检查**，聚焦「已发布页面是否具备可用的预览/结构化数据」；不强制为所有页面新增复杂 JSON-LD，不编造作者 / 日期 / publisher。

### SEO quality API 说明

Base URL：`http://localhost:4000/api/v1`（全部需 admin 登录，401 未登录 / 403 权限不足）

| 方法 | 接口 | 说明 | 权限 |
|------|------|------|------|
| GET | `/api/v1/admin/seo/quality/overview` | 质量总览（总数 / 通过 / issue / warning / 按类型 / 最近） | 查看：super_admin / editor / seo_manager / reviewer / analyst |
| GET | `/api/v1/admin/seo/quality/issues` | 问题列表（page / limit / entityType / issueType / severity / locale / q + 分页 meta + 按类型计数） | 查看（同上） |
| POST | `/api/v1/admin/seo/quality/run` | 即时只读重查，不写库、不自动改写 | 运行：super_admin / editor / seo_manager |
| GET | `/api/v1/admin/seo/internal-links/suggestions` | 内部链接建议（entityType / id / locale） | 查看（同上） |

- 建议数据全部来自已有 Emoji / Category / Topic / Article 数据，基于关键词/标题 token 重叠简单匹配，**不调用 AI、不接入 Meilisearch、不改写内容**。
- 建议来源：emoji → 同分类 emoji + 关联专题；category → 分类下 emoji + 同分类相关专题；topic → 绑定 emoji + 共享 emoji 的其它专题；article → 关键词相关文章 + 相关专题 + 相关 emoji。

### Internal Linking 规则说明

- 公开详情页已有相关模块：emoji（同分类表情 + 相关专题）、topic（绑定表情 + 相关专题）、category（分类表情 + 相关专题）、article（相关文章 + **本阶段新增相关专题与相关表情**）。
- 每页只添加适度相关链接模块，链接均真实存在、不指向 draft / archived、不显示 undefined / null。
- 禁止：大量重复链接、页面堆满链接、隐藏链接、关键词堆砌、复制竞品内链结构、使用 AI 生成推荐文案。

### 禁止 AI 自动生成 / 关键词堆砌

- 不开发 AI 自动写 SEO（title / description 仍由人工在后台编辑）。
- 不自动改写 title / description，不批量生成内容，不接入 Meilisearch。
- 不开发复杂 SEO 评分系统、不开发搜索排名预测、不开发外链系统。
- 内部链接基于简单关键词匹配，数量受控，避免关键词堆砌与隐藏链接，符合搜索引擎质量规范。

## Phase 5E - Phase 5 Final Acceptance

**Phase 5E**（已完成）是对 Phase 5A–5D 全部公开 SEO / 性能 / 结构化数据成果的**最终验收与收尾阶段**。本阶段不新增业务功能，仅做验收、回归、安全边界复查与文档收尾，并确认可进入 Phase 6。

### Phase 5 完成范围

Phase 5 完整覆盖：sitemap / robots / indexing 自动化（5A）、公开文章页与内容规模化（5B）、SEO 质量检查与内部链接（5C）、性能 / 抓取预算 / 结构化数据加固（5D），并在 5E 完成统一验收。所有公开页面均为 Next.js App Router **动态渲染**（`force-dynamic`，运行时经 API 取数），**非纯静态站生成器**；`apps/web` 与 `apps/admin` 均不直连 Prisma。

### Sitemap / Robots / Indexing 总结（Phase 5A 验收）

- `/sitemap.xml` 为合法 `<sitemapindex>`，引用 `static` / `emojis` / `categories` / `topics` / `articles` 五个子 sitemap。
- 全部子 sitemap 返回 200、`application/xml`，XML 格式有效；不含 `/admin`、不含 `/api/v1/admin/`、不含 `draft` / `archived`、不含 `undefined` / `null`。
- URL 统一使用 `NEXT_PUBLIC_SITE_URL`（本地为 `http://localhost:3000`），与前台 `canonical` 一致（无尾部斜杠）。
- `/robots.txt` 返回 200、`text/plain`：`Allow: /` + `Disallow: /admin/` + `Disallow: /api/v1/admin/` + `Sitemap: {NEXT_PUBLIC_SITE_URL}/sitemap.xml`；不阻止任何公开核心页面。
- 后台 `/admin/*` 经根布局 `noindex, nofollow`，独立于 `robots.txt`，**不进入任何 sitemap**。

### Public Article Pages 总结（Phase 5B 验收）

- 公开文章列表 `/zh/articles/`、`/en/articles/` 与详情 `/zh/articles/{slug}/`、`/en/articles/{slug}/` 均返回 200。
- 公开 Article API `GET /api/v1/articles` 与 `GET /api/v1/articles/{slug}` 仅返回 `published`；draft / archived / 不存在 slug 返回 **404**。
- 文章详情 `canonical` / `hreflang`（zh / en / x-default）/ `html lang` 正确；注入 `BlogPosting` JSON-LD（无 `undefined` / `null` 键、不编造作者/日期）。
- `/sitemaps/articles.xml` 含 published 文章双语言 URL + hreflang + `lastmod`，并已进入 sitemap index；不含 draft / archived。
- 页面可见内容无 `undefined` / `null`，作者仅暴露显示名。

### SEO Quality Checker 总结（Phase 5C 验收）

- 后台 `/admin/seo/quality` 与 `/admin/seo/quality/issues` 登录后可访问；未登录访问 API 返回 **401**，权限不足返回 **403**。
- `GET /admin/seo/quality/overview`、`GET /admin/seo/quality/issues` 正常返回；`POST /admin/seo/quality/run` 为**即时只读重查**（验收实测返回 201，仍属成功且不写库、不自动改写内容）。
- 11 种 issue 类型合理（缺失/过短/过长/预览不可用/无内链等）；问题按实体类型、问题类型、严重级别、语言、关键词可筛选。
- 后台 SEO 状态 `robots-status` / `sitemap-status` 实时探测 web 路由仍然准确。

### Internal Linking 总结（Phase 5C 验收）

- `GET /admin/seo/internal-links/suggestions?entityType=article&id={id}&locale=zh` 返回真实存在的链接建议（验收实测返回 6 条，含相关文章与相关专题，带 `url` / `title` / `score`）。
- 建议来源为已有 Emoji / Category / Topic / Article 数据，基于关键词/标题 token 重叠匹配，**不调用 AI、不接入 Meilisearch、不指向 draft / archived、不含 undefined / null**。
- 公开详情页相关模块（emoji 同分类表情 + 相关专题、topic 绑定表情 + 相关专题、category 分类表情 + 相关专题、article 相关文章 + 相关专题 + 相关表情）链接均真实存在。

### Structured Data / Crawl Budget 总结（Phase 5D 验收）

- metadata（title / description / canonical）经 `safeText` / `optionalText` 兜底，不含 `undefined` / `null`。
- `canonical`：zh 指向 zh、en 指向 en；`hreflang` 同时输出 zh / en / x-default（x-default 默认指向 en）。
- JSON-LD 由 `apps/web/src/lib/seo.ts` 构造，不含 `undefined` / `null` 键，不编造 author / date / image / publisher；可见类型含 `BreadcrumbList`、`FAQPage`、`BlogPosting`。
- sitemap 与 canonical 一致；draft / archived 不可索引（接口 404 → 页面 `notFound()`）。
- search query 结果页（`/zh/search?q=...`、`/en/search?q=...`）输出 `noindex, follow`，canonical / hreflang 回指基础搜索页，不批量进入 sitemap；基础搜索落地页可索引。
- SEO Quality Checker 在 5D 改动后未受影响（端点完整且受保护）。

### 命令验收（Phase 5E）

`pnpm install` / `pnpm db:generate` / `pnpm db:migrate` / `pnpm db:seed` / `pnpm lint` / `pnpm typecheck` / `pnpm build` **全部通过，0 error、0 warning**。

### Phase 6 预留说明

下一阶段 **Phase 6 - Search Infrastructure and Advanced Discovery**（详见 [ROADMAP.md](./ROADMAP.md)）：在保持现有动态渲染架构与 SEO 边界的前提下，规划搜索基础设施与高级发现能力（如可选的搜索体验增强与索引优化）。本阶段**未接入 Meilisearch**、**未生成 AI 内容**、**未批量生成低质量内容**、**未改为纯静态站**，这些约束在 Phase 6 仍应遵守，除非经明确确认。部署与长期维护（Docker / Nginx / HTTPS / 备份 / 监控 / Search Console / CDN）作为后续基础设施工作另行安排。

## Phase 6A - Search Infrastructure Planning

**Phase 6A**（已完成）是搜索基础设施**规划与抽象层准备**阶段，为 Phase 6B（Meilisearch Integration）打基础。本阶段**不接入 Meilisearch、不安装 SDK、不创建真实索引、不改为纯静态站、不生成 AI 内容**。

### Search Provider 抽象

- `apps/api/src/modules/search/` 新增抽象层：
  - `search-provider.interface.ts`：`SearchProvider` 接口（至少含 `search()`）。
  - `search.types.ts`：Provider 类型、查询/结果类型、规划用索引文档类型（Emoji/Category/Topic/Article）。
  - `search.config.ts`：从环境变量加载 `SearchConfig`（默认 `database`，含 `fallback`）。
  - `database-search.provider.ts`：默认 provider，复用现有数据库搜索逻辑（locale 感知、published-only、分页、search_log 记录）。
  - `meilisearch-search.provider.ts`：Phase 6B 预留 stub（`isAvailable()` 恒为 false，不连接）。
  - `search.service.ts`：按 config 选择 provider；提供只读 `getInfrastructureStatus()`。
- `SearchService.search()` 签名保持不变，公开搜索 API `GET /api/v1/search` 与 `/zh/search` `/en/search` 行为不变。

### Database Provider 作为默认 Fallback

- `SEARCH_PROVIDER` 缺省为 `database`。
- 若配置为 `meilisearch` 但 6A 未连接，自动 fallback 到 `database` 并记录 warn。

### 后台搜索基础设施状态

- API：`GET /api/v1/admin/search/infrastructure/status`（需 admin auth，只读，不泄露密钥）。
- 页面：`/admin/search/infrastructure`（继承 admin 根布局 `noindex, nofollow`）。
- 返回：`currentProvider / fallbackProvider / meilisearchConfigured / meilisearchEnabled / indexEntitiesPlanned / indexReady / lastIndexedAt / notes`。

### Meilisearch 作为 Phase 6B 目标

- Meilisearch 在 6A 仅是规划与 stub；真实接入在 Phase 6B，需经明确确认。
- docker-compose 中已预留 meilisearch 服务；6A 不修改 docker-compose、不启动。

### 索引实体范围

规划进入外部索引（Phase 6B）：**Emoji / Category / Topic / Article**。**Asset 暂不纳入**（版权 / 授权 / 重复内容风险）。仅 `published` 进入索引。

### 字段 / 多语言 / 排序规划（详见 [docs/search-infrastructure-plan.md](./docs/search-infrastructure-plan.md)）

- 字段：每类实体规划 `id / type / locale / slug / name|title / keywords / status / updatedAt / publicUrl` 等（见规划文档）。
- 多语言：单索引 + locale 字段；`/zh` 默认 `zh`、`/en` 默认 `en`；emojiChar / unicodeCodepoint / shortcode exact match 优先；跨语言 fallback 默认不启用。
- 排序：emojiChar → unicodeCodepoint → shortcode → name/title → slug → prefix → keyword → category/topic relevance →（6E）copy/search 信号 → updatedAt/publishedAt tie-breaker。6A 不实现复杂评分。

### 安全与索引边界

- 不返回 `passwordHash` / `JWT_SECRET` / Meilisearch API Key / 明文敏感 IP。
- 不索引 draft / archived、不索引 `/admin` 与 admin-only 字段。
- `apps/web` 与 `apps/admin` 不直接访问 Prisma；不破坏 `/admin/*` noindex、sitemap / robots。

### 环境变量（规划）

```
SEARCH_PROVIDER=database
MEILISEARCH_HOST=
MEILISEARCH_API_KEY=
MEILISEARCH_INDEX_PREFIX=emoji_platform
```

默认 `database`；`MEILISEARCH_*` 为空时不导致启动失败；不写真实密钥。

### 下一阶段

**Phase 6B - Meilisearch Integration**：基于本阶段抽象接入 Meilisearch，实现 Emoji / Category / Topic / Article 的外部索引与高级发现；保持现有 SEO 边界不变。接入需经明确确认。

## 开发规范

请参阅 [DEVELOPMENT_RULES.md](./DEVELOPMENT_RULES.md) 和 [ROADMAP.md](./ROADMAP.md)。
