import { BadRequestException } from '@nestjs/common';

export interface LoginBody {
  email: string;
  password: string;
}

export interface ParsedLogin {
  email: string;
  password: string;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function parseLoginBody(body: Partial<LoginBody> | undefined): ParsedLogin {
  if (!body || typeof body !== 'object') {
    throw new BadRequestException('请求体格式不正确');
  }

  const email = typeof body.email === 'string' ? body.email.trim() : '';
  const password = typeof body.password === 'string' ? body.password : '';

  if (!email) {
    throw new BadRequestException('邮箱不能为空');
  }
  if (!password) {
    throw new BadRequestException('密码不能为空');
  }
  if (!EMAIL_RE.test(email)) {
    throw new BadRequestException('邮箱格式不正确');
  }

  return { email, password };
}
