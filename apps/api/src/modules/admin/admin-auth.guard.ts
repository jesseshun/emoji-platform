import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';

export interface AdminJwtPayload {
  sub: string;
  email: string;
  role: string;
  name?: string | null;
}

function extractToken(req: Request): string | undefined {
  const auth = req.headers['authorization'];
  if (typeof auth === 'string' && auth.toLowerCase().startsWith('bearer ')) {
    return auth.slice(7).trim();
  }

  const cookieHeader = req.headers['cookie'];
  if (typeof cookieHeader === 'string') {
    for (const part of cookieHeader.split(';')) {
      const trimmed = part.trim();
      const eq = trimmed.indexOf('=');
      if (eq === -1) continue;
      const key = trimmed.slice(0, eq);
      if (key === 'admin_token') {
        return trimmed.slice(eq + 1);
      }
    }
  }

  return undefined;
}

@Injectable()
export class AdminAuthGuard implements CanActivate {
  constructor(private readonly jwt: JwtService) {}

  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest<Request>();
    const token = extractToken(req);

    if (!token) {
      throw new UnauthorizedException('Unauthorized');
    }

    try {
      const payload = this.jwt.verify<AdminJwtPayload>(token);
      (req as Request & { user?: AdminJwtPayload }).user = payload;
      return true;
    } catch {
      throw new UnauthorizedException('Unauthorized');
    }
  }
}
