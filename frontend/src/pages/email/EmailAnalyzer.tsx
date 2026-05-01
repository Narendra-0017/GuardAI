import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  Mail, 
  Send, 
  Shield, 
  AlertTriangle, 
  CheckCircle, 
  XCircle,
  Eye,
  Download,
  Clock
} from 'lucide-react'
import { useMutation, useQuery } from '@tanstack/react-query'
import { emailAPI } from '../../lib/api'
import toast from 'react-hot-toast'

export const EmailAnalyzer: React.FC = () => {
  const [emailData, setEmailData] = useState({
    sender_email: '',
    subject: '',
    body: ''
  })
  const [isAnalyzing, setIsAnalyzing] = useState(false)

  // Analyze email mutation
  const analyzeMutation = useMutation({
    mutationFn: emailAPI.analyze,
    onSuccess: (data) => {
      toast.success('Email analysis completed')
      setIsAnalyzing(false)
    },
    onError: (error) => {
      toast.error('Failed to analyze email')
      setIsAnalyzing(false)
    }
  })

  // Fetch recent analyses
  const { data: analyses, isLoading } = useQuery({
    queryKey: ['email-analyses'],
    queryFn: () => emailAPI.getAnalyses(10, 0),
    refetchInterval: 30000,
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!emailData.sender_email || !emailData.subject || !emailData.body) {
      toast.error('Please fill in all fields')
      return
    }

    setIsAnalyzing(true)
    analyzeMutation.mutate(emailData)
  }

  const getThreatColor = (level: string) => {
    switch (level) {
      case 'CRITICAL': return 'text-error'
      case 'HIGH': return 'text-warning'
      case 'MEDIUM': return 'text-info'
      case 'LOW': return 'text-success'
      default: return 'text-dark-muted'
    }
  }

  const getVerdictIcon = (verdict: string) => {
    switch (verdict) {
      case 'LEGITIMATE': return <CheckCircle className="w-5 h-5 text-success" />
      case 'SUSPICIOUS': return <AlertTriangle className="w-5 h-5 text-warning" />
      case 'PHISHING': return <XCircle className="w-5 h-5 text-error" />
      default: return null
    }
  }

  const currentAnalysis = analyzeMutation.data?.data

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Email Analyzer</h1>
          <p className="text-dark-muted">Advanced phishing detection powered by Groq LLM</p>
        </div>
        
        <div className="flex items-center space-x-2">
          <Shield className="w-5 h-5 text-primary-cyan" />
          <span className="text-sm text-primary-cyan">AI-Powered Analysis</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Email Input Form */}
        <div className="space-y-6">
          <div className="bg-dark-card border border-dark-border rounded-lg p-6">
            <h2 className="text-lg font-semibold mb-4">Analyze Email</h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Sender Email */}
              <div>
                <label className="block text-sm font-medium mb-2">Sender Email</label>
                <input
                  type="email"
                  value={emailData.sender_email}
                  onChange={(e) => setEmailData(prev => ({ ...prev, sender_email: e.target.value }))}
                  className="w-full px-4 py-3 bg-dark-bg border border-dark-border rounded-lg text-white placeholder-dark-muted focus:outline-none focus:border-primary-cyan focus:ring-2 focus:ring-primary-cyan/20 transition-all duration-300"
                  placeholder="sender@example.com"
                  required
                />
              </div>

              {/* Subject */}
              <div>
                <label className="block text-sm font-medium mb-2">Subject</label>
                <input
                  type="text"
                  value={emailData.subject}
                  onChange={(e) => setEmailData(prev => ({ ...prev, subject: e.target.value }))}
                  className="w-full px-4 py-3 bg-dark-bg border border-dark-border rounded-lg text-white placeholder-dark-muted focus:outline-none focus:border-primary-cyan focus:ring-2 focus:ring-primary-cyan/20 transition-all duration-300"
                  placeholder="Email subject line"
                  required
                />
              </div>

              {/* Body */}
              <div>
                <label className="block text-sm font-medium mb-2">Email Body</label>
                <textarea
                  value={emailData.body}
                  onChange={(e) => setEmailData(prev => ({ ...prev, body: e.target.value }))}
                  className="w-full px-4 py-3 bg-dark-bg border border-dark-border rounded-lg text-white placeholder-dark-muted focus:outline-none focus:border-primary-cyan focus:ring-2 focus:ring-primary-cyan/20 transition-all duration-300 h-32 resize-none"
                  placeholder="Paste the full email content here..."
                  required
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isAnalyzing}
                className="w-full py-3 bg-gradient-to-r from-primary-cyan to-primary-purple text-white font-medium rounded-lg hover:shadow-lg hover:shadow-primary-cyan/25 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              >
                {isAnalyzing ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Analyzing...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Analyze Email</span>
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Recent Analyses */}
          <div className="bg-dark-card border border-dark-border rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-4">Recent Analyses</h3>
            
            <div className="space-y-3">
              {isLoading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="p-3 bg-dark-bg rounded-lg">
                    <div className="h-4 bg-dark-border rounded w-3/4 mb-2 loading-skeleton"></div>
                    <div className="h-3 bg-dark-border rounded w-1/2 loading-skeleton"></div>
                  </div>
                ))
              ) : (
                analyses?.data?.slice(0, 5).map((analysis: any) => (
                  <div key={analysis.id} className="p-3 bg-dark-bg rounded-lg hover:bg-dark-border transition-colors cursor-pointer">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{analysis.sender_email}</p>
                        <p className="text-xs text-dark-muted truncate">{analysis.subject}</p>
                      </div>
                      <div className="flex items-center space-x-2 ml-2">
                        {getVerdictIcon(analysis.verdict)}
                        <span className={`text-xs ${getThreatColor(analysis.threat_level)}`}>
                          {analysis.threat_level}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Analysis Results */}
        <div className="space-y-6">
          {currentAnalysis ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-dark-card border border-dark-border rounded-lg p-6"
            >
              <h2 className="text-lg font-semibold mb-4">Analysis Results</h2>
              
              {/* Verdict */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Verdict</span>
                  <div className="flex items-center space-x-2">
                    {getVerdictIcon(currentAnalysis.verdict)}
                    <span className={`font-bold ${getThreatColor(currentAnalysis.threat_level)}`}>
                      {currentAnalysis.verdict}
                    </span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Threat Level</span>
                  <span className={`badge-${currentAnalysis.threat_level.toLowerCase()}`}>
                    {currentAnalysis.threat_level}
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Confidence</span>
                  <span className="text-sm">
                    {(currentAnalysis.confidence * 100).toFixed(1)}%
                  </span>
                </div>
              </div>

              {/* Red Flags */}
              {currentAnalysis.red_flags && currentAnalysis.red_flags.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-sm font-medium mb-2 text-warning">Red Flags Detected</h3>
                  <ul className="space-y-1">
                    {currentAnalysis.red_flags.map((flag: string, index: number) => (
                      <li key={index} className="text-sm text-dark-muted flex items-start space-x-2">
                        <AlertTriangle className="w-3 h-3 text-warning mt-0.5 flex-shrink-0" />
                        <span>{flag}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Explanation */}
              {currentAnalysis.explanation && (
                <div className="mb-6">
                  <h3 className="text-sm font-medium mb-2">Explanation</h3>
                  <p className="text-sm text-dark-muted leading-relaxed">
                    {currentAnalysis.explanation}
                  </p>
                </div>
              )}

              {/* Analysis Details */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center space-x-2">
                  <Clock className="w-4 h-4 text-dark-muted" />
                  <span className="text-dark-muted">
                    Analyzed: {new Date(currentAnalysis.created_at).toLocaleString()}
                  </span>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Mail className="w-4 h-4 text-dark-muted" />
                  <span className="text-dark-muted">
                    Model: Groq Llama3-70B
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="mt-6 pt-4 border-t border-dark-border flex items-center space-x-3">
                <button className="btn-secondary text-sm">
                  <Download className="w-4 h-4 mr-2" />
                  Export Report
                </button>
                <button className="btn-secondary text-sm">
                  <Eye className="w-4 h-4 mr-2" />
                  View Details
                </button>
              </div>
            </motion.div>
          ) : (
            <div className="bg-dark-card border border-dark-border rounded-lg p-12 text-center">
              <Mail className="w-12 h-12 text-dark-muted mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No Analysis Yet</h3>
              <p className="text-dark-muted">
                Enter an email in the form and click "Analyze Email" to get started
              </p>
            </div>
          )}

          {/* Analysis Stats */}
          <div className="bg-dark-card border border-dark-border rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-4">Analysis Statistics</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-success">
                  {analyses?.data?.filter((a: any) => a.verdict === 'LEGITIMATE').length || 0}
                </div>
                <div className="text-sm text-dark-muted">Legitimate</div>
              </div>
              
              <div className="text-center">
                <div className="text-2xl font-bold text-warning">
                  {analyses?.data?.filter((a: any) => a.verdict === 'SUSPICIOUS').length || 0}
                </div>
                <div className="text-sm text-dark-muted">Suspicious</div>
              </div>
              
              <div className="text-center">
                <div className="text-2xl font-bold text-error">
                  {analyses?.data?.filter((a: any) => a.verdict === 'PHISHING').length || 0}
                </div>
                <div className="text-sm text-dark-muted">Phishing</div>
              </div>
              
              <div className="text-center">
                <div className="text-2xl font-bold text-primary-cyan">
                  {analyses?.data?.length || 0}
                </div>
                <div className="text-sm text-dark-muted">Total Analyzed</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
