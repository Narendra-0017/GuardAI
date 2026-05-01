import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Brain, Bot, Activity, CheckCircle, AlertTriangle } from 'lucide-react'

interface AgentThinkingPanelProps {
  isActive: boolean
  transaction: any
}

interface AgentStep {
  agent: string
  status: 'pending' | 'running' | 'completed' | 'error'
  message: string
  icon: React.ReactNode
}

export const AgentThinkingPanel: React.FC<AgentThinkingPanelProps> = ({ 
  isActive, 
  transaction 
}) => {
  const [currentStep, setCurrentStep] = useState(0)
  const [agentSteps, setAgentSteps] = useState<AgentStep[]>([
    {
      agent: 'Orchestrator',
      status: 'pending',
      message: 'Initializing fraud detection pipeline...',
      icon: <Brain className="w-4 h-4" />
    },
    {
      agent: 'Detection Agent',
      status: 'pending',
      message: 'Analyzing transaction patterns...',
      icon: <Bot className="w-4 h-4" />
    },
    {
      agent: 'Profiling Agent',
      status: 'pending',
      message: 'Checking user behavior patterns...',
      icon: <Activity className="w-4 h-4" />
    },
    {
      agent: 'Explainability Agent',
      status: 'pending',
      message: 'Generating investigation report...',
      icon: <AlertTriangle className="w-4 h-4" />
    },
    {
      agent: 'Decision Agent',
      status: 'pending',
      message: 'Calculating final verdict...',
      icon: <CheckCircle className="w-4 h-4" />
    }
  ])

  useEffect(() => {
    if (isActive && transaction) {
      // Reset steps
      setAgentSteps(steps => steps.map(step => ({ ...step, status: 'pending' })))
      setCurrentStep(0)

      // Simulate agent execution
      const interval = setInterval(() => {
        setCurrentStep(prev => {
          const nextStep = prev + 1
          
          if (nextStep <= agentSteps.length) {
            setAgentSteps(steps => 
              steps.map((step, index) => {
                if (index === nextStep - 1) {
                  return { ...step, status: 'completed' }
                } else if (index === nextStep && nextStep < agentSteps.length) {
                  return { ...step, status: 'running' }
                }
                return step
              })
            )
          }
          
          if (nextStep >= agentSteps.length) {
            clearInterval(interval)
          }
          
          return nextStep
        })
      }, 1500)

      return () => clearInterval(interval)
    }
  }, [isActive, transaction])

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'running':
        return <div className="w-4 h-4 border-2 border-primary-cyan border-t-transparent rounded-full animate-spin"></div>
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-success" />
      case 'error':
        return <AlertTriangle className="w-4 h-4 text-error" />
      default:
        return <div className="w-4 h-4 border-2 border-dark-border rounded-full"></div>
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'running': return 'text-primary-cyan'
      case 'completed': return 'text-success'
      case 'error': return 'text-error'
      default: return 'text-dark-muted'
    }
  }

  return (
    <div className="bg-dark-card border border-dark-border rounded-lg p-6">
      <h2 className="text-lg font-semibold mb-4 flex items-center space-x-2">
        <Brain className="w-5 h-5 text-primary-cyan" />
        <span>AI Agent Pipeline</span>
      </h2>

      {!isActive && !transaction ? (
        <div className="text-center py-8">
          <Brain className="w-12 h-12 text-dark-muted mx-auto mb-4" />
          <p className="text-dark-muted">
            Submit a transaction to see the AI agents in action
          </p>
        </div>
      ) : isActive ? (
        <div className="space-y-4">
          {agentSteps.map((step, index) => (
            <motion.div
              key={step.agent}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`flex items-center space-x-3 p-3 rounded-lg ${
                step.status === 'running' ? 'bg-primary-cyan/10 border border-primary-cyan/20' :
                step.status === 'completed' ? 'bg-success/10 border border-success/20' :
                'bg-dark-bg border border-dark-border'
              }`}
            >
              {/* Agent Icon */}
              <div className={`p-2 rounded-lg ${
                step.status === 'running' ? 'bg-primary-cyan/20' :
                step.status === 'completed' ? 'bg-success/20' :
                'bg-dark-border'
              }`}>
                {step.icon}
              </div>

              {/* Agent Info */}
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className={`font-medium ${getStatusColor(step.status)}`}>
                    {step.agent}
                  </span>
                  {getStatusIcon(step.status)}
                </div>
                <p className={`text-sm ${getStatusColor(step.status)}`}>
                  {step.message}
                </p>
              </div>
            </motion.div>
          ))}

          {/* Progress Bar */}
          <div className="mt-4">
            <div className="flex items-center justify-between text-sm text-dark-muted mb-2">
              <span>Analysis Progress</span>
              <span>{Math.round((currentStep / agentSteps.length) * 100)}%</span>
            </div>
            <div className="w-full bg-dark-border rounded-full h-2">
              <motion.div
                className="bg-gradient-to-r from-primary-cyan to-primary-purple h-2 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${(currentStep / agentSteps.length) * 100}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
          </div>

          {/* Tech Stack Info */}
          <div className="mt-4 p-3 bg-dark-bg rounded-lg border border-dark-border">
            <div className="text-xs text-dark-muted space-y-1">
              <div className="flex items-center justify-between">
                <span>Framework:</span>
                <span className="text-primary-cyan">LangGraph</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Model:</span>
                <span className="text-primary-cyan">XGBoost + Groq LLM</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Response Time:</span>
                <span className="text-primary-cyan">&lt;200ms</span>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          <div className={`p-5 rounded-lg border ${
            transaction.verdict === 'SAFE' ? 'bg-success/10 border-success/30' :
            transaction.verdict === 'FRAUD' ? 'bg-error/10 border-error/30' :
            'bg-warning/10 border-warning/30'
          }`}>
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-medium text-dark-muted">Final Verdict</span>
              <div className={`flex items-center space-x-2 font-bold text-lg ${
                transaction.verdict === 'SAFE' ? 'text-success' :
                transaction.verdict === 'FRAUD' ? 'text-error' :
                'text-warning'
              }`}>
                {transaction.verdict === 'SAFE' && <CheckCircle className="w-5 h-5" />}
                {transaction.verdict === 'FRAUD' && <AlertTriangle className="w-5 h-5" />}
                {transaction.verdict === 'SUSPICIOUS' && <Activity className="w-5 h-5" />}
                <span>{transaction.verdict}</span>
              </div>
            </div>
            
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-medium text-dark-muted">Risk Score</span>
              <span className="font-mono font-bold text-white">
                {(transaction.risk_score * 100).toFixed(2)}%
              </span>
            </div>

            {transaction.investigation_report && (
              <div className="mt-4 pt-4 border-t border-dark-border/50">
                <p className="text-sm font-medium text-dark-muted mb-2">AI Investigation Report</p>
                <p className="text-sm text-white/90 leading-relaxed">
                  {transaction.investigation_report}
                </p>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </div>
  )
}
