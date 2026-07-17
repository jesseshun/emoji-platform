# Emoji Platform — Design System

> macOS-inspired, minimal, refined design system for Emoji Platform.
> Version: 1.0 | Created: 2026-07-17

---

## 1. 设计理念

| 原则 | 描述 |
|------|------|
| **简约克制** | 每个元素都有存在理由，不堆砌装饰 |
| **macOS 质感** | 接近 Apple 系统应用的视觉语言和交互反馈 |
| **Emoji 为色彩** | 让 Emoji 本身成为页面主要视觉亮点 |
| **内容优先** | 高级感来自排版、留白和细节，而非装饰效果 |
| **快速响应** | 所有动效 ≤ 240ms，有即时反馈 |

### 视觉参考方向（非逐像素复制）

- **Raycast** — 搜索控件和快捷操作风格
- **Craft** — 内容卡片柔和质感
- **Linear** — 后台信息密度与精细边框
- **Apple HIG** — 圆角、间距、字体层级

---

## 2. 颜色 Tokens (Design Tokens)

所有颜色通过 CSS 自定义属性定义，支持浅色/深色模式自动切换。

### 2.1 浅色模式 (`:root`)

```
Background:
  --color-bg              #F6F7F9   页面主背景
  --color-bg-subtle       #FAFAFB   微调背景
  --color-bg-muted        #F0F1F3   弱化背景区域

Surface:
  --color-surface         #FFFFFF   主表面(卡片)
  --color-surface-elevated #FFFFFF  抬升表面(弹层)
  --color-surface-overlay rgba(255,255,255,0.78)  半透明覆盖
  --color-surface-overlay-strong rgba(255,255,255,0.92)  强半透明

Text:
  --color-text-primary    #171719   主文字
  --color-text-secondary  #6E6E73   次要文字
  --color-text-muted      #8E8E93   弱化文字
  --color-text-inverse    #FFFFFF   反色文字(深底上)
  --color-text-inverse-secondary  rgba(255,255,255,0.72)  次要反色文字
  --color-text-link       #0066CC   链接颜色
  --color-text-link-hover #004999   链接悬停

Border:
  --color-border-subtle   rgba(20,20,25,0.06)  极细边框
  --color-border          rgba(20,20,25,0.10)  默认边框
  --color-border-strong   rgba(20,20,25,0.16)  强边框
  --color-border-focus    rgba(0,102,204,0.50) 焦点环

Semantic:
  --color-accent          #007AFF   主强调色
  --color-accent-hover    #0066CC   强调色悬停
  --color-accent-subtle   rgba(0,122,255,0.08)  强调色淡背景
  --color-success         #34C759   成功
  --color-warning         #FF9F0A   警告
  --color-danger          #FF3B30   危险/错误

Header:
  --header-bg             rgba(250,250,251,0.76)  头部背景
  --header-border-color   继承 border-subtle
```

### 2.2 深色模式 (`.dark`)

```
Background:
  --color-bg              #111214
  --color-bg-subtle       #16171A
  --color-bg-muted        #1C1C1F

Surface:
  --color-surface         #1C1C1F
  --color-surface-elevated #222225
  --color-surface-overlay rgba(28,28,31,0.80)
  --color-surface-overlay-strong rgba(28,28,31,0.92)

Text:
  --color-text-primary    #F5F5F7
  --color-text-secondary  #98989D
  --color-text-muted      #636366
  --color-text-link       #409CFF
  --color-text-link-hover #66B0FF

Semantic:
  --color-accent          #409CFF
  --color-success         #30D158
  --color-warning         #FFD60A
  --color-danger          #FF453A
```

### 2.3 Tailwind 类名映射

```css
/* 背景 */
bg-bg / bg-bg-subtle / bg-bg-muted

/* 表面 */
bg-surface / bg-surface-elevated / bg-surface-overlay

/* 文字 */
text-text-primary / text-text-secondary / text-text-muted
text-text-link / text-text-link-hover

/* 边框 */
border-border-subtle / border-border / border-border-strong

/* 语义色 */
text-accent / bg-accent-subtle / text-success / text-danger 等
```

---

## 3. 圆角 (Border Radius)

| 用途 | 值 | Tailwind Class |
|------|-----|----------------|
| 小控件（按钮、标签） | 10px | `rounded-[10px]` 或 `rounded-sm` |
| 默认卡片 | 14px | `rounded` 或 `rounded-default` |
| 中等卡片 | 16–18px | `rounded-md` / `rounded-lg` |
| 大卡片 / 弹窗 | 20–24px | `rounded-xl` / `rounded-2xl` |
| 胶囊控件 | 999px | `rounded-pill` |

---

## 4. 阴影 (Shadows)

| 层级 | 使用场景 | 描述 |
|------|---------|------|
| `shadow-xs` | Header 滚动态、小控件抬起 | 极轻微阴影 |
| `shadow-sm` | 卡片默认状态 | 轻微深度 |
| `shadow` | 下拉菜单、浮层 | 标准阴影 |
| `shadow-md` | Modal、Drawer | 明显层级 |
| `shadow-lg` | 全屏遮罩层 | 最强投影 |
| `shadow-glow` | Focus ring 效果 | 发光环 |
| `shadow-card-hover` | 卡片悬停态 | 轻微上浮 |

---

## 5. 字体 (Typography)

### 5.1 字体栈

```css
font-family:
  -apple-system,
  BlinkMacSystemFont,
  "SF Pro Display",
  "SF Pro Text",
  "PingFang SC",
  "Hiragino Sans GB",
  "Microsoft YaHei",
  "Helvetica Neue",
  Helvetica,
  Arial,
  sans-serif;
```

**不引入外部字体文件**，使用系统字体确保加载速度。

### 5.2 字号阶梯

| Class | Size | 行高 | 使用场景 |
|-------|------|------|---------|
| `text-2xs` | 11px | 16px | Badge、标签、辅助信息 |
| `text-xs` | 12px | 18px | 小号说明、表格数据 |
| `text-sm` | 14px | 22px | 正文辅助、导航链接 |
| `text-base` | 16px | 24px | **正文默认** |
| `text-lg` | 18px | 26px | 区块标题 |
| `text-xl` | 20px | 28px | 大标题 |
| `text-2xl` | 24px | 32px | 页面标题 |
| `text-3xl` | 30px | 36px | Hero 标题 |
| `text-4xl` | 36px | 40px | 特大标题 |
| `text-5xl` | 48px | 55px | 展示型大字 |

---

## 6. 间距 (Spacing)

使用标准 Tailwind spacing scale，关键断点：

- 容器内边距：移动端 `16px`，桌面端 `24px`
- 元素间隙：紧凑 `8px`，常规 `12–16px`，宽松 `24px`
- Section 间距：纵向 `40–64px`
- 最大内容宽度：`1120px`（`max-w-content`）
- 宽屏最大宽度：`1280px`（`max-w-content-wide`）

---

## 7. 动画 (Motion)

### 7.1 时长规范

| 类型 | 时长 | Tailwind Token |
|------|------|----------------|
| Hover/微交互 | 120ms | `duration-fast` |
| 常规过渡 | 180ms | `duration-normal` |
| 展开/收起 | 240ms | `duration-slow` |
| Dialog/Modal 入场 | 180–200ms | 自定义 keyframe |
| Toast 显示 | 200ms | `toast-in` |
| Toast 消失 | 150ms | `toast-out` |

### 7.2 内置动画

| 名称 | 描述 | 使用场景 |
|------|------|---------|
| `fade-in` | 渐入 | 一般元素出现 |
| `slide-up` | 向上滑入 | 列表项、下拉 |
| `slide-down` | 向下滑入 | 通知、提示 |
| `scale-in` | 缩放进入 | Dialog、Modal |
| `toast-in` | Toast 出现 | 通知消息 |
| `toast-out` | Toast 消失 | 通知退出 |
| `slide-right-in` | 右侧滑入 | Drawer（右侧） |
| `slide-left-in` | 左侧滑入 | Drawer（左侧） |

### 7.3 Reduced Motion

系统已配置 `prefers-reduced-motion: reduce` 媒体查询：
- 所有动画时长 → `0.01ms`
- 过渡禁用
- 滚动行为 → `auto`

---

## 8. 深色模式 (Dark Mode)

### 配置方式
- Tailwind: `darkMode: 'class'`
- 通过在 `<html>` 上添加 `.dark` 类切换
- 当前预留完整 token 定义，UI 切换组件将在 Batch 2 实现

### 深色模式原则
- 不使用纯黑 `#000000` 铺满
- 表面使用分层深灰：`#111214` → `#16171A` → `#1C1C1F` → `#222225`
- 文字保持足够对比度（WCAG AA 标准）
- 边框使用低透明度白色

---

## 9. 无障碍规则 (Accessibility)

### 必须遵守

1. **焦点可见性**: `:focus-visible` 清晰焦点环（2px solid accent + offset）
2. **键盘可访问**: 所有交互元素可通过 Tab/Enter/Space 操作
3. **ARIA 标签**: 图标按钮必须有 `aria-label`
4. **语义化 HTML**: 按钮 `<button>`，链接 `<a>`，表单正确结构
5. **Skip Link**: 提供 `.skip-link` 快速跳到主内容
6. **对比度**: 主文字 ≥ 4.5:1，大文字 ≥ 3:1
7. **不仅依靠颜色表达状态**: 结合形状、文字、图标
8. **动效尊重用户偏好**: 支持 `prefers-reduced-motion`
9. **Dialog 焦点管理**: 打开时聚焦内部，Tab 循环，Escape 关闭
10. **Toast 区域**: `aria-live="polite"` + `aria-label="Notifications"`

---

## 10. 组件规范

### 10.1 已建立的基础组件

| 组件 | 文件 | 类型 | 描述 |
|------|------|------|------|
| `PageContainer` | `ui/PageContainer.tsx` | Server | 页面容器（max-width + padding） |
| `SectionHeader` | `ui/SectionHeader.tsx` | Server | 区域标题 + 可选操作区 |
| `SurfaceCard` | `ui/SurfaceCard.tsx` | Server | 通用卡片（可选 hover） |
| `PrimaryButton` | `ui/Button.tsx` | Client | 主要按钮 |
| `SecondaryButton` | `ui/Button.tsx` | Client | 次要按钮（描边） |
| `GhostButton` | `ui/Button.tsx` | Client | 幽灵按钮（无边框） |
| `IconButton` | `ui/IconButton.tsx` | Client | 图标按钮（需 label） |
| `SearchField` | `ui/SearchField.tsx` | Client | 搜索输入框 |
| `FilterChip` | `ui/FilterChip.tsx` | Client | 筛选标签 |
| `SegmentedControl` | `ui/SegmentedControl.tsx` | Client | 分段控制器 |
| `Badge` | `ui/Badge.tsx` | Server | 标签徽章 |
| `StatusBadge` | `ui/Badge.tsx` | Server | 状态指示器（脉冲动画） |
| `Tooltip` | `ui/Tooltip.tsx` | Client | 工具提示 |
| `ToastContainer` | `ui/Toast.tsx` | Client | Toast 容器 |
| `showToast()` | `ui/Toast.tsx` | Function | Toast 触发函数 |
| `Dialog` | `ui/Dialog.tsx` | Client | 对话框（含焦点陷阱） |
| `Drawer` | `ui/Drawer.tsx` | Client | 抽屉面板 |
| `LoadingSkeleton` | `ui/LoadingSkeleton.tsx` | Server | 加载骨架屏 |
| `CardSkeleton` | `ui/LoadingSkeleton.tsx` | Server | 卡片骨架 |
| `ListSkeleton` | `ui/LoadingSkeleton.tsx` | Server | 列表骨架 |
| `TableSkeleton` | `ui/LoadingSkeleton.tsx` | Server | 表格骨架 |

### 10.2 升级的现有组件

| 组件 | 改动 |
|------|------|
| `EmptyState` | 使用新 text tokens |
| `ErrorState` | 使用新 tokens + PrimaryButton 风格 |
| `Pagination` | 新圆角、新选中态样式 |
| `Breadcrumb` | 新 text tokens + 分隔符颜色 |
| `Header` | 完全重写（macOS 风格） |
| `Footer` | 完全重写（简洁分组） |
| `Toast` (旧 `components/Toast.tsx`) | 改为委托 `ui/Toast.tsx` 的兼容 shim，避免双容器 |
| `EmojiCard` | token 化：`bg-surface`/`border-border-subtle`/`hover:border-border`/`focus-visible` 光环 |
| `CategoryCard` | token 化 + `group-hover:text-accent` |
| `TopicCard` | token 化 + `Badge` 类型标签 |
| `ArticleCard` | token 化 + `from-accent-subtle to-bg-muted` 封面占位 |
| `CopyButton` | token 化 + 复制成功 `showToast(..., 'success')` |

### 10.4 首页与搜索组件（Batch 2 新增）

| 组件 | 文件 | 类型 | 描述 |
|------|------|------|------|
| `CommandPalette` | `components/CommandPalette.tsx` | Client | Raycast 式全局搜索浮层（Provider + `useCommandPalette()` + 浮层） |
| `HomeHero` | `components/HomeHero.tsx` | Client | 首页主搜索 Hero（聚焦光环、清空、⌘K 提示、浏览 chips） |
| `DiscoverySection` | `components/DiscoverySection.tsx` | Server | 首页发现模块，使用 `SectionHeader` + token 链接 |

### 10.3 Admin 基础组件类

| Class | 描述 |
|-------|------|
| `admin-card` | 管理后台通用卡片 |
| `admin-input` | 管理后台输入框 |
| `admin-btn-primary` | 主要操作按钮 |
| `admin-btn-secondary` | 次要操作按钮 |
| `admin-btn-danger` | 危险操作按钮 |
| `admin-badge-*` | 状态徽章（success/warning/danger/info/neutral） |
| `admin-table*` | 表格容器 + 表头 + 单元格样式 |

---

## 11. Z-Index 层级

| 层级 | 值 | 使用场景 |
|------|-----|---------|
| base | 1 | 默认内容 |
| dropdown | 100 | 下拉菜单、Tooltip |
| sticky | 200 | 固定头部 |
| overlay | 400 | 遮罩层 |
| modal | 500 | Dialog、Drawer |
| toast | 600 | 通知消息 |

---

## 12. 响应式断点

基于 Tailwind 默认断点：

| 断点 | 最小宽度 | 设备类型 |
|------|---------|---------|
| (默认) | 0 | 手机竖屏 |
| `sm` | 640px | 手机横屏/小平板 |
| `md` | 768px | 平板 |
| `lg` | 1024px | 笔记本 |
| `xl` | 1280px | 桌面显示器 |

### 关键响应式策略

- Header: `md:` 以上显示完整导航，以下显示汉堡菜单
- Footer: 移动端 2 列，桌面端 3–4 列
- 内容宽度: `max-w-content` (1120px) + 左右自适应 padding
- Grid: 使用 `grid-cols-{n} sm:grid-cols-{m}` 渐进增强

---

## 13. 禁止事项

1. ❌ 不要使用全屏毛玻璃（性能 + 可读性）
2. ❌ 不要大面积蓝紫霓虹渐变
3. ❌ 不要每张卡片都加强阴影
4. ❌ 不要无意义渐变背景
5. ❌ 不要使用小于 11px 的字号
6. ❌ 不要牺牲内容效率换取"高级感"
7. ❌ 不要复制任何参考网站的品牌代码或元素
8. ❌ 不要引入大型外部字体文件
9. ❌ 不要创建第二套冲突的设计系统
10. ❌ 不要将服务端组件无理由改为客户端组件

---

## 14. 后续批次复用指南

### Batch 2（首页改版）应直接使用

- `PageContainer` 包裹首页各模块
- `SectionHeader` 作为每个区块的标题（含 `action` 操作区）
- `SurfaceCard` / token 类（`bg-surface border-border-subtle hover:border-border`）作为卡片基底
- `Badge` 作为类型/状态徽章（如专题类型）
- `CommandPalette`（`useCommandPalette()` hook）作为任何"搜索入口"按钮的统一触发点——Header 搜索按钮、移动端搜索图标、Hero 次级按钮均已接入
- `FilterChip` 用于分类筛选
- Header/Footer 已完成，无需再次修改
- 全局搜索浮层复用现有 `search(locale, q, {type, limit})` API，禁止新增搜索后端或伪造数据

### Batch 3–6 应继续沿用

- 所有颜色使用 `text-*` / `bg-*` / `border-*` tokens
- 所有圆角使用新的 radius scale
- 所有阴影使用新的 shadow scale
- 所有动画使用内置 keyframes
- 无障碍规则始终适用

---

## 15. 文件索引

| 文件 | 作用 |
|------|------|
| `apps/web/tailwind.config.js` | Web 端 Tailwind 扩展配置 |
| `apps/admin/tailwind.config.js` | Admin 端 Tailwind 扩展配置 |
| `apps/web/src/app/globals.css` | CSS 变量定义 + 全局基础样式 |
| `apps/admin/src/app/globals.css` | Admin 全局样式 + 工具类 |
| `apps/web/src/components/ui/*` | 前台基础组件库 |
| `docs/ui/UI_DESIGN_SYSTEM.md` | 本文档 |
