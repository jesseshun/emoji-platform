# UI 路由与组件盘点

> 本文档对 `apps/web` 与 `apps/admin` 的全部路由、布局、组件、交互与 SEO 边界进行盘点，作为 UI 改版的依据。
> 创建日期：2026-07-17

## 1. 盘点统计

| 项目 | 数量 |
|------|------|
| 前台 `page.tsx` 文件 | 27 个（含 `/` 入口 + 26 个中英双语页面） |
| 前台 route handlers | 7 个（robots.txt + sitemap index + 5 子 sitemap） |
| 后台 `page.tsx` 文件 | 34 个 |
| 后台 layout | 3 个（根 / admin 组 / auth 登录） |
| 前台共享组件 | 37 个 |
| 后台共享组件 | 9 个 |
| `packages/ui` 组件 | 1 个（仅 `index.ts`，未实际导出组件） |
| `packages/shared` 文件 | 2 个（`index.ts`、`slug.ts`） |

---

## 2. 前台路由盘点（`apps/web`）

### 2.1 根与布局

| 路径 | 文件 | 用途 | 当前功能 | 数据来源 | 必须保留的交互 | 后续 UI 修改范围 | 回归测试项 | SEO / noindex |
|------|------|------|----------|----------|----------------|------------------|------------|---------------|
| `/` | `app/page.tsx` | 语言选择入口 | 显示 Logo、简介、中/英文入口按钮 | 硬编码 | 点击跳转到 `/zh/` 或 `/en/` | 视觉升级、动效 | 两入口可用 | 默认 metadata |
| `/layout` | `app/layout.tsx` | 根布局 | 设置 `<html lang>`、注入 ToastContainer、HtmlLang | `headers` 中的 `x-locale-path` | 无 | 主题背景、字体、全局动效 | lang 正确、Toast 全局可用 | 默认 title/description |
| `/zh/layout` | `app/zh/layout.tsx` | 中文布局 | Header、Footer、main 容器、zh 语言 metadata | 硬编码 | 无 | Header/Footer 重构、整体留白 | Header 链接、Footer 链接、语言切换 | hreflang、OpenGraph |
| `/en/layout` | `app/en/layout.tsx` | 英文布局 | 同上，英文 | 硬编码 | 无 | 同上 | 同上 | 同上 |

### 2.2 首页

| 路径 | 文件 | 用途 | 当前功能 | 数据来源 | 必须保留的交互 | 后续 UI 修改范围 | 回归测试项 | SEO / noindex |
|------|------|------|----------|----------|----------------|------------------|------------|---------------|
| `/zh/` | `app/zh/page.tsx` | 中文首页 | Hero 搜索、Discovery 模块、工具入口、About 介绍 | `GET /api/v1/discovery/home` | 搜索提交、查看全部链接 | Hero 区视觉、搜索框样式、Discovery 卡片、工具卡片 | 搜索可用、Discovery 数据正常、工具链接 | title/description、OpenGraph |
| `/en/` | `app/en/page.tsx` | 英文首页 | 同上，英文 | 同上 | 同上 | 同上 | 同上 | 同上 |

### 2.3 搜索

| 路径 | 文件 | 用途 | 当前功能 | 数据来源 | 必须保留的交互 | 后续 UI 修改范围 | 回归测试项 | SEO / noindex |
|------|------|------|----------|----------|----------------|------------------|------------|---------------|
| `/zh/search` | `app/zh/search/page.tsx` | 中文搜索页 | 搜索 landing / 结果展示 | `GET /api/v1/search` | 搜索提交、类型筛选、分页、复制 | 搜索框 Raycast 风格、结果卡片、筛选标签、空态/错误态 | 无 query 显示 landing；有 query 返回结果；`?q=` 页 noindex | 基础页可索引，`?q=` 结果页 `noindex,follow` |
| `/en/search` | `app/en/search/page.tsx` | 英文搜索页 | 同上 | 同上 | 同上 | 同上 | 同上 | 同上 |

### 2.4 Emoji 列表与详情

| 路径 | 文件 | 用途 | 当前功能 | 数据来源 | 必须保留的交互 | 后续 UI 修改范围 | 回归测试项 | SEO / noindex |
|------|------|------|----------|----------|----------------|------------------|------------|---------------|
| `/zh/emojis` | `app/zh/emojis/page.tsx` | 中文表情列表 | 分页展示 Emoji | `GET /api/v1/emojis` | 分页、点击卡片、复制 | 列表密度、卡片样式、分页器 | 分页正常、空态、复制 | canonical/hreflang |
| `/en/emojis` | `app/en/emojis/page.tsx` | 英文表情列表 | 同上 | 同上 | 同上 | 同上 | 同上 | 同上 |
| `/zh/emoji/[slug]` | `app/zh/emoji/[slug]/page.tsx` | 中文表情详情 | 表情详情、复制、含义、示例、技术信息、FAQ、相关表情/专题 | `GET /api/v1/emojis/{slug}` | 复制、复制区所有项、返回 | Hero 排版、复制区、内容层级、相关模块 | 404 缺失/草稿、复制记录事件、JSON-LD FAQ、Breadcrumb | canonical/hreflang/FAQ JSON-LD |
| `/en/emoji/[slug]` | `app/en/emoji/[slug]/page.tsx` | 英文表情详情 | 同上 | 同上 | 同上 | 同上 | 同上 | 同上 |

### 2.5 分类

| 路径 | 文件 | 用途 | 当前功能 | 数据来源 | 必须保留的交互 | 后续 UI 修改范围 | 回归测试项 | SEO / noindex |
|------|------|------|----------|----------|----------------|------------------|------------|---------------|
| `/zh/categories` | `app/zh/categories/page.tsx` | 中文分类列表 | 展示分类卡片 | `GET /api/v1/categories` | 点击进入分类 | 分类卡片网格、图标视觉 | 空态、链接 | canonical/hreflang |
| `/en/categories` | `app/en/categories/page.tsx` | 英文分类列表 | 同上 | 同上 | 同上 | 同上 | 同上 | 同上 |
| `/zh/categories/[slug]` | `app/zh/categories/[slug]/page.tsx` | 中文分类详情 | 分类信息、表情分页、相关专题/分类/文章 | `GET /api/v1/categories/{slug}` + recommendations | 分页、点击、复制 | 分类 Hero、表情网格、相关模块 | 404、分页、推荐降级 | canonical/hreflang |
| `/en/categories/[slug]` | `app/en/categories/[slug]/page.tsx` | 英文分类详情 | 同上 | 同上 | 同上 | 同上 | 同上 | 同上 |

### 2.6 专题

| 路径 | 文件 | 用途 | 当前功能 | 数据来源 | 必须保留的交互 | 后续 UI 修改范围 | 回归测试项 | SEO / noindex |
|------|------|------|----------|----------|----------------|------------------|------------|---------------|
| `/zh/topics` | `app/zh/topics/page.tsx` | 中文专题列表 | 分页专题卡片 | `GET /api/v1/topics` | 分页、点击进入 | 专题卡片网格 | 空态、分页 | canonical/hreflang |
| `/en/topics` | `app/en/topics/page.tsx` | 英文专题列表 | 同上 | 同上 | 同上 | 同上 | 同上 | 同上 |
| `/zh/topics/[slug]` | `app/zh/topics/[slug]/page.tsx` | 中文专题详情 | 专题内容、收录表情、FAQ、相关专题/文章 | `GET /api/v1/topics/{slug}` + recommendations | 复制、返回 | 专题 Hero、内容排版、表情网格 | 404、内容渲染、FAQ | canonical/hreflang/FAQ JSON-LD |
| `/en/topics/[slug]` | `app/en/topics/[slug]/page.tsx` | 英文专题详情 | 同上 | 同上 | 同上 | 同上 | 同上 | 同上 |

### 2.7 文章

| 路径 | 文件 | 用途 | 当前功能 | 数据来源 | 必须保留的交互 | 后续 UI 修改范围 | 回归测试项 | SEO / noindex |
|------|------|------|----------|----------|----------------|------------------|------------|---------------|
| `/zh/articles` | `app/zh/articles/page.tsx` | 中文文章列表 | 分页文章卡片 | `GET /api/v1/articles` | 分页、点击进入 | 文章卡片、列表排版 | 空态、分页 | canonical/hreflang |
| `/en/articles` | `app/en/articles/page.tsx` | 英文文章列表 | 同上 | 同上 | 同上 | 同上 | 同上 | 同上 |
| `/zh/articles/[slug]` | `app/zh/articles/[slug]/page.tsx` | 中文文章详情 | 文章封面、标题、日期、作者、摘要、正文、关键词、相关文章/专题/表情 | `GET /api/v1/articles/{slug}` | 返回、点击相关 | 文章排版、封面、字体层级、相关模块 | 404、draft/archived 不可见、BlogPosting JSON-LD | canonical/hreflang/BlogPosting JSON-LD |
| `/en/articles/[slug]` | `app/en/articles/[slug]/page.tsx` | 英文文章详情 | 同上 | 同上 | 同上 | 同上 | 同上 | 同上 |

### 2.8 工具 / About / License

| 路径 | 文件 | 用途 | 当前功能 | 数据来源 | 必须保留的交互 | 后续 UI 修改范围 | 回归测试项 | SEO / noindex |
|------|------|------|----------|----------|----------------|------------------|------------|---------------|
| `/zh/tools` | `app/zh/tools/page.tsx` | 中文工具页 | 4 个真实规划项的开发队列；明确无可执行工具 | 硬编码 | 无 | Batch 4B 已完成 | 页面可访问、无无效控件 | title/description |
| `/en/tools` | `app/en/tools/page.tsx` | 英文工具页 | 同上 | 硬编码 | 无 | Batch 4B 已完成 | 同上 | 同上 |
| `/zh/about` | `app/zh/about/page.tsx` | 关于我们 | 产品定位、真实浏览能力、内容与授权边界 | 硬编码 | 授权说明链接 | Batch 4B 已完成 | 页面可访问、链接可用 | title/description |
| `/en/about` | `app/en/about/page.tsx` | About | 同上 | 硬编码 | 授权说明链接 | Batch 4B 已完成 | 同上 | 同上 |
| `/zh/license` | `app/zh/license/page.tsx` | 授权说明 | Unicode 字符/材料、平台图像、开源资源、本站内容 | 硬编码 | 锚点目录、官方外链 | Batch 4B 已完成 | 页面/锚点/外链可用 | title/description |
| `/en/license` | `app/en/license/page.tsx` | License | 同上 | 硬编码 | 锚点目录、官方外链 | Batch 4B 已完成 | 同上 | 同上 |

> Batch 4B 扫描确认：前台不存在 Settings、工具详情、工具执行结果或工具错误路由；未创建计划外页面、数据或交互。

### 2.9 Route Handlers（SEO 相关）

| 路径 | 文件 | 用途 | 当前功能 | 数据来源 | 必须保留的交互 | 后续 UI 修改范围 | 回归测试项 | SEO / noindex |
|------|------|------|----------|----------|----------------|------------------|------------|---------------|
| `/robots.txt` | `app/robots.txt/route.ts` | 动态 robots | Allow `/`，Disallow `/admin/`、`/api/v1/admin/`，引用 sitemap | 硬编码 | 无 | 无（非 UI） | 返回正确 | 控制爬虫 |
| `/sitemap.xml` | `app/sitemap.xml/route.ts` | 站点索引 | 列出 5 个子 sitemap | 硬编码 | 无 | 无（非 UI） | 返回正确 XML | 索引 |
| `/sitemaps/static.xml` | `app/sitemaps/static.xml/route.ts` | 静态页面 sitemap | 首页、列表、搜索落地页 | 硬编码 | 无 | 无 | 正确 URL | 索引 |
| `/sitemaps/emojis.xml` | `app/sitemaps/emojis.xml/route.ts` | Emoji sitemap | 所有 published emoji | `GET /api/v1/sitemap/emojis` | 无 | 无 | 正确 XML | 索引 |
| `/sitemaps/categories.xml` | `app/sitemaps/categories.xml/route.ts` | 分类 sitemap | 所有 published 分类 | `GET /api/v1/sitemap/categories` | 无 | 无 | 正确 XML | 索引 |
| `/sitemaps/topics.xml` | `app/sitemaps/topics.xml/route.ts` | 专题 sitemap | 所有 published 专题 | `GET /api/v1/sitemap/topics` | 无 | 无 | 正确 XML | 索引 |
| `/sitemaps/articles.xml` | `app/sitemaps/articles.xml/route.ts` | 文章 sitemap | 所有 published 文章 | `GET /api/v1/sitemap/articles` | 无 | 无 | 正确 XML | 索引 |

### 2.10 前台共享组件（`apps/web/src/components`）

| 组件 | 用途 | 后续 UI 修改范围 |
|------|------|------------------|
| `ArticleCard.tsx` | 文章卡片 | 卡片样式、悬停态、封面比例 |
| `Breadcrumb.tsx` | 面包屑 | 字体、间距、分隔符 |
| `CategoryCard.tsx` | 分类卡片 | 卡片样式、图标、计数 |
| `CopyArea.tsx` | 详情页复制区 | 复制项布局、按钮、反馈 |
| `CopyButton.tsx` | Emoji 复制按钮 | 按钮样式、 copied 反馈、动效 |
| `CopyValueButton.tsx` | 通用复制按钮 | 同上 |
| `DetailHero.tsx` | 详情页 Hero | 排版、字体、表情尺寸 |
| `DiscoverySection.tsx` | 首页发现模块 | 各区块布局、标题、查看全部 |
| `EmojiAssets.tsx` | 表情素材/授权 | 列表、链接、许可证 |
| `EmojiCard.tsx` | Emoji 卡片 | 卡片样式、悬停态、复制按钮 |
| `EmojiGrid.tsx` | Emoji 网格容器 | 网格密度、间距 |
| `EmojiExamples.tsx` | 表情示例 | 示例卡片、排版 |
| `EmojiKeywords.tsx` | 表情关键词 | 标签样式 |
| `EmojiMeaningSection.tsx` | 表情含义 | 内容层级、排版 |
| `EmojiTechInfo.tsx` | 技术信息 | 表格/列表样式 |
| `EmptyState.tsx` | 空状态 | 图标、文案、视觉 |
| `ErrorState.tsx` | 错误状态 | 图标、文案、重试 |
| `FaqBlock.tsx` | FAQ 展示 | 手风琴/列表样式 |
| `Footer.tsx` | 页脚 | 链接分组、版权、视觉 |
| `Header.tsx` | 顶部导航 | 导航样式、搜索入口、移动端菜单 |
| `Highlight.tsx` | 搜索结果高亮 | 高亮样式 |
| `HtmlLang.tsx` | html lang 同步 | 一般不动 |
| `JsonLd.tsx` | JSON-LD 注入 | 非 UI |
| `LanguageSwitcher.tsx` | 语言切换 | 切换器样式 |
| `LoadingState.tsx` | 加载状态 | loading 骨架/动画 |
| `Pagination.tsx` | 分页器 | 分页按钮样式 |
| `PlaceholderPage.tsx` | 占位页 | 视觉 |
| `RecommendedEmojis.tsx` | 推荐表情 | 卡片布局 |
| `RelatedCategories.tsx` | 相关分类 | 列表/卡片样式 |
| `RelatedEmojis.tsx` | 相关表情 | 网格样式 |
| `RelatedTopics.tsx` | 相关专题 | 列表/卡片样式 |
| `SearchBox.tsx` | 搜索框 | 输入框样式、快捷键、清空按钮 |
| `SearchResultCard.tsx` | 搜索结果卡片 | 各类型卡片样式 |
| `SearchResultsView.tsx` | 搜索结果视图 | 类型筛选、分页、加载态 |
| `Toast.tsx` | Toast 容器与显示 | 全局通知样式 |
| `ToolCard.tsx` | 工具卡片 | 卡片样式、badge |
| `TopicCard.tsx` | 专题卡片 | 卡片样式、类型标签 |

---

## 3. 后台路由盘点（`apps/admin`）

### 3.1 布局与入口

| 路径 | 文件 | 用途 | 当前功能 | 数据来源 | 必须保留的交互 | 后续 UI 修改范围 | 回归测试项 | SEO / noindex |
|------|------|------|----------|----------|----------------|------------------|------------|---------------|
| `/` | `app/page.tsx` | 根入口 | 重定向到 `/admin/dashboard` | 无 | 无 | 无 | 跳转正常 | 根布局 noindex |
| `/layout` | `app/layout.tsx` | 根布局 | 设置 `robots: {index:false, follow:false}`、html lang=zh | 无 | 无 | 字体、背景 | 所有页面继承 noindex | 全站 noindex |
| `/(admin)/layout` | `app/(admin)/layout.tsx` | 管理后台组 | 包裹 AuthProvider + AdminLayout | 无 | 无 | 无 | 鉴权保护 | 同上 |
| `/admin/login` | `app/(auth)/admin/login/page.tsx` | 登录页 | 邮箱/密码表单、登录失败提示、已登录跳转 | `POST /api/v1/admin/auth/login` | 提交、回车 | 登录表单视觉、错误提示、Logo | 401/403/成功跳转 | 同上 |

### 3.2 Dashboard

| 路径 | 文件 | 用途 | 当前功能 | 数据来源 | 必须保留的交互 | 后续 UI 修改范围 | 回归测试项 | SEO / noindex |
|------|------|------|----------|----------|----------------|------------------|------------|---------------|
| `/admin/dashboard` | `app/(admin)/admin/dashboard/page.tsx` | 仪表盘 | 统计卡、最近 emoji、管理员信息 | `GET /api/v1/admin/dashboard` | 无 | 统计卡密度、数据可视化、最近列表 | 数据加载、403 | noindex |

### 3.3 内容管理（Emoji / Category / Topic / Article / Asset）

| 路径 | 文件 | 用途 | 当前功能 | 数据来源 | 必须保留的交互 | 后续 UI 修改范围 | 回归测试项 | SEO / noindex |
|------|------|------|----------|----------|----------------|------------------|------------|---------------|
| `/admin/emojis` | `admin/emojis/page.tsx` | 表情列表 | 搜索/分类/状态筛选、分页、编辑/预览、新建按钮 | `listEmojis` | 筛选、分页、跳转 | 表格密度、筛选器、状态 badge、分页器 | 权限判断、空态 | noindex |
| `/admin/emojis/create` | `admin/emojis/create/page.tsx` | 创建表情 | 表单 wrapper | 无 | 提交表单 | 表单布局、Tab | 创建成功 | noindex |
| `/admin/emojis/[id]/edit` | `admin/emojis/[id]/edit/page.tsx` | 编辑表情 | 表单 wrapper | `getEmoji` | 提交表单 | 同上 | 编辑成功 | noindex |
| `/admin/categories` | `admin/categories/page.tsx` | 分类列表 | 搜索/父级/状态筛选、分页 | `listCategories` | 同上 | 同上 | 同上 | noindex |
| `/admin/categories/create` | `admin/categories/create/page.tsx` | 创建分类 | 表单 wrapper | 无 | 提交 | 同上 | 同上 | noindex |
| `/admin/categories/[id]/edit` | `admin/categories/[id]/edit/page.tsx` | 编辑分类 | 表单 wrapper | `getCategory` | 提交 | 同上 | 同上 | noindex |
| `/admin/topics` | `admin/topics/page.tsx` | 专题列表 | 搜索/状态筛选、分页 | `listTopics` | 同上 | 同上 | 同上 | noindex |
| `/admin/topics/create` | `admin/topics/create/page.tsx` | 创建专题 | 表单 wrapper | 无 | 提交 | 同上 | 同上 | noindex |
| `/admin/topics/[id]/edit` | `admin/topics/[id]/edit/page.tsx` | 编辑专题 | 表单 wrapper | `getTopic` | 提交、Emoji 关联增删排序 | 同上 + 关联选择器 | 同上 | noindex |
| `/admin/articles` | `admin/articles/page.tsx` | 文章列表 | 搜索/状态筛选、分页 | `listArticles` | 同上 | 同上 | 同上 | noindex |
| `/admin/articles/create` | `admin/articles/create/page.tsx` | 创建文章 | 表单 wrapper | 无 | 提交 | 同上 | 同上 | noindex |
| `/admin/articles/[id]/edit` | `admin/articles/[id]/edit/page.tsx` | 编辑文章 | 表单 wrapper | `getArticle` | 提交 | 同上 | 同上 | noindex |
| `/admin/assets` | `admin/assets/page.tsx` | 素材列表 | 关键词/provider/fileType/状态/可下载 筛选、分页 | `listAssets` | 筛选、分页 | 同上 | 删除确认 | noindex |
| `/admin/assets/create` | `admin/assets/create/page.tsx` | 创建素材 | 表单 wrapper | 无 | 提交 | 同上 | 同上 | noindex |
| `/admin/assets/[id]/edit` | `admin/assets/[id]/edit/page.tsx` | 编辑素材 | 表单 wrapper | `getAsset` | 提交、删除 | 同上 | 同上 | noindex |

### 3.4 审核管理

| 路径 | 文件 | 用途 | 当前功能 | 数据来源 | 必须保留的交互 | 后续 UI 修改范围 | 回归测试项 | SEO / noindex |
|------|------|------|----------|----------|----------------|------------------|------------|---------------|
| `/admin/reviews` | `admin/reviews/page.tsx` | 审核列表 | 状态/类型/语言/关键词筛选、分页 | `listReviews` | 筛选、进入详情 | 列表样式、badge | 权限 | noindex |
| `/admin/reviews/[id]` | `admin/reviews/[id]/page.tsx` | 审核详情 | 详情展示、adminNote、状态切换 | `getReview`, `updateReviewStatus` | 状态按钮、提交备注 | 详情布局、操作按钮 | 状态切换、403 | noindex |

### 3.5 SEO 管理

| 路径 | 文件 | 用途 | 当前功能 | 数据来源 | 必须保留的交互 | 后续 UI 修改范围 | 回归测试项 | SEO / noindex |
|------|------|------|----------|----------|----------------|------------------|------------|---------------|
| `/admin/seo` | `admin/seo/page.tsx` | SEO 总览 | 四实体统计、缺失概览、最近更新、robots/sitemap 状态 | `getSeoOverview` | 跳转 | 概览卡、数据可视化 | 数据正确 | noindex |
| `/admin/seo/emojis` | `admin/seo/emojis/page.tsx` | Emoji SEO 列表 | 复用 SeoEntityList | `listSeoEntities` | 筛选、分页、编辑 | 表格样式 | 跳转编辑 | noindex |
| `/admin/seo/categories` | `admin/seo/categories/page.tsx` | 分类 SEO 列表 | 同上 | 同上 | 同上 | 同上 | 同上 | noindex |
| `/admin/seo/topics` | `admin/seo/topics/page.tsx` | 专题 SEO 列表 | 同上 | 同上 | 同上 | 同上 | 同上 | noindex |
| `/admin/seo/articles` | `admin/seo/articles/page.tsx` | 文章 SEO 列表 | 同上 | 同上 | 同上 | 同上 | 同上 | noindex |
| `/admin/seo/[entityType]/[id]/edit` | `admin/seo/[entityType]/[id]/edit/page.tsx` | 编辑 SEO | 中/英 seoTitle/seoDescription、字符数提示、canonical/hreflang 预览 | `getSeoEntity`, `updateSeoEntity` | 提交 | 表单布局、字符计数、预览 | 权限、保存 | noindex |
| `/admin/seo/quality` | `admin/seo/quality/page.tsx` | SEO 质量检查 | 统计、问题分布、运行检查 | `getSeoQualityOverview`, `runSeoQualityCheck` | 运行检查 | 概览卡、图表、按钮 | 只读/运行权限 | noindex |
| `/admin/seo/quality/issues` | `admin/seo/quality/issues/page.tsx` | SEO 问题列表 | 五筛选、分页 | `listSeoQualityIssues` | 筛选、跳转编辑 | 表格、筛选器 | 数据正确 | noindex |

### 3.6 搜索 / 分析 / 日志

| 路径 | 文件 | 用途 | 当前功能 | 数据来源 | 必须保留的交互 | 后续 UI 修改范围 | 回归测试项 | SEO / noindex |
|------|------|------|----------|----------|----------------|------------------|------------|---------------|
| `/admin/search/infrastructure` | `admin/search/infrastructure/page.tsx` | 搜索基础设施 | Provider/索引状态、重建/设置按钮 | 多个搜索 API | 重建、设置 | 状态面板、操作按钮、结果表 | 权限、失败处理 | noindex |
| `/admin/search/analytics` | `admin/search/analytics/page.tsx` | 搜索分析 | 概览卡、语言/provider 占比、Top 查询、零结果、调优按钮 | 多个分析 API | 筛选、分页、调优 | 数据可视化、表格 | super_admin 调优权限 | noindex |
| `/admin/search-logs` | `admin/search-logs/page.tsx` | 搜索日志 | 关键词/语言/日期/结果数筛选、分页 | `listSearchLogs` | 筛选、分页 | 表格、筛选器 | 不泄露明文 IP | noindex |
| `/admin/copy-events` | `admin/copy-events/page.tsx` | 复制日志 | 语言/emojiId/日期筛选、分页 | `listCopyEvents` | 筛选、分页 | 表格、筛选器 | 同上 | noindex |
| `/admin/discovery` | `admin/discovery/page.tsx` | 发现与推荐说明 | 只读状态展示 | `getSearchInfrastructureStatus` | 无 | 信息面板 | 数据正确 | noindex |

### 3.7 占位页面

| 路径 | 文件 | 用途 | 当前功能 | 数据来源 | 必须保留的交互 | 后续 UI 修改范围 | 回归测试项 | SEO / noindex |
|------|------|------|----------|----------|----------------|------------------|------------|---------------|
| `/admin/analytics` | `admin/analytics/page.tsx` | 统计分析 | PlaceholderPage | 无 | 无 | 占位视觉 | 页面可访问 | noindex |
| `/admin/settings` | `admin/settings/page.tsx` | 系统设置 | PlaceholderPage | 无 | 无 | 占位视觉 | 页面可访问 | noindex |

### 3.8 后台共享组件（`apps/admin/src/components`）

| 组件 | 用途 | 后续 UI 修改范围 |
|------|------|------------------|
| `AdminLayout.tsx` | 侧边栏 + 顶部管理员 + 退出 | 侧边栏样式、导航密度、折叠、当前态 |
| `AuthProvider.tsx` | 鉴权 Context | 加载态、错误态 |
| `EmojiForm.tsx` | Emoji 创建/编辑 | 表单布局、Tab、字段分组 |
| `CategoryForm.tsx` | 分类创建/编辑 | 同上 |
| `TopicForm.tsx` | 专题创建/编辑 | 同上 + Emoji 关联选择器 |
| `ArticleForm.tsx` | 文章创建/编辑 | 同上 + 日期选择器 |
| `AssetForm.tsx` | 素材创建/编辑 | 同上 + 删除确认 |
| `SeoEntityList.tsx` | 可复用 SEO 实体列表 | 表格、筛选器、分页 |
| `PlaceholderPage.tsx` | 占位页 | 视觉 |

---

## 4. 交互模式现状

| 模式 | 前台 | 后台 | 备注 |
|------|------|------|------|
| 搜索 | 单输入框 + 提交 | 列表关键词筛选 | 后台无全局搜索 |
| 复制 | `CopyButton` + `CopyValueButton` + `CopyArea` | 无 | 前台复制后 Toast 反馈 |
| 分页 | `Pagination` 组件 | 各页内联分页 | 可统一为 macOS 风格 |
| 筛选 | 简单 select/input | 简单 select/input | 需要统一视觉 |
| 表格 | 无独立表格组件 | 各页手写 `<table>` | 后台需要统一表格组件 |
| 表单 | 无统一表单组件 | 各 `*Form.tsx` | 需要统一表单布局与字段样式 |
| Dialog / Drawer / Dropdown | 无 | 无 | 改版可引入，但需保持克制 |
| Toast | `Toast.tsx`（前台） | 内联提示条 | 后台可升级为统一 Toast |
| 快捷键 | 无 | 无 | 首页/搜索可引入 ⌘K |
| 移动端 | 基础响应式 | 无专门适配 | 需重点优化 |
| 深色模式 | 无 | 无 | Batch 6 实现 |
| 无障碍 | 基本 `aria-label` | 基本 | Batch 6 加强 |

---

## 5. SEO / 索引边界

- 前台所有公开页面均输出 `title`、`description`、`canonical`、`hreflang`（zh/en/x-default）。
- 表情/分类/专题/文章详情页输出 `FAQPage` 或 `BreadcrumbList` JSON-LD（文章为 `BlogPosting`）。
- 搜索结果带 `?q=` 参数时返回 `robots: noindex, follow`，canonical 合并到基础搜索页。
- 后台所有页面通过根布局 `robots: {index:false, follow:false}` 全局 noindex。
- `robots.txt` 阻止 `/admin/` 与 `/api/v1/admin/` 爬虫。
- sitemap 仅包含 published 实体，不包含 draft/archived/admin。
