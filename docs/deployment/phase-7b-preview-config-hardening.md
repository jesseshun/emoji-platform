# Phase 7B — Preview Environment, Secrets, and Config Hardening

> 本阶段把 Phase 7A 的预览部署规划**落地为可运行的配置加固**：CORS / Cookie / JWT 改为环境变量驱动，补齐 Secrets 管理与 noindex/robots 策略，完善 env 模板与文档。
> **本阶段不真实部署、不连接真实服务器、不写真实 IP / 密码 / token / JWT_SECRET / Meilisearch key / GitHub PAT。**

---

## 1. 本阶段改动概览（边界声明）

- **仅配置加固，不改业务功能，不改 Prisma schema，不改为纯静态站。**
- 代码改动集中在 API 配置层：`apps/api/src/main.ts`（CORS）、`apps/api/src/modules/admin/admin-auth.controller.ts`（Cookie）、`apps/api/src/modules/admin/admin.module.ts`（JWT_SECRET）、新增 `apps/api/src/common/security-config.ts`（配置解析 helper）。
- 新增/完善 env 模板：`.env.example`、`.env.preview.example`、`.env.production.example`。
- 文档更新：本文件 + `preview-environment-strategy.md` + `preview-security-and-seo.md` + README / PROJECT_HANDOFF / CHANGELOG。

---

## 2. CORS 配置（替换硬编码 localhost）

**改动前**：`main.ts` 硬编码 `origin: ['http://localhost:3000','http://localhost:3001']`，不读取任何环境变量。

**改动后**：`buildAllowedCorsOrigins()` 合并以下来源（逗号分隔、自动 trim、忽略空值、去重）：

| 变量 | 含义 |
|---|---|
| `CORS_ORIGIN` | Web 等前端来源（多 origin 逗号分隔） |
| `ADMIN_ALLOWED_ORIGINS` | Admin 后台来源 |
| `WEB_BASE_URL` | 可选，自动放行 Web 站点 |
| `ADMIN_BASE_URL` | 可选，自动放行 Admin 站点 |

行为规则：

1. **本地开发默认仍可用**：以上变量全部为空时，回退到 `http://localhost:3000` / `http://localhost:3001`。
2. **Preview 可配置**：通过 `.env.preview` 的 `CORS_ORIGIN` / `ADMIN_ALLOWED_ORIGINS` 配置 preview 域名或服务器 IP；不写死任何域名/IP。
3. **多 origin 支持**：逗号分隔、trim、忽略空值。
4. **不允许 `*` + credentials**：`credentials: true` 下，白名单外来源一律 `cb(null, false)` 拒绝；白名单内显式回显具体 origin，绝不使用 `*`。
5. **无 Origin 头的请求**（服务端到服务端 / 同源）：放行且不设置通配 `Access-Control-Allow-Origin`，避免破坏内部调用。
6. **不输出敏感 env 值到日志**。

---

## 3. Cookie / Auth 配置

**改动前**：`admin-auth.controller.ts` 中 `secure: process.env.NODE_ENV === 'production'`（硬编码）。

**改动后**：通过 `resolveCookieSecure()` / `resolveCookieDomain()` 读取环境变量：

- `COOKIE_SECURE`：
  - 显式 `true` / `false` 优先。
  - 未设置时：production / preview（`APP_ENV=preview`）默认 `true`，本地开发默认 `false`。
  - Preview 在 HTTP（IP+端口）联调时可设 `false`；HTTPS 正式环境应设 `true`。
- `COOKIE_DOMAIN`：
  - 为空（默认）时返回 `undefined`，由浏览器按当前 host 处理。
  - **IP + 端口访问时应留空**；preview 子域访问时按实际域名配置（写进真实 `.env.preview`，不入库）。
  - 绝不写死正式域名。
- `logout` 的 `clearCookie` 同步带上 `domain`，确保正确清除。

**JWT_SECRET 策略（消除弱默认）**：

- 原 `secret: config.get('JWT_SECRET') || 'change_me'` 的弱默认已移除。
- **缺失时**：production / preview（`APP_ENV=preview` 或 `NODE_ENV=production`）直接启动失败（fail-fast，抛出明确错误）；本地开发使用告警占位值 `dev_insecure_jwt_secret_change_me_do_not_ship` 并打印 warn，避免误用于预览/生产。
- 生成方式（仅在服务器执行，结果写入真实 env，不提交、不写文档）：
  ```bash
  openssl rand -base64 32
  ```

---

## 4. Preview noindex / robots 策略

- `PREVIEW_NOINDEX=true`（`.env.preview` 默认）时，应通过以下方式确保预览全站不被收录：
  - **Nginx 层**（推荐双保险）：对 preview 域加 `X-Robots-Tag: noindex` 响应头。
  - **robots 层**：`robots.txt` 全站 `Disallow: /`（至少 `Disallow: /admin` 与 `Disallow: /api`）。
  - 后台 `/admin/*` 仍由 admin 根 layout 维持 `noindex,nofollow`（既有约束）。
- **不向搜索引擎提交 preview sitemap**，不做正式 SEO 提交，不接国内 CDN。
- **production 才开放**正式 sitemap / robots / 站长平台（对应 `PREVIEW_NOINDEX=false`）。
- 若当前架构暂不便动态切换全站 noindex，按上述 Nginx / robots 层处理即可，文档已明确。

---

## 5. Secrets 安全要求与 .gitignore

- 已确认 `/workspace/emoji-platform/.gitignore` 覆盖以下真实文件（**不提交**）：
  - `.env`、`.env.local`、`.env.preview`、`.env.production`、`.env.development`、`.env.staging`、`.env.*.local` 等任意 `.env.*` 变体。
  - 例外（**可提交占位模板**）：`.env.example`、`.env.preview.example`、`.env.production.example`。
- **GitHub PAT 不写入**任何文件 / remote URL / git config；仅可一次性用于 `git push`，推送后确认 remote URL 不含 token。
- 文档与模板中 **不写** 真实 `JWT_SECRET` / `DATABASE_URL` / `MEILISEARCH_API_KEY` / `POSTGRES_PASSWORD` / 真实服务器 IP / 真实域名 / GitHub PAT，一律用 `<...>` 占位。

---

## 6. 环境变量模板

| 文件 | 提交？ | 用途 |
|---|---|---|
| `.env.example` | ✅ 提交 | 本地开发模板（默认值，含 Phase 7B 变量） |
| `.env.preview.example` | ✅ 提交 | 预览环境占位模板（无真实值） |
| `.env.production.example` | ✅ 提交 | 生产环境占位模板（无真实值） |
| `.env` / `.env.local` | ❌ 不提交 | 本地真实值 |
| `.env.preview` | ❌ 不提交 | 预览真实值（服务器手动创建） |
| `.env.production` | ❌ 不提交 | 生产真实值（服务器手动创建） |

**Preview 必备变量**（详见 `.env.preview.example`）：

```env
NODE_ENV=production
APP_ENV=preview

NEXT_PUBLIC_SITE_URL=
NEXT_PUBLIC_API_URL=
NEXT_PUBLIC_ADMIN_URL=

WEB_BASE_URL=
ADMIN_BASE_URL=
API_BASE_URL=

CORS_ORIGIN=
ADMIN_ALLOWED_ORIGINS=

DATABASE_URL=
POSTGRES_USER=
POSTGRES_PASSWORD=
POSTGRES_DB=

JWT_SECRET=

SEARCH_PROVIDER=database
MEILISEARCH_HOST=
MEILISEARCH_API_KEY=
MEILISEARCH_INDEX_PREFIX=emoji_platform_preview

COOKIE_DOMAIN=
COOKIE_SECURE=false

PREVIEW_NOINDEX=true
RATE_LIMIT_ENABLED=false
```

> 仅占位值；不写真实服务器 IP、域名、数据库密码、JWT_SECRET、Meilisearch key、GitHub PAT。

---

## 7. 验收清单（本阶段）

| # | 项 | 状态 |
|---|---|---|
| 1 | CORS 不再硬编码 localhost | ✅ |
| 2 | 本地 localhost 仍可用 | ✅ |
| 3 | Preview origin 可经环境变量配置 | ✅ |
| 4 | 支持多 origin（逗号分隔/trim/忽略空值） | ✅ |
| 5 | 不允许 `*` + credentials | ✅ |
| 6 | `.env.preview.example` 存在且无真实密钥 | ✅ |
| 7 | `.env.production.example` 存在且无真实密钥 | ✅ |
| 8 | `.gitignore` 忽略真实 env 文件 | ✅ |
| 9 | 未提交真实 token / password / secret | ✅ |
| 10 | 未提交真实服务器 IP | ✅ |
| 11 | JWT_SECRET 不再使用弱默认值（prod/preview fail-fast） | ✅ |
| 12 | Cookie 配置可经环境变量控制 | ✅ |
| 13 | Preview noindex / robots 策略已记录 | ✅ |
| 14 | README / PROJECT_HANDOFF / CHANGELOG 已更新 | ✅ |
| 15 | 未修改业务功能 | ✅ |
| 16 | 未改为纯静态站 | ✅ |
| 17 | lint / typecheck / build 通过 | ✅（见验收记录） |

---

## 8. 下一步

**Phase 7C - Preview Docker Deployment and Server Setup**：基于本阶段加固后的配置，完成单台服务器预览部署——`docker-compose.preview.yml` 真实化、Nginx preview 配置、HTTPS/证书策略、preview 库 seed/迁移、healthcheck 与备份演练。本阶段不启动 7C。
