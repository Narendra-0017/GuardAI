import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  FileText, 
  Download, 
  Search, 
  Filter, 
  Calendar,
  Shield,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Eye
} from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { transactionAPI, emailAPI } from '../lib/api'

export const Reports: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [filter, setFilter] = useState('all')
  const [dateRange, setDateRange] = useState('7d')

  // Mock data for reports
  const reports = [
    {
      id: '1',
      type: 'transaction',
      title: 'Fraud Investigation Report - TXN-2024-001',
      date: '2024-01-15',
      status: 'completed',
      risk_level: 'HIGH',
      summary: 'Suspicious transaction pattern detected with multiple red flags'
    },
    {
      id: '2',
      type: 'email',
      title: 'Phishing Analysis Report - EMAIL-2024-002',
      date: '2024-01-14',
      status: 'completed',
      risk_level: 'CRITICAL',
      summary: 'Advanced phishing attempt with impersonation tactics'
    },
    {
      id: '3',
      type: 'transaction',
      title: 'Weekly Fraud Summary Report',
      date: '2024-01-13',
      status: 'completed',
      risk_level: 'MEDIUM',
      summary: 'Weekly overview of fraud detection activities and trends'
    }
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-success'
      case 'pending': return 'text-warning'
      case 'failed': return 'text-error'
      default: return 'text-dark-muted'
    }
  }

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'CRITICAL': return 'text-error'
      case 'HIGH': return 'text-warning'
      case 'MEDIUM': return 'text-info'
      case 'LOW': return 'text-success'
      default: return 'text-dark-muted'
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'transaction': return <CreditCard className="w-4 h-4" />
      case 'email': return <Mail className="w-4 h-4" />
      default: return <FileText className="w-4 h-4" />
    }
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Investigation Reports</h1>
          <p className="text-dark-muted">Detailed fraud investigation and analysis reports</p>
        </div>
        
        <div className="flex items-center space-x-3">
          <button className="btn-secondary">
            <Calendar className="w-4 h-4 mr-2" />
            Schedule Report
          </button>
          <button className="btn-primary">
            <Download className="w-4 h-4 mr-2" />
            Export All
          </button>
        </div>
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
                placeholder="Search reports..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-dark-bg border border-dark-border rounded-lg text-white placeholder-dark-muted focus:outline-none focus:border-primary-cyan focus:ring-2 focus:ring-primary-cyan/20 transition-all duration-300"
              />
            </div>
          </div>

          {/* Type Filter */}
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="px-4 py-2 bg-dark-bg border border-dark-border rounded-lg text-white focus:outline-none focus:border-primary-cyan focus:ring-2 focus:ring-primary-cyan/20 transition-all duration-300"
          >
            <option value="all">All Types</option>
            <option value="transaction">Transaction Reports</option>
            <option value="email">Email Reports</option>
            <option value="summary">Summary Reports</option>
          </select>

          {/* Date Range */}
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="px-4 py-2 bg-dark-bg border border-dark-border rounded-lg text-white focus:outline-none focus:border-primary-cyan focus:ring-2 focus:ring-primary-cyan/20 transition-all duration-300"
          >
            <option value="24h">Last 24 Hours</option>
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
            <option value="90d">Last 90 Days</option>
          </select>
        </div>
      </div>

      {/* Reports Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {reports.map((report) => (
          <motion.div
            key={report.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-dark-card border border-dark-border rounded-lg p-6 hover:border-primary-cyan/50 transition-all duration-300"
          >
            {/* Report Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-2">
                {getTypeIcon(report.type)}
                <span className="text-sm text-dark-muted capitalize">{report.type}</span>
              </div>
              <div className={`text-sm font-medium ${getRiskColor(report.risk_level)}`}>
                {report.risk_level}
              </div>
            </div>

            {/* Report Title */}
            <h3 className="font-semibold mb-2 line-clamp-2">
              {report.title}
            </h3>

            {/* Report Summary */}
            <p className="text-sm text-dark-muted mb-4 line-clamp-3">
              {report.summary}
            </p>

            {/* Report Meta */}
            <div className="flex items-center justify-between text-sm text-dark-muted mb-4">
              <span>{report.date}</span>
              <span className={`capitalize ${getStatusColor(report.status)}`}>
                {report.status}
              </span>
            </div>

            {/* Actions */}
            <div className="flex items-center space-x-2">
              <button className="flex-1 btn-secondary text-sm">
                <Eye className="w-4 h-4 mr-2" />
                View
              </button>
              <button className="flex-1 btn-secondary text-sm">
                <Download className="w-4 h-4 mr-2" />
                Download
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Report Statistics */}
      <div className="bg-dark-card border border-dark-border rounded-lg p-6">
        <h2 className="text-lg font-semibold mb-4">Report Statistics</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-primary-cyan">247</div>
            <div className="text-sm text-dark-muted">Total Reports</div>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold text-error">12</div>
            <div className="text-sm text-dark-muted">Critical Risk</div>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold text-warning">34</div>
            <div className="text-sm text-dark-muted">High Risk</div>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold text-success">201</div>
            <div className="text-sm text-dark-muted">Resolved</div>
          </div>
        </div>
      </div>

      {/* Empty State */}
      {reports.length === 0 && (
        <div className="bg-dark-card border border-dark-border rounded-lg p-12 text-center">
          <FileText className="w-12 h-12 text-dark-muted mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">No Reports Found</h3>
          <p className="text-dark-muted">
            No reports match your current filters. Try adjusting your search criteria.
          </p>
        </div>
      )}
    </div>
  )
}
