'use client';

import { BrowseRouteError } from '@/components/BrowseRouteError';

export default function Error({ reset }: { reset: () => void }) {
  return <BrowseRouteError locale="en" reset={reset} />;
}
