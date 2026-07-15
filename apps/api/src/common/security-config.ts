/**
 * Preview / Production 安全相关配置解析。
 *
 * 本文件只读取环境变量并计算派生配置，不输出任何敏感值到日志。
 * 所有密钥相关逻辑均由部署者在真实 .env / .env.preview / .env.production 中提供，
 * 仓库内仅保留占位模板（.env*.example）。
 */

const LOCALHOST_FALLBACK = ['http://localhost:3000', 'http://localhost:3001'];

/**
 * 将逗号分隔的环境变量解析为去重后的非空列表。
 * 自动 trim，忽略空值与纯空白项；支持多 origin 配置。
 */
export function parseCommaList(value?: string): string[] {
  if (!value) return [];
  return Array.from(
    new Set(
      value
        .split(',')
        .map((item) => item.trim())
        .filter((item) => item.length > 0),
    ),
  );
}

/**
 * 计算允许的 CORS origin 列表。
 *
 * 来源（合并去重）：
 *   - CORS_ORIGIN（Web 等前端来源）
 *   - ADMIN_ALLOWED_ORIGINS（Admin 后台来源）
 *   - WEB_BASE_URL / ADMIN_BASE_URL（可选，自动放行对应站点）
 *
 * 若以上全部为空，则回退到 localhost:3000 / localhost:3001，
 * 保证本地开发开箱即用，且无需写死任何 preview / production 域名或 IP。
 */
export function buildAllowedCorsOrigins(): string[] {
  const origins = parseCommaList(process.env.CORS_ORIGIN)
    .concat(parseCommaList(process.env.ADMIN_ALLOWED_ORIGINS))
    .concat(parseCommaList(process.env.WEB_BASE_URL))
    .concat(parseCommaList(process.env.ADMIN_BASE_URL));

  if (origins.length === 0) return [...LOCALHOST_FALLBACK];
  return origins;
}

/**
 * 是否为 production / preview 环境。
 * 用于：JWT_SECRET 强制校验、cookie secure 默认值等安全相关决策。
 */
export function isProductionLike(): boolean {
  const nodeEnv = process.env.NODE_ENV;
  const appEnv = process.env.APP_ENV;
  return nodeEnv === 'production' || appEnv === 'preview';
}

/**
 * Cookie `secure` 标志解析：
 *   - 显式设置 COOKIE_SECURE=true/false 时按设置。
 *   - 未显式设置时：production / preview 默认 true，其余（本地开发）默认 false。
 *
 * 这样 Preview 在 HTTP 下可设 false，而 HTTPS 正式环境可显式设 true。
 */
export function resolveCookieSecure(): boolean {
  const raw = process.env.COOKIE_SECURE;
  if (raw === 'true') return true;
  if (raw === 'false') return false;
  return isProductionLike();
}

/**
 * Cookie `domain` 解析：
 *   - COOKIE_DOMAIN 为空（默认）时返回 undefined，由浏览器按当前 host 处理。
 *   - IP + 端口访问时，COOKIE_DOMAIN 应留空；preview 子域访问时按实际域名配置。
 * 绝不写死正式域名。
 */
export function resolveCookieDomain(): string | undefined {
  const domain = process.env.COOKIE_DOMAIN?.trim();
  return domain && domain.length > 0 ? domain : undefined;
}
