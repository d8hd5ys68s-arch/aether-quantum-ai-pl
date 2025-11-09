import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authConfig } from '@/lib/auth/config';
import { geminiAI } from '@/lib/ai/gemini';
import { trackAPICall } from '@/lib/hedera/client';
import { Database } from '@/lib/db';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

interface ChatRequest {
  message: string;
  userId?: string;
  chatHistory?: { role: 'user' | 'assistant'; content: string }[];
}

export async function POST(request: NextRequest) {
  try {
    // Get session
    const session = await getServerSession(authConfig);
    const userId = session?.user?.id || 'anonymous';

    const body: ChatRequest = await request.json();
    const { message, chatHistory = [] } = body;

    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { error: 'Message is required and must be a string' },
        { status: 400 }
      );
    }

    // Check rate limit
    const rateLimit = await Database.checkRateLimit(userId);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        {
          error: 'Rate limit exceeded',
          message: 'Too many requests. Please try again later.',
          retryAfter: 900, // 15 minutes in seconds
        },
        { status: 429 }
      );
    }

    // Generate AI response
    const aiResponse = await geminiAI.generateResponse(message, chatHistory);

    // Calculate costs
    const aiCost = geminiAI.calculateCost(aiResponse.tokensUsed);

    // Track API call on Hedera (optional - can be disabled if topic not configured)
    let hederaReceipt;
    try {
      hederaReceipt = await trackAPICall({
        userId,
        query: message,
        model: aiResponse.model,
        tokensUsed: aiResponse.tokensUsed,
        cost: aiCost,
      });
    } catch (hederaError) {
      console.warn('Hedera tracking failed:', hederaError);
      // Continue without Hedera tracking if it fails
      hederaReceipt = null;
    }

    // Save messages to database
    try {
      // Save user message
      await Database.saveChatMessage({
        user_id: userId,
        role: 'user',
        content: message,
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

      // Increment API call count for rate limiting
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
    } catch (dbError) {
      console.error('Database save failed:', dbError);
      // Continue even if DB save fails
    }

    // Return response
    return NextResponse.json({
      success: true,
      data: {
        response: aiResponse.response,
        model: aiResponse.model,
        tokensUsed: aiResponse.tokensUsed,
        cost: aiCost,
        hedera: hederaReceipt
          ? {
              transactionId: hederaReceipt.transactionId,
              consensusTimestamp: hederaReceipt.consensusTimestamp,
              status: hederaReceipt.status,
              cost: hederaReceipt.hederaCost,
              carbonImpact: hederaReceipt.carbonImpact,
            }
          : null,
        rateLimit: {
          remaining: rateLimit.remaining - 1,
        },
      },
    });
  } catch (error: any) {
    console.error('Chat API error:', error);

    // Handle specific error types
    if (error.message?.includes('API key')) {
      return NextResponse.json(
        { error: 'AI service configuration error' },
        { status: 500 }
      );
    }

    if (error.message?.includes('quota')) {
      return NextResponse.json(
        { error: 'Service temporarily unavailable due to quota limits' },
        { status: 503 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error', message: error.message },
      { status: 500 }
    );
  }
}

// GET endpoint for retrieving chat history
export async function GET(request: NextRequest) {
  try {
    // Get session
    const session = await getServerSession(authConfig);
    const userId = session?.user?.id || 'anonymous';

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '50');

    // Get chat messages from database
    const messages = await Database.getChatMessages(userId, limit);

    return NextResponse.json({
      success: true,
      data: {
        messages: messages.map((msg) => ({
          id: msg.id,
          role: msg.role,
          content: msg.content,
          model: msg.model,
          tokensUsed: msg.tokens_used,
          cost: msg.cost,
          hederaTransactionId: msg.hedera_transaction_id,
          createdAt: msg.created_at.toISOString(),
        })),
      },
    });
  } catch (error: any) {
    console.error('Chat history API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch chat history', message: error.message },
      { status: 500 }
    );
  }
}
