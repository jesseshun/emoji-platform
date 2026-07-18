# UI 改版基线文档

> 本文档记录 emoji-platform 全站 UI/UX 改版的起点与约束。
> 创建日期：2026-07-17

## 1. 基线信息

| 项目 | 值 |
|------|-----|
| 仓库 | https://github.com/jesseshun/emoji-platform |
| 当前线上地址 | http://1.14.179.198/zh |
| 当前工作目录 | /workspace/emoji-platform |
| main HEAD（基线 commit） | `e5be50b` |
| 基线标签 | `ui-redesign-baseline-20260717` |
| UI 改版分支 | `feature/macos-ui-redesign` |
| 当前项目阶段 | Phase 7B 完成，Phase 7C-1 仓库产物已就绪，7C-2 真实部署待授权 |

## 2. 仓库恢复状态

- 已通过镜像服务获取仓库最新代码。
- 工作区 clean，`main` 与 `origin/main` 指向一致。
- `apps/web`、`apps/admin`、`apps/api` 均存在。
- `packages/shared`、`packages/types`、`packages/ui` 存在，但当前 `packages/ui` 与 `packages/shared` 几乎未被 `apps/web` / `apps/admin` 实际引用。
- **网络限制说明**：当前沙箱无法直接通过 HTTPS 访问 `github.com`（TLS 握手失败），也无法向 `gitclone.com` origin 进行认证 push。基线标签与 UI 分支已在本地创建；推送到 GitHub 需在可访问 GitHub 的环境中手动执行，或配置可用代理 / token 后重试。

## 3. 明确禁止修改的业务与架构

本轮及后续 UI 改版必须遵守以下限制（来自 `DEVELOPMENT_RULES.md` 与项目约束）：

1. **不修改业务功能**：搜索、复制、分类、专题、文章、推荐、SEO 等核心逻辑保持原行为。
2. **不修改 API**：`apps/api` 的接口签名、鉴权、响应结构、审计日志保持不变。
3. **不修改 Prisma schema**：`apps/api/prisma/schema.prisma` 不动。
4. **不修改数据库**：不新增表、不删字段、不改迁移。
5. **不合并 main**：所有 UI 改动在 `feature/macos-ui-redesign` 分支进行。
6. **不部署腾讯云**：本轮及后续各 Batch 内不执行真实服务器部署。
7. **不覆盖当前线上版本**：线上版本由 main 标签 `ui-redesign-baseline-20260717` 锁定。
8. **不改为纯静态站**：保留 Next.js App Router + API 的动态架构。
9. **不复制竞品代码/资产**：参考图仅作视觉方向，不逐像素复制 Apple / Raycast / Craft / Linear 的代码、品牌元素或具体页面。
10. **不大规模重构**：优先小步、可逆、可回滚的样式与组件调整。

## 4. 当前技术栈与样式基础

- **Monorepo**：pnpm workspace
- **前台**：Next.js 14 App Router + TypeScript + Tailwind CSS（无自定义主题扩展）
- **后台**：Next.js 14 App Router + TypeScript + Tailwind CSS
- **API**：NestJS + TypeScript（本轮不改动）
- **当前 Tailwind 配置**：默认配置，无 `darkMode` 配置，无自定义颜色/字体/阴影扩展
- **当前 CSS**：仅 `@tailwind` 三行指令，无设计系统 token
- **当前无**：暗色模式、Dialog/Drawer/Dropdown/Toast 库、快捷键、强移动端适配

## 5. 恢复旧版本的方法

如需放弃 UI 改版分支并回到当前稳定版本：

```bash
cd /workspace/emoji-platform
git checkout main
git reset --hard e5be50b   # 回到基线 commit
# 或按标签恢复
git reset --hard ui-redesign-baseline-20260717
```

如需在可联网机器上重新拉取并推送标签/分支：

```bash
git push origin ui-redesign-baseline-20260717
git push -u origin feature/macos-ui-redesign
```

## 6. 参考设计方向

- 简约、高级、克制
- macOS 原生应用感
- Raycast 式搜索与快捷操作
- Craft 式内容层级
- Apple 式留白和排版
- Linear 式后台密度
- Emoji 作为主要色彩来源
- 少量毛玻璃，不滥用
- 轻微阴影和细边框
- 动效快速、克制、有反馈

## 7. 相关文档

- `docs/ui/UI_ROUTE_INVENTORY.md`：全站路由与组件盘点
- `docs/ui/UI_REDESIGN_PLAN.md`：分阶段实施计划（Batch 1-7）
- `PROJECT_HANDOFF.md`：项目阶段与交付记录
- `DEVELOPMENT_RULES.md`：开发纪律
- `ROADMAP.md`：长期路线图
