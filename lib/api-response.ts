/**
 * API Response Utilities
 *
 * Standardized response formats for all API endpoints
 * Consistent error handling and success responses
 */

import { NextResponse } from 'next/server';

// Standard API response types
export interface ApiSuccessResponse<T = any> {
  success: true;
  data: T;
  meta?: {
    timestamp: string;
    requestId?: string;
    [key: string]: any;
  };
}

export interface ApiErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: any;
    stack?: string;
  };
  meta?: {
    timestamp: string;
    requestId?: string;
  };
}

export type ApiResponse<T = any> = ApiSuccessResponse<T> | ApiErrorResponse;

/**
 * Create a successful API response
 */
export function success<T>(
  data: T,
  options?: {
    status?: number;
    headers?: Record<string, string>;
    meta?: Record<string, any>;
  }
): NextResponse<ApiSuccessResponse<T>> {
  const { status = 200, headers = {}, meta = {} } = options || {};

  return NextResponse.json(
    {
      success: true,
      data,
      meta: {
        timestamp: new Date().toISOString(),
        ...meta,
      },
    },
    {
      status,
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
    }
  );
}

/**
 * Create an error API response
 */
export function error(
  message: string,
  options?: {
    code?: string;
    status?: number;
    details?: any;
    headers?: Record<string, string>;
    includeStack?: boolean;
  }
): NextResponse<ApiErrorResponse> {
  const {
    code = 'INTERNAL_ERROR',
    status = 500,
    details,
    headers = {},
    includeStack = false,
  } = options || {};

  const errorResponse: ApiErrorResponse = {
    success: false,
    error: {
      code,
      message,
      ...(details && { details }),
      ...(includeStack && { stack: new Error().stack }),
    },
    meta: {
      timestamp: new Date().toISOString(),
    },
  };

  return NextResponse.json(errorResponse, {
    status,
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
  });
}

/**
 * Predefined error responses for common scenarios
 */
export const ApiErrors = {
  // Client errors (4xx)
  badRequest: (message: string = 'Bad request', details?: any) =>
    error(message, { code: 'BAD_REQUEST', status: 400, details }),

  unauthorized: (message: string = 'Unauthorized') =>
    error(message, { code: 'UNAUTHORIZED', status: 401 }),

  forbidden: (message: string = 'Forbidden') =>
    error(message, { code: 'FORBIDDEN', status: 403 }),

  notFound: (message: string = 'Resource not found') =>
    error(message, { code: 'NOT_FOUND', status: 404 }),

  methodNotAllowed: (message: string = 'Method not allowed') =>
    error(message, { code: 'METHOD_NOT_ALLOWED', status: 405 }),

  conflict: (message: string = 'Conflict', details?: any) =>
    error(message, { code: 'CONFLICT', status: 409, details }),

  unprocessableEntity: (message: string = 'Validation failed', details?: any) =>
    error(message, { code: 'VALIDATION_ERROR', status: 422, details }),

  tooManyRequests: (
    message: string = 'Too many requests',
    retryAfter?: number
  ) =>
    error(message, {
      code: 'RATE_LIMIT_EXCEEDED',
      status: 429,
      details: { retryAfter },
      headers: retryAfter ? { 'Retry-After': retryAfter.toString() } : {},
    }),

  // Server errors (5xx)
  internalError: (message: string = 'Internal server error', details?: any) =>
    error(message, { code: 'INTERNAL_ERROR', status: 500, details }),

  notImplemented: (message: string = 'Not implemented') =>
    error(message, { code: 'NOT_IMPLEMENTED', status: 501 }),

  serviceUnavailable: (
    message: string = 'Service temporarily unavailable',
    retryAfter?: number
  ) =>
    error(message, {
      code: 'SERVICE_UNAVAILABLE',
      status: 503,
      details: { retryAfter },
      headers: retryAfter ? { 'Retry-After': retryAfter.toString() } : {},
    }),

  gatewayTimeout: (message: string = 'Gateway timeout') =>
    error(message, { code: 'GATEWAY_TIMEOUT', status: 504 }),

  // Custom application errors
  databaseError: (message: string = 'Database operation failed') =>
    error(message, { code: 'DATABASE_ERROR', status: 500 }),

  aiServiceError: (message: string = 'AI service error') =>
    error(message, { code: 'AI_SERVICE_ERROR', status: 500 }),

  blockchainError: (message: string = 'Blockchain operation failed') =>
    error(message, { code: 'BLOCKCHAIN_ERROR', status: 500 }),

  configurationError: (message: string = 'Service configuration error') =>
    error(message, { code: 'CONFIGURATION_ERROR', status: 500 }),
};

/**
 * Paginated response helper
 */
export function paginated<T>(
  data: T[],
  options: {
    page: number;
    limit: number;
    total: number;
    meta?: Record<string, any>;
  }
) {
  const { page, limit, total, meta = {} } = options;
  const totalPages = Math.ceil(total / limit);
  const hasNextPage = page < totalPages;
  const hasPrevPage = page > 1;

  return success(data, {
    meta: {
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNextPage,
        hasPrevPage,
      },
      ...meta,
    },
  });
}

/**
 * Handle async API route with automatic error handling
 */
export function withErrorHandler<T extends any[], R>(
  handler: (...args: T) => Promise<NextResponse<R>>
) {
  return async (...args: T): Promise<NextResponse> => {
    try {
      return await handler(...args);
    } catch (err: any) {
      console.error('API route error:', err);

      // Handle specific error types
      if (err.name === 'ZodError') {
        return ApiErrors.unprocessableEntity('Validation failed', {
          errors: err.errors,
        });
      }

      if (err.message?.includes('rate limit')) {
        return ApiErrors.tooManyRequests(err.message);
      }

      if (err.message?.includes('unauthorized') || err.message?.includes('authentication')) {
        return ApiErrors.unauthorized(err.message);
      }

      if (err.message?.includes('not found')) {
        return ApiErrors.notFound(err.message);
      }

      // Generic error
      return ApiErrors.internalError(
        process.env.NODE_ENV === 'development' ? err.message : 'An error occurred',
        process.env.NODE_ENV === 'development' ? { stack: err.stack } : undefined
      );
    }
  };
}

/**
 * CORS headers for API routes
 */
export function corsHeaders(origin?: string): Record<string, string> {
  return {
    'Access-Control-Allow-Origin': origin || '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Max-Age': '86400',
  };
}

/**
 * Handle OPTIONS request for CORS
 */
export function handleOptions(origin?: string): NextResponse {
  return new NextResponse(null, {
    status: 204,
    headers: corsHeaders(origin),
  });
}
