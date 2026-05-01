import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  BarChart3, 
  TrendingUp, 
  Activity, 
  PieChart,
  Calendar,
  Filter,
  Download,
  RefreshCw
} from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { metricsAPI } from '../lib/api'

export const Analytics: React.FC = () => {
  const [dateRange, setDateRange] = useState('7d')
  const [chartType, setChartType] = useState('daily')

  // Fetch analytics data
  const { data: analytics, isLoading, refetch } = useQuery({
    queryKey: ['analytics', dateRange],
    queryFn: () => metricsAPI.getTransactionAnalytics(parseInt(dateRange.replace('d', ''))),
    refetchInterval: 60000, // Refresh every minute
  })

  // Mock data for charts
  const mockAnalytics = {
    daily: [
      { date: '2024-01-15', transactions: 1200, fraud: 12, success: 1188 },
      { date: '2024-01-16', transactions: 1450, fraud: 18, success: 1432 },
      { date: '2024-01-17', transactions: 1100, fraud: 8, success: 1092 },
      { date: '2024-01-18', transactions: 1600, fraud: 22, success: 1578 },
      { date: '2024-01-19', transactions: 1800, fraud: 28, success: 1772 },
      { date: '2024-01-20', transactions: 900, fraud: 6, success: 894 },
      { date: '2024-01-21', transactions: 750, fraud: 4, success: 746 }
    ],
    hourly: [
      { hour: '00:00', transactions: 45, fraud: 1, success: 44 },
      { hour: '06:00', transactions: 120, fraud: 2, success: 118 },
      { hour: '12:00', transactions: 280, fraud: 5, success: 275 },
      { hour: '18:00', transactions: 220, fraud: 4, success: 216 },
      { hour: '23:00', transactions: 65, fraud: 1, success: 64 }
    ],
    categories: [
      { name: 'Retail', transactions: 3500, fraud: 45 },
      { name: 'E-commerce', transactions: 2800, fraud: 38 },
      { name: 'Banking', transactions: 1200, fraud: 12 },
      { name: 'Gaming', transactions: 800, fraud: 18 },
      { name: 'Other', transactions: 600, fraud: 8 }
    ]
  }

  const currentData = mockAnalytics[chartType as keyof typeof mockAnalytics] || mockAnalytics.daily

  const getFraudRate = (transactions: number, fraud: number) => {
    return ((fraud / transactions) * 100).toFixed(2)
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Analytics Dashboard</h1>
          <p className="text-dark-muted">Comprehensive fraud detection analytics and insights</p>
        </div>
        
        <div className="flex items-center space-x-3">
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
          
          <button 
            onClick={() => refetch()}
            className="btn-secondary"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </button>
          
          <button className="btn-secondary">
            <Download className="w-4 h-4 mr-2" />
            Export
          </button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-dark-card border border-dark-border rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <Activity className="w-5 h-5 text-primary-cyan" />
            <span className="text-xs text-success bg-success/10 px-2 py-1 rounded">+12%</span>
          </div>
          <div className="text-2xl font-bold text-white">
            {currentData.reduce((sum, item) => sum + item.transactions, 0).toLocaleString()}
          </div>
          <div className="text-sm text-dark-muted">Total Transactions</div>
        </div>

        <div className="bg-dark-card border border-dark-border rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <TrendingUp className="w-5 h-5 text-error" />
            <span className="text-xs text-error bg-error/10 px-2 py-1 rounded">+8%</span>
          </div>
          <div className="text-2xl font-bold text-white">
            {currentData.reduce((sum, item) => sum + item.fraud, 0)}
          </div>
          <div className="text-sm text-dark-muted">Fraud Cases</div>
        </div>

        <div className="bg-dark-card border border-dark-border rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <BarChart3 className="w-5 h-5 text-warning" />
            <span className="text-xs text-success bg-success/10 px-2 py-1 rounded">-15%</span>
          </div>
          <div className="text-2xl font-bold text-white">
            {getFraudRate(
              currentData.reduce((sum, item) => sum + item.transactions, 0),
              currentData.reduce((sum, item) => sum + item.fraud, 0)
            )}%
          </div>
          <div className="text-sm text-dark-muted">Fraud Rate</div>
        </div>

        <div className="bg-dark-card border border-dark-border rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <PieChart className="w-5 h-5 text-success" />
            <span className="text-xs text-success bg-success/10 px-2 py-1 rounded">+5%</span>
          </div>
          <div className="text-2xl font-bold text-white">
            {((currentData.reduce((sum, item) => sum + ('success' in item ? item.success : 0), 0) / 
              currentData.reduce((sum, item) => sum + ('transactions' in item ? item.transactions : 0), 0)) * 100).toFixed(1)}%
          </div>
          <div className="text-sm text-dark-muted">Success Rate</div>
        </div>
      </div>

      {/* Chart Type Selector */}
      <div className="bg-dark-card border border-dark-border rounded-lg p-4">
        <div className="flex items-center space-x-4">
          <span className="text-sm font-medium">View:</span>
          <div className="flex space-x-2">
            <button
              onClick={() => setChartType('daily')}
              className={`px-4 py-2 rounded-lg text-sm transition-colors ${
                chartType === 'daily' 
                  ? 'bg-primary-cyan text-white' 
                  : 'bg-dark-bg text-dark-muted hover:text-white'
              }`}
            >
              Daily
            </button>
            <button
              onClick={() => setChartType('hourly')}
              className={`px-4 py-2 rounded-lg text-sm transition-colors ${
                chartType === 'hourly' 
                  ? 'bg-primary-cyan text-white' 
                  : 'bg-dark-bg text-dark-muted hover:text-white'
              }`}
            >
              Hourly
            </button>
            <button
              onClick={() => setChartType('categories')}
              className={`px-4 py-2 rounded-lg text-sm transition-colors ${
                chartType === 'categories' 
                  ? 'bg-primary-cyan text-white' 
                  : 'bg-dark-bg text-dark-muted hover:text-white'
              }`}
            >
              Categories
            </button>
          </div>
        </div>
      </div>

      {/* Main Chart */}
      <div className="bg-dark-card border border-dark-border rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4">Transaction Trends</h3>
        
        <div className="space-y-4">
          {currentData.map((item, index) => (
            <div key={index} className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-dark-muted">
                  {chartType === 'daily' && 'date' in item ? new Date(item.date).toLocaleDateString() :
                   chartType === 'hourly' && 'hour' in item ? item.hour : 
                   'name' in item ? item.name : 'Unknown'}
                </span>
                <div className="flex items-center space-x-4">
                  <span className="text-success">{'success' in item ? item.success : 0} success</span>
                  <span className="text-error">{'fraud' in item ? item.fraud : 0} fraud</span>
                  <span className="text-white font-medium">{'transactions' in item ? item.transactions : 0} total</span>
                </div>
              </div>
              
              <div className="flex space-x-2">
                <div className="flex-1 bg-dark-border rounded-full h-6 relative">
                  <div 
                    className="bg-success h-6 rounded-full"
                    style={{ width: `${(('success' in item ? item.success : 0) / ('transactions' in item ? item.transactions : 1)) * 100}%` }}
                  ></div>
                </div>
                <div className="flex-1 bg-dark-border rounded-full h-6 relative">
                  <div 
                    className="bg-error h-6 rounded-full"
                    style={{ width: `${(('fraud' in item ? item.fraud : 0) / ('transactions' in item ? item.transactions : 1)) * 100}%` }}
                  ></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Category Breakdown */}
      {chartType === 'categories' && (
        <div className="bg-dark-card border border-dark-border rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4">Category Performance</h3>
          
          <div className="space-y-3">
            {currentData.map((category, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-dark-bg rounded-lg">
                <div>
                  <div className="font-medium">{'name' in category ? category.name : 'Unknown'}</div>
                  <div className="text-sm text-dark-muted">
                    {'transactions' in category ? category.transactions.toLocaleString() : 0} transactions
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-medium text-error">{'fraud' in category ? category.fraud : 0} fraud</div>
                  <div className="text-sm text-dark-muted">
                    {getFraudRate('transactions' in category ? category.transactions : 0, 'fraud' in category ? category.fraud : 0)}% rate
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
