# Phase 7A — Preview Deployment Architecture and Production Path

> 本阶段只做**预览部署架构设计与后续正式上线方案规划**，不做真实部署、不连接真实服务器、不写真实生产密钥、不写真实服务器 IP。
> 仓库当前处于 `phase-6f-complete`，工作区 clean，main 与 origin/main 同步。

---

## 0. 本阶段定位（边界声明）

- **本阶段产出 = 文档 + 不含真实密钥的模板文件**。不改动任何业务代码、不改动 Prisma schema、不改为纯静态站。
- **不执行真实部署**：不连服务器、不解析域名、不启动容器、不写 `.env` / `.env.production`、不写真实 IP / 密码 / token / JWT_SECRET / Meilisearch key / GitHub PAT。
- **下一步是 Phase 7B**（Preview Environment, Secrets, and Config Hardening），负责把本阶段规划落地为可运行的配置（含 CORS 环境变量化、cookie 安全、限流等）。本阶段不启动 7B。

---

## 1. Preview 部署定位（明确写入）

当前腾讯云**国内**小服务器上的部署，**仅**作为以下角色，且**不是**正式 Production：

| 是（Preview / Staging / Internal） | 不是（正式） |
|---|---|
| 1. Preview environment（功能预览） | 1. 正式 production |
| 2. Internal testing environment（内部测试） | 2. 正式中国大陆网站 |
| 3. Debug / optimization environment（调试优化） | 3. 正式 SEO 站点 |
| 4. Staging-like environment（类预发） | 4. 正式对外推广站点 |
| | 5. 正式国内 CDN 站点 |

**强制约束（本阶段及后续预览期均适用）：**

- 不接国内 CDN。
- 不做正式 SEO 提交（不向 Google / Bing / 百度站长平台提交 sitemap，不做站长验证）。
- 预览环境全站 `noindex`，`robots.txt` 禁止抓取（至少禁止 `/admin`）。
- 后台 `/admin/*` 不公开传播。
- 不提交任何真实 `.env`。

---

## 2. 当前用户真实情况（前置决策依据）

1. 用户目前只有**一台已有的国内腾讯云小服务器**。
2. 用户有一个在**阿里云购买的域名**（记为 `example.com`，下文示例统一用 `example.com` 作占位，非真实域名）。
3. 该域名**目前没有 ICP 备案**。
4. 当前目标不是正式生产上线，而是先在已有的国内小服务器上做：功能预览 / 调试 / 优化 / 迭代 / 内部测试。
5. 等功能稳定后，再考虑：
   - 路线 A：购买**香港 / 海外服务器**正式上线（无需备案）；或
   - 路线 B：完成**国内 ICP 备案**后用国内服务器 + 国内 CDN 正式上线。
6. 因为域名未备案，**本阶段不能把国内腾讯云部署定义为正式中国大陆生产站点**。

---

## 3. 未备案域名解析到中国大陆服务器的风险（明确说明）

> 以下为合规与可用性风险说明，非部署操作。

- **访问可能被拦截 / 阻断**：中国大陆对未备案域名解析到大陆服务器有监管，境内访问可能被阻断或无法长期稳定访问。
- **无法通过国内 ICP 备案前置的常规加速**：未备案不能使用国内 CDN、国内云厂商的多数加速/防护产品。
- **不稳定、不适合长期对外**：未备案域名 + 大陆服务器，不适合作为正式对外站点或对外推广链接。
- **结论**：预览期若使用 `preview.example.com` 子域名解析到国内服务器，**随时可能被拦截**；一旦被拦截，应立即切回 **IP + 端口** 或 **SSH Tunnel / 内网访问** 方案，或启用路线 A 的海外服务器。

---

## 4. 三种 Preview 访问方式（比较 + 优缺点）

所有示例均为占位，不写真实 IP / 域名。

### 方案 A：公网 IP + 端口（最推荐用于初期联调）

- 形式：`http://SERVER_IP:3000`（web）、`http://SERVER_IP:3001`（admin）、`http://SERVER_IP:4000`（api）
- 或经 Nginx 收敛为 `http://SERVER_IP/`、`http://SERVER_IP/admin`、`http://SERVER_IP/api`
- 优点：
  1. 最快速：无需 DNS、无需证书，绑定服务器后即可联调。
  2. 与当前硬编码 CORS（`localhost:3000/3001`）兼容性最好——通过 SSH 端口转发把远程端口映射到本地 `localhost:PORT` 后，浏览器 Origin 即为 `http://localhost:3000`，CORS 直接放行（详见 §6 与 §7）。
  3. 安全组只需最小开放少数端口。
- 缺点：
  1. 不适合正式传播（IP 难记、像临时环境）。
  2. HTTPS 配置较麻烦（需为 IP 签发证书或用自签/隧道）。
  3. 直接暴露端口时攻击面更大，需收紧安全组。

### 方案 B：preview 子域名（调试体验更接近正式，但受备案风险制约）

- 形式：`preview.example.com`（web）、`admin-preview.example.com`（admin）、`api-preview.example.com`（api）
- 或单域路径：`preview.example.com` / `preview.example.com/admin` / `preview.example.com/api`
- 优点：
  1. 调试体验接近正式环境，URL 语义清晰。
  2. 便于后续迁移到正式多子域架构（路线 A/B 均为多子域）。
- 缺点 / 风险：
  1. **未备案域名解析到国内服务器可能被拦截**，不保证长期稳定访问。
  2. 不接国内 CDN（本阶段约束）。
  3. 不做正式 SEO 提交（本阶段约束）。
  4. 子域 HTTPS 证书需为每个子域配置（见 §7）。
  5. **当前 API CORS 硬编码仅允许 `localhost`，子域来源会被拦截**——需待 Phase 7B 将 CORS 改为 `CORS_ORIGIN` 环境变量驱动后才能稳定工作。
  6. 一旦被拦截，应切回方案 A / 方案 C / 路线 A。

### 方案 C：SSH Tunnel / 内网访问（最安全，适合内部测试）

- 形式：SSH 端口转发、`Tailscale`、`ZeroTier`、`Cloudflare Tunnel`（如可用）等。
- 优点：
  1. 更适合内部测试，不公开暴露后台与 API。
  2. 更安全：公网不开放 admin / api 端口。
  3. 与当前硬编码 CORS 兼容（本地 `localhost:PORT` Origin）。
- 缺点：
  1. 对非技术测试人员不够方便（需客户端/组网工具）。
  2. 调试链路依赖隧道稳定性。

### 推荐组合

- **首选（当前硬编码 CORS 下最稳）**：方案 A（IP + 端口，或 SSH 端口转发到本地）用于功能联调与内部测试；对需要"接近正式 URL 体验"的少量场景，再叠加方案 B 的 `preview.example.com`，但**预期其可能因未备案被拦截**。
- **长期预览安全基线**：方案 C（SSH Tunnel / Tailscale）作为后台与 API 的默认访问方式，公网只暴露 web。

---

## 5. 推荐 Preview 架构（单台腾讯云小服务器）

```
                  ┌──────────────── 腾讯云 国内小服务器 (单台) ────────────────┐
  浏览器 ──(80/443)──▶  Nginx (preview)  ── proxy ──▶  web   (container :3000)
        (SSH Tunnel)                   ├─ proxy ──▶  admin (container :3001, 仅内网/隧道)
                                       └─ proxy ──▶  api   (container :4000, 仅内网/隧道)
                                      │
                      PostgreSQL (container, 不暴露公网)
                      Meilisearch (container, 不暴露公网；资源不足时关闭，用 DB fallback)
                      Redis (container, 不暴露公网)
                      Docker volumes: postgres_data / meilisearch_data / backup
                  └────────────────────────────────────────────────────────────┘
```

### 资源占用与服务器规格分析

| 规格 | 评价 | 建议 |
|---|---|---|
| 1 核 2G | 仅适合**轻量预览** | 关闭 Meilisearch（用 DB fallback）、限制容器内存、加 swap、只跑必要服务（web+admin+api+postgres，redis 可选） |
| 2 核 4G | 更适合跑**完整 preview** | 可开 Meilisearch；仍建议设容器内存上限与 restart policy |
| < 2G 无 swap | 风险高 | 必须加 swap（如 1–2G 文件 swap），否则 build / migrate 易 OOM |

**降低资源占用的具体措施：**

1. **Meilisearch 可关闭**：`SEARCH_PROVIDER=database` 时完全不连 Meilisearch，搜索走数据库（项目已内置 fallback）。资源不足时优先关闭它。
2. **PostgreSQL 与 Meilisearch 同机**：预览期允许同机；生产路线再评估分离。
3. **加 swap**：小内存机器建议 1–2G 文件 swap，避免 build / `prisma migrate` OOM。
4. **限制容器内存**：Compose 中给各服务设 `deploy.resources.limits.memory`，防止单服务吃满整机。
5. **只运行必要服务**：联调期可先不启 Meilisearch；Redis 若当前仅缓存用途且非强依赖，可评估是否必需（见 §9 数据库规划）。
6. **日志保留策略**：配 `logging.options.max-size` / `max-file`，避免日志占满磁盘。

---

## 6. web / admin / api 路由方式比较（结合当前项目结构）

当前项目事实（探查结果）：

- `apps/web` 与 `apps/admin` 均为 **Next.js `output: 'standalone'`**，且 `next.config.*` **未设置 `basePath`**。
- `apps/api` 的 `main.ts` 设全局前缀 `api/v1`，CORS **硬编码**为 `['http://localhost:3000','http://localhost:3001']`，**不读 `CORS_ORIGIN`**。
- 生产环境（`.env.example`）按 **多子域** 设计：`SITE_URL` / `ADMIN_URL` / `API_URL` 分属不同 host。

### 方式 A：子域名（推荐）

```
preview.example.com        → web
admin-preview.example.com  → admin
api-preview.example.com    → api
```

- 优点：服务边界清晰；CORS 模型与正式环境一致（每个 origin 独立）；后续路线 A/B 多子域迁移成本最低。
- 缺点：DNS 记录多；每个子域需配 HTTPS 证书；子域解析到未备案国内服务器风险更明显。
- **前提**：需 Phase 7B 将 API CORS 改为 `CORS_ORIGIN` 环境变量驱动，否则子域来源被当前硬编码拦截。

### 方式 B：单域名路径

```
preview.example.com        → web
preview.example.com/admin  → admin
preview.example.com/api    → api
```

- 优点：只需一个 DNS 记录；配置简单；适合小服务器预览。
- 缺点：
  1. Nginx path rewrite 更复杂。
  2. **Admin / API 需确认 base path 兼容**：admin 是独立 Next 应用，若经 `/admin` 提供，需 `next.config` 设 `basePath: '/admin'`（并相应处理静态资源前缀）；API 需加全局前缀 `/api`（当前已是 `api/v1`，但还需在 Nginx 把 `/api` 反代到 api 容器，且客户端 `NEXT_PUBLIC_API_URL` 要指向 `/api`）。
  3. 与正式多子域部署**不完全一致**，迁移时需回退 basePath。
- **结论**：方式 B 需要改动 `next.config`（basePath）与 API 前缀/客户端 URL，属于 Phase 7B 的"配置硬化"范畴；本阶段**不修改业务/配置**，故方式 B 仅作规划记录。

### 路由方式推荐

> **Preview 阶段优先采用方式 A（子域名）**，与正式多子域架构一致，且避免改动 `next.config` 的 `basePath`。
> 在 CORS 尚未环境变量化之前（Phase 7B 之前），**实际操作上最稳的是"方式 A 的域名形态 + 方案 A/C 的访问通道"**：即先用 `IP:端口` 或 `SSH Tunnel` 做联调，待 7B 完成 CORS 环境变量化后，再启用 `preview.example.com` 等子域。

---

## 7. 后续步骤（交给 Phase 7B）

本阶段只规划，以下为 Phase 7B 落地项（明确列出，便于衔接）：

- 将 API CORS 改为读取 `CORS_ORIGIN`（逗号分隔多 origin），替换 `main.ts` 硬编码白名单。
- 引入 `COOKIE_SECURE` / `COOKIE_DOMAIN` / `ADMIN_ALLOWED_ORIGINS` / `RATE_LIMIT_ENABLED`（如项目支持）等预览安全变量。
- 提供真实可调的 `.env.preview`（不提交）与 Nginx preview 配置，完成单台服务器预览部署。
- 确定 preview 域名 / IP / 证书策略并落地。

---

## 8. 验收清单（本阶段）

| # | 项 | 状态 |
|---|---|---|
| 1 | Preview 部署定位明确 | ✅ |
| 2 | 国内腾讯云小服务器预览方案明确 | ✅ |
| 3 | 未备案域名风险说明明确 | ✅ |
| 4 | IP / preview 子域名 / SSH Tunnel 三种方式已比较 | ✅ |
| 5 | web/admin/api 路由方式已比较 | ✅ |
| 6 | Docker Compose preview 规划明确 | ✅（见 `preview-docker-plan.md`） |
| 7 | preview 环境变量策略明确 | ✅（见 `.env.preview.example` + `preview-environment-strategy.md`） |
| 8 | preview 数据库与备份规划明确 | ✅（见 `preview-docker-plan.md`） |
| 9 | preview 安全边界明确 | ✅（见 `preview-security-and-seo.md`） |
| 10 | preview SEO 策略明确 | ✅（见 `preview-security-and-seo.md`） |
| 11 | 后续海外正式上线方案明确 | ✅（见 `production-path-options.md`） |
| 12 | 后续国内备案正式上线方案明确 | ✅（见 `production-path-options.md`） |
| 13 | README / HANDOFF / CHANGELOG 已更新 | ✅ |
| 14–18 | 未写真实密钥/IP、未提交 .env.production、未改业务、未改纯静态 | ✅（全部仅占位） |
| 19 | lint / typecheck / build 通过 | ✅（见验证记录） |
