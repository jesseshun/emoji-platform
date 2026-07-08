import type { Metadata } from 'next';
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
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col bg-gray-50 text-gray-900">
        <HtmlLang />
        {children}
        <ToastContainer />
      </body>
    </html>
  );
}
