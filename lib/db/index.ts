import { sql } from '@vercel/postgres';
import { logger } from '../logger';

export interface User {
  id: number;
  user_id: string;
  email: string;
  password_hash: string;
  display_name?: string;
  created_at: Date;
  updated_at: Date;
  api_call_count: number;
  rate_limit_reset?: Date;
}

export interface ChatMessage {
  id: number;
  user_id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  model?: string;
  tokens_used?: number;
  cost?: number;
  hedera_transaction_id?: string;
  created_at: Date;
}

export interface HederaTransaction {
  id: number;
  user_id: string;
  transaction_id: string;
  consensus_timestamp: Date;
  status: string;
  cost: number;
  carbon_impact: number;
  api_call_type: string;
  metadata?: Record<string, any>;
  created_at: Date;
}

export class Database {
  /**
   * Execute database query with error handling and logging
   */
  private static async executeQuery<T>(
    operation: string,
    query: () => Promise<T>
  ): Promise<T> {
    try {
      logger.database(operation);
      const result = await query();
      return result;
    } catch (error: any) {
      logger.error(`Database error: ${operation}`, error);
      throw new DatabaseError(`Failed to ${operation}`, error);
    }
  }

  /**
   * Create or update a user
   */
  static async upsertUser(data: {
    user_id: string;
    email: string;
    password_hash: string;
    display_name?: string;
  }): Promise<User> {
    return this.executeQuery('upsert user', async () => {
      const { user_id, email, password_hash, display_name } = data;

      const result = await sql<User>`
        INSERT INTO users (user_id, email, password_hash, display_name)
        VALUES (${user_id}, ${email}, ${password_hash}, ${display_name || null})
        ON CONFLICT (user_id)
        DO UPDATE SET
          email = EXCLUDED.email,
          display_name = EXCLUDED.display_name,
          updated_at = CURRENT_TIMESTAMP
        RETURNING *
      `;

      if (result.rows.length === 0) {
        throw new Error('Failed to upsert user');
      }

      return result.rows[0];
    });
  }

  /**
   * Get a user by user_id
   */
  static async getUserById(user_id: string): Promise<User | null> {
    return this.executeQuery('get user by ID', async () => {
      const result = await sql<User>`
        SELECT * FROM users WHERE user_id = ${user_id} LIMIT 1
      `;

      return result.rows[0] || null;
    });
  }

  /**
   * Get a user by email
   */
  static async getUserByEmail(email: string): Promise<User | null> {
    const result = await sql<User>`
      SELECT * FROM users WHERE email = ${email} LIMIT 1
    `;

    return result.rows[0] || null;
  }

  /**
   * Update user's API call count
   */
  static async updateApiCallCount(user_id: string, increment: number = 1): Promise<void> {
    await sql`
      UPDATE users
      SET api_call_count = api_call_count + ${increment}
      WHERE user_id = ${user_id}
    `;
  }

  /**
   * Check and update rate limit
   */
  static async checkRateLimit(
    user_id: string,
    maxRequests: number = 100,
    windowMs: number = 15 * 60 * 1000
  ): Promise<{ allowed: boolean; remaining: number }> {
    const user = await this.getUserById(user_id);

    if (!user) {
      return { allowed: true, remaining: maxRequests - 1 };
    }

    const now = new Date();
    const resetTime = user.rate_limit_reset;

    // Check if rate limit window has expired
    if (!resetTime || now.getTime() > new Date(resetTime).getTime()) {
      // Reset rate limit
      const newResetTime = new Date(now.getTime() + windowMs);
      await sql`
        UPDATE users
        SET api_call_count = 0, rate_limit_reset = ${newResetTime.toISOString()}
        WHERE user_id = ${user_id}
      `;
      return { allowed: true, remaining: maxRequests - 1 };
    }

    // Check if user has exceeded rate limit
    if (user.api_call_count >= maxRequests) {
      return { allowed: false, remaining: 0 };
    }

    return { allowed: true, remaining: maxRequests - user.api_call_count - 1 };
  }

  /**
   * Save a chat message
   */
  static async saveChatMessage(data: {
    user_id: string;
    role: 'user' | 'assistant' | 'system';
    content: string;
    model?: string;
    tokens_used?: number;
    cost?: number;
    hedera_transaction_id?: string;
  }): Promise<ChatMessage> {
    const result = await sql<ChatMessage>`
      INSERT INTO chat_messages (
        user_id, role, content, model, tokens_used, cost, hedera_transaction_id
      )
      VALUES (
        ${data.user_id},
        ${data.role},
        ${data.content},
        ${data.model || null},
        ${data.tokens_used || null},
        ${data.cost || null},
        ${data.hedera_transaction_id || null}
      )
      RETURNING *
    `;

    return result.rows[0];
  }

  /**
   * Get chat messages for a user
   */
  static async getChatMessages(user_id: string, limit: number = 50): Promise<ChatMessage[]> {
    const result = await sql<ChatMessage>`
      SELECT * FROM chat_messages
      WHERE user_id = ${user_id}
      ORDER BY created_at DESC
      LIMIT ${limit}
    `;

    return result.rows;
  }

  /**
   * Save a Hedera transaction
   */
  static async saveHederaTransaction(data: {
    user_id: string;
    transaction_id: string;
    consensus_timestamp: Date;
    status: string;
    cost: number;
    carbon_impact: number;
    api_call_type: string;
    metadata?: Record<string, any>;
  }): Promise<HederaTransaction> {
    const result = await sql<HederaTransaction>`
      INSERT INTO hedera_transactions (
        user_id, transaction_id, consensus_timestamp, status,
        cost, carbon_impact, api_call_type, metadata
      )
      VALUES (
        ${data.user_id},
        ${data.transaction_id},
        ${data.consensus_timestamp.toISOString()},
        ${data.status},
        ${data.cost},
        ${data.carbon_impact},
        ${data.api_call_type},
        ${JSON.stringify(data.metadata || {})}
      )
      RETURNING *
    `;

    return result.rows[0];
  }

  /**
   * Get Hedera transactions for a user
   */
  static async getHederaTransactions(
    user_id: string,
    limit: number = 100
  ): Promise<HederaTransaction[]> {
    const result = await sql<HederaTransaction>`
      SELECT * FROM hedera_transactions
      WHERE user_id = ${user_id}
      ORDER BY created_at DESC
      LIMIT ${limit}
    `;

    return result.rows;
  }

  /**
   * Get transaction summary for a user
   */
  static async getTransactionSummary(user_id: string): Promise<{
    totalTransactions: number;
    totalCost: number;
    totalCarbonSaved: number;
  }> {
    const result = await sql`
      SELECT
        COUNT(*) as total_transactions,
        COALESCE(SUM(cost), 0) as total_cost,
        COALESCE(ABS(SUM(carbon_impact)), 0) as total_carbon_saved
      FROM hedera_transactions
      WHERE user_id = ${user_id}
    `;

    const row = result.rows[0];
    return {
      totalTransactions: parseInt(row.total_transactions),
      totalCost: parseFloat(row.total_cost),
      totalCarbonSaved: parseFloat(row.total_carbon_saved),
    };
  }

  /**
   * Delete old chat messages (cleanup)
   */
  static async deleteOldChatMessages(
    user_id: string,
    daysToKeep: number = 30
  ): Promise<number> {
    return this.executeQuery('delete old chat messages', async () => {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

      const result = await sql`
        DELETE FROM chat_messages
        WHERE user_id = ${user_id}
        AND created_at < ${cutoffDate.toISOString()}
      `;

      return result.rowCount || 0;
    });
  }

  /**
   * Get user statistics
   */
  static async getUserStats(user_id: string): Promise<{
    totalMessages: number;
    totalTokensUsed: number;
    totalCost: number;
    firstMessageAt: Date | null;
    lastMessageAt: Date | null;
  }> {
    return this.executeQuery('get user stats', async () => {
      const result = await sql`
        SELECT
          COUNT(*) as total_messages,
          COALESCE(SUM(tokens_used), 0) as total_tokens,
          COALESCE(SUM(cost), 0) as total_cost,
          MIN(created_at) as first_message,
          MAX(created_at) as last_message
        FROM chat_messages
        WHERE user_id = ${user_id}
      `;

      const row = result.rows[0];
      return {
        totalMessages: parseInt(row.total_messages),
        totalTokensUsed: parseInt(row.total_tokens),
        totalCost: parseFloat(row.total_cost),
        firstMessageAt: row.first_message ? new Date(row.first_message) : null,
        lastMessageAt: row.last_message ? new Date(row.last_message) : null,
      };
    });
  }

  /**
   * Test database connection
   */
  static async testConnection(): Promise<boolean> {
    try {
      await sql`SELECT 1 as test`;
      logger.info('Database connection successful');
      return true;
    } catch (error) {
      logger.error('Database connection failed', error as Error);
      return false;
    }
  }

  /**
   * Get database health
   */
  static async getHealth(): Promise<{
    connected: boolean;
    responseTime: number;
    activeConnections?: number;
  }> {
    const startTime = Date.now();

    try {
      const result = await sql`
        SELECT
          COUNT(*) as active_connections
        FROM pg_stat_activity
        WHERE datname = current_database()
      `;

      const responseTime = Date.now() - startTime;

      return {
        connected: true,
        responseTime,
        activeConnections: parseInt(result.rows[0]?.active_connections || '0'),
      };
    } catch (error) {
      logger.error('Database health check failed', error as Error);
      return {
        connected: false,
        responseTime: Date.now() - startTime,
      };
    }
  }
}

/**
 * Custom database error class
 */
export class DatabaseError extends Error {
  constructor(
    message: string,
    public originalError?: Error
  ) {
    super(message);
    this.name = 'DatabaseError';

    // Maintain proper stack trace
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, DatabaseError);
    }
  }
}

/**
 * Type guard for database errors
 */
export function isDatabaseError(error: unknown): error is DatabaseError {
  return error instanceof DatabaseError;
}
