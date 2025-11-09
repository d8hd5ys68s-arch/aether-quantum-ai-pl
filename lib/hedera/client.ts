import {
  Client,
  AccountId,
  PrivateKey,
  TopicMessageSubmitTransaction,
  TopicCreateTransaction,
  Hbar,
  Status,
} from '@hashgraph/sdk';

// Hedera client configuration
const network = process.env.HEDERA_NETWORK || 'testnet';
const accountId = process.env.HEDERA_ACCOUNT_ID;
const privateKey = process.env.HEDERA_PRIVATE_KEY;

let client: Client | null = null;

/**
 * Initialize Hedera client
 */
export function getHederaClient(): Client {
  if (client) {
    return client;
  }

  if (!accountId || !privateKey) {
    throw new Error('Hedera credentials not configured');
  }

  try {
    // Create client for testnet or mainnet
    if (network === 'mainnet') {
      client = Client.forMainnet();
    } else {
      client = Client.forTestnet();
    }

    // Set operator
    const operatorId = AccountId.fromString(accountId);
    const operatorKey = PrivateKey.fromString(privateKey);

    client.setOperator(operatorId, operatorKey);

    // Set default max transaction fee
    client.setDefaultMaxTransactionFee(new Hbar(2));

    // Set default max query payment
    client.setDefaultMaxQueryPayment(new Hbar(1));

    console.log(`Hedera client initialized for ${network}`);
    return client;
  } catch (error) {
    console.error('Error initializing Hedera client:', error);
    throw error;
  }
}

/**
 * Close Hedera client connection
 */
export async function closeHederaClient(): Promise<void> {
  if (client) {
    await client.close();
    client = null;
  }
}

/**
 * Create a new topic on Hedera Consensus Service
 */
export async function createTopic(memo?: string): Promise<string> {
  const hederaClient = getHederaClient();

  try {
    const transaction = new TopicCreateTransaction();

    if (memo) {
      transaction.setTopicMemo(memo);
    }

    const txResponse = await transaction.execute(hederaClient);
    const receipt = await txResponse.getReceipt(hederaClient);

    if (!receipt.topicId) {
      throw new Error('Failed to create topic');
    }

    const topicId = receipt.topicId.toString();
    console.log(`Created topic: ${topicId}`);

    return topicId;
  } catch (error) {
    console.error('Error creating topic:', error);
    throw error;
  }
}

/**
 * Submit a message to a Hedera topic
 */
export async function submitTopicMessage(
  topicId: string,
  message: string
): Promise<{
  transactionId: string;
  consensusTimestamp: string;
  status: string;
  cost: number;
}> {
  const hederaClient = getHederaClient();

  try {
    const transaction = new TopicMessageSubmitTransaction({
      topicId,
      message,
    });

    const txResponse = await transaction.execute(hederaClient);
    const receipt = await txResponse.getReceipt(hederaClient);
    const transactionRecord = await txResponse.getRecord(hederaClient);

    const cost = transactionRecord.transactionFee.toBigNumber().toNumber();

    return {
      transactionId: txResponse.transactionId.toString(),
      consensusTimestamp: (receipt as any).consensusTimestamp?.toDate().toISOString() || new Date().toISOString(),
      status: Status._fromCode(receipt.status.valueOf()).toString(),
      cost: cost / 100_000_000, // Convert tinybars to HBAR
    };
  } catch (error) {
    console.error('Error submitting topic message:', error);
    throw error;
  }
}

/**
 * Track an API call on Hedera
 */
export async function trackAPICall(data: {
  userId: string;
  query: string;
  model: string;
  tokensUsed: number;
  cost: number;
}): Promise<{
  transactionId: string;
  consensusTimestamp: string;
  status: string;
  hederaCost: number;
  carbonImpact: number;
}> {
  // For MVP, we'll use a default topic ID or create one if not exists
  // In production, you'd want to manage topic IDs per user or use a global topic
  const topicId = process.env.HEDERA_TOPIC_ID;

  if (!topicId) {
    throw new Error('Hedera topic ID not configured. Please create a topic first.');
  }

  // Create message payload
  const message = JSON.stringify({
    type: 'api_call',
    timestamp: Date.now(),
    userId: data.userId,
    model: data.model,
    tokensUsed: data.tokensUsed,
    cost: data.cost,
    // Don't include the actual query for privacy
    queryHash: hashString(data.query),
  });

  // Submit to Hedera
  const result = await submitTopicMessage(topicId, message);

  // Calculate carbon impact (Hedera is carbon-negative)
  // Assuming ~0.00017 kWh per transaction and carbon offset program
  const carbonImpact = -0.00002; // Negative = carbon removal in kg CO2

  return {
    ...result,
    hederaCost: result.cost,
    carbonImpact,
  };
}

/**
 * Simple hash function for privacy
 */
function hashString(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return hash.toString(36);
}

/**
 * Get transaction details from mirror node
 */
export async function getTransactionDetails(transactionId: string): Promise<any> {
  const mirrorNodeUrl = network === 'mainnet'
    ? 'https://mainnet-public.mirrornode.hedera.com'
    : 'https://testnet.mirrornode.hedera.com';

  try {
    const response = await fetch(`${mirrorNodeUrl}/api/v1/transactions/${transactionId}`);

    if (!response.ok) {
      throw new Error(`Mirror node request failed: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching transaction details:', error);
    throw error;
  }
}

/**
 * Get topic messages from mirror node
 */
export async function getTopicMessages(topicId: string, limit: number = 10): Promise<any> {
  const mirrorNodeUrl = network === 'mainnet'
    ? 'https://mainnet-public.mirrornode.hedera.com'
    : 'https://testnet.mirrornode.hedera.com';

  try {
    const response = await fetch(
      `${mirrorNodeUrl}/api/v1/topics/${topicId}/messages?limit=${limit}&order=desc`
    );

    if (!response.ok) {
      throw new Error(`Mirror node request failed: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching topic messages:', error);
    throw error;
  }
}
