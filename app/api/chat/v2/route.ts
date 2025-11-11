/**
 * Enhanced Chat API (v2)
 *
 * Improved version with all backend utilities:
 * - Middleware for auth, rate limiting, logging
 * - Input validation with Zod
 * - Standardized API responses
 * - Better error handling
 */

import { NextRequest } from 'next/server';
import { geminiAI } from '@/lib/ai/gemini';
import { trackAPICall } from '@/lib/hedera/client';
import { Database } from '@/lib/db';
import { success, ApiErrors } from '@/lib/api-response';
import { createHandler } from '@/lib/middleware';
import { requestSchemas, validateRequest, sanitize } from '@/lib/validation';
import { logger } from '@/lib/logger';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Send a chat message
 */
export const POST = createHandler({
  auth: 'optional',
  methods: ['POST'],
  rateLimit: { maxRequests: 100, windowMs: 15 * 60 * 1000 }, // 100 requests per 15 minutes
  handler: async (request, context) => {
    const userId = context.userId || 'anonymous';

    // Validate request body
    const body = await request.json();
    const validated = validateRequest(requestSchemas.chat, body);

    // Sanitize user input
    const sanitizedMessage = sanitize.userInput(validated.message);

    // Log the request
    logger.ai('Chat request received', {
      userId,
      messageLength: sanitizedMessage.length,
      historyLength: validated.chatHistory?.length || 0,
    });

    // Generate AI response
    const aiResponse = await geminiAI.generateResponse(
      sanitizedMessage,
      validated.chatHistory || []
    );

    // Calculate costs
    const aiCost = geminiAI.calculateCost(aiResponse.tokensUsed);

    // Track API call on Hedera (optional)
    let hederaReceipt = null;
    try {
      hederaReceipt = await trackAPICall({
        userId,
        query: sanitizedMessage,
        model: aiResponse.model,
        tokensUsed: aiResponse.tokensUsed,
        cost: aiCost,
      });

      logger.blockchain('API call tracked on Hedera', {
        transactionId: hederaReceipt.transactionId,
        userId,
      });
    } catch (hederaError) {
      logger.warn('Hedera tracking failed (continuing without blockchain)', {
        error: (hederaError as Error).message,
        userId,
      });
    }

    // Save messages to database
    try {
      // Save user message
      await Database.saveChatMessage({
        user_id: userId,
        role: 'user',
        content: sanitizedMessage,
        model: aiResponse.model,
      });

      // Save AI response
      await Database.saveChatMessage({
        user_id: userId,
        role: 'assistant',
        content: aiResponse.response,
        model: aiResponse.model,
        tokens_used: aiResponse.tokensUsed,
        cost: aiCost,
        hedera_transaction_id: hederaReceipt?.transactionId,
      });

      // Increment API call count
      await Database.updateApiCallCount(userId, 1);

      // Save Hedera transaction if successful
      if (hederaReceipt) {
        await Database.saveHederaTransaction({
          user_id: userId,
          transaction_id: hederaReceipt.transactionId,
          consensus_timestamp: new Date(hederaReceipt.consensusTimestamp),
          status: hederaReceipt.status,
          cost: hederaReceipt.hederaCost,
          carbon_impact: hederaReceipt.carbonImpact,
          api_call_type: 'chat',
          metadata: {
            model: aiResponse.model,
            tokensUsed: aiResponse.tokensUsed,
            aiCost,
          },
        });
      }

      logger.database('Chat messages saved', { userId });
    } catch (dbError) {
      logger.error('Database save failed (continuing)', dbError as Error, {
        userId,
      });
      // Continue even if DB save fails - user still gets response
    }

    // Return successful response
    return success(
      {
        message: aiResponse.response,
        model: aiResponse.model,
        usage: {
          tokensUsed: aiResponse.tokensUsed,
          cost: aiCost,
          costFormatted: `$${aiCost.toFixed(6)}`,
        },
        ...(hederaReceipt && {
          blockchain: {
            transactionId: hederaReceipt.transactionId,
            consensusTimestamp: hederaReceipt.consensusTimestamp,
            status: hederaReceipt.status,
            carbonImpact: hederaReceipt.carbonImpact,
            carbonImpactFormatted: `${Math.abs(hederaReceipt.carbonImpact).toFixed(2)}g CO₂ saved`,
          },
        }),
        rateLimit: {
          remaining: context.rateLimit?.remaining || 0,
        },
      },
      {
        meta: {
          requestId: context.requestId,
        },
      }
    );
  },
});

/**
 * Get chat history
 */
export const GET = createHandler({
  auth: 'required',
  methods: ['GET'],
  handler: async (request, context) => {
    const userId = context.userId!;

    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '50');
    const before = searchParams.get('before');

    // Validate limit
    if (limit < 1 || limit > 100) {
      return ApiErrors.badRequest('Limit must be between 1 and 100');
    }

    // Get chat messages
    const messages = await Database.getChatMessages(userId, limit);

    // Filter by date if 'before' parameter provided
    let filteredMessages = messages;
    if (before) {
      const beforeDate = new Date(before);
      if (isNaN(beforeDate.getTime())) {
        return ApiErrors.badRequest('Invalid date format for "before" parameter');
      }
      filteredMessages = messages.filter(
        (msg) => msg.created_at < beforeDate
      );
    }

    // Get user stats
    const stats = await Database.getUserStats(userId);

    logger.database('Chat history retrieved', {
      userId,
      messageCount: filteredMessages.length,
    });

    return success({
      messages: filteredMessages.map((msg) => ({
        id: msg.id,
        role: msg.role,
        content: msg.content,
        model: msg.model,
        tokensUsed: msg.tokens_used,
        cost: msg.cost,
        hederaTransactionId: msg.hedera_transaction_id,
        createdAt: msg.created_at.toISOString(),
      })),
      stats: {
        totalMessages: stats.totalMessages,
        totalTokensUsed: stats.totalTokensUsed,
        totalCost: stats.totalCost,
        avgCostPerMessage:
          stats.totalMessages > 0
            ? (stats.totalCost / stats.totalMessages).toFixed(6)
            : '0.000000',
      },
      pagination: {
        limit,
        returned: filteredMessages.length,
        hasMore: messages.length === limit,
      },
    });
  },
});

/**
 * Delete chat history
 */
export const DELETE = createHandler({
  auth: 'required',
  methods: ['DELETE'],
  handler: async (request, context) => {
    const userId = context.userId!;

    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const daysToKeep = parseInt(searchParams.get('days') || '0');

    if (daysToKeep < 0) {
      return ApiErrors.badRequest('Days must be a non-negative number');
    }

    // Delete messages
    const deletedCount =
      daysToKeep > 0
        ? await Database.deleteOldChatMessages(userId, daysToKeep)
        : await Database.deleteOldChatMessages(userId, 0); // Delete all

    logger.info('Chat messages deleted', {
      userId,
      deletedCount,
      daysToKeep,
    });

    return success({
      deleted: deletedCount,
      message:
        daysToKeep > 0
          ? `Deleted ${deletedCount} messages older than ${daysToKeep} days`
          : `Deleted all ${deletedCount} messages`,
    });
  },
});
