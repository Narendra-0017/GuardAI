-- GuardAI Database Schema
-- Run this in Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    full_name VARCHAR(255),
    organization VARCHAR(255),
    role VARCHAR(50) DEFAULT 'user',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Transactions table
CREATE TABLE IF NOT EXISTS public.transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    transaction_id VARCHAR(255) UNIQUE NOT NULL,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    amount DECIMAL(12,2) NOT NULL,
    timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
    merchant VARCHAR(255),
    category VARCHAR(100),
    country VARCHAR(10),
    is_foreign BOOLEAN DEFAULT FALSE,
    card_present BOOLEAN DEFAULT TRUE,
    distance_from_home DECIMAL(10,2),
    transactions_last_hour INTEGER DEFAULT 0,
    hour_of_day INTEGER,
    device_id VARCHAR(255),
    ip_address VARCHAR(50),
    is_fraud BOOLEAN DEFAULT FALSE,
    fraud_probability DECIMAL(5,4),
    verdict VARCHAR(50),
    risk_score DECIMAL(5,2),
    confidence DECIMAL(5,4),
    status VARCHAR(50) DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Analyses table (stores ML analysis results)
CREATE TABLE IF NOT EXISTS public.analyses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    transaction_id UUID REFERENCES public.transactions(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    verdict VARCHAR(50) NOT NULL,
    risk_score DECIMAL(5,2),
    confidence DECIMAL(5,4),
    shap_features JSONB,
    anomalies JSONB,
    investigation_report TEXT,
    model_info JSONB,
    analyzed_by VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Email analyses table
CREATE TABLE IF NOT EXISTS public.email_analyses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    email_subject TEXT,
    email_content TEXT,
    sender_email VARCHAR(255),
    verdict VARCHAR(50) NOT NULL,
    threat_level VARCHAR(50),
    confidence DECIMAL(5,4),
    indicators JSONB,
    analysis_details JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Row Level Security Policies
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analyses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_analyses ENABLE ROW LEVEL SECURITY;

-- Users can only see their own data
CREATE POLICY "Users can view own profile" ON public.users
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.users
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can view own transactions" ON public.transactions
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can insert own transactions" ON public.transactions
    FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can view own analyses" ON public.analyses
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can insert own analyses" ON public.analyses
    FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can view own email analyses" ON public.email_analyses
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can insert own email analyses" ON public.email_analyses
    FOR INSERT WITH CHECK (user_id = auth.uid());

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON public.transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_created_at ON public.transactions(created_at);
CREATE INDEX IF NOT EXISTS idx_analyses_transaction_id ON public.analyses(transaction_id);
CREATE INDEX IF NOT EXISTS idx_email_analyses_user_id ON public.email_analyses(user_id);
