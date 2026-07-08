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

**Phase 1** - Monorepo 基础架构搭建完成。

## 技术栈

- **Monorepo**: pnpm workspace
- **前台 (Web)**: Next.js + TypeScript + Tailwind CSS
- **后台 (Admin)**: Next.js + TypeScript + Tailwind CSS
- **API**: NestJS + TypeScript
- **数据库**: PostgreSQL + Prisma（Phase 2 接入）
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
├── packages/
│   ├── shared/       # 共享工具函数
│   ├── types/        # 共享类型定义
│   └── ui/           # 共享 UI 组件
├── database/
│   ├── migrations/   # 数据库迁移（Phase 2）
│   └── seeders/      # 种子数据（Phase 2）
├── scripts/          # 工具脚本
├── docker-compose.yml
├── .env.example
├── pnpm-workspace.yaml
└── package.json
```

## 环境变量

复制 `.env.example` 为 `.env` 并按需修改：

```bash
cp .env.example .env
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

## 本地安装

```bash
# 确保已安装 pnpm（>= 8.0.0）和 Node.js（>= 18.0.0）
pnpm install
```

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
| 分类浏览 | http://localhost:3000/zh/categories/ |
| 专题内容 | http://localhost:3000/zh/topics/ |
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

### API

| 接口 | 地址 |
|------|------|
| 健康检查 | http://localhost:4000/api/v1/health |
| 状态查询 | http://localhost:4000/api/v1/status |

## 当前阶段完成范围

Phase 1 - Monorepo Base Architecture:

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

## 下一阶段

**Phase 2** - Database and Prisma:

- PostgreSQL 数据库
- Prisma ORM 接入
- 核心数据模型设计
- 种子数据
- Emoji 导入脚本
- 数据库健康检查

## 开发规范

请参阅 [DEVELOPMENT_RULES.md](./DEVELOPMENT_RULES.md) 和 [ROADMAP.md](./ROADMAP.md)。
