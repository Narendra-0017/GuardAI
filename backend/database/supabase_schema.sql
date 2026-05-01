-- GuardAI Database Schema for Supabase
-- Copy and paste this SQL into your Supabase SQL Editor

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- User Profiles Table
CREATE TABLE user_profiles (
  id UUID REFERENCES auth.users PRIMARY KEY,
  full_name TEXT,
  organization TEXT,
  role TEXT DEFAULT 'analyst' CHECK (role IN ('admin', 'analyst', 'viewer')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Transactions Table (core fraud detection data)
CREATE TABLE transactions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  transaction_id TEXT UNIQUE NOT NULL,
  user_id TEXT NOT NULL,
  amount DECIMAL(12,2) NOT NULL,
  timestamp TIMESTAMPTZ NOT NULL,
  location TEXT,
  merchant TEXT,
  merchant_category TEXT,
  card_present BOOLEAN DEFAULT false,
  device_fingerprint TEXT,
  distance_from_home_km DECIMAL(10,2),
  transactions_last_hour INTEGER DEFAULT 1,
  hour_of_day INTEGER,
  day_of_week INTEGER,
  merchant_category_encoded INTEGER,
  device_known BOOLEAN DEFAULT true,
  amount_vs_avg_ratio DECIMAL(5,2) DEFAULT 1.0,
  is_foreign_transaction BOOLEAN DEFAULT false,
  
  -- ML Model Results
  risk_score DECIMAL(5,4),
  verdict TEXT CHECK (verdict IN ('SAFE','SUSPICIOUS','FRAUD')),
  confidence DECIMAL(5,2),
  investigation_report TEXT,
  shap_features JSONB,
  anomalies JSONB,
  agent_steps JSONB,
  requires_human_review BOOLEAN DEFAULT false,
  reviewed_by UUID REFERENCES auth.users,
  reviewed_at TIMESTAMPTZ,
  is_false_positive BOOLEAN DEFAULT false,
  processing_time_ms INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Email Analyses Table (phishing detection)
CREATE TABLE email_analyses (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  sender_email TEXT NOT NULL,
  subject TEXT NOT NULL,
  body_preview TEXT,
  body_text TEXT,
  verdict TEXT CHECK (verdict IN ('PHISHING','SUSPICIOUS','LEGITIMATE')),
  confidence INTEGER CHECK (confidence >= 0 AND confidence <= 100),
  threat_level TEXT CHECK (threat_level IN ('LOW','MEDIUM','HIGH','CRITICAL')),
  red_flags JSONB,
  explanation TEXT,
  urgency_tactics BOOLEAN DEFAULT false,
  impersonation_detected BOOLEAN DEFAULT false,
  suspicious_links_mentioned BOOLEAN DEFAULT false,
  requests_sensitive_info BOOLEAN DEFAULT false,
  analyzed_by UUID REFERENCES auth.users,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Agent Logs Table (for debugging and monitoring)
CREATE TABLE agent_logs (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  transaction_id TEXT,
  agent_name TEXT NOT NULL,
  input_data JSONB,
  output_data JSONB,
  execution_time_ms INTEGER,
  error_message TEXT,
  status TEXT CHECK (status IN ('started','completed','failed')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- System Metrics Table (for dashboard analytics)
CREATE TABLE system_metrics (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  total_analyzed INTEGER DEFAULT 0,
  total_fraud INTEGER DEFAULT 0,
  total_suspicious INTEGER DEFAULT 0,
  total_safe INTEGER DEFAULT 0,
  total_emails_analyzed INTEGER DEFAULT 0,
  total_phishing_detected INTEGER DEFAULT 0,
  model_auc_roc DECIMAL(6,4),
  avg_processing_time_ms INTEGER,
  last_updated TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- User Sessions Table (for authentication tracking)
CREATE TABLE user_sessions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users,
  session_token TEXT UNIQUE,
  ip_address INET,
  user_agent TEXT,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Transaction Reviews Table (for human review workflow)
CREATE TABLE transaction_reviews (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  transaction_id UUID REFERENCES transactions(id),
  reviewer_id UUID REFERENCES auth.users,
  review_type TEXT CHECK (review_type IN ('fraud_confirmation','false_positive','escalation')),
  review_notes TEXT,
  reviewer_confidence INTEGER CHECK (reviewer_confidence >= 0 AND reviewer_confidence <= 100),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_transactions_user_id ON transactions(user_id);
CREATE INDEX idx_transactions_timestamp ON transactions(timestamp DESC);
CREATE INDEX idx_transactions_verdict ON transactions(verdict);
CREATE INDEX idx_transactions_risk_score ON transactions(risk_score DESC);
CREATE INDEX idx_transactions_created_at ON transactions(created_at DESC);
CREATE INDEX idx_email_analyses_created_at ON email_analyses(created_at DESC);
CREATE INDEX idx_email_analyses_verdict ON email_analyses(verdict);
CREATE INDEX idx_agent_logs_transaction_id ON agent_logs(transaction_id);
CREATE INDEX idx_agent_logs_created_at ON agent_logs(created_at DESC);
CREATE INDEX idx_user_profiles_id ON user_profiles(id);

-- Enable Row Level Security (RLS)
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_analyses ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE transaction_reviews ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_profiles
CREATE POLICY "Users can view own profile" ON user_profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON user_profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON user_profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- RLS Policies for transactions
CREATE POLICY "Users can view own transactions" ON transactions
  FOR SELECT USING (user_id = auth.uid()::text);

CREATE POLICY "Admins can view all transactions" ON transactions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- RLS Policies for email_analyses
CREATE POLICY "Users can view own email analyses" ON email_analyses
  FOR SELECT USING (analyzed_by = auth.uid());

CREATE POLICY "Admins can view all email analyses" ON email_analyses
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- RLS Policies for agent_logs
CREATE POLICY "Admins can view all agent logs" ON agent_logs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- RLS Policies for user_sessions
CREATE POLICY "Users can view own sessions" ON user_sessions
  FOR SELECT USING (user_id = auth.uid());

-- RLS Policies for transaction_reviews
CREATE POLICY "Users can view own reviews" ON transaction_reviews
  FOR SELECT USING (reviewer_id = auth.uid());

CREATE POLICY "Users can create reviews" ON transaction_reviews
  FOR INSERT WITH CHECK (reviewer_id = auth.uid());

-- Functions for automatic timestamp updates
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
CREATE TRIGGER update_user_profiles_updated_at 
    BEFORE UPDATE ON user_profiles 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_transactions_updated_at 
    BEFORE UPDATE ON transactions 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to update system metrics
CREATE OR REPLACE FUNCTION update_system_metrics()
RETURNS TRIGGER AS $$
BEGIN
    -- Update transaction counts
    IF TG_TABLE_NAME = 'transactions' THEN
        INSERT INTO system_metrics (total_analyzed, total_fraud, total_suspicious, total_safe, last_updated)
        SELECT 
            COUNT(*),
            COUNT(*) FILTER (WHERE verdict = 'FRAUD'),
            COUNT(*) FILTER (WHERE verdict = 'SUSPICIOUS'),
            COUNT(*) FILTER (WHERE verdict = 'SAFE'),
            NOW()
        FROM transactions;
        
        RETURN NEW;
    END IF;
    
    -- Update email counts
    IF TG_TABLE_NAME = 'email_analyses' THEN
        UPDATE system_metrics SET
            total_emails_analyzed = (SELECT COUNT(*) FROM email_analyses),
            total_phishing_detected = (SELECT COUNT(*) FROM email_analyses WHERE verdict = 'PHISHING'),
            last_updated = NOW();
            
        RETURN NEW;
    END IF;
    
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for system metrics
CREATE TRIGGER update_transaction_metrics
    AFTER INSERT OR UPDATE ON transactions
    FOR EACH ROW EXECUTE FUNCTION update_system_metrics();

CREATE TRIGGER update_email_metrics
    AFTER INSERT ON email_analyses
    FOR EACH ROW EXECUTE FUNCTION update_system_metrics();

-- Initialize system metrics
INSERT INTO system_metrics (total_analyzed, total_fraud, total_suspicious, total_safe, model_auc_roc, avg_processing_time_ms)
VALUES (0, 0, 0, 0, 0.9800, 150);

-- Enable Realtime for transactions table
ALTER PUBLICATION supabase_realtime ADD TABLE transactions;

-- Create a view for transaction analytics
CREATE VIEW transaction_analytics AS
SELECT 
    DATE_TRUNC('day', created_at) as date,
    COUNT(*) as total_transactions,
    COUNT(*) FILTER (WHERE verdict = 'FRAUD') as fraud_count,
    COUNT(*) FILTER (WHERE verdict = 'SUSPICIOUS') as suspicious_count,
    COUNT(*) FILTER (WHERE verdict = 'SAFE') as safe_count,
    AVG(risk_score) as avg_risk_score,
    AVG(processing_time_ms) as avg_processing_time
FROM transactions
GROUP BY DATE_TRUNC('day', created_at)
ORDER BY date DESC;

-- Create a view for email analytics
CREATE VIEW email_analytics AS
SELECT 
    DATE_TRUNC('day', created_at) as date,
    COUNT(*) as total_emails,
    COUNT(*) FILTER (WHERE verdict = 'PHISHING') as phishing_count,
    COUNT(*) FILTER (WHERE verdict = 'SUSPICIOUS') as suspicious_count,
    COUNT(*) FILTER (WHERE verdict = 'LEGITIMATE') as legitimate_count,
    AVG(confidence) as avg_confidence
FROM email_analyses
GROUP BY DATE_TRUNC('day', created_at)
ORDER BY date DESC;

-- Grant permissions to authenticated users
GRANT ALL ON user_profiles TO authenticated;
GRANT ALL ON transactions TO authenticated;
GRANT ALL ON email_analyses TO authenticated;
GRANT ALL ON transaction_reviews TO authenticated;
GRANT ALL ON user_sessions TO authenticated;

-- Grant read permissions to public for analytics views
GRANT SELECT ON transaction_analytics TO public;
GRANT SELECT ON email_analytics TO public;
GRANT SELECT ON system_metrics TO public;

-- Create function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.user_profiles (id, full_name, organization)
    VALUES (NEW.id, NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'organization');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create user profile on signup
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Add comments for documentation
COMMENT ON TABLE user_profiles IS 'User profile information and roles';
COMMENT ON TABLE transactions IS 'Core transaction data with fraud detection results';
COMMENT ON TABLE email_analyses IS 'Phishing email analysis results';
COMMENT ON TABLE agent_logs IS 'Agent execution logs for debugging';
COMMENT ON TABLE system_metrics IS 'System-wide metrics for dashboard';
COMMENT ON TABLE user_sessions IS 'User authentication sessions';
COMMENT ON TABLE transaction_reviews IS 'Human review workflow for flagged transactions';

COMMENT ON COLUMN transactions.risk_score IS 'ML model risk score (0.0 to 1.0)';
COMMENT ON COLUMN transactions.verdict IS 'Final fraud verdict: SAFE, SUSPICIOUS, or FRAUD';
COMMENT ON COLUMN transactions.confidence IS 'Confidence percentage (0-100)';
COMMENT ON COLUMN transactions.shap_features IS 'SHAP feature importance explanation';
COMMENT ON COLUMN transactions.anomalies IS 'Detected behavioral anomalies';
COMMENT ON COLUMN transactions.agent_steps IS 'Step-by-step agent execution log';

COMMENT ON COLUMN email_analyses.threat_level IS 'Email threat level: LOW, MEDIUM, HIGH, or CRITICAL';
COMMENT ON COLUMN email_analyses.red_flags IS 'List of detected phishing indicators';
COMMENT ON COLUMN email_analyses.urgency_tactics IS 'Whether urgency tactics were detected';
COMMENT ON COLUMN email_analyses.impersonation_detected IS 'Whether impersonation was detected';
