# Preview Security & SEO Strategy

> Preview 环境的安全边界与 SEO 策略。仅规划，不部署、不含真实密钥/IP/token。

---

## 1. 安全边界（必须）

1. **Admin 后台不公开传播**：仅团队内部 / 受邀测试者，链接不对外发。
2. **Admin 强密码**：预览 admin 账号使用强随机密码（由部署者在 `.env.preview` 设置，不入库、不写文档）。
3. **JWT_SECRET 随机强密钥**：preview 使用独立随机 `JWT_SECRET`（≥32 字节随机），由部署者生成，**不写入文档 / 不提交**。
4. **Meilisearch API key 不暴露前端**：`MEILISEARCH_API_KEY` 仅服务端（api 容器）使用，绝不出现在 `NEXT_PUBLIC_*`。
5. **PostgreSQL 不开放公网端口**：仅内部 Docker 网络，宿主机不映射 5432。
6. **Meilisearch 不开放公网端口**：仅内部网络；如必须临时排查，经隧道访问，不暴露 7700。
7. **Nginx 不暴露内部端口**：仅监听 80/443；admin/api 经内部反代，不映射到宿主机公网。
8. **安全组最小开放**：仅开放 22(SSH)、80、443；admin/api/db 端口不对外开放。
9. **不提交 `.env`**：`.env` / `.env.preview` / `.env.production` 均不提交（已加入 `.gitignore`）。
10. **不提交服务器 IP / 密码 / token**：本文档与模板一律占位。
11. **GitHub PAT 不入库**：不写入 remote、git config、任何文件；CI 用仓库 secret，不在代码中出现。
12. **`/admin/*` noindex**：admin 根 layout 已 `noindex,nofollow`（既有约束），预览期维持。
13. **不做正式 SEO 提交**：不向 Google / Bing / 百度提交 preview。
14. **sitemap / robots 谨慎处理**：见 §2。

---

## 2. Preview SEO 策略（不做正式 SEO）

1. **全站 noindex**：preview 环境建议网站级 `noindex, nofollow`，防止被搜索引擎收录。
2. **robots 禁止抓取**：`robots.txt` 可全站 `Disallow: /`，或至少 `Disallow: /admin` 与 `Disallow: /api`。
3. **正式 production 才开放 sitemap**：preview 不对外提交 `sitemap.xml`。
4. **不提交 preview sitemap**：不向任何站长平台提交 preview 的 sitemap / Indexing API。
5. **不接国内 CDN**（本阶段约束）。
6. **不做站长平台验证**（Google/Bing/百度）。
7. **不公开传播 preview 链接**。
8. **防误收录**：若担心搜索引擎抓到 preview 子域，除 noindex 外，可在 Nginx 层对 preview 域加 `X-Robots-Tag: noindex` 响应头作为双保险。

> 正式上线（路线 A/B）时再重新开启 sitemap / robots / indexing 策略，并分离 preview 与 production 的索引控制。

---

## 3. 密钥与配置管理清单（Phase 7B 落地）

| 项 | 本阶段 | Phase 7B |
|---|---|---|
| `JWT_SECRET` 环境变量化 + 强随机 | 规划（占位） | 落地 |
| `CORS_ORIGIN` 替换硬编码 localhost | 规划 | 落地 |
| `COOKIE_SECURE` / `COOKIE_DOMAIN` | 规划 | 落地（如支持） |
| `ADMIN_ALLOWED_ORIGINS` | 规划 | 落地（如支持） |
| `RATE_LIMIT_ENABLED` | 规划 | 落地（如支持） |
| `.env.preview` 实际生成 | 不生成 | 由部署者生成（不提交） |

---

## 4. 风险回退

- 若 `preview.example.com` 因未备案被拦截：切回 **IP + 端口** 或 **SSH Tunnel / Tailscale**。
- 若服务器资源紧张：关闭 Meilisearch（DB fallback）、降容器内存、加 swap。
- 若发现密钥泄露风险：立即轮换 JWT_SECRET / Meilisearch key / admin 密码（preview 可重置）。
