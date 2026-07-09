import { Body, Controller, Get, Post, Req, Res, UseGuards } from '@nestjs/common';
import { Request, Response } from 'express';
import { AdminAuthService } from './admin-auth.service';
import { AdminAuthGuard, AdminJwtPayload } from './admin-auth.guard';
import { LoginBody, parseLoginBody } from './dto/login.dto';

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

    const isProd = process.env.NODE_ENV === 'production';
    res.cookie(COOKIE_NAME, token, {
      httpOnly: true,
      sameSite: 'lax',
      secure: isProd,
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
    res.clearCookie(COOKIE_NAME, { path: '/' });
    return {
      success: true,
      data: { loggedOut: true },
    };
  }
}
