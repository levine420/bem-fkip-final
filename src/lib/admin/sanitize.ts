/**
 * Basic HTML sanitization for content body.
 * Strips dangerous tags and attributes to prevent XSS.
 * This is a simple implementation for MVP.
 * For production, consider using DOMPurify or similar library.
 */

const DANGEROUS_TAGS = [
  'script',
  'iframe',
  'object',
  'embed',
  'form',
  'input',
  'button',
  'select',
  'textarea',
  'style',
  'link',
  'meta',
  'base',
];

const SAFE_TAGS = [
  'p', 'br', 'strong', 'em', 'b', 'i', 'u',
  'ul', 'ol', 'li',
  'a',
  'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
  'blockquote', 'code', 'pre',
  'div', 'span',
  'img',
  'table', 'thead', 'tbody', 'tr', 'th', 'td',
];

const SAFE_ATTRIBUTES = [
  'href', 'src', 'alt', 'title',
  'class', 'id',
  'width', 'height',
  'target', 'rel',
];

/**
 * Sanitize HTML content by removing dangerous tags and attributes.
 * Basic regex-based approach for MVP.
 * 
 * @param html - Raw HTML content
 * @returns Sanitized HTML content
 */
export function sanitizeHtml(html: string): string {
  if (!html) return '';

  let sanitized = html;

  // Remove dangerous tags with content
  DANGEROUS_TAGS.forEach(tag => {
    const regex = new RegExp(`<${tag}[^>]*>.*?</${tag}>`, 'gis');
    sanitized = sanitized.replace(regex, '');
    // Also remove self-closing dangerous tags
    const selfClosing = new RegExp(`<${tag}[^>]*/>`, 'gi');
    sanitized = sanitized.replace(selfClosing, '');
  });

  // Remove event handler attributes (onclick, onerror, etc.)
  sanitized = sanitized.replace(/\son\w+\s*=\s*["'][^"']*["']/gi, '');
  sanitized = sanitized.replace(/\son\w+\s*=\s*[^\s>]*/gi, '');

  // Remove javascript: protocol from href/src
  sanitized = sanitized.replace(/href\s*=\s*["']javascript:[^"']*["']/gi, 'href="#"');
  sanitized = sanitized.replace(/src\s*=\s*["']javascript:[^"']*["']/gi, 'src=""');

  // Remove data: protocol (can be used for XSS)
  sanitized = sanitized.replace(/href\s*=\s*["']data:[^"']*["']/gi, 'href="#"');
  sanitized = sanitized.replace(/src\s*=\s*["']data:[^"']*["']/gi, 'src=""');

  return sanitized.trim();
}

/**
 * Validate that HTML only contains safe tags.
 * This is a basic check, not exhaustive.
 */
export function containsOnlySafeTags(html: string): boolean {
  const tagRegex = /<(\w+)[^>]*>/g;
  const matches = html.matchAll(tagRegex);
  
  for (const match of matches) {
    const tag = match[1].toLowerCase();
    if (!SAFE_TAGS.includes(tag)) {
      return false;
    }
  }
  
  return true;
}

/**
 * Strip all HTML tags, leaving only text content.
 * Useful for generating plain text excerpts.
 */
export function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, '').trim();
}

/**
 * Calculate approximate reading time in minutes.
 * Assumes average reading speed of 200 words per minute.
 */
export function calculateReadingTime(text: string): number {
  const words = text.trim().split(/\s+/).length;
  const minutes = Math.ceil(words / 200);
  return minutes;
}
