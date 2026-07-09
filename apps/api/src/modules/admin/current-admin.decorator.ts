import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { AdminJwtPayload } from './admin-auth.guard';

/**
 * Extracts the authenticated admin payload attached to the request by
 * AdminAuthGuard. Always used together with @UseGuards(AdminAuthGuard).
 */
export const CurrentAdmin = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): AdminJwtPayload => {
    const req = ctx.switchToHttp().getRequest<Request & { user?: AdminJwtPayload }>();
    const user = req.user;
    if (!user) {
      throw new Error('CurrentAdmin used without AdminAuthGuard');
    }
    return user;
  },
);
