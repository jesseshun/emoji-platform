# Preview Docker Compose Plan

> 单台国内腾讯云小服务器的 Preview Docker Compose 规划。仅文档 + 模板，不部署、不含真实密钥。
> 实际可运行模板见仓库根 `docker-compose.preview.yml` 与 `nginx/preview.conf.example`（均为占位，无真实值）。

---

## 1. 目标结构（推荐）

```
services (同一台服务器):
  nginx          # 80/443 入口，反代 web/admin/api；仅 nginx 暴露公网
  web            # Next.js standalone :3000
  admin          # Next.js standalone :3001 (建议仅内网/隧道)
  api            # NestJS :4000 (建议仅内网/隧道)
  postgres       # :5432 仅内部网络，不暴露公网
  meilisearch    # :7700 仅内部网络，资源不足可关闭
  redis          # :6379 仅内部网络（如被依赖）
volumes:
  postgres_data
  meilisearch_data
  backup
```

与现有 `docker-compose.yml`（开发用）的区别：
- 现有 compose 把 `postgres/redis/meilisearch` 的端口**映射到了宿主机**（5432/6379/7700），开发方便但不适合预览暴露。
- preview compose 应让 db/meili/redis **仅处于内部网络**，只通过 `nginx` 暴露 web，admin/api 经隧道/内网访问。

---

## 2. 是否新增 docker-compose.preview.yml

**是（已提供模板）**：`docker-compose.preview.yml` 作为预览部署模板，与开发用 `docker-compose.yml` 并存、互不干扰。

- 复用既有 `apps/web/Dockerfile`、`apps/admin/Dockerfile`、`apps/api/Dockerfile`（均为 `output: standalone` / NestJS build，runner 阶段 `NODE_ENV=production`）。
- preview compose 中各服务 `environment` 使用 `${VAR}` 从 `.env.preview` 注入，**模板内不写真实值**。
- 设 `restart: unless-stopped`、healthcheck、`logging` 限制。
- 低配场景通过 `profiles` 或注释控制是否启动 `meilisearch` / `redis`。

---

## 3. Nginx preview 路由规划（见 nginx/preview.conf.example）

- 方式 A（子域，推荐）：`preview.example.com` → web；`admin-preview.example.com` → admin；`api-preview.example.com` → api。各 server 块反代到容器内部端口。
- 方式 B（单域路径，仅规划，需 7B 改 basePath）：`/admin` → admin，`/api` → api。
- HTTPS：若 `preview.example.com` 可用且未被拦截，可用 Certbot 签发；IP 场景可免或用隧道 TLS。
- **不暴露内部端口**：Nginx 只监听 80/443，admin/api 通过内部网络反代，不映射到宿主机公网。

---

## 4. 预览数据库与备份规划

1. **独立 preview DB**：使用独立的 `POSTGRES_DB`（如 `emoji_platform_preview`），与生产/本地开发库隔离。
2. **使用 seed 数据**：预览库执行 `pnpm db:seed`（项目 seed 为示例/公开数据），导入**少量**内容用于联调。
3. **不导入敏感生产数据**：严禁把生产库 dump 导入 preview；preview 仅用 seed / 构造的测试数据。
4. **备份策略**：
   - 定期 `pg_dump` 到 `backup` volume（预览库数据量小，成本低）。
   - 发布/重大变更**前**先备份一次。
   - Meilisearch 索引**可从数据库重建**（`POST /api/v1/admin/search/index/rebuild`），因此 Meilisearch 数据**无需单独备份**，丢失后重建即可。
5. **migrate 失败回滚**：`prisma migrate dev` 在预览环境如遇失败，先 `pg_dump` 备份，再评估 `migrate resolve` / 重置 preview 库（preview 可重置，生产不可随意重置）。
6. **seed 可重复执行**：确认 seed 脚本幂等（项目 seed 设计应支持重复运行；若不支持，preview 重置库后重跑）。

---

## 5. 健康检查与日志

- `postgres`：`pg_isready`；`meilisearch`：`/health`；`redis`：`redis-cli ping`；`api`：`/api/v1/health`（或等价）；`web/admin`：端口探活。
- 日志：`logging.options.max-size=10m`、`max-file=3`，防止磁盘写满。
- 容器 `restart: unless-stopped` 保证崩溃自恢复。

---

## 6. 资源限制示例（占位，非真实值）

```
deploy:
  resources:
    limits:
      memory: 512M   # web / admin
      # api: 512M
      # postgres: 512M
      # meilisearch: 512M (低配可关闭)
```

小内存机器务必加 swap 文件（如 1–2G），避免 build / `prisma migrate` OOM。
