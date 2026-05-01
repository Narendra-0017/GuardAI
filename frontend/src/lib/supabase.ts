import { createClient } from '@supabase/supabase-js'

// Mock user database for offline development
const MOCK_USERS = [
  {
    id: 'user_001',
    email: 'demo@guardai.com',
    password: 'demo123',
    full_name: 'Demo User',
    organization: 'GuardAI Demo',
    role: 'admin'
  },
  {
    id: 'user_002',
    email: 'analyst@guardai.com',
    password: 'analyst123',
    full_name: 'Security Analyst',
    organization: 'GuardAI Corp',
    role: 'analyst'
  }
]

// Check if we should use mock authentication
const useMockAuth = import.meta.env.VITE_USE_MOCK_AUTH === 'true'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Create real or mock Supabase client
let supabase: any

if (useMockAuth) {
  console.log('🔧 Using Mock Authentication (Offline Mode)')
  
  // Mock Supabase client for offline development
  let currentUser: any = null
  let currentSession: any = null
  
  supabase = {
    auth: {
      getSession: async () => ({
        data: { session: currentSession },
        error: null
      }),
      
      signInWithPassword: async ({ email, password }: { email: string, password: string }) => {
        await new Promise(resolve => setTimeout(resolve, 500))
        
        const user = MOCK_USERS.find(u => u.email === email && u.password === password)
        
        if (!user) {
          return {
            data: { user: null, session: null },
            error: { message: 'Invalid email or password' }
          }
        }
        
        currentUser = {
          id: user.id,
          email: user.email,
          user_metadata: {
            full_name: user.full_name,
            organization: user.organization,
            role: user.role
          }
        }
        
        currentSession = {
          access_token: `mock_token_${Date.now()}`,
          user: currentUser
        }
        
        return { data: { user: currentUser, session: currentSession }, error: null }
      },
      
      signUp: async ({ email, password, options }: { email: string, password: string, options?: any }) => {
        await new Promise(resolve => setTimeout(resolve, 500))
        
        if (MOCK_USERS.find(u => u.email === email)) {
          return {
            data: { user: null, session: null },
            error: { message: 'User already registered' }
          }
        }
        
        const newUser = {
          id: `user_${Date.now()}`,
          email,
          password,
          full_name: options?.data?.full_name || 'New User',
          organization: options?.data?.organization || '',
          role: options?.data?.role || 'user'
        }
        
        MOCK_USERS.push(newUser)
        
        currentUser = {
          id: newUser.id,
          email: newUser.email,
          user_metadata: {
            full_name: newUser.full_name,
            organization: newUser.organization,
            role: newUser.role
          }
        }
        
        currentSession = {
          access_token: `mock_token_${Date.now()}`,
          user: currentUser
        }
        
        return { data: { user: currentUser, session: currentSession }, error: null }
      },
      
      signOut: async () => {
        currentUser = null
        currentSession = null
        return { error: null }
      },
      
      onAuthStateChange: () => ({
        data: { subscription: { unsubscribe: () => {} } }
      })
    },
    
    from: () => ({
      select: () => ({
        eq: () => ({ single: async () => ({ data: null, error: null }) }),
        order: () => ({ limit: () => ({ data: [], error: null }) })
      }),
      insert: () => ({ data: null, error: null }),
      update: () => ({ eq: () => ({ data: null, error: null }) }),
      delete: () => ({ eq: () => ({ data: null, error: null }) })
    })
  }
} else {
  // Real Supabase client
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing Supabase environment variables. Set VITE_USE_MOCK_AUTH=true for offline mode.')
  }
  
  console.log('🌐 Using Real Supabase Authentication')
  console.log('🔗 Supabase URL:', supabaseUrl)
  
  supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      flowType: 'implicit',
    },
    global: {
      headers: {
        'X-Client-Info': 'supabase-js/2.x',
      },
    },
  })
}

export { supabase }

// Database types
export interface Database {
  public: {
    Tables: {
      user_profiles: {
        Row: {
          id: string
          full_name: string | null
          organization: string | null
          role: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          full_name?: string | null
          organization?: string | null
          role?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          full_name?: string | null
          organization?: string | null
          role?: string
          updated_at?: string
        }
      }
      transactions: {
        Row: {
          id: string
          transaction_id: string
          user_id: string
          amount: number
          timestamp: string
          location: string | null
          merchant: string | null
          merchant_category: string | null
          card_present: boolean
          device_fingerprint: string | null
          distance_from_home_km: number | null
          transactions_last_hour: number
          hour_of_day: number | null
          day_of_week: number | null
          merchant_category_encoded: number | null
          device_known: boolean
          amount_vs_avg_ratio: number | null
          is_foreign_transaction: boolean
          risk_score: number | null
          verdict: 'SAFE' | 'SUSPICIOUS' | 'FRAUD' | null
          confidence: number | null
          investigation_report: string | null
          shap_features: any[] | null
          anomalies: string[] | null
          agent_steps: any[] | null
          requires_human_review: boolean
          reviewed_by: string | null
          reviewed_at: string | null
          is_false_positive: boolean
          processing_time_ms: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          transaction_id: string
          user_id: string
          amount: number
          timestamp?: string
          location?: string | null
          merchant?: string | null
          merchant_category?: string | null
          card_present?: boolean
          device_fingerprint?: string | null
          distance_from_home_km?: number | null
          transactions_last_hour?: number
          hour_of_day?: number | null
          day_of_week?: number | null
          merchant_category_encoded?: number | null
          device_known?: boolean
          amount_vs_avg_ratio?: number | null
          is_foreign_transaction?: boolean
          risk_score?: number | null
          verdict?: 'SAFE' | 'SUSPICIOUS' | 'FRAUD' | null
          confidence?: number | null
          investigation_report?: string | null
          shap_features?: any[] | null
          anomalies?: string[] | null
          agent_steps?: any[] | null
          requires_human_review?: boolean
          reviewed_by?: string | null
          reviewed_at?: string | null
          is_false_positive?: boolean
          processing_time_ms?: number | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          transaction_id?: string
          user_id?: string
          amount?: number
          timestamp?: string
          location?: string | null
          merchant?: string | null
          merchant_category?: string | null
          card_present?: boolean
          device_fingerprint?: string | null
          distance_from_home_km?: number | null
          transactions_last_hour?: number
          hour_of_day?: number | null
          day_of_week?: number | null
          merchant_category_encoded?: number | null
          device_known?: boolean
          amount_vs_avg_ratio?: number | null
          is_foreign_transaction?: boolean
          risk_score?: number | null
          verdict?: 'SAFE' | 'SUSPICIOUS' | 'FRAUD' | null
          confidence?: number | null
          investigation_report?: string | null
          shap_features?: any[] | null
          anomalies?: string[] | null
          agent_steps?: any[] | null
          requires_human_review?: boolean
          reviewed_by?: string | null
          reviewed_at?: string | null
          is_false_positive?: boolean
          processing_time_ms?: number | null
          updated_at?: string
        }
      }
      email_analyses: {
        Row: {
          id: string
          sender_email: string
          subject: string
          body_preview: string | null
          body_text: string | null
          verdict: 'PHISHING' | 'SUSPICIOUS' | 'LEGITIMATE' | null
          confidence: number | null
          threat_level: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' | null
          red_flags: string[] | null
          explanation: string | null
          urgency_tactics: boolean
          impersonation_detected: boolean
          suspicious_links_mentioned: boolean
          requests_sensitive_info: boolean
          analyzed_by: string | null
          created_at: string
        }
        Insert: {
          id?: string
          sender_email: string
          subject: string
          body_preview?: string | null
          body_text?: string | null
          verdict?: 'PHISHING' | 'SUSPICIOUS' | 'LEGITIMATE' | null
          confidence?: number | null
          threat_level?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' | null
          red_flags?: string[] | null
          explanation?: string | null
          urgency_tactics?: boolean
          impersonation_detected?: boolean
          suspicious_links_mentioned?: boolean
          requests_sensitive_info?: boolean
          analyzed_by?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          sender_email?: string
          subject?: string
          body_preview?: string | null
          body_text?: string | null
          verdict?: 'PHISHING' | 'SUSPICIOUS' | 'LEGITIMATE' | null
          confidence?: number | null
          threat_level?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' | null
          red_flags?: string[] | null
          explanation?: string | null
          urgency_tactics?: boolean
          impersonation_detected?: boolean
          suspicious_links_mentioned?: boolean
          requests_sensitive_info?: boolean
          analyzed_by?: string | null
        }
      }
      system_metrics: {
        Row: {
          id: string
          total_analyzed: number
          total_fraud: number
          total_suspicious: number
          total_safe: number
          total_emails_analyzed: number
          total_phishing_detected: number
          model_auc_roc: number | null
          avg_processing_time_ms: number | null
          last_updated: string
          created_at: string
        }
        Insert: {
          id?: string
          total_analyzed?: number
          total_fraud?: number
          total_suspicious?: number
          total_safe?: number
          total_emails_analyzed?: number
          total_phishing_detected?: number
          model_auc_roc?: number | null
          avg_processing_time_ms?: number | null
          last_updated?: string
          created_at?: string
        }
        Update: {
          id?: string
          total_analyzed?: number
          total_fraud?: number
          total_suspicious?: number
          total_safe?: number
          total_emails_analyzed?: number
          total_phishing_detected?: number
          model_auc_roc?: number | null
          avg_processing_time_ms?: number | null
          last_updated?: string
        }
      }
    }
    Views: {
      transaction_analytics: {
        Row: {
          date: string
          total_transactions: number
          fraud_count: number
          suspicious_count: number
          safe_count: number
          avg_risk_score: number | null
          avg_processing_time: number | null
        }
      }
      email_analytics: {
        Row: {
          date: string
          total_emails: number
          phishing_count: number
          suspicious_count: number
          legitimate_count: number
          avg_confidence: number | null
        }
      }
    }
    Functions: {
      handle_new_user: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
    }
  }
}
