import type { Metadata } from 'next';
import { headers } from 'next/headers';
import './globals.css';
import { ToastContainer } from '@/components/Toast';
import { HtmlLang } from '@/components/HtmlLang';

export const metadata: Metadata = {
  title: {
    default: 'Emoji Platform',
    template: '%s | Emoji Platform',
  },
  description: 'A global Emoji dictionary and search platform',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const path = headers().get('x-locale-path') ?? '';
  const lang = path.startsWith('/zh') ? 'zh' : 'en';

  return (
    <html lang={lang}>
      <body className="min-h-screen flex flex-col bg-gray-50 text-gray-900">
        <HtmlLang />
        {children}
        <ToastContainer />
      </body>
    </html>
  );
}
