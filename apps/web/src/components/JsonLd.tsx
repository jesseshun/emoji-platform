/**
 * Renders a JSON-LD script tag with the given data.
 * Use this for BreadcrumbList, FAQPage, etc.
 */
export function JsonLd({ data }: { data: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
