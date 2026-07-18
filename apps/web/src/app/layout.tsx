import type { Metadata } from 'next';
import { headers } from 'next/headers';
import './globals.css';
import { ToastContainer } from '@/components/ui/Toast';
import { HtmlLang } from '@/components/HtmlLang';
import { CommandPaletteProvider } from '@/components/CommandPalette';
import type { Locale } from '@/lib/types';

export const metadata: Metadata = {
  title: {
    default: 'Emoji Platform',
    template: '%s | Emoji Platform',
  },
  description: 'A global Emoji dictionary and search platform',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const path = headers().get('x-locale-path') ?? '';
  const lang: Locale = path.startsWith('/zh') ? 'zh' : 'en';

  return (
    <html lang={lang}>
      <body className="min-h-screen flex flex-col bg-bg text-text-primary">
        <HtmlLang />
        <CommandPaletteProvider locale={lang}>
          {children}
        </CommandPaletteProvider>
        <ToastContainer />
      </body>
    </html>
  );
}
