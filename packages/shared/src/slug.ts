/**
 * Generate a URL-friendly slug from an English name.
 *
 * Rules:
 * 1. Convert to lowercase
 * 2. Remove special characters
 * 3. Replace spaces with hyphens
 * 4. Collapse multiple hyphens into one
 * 5. Trim leading/trailing hyphens
 * 6. If empty, use codepoint as fallback
 */
export function generateSlug(name: string, codepoint?: string): string {
  let slug = name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '');

  if (!slug && codepoint) {
    slug = codepoint.toLowerCase().replace(/[^a-z0-9]/g, '');
  }

  if (!slug) {
    slug = 'unknown';
  }

  return slug;
}

/**
 * Ensure a slug is unique among existing slugs by appending -2, -3, etc.
 */
export function uniqueSlug(slug: string, existingSlugs: Set<string>): string {
  if (!existingSlugs.has(slug)) {
    existingSlugs.add(slug);
    return slug;
  }

  let counter = 2;
  let candidate = `${slug}-${counter}`;
  while (existingSlugs.has(candidate)) {
    counter++;
    candidate = `${slug}-${counter}`;
  }

  existingSlugs.add(candidate);
  return candidate;
}
