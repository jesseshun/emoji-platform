import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Emoji Platform - English',
  description: 'Global Emoji Dictionary and Search Platform',
};

export default function EnLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
