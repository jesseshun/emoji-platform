import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/http-exception.filter';
import { ResponseInterceptor } from './common/response.interceptor';
import { Logger } from '@nestjs/common';
import { buildAllowedCorsOrigins } from './common/security-config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const logger = new Logger('Bootstrap');

  app.setGlobalPrefix('api/v1');

  // CORS 改为环境变量驱动（CORS_ORIGIN / ADMIN_ALLOWED_ORIGINS / WEB_BASE_URL / ADMIN_BASE_URL），
  // 支持多 origin 逗号分隔、自动 trim、忽略空值；全部为空时回退到 localhost。
  // 不允许 '*' 携带 credentials：明确白名单外的来源一律拒绝。
  const allowedOrigins = buildAllowedCorsOrigins();
  const allowedSet = new Set(allowedOrigins);
  app.enableCors({
    origin: (reqOrigin, cb) => {
      // 无 Origin 头（服务端到服务端调用 / 同源请求）：允许，且不设置通配 ACAO。
      if (!reqOrigin) return cb(null, true);
      // 白名单内来源显式放行（credentials=true 下 ACAO 为具体 origin，而非 '*'）。
      if (allowedSet.has(reqOrigin)) return cb(null, reqOrigin);
      // 白名单外来源：拒绝。
      return cb(null, false);
    },
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    credentials: true,
  });

  app.useGlobalFilters(new HttpExceptionFilter());
  app.useGlobalInterceptors(new ResponseInterceptor());

  const port = process.env.API_PORT ?? 4000;
  await app.listen(port);
  logger.log(`API server running on http://localhost:${port}`);
}

bootstrap();
