import axios from 'axios'
import toast from 'react-hot-toast'
import { useAuthStore } from '../store/authStore'

// API base URL
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().token
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      useAuthStore.getState().logout()
      toast.error('Session expired. Please login again.')
    } else if (error.response?.status >= 500) {
      toast.error('Server error. Please try again later.')
    } else if (error.response?.data?.error) {
      toast.error(error.response.data.error)
    } else if (error.code === 'ECONNABORTED') {
      toast.error('Request timeout. Please try again.')
    } else {
      toast.error('Network error. Please check your connection.')
    }
    return Promise.reject(error)
  }
)

// API endpoints
export const authAPI = {
  login: async (email: string, password: string) => {
    const response = await api.post('/auth/login', { email, password })
    return response.data
  },
  
  register: async (email: string, password: string, fullName?: string, organization?: string) => {
    const response = await api.post('/auth/register', { 
      email, 
      password, 
      full_name: fullName,
      organization 
    })
    return response.data
  },
}

export const transactionAPI = {
  analyze: async (transaction: any) => {
    const response = await api.post('/api/analyze', transaction)
    return response.data
  },
  
  simulate: async (count: number = 1, fraudRatio: number = 0.3) => {
    const response = await api.post('/api/simulate', { count, fraud_ratio: fraudRatio })
    return response.data
  },
  
  simulateBulk: async () => {
    const response = await api.post('/api/simulate/bulk')
    return response.data
  },
  
  uploadCSV: async (file: File) => {
    const formData = new FormData()
    formData.append('file', file)
    
    const response = await api.post('/api/csv/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    return response.data
  },
  
  getTransactions: async (params: {
    limit?: number
    offset?: number
    verdict?: string
  } = {}) => {
    const response = await api.get('/api/transactions', { params })
    return response.data
  },
  
  getTransaction: async (transactionId: string) => {
    const response = await api.get(`/api/transactions/${transactionId}`)
    return response.data
  },
  
  reviewTransaction: async (transactionId: string, reviewData: {
    is_false_positive: boolean
    review_notes?: string
    reviewer_confidence?: number
  }) => {
    const response = await api.patch(`/api/transactions/${transactionId}/review`, reviewData)
    return response.data
  },
}

export const emailAPI = {
  analyze: async (emailData: {
    sender_email: string
    subject: string
    body: string
  }) => {
    const response = await api.post('/api/email/analyze', emailData)
    return response.data
  },
  
  getAnalyses: async (limit: number = 50, offset: number = 0) => {
    const response = await api.get('/api/email/analyses', { 
      params: { limit, offset } 
    })
    return response.data
  },
}

export const metricsAPI = {
  getSystemMetrics: async () => {
    const response = await api.get('/api/metrics')
    return response.data
  },
  
  getTransactionAnalytics: async (days: number = 30) => {
    const response = await api.get('/api/analytics/transactions', { 
      params: { days } 
    })
    return response.data
  },
  
  getEmailAnalytics: async (days: number = 30) => {
    const response = await api.get('/api/analytics/emails', { 
      params: { days } 
    })
    return response.data
  },
}

// WebSocket connection for real-time updates
export class WebSocketManager {
  private ws: WebSocket | null = null
  private reconnectAttempts = 0
  private maxReconnectAttempts = 5
  private reconnectDelay = 1000
  
  connect(transactionId?: string) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      return
    }
    
    const wsUrl = `${API_BASE_URL.replace('http', 'ws')}/ws/analyze`
    this.ws = new WebSocket(wsUrl)
    
    this.ws.onopen = () => {
      console.log('WebSocket connected')
      this.reconnectAttempts = 0
      
      if (transactionId) {
        this.send({
          type: 'analyze',
          transaction_id: transactionId
        })
      }
    }
    
    this.ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data)
        this.handleMessage(data)
      } catch (error) {
        console.error('WebSocket message error:', error)
      }
    }
    
    this.ws.onclose = () => {
      console.log('WebSocket disconnected')
      this.attemptReconnect()
    }
    
    this.ws.onerror = (error) => {
      console.error('WebSocket error:', error)
    }
  }
  
  disconnect() {
    if (this.ws) {
      this.ws.close()
      this.ws = null
    }
  }
  
  send(data: any) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(data))
    }
  }
  
  private handleMessage(data: any) {
    // Handle real-time updates
    if (data.type === 'agent_update') {
      // Dispatch custom event for components to listen to
      window.dispatchEvent(new CustomEvent('agentUpdate', { 
        detail: data.data 
      }))
    }
  }
  
  private attemptReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++
      console.log(`Attempting to reconnect... (${this.reconnectAttempts}/${this.maxReconnectAttempts})`)
      
      setTimeout(() => {
        this.connect()
      }, this.reconnectDelay * this.reconnectAttempts)
    }
  }
}

export const wsManager = new WebSocketManager()

export default api
