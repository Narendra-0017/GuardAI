import React from 'react'
import { CreditCard, AlertTriangle, CheckCircle, XCircle } from 'lucide-react'

interface TransactionTableProps {
  transactions: any[]
  isLoading: boolean
}

export const TransactionTable: React.FC<TransactionTableProps> = ({ 
  transactions, 
  isLoading 
}) => {
  const getVerdictIcon = (verdict: string) => {
    switch (verdict) {
      case 'SAFE': return <CheckCircle className="w-4 h-4 text-success" />
      case 'SUSPICIOUS': return <AlertTriangle className="w-4 h-4 text-warning" />
      case 'FRAUD': return <XCircle className="w-4 h-4 text-error" />
      default: return null
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

  if (isLoading) {
    return (
      <div className="bg-dark-card border border-dark-border rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4">Recent Transactions</h3>
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="p-3 bg-dark-bg rounded-lg">
              <div className="h-4 bg-dark-border rounded w-3/4 mb-2 loading-skeleton"></div>
              <div className="h-3 bg-dark-border rounded w-1/2 loading-skeleton"></div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="bg-dark-card border border-dark-border rounded-lg p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">Recent Transactions</h3>
        <button className="text-sm text-primary-cyan hover:text-primary-cyan/80 transition-colors">
          View All
        </button>
      </div>

      <div className="space-y-3">
        {transactions.length === 0 ? (
          <div className="text-center py-8">
            <CreditCard className="w-12 h-12 text-dark-muted mx-auto mb-4" />
            <p className="text-dark-muted">No transactions yet</p>
          </div>
        ) : (
          transactions.slice(0, 5).map((transaction: any) => (
            <div 
              key={transaction.id} 
              className="p-3 bg-dark-bg rounded-lg hover:bg-dark-border transition-colors cursor-pointer"
            >
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2">
                    <span className="font-mono text-sm">
                      {transaction.transaction_id?.slice(0, 8)}...
                    </span>
                    {getVerdictIcon(transaction.verdict)}
                  </div>
                  <div className="text-sm text-dark-muted mt-1">
                    ${transaction.amount?.toFixed(2)} {transaction.merchant && `· ${transaction.merchant}`}
                  </div>
                </div>
                
                <div className="text-right">
                  <div className={`text-sm font-medium ${getVerdictColor(transaction.verdict)}`}>
                    {transaction.verdict}
                  </div>
                  <div className="text-xs text-dark-muted">
                    {new Date(transaction.timestamp).toLocaleTimeString()}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
