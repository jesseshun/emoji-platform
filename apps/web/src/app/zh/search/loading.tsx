import { SearchResultsSkeleton } from '@/components/BrowseSkeletons';

export default function Loading() {
  return <div className="mx-auto max-w-content px-4 py-12 sm:px-6"><SearchResultsSkeleton locale="zh" /></div>;
}
