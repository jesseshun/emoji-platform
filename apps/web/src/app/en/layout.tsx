import type { Metadata } from 'next';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

export const metadata: Metadata = {
  title: {
    default: 'Emoji Platform - Discover Every Emoji',
    template: '%s | Emoji Platform',
  },
  description: 'Discover, search, and copy every Emoji you love. Supports Chinese and English.',
  alternates: {
    languages: {
      zh: `${siteUrl}/zh`,
      en: `${siteUrl}/en`,
      'x-default': `${siteUrl}/en`,
    },
  },
  openGraph: {
    title: 'Emoji Platform - Discover Every Emoji',
    description: 'Discover, search, and copy every Emoji you love',
    type: 'website',
    locale: 'en_US',
  },
};

export default function EnLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Header locale="en" />
      <main className="flex-1">{children}</main>
      <Footer locale="en" />
    </>
  );
}
