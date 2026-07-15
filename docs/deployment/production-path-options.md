# Production Path Options（后续正式上线两条路线）

> 本文件规划**功能稳定后**的两条正式上线路线。本阶段不执行，仅规划。不含真实 IP / 密钥。

---

## 总览

| | 路线 A：香港 / 海外服务器 | 路线 B：国内备案后 |
|---|---|---|
| 是否需要 ICP 备案 | 否 | 是 |
| 适用 | 不想备案、想尽快上线、海外优先 | 重点国内、重视百度/微信/国内体验 |
| CDN | 不用国内 CDN | 可选国内 CDN |
| 上线速度 | 快 | 慢（备案耗时） |
| 国内访问 | 普通速度，可能不稳定 | 稳定 |
| 合规要求 | 低 | 高（内容合规、接入备案） |

两条路线**共享同一套应用架构**（pnpm monorepo + web/admin/api + PostgreSQL + Meilisearch + Nginx + Docker Compose），差异在服务器地域、域名/备案、CDN、SEO 提交时机。

---

## 路线 A：香港 / 海外服务器正式上线

**适合：**
1. 不想做 ICP 备案。
2. 想尽快正式上线。
3. 海外访问优先。
4. 国内访问可接受普通速度。

**架构：**
- 香港 / 新加坡 / 日本 / 美国 VPS（任选）。
- Docker Compose（web/admin/api/postgres/meilisearch/redis/nginx）。
- Nginx + HTTPS（Let's Encrypt 或云厂商证书）。
- 独立生产 PostgreSQL、Meilisearch。
- 多子域：`www.example.com`(web) / `admin.example.com`(admin) / `api.example.com`(api)（或单域路径，生产期再定）。

**优点：**
1. 不需 ICP 备案，上线快。
2. 适合海外 SEO（Google / Bing 收录无备案门槛）。
3. 与 preview 架构迁移成本低（同 Docker Compose 范式）。

**缺点：**
1. 国内访问速度不一定稳定。
2. 不能接中国大陆 CDN。
3. 国内搜索（百度）与微信生态体验可能不如备案站。

**正式 SEO 开启时机：** 路线 A 上线后，可向 Google / Bing 提交 sitemap、做站长验证（百度视情况）。

---

## 路线 B：国内备案后正式上线

**适合：**
1. 重点做国内访问。
2. 重视百度 / 微信 / 国内用户体验。
3. 希望使用国内 CDN。

**前提：** 完成域名 ICP 备案（与服务器地域/服务商一致）。

**架构：**
- 国内腾讯云 / 阿里云服务器。
- ICP 备案完成。
- 国内 CDN（可选，如腾讯云 CDN / 阿里云 CDN）。
- Docker Compose + Nginx + HTTPS。
- 独立生产 PostgreSQL、Meilisearch。

**优点：**
1. 国内访问稳定。
2. 可接国内 CDN，加速与防护更好。
3. 国内搜索引擎与微信生态更友好。

**缺点：**
1. 备案耗时（通常数日到数周）。
2. 内容合规要求更高（需持续合规）。
3. 变更主体 / 域名 / 服务商时可能要重新接入备案。

**正式 SEO 开启时机：** 备案完成、CDN 接好后，再向百度 / 微信 / Google 提交 sitemap 与站长验证。

---

## 迁移路径（preview → production）

1. **架构不变**：preview 已验证的 Docker Compose + Nginx 范式直接复用。
2. **配置硬化**：Phase 7B 完成 CORS / cookie / 限流 / 密钥管理。
3. **数据分离**：preview 库与 production 库独立；production 用真实 seed + 内容管理（CMS）产出数据。
4. **域名/证书**：路线 A 用海外域 + Let's Encrypt；路线 B 用备案域 + 国内证书 + CDN。
5. **SEO 开启**：production 才开放 sitemap / robots / indexing，preview 始终保持 noindex。
6. **监控/备份**：production 加监控告警与定期备份演练（preview 仅基础备份）。

---

## 决策建议

- 当前阶段（未备案 + 国内小服务器）：**只做 preview**，不要把它当 production。
- 想快速验证海外市场 / 避免备案：优先 **路线 A**。
- 国内业务为主、愿意投入备案：走 **路线 B**。
- 两者可并行规划，但 preview 期间不提前提交任何正式 SEO。
