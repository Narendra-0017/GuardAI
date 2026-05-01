import React from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { 
  LayoutDashboard, 
  CreditCard, 
  Mail, 
  FileText, 
  Settings, 
  Shield,
  BarChart3,
  Users,
  Database
} from 'lucide-react'

export const Sidebar: React.FC = () => {
  const location = useLocation()

  const menuItems = [
    {
      title: 'Dashboard',
      icon: LayoutDashboard,
      path: '/dashboard',
      description: 'Overview & Analytics'
    },
    {
      title: 'Transactions',
      icon: CreditCard,
      path: '/transactions',
      description: 'Fraud Detection'
    },
    {
      title: 'Email Analyzer',
      icon: Mail,
      path: '/email-analyzer',
      description: 'Phishing Detection'
    },
    {
      title: 'Reports',
      icon: FileText,
      path: '/reports',
      description: 'Investigation Reports'
    }
  ]

  return (
    <aside className="w-64 bg-dark-card border-r border-dark-border h-screen sticky top-0 overflow-y-auto scrollbar-custom">
      {/* Logo Section */}
      <div className="p-6 border-b border-dark-border">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-primary-cyan to-primary-purple rounded-lg flex items-center justify-center">
            <Shield className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold">GuardAI</h1>
            <p className="text-xs text-dark-muted">Fraud Detection Platform</p>
          </div>
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="p-4">
        <ul className="space-y-2">
          {menuItems.map((item) => (
            <li key={item.path}>
              <NavLink
                to={item.path}
                className={({ isActive }) => `
                  group flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200
                  ${isActive 
                    ? 'bg-primary-cyan/10 text-primary-cyan border-l-2 border-primary-cyan' 
                    : 'text-dark-muted hover:text-white hover:bg-dark-border'
                  }
                `}
              >
                <item.icon className="w-5 h-5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="font-medium truncate">{item.title}</div>
                  <div className="text-xs opacity-70 truncate">{item.description}</div>
                </div>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      {/* Quick Stats */}
      <div className="p-4 border-t border-dark-border">
        <h3 className="text-sm font-medium text-dark-muted mb-3">System Status</h3>
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-dark-muted">AI Agents</span>
            <span className="text-success">Active</span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-dark-muted">Processing</span>
            <span className="text-warning">2.4K/sec</span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-dark-muted">Accuracy</span>
            <span className="text-primary-cyan">99.3%</span>
          </div>
        </div>
      </div>

      {/* Version Info */}
      <div className="p-4 border-t border-dark-border">
        <div className="text-xs text-dark-muted text-center">
          <p>GuardAI v1.0.0</p>
          <p className="mt-1">© 2024 Final Year Project</p>
        </div>
      </div>
    </aside>
  )
}
