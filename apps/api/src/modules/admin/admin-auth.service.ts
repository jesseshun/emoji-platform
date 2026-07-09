import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { AdminJwtPayload } from './admin-auth.guard';

export interface AdminPublic {
  id: string;
  email: string;
  name: string | null;
  role: string;
}

type AdminRecord = {
  id: string;
  email: string;
  name: string | null;
  role: string;
};

function toPublic(admin: AdminRecord): AdminPublic {
  return { id: admin.id, email: admin.email, name: admin.name, role: admin.role };
}

function parseExpiresInToMs(value: string): number {
  const match = /^(\d+)\s*(s|m|h|d|w)?$/.exec(value.trim());
  if (!match) return 7 * 24 * 60 * 60 * 1000;
  const num = parseInt(match[1], 10);
  const unit = match[2] || 's';
  const multipliers: Record<string, number> = {
    s: 1000,
    m: 60 * 1000,
    h: 60 * 60 * 1000,
    d: 24 * 60 * 60 * 1000,
    w: 7 * 24 * 60 * 60 * 1000,
  };
  return num * (multipliers[unit] ?? 1000);
}

@Injectable()
export class AdminAuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
  ) {}

  async login(email: string, password: string): Promise<{ admin: AdminPublic; token: string }> {
    const admin = await this.prisma.adminUser.findUnique({ where: { email } });

    // Do not reveal whether the email exists; use a generic message.
    if (!admin || admin.status !== 'active') {
      throw new UnauthorizedException('邮箱或密码错误');
    }

    const passwordMatches = await bcrypt.compare(password, admin.passwordHash);
    if (!passwordMatches) {
      throw new UnauthorizedException('邮箱或密码错误');
    }

    // Best-effort last-login update; never block login on failure.
    this.prisma.adminUser
      .update({ where: { id: admin.id }, data: { lastLoginAt: new Date() } })
      .catch(() => undefined);

    const payload: AdminJwtPayload = {
      sub: admin.id,
      email: admin.email,
      role: admin.role,
      name: admin.name,
    };
    const token = this.jwt.sign(payload);

    return { admin: toPublic(admin), token };
  }

  async getById(id: string): Promise<AdminPublic> {
    const admin = await this.prisma.adminUser.findUnique({ where: { id } });
    if (!admin) {
      throw new UnauthorizedException('Unauthorized');
    }
    return toPublic(admin);
  }

  cookieMaxAgeMs(): number {
    const expiresIn = this.config.get<string>('JWT_EXPIRES_IN') || '7d';
    return parseExpiresInToMs(expiresIn);
  }
}
