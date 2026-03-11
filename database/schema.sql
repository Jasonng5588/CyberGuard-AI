-- ============================================================
-- AI Cyberbullying Detection System - Database Schema
-- PostgreSQL
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- USERS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS users (
    id          SERIAL PRIMARY KEY,
    username    VARCHAR(100) NOT NULL UNIQUE,
    email       VARCHAR(255) UNIQUE,
    created_at  TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_active   BOOLEAN DEFAULT TRUE
);

-- ============================================================
-- MESSAGES TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS messages (
    id            SERIAL PRIMARY KEY,
    user_id       INTEGER REFERENCES users(id) ON DELETE SET NULL,
    message_text  TEXT NOT NULL,
    timestamp     TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================
-- DETECTIONS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS detections (
    id            SERIAL PRIMARY KEY,
    message_id    INTEGER REFERENCES messages(id) ON DELETE CASCADE,
    label         VARCHAR(50) NOT NULL CHECK (label IN ('SAFE', 'OFFENSIVE', 'CYBERBULLYING')),
    confidence    FLOAT NOT NULL CHECK (confidence >= 0 AND confidence <= 1),
    model_used    VARCHAR(100) DEFAULT 'distilbert-toxic-classifier',
    created_at    TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================
-- CHAT LOGS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS chat_logs (
    id            SERIAL PRIMARY KEY,
    user_id       INTEGER REFERENCES users(id) ON DELETE SET NULL,
    user_message  TEXT NOT NULL,
    bot_response  TEXT NOT NULL,
    detection_label VARCHAR(50),
    timestamp     TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================
-- INDEXES for performance
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_messages_user_id ON messages(user_id);
CREATE INDEX IF NOT EXISTS idx_messages_timestamp ON messages(timestamp);
CREATE INDEX IF NOT EXISTS idx_detections_label ON detections(label);
CREATE INDEX IF NOT EXISTS idx_detections_created_at ON detections(created_at);
CREATE INDEX IF NOT EXISTS idx_chat_logs_user_id ON chat_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_logs_timestamp ON chat_logs(timestamp);

-- ============================================================
-- SEED DATA - Default users for demo
-- ============================================================
INSERT INTO users (username, email) VALUES
    ('demo_user', 'demo@cyberbullying.ai'),
    ('admin', 'admin@cyberbullying.ai'),
    ('test_user1', 'user1@example.com')
ON CONFLICT (username) DO NOTHING;
