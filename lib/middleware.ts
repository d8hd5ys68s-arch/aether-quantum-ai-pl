/**
 * API Middleware Utilities
 *
 * Reusable middleware for API routes
 * Authentication, logging, rate limiting, etc.
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from './auth/config';
import { logger, startTimer } from './logger';
import { ApiErrors } from './api-response';
import { Database } from './db';

/**
 * Middleware function type
 */
export type Middleware = (
  request: NextRequest,
  context: MiddlewareContext
) => Promise<NextResponse | void>;

/**
 * Middleware context (shared between middleware)
 */
export interface MiddlewareContext {
  userId?: string;
  startTime?: number;
  requestId?: string;
  [key: string]: any;
}

/**
 * Compose multiple middleware functions
 */
export function compose(...middleware: Middleware[]) {
  return async (request: NextRequest): Promise<NextResponse> => {
    const context: MiddlewareContext = {
      requestId: generateRequestId(),
      startTime: Date.now(),
    };

    for (const mw of middleware) {
      const result = await mw(request, context);
      if (result instanceof NextResponse) {
        // Middleware returned a response, stop here
        return result;
      }
    }

    // All middleware passed, but no handler provided
    return ApiErrors.notImplemented('Route handler not implemented');
  };
}

/**
 * Logging middleware
 */
export const withLogging: Middleware = async (request, context) => {
  const { method, url } = request;
  const { pathname } = new URL(url);

  logger.apiRequest({
    method,
    path: pathname,
    userId: context.userId,
    ip: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
    userAgent: request.headers.get('user-agent') || 'unknown',
  });

  // Continue to next middleware
  return undefined;
};

/**
 * Authentication middleware (requires valid session)
 */
export const withAuth: Middleware = async (request, context) => {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      logger.warn('Unauthorized access attempt', {
        path: new URL(request.url).pathname,
        ip: request.headers.get('x-forwarded-for') || 'unknown',
      });
      return ApiErrors.unauthorized('Authentication required');
    }

    // Add userId to context
    context.userId = session.user.id;

    return undefined;
  } catch (error) {
    logger.error('Authentication error', error as Error);
    return ApiErrors.unauthorized('Authentication failed');
  }
};

/**
 * Optional authentication middleware (sets userId if authenticated)
 */
export const withOptionalAuth: Middleware = async (request, context) => {
  try {
    const session = await auth();
    if (session?.user?.id) {
      context.userId = session.user.id;
    } else {
      context.userId = 'anonymous';
    }
    return undefined;
  } catch (error) {
    logger.error('Optional auth error', error as Error);
    context.userId = 'anonymous';
    return undefined;
  }
};

/**
 * Rate limiting middleware
 */
export function withRateLimit(options?: {
  maxRequests?: number;
  windowMs?: number;
}): Middleware {
  const maxRequests = options?.maxRequests || 100;
  const windowMs = options?.windowMs || 15 * 60 * 1000; // 15 minutes

  return async (request, context) => {
    const userId = context.userId || 'anonymous';

    try {
      const rateLimit = await Database.checkRateLimit(userId, maxRequests, windowMs);

      if (!rateLimit.allowed) {
        logger.warn('Rate limit exceeded', {
          userId,
          path: new URL(request.url).pathname,
        });

        return ApiErrors.tooManyRequests(
          'Too many requests. Please try again later.',
          Math.ceil(windowMs / 1000)
        );
      }

      // Add rate limit info to context
      context.rateLimit = rateLimit;

      return undefined;
    } catch (error) {
      logger.error('Rate limit check failed', error as Error);
      // Allow request to continue if rate limit check fails
      return undefined;
    }
  };
}

/**
 * Method validation middleware
 */
export function withMethods(...allowedMethods: string[]): Middleware {
  return async (request, context) => {
    if (!allowedMethods.includes(request.method)) {
      return ApiErrors.methodNotAllowed(
        `Method ${request.method} not allowed. Allowed methods: ${allowedMethods.join(', ')}`
      );
    }
    return undefined;
  };
}

/**
 * CORS middleware
 */
export function withCORS(options?: {
  origin?: string;
  methods?: string[];
  headers?: string[];
}): Middleware {
  const origin = options?.origin || '*';
  const methods = options?.methods || ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'];
  const headers = options?.headers || ['Content-Type', 'Authorization'];

  return async (request, context) => {
    // Handle OPTIONS request
    if (request.method === 'OPTIONS') {
      return new NextResponse(null, {
        status: 204,
        headers: {
          'Access-Control-Allow-Origin': origin,
          'Access-Control-Allow-Methods': methods.join(', '),
          'Access-Control-Allow-Headers': headers.join(', '),
          'Access-Control-Max-Age': '86400',
        },
      });
    }

    // Store CORS headers in context for response
    context.corsHeaders = {
      'Access-Control-Allow-Origin': origin,
      'Access-Control-Allow-Methods': methods.join(', '),
      'Access-Control-Allow-Headers': headers.join(', '),
    };

    return undefined;
  };
}

/**
 * Error handling wrapper for API routes
 */
export function withErrorHandler<T extends any[]>(
  handler: (request: NextRequest, ...args: T) => Promise<NextResponse>
) {
  return async (request: NextRequest, ...args: T): Promise<NextResponse> => {
    const timer = startTimer(`${request.method} ${new URL(request.url).pathname}`);

    try {
      const response = await handler(request, ...args);
      timer.end({ status: response.status });
      return response;
    } catch (error: any) {
      timer.endWithError(error);

      logger.error('API route error', error, {
        method: request.method,
        path: new URL(request.url).pathname,
        message: error.message,
      });

      // Handle specific error types
      if (error.name === 'ZodError') {
        return ApiErrors.unprocessableEntity('Validation failed', {
          errors: error.errors,
        });
      }

      if (error.message?.includes('rate limit')) {
        return ApiErrors.tooManyRequests(error.message);
      }

      if (error.message?.includes('unauthorized') || error.message?.includes('authentication')) {
        return ApiErrors.unauthorized(error.message);
      }

      if (error.message?.includes('not found')) {
        return ApiErrors.notFound(error.message);
      }

      if (error.message?.includes('database')) {
        return ApiErrors.databaseError(error.message);
      }

      if (error.message?.includes('AI') || error.message?.includes('Gemini')) {
        return ApiErrors.aiServiceError(error.message);
      }

      // Generic error
      return ApiErrors.internalError(
        process.env.NODE_ENV === 'development' ? error.message : 'An error occurred',
        process.env.NODE_ENV === 'development' ? { stack: error.stack } : undefined
      );
    }
  };
}

/**
 * Create API route handler with middleware
 */
export function createHandler(options: {
  auth?: 'required' | 'optional' | 'none';
  rateLimit?: { maxRequests?: number; windowMs?: number };
  methods?: string[];
  cors?: boolean;
  handler: (request: NextRequest, context: MiddlewareContext) => Promise<NextResponse>;
}) {
  const middleware: Middleware[] = [withLogging];

  // Add CORS
  if (options.cors) {
    middleware.push(withCORS());
  }

  // Add method validation
  if (options.methods) {
    middleware.push(withMethods(...options.methods));
  }

  // Add authentication
  if (options.auth === 'required') {
    middleware.push(withAuth);
  } else if (options.auth === 'optional') {
    middleware.push(withOptionalAuth);
  }

  // Add rate limiting
  if (options.rateLimit) {
    middleware.push(withRateLimit(options.rateLimit));
  }

  // Add handler as final middleware
  middleware.push(async (request, context) => {
    return await options.handler(request, context);
  });

  return withErrorHandler(compose(...middleware));
}

/**
 * Generate unique request ID
 */
function generateRequestId(): string {
  return `req_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
}

/**
 * Example usage:
 *
 * // Simple protected route with rate limiting
 * export const POST = createHandler({
 *   auth: 'required',
 *   methods: ['POST'],
 *   rateLimit: { maxRequests: 10, windowMs: 60000 },
 *   handler: async (request, context) => {
 *     const userId = context.userId; // Available from auth middleware
 *     // ... your logic
 *     return success({ message: 'Success' });
 *   },
 * });
 *
 * // Public route with CORS
 * export const GET = createHandler({
 *   auth: 'none',
 *   methods: ['GET'],
 *   cors: true,
 *   handler: async (request, context) => {
 *     return success({ data: 'public data' });
 *   },
 * });
 */
