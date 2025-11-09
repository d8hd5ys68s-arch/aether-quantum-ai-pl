-- Aether AI Database Schema for Vercel Postgres

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR(255) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  display_name VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  api_call_count INTEGER DEFAULT 0,
  rate_limit_reset TIMESTAMP WITH TIME ZONE
);

-- Chat messages table
CREATE TABLE IF NOT EXISTS chat_messages (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL,
  role VARCHAR(20) NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content TEXT NOT NULL,
  model VARCHAR(100),
  tokens_used INTEGER,
  cost DECIMAL(10, 6),
  hedera_transaction_id VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- Hedera transactions table
CREATE TABLE IF NOT EXISTS hedera_transactions (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL,
  transaction_id VARCHAR(255) UNIQUE NOT NULL,
  consensus_timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
  status VARCHAR(50) NOT NULL,
  cost DECIMAL(10, 8) NOT NULL,
  carbon_impact DECIMAL(10, 8) NOT NULL,
  api_call_type VARCHAR(50) NOT NULL,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_user_id ON users(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_user_id ON chat_messages(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_created_at ON chat_messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_hedera_transactions_user_id ON hedera_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_hedera_transactions_created_at ON hedera_transactions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_hedera_transactions_transaction_id ON hedera_transactions(transaction_id);

-- Create a function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for users table
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
