import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  Shield, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle, 
  Activity,
  Users,
  Clock,
  Zap
} from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { metricsAPI, transactionAPI } from '../../lib/api'

// Dashboard Components
import { ThreatLevelIndicator } from '../../components/dashboard/ThreatLevelIndicator'
import { MetricsRow } from '../../components/dashboard/MetricsRow'
import { TransactionForm } from '../../components/dashboard/TransactionForm'
import { AgentThinkingPanel } from '../../components/dashboard/AgentThinkingPanel'
import { TransactionTable } from '../../components/dashboard/TransactionTable'
import { ChartsSection } from '../../components/dashboard/ChartsSection'

export const Dashboard: React.FC = () => {
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [currentTransaction, setCurrentTransaction] = useState(null)

  // Fetch system metrics
  const { data: metrics, isLoading: metricsLoading } = useQuery({
    queryKey: ['system-metrics'],
    queryFn: metricsAPI.getSystemMetrics,
    refetchInterval: 30000, // Refresh every 30 seconds
  })

  // Fetch recent transactions
  const { data: transactions, isLoading: transactionsLoading } = useQuery({
    queryKey: ['recent-transactions'],
    queryFn: () => transactionAPI.getTransactions({ limit: 10 }),
    refetchInterval: 10000, // Refresh every 10 seconds
  })

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-dark-muted">Real-time fraud detection overview</p>
        </div>
        <div className="flex items-center space-x-4">
          <ThreatLevelIndicator level={metrics?.threat_level || 'LOW'} />
        </div>
      </div>

      {/* Metrics Row */}
      <MetricsRow metrics={metrics} isLoading={metricsLoading} />

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Transaction Form & Agent Panel */}
        <div className="space-y-6">
          <TransactionForm 
            isAnalyzing={isAnalyzing}
            setIsAnalyzing={setIsAnalyzing}
            setCurrentTransaction={setCurrentTransaction}
          />
          
          <AgentThinkingPanel 
            isActive={isAnalyzing}
            transaction={currentTransaction}
          />
        </div>

        {/* Right Column - Recent Transactions & Charts */}
        <div className="lg:col-span-2 space-y-6">
          <TransactionTable 
            transactions={transactions?.data || []}
            isLoading={transactionsLoading}
          />
          
          <ChartsSection metrics={metrics} />
        </div>
      </div>

      {/* System Status Bar */}
      <div className="bg-dark-card border border-dark-border rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-success rounded-full animate-pulse"></div>
              <span className="text-sm text-dark-muted">AI Agents Active</span>
            </div>
            <div className="flex items-center space-x-2">
              <Activity className="w-4 h-4 text-primary-cyan" />
              <span className="text-sm text-dark-muted">
                Processing: {metrics?.avg_processing_time_ms || 0}ms avg
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <Zap className="w-4 h-4 text-warning" />
              <span className="text-sm text-dark-muted">
                Accuracy: {metrics?.model_auc_roc ? (metrics.model_auc_roc * 100).toFixed(1) : 0}%
              </span>
            </div>
          </div>
          
          <div className="text-sm text-dark-muted">
            Last updated: {new Date().toLocaleTimeString()}
          </div>
        </div>
      </div>
    </div>
  )
}
