import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  Users as UsersIcon, 
  Search, 
  Filter, 
  Plus, 
  Shield, 
  AlertTriangle,
  CheckCircle,
  MoreVertical,
  Mail,
  Calendar
} from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import toast from 'react-hot-toast'

export const Users: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [filter, setFilter] = useState('all')
  const [page, setPage] = useState(1)

  // Mock users data
  const users = [
    {
      id: '1',
      name: 'John Doe',
      email: 'john.doe@example.com',
      role: 'admin',
      status: 'active',
      last_login: '2024-01-21T10:30:00Z',
      transactions_count: 145,
      risk_score: 0.15
    },
    {
      id: '2',
      name: 'Jane Smith',
      email: 'jane.smith@example.com',
      role: 'analyst',
      status: 'active',
      last_login: '2024-01-21T09:15:00Z',
      transactions_count: 89,
      risk_score: 0.08
    },
    {
      id: '3',
      name: 'Bob Johnson',
      email: 'bob.johnson@example.com',
      role: 'user',
      status: 'suspended',
      last_login: '2024-01-18T14:20:00Z',
      transactions_count: 234,
      risk_score: 0.72
    },
    {
      id: '4',
      name: 'Alice Brown',
      email: 'alice.brown@example.com',
      role: 'analyst',
      status: 'active',
      last_login: '2024-01-21T11:45:00Z',
      transactions_count: 167,
      risk_score: 0.12
    },
    {
      id: '5',
      name: 'Charlie Wilson',
      email: 'charlie.wilson@example.com',
      role: 'user',
      status: 'active',
      last_login: '2024-01-20T16:30:00Z',
      transactions_count: 78,
      risk_score: 0.25
    }
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-success'
      case 'suspended': return 'text-error'
      case 'pending': return 'text-warning'
      default: return 'text-dark-muted'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <CheckCircle className="w-4 h-4" />
      case 'suspended': return <AlertTriangle className="w-4 h-4" />
      case 'pending': return <AlertTriangle className="w-4 h-4" />
      default: return null
    }
  }

  const getRiskColor = (score: number) => {
    if (score > 0.7) return 'text-error'
    if (score > 0.4) return 'text-warning'
    return 'text-success'
  }

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-primary-cyan/10 text-primary-cyan border border-primary-cyan/20'
      case 'analyst': return 'bg-primary-purple/10 text-primary-purple border border-primary-purple/20'
      case 'user': return 'bg-dark-bg text-dark-muted border border-dark-border'
      default: return 'bg-dark-bg text-dark-muted border border-dark-border'
    }
  }

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFilter = filter === 'all' || user.status === filter
    return matchesSearch && matchesFilter
  })

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">User Management</h1>
          <p className="text-dark-muted">Manage users and their access permissions</p>
        </div>
        
        <button className="btn-primary">
          <Plus className="w-4 h-4 mr-2" />
          Add User
        </button>
      </div>

      {/* Filters */}
      <div className="bg-dark-card border border-dark-border rounded-lg p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-dark-muted" />
              <input
                type="text"
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-dark-bg border border-dark-border rounded-lg text-white placeholder-dark-muted focus:outline-none focus:border-primary-cyan focus:ring-2 focus:ring-primary-cyan/20 transition-all duration-300"
              />
            </div>
          </div>

          {/* Status Filter */}
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="px-4 py-2 bg-dark-bg border border-dark-border rounded-lg text-white focus:outline-none focus:border-primary-cyan focus:ring-2 focus:ring-primary-cyan/20 transition-all duration-300"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="suspended">Suspended</option>
            <option value="pending">Pending</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-dark-card border border-dark-border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-dark-bg border-b border-dark-border">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-dark-muted uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-dark-muted uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-dark-muted uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-dark-muted uppercase tracking-wider">
                  Transactions
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-dark-muted uppercase tracking-wider">
                  Risk Score
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-dark-muted uppercase tracking-wider">
                  Last Login
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-dark-muted uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-dark-border">
              {filteredUsers.map((user) => (
                <motion.tr
                  key={user.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="hover:bg-dark-bg transition-colors"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-primary-cyan to-primary-purple rounded-full flex items-center justify-center text-white font-medium">
                        {user.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div>
                        <div className="text-sm font-medium">{user.name}</div>
                        <div className="text-sm text-dark-muted">{user.email}</div>
                      </div>
                    </div>
                  </td>
                  
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 text-xs rounded-full ${getRoleBadge(user.role)}`}>
                      {user.role}
                    </span>
                  </td>
                  
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(user.status)}
                      <span className={`text-sm font-medium ${getStatusColor(user.status)}`}>
                        {user.status}
                      </span>
                    </div>
                  </td>
                  
                  <td className="px-6 py-4 text-sm">
                    {user.transactions_count.toLocaleString()}
                  </td>
                  
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                      <div className="w-full max-w-16 bg-dark-border rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full ${
                            user.risk_score > 0.7 ? 'bg-error' :
                            user.risk_score > 0.4 ? 'bg-warning' : 'bg-success'
                          }`}
                          style={{ width: `${user.risk_score * 100}%` }}
                        ></div>
                      </div>
                      <span className={`text-xs ${getRiskColor(user.risk_score)}`}>
                        {(user.risk_score * 100).toFixed(0)}%
                      </span>
                    </div>
                  </td>
                  
                  <td className="px-6 py-4 text-sm text-dark-muted">
                    {new Date(user.last_login).toLocaleDateString()}
                  </td>
                  
                  <td className="px-6 py-4">
                    <button className="text-dark-muted hover:text-white transition-colors">
                      <MoreVertical className="w-4 h-4" />
                    </button>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-6 py-4 border-t border-dark-border">
          <div className="flex items-center justify-between">
            <div className="text-sm text-dark-muted">
              Showing {filteredUsers.length} of {users.length} users
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page === 1}
                className="px-3 py-1 text-sm border border-dark-border rounded hover:bg-dark-border disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Previous
              </button>
              <span className="px-3 py-1 text-sm">
                Page {page}
              </span>
              <button
                onClick={() => setPage(page + 1)}
                disabled={filteredUsers.length < 10}
                className="px-3 py-1 text-sm border border-dark-border rounded hover:bg-dark-border disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* User Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-dark-card border border-dark-border rounded-lg p-6 text-center">
          <div className="text-2xl font-bold text-primary-cyan">{users.length}</div>
          <div className="text-sm text-dark-muted">Total Users</div>
        </div>
        
        <div className="bg-dark-card border border-dark-border rounded-lg p-6 text-center">
          <div className="text-2xl font-bold text-success">
            {users.filter(u => u.status === 'active').length}
          </div>
          <div className="text-sm text-dark-muted">Active Users</div>
        </div>
        
        <div className="bg-dark-card border border-dark-border rounded-lg p-6 text-center">
          <div className="text-2xl font-bold text-error">
            {users.filter(u => u.risk_score > 0.7).length}
          </div>
          <div className="text-sm text-dark-muted">High Risk</div>
        </div>
        
        <div className="bg-dark-card border border-dark-border rounded-lg p-6 text-center">
          <div className="text-2xl font-bold text-warning">
            {users.filter(u => u.status === 'suspended').length}
          </div>
          <div className="text-sm text-dark-muted">Suspended</div>
        </div>
      </div>
    </div>
  )
}
