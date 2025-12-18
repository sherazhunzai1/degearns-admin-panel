import axios from 'axios'

// Base API configuration
const API_BASE_URL = 'https://api.degearns.com/api/v1/admin'

// Create axios instance with default config
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
    const token = localStorage.getItem('degearns_admin_token')
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
    if (error.response) {
      // Handle specific error codes
      switch (error.response.status) {
        case 401:
          // Unauthorized - clear token and redirect to login
          localStorage.removeItem('degearns_admin_token')
          localStorage.removeItem('degearns_admin_user')
          window.location.href = '/login'
          break
        case 403:
          // Forbidden
          console.error('Access forbidden')
          break
        case 404:
          // Not found
          console.error('Resource not found')
          break
        case 500:
          // Server error
          console.error('Server error')
          break
        default:
          console.error('API error:', error.response.data)
      }
    } else if (error.request) {
      // Network error
      console.error('Network error:', error.message)
    }
    return Promise.reject(error)
  }
)

export default api

// Auth API endpoints
export const authAPI = {
  // Initialize Xaman login - get QR code payload
  initiateXamanLogin: () => api.post('/auth/xaman/init'),

  // Verify Xaman signature and get auth token
  verifyXamanSignature: (payloadId, signature) =>
    api.post('/auth/xaman/verify', { payloadId, signature }),

  // Check if wallet is authorized admin
  checkAdminAccess: (walletAddress) =>
    api.post('/auth/check-admin', { walletAddress }),

  // Get current admin profile
  getProfile: () => api.get('/auth/profile'),

  // Logout
  logout: () => api.post('/auth/logout'),
}

// Dashboard API endpoints
export const dashboardAPI = {
  // Get dashboard stats
  getStats: () => api.get('/dashboard/stats'),

  // Get volume chart data
  getVolumeData: (period = '7d') => api.get(`/dashboard/volume?period=${period}`),

  // Get NFT category distribution
  getCategoryData: () => api.get('/dashboard/categories'),

  // Get user activity data
  getUserActivity: (period = '7d') => api.get(`/dashboard/user-activity?period=${period}`),

  // Get recent transactions
  getRecentTransactions: (limit = 5) => api.get(`/dashboard/recent-transactions?limit=${limit}`),
}

// Users API endpoints
export const usersAPI = {
  // Get all users with pagination and filters
  getUsers: (params = {}) => {
    const { page = 1, limit = 10, search = '', status = 'all', role = 'all' } = params
    return api.get('/users', { params: { page, limit, search, status, role } })
  },

  // Get single user details
  getUser: (userId) => api.get(`/users/${userId}`),

  // Block user
  blockUser: (userId, reason = '') => api.post(`/users/${userId}/block`, { reason }),

  // Unblock user
  unblockUser: (userId) => api.post(`/users/${userId}/unblock`),

  // Get user activity history
  getUserActivity: (userId) => api.get(`/users/${userId}/activity`),

  // Get user NFTs
  getUserNFTs: (userId) => api.get(`/users/${userId}/nfts`),

  // Get user transactions
  getUserTransactions: (userId) => api.get(`/users/${userId}/transactions`),
}

// Transactions API endpoints
export const transactionsAPI = {
  // Get all transactions with pagination and filters
  getTransactions: (params = {}) => {
    const { page = 1, limit = 15, search = '', type = 'all', status = 'all', dateRange = '7d' } = params
    return api.get('/transactions', { params: { page, limit, search, type, status, dateRange } })
  },

  // Get single transaction details
  getTransaction: (txId) => api.get(`/transactions/${txId}`),

  // Get transaction stats
  getTransactionStats: (dateRange = '7d') => api.get(`/transactions/stats?dateRange=${dateRange}`),
}

// Leaderboards API endpoints
export const leaderboardsAPI = {
  // Get top traders
  getTopTraders: (period = '30d', limit = 10) =>
    api.get('/leaderboards/traders', { params: { period, limit } }),

  // Get top creators
  getTopCreators: (period = '30d', limit = 10) =>
    api.get('/leaderboards/creators', { params: { period, limit } }),

  // Get top influencers
  getTopInfluencers: (period = '30d', limit = 10) =>
    api.get('/leaderboards/influencers', { params: { period, limit } }),
}

// Rewards API endpoints
export const rewardsAPI = {
  // Get reward pool balance
  getRewardPoolBalance: () => api.get('/rewards/pool-balance'),

  // Get reward history
  getRewardHistory: (params = {}) => {
    const { page = 1, limit = 10, status = 'all' } = params
    return api.get('/rewards/history', { params: { page, limit, status } })
  },

  // Send individual reward
  sendReward: (data) => api.post('/rewards/send', data),

  // Send batch rewards
  sendBatchReward: (data) => api.post('/rewards/batch-send', data),

  // Get reward presets
  getRewardPresets: () => api.get('/rewards/presets'),
}

// Settings API endpoints
export const settingsAPI = {
  // Get platform settings
  getPlatformSettings: () => api.get('/settings/platform'),

  // Update platform settings
  updatePlatformSettings: (data) => api.put('/settings/platform', data),

  // Get wallet settings
  getWalletSettings: () => api.get('/settings/wallets'),

  // Update wallet settings
  updateWalletSettings: (data) => api.put('/settings/wallets', data),

  // Get notification settings
  getNotificationSettings: () => api.get('/settings/notifications'),

  // Update notification settings
  updateNotificationSettings: (data) => api.put('/settings/notifications', data),

  // Get admin list
  getAdminList: () => api.get('/settings/admins'),

  // Add admin wallet
  addAdminWallet: (walletAddress) => api.post('/settings/admins', { walletAddress }),

  // Remove admin wallet
  removeAdminWallet: (walletAddress) => api.delete(`/settings/admins/${walletAddress}`),
}
