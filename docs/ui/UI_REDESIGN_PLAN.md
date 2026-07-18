# UI 改版实施计划

> 本文档将 emoji-platform 全站 UI/UX 改版拆分为 7 个 Batch，明确每轮范围、文件、风险、验收标准与建议 commit。
> 创建日期：2026-07-17
> 基线分支：`feature/macos-ui-redesign`

---

## 设计总方向

参考图仅作为视觉方向，不逐像素复制。

1. **简约、高级、克制**
2. **macOS 原生应用感**
3. **Raycast 式搜索与快捷操作**
4. **Craft 式内容层级**
5. **Apple 式留白和排版**
6. **Linear 式后台密度**
7. **Emoji 作为主要色彩来源**
8. **少量毛玻璃，不滥用**
9. **轻微阴影和细边框**
10. **动效快速、克制、有反馈**

禁止复制 Apple、Raycast、Craft、Linear 的代码、品牌元素或具体页面。

---

## Batch 1：设计系统、全局布局和基础组件

### 修改范围

- 建立 Tailwind 设计 token：颜色、字体、圆角、阴影、间距、动画。
- 配置 `darkMode: 'media'` 或 `'class'`，预留深色模式。
- 创建全局样式变量与工具类。
- 重构 `apps/web/src/app/layout.tsx` 与 `apps/admin/src/app/layout.tsx` 的主题背景、字体、平滑滚动。
- 创建/复用基础组件：Button、Input、Card、Badge、Tag、Skeleton、Separator、Avatar、IconButton。
- 统一前台/后台基础组件入口，补充 `packages/ui` 的实际组件导出。
- 为前台创建 `ThemeProvider` / `DarkModeProvider`（如需要 class 切换）。

### 预计文件

| 新增/修改 | 路径 |
|-----------|------|
| 修改 | `apps/web/tailwind.config.js` |
| 修改 | `apps/admin/tailwind.config.js` |
| 修改 | `apps/web/src/app/globals.css` |
| 修改 | `apps/admin/src/app/globals.css` |
| 修改 | `apps/web/src/app/layout.tsx` |
| 修改 | `apps/admin/src/app/layout.tsx` |
| 新增 | `packages/ui/src/components/Button.tsx` |
| 新增 | `packages/ui/src/components/Input.tsx` |
| 新增 | `packages/ui/src/components/Card.tsx` |
| 新增 | `packages/ui/src/components/Badge.tsx` |
| 新增 | `packages/ui/src/components/Tag.tsx` |
| 新增 | `packages/ui/src/components/Skeleton.tsx` |
| 新增 | `packages/ui/src/components/Separator.tsx` |
| 新增 | `packages/ui/src/components/IconButton.tsx` |
| 新增 | `packages/ui/src/index.ts` |
| 新增 | `apps/web/src/components/ui/*`（本地再导出或适配） |
| 新增 | `apps/admin/src/components/ui/*` |

### 保留的业务逻辑

- 所有 API 调用、路由结构、metadata 生成逻辑不动。
- 仅替换样式类名与基础组件外观。

### 风险点

- Tailwind 配置冲突：两个 app 的 config 需同步。
- 深色模式类名污染：需确保 SSR 安全。
- `packages/ui` 构建链路：需确认 workspace 引用与 `pnpm typecheck/build` 通过。

### 验收标准

- `pnpm lint` 通过。
- `pnpm typecheck` 通过。
- `pnpm build` 通过。
- 首页与后台登录页视觉上已体现新设计 token。
- 无明显样式回归（按钮/输入框可用）。

### 建议 commit

```
feat(ui): establish design system, theme tokens, and base components
```

---

## Batch 2：首页、导航细节与全局搜索改版 ✅ 已完成（2026-07-17）

> 实际范围严格限定为「前台首页 + Header 导航细节 + 移动端导航 + 全局搜索入口 + Command Palette + 首页相关共享组件 + 首页桌面/移动适配」。
> Footer、LanguageSwitcher、全局布局已在 Batch 1 完成，本轮不再触碰。未改动任何详情页、Admin、API、Prisma、路由、SEO 逻辑。

### 修改范围

- 重构 `HomeHero`：macOS/Raycast 风格主搜索框（聚焦光环、清空按钮、⌘K 提示）、次级"打开命令面板"按钮、真实浏览入口 chips（/emojis、/categories、/topics、/articles）。
- 重构 `ZhHomePage` / `EnHomePage`：Hero + DiscoverySection + CTA，移除伪造的"即将上线"工具区，保留 `getDiscovery()` 与 ErrorState 降级。
- 升级 `DiscoverySection`：使用 `SectionHeader` + 设计 token 链接，区块 `space-y-14`、容器 `max-w-content-wide`。
- 升级卡片视觉（设计 token 统一）：`EmojiCard`、`CategoryCard`、`TopicCard`（使用 `Badge`）、`ArticleCard`、Homepage `CopyButton`。
- 升级 `Header` 导航细节：桌面搜索按钮与移动端搜索图标均改为触发 Command Palette（保留真实链接与 aria-label）。
- 新增 `CommandPalette`：Raycast 式全局搜索浮层，复用现有 `search()` API，⌘K/Ctrl+K 全局监听、焦点还原、键盘导航、防抖、Skeleton/Empty/Error 状态、emoji 复制 toast。
- 全局 Toast 统一：旧 `components/Toast.tsx` 改为委托 `ui/Toast`（保留 `CopyArea`/`CopyValueButton` 等详情页调用点不受影响）。

### 涉及文件

| 操作 | 路径 |
|------|------|
| 新增 | `apps/web/src/components/CommandPalette.tsx` |
| 新增 | `apps/web/src/components/HomeHero.tsx` |
| 修改 | `apps/web/src/app/layout.tsx`（接入 `CommandPaletteProvider`） |
| 修改 | `apps/web/src/app/zh/page.tsx` |
| 修改 | `apps/web/src/app/en/page.tsx` |
| 修改 | `apps/web/src/components/Header.tsx`（搜索入口改触发 Palette） |
| 修改 | `apps/web/src/components/DiscoverySection.tsx` |
| 修改 | `apps/web/src/components/EmojiCard.tsx` |
| 修改 | `apps/web/src/components/CategoryCard.tsx` |
| 修改 | `apps/web/src/components/TopicCard.tsx` |
| 修改 | `apps/web/src/components/ArticleCard.tsx` |
| 修改 | `apps/web/src/components/CopyButton.tsx`（token 对齐 + success toast） |
| 修改 | `apps/web/src/components/Toast.tsx`（委托至 `ui/Toast`） |

### 保留的业务逻辑（零改动）

- `search()` / `recordCopyEvent()` / `getDiscovery()` API 调用与签名不变。
- 搜索参数、搜索日志、分析、复制事件、发现、推荐、Meilisearch/DB 回退逻辑不变。
- 多语言路由、canonical/hreflang/JSON-LD/metadata/sitemap/robots/noindex 不变。
- Auth/RBAC、Preview Docker 配置不变。

### 风险点与对策

- **⌘K 与浏览器默认快捷键冲突**：使用 `preventDefault` + `stopPropagation`，且首次按键即注册为 passive=false 的 keydown 监听。
- **焦点陷阱 / 关闭后焦点还原**：`CommandPaletteProvider` 记录触发元素（`triggerRef`），关闭时 `focus()` 还原，避免焦点丢失到 body。
- **移动端菜单可访问性**：沿用 Batch 1 的 Drawer + Escape 关闭 + aria 属性，本轮仅改搜索入口触发点。
- **重复 Toast 容器**：旧 `Toast.tsx` 不再自实现，统一委托 `ui/Toast`，避免双容器。

### 验收标准

- `pnpm lint / typecheck / build`（web）全部通过。
- 首页 Hero、Discovery、CTA 视觉符合设计方向，深浅模式均可用。
- Header 桌面/移动端导航链接可用；搜索按钮/图标打开 Command Palette。
- ⌘K/Ctrl+K 唤起浮层，↑/↓/Enter/Esc 可用，跳转保留原搜索/详情路由。
- 卡片 hover 边框 + focus-visible 光环，复制触发 success toast，复制事件不重复。
- 375/430/768/1024/1440px 无横向溢出；无 hydration / console 错误；SEO 完整。

### 实际 commit

```
feat: redesign global shell homepage and search
```

---

## Batch 3：搜索、Emoji、分类、专题页面

> Batch 3 已拆分为 3A 与 3B，避免一次改动跨越过多内容边界。

### Batch 3A：搜索页与 Emoji 浏览体验 ✅ 已完成（2026-07-18）

- 已改版中英文搜索页、真实类型筛选、分页、移动筛选 Popover、Skeleton / Empty / Error 状态。
- 已改版 `SearchResultCard`，Emoji 结果保留复制与详情入口，分类、专题、文章继续使用各自真实字段和原链接。
- 已改版中英文 Emoji 列表、统一 `EmojiCard` / `EmojiGrid`、真实总数与分页状态。
- 已重组中英文 Emoji 详情层级：主展示、主要复制、可复制字段、专业信息、含义与用法、示例、关键词、资源与关联内容。
- 已统一 `CopyButton`、`CopyArea`、`CopyValueButton` 的成功/失败 Toast、单次 clipboard 调用与单次 copy event 记录路径。
- 已增加搜索、列表、详情的路由级 loading / error，以及详情 not-found 状态。
- 保留原 API、DTO、Prisma schema、数据库结构、路由、slug、query 参数和 SEO 生成逻辑。

### Batch 3B：分类与专题页面 ✅ 已完成（2026-07-18）

- 已改版中英文分类列表：使用分类 API 的真实名称、说明、图标、Emoji 数量、`parentId` 与既有顺序构建可展开分类树；循环、孤立或异常父子关系安全降级为根节点。
- 已改版中英文分类详情：保留原 slug、分页和 metadata；补充真实父分类/子分类导航，复用 Batch 3A `EmojiGrid` / `EmojiCard`，推荐分类、专题与文章继续使用真实关联数据并独立降级。
- 已改版中英文专题列表：保留 API 既有 `page` 参数和排序，`TopicCard` 展示真实标题、摘要、类型、发布日期与封面；空封面或加载失败使用项目内的中性占位，不请求伪造图片。
- 已改版中英文专题详情：保留真实摘要、正文、类型、发布日期、FAQ、Emoji 绑定顺序、相关专题和推荐文章；关联分类只从专题 Emoji 的真实分类关系去重派生。
- 已增加分类/专题列表与详情的路由级 loading / error，以及详情 not-found；分页越界、空关联和次要关联失败均有独立状态。
- 已验证分类树按钮 `aria-expanded` / `aria-controls`、键盘可达与 reduced-motion；375/430/768/1024/1440px 的中英文列表/详情均无横向溢出。
- 保留原 API、DTO、Prisma schema、数据库结构、路由、slug、query 参数、published 规则、canonical、hreflang、JSON-LD、sitemap、robots 与 Preview Docker 架构。

### 修改范围

- 重构 `SearchResultsView`、`SearchResultCard`：类型筛选、结果卡片、高亮、分页、空态/错误态。
- 重构 `EmojiCard`、`EmojiGrid`、`DetailHero`、`CopyArea`。
- 重构 Emoji 详情页各模块：`EmojiMeaningSection`、`EmojiExamples`、`EmojiTechInfo`、`EmojiKeywords`、`EmojiAssets`、`FaqBlock`、`RelatedEmojis`、`RelatedTopics`。
- 重构分类列表/详情：`CategoryCard`、分类 Hero、`RelatedCategories`、相关文章。
- 重构专题列表/详情：`TopicCard`、专题 Hero、内容排版、相关专题/文章。

### 预计文件

| 修改 | 路径 |
|------|------|
| 修改 | `apps/web/src/components/SearchResultsView.tsx` |
| 修改 | `apps/web/src/components/SearchResultCard.tsx` |
| 修改 | `apps/web/src/components/Highlight.tsx` |
| 修改 | `apps/web/src/components/EmojiCard.tsx` |
| 修改 | `apps/web/src/components/EmojiGrid.tsx` |
| 修改 | `apps/web/src/components/DetailHero.tsx` |
| 修改 | `apps/web/src/components/CopyArea.tsx` |
| 修改 | `apps/web/src/components/EmojiMeaningSection.tsx` |
| 修改 | `apps/web/src/components/EmojiExamples.tsx` |
| 修改 | `apps/web/src/components/EmojiTechInfo.tsx` |
| 修改 | `apps/web/src/components/EmojiKeywords.tsx` |
| 修改 | `apps/web/src/components/EmojiAssets.tsx` |
| 修改 | `apps/web/src/components/FaqBlock.tsx` |
| 修改 | `apps/web/src/components/RelatedEmojis.tsx` |
| 修改 | `apps/web/src/components/RelatedTopics.tsx` |
| 修改 | `apps/web/src/components/CategoryCard.tsx` |
| 修改 | `apps/web/src/components/RelatedCategories.tsx` |
| 修改 | `apps/web/src/components/TopicCard.tsx` |
| 修改 | `apps/web/src/components/ArticleCard.tsx` |
| 修改 | `apps/web/src/app/zh/search/page.tsx` |
| 修改 | `apps/web/src/app/en/search/page.tsx` |
| 修改 | `apps/web/src/app/zh/emojis/page.tsx` / `en/emojis/page.tsx` |
| 修改 | `apps/web/src/app/zh/emoji/[slug]/page.tsx` / `en/emoji/[slug]/page.tsx` |
| 修改 | `apps/web/src/app/zh/categories/page.tsx` / `en/categories/page.tsx` |
| 修改 | `apps/web/src/app/zh/categories/[slug]/page.tsx` / `en/categories/[slug]/page.tsx` |
| 修改 | `apps/web/src/app/zh/topics/page.tsx` / `en/topics/page.tsx` |
| 修改 | `apps/web/src/app/zh/topics/[slug]/page.tsx` / `en/topics/[slug]/page.tsx` |

### 保留的业务逻辑

- 所有 API 调用、分页参数、搜索参数、复制事件、推荐降级逻辑。
- SEO metadata 与 JSON-LD 输出。

### 风险点

- Emoji 卡片网格在不同屏幕密度下的一致性。
- 详情页大量模块重构时需避免破坏 Breadcrumb / metadata。
- 复制按钮反馈与复制事件记录。

### 验收标准

- 搜索页类型筛选、分页、复制正常。
- Emoji 列表/详情页可正常浏览、复制、404。
- 分类/专题列表与详情页可正常浏览、分页。
- 相关推荐为空时优雅降级。
- `pnpm lint/typecheck/build` 通过。

### 建议 commit

```
feat(ui): redesign search, emoji, category and topic pages
```

---

## Batch 4：文章、工具和其他内容页面

### 修改范围

- 重构文章列表/详情：`ArticleCard`、文章封面、标题、日期、作者、正文排版、关键词、相关文章/专题/表情。
- 重构 `/zh/tools`、`/en/tools`：工具卡片、占位提示。
- 重构 `/zh/about`、`/en/about`、`/zh/license`、`/en/license`：内容排版、字体层级。
- 统一 `EmptyState`、`ErrorState`、`LoadingState` 视觉。
- 检查并优化 `Pagination` 组件。

### 预计文件

| 修改 | 路径 |
|------|------|
| 修改 | `apps/web/src/components/ArticleCard.tsx` |
| 修改 | `apps/web/src/components/EmptyState.tsx` |
| 修改 | `apps/web/src/components/ErrorState.tsx` |
| 修改 | `apps/web/src/components/LoadingState.tsx` |
| 修改 | `apps/web/src/components/Pagination.tsx` |
| 修改 | `apps/web/src/components/ToolCard.tsx` |
| 修改 | `apps/web/src/components/Breadcrumb.tsx` |
| 修改 | `apps/web/src/app/zh/articles/page.tsx` / `en/articles/page.tsx` |
| 修改 | `apps/web/src/app/zh/articles/[slug]/page.tsx` / `en/articles/[slug]/page.tsx` |
| 修改 | `apps/web/src/app/zh/tools/page.tsx` / `en/tools/page.tsx` |
| 修改 | `apps/web/src/app/zh/about/page.tsx` / `en/about/page.tsx` |
| 修改 | `apps/web/src/app/zh/license/page.tsx` / `en/license/page.tsx` |

### 保留的业务逻辑

- 文章 published 状态过滤、404、BlogPosting JSON-LD。
- 工具页硬编码数据不变。

### 风险点

- 文章详情 `dangerouslySetInnerHTML` 内容样式需与全局 prose 一致。
- 封面图片加载失败需降级。

### 验收标准

- 文章列表/详情正常展示，404 正确。
- About/License 内容排版可读。
- 空态/错误态/加载态统一。
- `pnpm lint/typecheck/build` 通过。

### 建议 commit

```
feat(ui): redesign articles, tools, about and license pages
```

---

## Batch 5：Admin 登录、Dashboard 和全部管理页面

### 修改范围

- 重构 Admin 登录页：表单、Logo、错误提示。
- 重构 `AdminLayout`：Linear 风格侧边栏、导航密度、折叠/展开、当前态、用户区、退出。
- 重构 Dashboard：统计卡、最近列表。
- 创建后台统一表格组件 `DataTable`、筛选面板、分页器。
- 创建后台统一表单布局 `FormSection`、`FormTabs`。
- 重构所有列表页（Emoji/Category/Topic/Article/Asset/Review/SEO/Logs/Analytics）的表格与筛选。
- 重构所有表单页（EmojiForm/CategoryForm/TopicForm/ArticleForm/AssetForm）的 Tab 与字段布局。
- 重构 SEO 编辑页、SEO 质量检查页、搜索基础设施/分析页。

### 预计文件

| 修改/新增 | 路径 |
|-----------|------|
| 修改 | `apps/admin/src/app/(auth)/admin/login/page.tsx` |
| 修改 | `apps/admin/src/components/AdminLayout.tsx` |
| 修改 | `apps/admin/src/components/AuthProvider.tsx` |
| 修改 | `apps/admin/src/app/(admin)/admin/dashboard/page.tsx` |
| 新增 | `apps/admin/src/components/ui/DataTable.tsx` |
| 新增 | `apps/admin/src/components/ui/DataTablePagination.tsx` |
| 新增 | `apps/admin/src/components/ui/FilterBar.tsx` |
| 新增 | `apps/admin/src/components/ui/FormSection.tsx` |
| 新增 | `apps/admin/src/components/ui/FormTabs.tsx` |
| 新增 | `apps/admin/src/components/ui/StatusBadge.tsx` |
| 新增 | `apps/admin/src/components/ui/AdminToast.tsx`（可选） |
| 修改 | `apps/admin/src/components/EmojiForm.tsx` |
| 修改 | `apps/admin/src/components/CategoryForm.tsx` |
| 修改 | `apps/admin/src/components/TopicForm.tsx` |
| 修改 | `apps/admin/src/components/ArticleForm.tsx` |
| 修改 | `apps/admin/src/components/AssetForm.tsx` |
| 修改 | `apps/admin/src/components/SeoEntityList.tsx` |
| 修改 | `apps/admin/src/components/PlaceholderPage.tsx` |
| 修改 | `apps/admin/src/app/(admin)/admin/emojis/page.tsx` |
| 修改 | `apps/admin/src/app/(admin)/admin/categories/page.tsx` |
| 修改 | `apps/admin/src/app/(admin)/admin/topics/page.tsx` |
| 修改 | `apps/admin/src/app/(admin)/admin/articles/page.tsx` |
| 修改 | `apps/admin/src/app/(admin)/admin/assets/page.tsx` |
| 修改 | `apps/admin/src/app/(admin)/admin/reviews/page.tsx` |
| 修改 | `apps/admin/src/app/(admin)/admin/reviews/[id]/page.tsx` |
| 修改 | `apps/admin/src/app/(admin)/admin/seo/page.tsx` |
| 修改 | `apps/admin/src/app/(admin)/admin/seo/[entityType]/[id]/edit/page.tsx` |
| 修改 | `apps/admin/src/app/(admin)/admin/seo/quality/page.tsx` |
| 修改 | `apps/admin/src/app/(admin)/admin/seo/quality/issues/page.tsx` |
| 修改 | `apps/admin/src/app/(admin)/admin/search/infrastructure/page.tsx` |
| 修改 | `apps/admin/src/app/(admin)/admin/search/analytics/page.tsx` |
| 修改 | `apps/admin/src/app/(admin)/admin/search-logs/page.tsx` |
| 修改 | `apps/admin/src/app/(admin)/admin/copy-events/page.tsx` |
| 修改 | `apps/admin/src/app/(admin)/admin/discovery/page.tsx` |
| 修改 | `apps/admin/src/app/(admin)/admin/analytics/page.tsx` |
| 修改 | `apps/admin/src/app/(admin)/admin/settings/page.tsx` |

### 保留的业务逻辑

- 所有 `adminApi` 调用不变。
- 角色权限判断不变。
- 表单提交、状态切换、删除确认逻辑不变。
- 全局 noindex 不变。

### 风险点

- 后台表格与筛选重构工作量大，需分小步。
- 表单字段多，Tab 切换与校验逻辑需保持。
- 权限提示需继续根据角色显示。

### 验收标准

- 登录、Dashboard、所有管理列表/表单页可正常访问。
- 表格筛选、分页、排序（如有）正常。
- 创建/编辑/删除/状态切换正常。
- SEO 编辑、质量检查、搜索基础设施/分析正常。
- `pnpm lint/typecheck/build` 通过。

### 建议 commit

```
feat(ui): redesign admin login, dashboard, and all management pages
```

---

## Batch 6：响应式、深色模式、无障碍和微交互

### 修改范围

- 完成全站响应式细节：前台所有页面在手机/平板/桌面一致可用。
- 完成 Admin 侧边栏移动端折叠/抽屉。
- 实现深色模式：Tailwind `dark:` 类、颜色 token、系统偏好/手动切换（前台）。
- 全局微交互：按钮/链接悬停、聚焦环、页面切换过渡、Toast 动效。
- 无障碍：焦点管理、skip link、ARIA 标签、色彩对比度。
- 动画性能：减少 `layout` 抖动，使用 `transform`/`opacity`。
- 检查并优化 `CopyButton`、`SearchBox`、`Pagination` 的交互反馈。

### 预计文件

| 修改 | 路径 |
|------|------|
| 修改 | `apps/web/tailwind.config.js`（darkMode） |
| 修改 | `apps/admin/tailwind.config.js`（darkMode） |
| 修改 | `apps/web/src/app/layout.tsx` |
| 修改 | `apps/web/src/app/globals.css` |
| 新增/修改 | `apps/web/src/components/ThemeToggle.tsx` |
| 新增 | `apps/web/src/components/SkipLink.tsx` |
| 修改 | `apps/web/src/components/Header.tsx` |
| 修改 | `apps/web/src/components/Footer.tsx` |
| 修改 | `apps/admin/src/components/AdminLayout.tsx` |
| 修改 | 全站各页面与组件的 `dark:` 类 |

### 保留的业务逻辑

- 所有业务功能、API、metadata 不变。

### 风险点

- 深色模式 SSR 与水合不一致。
- 颜色对比度不足影响无障碍。
- 动画过多影响性能。

### 验收标准

- 前台/后台在深色模式下可读。
- 移动端主要流程可用。
- 键盘可完成主要操作。
- Lighthouse 可访问性分数 ≥ 90。
- `pnpm lint/typecheck/build` 通过。

### 建议 commit

```
feat(ui): add responsive layout, dark mode, accessibility and micro-interactions
```

---

## Batch 7：全站回归、截图和最终验收

### 修改范围

- 全站功能回归：前台 20+ 路径、后台 30+ 路径的 200/404/401/403 行为。
- SEO 回归：canonical、hreflang、JSON-LD、noindex、sitemap、robots。
- 复制事件、搜索日志、推荐降级等业务交互回归。
- 截图对比：关键页面（首页、搜索、Emoji 详情、分类、专题、文章、后台 Dashboard、列表、表单）。
- 性能检查：构建产物、首屏加载、图片优化。
- 更新 `PROJECT_HANDOFF.md` 与 `CHANGELOG.md`，标记 UI 改版完成。
- 创建完成标签 `ui-redesign-complete-YYYYMMDD`。

### 预计文件

| 修改 | 路径 |
|------|------|
| 修改 | `PROJECT_HANDOFF.md` |
| 修改 | `CHANGELOG.md` |
| 新增 | `docs/ui/UI_REDESIGN_SCREENSHOTS.md`（截图索引） |
| 新增 | `docs/ui/UI_REDESIGN_ACCEPTANCE.md`（验收清单） |
| 新增 | tag `ui-redesign-complete-20260717` |

### 保留的业务逻辑

- 全部。

### 风险点

- 回归遗漏：需按 `UI_ROUTE_INVENTORY.md` 逐项核对。
- SEO 回归失败：metadata 中不能出现 undefined/null。
- 截图环境依赖：可在本地 Docker 或预览环境抓取。

### 验收标准

- 前台所有页面可访问，复制、搜索、分页、404 正常。
- 后台登录、CRUD、筛选、分页、权限正常。
- `pnpm install/db:generate/lint/typecheck/build` 全部通过。
- sitemap/robots/metadata/JSON-LD 无回归。
- 关键页面截图存档。
- 完成标签已打并推送（在可联网环境）。

### 建议 commit

```
docs: record ui redesign completion and acceptance
```

---

## 跨 Batch 注意事项

1. **每 Batch 结束后**必须执行：`pnpm lint`、`pnpm typecheck`、`pnpm build`。
2. **每 Batch 结束后**必须 `git commit` 并尝试 `git push`。
3. **不修改** `apps/api`、Prisma schema、数据库。
4. **不合并** `main`，除非用户明确授权。
5. **不部署**腾讯云，除非进入授权后的 Phase 7C-2。
6. 优先复用 `packages/ui` 组件，但允许 `apps/web` 与 `apps/admin` 本地适配。
7. 所有改动保持中英双语一致。
