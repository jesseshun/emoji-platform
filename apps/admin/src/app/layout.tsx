import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Emoji Platform Admin',
  description: 'Emoji Platform CMS management',
  robots: {
    index: false,
    follow: false,
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh">
      <body className="min-h-screen bg-[#F6F7F9] text-gray-900 antialiased">{children}</body>
    </html>
  );
}
