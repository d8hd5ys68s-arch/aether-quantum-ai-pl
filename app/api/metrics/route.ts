/**
 * Metrics & Monitoring Endpoint
 *
 * Provides detailed metrics for monitoring and observability
 * Protected endpoint - requires authentication
 */

import { NextRequest } from 'next/server';
import { Database } from '@/lib/db';
import { success } from '@/lib/api-response';
import { createHandler } from '@/lib/middleware';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export const GET = createHandler({
  auth: 'required',
  methods: ['GET'],
  handler: async (request, context) => {
    const userId = context.userId!;

    // Get user statistics
    const userStats = await Database.getUserStats(userId);

    // Get recent transactions
    const recentTransactions = await Database.getHederaTransactions(userId, 10);

    // Get transaction summary
    const transactionSummary = await Database.getTransactionSummary(userId);

    // Get database health
    const dbHealth = await Database.getHealth();

    // Calculate average cost per message
    const avgCostPerMessage =
      userStats.totalMessages > 0
        ? userStats.totalCost / userStats.totalMessages
        : 0;

    // Calculate average tokens per message
    const avgTokensPerMessage =
      userStats.totalMessages > 0
        ? userStats.totalTokensUsed / userStats.totalMessages
        : 0;

    return success({
      user: {
        id: userId,
        stats: {
          totalMessages: userStats.totalMessages,
          totalTokensUsed: userStats.totalTokensUsed,
          totalCost: userStats.totalCost,
          avgCostPerMessage: avgCostPerMessage.toFixed(6),
          avgTokensPerMessage: Math.round(avgTokensPerMessage),
          firstMessageAt: userStats.firstMessageAt?.toISOString() || null,
          lastMessageAt: userStats.lastMessageAt?.toISOString() || null,
        },
      },
      blockchain: {
        totalTransactions: transactionSummary.totalTransactions,
        totalCost: transactionSummary.totalCost,
        totalCarbonSaved: transactionSummary.totalCarbonSaved,
        recentTransactions: recentTransactions.map((tx) => ({
          id: tx.transaction_id,
          timestamp: tx.consensus_timestamp.toISOString(),
          status: tx.status,
          cost: tx.cost,
          carbonImpact: tx.carbon_impact,
          apiCallType: tx.api_call_type,
        })),
      },
      system: {
        database: {
          connected: dbHealth.connected,
          responseTime: dbHealth.responseTime,
          activeConnections: dbHealth.activeConnections,
        },
        uptime: process.uptime(),
        memoryUsage: process.memoryUsage(),
        nodeVersion: process.version,
      },
    });
  },
});
