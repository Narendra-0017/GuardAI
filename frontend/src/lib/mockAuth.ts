/**
 * Mock Authentication System for GuardAI
 * Works completely offline - no internet required
 * Perfect for development and testing
 */

import { createClient } from '@supabase/supabase-js'

// Mock user database
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

// Mock Supabase client that works offline
class MockSupabaseClient {
  private currentUser: any = null
  private currentSession: any = null

  auth = {
    getSession: async () => {
      return {
        data: { session: this.currentSession },
        error: null
      }
    },

    signInWithPassword: async ({ email, password }: { email: string, password: string }) => {
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 500))

      const user = MOCK_USERS.find(u => u.email === email && u.password === password)

      if (!user) {
        return {
          data: { user: null, session: null },
          error: { message: 'Invalid email or password' }
        }
      }

      this.currentUser = {
        id: user.id,
        email: user.email,
        user_metadata: {
          full_name: user.full_name,
          organization: user.organization,
          role: user.role
        }
      }

      this.currentSession = {
        access_token: `mock_token_${Date.now()}`,
        user: this.currentUser
      }

      return {
        data: { user: this.currentUser, session: this.currentSession },
        error: null
      }
    },

    signUp: async ({ email, password, options }: { email: string, password: string, options?: any }) => {
      await new Promise(resolve => setTimeout(resolve, 500))

      // Check if user already exists
      if (MOCK_USERS.find(u => u.email === email)) {
        return {
          data: { user: null, session: null },
          error: { message: 'User already registered' }
        }
      }

      // Create new mock user
      const newUser = {
        id: `user_${Date.now()}`,
        email,
        password,
        full_name: options?.data?.full_name || 'New User',
        organization: options?.data?.organization || '',
        role: options?.data?.role || 'user'
      }

      MOCK_USERS.push(newUser)

      this.currentUser = {
        id: newUser.id,
        email: newUser.email,
        user_metadata: {
          full_name: newUser.full_name,
          organization: newUser.organization,
          role: newUser.role
        }
      }

      this.currentSession = {
        access_token: `mock_token_${Date.now()}`,
        user: this.currentUser
      }

      return {
        data: { user: this.currentUser, session: this.currentSession },
        error: null
      }
    },

    signOut: async () => {
      this.currentUser = null
      this.currentSession = null
      return { error: null }
    },

    onAuthStateChange: (callback: (event: string, session: any) => void) => {
      // Mock subscription - does nothing but prevents errors
      return {
        data: { subscription: { unsubscribe: () => {} } }
      }
    }
  }

  // Mock database methods
  from = (table: string) => ({
    select: () => ({
      eq: () => ({
        single: async () => ({ data: null, error: null }),
        order: () => ({ limit: () => ({ data: [], error: null }) })
      }),
      order: () => ({ limit: () => ({ data: [], error: null }) })
    }),
    insert: () => ({ data: null, error: null }),
    update: () => ({ eq: () => ({ data: null, error: null }) }),
    delete: () => ({ eq: () => ({ data: null, error: null }) })
  })
}

// Create mock client
const mockSupabase = new MockSupabaseClient()

// Export based on environment
export const supabase = import.meta.env.VITE_USE_MOCK_AUTH === 'true'
  ? mockSupabase
  : createClient(
      import.meta.env.VITE_SUPABASE_URL || '',
      import.meta.env.VITE_SUPABASE_ANON_KEY || '',
      {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: true,
        },
      }
    )

// Helper to check if using mock auth
export const isMockAuth = () => import.meta.env.VITE_USE_MOCK_AUTH === 'true'

// Export mock users for reference
export const MOCK_USERS_LIST = MOCK_USERS
