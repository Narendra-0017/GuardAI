import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { supabase } from '../lib/supabase'

interface User {
  id: string
  email: string
  full_name?: string
  organization?: string
  role?: string
}

interface AuthState {
  user: User | null
  token: string | null
  isLoading: boolean
  isAuthenticated: boolean
  
  // Actions
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  logout: () => Promise<void>
  register: (email: string, password: string, fullName?: string, organization?: string) => Promise<{ success: boolean; error?: string }>
  setUser: (user: User | null) => void
  setToken: (token: string | null) => void
  setLoading: (loading: boolean) => void
  checkAuth: () => Promise<void>
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isLoading: true,
      isAuthenticated: false,

      login: async (email: string, password: string) => {
        try {
          set({ isLoading: true })
          
          console.log('🔐 Attempting login for:', email)
          
          // Use direct Supabase auth with timeout
          const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
          })

          if (error) {
            set({ isLoading: false })
            console.error('❌ Login error:', error)
            console.error('❌ Error details:', JSON.stringify(error, null, 2))
            
            let errorMessage = (error as any).message || 'Login failed'
            
            // Handle specific Supabase errors
            if ((error as any).status === 401) {
              errorMessage = 'Invalid email or password. Please check your credentials.'
            } else if (errorMessage?.includes('timeout') || errorMessage?.includes('Failed to fetch')) {
              errorMessage = 'Connection timeout. Please check your internet connection and try again.'
            } else if (errorMessage?.includes('Invalid login credentials')) {
              errorMessage = 'Invalid email or password. Please try again.'
            }
            
            return { success: false, error: errorMessage }
          }

          if (data.user) {
            const userData = {
              id: data.user.id,
              email: data.user.email || '',
              full_name: data.user.user_metadata?.full_name || '',
              organization: data.user.user_metadata?.organization || '',
              role: data.user.user_metadata?.role || 'user'
            }
            
            set({
              user: userData,
              token: data.session?.access_token || '',
              isAuthenticated: true,
              isLoading: false,
            })
            return { success: true }
          } else {
            set({ isLoading: false })
            return { success: false, error: 'Login failed. Please try again.' }
          }
        } catch (error: any) {
          set({ isLoading: false })
          let errorMessage = 'Network error. Please check your connection.'
          
          if (error?.message?.includes('timeout') || error?.message?.includes('Failed to fetch')) {
            errorMessage = 'Connection timeout. Please check your internet connection and try again.'
          }
          
          return { success: false, error: errorMessage }
        }
      },

      logout: async () => {
        try {
          // Call logout endpoint if needed
          await supabase.auth.signOut()
        } catch (error) {
          console.error('Logout error:', error)
        } finally {
          set({
            user: null,
            token: null,
            isAuthenticated: false,
            isLoading: false,
          })
        }
      },

      register: async (email: string, password: string, fullName?: string, organization?: string) => {
        try {
          set({ isLoading: true })
          
          // Use direct Supabase auth with timeout
          const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
              data: {
                full_name: fullName || '',
                organization: organization || '',
                role: 'user'
              }
            }
          })

          if (error) {
            set({ isLoading: false })
            let errorMessage = error.message
            
            // Handle specific Supabase errors
            if (error.message?.includes('timeout') || error.message?.includes('Failed to fetch')) {
              errorMessage = 'Connection timeout. Please check your internet connection and try again.'
            } else if (error.message?.includes('User already registered')) {
              errorMessage = 'This email is already registered. Please try logging in.'
            } else if (error.message?.includes('Password should be at least')) {
              errorMessage = 'Password must be at least 6 characters long.'
            }
            
            return { success: false, error: errorMessage }
          }

          if (data.user) {
            const userData = {
              id: data.user.id,
              email: data.user.email || '',
              full_name: data.user.user_metadata?.full_name || fullName || '',
              organization: data.user.user_metadata?.organization || organization || '',
              role: data.user.user_metadata?.role || 'user'
            }
            
            set({
              user: userData,
              token: data.session?.access_token || '',
              isAuthenticated: true,
              isLoading: false,
            })
            return { success: true }
          } else {
            set({ isLoading: false })
            return { success: false, error: 'Registration failed. Please try again.' }
          }
        } catch (error: any) {
          set({ isLoading: false })
          let errorMessage = 'Network error. Please check your connection.'
          
          if (error?.message?.includes('timeout') || error?.message?.includes('Failed to fetch')) {
            errorMessage = 'Connection timeout. Please check your internet connection and try again.'
          }
          
          return { success: false, error: errorMessage }
        }
      },

      setUser: (user: User | null) => {
        set({ 
          user, 
          isAuthenticated: !!user,
          isLoading: false 
        })
      },

      setToken: (token: string | null) => {
        set({ token })
      },

      setLoading: (loading: boolean) => {
        set({ isLoading: loading })
      },

      checkAuth: async () => {
        try {
          set({ isLoading: true })
          
          // Initialize auth state with retry logic
          const initializeAuth = async (retryCount = 0) => {
            try {
              const { data: { session }, error } = await supabase.auth.getSession()
              
              if (error) {
                throw error
              }
              
              if (session?.user) {
                const userData = {
                  id: session.user.id,
                  email: session.user.email || '',
                  full_name: session.user.user_metadata?.full_name || '',
                  organization: session.user.user_metadata?.organization || '',
                  role: session.user.user_metadata?.role || 'user'
                }
                
                set({
                  user: userData,
                  token: session.access_token || '',
                  isAuthenticated: true,
                  isLoading: false,
                })
              } else {
                set({ isLoading: false })
              }
            } catch (error) {
              console.error('Auth initialization error:', error)
              
              // Retry on connection timeout errors
              if (retryCount < 3 && (error as any)?.message?.includes('timeout')) {
                console.log(`Retrying auth initialization... (${retryCount + 1}/3)`)
                setTimeout(() => initializeAuth(retryCount + 1), 2000)
                return
              }
              
              // Fallback to unauthenticated state
              set({ isLoading: false })
            }
          }
          initializeAuth()
        } catch (error) {
          console.error('Auth check error:', error)
          set({
            user: null,
            token: null,
            isAuthenticated: false,
            isLoading: false,
          })
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
)
