'use client';

import { useAuth } from '@/components/AuthProvider';

export default function AdminDashboardPage() {
  const { admin } = useAuth();

  return (
    <div>
      <h1 className="text-2xl font-bold mb-2">📊 仪表盘</h1>
      <p className="text-gray-500 mb-6">系统概览与关键数据统计（Phase 4A 基础占位）。</p>

      <div className="bg-white rounded-lg border p-5 mb-6 max-w-md">
        <h2 className="text-sm font-semibold text-gray-700 mb-3">当前登录管理员</h2>
        <dl className="text-sm space-y-1">
          <div className="flex justify-between">
            <dt className="text-gray-500">邮箱</dt>
            <dd className="font-medium">{admin?.email}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-gray-500">姓名</dt>
            <dd className="font-medium">{admin?.name || '—'}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-gray-500">角色</dt>
            <dd className="font-medium">{admin?.role}</dd>
          </div>
        </dl>
      </div>

      <div className="bg-white rounded-lg border p-8 text-center text-gray-400">
        <p className="text-5xl mb-3">🚧</p>
        <p>仪表盘统计功能将在后续阶段开发</p>
      </div>
    </div>
  );
}
