'use client';

import { AuthProvider } from '@/components/AuthProvider';
import { AdminLayout } from '@/components/AdminLayout';

export default function AdminGroupLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <AdminLayout>{children}</AdminLayout>
    </AuthProvider>
  );
}
