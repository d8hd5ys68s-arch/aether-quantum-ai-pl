import { NextResponse } from 'next/server';
import { createTopic } from '@/lib/hedera/client';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * POST endpoint for creating a Hedera topic
 * This should be called once during initial setup
 */
export async function POST() {
  try {
    // Check if already configured
    if (process.env.HEDERA_TOPIC_ID) {
      return NextResponse.json({
        success: true,
        message: 'Topic already configured',
        topicId: process.env.HEDERA_TOPIC_ID,
      });
    }

    // Create a new topic for API call tracking
    const topicId = await createTopic('Aether AI - API Call Tracking');

    return NextResponse.json({
      success: true,
      message: 'Topic created successfully',
      topicId,
      instructions: `Please add the following to your .env file:\nHEDERA_TOPIC_ID=${topicId}`,
    });
  } catch (error: any) {
    console.error('Hedera setup error:', error);
    return NextResponse.json(
      {
        error: 'Failed to create topic',
        message: error.message,
        instructions: 'Please ensure HEDERA_ACCOUNT_ID and HEDERA_PRIVATE_KEY are configured correctly',
      },
      { status: 500 }
    );
  }
}

/**
 * GET endpoint for checking Hedera configuration status
 */
export async function GET() {
  const configured = {
    accountId: !!process.env.HEDERA_ACCOUNT_ID,
    privateKey: !!process.env.HEDERA_PRIVATE_KEY,
    topicId: !!process.env.HEDERA_TOPIC_ID,
    network: process.env.HEDERA_NETWORK || 'testnet',
  };

  const isFullyConfigured = configured.accountId && configured.privateKey && configured.topicId;

  return NextResponse.json({
    success: true,
    data: {
      configured: isFullyConfigured,
      details: configured,
      message: isFullyConfigured
        ? 'Hedera is fully configured'
        : 'Hedera configuration incomplete. Please check environment variables.',
    },
  });
}
