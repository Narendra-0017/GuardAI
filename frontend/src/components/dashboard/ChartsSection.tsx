import React from 'react'
import { BarChart3, TrendingUp, Activity, PieChart } from 'lucide-react'

interface ChartsSectionProps {
  metrics: any
}

export const ChartsSection: React.FC<ChartsSectionProps> = ({ metrics }) => {
  // Mock data for charts
  const dailyData = [
    { day: 'Mon', transactions: 1200, fraud: 12 },
    { day: 'Tue', transactions: 1450, fraud: 18 },
    { day: 'Wed', transactions: 1100, fraud: 8 },
    { day: 'Thu', transactions: 1600, fraud: 22 },
    { day: 'Fri', transactions: 1800, fraud: 28 },
    { day: 'Sat', transactions: 900, fraud: 6 },
    { day: 'Sun', transactions: 750, fraud: 4 }
  ]

  const verdictData = [
    { name: 'Safe', value: metrics?.safe_count || 5000, color: 'bg-success' },
    { name: 'Suspicious', value: metrics?.suspicious_count || 150, color: 'bg-warning' },
    { name: 'Fraud', value: metrics?.fraud_count || 50, color: 'bg-error' }
  ]

  const riskData = [
    { range: '0-20%', count: 3200 },
    { range: '21-40%', count: 1800 },
    { range: '41-60%', count: 900 },
    { range: '61-80%', count: 250 },
    { range: '81-100%', count: 50 }
  ]

  return (
    <div className="bg-dark-card border border-dark-border rounded-lg p-6">
      <h3 className="text-lg font-semibold mb-4">Analytics Overview</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Daily Transactions Chart */}
        <div className="space-y-3">
          <div className="flex items-center space-x-2">
            <BarChart3 className="w-4 h-4 text-primary-cyan" />
            <span className="text-sm font-medium">Daily Transactions</span>
          </div>
          
          <div className="space-y-2">
            {dailyData.map((data) => (
              <div key={data.day} className="flex items-center space-x-2">
                <span className="text-xs text-dark-muted w-8">{data.day}</span>
                <div className="flex-1">
                  <div className="relative">
                    <div className="w-full bg-dark-border rounded-full h-4">
                      <div 
                        className="bg-gradient-to-r from-primary-cyan to-primary-purple h-4 rounded-full"
                        style={{ width: `${(data.transactions / 1800) * 100}%` }}
                      ></div>
                    </div>
                    {data.fraud > 0 && (
                      <div className="absolute top-0 right-0 bg-error rounded-full h-2 w-2"></div>
                    )}
                  </div>
                </div>
                <span className="text-xs text-dark-muted w-12 text-right">
                  {data.transactions}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Verdict Distribution */}
        <div className="space-y-3">
          <div className="flex items-center space-x-2">
            <PieChart className="w-4 h-4 text-primary-cyan" />
            <span className="text-sm font-medium">Verdict Distribution</span>
          </div>
          
          <div className="space-y-2">
            {verdictData.map((item) => (
              <div key={item.name} className="flex items-center space-x-3">
                <div className={`w-3 h-3 rounded-full ${item.color}`}></div>
                <span className="text-sm text-dark-muted w-20">{item.name}</span>
                <div className="flex-1">
                  <div className="w-full bg-dark-border rounded-full h-3">
                    <div 
                      className={`${item.color} h-3 rounded-full`}
                      style={{ width: `${(item.value / 5200) * 100}%` }}
                    ></div>
                  </div>
                </div>
                <span className="text-sm text-white w-12 text-right">
                  {item.value.toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Risk Score Distribution */}
        <div className="space-y-3">
          <div className="flex items-center space-x-2">
            <Activity className="w-4 h-4 text-primary-cyan" />
            <span className="text-sm font-medium">Risk Score Distribution</span>
          </div>
          
          <div className="space-y-2">
            {riskData.map((item) => (
              <div key={item.range} className="flex items-center space-x-3">
                <span className="text-xs text-dark-muted w-12">{item.range}</span>
                <div className="flex-1">
                  <div className="w-full bg-dark-border rounded-full h-3">
                    <div 
                      className="bg-gradient-to-r from-success to-error h-3 rounded-full"
                      style={{ width: `${(item.count / 3200) * 100}%` }}
                    ></div>
                  </div>
                </div>
                <span className="text-sm text-white w-12 text-right">
                  {item.count.toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Performance Metrics */}
      <div className="mt-6 pt-4 border-t border-dark-border">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div className="text-center">
            <div className="text-lg font-bold text-primary-cyan">
              {metrics?.model_auc_roc ? (metrics.model_auc_roc * 100).toFixed(1) : '99.3'}%
            </div>
            <div className="text-xs text-dark-muted">Model Accuracy</div>
          </div>
          
          <div className="text-center">
            <div className="text-lg font-bold text-success">
              {metrics?.avg_processing_time_ms || 145}ms
            </div>
            <div className="text-xs text-dark-muted">Avg Response</div>
          </div>
          
          <div className="text-center">
            <div className="text-lg font-bold text-warning">
              {metrics?.total_transactions || 5200}
            </div>
            <div className="text-xs text-dark-muted">Total Analyzed</div>
          </div>
          
          <div className="text-center">
            <div className="text-lg font-bold text-error">
              {metrics?.fraud_rate ? (metrics.fraud_rate * 100).toFixed(2) : '1.15'}%
            </div>
            <div className="text-xs text-dark-muted">Fraud Rate</div>
          </div>
        </div>
      </div>
    </div>
  )
}
