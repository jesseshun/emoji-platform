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

**Phase 3C** - Emoji Detail and SEO 已完成。

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
| GET | `/api/v1/search` | 基础搜索 |
| POST | `/api/v1/events/copy` | 记录复制事件 |

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

## 下一阶段

**Phase 3D** - Search and Copy Experience:

- Emoji detail page
- Metadata
- Canonical
- Hreflang
- Breadcrumb schema
- FAQ schema

## 开发规范

请参阅 [DEVELOPMENT_RULES.md](./DEVELOPMENT_RULES.md) 和 [ROADMAP.md](./ROADMAP.md)。
