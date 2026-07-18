import type { Metadata } from 'next';
import { LicensePageView } from '@/components/LicensePageView';

export const metadata: Metadata = {
  title: 'License',
  description: 'Learn about Unicode licensing and usage terms for Emoji.',
};

export default function EnLicensePage() {
  return <LicensePageView locale="en" />;
}
