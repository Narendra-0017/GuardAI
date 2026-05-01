import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  CreditCard, 
  Search, 
  Filter, 
  Download, 
  Upload,
  AlertTriangle,
  CheckCircle,
  XCircle
} from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { transactionAPI } from '../lib/api'
import toast from 'react-hot-toast'

export const Transactions: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [filter, setFilter] = useState('all')
  const [page, setPage] = useState(1)

  // Fetch transactions
  const { data: transactions, isLoading, refetch } = useQuery({
    queryKey: ['transactions', page, filter],
    queryFn: () => transactionAPI.getTransactions({ 
      limit: 20, 
      offset: (page - 1) * 20,
      verdict: filter === 'all' ? undefined : filter
    }),
  })

  const handleCSVUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    try {
      const formData = new FormData()
      formData.append('file', file)
      
      const result = await transactionAPI.uploadCSV(file)
      toast.success(`Successfully processed ${result.data.processed_count} transactions`)
      refetch()
    } catch (error) {
      toast.error('Failed to upload CSV')
    }
  }

  const getVerdictColor = (verdict: string) => {
    switch (verdict) {
      case 'SAFE': return 'text-success'
      case 'SUSPICIOUS': return 'text-warning'
      case 'FRAUD': return 'text-error'
      default: return 'text-dark-muted'
    }
  }

  const getVerdictIcon = (verdict: string) => {
    switch (verdict) {
      case 'SAFE': return <CheckCircle className="w-4 h-4" />
      case 'SUSPICIOUS': return <AlertTriangle className="w-4 h-4" />
      case 'FRAUD': return <XCircle className="w-4 h-4" />
      default: return null
    }
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Transactions</h1>
          <p className="text-dark-muted">Monitor and analyze transaction fraud</p>
        </div>
        
        <div className="flex items-center space-x-3">
          {/* CSV Upload */}
          <label className="btn-secondary cursor-pointer">
            <Upload className="w-4 h-4 mr-2" />
            Upload CSV
            <input
              type="file"
              accept=".csv"
              onChange={handleCSVUpload}
              className="hidden"
            />
          </label>
          
          {/* Export */}
          <button className="btn-secondary">
            <Download className="w-4 h-4 mr-2" />
            Export
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
                placeholder="Search transactions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-dark-bg border border-dark-border rounded-lg text-white placeholder-dark-muted focus:outline-none focus:border-primary-cyan focus:ring-2 focus:ring-primary-cyan/20 transition-all duration-300"
              />
            </div>
          </div>

          {/* Filter Dropdown */}
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-dark-muted" />
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="px-4 py-2 bg-dark-bg border border-dark-border rounded-lg text-white focus:outline-none focus:border-primary-cyan focus:ring-2 focus:ring-primary-cyan/20 transition-all duration-300"
            >
              <option value="all">All Transactions</option>
              <option value="SAFE">Safe</option>
              <option value="SUSPICIOUS">Suspicious</option>
              <option value="FRAUD">Fraud</option>
            </select>
          </div>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-dark-card border border-dark-border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-dark-bg border-b border-dark-border">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-dark-muted uppercase tracking-wider">
                  Transaction ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-dark-muted uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-dark-muted uppercase tracking-wider">
                  Merchant
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-dark-muted uppercase tracking-wider">
                  Location
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-dark-muted uppercase tracking-wider">
                  Risk Score
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-dark-muted uppercase tracking-wider">
                  Verdict
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-dark-muted uppercase tracking-wider">
                  Time
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-dark-muted uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-dark-border">
              {isLoading ? (
                // Loading skeleton
                Array.from({ length: 10 }).map((_, i) => (
                  <tr key={i}>
                    <td className="px-6 py-4">
                      <div className="h-4 bg-dark-border rounded w-24 loading-skeleton"></div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="h-4 bg-dark-border rounded w-16 loading-skeleton"></div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="h-4 bg-dark-border rounded w-20 loading-skeleton"></div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="h-4 bg-dark-border rounded w-16 loading-skeleton"></div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="h-4 bg-dark-border rounded w-12 loading-skeleton"></div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="h-4 bg-dark-border rounded w-16 loading-skeleton"></div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="h-4 bg-dark-border rounded w-20 loading-skeleton"></div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="h-4 bg-dark-border rounded w-12 loading-skeleton"></div>
                    </td>
                  </tr>
                ))
              ) : (
                transactions?.data?.map((transaction: any) => (
                  <motion.tr
                    key={transaction.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="hover:bg-dark-bg transition-colors"
                  >
                    <td className="px-6 py-4 text-sm font-mono">
                      {transaction.transaction_id}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      ${transaction.amount.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      {transaction.merchant || 'N/A'}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      {transaction.location || 'Online'}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <div className="flex items-center space-x-2">
                        <div className="w-full max-w-20 bg-dark-border rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full ${
                              transaction.risk_score > 0.7 ? 'bg-error' :
                              transaction.risk_score > 0.4 ? 'bg-warning' : 'bg-success'
                            }`}
                            style={{ width: `${(transaction.risk_score || 0) * 100}%` }}
                          ></div>
                        </div>
                        <span className="text-xs">
                          {((transaction.risk_score || 0) * 100).toFixed(0)}%
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <div className={`flex items-center space-x-2 ${getVerdictColor(transaction.verdict)}`}>
                        {getVerdictIcon(transaction.verdict)}
                        <span>{transaction.verdict || 'PENDING'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-dark-muted">
                      {new Date(transaction.timestamp).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <button className="text-primary-cyan hover:text-primary-cyan/80 transition-colors">
                        View Details
                      </button>
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-6 py-4 border-t border-dark-border">
          <div className="flex items-center justify-between">
            <div className="text-sm text-dark-muted">
              Showing {transactions?.data?.length || 0} of {transactions?.total || 0} transactions
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
                disabled={!transactions?.has_more}
                className="px-3 py-1 text-sm border border-dark-border rounded hover:bg-dark-border disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
