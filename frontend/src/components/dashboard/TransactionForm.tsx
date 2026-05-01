import React, { useState } from 'react'
import { CreditCard, Send, AlertCircle } from 'lucide-react'
import { useMutation } from '@tanstack/react-query'
import { transactionAPI } from '../../lib/api'
import toast from 'react-hot-toast'

interface TransactionFormProps {
  isAnalyzing: boolean
  setIsAnalyzing: (value: boolean) => void
  setCurrentTransaction: (transaction: any) => void
}

export const TransactionForm: React.FC<TransactionFormProps> = ({
  isAnalyzing,
  setIsAnalyzing,
  setCurrentTransaction
}) => {
  const [formData, setFormData] = useState({
    amount: '',
    merchant: '',
    location: '',
    user_id: '',
    device_type: 'web'
  })

  // Analyze transaction mutation
  const analyzeMutation = useMutation({
    mutationFn: transactionAPI.analyze,
    onSuccess: (data) => {
      toast.success('Transaction analyzed successfully')
      setCurrentTransaction(data.data)
      setIsAnalyzing(false)
    },
    onError: (error) => {
      toast.error('Failed to analyze transaction')
      setIsAnalyzing(false)
    }
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.amount || !formData.user_id) {
      toast.error('Please fill in required fields')
      return
    }

    setIsAnalyzing(true)
    const transactionData = {
      ...formData,
      amount: parseFloat(formData.amount),
      timestamp: new Date().toISOString(),
      transaction_id: `TXN_${Math.random().toString(36).substring(2, 9).toUpperCase()}`,
      merchant_category: 'retail', // default category
      device_fingerprint: 'web_browser_fingerprint'
    }
    
    analyzeMutation.mutate(transactionData)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  return (
    <div className="bg-dark-card border border-dark-border rounded-lg p-6">
      <h2 className="text-lg font-semibold mb-4 flex items-center space-x-2">
        <CreditCard className="w-5 h-5 text-primary-cyan" />
        <span>Analyze Transaction</span>
      </h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Amount */}
        <div>
          <label className="block text-sm font-medium mb-2">Amount *</label>
          <input
            type="number"
            name="amount"
            value={formData.amount}
            onChange={handleChange}
            step="0.01"
            min="0"
            className="w-full px-4 py-3 bg-dark-bg border border-dark-border rounded-lg text-white placeholder-dark-muted focus:outline-none focus:border-primary-cyan focus:ring-2 focus:ring-primary-cyan/20 transition-all duration-300"
            placeholder="100.00"
            required
          />
        </div>

        {/* User ID */}
        <div>
          <label className="block text-sm font-medium mb-2">User ID *</label>
          <input
            type="text"
            name="user_id"
            value={formData.user_id}
            onChange={handleChange}
            className="w-full px-4 py-3 bg-dark-bg border border-dark-border rounded-lg text-white placeholder-dark-muted focus:outline-none focus:border-primary-cyan focus:ring-2 focus:ring-primary-cyan/20 transition-all duration-300"
            placeholder="user_12345"
            required
          />
        </div>

        {/* Merchant */}
        <div>
          <label className="block text-sm font-medium mb-2">Merchant</label>
          <input
            type="text"
            name="merchant"
            value={formData.merchant}
            onChange={handleChange}
            className="w-full px-4 py-3 bg-dark-bg border border-dark-border rounded-lg text-white placeholder-dark-muted focus:outline-none focus:border-primary-cyan focus:ring-2 focus:ring-primary-cyan/20 transition-all duration-300"
            placeholder="Amazon Store"
          />
        </div>

        {/* Location */}
        <div>
          <label className="block text-sm font-medium mb-2">Location</label>
          <input
            type="text"
            name="location"
            value={formData.location}
            onChange={handleChange}
            className="w-full px-4 py-3 bg-dark-bg border border-dark-border rounded-lg text-white placeholder-dark-muted focus:outline-none focus:border-primary-cyan focus:ring-2 focus:ring-primary-cyan/20 transition-all duration-300"
            placeholder="New York, NY"
          />
        </div>

        {/* Device Type */}
        <div>
          <label className="block text-sm font-medium mb-2">Device Type</label>
          <select
            name="device_type"
            value={formData.device_type}
            onChange={handleChange}
            className="w-full px-4 py-3 bg-dark-bg border border-dark-border rounded-lg text-white focus:outline-none focus:border-primary-cyan focus:ring-2 focus:ring-primary-cyan/20 transition-all duration-300"
          >
            <option value="web">Web</option>
            <option value="mobile">Mobile</option>
            <option value="pos">POS Terminal</option>
            <option value="atm">ATM</option>
          </select>
        </div>

        {/* Demo Info */}
        <div className="p-3 bg-dark-bg rounded-lg border border-dark-border">
          <div className="flex items-start space-x-2">
            <AlertCircle className="w-4 h-4 text-primary-cyan mt-0.5 flex-shrink-0" />
            <div className="text-sm text-dark-muted">
              <p className="text-primary-cyan font-medium mb-1">Demo Mode</p>
              <p>Enter any values to test the AI fraud detection system</p>
            </div>
          </div>
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
              <span>Analyzing with AI...</span>
            </>
          ) : (
            <>
              <Send className="w-4 h-4" />
              <span>Analyze Transaction</span>
            </>
          )}
        </button>
      </form>
    </div>
  )
}
