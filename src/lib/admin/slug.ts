/**
 * Pure slug generation utilities.
 * No external dependencies, no Prisma calls.
 */

/**
 * Generate URL-friendly slug from title.
 * Lowercase, dash-separated, no special chars.
 */
export function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with dashes
    .replace(/-+/g, '-') // Replace multiple dashes with single dash
    .replace(/^-+|-+$/g, ''); // Trim dashes from start/end
}

/**
 * Generate unique slug with counter suffix if collision detected.
 * @param baseSlug - The base slug to make unique
 * @param counter - Current attempt number (starts from 2)
 * @returns Slug with counter suffix
 */
export function generateUniqueSlug(baseSlug: string, counter: number): string {
  return `${baseSlug}-${counter}`;
}

/**
 * Validate slug format.
 * Must be lowercase alphanumeric with dashes, no leading/trailing dashes.
 */
export function isValidSlug(slug: string): boolean {
  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug);
}
