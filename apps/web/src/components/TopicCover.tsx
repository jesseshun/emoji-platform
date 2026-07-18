'use client';

import { useState } from 'react';

interface TopicCoverProps {
  src: string | null;
  alt: string;
  imageClassName: string;
  fallbackClassName: string;
}

export function TopicCover({ src, alt, imageClassName, fallbackClassName }: TopicCoverProps) {
  const [failed, setFailed] = useState(false);

  if (!src || failed) {
    return (
      <div className={fallbackClassName} aria-hidden="true">
        <span className="text-4xl font-medium text-text-muted">#</span>
      </div>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      className={imageClassName}
      loading="lazy"
      onError={() => setFailed(true)}
    />
  );
}
