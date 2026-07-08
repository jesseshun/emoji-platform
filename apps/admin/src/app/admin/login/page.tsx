import { PlaceholderPage } from '@/components/PlaceholderPage';

export default function AdminLoginPage() {
  return (
    <div className="flex items-center justify-center min-h-[80vh]">
      <div className="bg-white rounded-lg border p-8 w-full max-w-sm">
        <h1 className="text-xl font-bold mb-4 text-center">管理员登录</h1>
        <p className="text-sm text-gray-500 text-center mb-6">
          此页面为占位页面，真实登录功能将在后续阶段实现。
        </p>
        <div className="space-y-3">
          <input
            type="text"
            placeholder="用户名"
            disabled
            className="w-full px-3 py-2 border rounded text-sm bg-gray-100"
          />
          <input
            type="password"
            placeholder="密码"
            disabled
            className="w-full px-3 py-2 border rounded text-sm bg-gray-100"
          />
          <button
            disabled
            className="w-full py-2 bg-blue-600 text-white rounded text-sm opacity-50 cursor-not-allowed"
          >
            登录
          </button>
        </div>
      </div>
    </div>
  );
}
