/**
 * Input Validation & Sanitization Utilities
 *
 * Zod schemas for API request validation
 * Sanitization helpers for user input
 */

import { z } from 'zod';

/**
 * Common validation schemas
 */
export const commonSchemas = {
  /** Email validation */
  email: z.string().email('Invalid email address').toLowerCase(),

  /** UUID validation */
  uuid: z.string().uuid('Invalid UUID'),

  /** Password validation (min 8 chars, at least 1 letter and 1 number) */
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[a-zA-Z]/, 'Password must contain at least one letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),

  /** URL validation */
  url: z.string().url('Invalid URL'),

  /** Positive integer */
  positiveInt: z.number().int().positive(),

  /** Non-negative integer */
  nonNegativeInt: z.number().int().nonnegative(),

  /** Pagination limit (1-100) */
  paginationLimit: z
    .number()
    .int()
    .min(1, 'Limit must be at least 1')
    .max(100, 'Limit cannot exceed 100')
    .default(50),

  /** Pagination page (min 1) */
  paginationPage: z.number().int().min(1, 'Page must be at least 1').default(1),

  /** ISO date string */
  isoDate: z.string().datetime({ message: 'Invalid ISO date string' }),

  /** User display name */
  displayName: z
    .string()
    .min(2, 'Display name must be at least 2 characters')
    .max(50, 'Display name cannot exceed 50 characters')
    .regex(/^[a-zA-Z0-9\s_-]+$/, 'Display name contains invalid characters'),

  /** Chat message content */
  chatMessage: z
    .string()
    .min(1, 'Message cannot be empty')
    .max(4000, 'Message cannot exceed 4000 characters'),
};

/**
 * API request schemas
 */
export const requestSchemas = {
  /** Chat request */
  chat: z.object({
    message: commonSchemas.chatMessage,
    chatHistory: z
      .array(
        z.object({
          role: z.enum(['user', 'assistant']),
          content: z.string(),
        })
      )
      .optional()
      .default([]),
  }),

  /** Sign up request */
  signUp: z.object({
    email: commonSchemas.email,
    password: commonSchemas.password,
    displayName: commonSchemas.displayName.optional(),
  }),

  /** Sign in request */
  signIn: z.object({
    email: commonSchemas.email,
    password: z.string().min(1, 'Password is required'),
  }),

  /** Update user profile */
  updateProfile: z.object({
    displayName: commonSchemas.displayName.optional(),
    email: commonSchemas.email.optional(),
  }),

  /** Pagination query params */
  pagination: z.object({
    page: commonSchemas.paginationPage,
    limit: commonSchemas.paginationLimit,
  }),

  /** Chat history query params */
  chatHistory: z.object({
    limit: commonSchemas.paginationLimit,
    before: commonSchemas.isoDate.optional(),
  }),
};

/**
 * Validate request body against schema
 */
export function validateRequest<T extends z.ZodTypeAny>(
  schema: T,
  data: unknown
): z.infer<T> {
  try {
    return schema.parse(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      // Format validation errors
      const formattedErrors = error.errors.map((err) => ({
        field: err.path.join('.'),
        message: err.message,
      }));

      throw new ValidationError('Validation failed', formattedErrors);
    }
    throw error;
  }
}

/**
 * Validate request body and return result with errors
 */
export function safeValidateRequest<T extends z.ZodTypeAny>(
  schema: T,
  data: unknown
): { success: true; data: z.infer<T> } | { success: false; errors: ValidationErrorDetail[] } {
  const result = schema.safeParse(data);

  if (result.success) {
    return { success: true, data: result.data };
  } else {
    const formattedErrors = result.error.errors.map((err) => ({
      field: err.path.join('.'),
      message: err.message,
    }));

    return { success: false, errors: formattedErrors };
  }
}

/**
 * Sanitization utilities
 */
export const sanitize = {
  /**
   * Remove HTML tags from string
   */
  html(input: string): string {
    return input.replace(/<[^>]*>/g, '');
  },

  /**
   * Escape HTML special characters
   */
  escapeHtml(input: string): string {
    const map: Record<string, string> = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#x27;',
      '/': '&#x2F;',
    };
    return input.replace(/[&<>"'/]/g, (char) => map[char]);
  },

  /**
   * Trim whitespace
   */
  trim(input: string): string {
    return input.trim();
  },

  /**
   * Remove extra whitespace
   */
  collapseWhitespace(input: string): string {
    return input.replace(/\s+/g, ' ').trim();
  },

  /**
   * Sanitize email (lowercase, trim)
   */
  email(input: string): string {
    return input.toLowerCase().trim();
  },

  /**
   * Sanitize user input for safe storage
   */
  userInput(input: string): string {
    return this.collapseWhitespace(this.html(input));
  },

  /**
   * Sanitize SQL input (basic - use parameterized queries instead!)
   */
  sql(input: string): string {
    // This is NOT a replacement for parameterized queries
    // Only use as an additional safety layer
    return input.replace(/['";\\]/g, '');
  },

  /**
   * Remove non-alphanumeric characters
   */
  alphanumeric(input: string): string {
    return input.replace(/[^a-zA-Z0-9]/g, '');
  },

  /**
   * Sanitize filename
   */
  filename(input: string): string {
    return input
      .replace(/[^a-zA-Z0-9._-]/g, '')
      .replace(/\.{2,}/g, '.')
      .substring(0, 255);
  },
};

/**
 * Custom validation error
 */
export class ValidationError extends Error {
  constructor(
    message: string,
    public errors: ValidationErrorDetail[]
  ) {
    super(message);
    this.name = 'ValidationError';
  }
}

export interface ValidationErrorDetail {
  field: string;
  message: string;
}

/**
 * Type guard for validation errors
 */
export function isValidationError(error: unknown): error is ValidationError {
  return error instanceof ValidationError;
}

/**
 * Parse and validate query parameters
 */
export function parseQueryParams<T extends z.ZodTypeAny>(
  schema: T,
  searchParams: URLSearchParams
): z.infer<T> {
  const data: Record<string, any> = {};

  searchParams.forEach((value, key) => {
    // Try to parse as number
    const num = Number(value);
    if (!isNaN(num)) {
      data[key] = num;
    } else if (value === 'true' || value === 'false') {
      // Parse as boolean
      data[key] = value === 'true';
    } else {
      // Keep as string
      data[key] = value;
    }
  });

  return validateRequest(schema, data);
}

/**
 * Validate file upload
 */
export interface FileValidationOptions {
  maxSize?: number; // in bytes
  allowedTypes?: string[]; // MIME types
  allowedExtensions?: string[];
}

export function validateFile(
  file: File,
  options: FileValidationOptions = {}
): { valid: true } | { valid: false; error: string } {
  const {
    maxSize = 10 * 1024 * 1024, // 10MB default
    allowedTypes = [],
    allowedExtensions = [],
  } = options;

  // Check file size
  if (file.size > maxSize) {
    const maxSizeMB = (maxSize / (1024 * 1024)).toFixed(2);
    return {
      valid: false,
      error: `File size exceeds ${maxSizeMB}MB limit`,
    };
  }

  // Check MIME type
  if (allowedTypes.length > 0 && !allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: `File type ${file.type} is not allowed`,
    };
  }

  // Check file extension
  if (allowedExtensions.length > 0) {
    const extension = file.name.split('.').pop()?.toLowerCase();
    if (!extension || !allowedExtensions.includes(extension)) {
      return {
        valid: false,
        error: `File extension .${extension} is not allowed`,
      };
    }
  }

  return { valid: true };
}

/**
 * Rate limit key generator
 */
export function getRateLimitKey(prefix: string, identifier: string): string {
  return `ratelimit:${prefix}:${identifier}`;
}

/**
 * Example usage:
 *
 * // Validate request body
 * const validated = validateRequest(requestSchemas.chat, await request.json());
 *
 * // Sanitize user input
 * const clean = sanitize.userInput(userInput);
 *
 * // Safe validation
 * const result = safeValidateRequest(requestSchemas.signUp, data);
 * if (!result.success) {
 *   return ApiErrors.unprocessableEntity('Validation failed', result.errors);
 * }
 */
