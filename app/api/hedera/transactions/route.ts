import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/config';
import { Database } from '@/lib/db';
import { getTransactionDetails } from '@/lib/hedera/client';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// GET endpoint for retrieving Hedera transactions
export async function GET(request: NextRequest) {
  try {
    // Get session
    const session = await auth();
    const userId = session?.user?.id;

    const { searchParams } = new URL(request.url);
    const transactionId = searchParams.get('transactionId');
    const limit = parseInt(searchParams.get('limit') || '100');

    // If specific transaction ID is requested
    if (transactionId) {
      const details = await getTransactionDetails(transactionId);
      return NextResponse.json({
        success: true,
        data: details,
      });
    }

    // Get user's transactions
    if (userId) {
      const transactions = await Database.getHederaTransactions(userId, limit);
      const summary = await Database.getTransactionSummary(userId);

      return NextResponse.json({
        success: true,
        data: {
          transactions: transactions.map((tx) => ({
            id: tx.id,
            transactionId: tx.transaction_id,
            consensusTimestamp: tx.consensus_timestamp,
            status: tx.status,
            cost: tx.cost,
            carbonImpact: tx.carbon_impact,
            apiCallType: tx.api_call_type,
            metadata: tx.metadata,
            createdAt: tx.created_at.toISOString(),
          })),
          summary,
        },
      });
    }

    return NextResponse.json(
      { error: 'User not authenticated' },
      { status: 401 }
    );
  } catch (error: any) {
    console.error('Hedera transactions API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch transactions', message: error.message },
      { status: 500 }
    );
  }
}
