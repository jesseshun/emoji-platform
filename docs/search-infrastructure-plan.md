# Search Infrastructure Plan (Phase 6A)

> Phase 6A 仅做搜索基础设施规划与抽象层准备。本文件记录规划结论，供 Phase 6B（Meilisearch Integration）执行。
> 本阶段**未接入 Meilisearch、未安装 SDK、未创建真实索引、未改为纯静态站、未生成 AI 内容**。

## 1. 现有搜索能力梳理

- 公开搜索 API：`GET /api/v1/search?q=&locale=&page=&limit=`
- 仅搜索 **Emoji**（按 emojiChar / slug / unicodeCodepoint / shortcode / 翻译 name·shortName·oneLineMeaning 模糊匹配）。
- 仅返回 `published` 状态内容，按 `sortOrder / id` 简单排序。
- 每次搜索记录 `search_logs`（fire-and-forget，不阻塞搜索）。
- 前台 `/zh/search` 与 `/en/search` 调用该 API 并渲染 `EmojiGrid`。

## 2. Search Provider 抽象

位置：`apps/api/src/modules/search/`

| 文件 | 作用 |
|------|------|
| `search-provider.interface.ts` | `SearchProvider` 接口（至少含 `search()`） |
| `search.types.ts` | Provider 类型、查询/结果类型、规划用文档类型 |
| `search.config.ts` | 从环境变量加载 `SearchConfig`（含 fallback） |
| `database-search.provider.ts` | 默认 provider，复用现有数据库搜索逻辑 |
| `meilisearch-search.provider.ts` | Phase 6B 预留 stub（`isAvailable()` 恒为 false） |
| `search.service.ts` | 按 config 选择 provider；提供只读 `getInfrastructureStatus()` |
| `admin-search-infrastructure.controller.ts` / `.service.ts` | 后台状态端点 |

`SearchService.resolveProvider()`：当前恒返回 `database`；若 `SEARCH_PROVIDER=meilisearch`，因 stub 不可用，安全 fallback 到 `database` 并记录 warn。

## 3. 索引实体范围

规划进入外部搜索索引（Phase 6B）：

- Emoji
- Category
- Topic
- Article

**Asset 暂不纳入**。原因：Asset 为资源 / 授权管理对象，不是主要公开搜索对象；进入搜索可能引入版权、授权、重复内容风险。后续如有资源下载站能力，再单独规划。

## 4. 索引文档字段规划

仅 `published` 内容进入外部索引；`draft` / `archived` 不进入；不含后台字段、不含 `passwordHash`、不含明文敏感 IP、不含 admin-only 字段。

### Emoji
`id, type=emoji, locale, emojiChar, slug, unicodeCodepoint, shortcode, name, aliases, keywords, categoryIds, categoryNames, topicIds, topicTitles, status, updatedAt, publicUrl`

### Category
`id, type=category, locale, slug, name, description, parentId, status, updatedAt, publicUrl`

### Topic
`id, type=topic, locale, slug, title, description, keywords, emojiIds, status, updatedAt, publicUrl`

### Article
`id, type=article, locale, slug, title, summary, keywords, status, publishedAt, updatedAt, publicUrl`

## 5. 多语言搜索策略

- 建议：第一版采用**单索引 + locale 字段**，统一管理；未来数据量增大可拆为 `emoji_zh/emojis_en` 或 `content_zh/content_en`。
- 搜索必须带 `locale` filter：`/zh/search` 默认 `zh`，`/en/search` 默认 `en`。
- 跨语言 fallback 默认不启用（第一版）。
- 中文重点匹配：中文名、keywords、aliases。
- 英文重点匹配：英文名、shortcode、keywords、aliases。
- `emojiChar` / `unicodeCodepoint` / `shortcode` 采用 exact match 优先；`slug` 作为补充匹配。

## 6. 排序 / 权重策略（规划，6A 不实现复杂评分）

优先级（高 → 低）：

1. `emojiChar` exact match
2. `unicodeCodepoint` exact match
3. `shortcode` exact match
4. `name` / `title` exact match
5. `slug` exact match
6. `name` / `title` prefix match
7. keyword / alias match
8. category / topic relevance
9. copy count / search logs（Phase 6E 调优信号，6A 不使用）
10. `updatedAt` / `publishedAt` 作为轻量 tie-breaker

Phase 6A 保持现有数据库简单排序；权重仅在类型与文档中规划。

## 7. Fallback 机制

- 默认 provider = `database`。
- 若 `SEARCH_PROVIDER=meilisearch` 但 Meilisearch 不可用（6A 恒为不可用），自动 fallback 到 `database` 并记 warn。
- 不破坏现有公开搜索 API、search_log 记录、copy event 记录。

## 8. 后台搜索基础设施状态

- API：`GET /api/v1/admin/search/infrastructure/status`（需 admin auth，只读，不泄露密钥）。
- 页面：`/admin/search/infrastructure`（继承 admin 根布局 `noindex,nofollow`）。
- 返回：`currentProvider, fallbackProvider, meilisearchConfigured, meilisearchEnabled, indexEntitiesPlanned, indexReady, lastIndexedAt, notes`。
- 当前：`currentProvider=database`，`meilisearchConfigured=false`（除非显式配置），`meilisearchEnabled=false`，`indexReady=false`，`lastIndexedAt=null`。

## 9. 环境变量（规划）

```
SEARCH_PROVIDER=database
MEILISEARCH_HOST=
MEILISEARCH_API_KEY=
MEILISEARCH_INDEX_PREFIX=emoji_platform
```

- 默认 `SEARCH_PROVIDER=database`。
- `MEILISEARCH_*` 为空时**不导致启动失败**。
- 不写真实密钥；README 仅示例。

## 10. 安全与索引边界

- 不返回 `passwordHash` / `JWT_SECRET` / Meilisearch API Key / 明文敏感 IP。
- 不索引 `draft` / `archived`。
- 不索引 `/admin` 及任何 admin-only / API admin 内容。
- `apps/web` 与 `apps/admin` 不直接访问 Prisma（始终走 API）。
- 不破坏 `/admin/*` noindex、sitemap / robots。

## 11. Phase 6B 边界（预留，未在本阶段执行）

- 基于本阶段 `SearchProvider` 抽象接入 Meilisearch。
- 实现 Meilisearch provider（替换 stub），建立 Emoji/Category/Topic/Article 索引与增量同步。
- 保持现有 SEO 边界（sitemap / robots / noindex / published-only）不变。
- 接入需经明确确认，不自动开启。
