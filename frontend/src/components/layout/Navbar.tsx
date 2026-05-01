import React from 'react'
import { motion } from 'framer-motion'
import { Shield, Bell, Search, User, LogOut, Menu } from 'lucide-react'
import { useAuthStore } from '../../store/authStore'

export const Navbar: React.FC = () => {
  const { user, logout } = useAuthStore()

  return (
    <nav className="bg-dark-card border-b border-dark-border px-4 sm:px-6 lg:px-8">
      <div className="flex justify-between items-center h-16">
        {/* Logo */}
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gradient-to-br from-primary-cyan to-primary-purple rounded-lg flex items-center justify-center">
            <Shield className="w-5 h-5 text-white" />
          </div>
          <span className="text-lg font-bold">GuardAI</span>
        </div>

        {/* Search Bar */}
        <div className="hidden md:flex flex-1 max-w-md mx-8">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-dark-muted" />
            <input
              type="text"
              placeholder="Search transactions..."
              className="w-full pl-10 pr-4 py-2 bg-dark-bg border border-dark-border rounded-lg text-white placeholder-dark-muted focus:outline-none focus:border-primary-cyan focus:ring-2 focus:ring-primary-cyan/20 transition-all duration-300"
            />
          </div>
        </div>

        {/* Right Side Actions */}
        <div className="flex items-center space-x-4">
          {/* Notifications */}
          <button className="relative p-2 text-dark-muted hover:text-white transition-colors">
            <Bell className="w-5 h-5" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-primary-cyan rounded-full"></span>
          </button>

          {/* User Menu */}
          <div className="flex items-center space-x-3">
            <div className="hidden sm:block text-right">
              <p className="text-sm font-medium text-white">{user?.full_name || 'User'}</p>
              <p className="text-xs text-dark-muted">{user?.role || 'Analyst'}</p>
            </div>
            
            <div className="w-8 h-8 bg-gradient-to-br from-primary-cyan to-primary-purple rounded-full flex items-center justify-center">
              <User className="w-4 h-4 text-white" />
            </div>
            
            <button
              onClick={logout}
              className="p-2 text-dark-muted hover:text-white transition-colors"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>

          {/* Mobile Menu */}
          <button className="md:hidden p-2 text-dark-muted hover:text-white transition-colors">
            <Menu className="w-5 h-5" />
          </button>
        </div>
      </div>
    </nav>
  )
}
