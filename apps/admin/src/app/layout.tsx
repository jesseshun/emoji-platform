import type { Metadata } from 'next';
import './globals.css';
import { AdminLayout } from '@/components/AdminLayout';

export const metadata: Metadata = {
  title: 'Emoji Platform Admin',
  description: 'Emoji Platform CMS management',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh">
      <body className="min-h-screen bg-gray-50 text-gray-900">
        <AdminLayout>{children}</AdminLayout>
      </body>
    </html>
  );
}
