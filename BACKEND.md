# 🚀 Aether AI - Backend Utilities Documentation

Complete guide to the production-ready backend utilities and infrastructure.

---

## 📚 Table of Contents

1. [Overview](#overview)
2. [Backend Utilities](#backend-utilities)
3. [API Endpoints](#api-endpoints)
4. [Usage Examples](#usage-examples)
5. [Best Practices](#best-practices)
6. [Testing](#testing)
7. [Monitoring](#monitoring)

---

## Overview

The backend infrastructure provides enterprise-grade utilities for building robust, scalable API routes:

### Core Utilities

| Utility | Location | Purpose |
|---------|----------|---------|
| **Environment Validation** | `lib/env.ts` | Type-safe environment variable validation |
| **API Responses** | `lib/api-response.ts` | Standardized response formats |
| **Logging** | `lib/logger.ts` | Structured logging with levels |
| **Validation** | `lib/validation.ts` | Input validation & sanitization |
| **Middleware** | `lib/middleware.ts` | Reusable API middleware |
| **Database** | `lib/db/index.ts` | Enhanced database utilities |

---

## Backend Utilities

### 1. Environment Validation (`lib/env.ts`)

**Purpose**: Validate and access environment variables with type safety.

**Features**:
- ✅ Zod-based schema validation
- ✅ Type-safe environment access
- ✅ Service availability checks
- ✅ Auto-validation in production

**Usage**:

```typescript
import { getEnv, envChecks, requireEnv } from '@/lib/env';

// Get all validated env vars
const env = getEnv();

// Check if services are configured
if (envChecks.hasAI()) {
  // AI service is available
}

// Require a specific variable (throws if missing)
const apiKey = requireEnv('GOOGLE_GENAI_API_KEY');

// Check environment
if (envChecks.isProduction()) {
  // Production-specific logic
}
```

**Service Checks**:
- `hasAI()` - Google Gemini AI configured
- `hasDatabase()` - Postgres configured
- `hasAuth()` - NextAuth configured
- `hasHedera()` - Hedera blockchain configured
- `hasBlob()` - Vercel Blob configured
- `isProduction()` - Running in production
- `isVercel()` - Running on Vercel
- `isStaticBuild()` - Static export mode

---

### 2. API Response Utilities (`lib/api-response.ts`)

**Purpose**: Standardized response formats for all API endpoints.

**Features**:
- ✅ Consistent response structure
- ✅ Predefined error responses
- ✅ CORS support
- ✅ Pagination helper
- ✅ Error handler wrapper

**Response Format**:

```typescript
// Success response
{
  success: true,
  data: { ... },
  meta: {
    timestamp: "2025-01-10T...",
    requestId: "req_...",
  }
}

// Error response
{
  success: false,
  error: {
    code: "BAD_REQUEST",
    message: "Validation failed",
    details: { ... }
  },
  meta: {
    timestamp: "2025-01-10T..."
  }
}
```

**Usage**:

```typescript
import { success, ApiErrors, withErrorHandler } from '@/lib/api-response';

// Return success
return success({ message: 'Hello' }, {
  status: 200,
  meta: { custom: 'value' }
});

// Return predefined errors
return ApiErrors.badRequest('Invalid input');
return ApiErrors.unauthorized('Authentication required');
return ApiErrors.notFound('Resource not found');
return ApiErrors.tooManyRequests('Rate limit exceeded', 900);
return ApiErrors.internalError('Something went wrong');

// Custom errors
return ApiErrors.databaseError('Database query failed');
return ApiErrors.aiServiceError('AI generation failed');
return ApiErrors.blockchainError('Hedera transaction failed');

// Wrap route with error handler
export const GET = withErrorHandler(async (request) => {
  // Your logic here
  // Errors are automatically caught and formatted
});

// Paginated response
return paginated(items, {
  page: 1,
  limit: 50,
  total: 150
});
```

**Available Error Methods**:
- `badRequest(message, details?)` - 400
- `unauthorized(message)` - 401
- `forbidden(message)` - 403
- `notFound(message)` - 404
- `methodNotAllowed(message)` - 405
- `conflict(message, details?)` - 409
- `unprocessableEntity(message, details?)` - 422
- `tooManyRequests(message, retryAfter?)` - 429
- `internalError(message, details?)` - 500
- `serviceUnavailable(message, retryAfter?)` - 503

---

### 3. Logging Utility (`lib/logger.ts`)

**Purpose**: Structured logging for backend operations.

**Features**:
- ✅ Multiple log levels (DEBUG, INFO, WARN, ERROR, FATAL)
- ✅ JSON format in production, human-readable in development
- ✅ Contextual logging
- ✅ Performance timing
- ✅ Specialized loggers (API, DB, AI, Blockchain)

**Usage**:

```typescript
import { logger, startTimer } from '@/lib/logger';

// Basic logging
logger.debug('Debug information', { userId: '123' });
logger.info('User logged in', { email: 'user@example.com' });
logger.warn('Rate limit approaching', { remaining: 5 });
logger.error('Database query failed', error, { query: 'SELECT...' });
logger.fatal('Critical system error', error);

// Specialized loggers
logger.apiRequest({
  method: 'POST',
  path: '/api/chat',
  userId: '123',
  ip: '127.0.0.1',
  userAgent: 'Mozilla/5.0...'
});

logger.apiResponse({
  method: 'POST',
  path: '/api/chat',
  status: 200,
  duration: 250,
  userId: '123'
});

logger.database('User query', { table: 'users', count: 1 });
logger.ai('Chat request', { model: 'gemini-2.0-flash', tokens: 150 });
logger.blockchain('Transaction submitted', { txId: '0.0.123' });

// Performance timing
const timer = startTimer('Database query');
// ... do work
timer.end({ rows: 10 });
// or
timer.endWithError(error);

// Child logger with persistent context
const userLogger = logger.child({ userId: '123', session: 'abc' });
userLogger.info('Action performed'); // Automatically includes userId and session
```

**Log Levels**:
- `DEBUG (0)` - Development only, detailed information
- `INFO (1)` - General information, default in production
- `WARN (2)` - Warning messages
- `ERROR (3)` - Error messages
- `FATAL (4)` - Critical errors

---

### 4. Validation & Sanitization (`lib/validation.ts`)

**Purpose**: Input validation and sanitization using Zod.

**Features**:
- ✅ Common validation schemas
- ✅ API request schemas
- ✅ Sanitization utilities
- ✅ File upload validation
- ✅ Query parameter parsing

**Common Schemas**:

```typescript
import { commonSchemas, requestSchemas, validateRequest, sanitize } from '@/lib/validation';

// Common validations
commonSchemas.email          // Email validation
commonSchemas.password       // Min 8 chars, 1 letter, 1 number
commonSchemas.uuid           // UUID validation
commonSchemas.url            // URL validation
commonSchemas.chatMessage    // 1-4000 chars
commonSchemas.displayName    // 2-50 chars, alphanumeric
commonSchemas.paginationLimit // 1-100, default 50
```

**Request Validation**:

```typescript
// Validate chat request
const validated = validateRequest(requestSchemas.chat, await request.json());
// validated.message: string
// validated.chatHistory?: Array<{role, content}>

// Safe validation (doesn't throw)
const result = safeValidateRequest(requestSchemas.signUp, data);
if (!result.success) {
  return ApiErrors.unprocessableEntity('Validation failed', result.errors);
}
// result.data has validated data

// Validate query parameters
const { searchParams } = new URL(request.url);
const params = parseQueryParams(requestSchemas.pagination, searchParams);
// params.page: number
// params.limit: number
```

**Sanitization**:

```typescript
// Remove HTML tags
const clean = sanitize.html('<script>alert("xss")</script>Hello');
// Result: 'Hello'

// Escape HTML
const escaped = sanitize.escapeHtml('<b>Bold</b>');
// Result: '&lt;b&gt;Bold&lt;/b&gt;'

// Clean user input (removes HTML + extra whitespace)
const cleaned = sanitize.userInput('  <script>Hello</script>  world  ');
// Result: 'Hello world'

// Email sanitization
const email = sanitize.email(' USER@EXAMPLE.COM ');
// Result: 'user@example.com'

// Filename sanitization
const filename = sanitize.filename('my file (1).txt');
// Result: 'myfile1.txt'

// Alphanumeric only
const clean = sanitize.alphanumeric('abc-123_xyz');
// Result: 'abc123xyz'
```

**File Validation**:

```typescript
import { validateFile } from '@/lib/validation';

const result = validateFile(file, {
  maxSize: 10 * 1024 * 1024, // 10MB
  allowedTypes: ['image/jpeg', 'image/png'],
  allowedExtensions: ['jpg', 'png']
});

if (!result.valid) {
  return ApiErrors.badRequest(result.error);
}
```

---

### 5. API Middleware (`lib/middleware.ts`)

**Purpose**: Reusable middleware for API routes.

**Features**:
- ✅ Authentication (required/optional)
- ✅ Rate limiting
- ✅ Logging
- ✅ Method validation
- ✅ CORS
- ✅ Error handling

**Quick Start**:

```typescript
import { createHandler } from '@/lib/middleware';
import { success } from '@/lib/api-response';

// Protected route with rate limiting
export const POST = createHandler({
  auth: 'required',              // Require authentication
  methods: ['POST'],             // Only allow POST
  rateLimit: {                   // Rate limiting
    maxRequests: 10,
    windowMs: 60000             // 10 requests per minute
  },
  handler: async (request, context) => {
    const userId = context.userId; // Available from auth middleware

    // Your logic here

    return success({ message: 'Success' });
  }
});

// Public route with optional auth
export const GET = createHandler({
  auth: 'optional',              // Optional authentication
  methods: ['GET'],
  cors: true,                    // Enable CORS
  handler: async (request, context) => {
    const userId = context.userId || 'anonymous';

    return success({ data: 'public data' });
  }
});
```

**Middleware Context**:

```typescript
interface MiddlewareContext {
  userId?: string;           // From auth middleware
  requestId?: string;        // Unique request ID
  startTime?: number;        // Request start time
  rateLimit?: {              // From rate limit middleware
    allowed: boolean;
    remaining: number;
  };
  corsHeaders?: Record<string, string>; // From CORS middleware
}
```

**Manual Middleware Composition**:

```typescript
import { compose, withAuth, withRateLimit, withLogging } from '@/lib/middleware';

export const POST = compose(
  withLogging,
  withAuth,
  withRateLimit({ maxRequests: 100, windowMs: 900000 }),
  async (request, context) => {
    // Handler
    return success({ data: 'Success' });
  }
);
```

**Available Middleware**:
- `withLogging` - Logs all API requests
- `withAuth` - Requires authentication
- `withOptionalAuth` - Sets userId if authenticated
- `withRateLimit(options)` - Rate limiting per user
- `withMethods(...methods)` - Validates HTTP method
- `withCORS(options)` - CORS headers
- `withErrorHandler(handler)` - Wraps handler with error handling

---

### 6. Enhanced Database Utilities (`lib/db/index.ts`)

**Purpose**: Database operations with error handling and logging.

**New Features**:
- ✅ Automatic error handling and logging
- ✅ Database health checks
- ✅ User statistics
- ✅ Message cleanup
- ✅ Connection testing

**New Methods**:

```typescript
import { Database } from '@/lib/db';

// Test database connection
const connected = await Database.testConnection();

// Get database health
const health = await Database.getHealth();
// {
//   connected: true,
//   responseTime: 45,
//   activeConnections: 3
// }

// Get user statistics
const stats = await Database.getUserStats(userId);
// {
//   totalMessages: 150,
//   totalTokensUsed: 50000,
//   totalCost: 0.025,
//   firstMessageAt: Date,
//   lastMessageAt: Date
// }

// Delete old messages (cleanup)
const deleted = await Database.deleteOldChatMessages(userId, 30); // Keep last 30 days
// Returns: number of deleted messages

// All existing methods now have automatic error handling:
const user = await Database.getUserById(userId);
const messages = await Database.getChatMessages(userId, 50);
// Errors are automatically logged and wrapped in DatabaseError
```

**Error Handling**:

```typescript
import { isDatabaseError } from '@/lib/db';

try {
  await Database.getUserById(userId);
} catch (error) {
  if (isDatabaseError(error)) {
    // Handle database error
    logger.error('DB error', error.originalError);
  }
}
```

---

## API Endpoints

### Health Check (`/api/health`)

Check system health and service availability.

**GET /api/health**

```bash
curl https://your-app.vercel.app/api/health
```

**Response** (200 or 503):

```json
{
  "status": "healthy",
  "timestamp": "2025-01-10T12:00:00.000Z",
  "uptime": 86400,
  "responseTime": "45ms",
  "services": {
    "database": true,
    "ai": true,
    "auth": true,
    "hedera": false,
    "blob": true
  },
  "database": {
    "connected": true,
    "responseTime": "12ms",
    "activeConnections": 3
  },
  "environment": {
    "nodeEnv": "production",
    "isProduction": true,
    "isVercel": true
  },
  "warnings": [
    "Service 'hedera' is not configured"
  ]
}
```

**HEAD /api/health** - Liveness probe (returns 200)

---

### Metrics (`/api/metrics`)

Get detailed metrics for authenticated user (protected).

**GET /api/metrics**

Requires: Authentication

```bash
curl https://your-app.vercel.app/api/metrics \
  -H "Authorization: Bearer <token>"
```

**Response** (200):

```json
{
  "success": true,
  "data": {
    "user": {
      "id": "user_123",
      "stats": {
        "totalMessages": 150,
        "totalTokensUsed": 50000,
        "totalCost": 0.025,
        "avgCostPerMessage": "0.000167",
        "avgTokensPerMessage": 333,
        "firstMessageAt": "2025-01-01T...",
        "lastMessageAt": "2025-01-10T..."
      }
    },
    "blockchain": {
      "totalTransactions": 45,
      "totalCost": 0.0045,
      "totalCarbonSaved": 12.5,
      "recentTransactions": [...]
    },
    "system": {
      "database": {
        "connected": true,
        "responseTime": 15
      },
      "uptime": 86400,
      "memoryUsage": {...}
    }
  }
}
```

---

### Enhanced Chat API (`/api/chat/v2`)

Improved chat API with all utilities.

**POST /api/chat/v2**

Send a chat message.

**Request**:

```json
{
  "message": "Hello, Aether!",
  "chatHistory": [
    { "role": "user", "content": "Previous message" },
    { "role": "assistant", "content": "Previous response" }
  ]
}
```

**Response** (200):

```json
{
  "success": true,
  "data": {
    "message": "Hello! I'm Aether...",
    "model": "gemini-2.0-flash-exp",
    "usage": {
      "tokensUsed": 150,
      "cost": 0.000028,
      "costFormatted": "$0.000028"
    },
    "blockchain": {
      "transactionId": "0.0.123@1234567890.123456789",
      "status": "SUCCESS",
      "carbonImpact": -0.5,
      "carbonImpactFormatted": "0.50g CO₂ saved"
    },
    "rateLimit": {
      "remaining": 95
    }
  },
  "meta": {
    "timestamp": "2025-01-10T...",
    "requestId": "req_..."
  }
}
```

**GET /api/chat/v2**

Get chat history (requires authentication).

**Query Parameters**:
- `limit` (optional) - Number of messages (1-100, default 50)
- `before` (optional) - ISO date string, get messages before this date

```bash
curl "https://your-app.vercel.app/api/chat/v2?limit=20" \
  -H "Authorization: Bearer <token>"
```

**DELETE /api/chat/v2**

Delete chat history (requires authentication).

**Query Parameters**:
- `days` (optional) - Keep messages from last N days (0 = delete all)

```bash
curl -X DELETE "https://your-app.vercel.app/api/chat/v2?days=30" \
  -H "Authorization: Bearer <token>"
```

---

## Usage Examples

### Example 1: Simple Protected API Route

```typescript
// app/api/example/route.ts
import { createHandler } from '@/lib/middleware';
import { success } from '@/lib/api-response';
import { Database } from '@/lib/db';

export const GET = createHandler({
  auth: 'required',
  methods: ['GET'],
  handler: async (request, context) => {
    const userId = context.userId!;

    // Get user data
    const user = await Database.getUserById(userId);

    return success({ user });
  }
});
```

### Example 2: Validated POST Request

```typescript
// app/api/submit/route.ts
import { createHandler } from '@/lib/middleware';
import { success, ApiErrors } from '@/lib/api-response';
import { validateRequest, requestSchemas } from '@/lib/validation';

export const POST = createHandler({
  auth: 'required',
  methods: ['POST'],
  rateLimit: { maxRequests: 10, windowMs: 60000 },
  handler: async (request, context) => {
    // Validate input
    const body = await request.json();
    const validated = validateRequest(requestSchemas.chat, body);

    // Process validated data
    // ...

    return success({ received: validated });
  }
});
```

### Example 3: Public API with CORS

```typescript
// app/api/public/route.ts
import { createHandler } from '@/lib/middleware';
import { success } from '@/lib/api-response';

export const GET = createHandler({
  auth: 'none',
  methods: ['GET'],
  cors: true,
  handler: async (request, context) => {
    return success({ message: 'Public data' });
  }
});
```

### Example 4: Custom Error Handling

```typescript
// app/api/custom/route.ts
import { createHandler } from '@/lib/middleware';
import { success, ApiErrors } from '@/lib/api-response';
import { logger } from '@/lib/logger';

export const POST = createHandler({
  auth: 'required',
  methods: ['POST'],
  handler: async (request, context) => {
    const timer = startTimer('Custom operation');

    try {
      // Your logic
      const result = await someOperation();

      timer.end({ success: true });
      return success(result);

    } catch (error) {
      timer.endWithError(error as Error);

      // Custom error handling
      if (error instanceof CustomError) {
        return ApiErrors.badRequest(error.message);
      }

      throw error; // Let middleware handle it
    }
  }
});
```

---

## Best Practices

### 1. Always Use Middleware

```typescript
// ❌ Bad - No authentication or rate limiting
export async function POST(request: NextRequest) {
  const body = await request.json();
  // ...
}

// ✅ Good - Uses middleware for auth, rate limiting, logging
export const POST = createHandler({
  auth: 'required',
  rateLimit: { maxRequests: 100, windowMs: 900000 },
  handler: async (request, context) => {
    // Authenticated user automatically available
    const userId = context.userId!;
  }
});
```

### 2. Validate All Input

```typescript
// ❌ Bad - No validation
const { message } = await request.json();

// ✅ Good - Validated and sanitized
const validated = validateRequest(requestSchemas.chat, await request.json());
const sanitized = sanitize.userInput(validated.message);
```

### 3. Use Standardized Responses

```typescript
// ❌ Bad - Inconsistent format
return NextResponse.json({ msg: 'Error', code: 400 }, { status: 400 });

// ✅ Good - Standardized format
return ApiErrors.badRequest('Invalid input', { field: 'email' });
```

### 4. Log Important Operations

```typescript
// ✅ Good - Log operations with context
logger.info('User registered', { userId, email });
logger.error('Payment failed', error, { userId, amount });
logger.ai('Chat completed', { model, tokens, cost });
```

### 5. Handle Errors Gracefully

```typescript
// ✅ Good - Graceful degradation
try {
  await trackOnBlockchain(data);
} catch (error) {
  logger.warn('Blockchain tracking failed (continuing)', { error });
  // Continue without blockchain - not critical
}
```

### 6. Check Service Availability

```typescript
import { envChecks } from '@/lib/env';

// ✅ Good - Check before using
if (!envChecks.hasAI()) {
  return ApiErrors.serviceUnavailable('AI service not configured');
}
```

---

## Testing

### Manual Testing

**Health Check**:
```bash
curl http://localhost:9002/api/health
```

**Protected Endpoint**:
```bash
curl http://localhost:9002/api/metrics \
  -H "Cookie: <session-cookie>"
```

**Chat API**:
```bash
curl -X POST http://localhost:9002/api/chat/v2 \
  -H "Content-Type: application/json" \
  -d '{"message": "Hello!"}'
```

### Environment Testing

```bash
# Set required env vars
export NEXTAUTH_SECRET="your-secret-here"
export NEXTAUTH_URL="http://localhost:9002"
export GOOGLE_GENAI_API_KEY="your-key-here"

# Run dev server
npm run dev

# Check health
curl http://localhost:9002/api/health
```

---

## Monitoring

### Health Checks

Monitor your deployment:

```bash
# Production health check
curl https://your-app.vercel.app/api/health

# Parse status
curl -s https://your-app.vercel.app/api/health | jq '.status'
```

### Vercel Integration

Vercel automatically monitors:
- Deployment health
- Function execution time
- Error rates
- Response times

View in: Vercel Dashboard → Your Project → Analytics

### Custom Monitoring

Use `/api/health` endpoint for:
- Load balancer health checks
- Uptime monitoring (e.g., UptimeRobot, Pingdom)
- CI/CD health validation
- Kubernetes liveness/readiness probes

---

## 🎯 Summary

You now have:

✅ **Environment validation** - Type-safe config
✅ **API responses** - Standardized formats
✅ **Logging** - Structured observability
✅ **Validation** - Input sanitization
✅ **Middleware** - Auth, rate limiting, CORS
✅ **Database** - Enhanced error handling
✅ **Health checks** - Monitoring endpoints
✅ **Enhanced chat** - Production-ready API

All backend utilities are production-ready and fully integrated! 🚀
