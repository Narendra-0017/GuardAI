import React from 'react'
import { Shield, AlertTriangle } from 'lucide-react'

interface ThreatLevelIndicatorProps {
  level: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
}

export const ThreatLevelIndicator: React.FC<ThreatLevelIndicatorProps> = ({ level }) => {
  const getLevelColor = (level: string) => {
    switch (level) {
      case 'LOW': return 'text-success'
      case 'MEDIUM': return 'text-warning'
      case 'HIGH': return 'text-error'
      case 'CRITICAL': return 'text-error animate-pulse'
      default: return 'text-dark-muted'
    }
  }

  const getLevelBg = (level: string) => {
    switch (level) {
      case 'LOW': return 'bg-success/10 border-success/20'
      case 'MEDIUM': return 'bg-warning/10 border-warning/20'
      case 'HIGH': return 'bg-error/10 border-error/20'
      case 'CRITICAL': return 'bg-error/20 border-error/40 animate-pulse'
      default: return 'bg-dark-bg border-dark-border'
    }
  }

  return (
    <div className={`flex items-center space-x-3 px-4 py-2 rounded-lg border ${getLevelBg(level)}`}>
      {level === 'CRITICAL' ? (
        <AlertTriangle className={`w-5 h-5 ${getLevelColor(level)}`} />
      ) : (
        <Shield className={`w-5 h-5 ${getLevelColor(level)}`} />
      )}
      <div>
        <div className={`text-sm font-medium ${getLevelColor(level)}`}>
          Threat Level
        </div>
        <div className={`text-xs ${getLevelColor(level)}`}>
          {level}
        </div>
      </div>
    </div>
  )
}
