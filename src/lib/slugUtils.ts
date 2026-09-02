export function decodeSlugParam(value: string): string {
  let decoded = value.trim();
  if (!decoded) return '';

  for (let i = 0; i < 2; i += 1) {
    if (!decoded.includes('%')) break;
    try {
      const next = decodeURIComponent(decoded);
      if (next === decoded) break;
      decoded = next;
    } catch {
      break;
    }
  }

  return decoded.trim();
}

export function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9а-яіїєґ\-]/gi, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

/** Decode URL slug before API fetch or display. */
export function resolveProductSlugParam(slugOrId: string): string {
  return decodeSlugParam(slugOrId);
}

/** Prefer slug for links; fall back to id when slug is missing. */
export function getProductHref(slug: string | undefined, id: string): string {
  const resolved = decodeSlugParam(String(slug ?? ''));
  if (resolved && !/^\d+$/.test(resolved)) {
    return `/products/${resolved}`;
  }
  return `/products/${id}`;
}
