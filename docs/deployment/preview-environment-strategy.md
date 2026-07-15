# Preview Environment Strategy

> 本文件定义 emoji-platform 在**单台国内腾讯云小服务器**上的 Preview / Staging / Internal Test 环境策略。
> 仅规划，不部署；不含任何真实密钥、IP、token、密码、GitHub PAT。

---

## 1. 环境性质

| 维度 | Preview 环境 |
|---|---|
| 目的 | 功能预览、内部测试、调试、优化、迭代 |
| 对外程度 | 仅限团队内部 / 受邀测试者 |
| SEO | 全站 `noindex`，不提交 sitemap |
| CDN | 不接国内 CDN |
| 备案 | 不要求（因非正式站点） |
| 稳定性预期 | 低——未备案域名解析国内服务器可能被拦截 |

**明确不是**：正式 production、正式中国大陆网站、正式 SEO 站点、对外推广站点、国内 CDN 站点。

---

## 2. Preview vs Production 区别

| 项 | Preview（本阶段） | Production（路线 A/B，未来） |
|---|---|---|
| 域名 | `preview.example.com`（占位，未备案也可用 IP） | 已备案主域 / 海外域 |
| HTTPS | 可选（IP 场景可免，或自签/隧道） | 强制（Let's Encrypt / 云证书） |
| 备案 | 不需要 | 路线 B 需要；路线 A 不需要 |
| CDN | 不接 | 路线 B 可选国内 CDN；路线 A 不用国内 CDN |
| SEO | noindex，不提交 | 开放 sitemap / robots / 站长平台 |
| 数据 | 独立 preview DB + seed（少量，无敏感生产数据） | 独立生产 DB，受备份/合规约束 |
| 访问 | IP/子域/隧道，后台限内网 | 公网多子域 |
| 监控 | 基础（容器 healthcheck / 日志） | 监控 + 告警 + 备份演练 |

---

## 3. Preview 环境变量策略（概述）

完整变量清单见 `.env.preview.example`。原则：

1. **只写变量名 + 占位值 + 用途**，绝不写真实值 / token / 密码 / PAT。
2. `.env.preview` **不提交**（已在 `.gitignore` 忽略）；`.env.preview.example` **可提交**。
3. preview 与 production 使用**不同的**强随机 `JWT_SECRET`、`POSTGRES_PASSWORD`、`MEILISEARCH_API_KEY`，preview 密钥不得复用于生产。
4. `NODE_ENV` 在容器内固定为 `production`（Dockerfile runner 阶段已设），compose 注入的预览业务变量仅控制行为（如 `SEARCH_PROVIDER`）。
5. `NEXT_PUBLIC_*` 为构建期注入，必须随镜像构建时确定；preview 与 production 的站点 URL 不同，需分别构建或用不同 env 构建。

### 变量分组

- **通用**：`NODE_ENV`、`NEXT_PUBLIC_SITE_URL`、`NEXT_PUBLIC_API_URL`、`NEXT_PUBLIC_ADMIN_URL`
- **API**：`DATABASE_URL`、`JWT_SECRET`、`CORS_ORIGIN`（Phase 7B 启用）、`WEB_BASE_URL`、`ADMIN_BASE_URL`
- **PostgreSQL**：`POSTGRES_USER`、`POSTGRES_PASSWORD`、`POSTGRES_DB`
- **Meilisearch**：`SEARCH_PROVIDER`、`MEILISEARCH_HOST`、`MEILISEARCH_API_KEY`、`MEILISEARCH_INDEX_PREFIX`
- **Preview 安全**：`COOKIE_SECURE`、`COOKIE_DOMAIN`、`ADMIN_ALLOWED_ORIGINS`（如支持）、`RATE_LIMIT_ENABLED`（如支持）

> 注意：当前代码 `main.ts` 的 CORS 为硬编码 localhost，上述 `CORS_ORIGIN` 等**尚未被读取**，需 Phase 7B 落地。本文件仅规划其存在与用途。

---

## 4. 资源与运行策略

- 低配（1C2G）：关 Meilisearch（`SEARCH_PROVIDER=database`），加 swap，限容器内存，只跑必要服务。
- 中配（2C4G）：可开完整栈（web/admin/api/postgres/meilisearch/redis）。
- 所有服务 `restart: unless-stopped` + healthcheck。
- 日志 `max-size` / `max-file` 限制，避免占满磁盘。

---

## 5. 访问通道决策

- 默认内部测试走 **SSH Tunnel / Tailscale**（方案 C），公网仅暴露 web。
- 快速联调走 **IP + 端口**（方案 A）。
- 体验接近正式走 **preview 子域**（方案 B），但预期可能因未备案被拦截，需有回退。
