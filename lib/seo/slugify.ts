/**
 * Slugify utility functions for generating URL-friendly slugs
 * and validating SEO metadata
 */

import { z } from 'zod';

/**
 * Convert a title string to a URL-friendly slug
 * Example: "Hello World" → "hello-world"
 * @param title - The title string to convert
 * @returns URL-friendly slug
 */
export function slugify(title: string): string {
  return title
    .toLowerCase() // Convert to lowercase
    .trim() // Remove leading/trailing whitespace
    .replace(/[^\w\s-]/g, '') // Remove special characters except spaces and hyphens
    .replace(/[\s_-]+/g, '-') // Replace spaces, underscores, and multiple hyphens with single hyphen
    .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
}

/**
 * Generate a unique slug by appending a number if necessary
 * @param baseSlug - The base slug to make unique
 * @param existingSlugs - Array of existing slugs to check against
 * @returns Unique slug
 */
export function generateUniqueSlug(baseSlug: string, existingSlugs: string[]): string {
  let slug = baseSlug;
  let counter = 1;
  
  while (existingSlugs.includes(slug)) {
    slug = `${baseSlug}-${counter}`;
    counter++;
  }
  
  return slug;
}

/**
 * SEO metadata validation schemas
 */
export const seoValidationSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100, 'Title must be less than 100 characters'),
  metaTitle: z.string().max(60, 'Meta title must be less than 60 characters').optional(),
  metaDescription: z.string().max(160, 'Meta description must be less than 160 characters').optional(),
  slug: z.string().min(1, 'Slug is required').regex(/^[a-z0-9-]+$/, 'Slug must contain only lowercase letters, numbers, and hyphens'),
});

/**
 * Post creation/update validation schema
 */
export const postValidationSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100, 'Title must be less than 100 characters'),
  content: z.any(), // JSON content for blocks
  metaTitle: z.string().max(60, 'Meta title must be less than 60 characters').optional(),
  metaDescription: z.string().max(160, 'Meta description must be less than 160 characters').optional(),
  slug: z.string().optional(), // Will be auto-generated if not provided
  excerpt: z.string().max(300, 'Excerpt must be less than 300 characters').optional(),
  featuredImage: z.string().url('Invalid image URL').optional(),
  categoryId: z.string().optional(),
  isPublished: z.boolean().default(false),
  publishedAt: z.string().datetime().optional(),
});

/**
 * Validate SEO metadata
 * @param data - SEO metadata to validate
 * @returns Validation result
 */
export function validateSeoMetadata(data: unknown) {
  return seoValidationSchema.safeParse(data);
}

/**
 * Validate post data
 * @param data - Post data to validate
 * @returns Validation result
 */
export function validatePostData(data: unknown) {
  return postValidationSchema.safeParse(data);
}

/**
 * Generate meta title from title if not provided
 * @param title - Original title
 * @param metaTitle - Custom meta title (optional)
 * @returns Optimized meta title
 */
export function generateMetaTitle(title: string, metaTitle?: string): string {
  if (metaTitle) {
    return metaTitle.length <= 60 ? metaTitle : metaTitle.substring(0, 57) + '...';
  }
  
  return title.length <= 60 ? title : title.substring(0, 57) + '...';
}

/**
 * Generate meta description from content if not provided
 * @param content - Post content (blocks array)
 * @param metaDescription - Custom meta description (optional)
 * @returns Optimized meta description
 */
export function generateMetaDescription(content: Array<Record<string, unknown>>, metaDescription?: string): string {
  if (metaDescription) {
    return metaDescription.length <= 160 ? metaDescription : metaDescription.substring(0, 157) + '...';
  }
  
  // Extract text from first paragraph block
  const textBlock = content.find((block: Record<string, unknown>) => 
    block.type === 'paragraph' && 
    block.content && 
    typeof block.content === 'object' && 
    'text' in block.content
  );
  
  if (textBlock?.content && typeof textBlock.content === 'object' && 'text' in textBlock.content) {
    const text = (textBlock.content as { text: string }).text;
    return text.length <= 160 ? text : text.substring(0, 157) + '...';
  }
  
  return '';
}

/**
 * Validate and sanitize slug
 * @param slug - Slug to validate
 * @returns Sanitized slug
 */
export function sanitizeSlug(slug: string): string {
  return slugify(slug);
}
