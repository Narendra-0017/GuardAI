import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'react-hot-toast'

// Layout components
import { Navbar } from './components/layout/Navbar'
import { Sidebar } from './components/layout/Sidebar'

// Page components
import { LandingPage } from './pages/landing/LandingPage'
import { LoginPage } from './pages/LoginPage'
import { RegisterPage } from './pages/RegisterPage'
import { Dashboard } from './pages/dashboard/Dashboard'
import { EmailAnalyzer } from './pages/email/EmailAnalyzer'
import { Transactions } from './pages/Transactions'
import { Reports } from './pages/Reports'

// Hooks and stores
import { useAuthStore } from './store/authStore'

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
})

function App() {
  const { user, isLoading } = useAuthStore()

  if (isLoading) {
    return (
      <div className="min-h-screen bg-dark-bg flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-cyan"></div>
      </div>
    )
  }

  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <div className="min-h-screen bg-dark-bg text-dark-text">
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#1A1F2E',
                color: '#E4E4E7',
                border: '1px solid #2A2F3E',
              },
              success: {
                iconTheme: {
                  primary: '#10B981',
                  secondary: '#1A1F2E',
                },
              },
              error: {
                iconTheme: {
                  primary: '#EF4444',
                  secondary: '#1A1F2E',
                },
              },
            }}
          />
          
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            
            {/* Protected routes */}
            <Route
              path="/dashboard"
              element={
                user ? (
                  <div className="flex">
                    <Sidebar />
                    <div className="flex-1">
                      <Navbar />
                      <Dashboard />
                    </div>
                  </div>
                ) : (
                  <Navigate to="/login" replace />
                )
              }
            />
            
            <Route
              path="/transactions"
              element={
                user ? (
                  <div className="flex">
                    <Sidebar />
                    <div className="flex-1">
                      <Navbar />
                      <Transactions />
                    </div>
                  </div>
                ) : (
                  <Navigate to="/login" replace />
                )
              }
            />
            
            <Route
              path="/email-analyzer"
              element={
                user ? (
                  <div className="flex">
                    <Sidebar />
                    <div className="flex-1">
                      <Navbar />
                      <EmailAnalyzer />
                    </div>
                  </div>
                ) : (
                  <Navigate to="/login" replace />
                )
              }
            />
            
            <Route
              path="/reports"
              element={
                user ? (
                  <div className="flex">
                    <Sidebar />
                    <div className="flex-1">
                      <Navbar />
                      <Reports />
                    </div>
                  </div>
                ) : (
                  <Navigate to="/login" replace />
                )
              }
            />
            
            {/* Catch all */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </Router>
    </QueryClientProvider>
  )
}

export default App
