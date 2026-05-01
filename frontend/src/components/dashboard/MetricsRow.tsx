import React from 'react'
import { 
  TrendingUp, 
  Shield, 
  Activity, 
  Users,
  AlertTriangle,
  CheckCircle,
  Clock
} from 'lucide-react'

interface MetricsRowProps {
  metrics: any
  isLoading: boolean
}

export const MetricsRow: React.FC<MetricsRowProps> = ({ metrics, isLoading }) => {
  const metricsData = [
    {
      title: 'Total Transactions',
      value: metrics?.total_transactions || 0,
      change: '+12%',
      icon: Activity,
      color: 'text-primary-cyan'
    },
    {
      title: 'Fraud Detected',
      value: metrics?.fraud_count || 0,
      change: '+5%',
      icon: AlertTriangle,
      color: 'text-error'
    },
    {
      title: 'Safe Transactions',
      value: metrics?.safe_count || 0,
      change: '+15%',
      icon: CheckCircle,
      color: 'text-success'
    },
    {
      title: 'Avg Response Time',
      value: `${metrics?.avg_processing_time_ms || 0}ms`,
      change: '-8%',
      icon: Clock,
      color: 'text-warning'
    }
  ]

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-dark-card border border-dark-border rounded-lg p-6">
            <div className="h-4 bg-dark-border rounded w-1/2 mb-4 loading-skeleton"></div>
            <div className="h-8 bg-dark-border rounded w-3/4 mb-2 loading-skeleton"></div>
            <div className="h-3 bg-dark-border rounded w-1/3 loading-skeleton"></div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {metricsData.map((metric, index) => (
        <div key={index} className="bg-dark-card border border-dark-border rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <metric.icon className={`w-5 h-5 ${metric.color}`} />
            <span className="text-xs text-success bg-success/10 px-2 py-1 rounded">
              {metric.change}
            </span>
          </div>
          
          <div className="space-y-1">
            <div className="text-2xl font-bold text-white">
              {metric.value.toLocaleString()}
            </div>
            <div className="text-sm text-dark-muted">
              {metric.title}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
