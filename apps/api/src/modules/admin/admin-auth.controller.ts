import { Body, Controller, Get, Post, Req, Res, UseGuards } from '@nestjs/common';
import { Request, Response } from 'express';
import { AdminAuthService } from './admin-auth.service';
import { AdminAuthGuard, AdminJwtPayload } from './admin-auth.guard';
import { LoginBody, parseLoginBody } from './dto/login.dto';
import { resolveCookieSecure, resolveCookieDomain } from '../../common/security-config';

const COOKIE_NAME = 'admin_token';

@Controller('admin/auth')
export class AdminAuthController {
  constructor(private readonly authService: AdminAuthService) {}

  @Post('login')
  async login(
    @Body() body: LoginBody,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { email, password } = parseLoginBody(body);
    const { admin, token } = await this.authService.login(email, password);

    // Cookie 安全属性改为环境变量驱动：
    // - COOKIE_SECURE：显式 true/false 优先；未设置时 production/preview 默认 true，本地开发默认 false。
    // - COOKIE_DOMAIN：为空时由浏览器按当前 host 处理（IP+端口访问应留空；子域访问按实际域名配置）。
    const cookieSecure = resolveCookieSecure();
    const cookieDomain = resolveCookieDomain();
    res.cookie(COOKIE_NAME, token, {
      httpOnly: true,
      sameSite: 'lax',
      secure: cookieSecure,
      domain: cookieDomain,
      path: '/',
      maxAge: this.authService.cookieMaxAgeMs(),
    });

    return {
      success: true,
      data: { admin, token },
    };
  }

  @Get('me')
  @UseGuards(AdminAuthGuard)
  async me(@Req() req: Request) {
    const user = (req as Request & { user?: AdminJwtPayload }).user;
    const admin = await this.authService.getById(user!.sub);
    return {
      success: true,
      data: { admin },
    };
  }

  @Post('logout')
  async logout(@Res({ passthrough: true }) res: Response) {
    const cookieDomain = resolveCookieDomain();
    res.clearCookie(COOKIE_NAME, { path: '/', domain: cookieDomain });
    return {
      success: true,
      data: { loggedOut: true },
    };
  }
}
