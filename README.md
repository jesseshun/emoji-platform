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

**Phase 4D-1** - Asset / License Management 已完成。

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

## 下一阶段

**Phase 4D-2** - SEO Management Center（SEO 管理中心）。

> 本阶段（Phase 4D-1）完成后台资源与授权管理（CRUD + 删除 + provider/fileType 允许列表 + 授权校验 + audit_logs）。**不在本阶段范围**：SEO 管理中心、Search Logs / Copy Logs 后台列表、Review Management、Analytics 图表、Meilisearch、sitemap、AI 工具、前台资源下载系统、图片上传到对象存储、复杂文件上传服务。不改为纯静态站。

## 开发规范

请参阅 [DEVELOPMENT_RULES.md](./DEVELOPMENT_RULES.md) 和 [ROADMAP.md](./ROADMAP.md)。
