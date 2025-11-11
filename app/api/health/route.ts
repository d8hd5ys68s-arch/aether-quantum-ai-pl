/**
 * Health Check Endpoint
 *
 * Provides system health status and service availability
 * Used for monitoring, load balancer health checks, etc.
 */

import { NextRequest, NextResponse } from 'next/server';
import { Database } from '@/lib/db';
import { envChecks } from '@/lib/env';
import { success, ApiErrors } from '@/lib/api-response';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const startTime = Date.now();

  try {
    // Check database health
    const dbHealth = await Database.getHealth();

    // Check service configurations
    const services = {
      database: dbHealth.connected,
      ai: envChecks.hasAI(),
      auth: envChecks.hasAuth(),
      hedera: envChecks.hasHedera(),
      blob: envChecks.hasBlob(),
    };

    // Overall health status
    const isHealthy = services.database; // Database is critical
    const allServicesHealthy = Object.values(services).every((s) => s === true);

    const responseTime = Date.now() - startTime;

    // Return appropriate status code
    const statusCode = isHealthy ? 200 : 503;

    return NextResponse.json(
      {
        status: isHealthy ? 'healthy' : 'unhealthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        responseTime: `${responseTime}ms`,
        services,
        database: {
          connected: dbHealth.connected,
          responseTime: `${dbHealth.responseTime}ms`,
          ...(dbHealth.activeConnections && {
            activeConnections: dbHealth.activeConnections,
          }),
        },
        environment: {
          nodeEnv: process.env.NODE_ENV,
          isProduction: envChecks.isProduction(),
          isVercel: envChecks.isVercel(),
          isStaticBuild: envChecks.isStaticBuild(),
        },
        warnings: !allServicesHealthy
          ? Object.entries(services)
              .filter(([, healthy]) => !healthy)
              .map(([service]) => `Service '${service}' is not configured`)
          : [],
      },
      { status: statusCode }
    );
  } catch (error: any) {
    // Health check failed
    return NextResponse.json(
      {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        error: error.message,
        responseTime: `${Date.now() - startTime}ms`,
      },
      { status: 503 }
    );
  }
}

/**
 * Simple liveness probe (for container orchestration)
 */
export async function HEAD(request: NextRequest) {
  return new NextResponse(null, { status: 200 });
}
