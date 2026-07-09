export interface AdminUser {
  id: string;
  email: string;
  name: string | null;
  role: string;
}

export class AdminApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public code?: string,
  ) {
    super(message);
    this.name = 'AdminApiError';
  }
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

interface ApiEnvelope<T> {
  success: boolean;
  data: T;
  error?: { code?: string; message?: string };
}

async function adminFetch<T>(path: string, options?: RequestInit): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`${API_BASE}/api/v1${path}`, {
      ...options,
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        ...(options?.headers || {}),
      },
    });
  } catch {
    throw new AdminApiError('无法连接到服务器，请稍后重试', 0, 'NETWORK_ERROR');
  }

  let body: ApiEnvelope<T>;
  try {
    body = (await res.json()) as ApiEnvelope<T>;
  } catch {
    throw new AdminApiError('服务器返回了无效响应', res.status, 'INVALID_JSON');
  }

  if (!res.ok || !body.success) {
    const err = body.error || {};
    throw new AdminApiError(err.message || `请求失败（${res.status}）`, res.status, err.code);
  }

  return body.data;
}

export async function adminLogin(
  email: string,
  password: string,
): Promise<{ admin: AdminUser; token: string }> {
  return adminFetch<{ admin: AdminUser; token: string }>('/admin/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
}

export async function getAdminMe(): Promise<AdminUser> {
  const data = await adminFetch<{ admin: AdminUser }>('/admin/auth/me');
  return data.admin;
}

export async function adminLogout(): Promise<{ loggedOut: boolean }> {
  return adminFetch<{ loggedOut: boolean }>('/admin/auth/logout', { method: 'POST' });
}
