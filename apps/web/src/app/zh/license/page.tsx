import type { Metadata } from 'next';
import { LicensePageView } from '@/components/LicensePageView';

export const metadata: Metadata = {
  title: '授权说明',
  description: '了解 Emoji 的 Unicode 许可和使用条款。',
};

export default function ZhLicensePage() {
  return <LicensePageView locale="zh" />;
}
