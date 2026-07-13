import React from 'react';

interface HighlightProps {
  text: string | null | undefined;
  query: string;
  className?: string;
}

/**
 * Safely highlights occurrences of `query` inside `text`.
 *
 * Security: we never use `dangerouslySetInnerHTML`. The matched substrings are
 * rendered as React text nodes wrapped in a `<mark>` element, so there is no
 * XSS surface — arbitrary query text cannot inject markup. Regex special
 * characters in the query are escaped before building the split pattern.
 */
export function Highlight({ text, query, className }: HighlightProps) {
  if (!text) return null;
  const q = query.trim();
  if (!q) return <>{text}</>;

  const escaped = q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const segments = text.split(new RegExp(`(${escaped})`, 'ig'));

  return (
    <>
      {segments.map((segment, i) =>
        segment.toLowerCase() === q.toLowerCase() ? (
          <mark key={i} className="bg-yellow-200 text-gray-900 rounded px-0.5">
            {segment}
          </mark>
        ) : (
          <React.Fragment key={i}>{segment}</React.Fragment>
        ),
      )}
    </>
  );
}
