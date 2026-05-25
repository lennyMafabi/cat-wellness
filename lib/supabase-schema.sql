-- Supabase Database Schema for Cat Wellness App
-- Run this SQL in your Supabase project's SQL Editor

-- Create accounts table
CREATE TABLE accounts (
  account_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username TEXT UNIQUE NOT NULL,
  alias TEXT,
  phone TEXT,
  email TEXT,
  role TEXT CHECK (role IN ('survivor', 'practitioner', 'online_harms')) NOT NULL,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMP DEFAULT NOW(),
  last_login_at TIMESTAMP,
  total_sessions INT DEFAULT 0,
  metadata JSONB,
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create account credentials table (passwords)
CREATE TABLE account_credentials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID NOT NULL UNIQUE REFERENCES accounts(account_id) ON DELETE CASCADE,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create sessions table
CREATE TABLE sessions (
  session_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID NOT NULL REFERENCES accounts(account_id) ON DELETE CASCADE,
  date TIMESTAMP DEFAULT NOW(),
  module TEXT CHECK (module IN ('survivor', 'practitioner', 'online_harms')) NOT NULL,
  round INT DEFAULT 1,
  is_first_session BOOLEAN DEFAULT FALSE,
  risk_score FLOAT DEFAULT 0,
  emotional_state TEXT DEFAULT 'calm',
  responses JSONB DEFAULT '[]',
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create admin mirror records table
CREATE TABLE admin_mirror_records (
  mirror_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL UNIQUE REFERENCES accounts(account_id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT NOW(),
  role TEXT NOT NULL,
  status TEXT DEFAULT 'active',
  last_activity_at TIMESTAMP,
  session_count INT DEFAULT 0,
  current_risk_level TEXT,
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create retained chats table
CREATE TABLE retained_chats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID NOT NULL REFERENCES accounts(account_id) ON DELETE CASCADE,
  chat_history JSONB NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create indices for performance
CREATE INDEX idx_accounts_username ON accounts(username);
CREATE INDEX idx_sessions_account_id ON sessions(account_id);
CREATE INDEX idx_sessions_created_at ON sessions(created_at);
CREATE INDEX idx_admin_mirror_client_id ON admin_mirror_records(client_id);
CREATE INDEX idx_retained_chats_account_id ON retained_chats(account_id);

-- Enable RLS (Row Level Security) for security
ALTER TABLE accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE account_credentials ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_mirror_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE retained_chats ENABLE ROW LEVEL SECURITY;

-- Create RLS policies (allow all for now - adjust for production security)
CREATE POLICY "Allow all for accounts" ON accounts FOR ALL USING (TRUE);
CREATE POLICY "Allow all for credentials" ON account_credentials FOR ALL USING (TRUE);
CREATE POLICY "Allow all for sessions" ON sessions FOR ALL USING (TRUE);
CREATE POLICY "Allow all for admin_mirror" ON admin_mirror_records FOR ALL USING (TRUE);
CREATE POLICY "Allow all for chats" ON retained_chats FOR ALL USING (TRUE);
