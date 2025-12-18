import axios from 'axios'

// Base API configuration
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://api.degearns.com/api/v1'

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
      switch (error.response.status) {
        case 401:
          // Only redirect to login if this is an auth-related endpoint
          // or if the error message explicitly indicates invalid token
          const isAuthEndpoint = error.config?.url?.includes('/auth/')
          const isInvalidToken = error.response.data?.message?.toLowerCase().includes('token') ||
                                 error.response.data?.message?.toLowerCase().includes('unauthorized') ||
                                 error.response.data?.message?.toLowerCase().includes('authentication')

          if (isAuthEndpoint || isInvalidToken) {
            localStorage.removeItem('degearns_admin_token')
            localStorage.removeItem('degearns_admin_user')
            window.location.href = '/login'
          } else {
            console.error('API 401 error (not logging out):', error.response.data?.message)
          }
          break
        case 403:
          console.error('Access forbidden:', error.response.data?.message)
          break
        case 404:
          console.error('Resource not found')
          break
        case 500:
          console.error('Server error')
          break
        default:
          console.error('API error:', error.response.data)
      }
    } else if (error.request) {
      // Network error - don't logout, just log
      console.error('Network error:', error.message)
    }
    return Promise.reject(error)
  }
)

export default api

// ============================================
// Dashboard & Analytics APIs
// ============================================
export const dashboardAPI = {
  // Get dashboard overview stats
  getOverview: () => api.get('/admin/dashboard'),

  // Get growth analytics
  getGrowth: (period = '30d') =>
    api.get('/admin/dashboard/growth', { params: { period } }),

  // Get top creators
  getTopCreators: (metric = 'mints', limit = 10) =>
    api.get('/admin/dashboard/top-creators', { params: { metric, limit } }),

  // Get recent admin activities
  getActivities: (params = {}) => {
    const { page = 1, limit = 20, action, targetType, adminWallet } = params
    return api.get('/admin/dashboard/activities', {
      params: { page, limit, action, targetType, adminWallet }
    })
  },

  // Get platform health
  getHealth: () => api.get('/admin/dashboard/health'),

  // Get revenue breakdown
  getRevenue: (period = '30d') =>
    api.get('/admin/dashboard/revenue', { params: { period } }),
}

// ============================================
// User Management APIs
// ============================================
export const usersAPI = {
  // Get all users with pagination and filters
  getUsers: (params = {}) => {
    const {
      page = 1,
      limit = 20,
      search = '',
      role,
      isVerified,
      isBanned,
      sortBy = 'createdAt',
      sortOrder = 'DESC'
    } = params
    return api.get('/admin/users', {
      params: { page, limit, search, role, isVerified, isBanned, sortBy, sortOrder }
    })
  },

  // Get user statistics
  getStatistics: () => api.get('/admin/users/statistics'),

  // Get user by wallet address
  getUser: (walletAddress) => api.get(`/admin/users/${walletAddress}`),

  // Update user role (super admin only)
  updateRole: (walletAddress, role, reason) =>
    api.put(`/admin/users/${walletAddress}/role`, { role, reason }),

  // Verify/Unverify user
  updateVerification: (walletAddress, isVerified, reason) =>
    api.put(`/admin/users/${walletAddress}/verify`, { isVerified, reason }),

  // Ban user
  banUser: (walletAddress, reason) =>
    api.put(`/admin/users/${walletAddress}/ban`, { reason }),

  // Unban user
  unbanUser: (walletAddress, reason) =>
    api.put(`/admin/users/${walletAddress}/unban`, { reason }),

  // Delete user (super admin only)
  deleteUser: (walletAddress, reason) =>
    api.delete(`/admin/users/${walletAddress}`, { data: { reason } }),

  // Bulk verify users
  bulkVerify: (walletAddresses, isVerified, reason) =>
    api.post('/admin/users/bulk-verify', { walletAddresses, isVerified, reason }),
}

// ============================================
// Drop Management APIs
// ============================================
export const dropsAPI = {
  // Get all drops with pagination and filters
  getDrops: (params = {}) => {
    const {
      page = 1,
      limit = 20,
      search = '',
      status,
      platformFeesStatus,
      creatorWallet,
      sortBy = 'createdAt',
      sortOrder = 'DESC'
    } = params
    return api.get('/admin/drops', {
      params: { page, limit, search, status, platformFeesStatus, creatorWallet, sortBy, sortOrder }
    })
  },

  // Get drop statistics
  getStatistics: () => api.get('/admin/drops/statistics'),

  // Get drops with pending fees
  getPendingFees: (params = {}) => {
    const { page = 1, limit = 20 } = params
    return api.get('/admin/drops/pending-fees', { params: { page, limit } })
  },

  // Get drop by ID
  getDrop: (dropId) => api.get(`/admin/drops/${dropId}`),

  // Update drop
  updateDrop: (dropId, data) => api.put(`/admin/drops/${dropId}`, data),

  // Update drop status
  updateStatus: (dropId, status, reason) =>
    api.put(`/admin/drops/${dropId}/status`, { status, reason }),

  // Pause drop
  pauseDrop: (dropId, reason) =>
    api.put(`/admin/drops/${dropId}/pause`, { reason }),

  // Resume drop
  resumeDrop: (dropId, status = 'active', enableMinting = true, reason) =>
    api.put(`/admin/drops/${dropId}/resume`, { status, enableMinting, reason }),

  // Update platform fees status
  updateFeesStatus: (dropId, platformFeesStatus, transactionHash, reason) =>
    api.put(`/admin/drops/${dropId}/fees-status`, { platformFeesStatus, transactionHash, reason }),

  // Delete drop (super admin only)
  deleteDrop: (dropId, reason) =>
    api.delete(`/admin/drops/${dropId}`, { data: { reason } }),

  // Get drop mints
  getDropMints: (dropId, params = {}) => {
    const { page = 1, limit = 20 } = params
    return api.get(`/admin/drops/${dropId}/mints`, { params: { page, limit } })
  },

  // Get drop allowlist
  getDropAllowlist: (dropId, params = {}) => {
    const { page = 1, limit = 50 } = params
    return api.get(`/admin/drops/${dropId}/allowlist`, { params: { page, limit } })
  },
}

// ============================================
// Collection Management APIs
// ============================================
export const collectionsAPI = {
  // Get all collections with pagination and filters
  getCollections: (params = {}) => {
    const {
      page = 1,
      limit = 20,
      search = '',
      category,
      isVerified,
      creatorWallet,
      sortBy = 'createdAt',
      sortOrder = 'DESC'
    } = params
    return api.get('/admin/collections', {
      params: { page, limit, search, category, isVerified, creatorWallet, sortBy, sortOrder }
    })
  },

  // Get collection statistics
  getStatistics: () => api.get('/admin/collections/statistics'),

  // Get pending verification collections
  getPendingVerification: (params = {}) => {
    const { page = 1, limit = 20 } = params
    return api.get('/admin/collections/pending-verification', { params: { page, limit } })
  },

  // Get collection by ID
  getCollection: (collectionId) => api.get(`/admin/collections/${collectionId}`),

  // Update collection
  updateCollection: (collectionId, data) => api.put(`/admin/collections/${collectionId}`, data),

  // Verify/Unverify collection
  updateVerification: (collectionId, isVerified, reason) =>
    api.put(`/admin/collections/${collectionId}/verify`, { isVerified, reason }),

  // Delete collection (super admin only)
  deleteCollection: (collectionId, reason) =>
    api.delete(`/admin/collections/${collectionId}`, { data: { reason } }),

  // Bulk verify collections
  bulkVerify: (collectionIds, isVerified, reason) =>
    api.post('/admin/collections/bulk-verify', { collectionIds, isVerified, reason }),
}

// ============================================
// Post Moderation APIs
// ============================================
export const postsAPI = {
  // Get all posts with pagination and filters
  getPosts: (params = {}) => {
    const {
      page = 1,
      limit = 20,
      search = '',
      postType,
      visibility,
      isActive,
      authorWallet,
      sortBy = 'createdAt',
      sortOrder = 'DESC'
    } = params
    return api.get('/admin/posts', {
      params: { page, limit, search, postType, visibility, isActive, authorWallet, sortBy, sortOrder }
    })
  },

  // Get post statistics
  getStatistics: () => api.get('/admin/posts/statistics'),

  // Get flagged content
  getFlagged: (params = {}) => {
    const { page = 1, limit = 20 } = params
    return api.get('/admin/posts/flagged', { params: { page, limit } })
  },

  // Get post by ID
  getPost: (postId) => api.get(`/admin/posts/${postId}`),

  // Toggle post visibility
  toggleVisibility: (postId, isActive, reason) =>
    api.put(`/admin/posts/${postId}/visibility`, { isActive, reason }),

  // Delete post
  deletePost: (postId, reason) =>
    api.delete(`/admin/posts/${postId}`, { data: { reason } }),

  // Get all comments
  getComments: (params = {}) => {
    const {
      page = 1,
      limit = 20,
      search = '',
      postId,
      authorWallet,
      isActive,
      sortBy = 'createdAt',
      sortOrder = 'DESC'
    } = params
    return api.get('/admin/comments', {
      params: { page, limit, search, postId, authorWallet, isActive, sortBy, sortOrder }
    })
  },

  // Delete comment
  deleteComment: (commentId, reason) =>
    api.delete(`/admin/comments/${commentId}`, { data: { reason } }),

  // Bulk delete posts
  bulkDelete: (postIds, reason) =>
    api.post('/admin/posts/bulk-delete', { postIds, reason }),

  // Bulk hide posts
  bulkHide: (postIds, isActive, reason) =>
    api.post('/admin/posts/bulk-hide', { postIds, isActive, reason }),
}

// ============================================
// Platform Settings APIs
// ============================================
export const settingsAPI = {
  // Initialize default settings (super admin only)
  initialize: () => api.post('/admin/settings/initialize'),

  // Get all settings
  getSettings: (params = {}) => {
    const { category, isPublic } = params
    return api.get('/admin/settings', { params: { category, isPublic } })
  },

  // Get public settings (no auth required)
  getPublicSettings: () => api.get('/admin/settings/public'),

  // Get setting by key
  getSetting: (key) => api.get(`/admin/settings/${key}`),

  // Update setting (super admin only)
  updateSetting: (key, data) => api.put(`/admin/settings/${key}`, data),

  // Reset setting to default (super admin only)
  resetSetting: (key, reason) =>
    api.put(`/admin/settings/${key}/reset`, { reason }),

  // Create setting (super admin only)
  createSetting: (data) => api.post('/admin/settings', data),

  // Delete setting (super admin only)
  deleteSetting: (key, reason) =>
    api.delete(`/admin/settings/${key}`, { data: { reason } }),

  // Bulk update settings (super admin only)
  bulkUpdate: (settings, reason) =>
    api.put('/admin/settings/bulk', { settings, reason }),
}

// ============================================
// Fee Management APIs
// ============================================
export const feesAPI = {
  // Get fees overview
  getOverview: () => api.get('/admin/fees'),

  // Get fee transactions
  getTransactions: (params = {}) => {
    const { page = 1, limit = 20, status, sortBy = 'updatedAt', sortOrder = 'DESC' } = params
    return api.get('/admin/fees/transactions', {
      params: { page, limit, status, sortBy, sortOrder }
    })
  },

  // Get fee statistics
  getStatistics: (period = '30d') =>
    api.get('/admin/fees/statistics', { params: { period } }),

  // Get pending fees
  getPending: (params = {}) => {
    const { page = 1, limit = 20 } = params
    return api.get('/admin/fees/pending', { params: { page, limit } })
  },

  // Get failed fees
  getFailed: (params = {}) => {
    const { page = 1, limit = 20 } = params
    return api.get('/admin/fees/failed', { params: { page, limit } })
  },

  // Export fee report
  exportReport: (params = {}) => {
    const { startDate, endDate, status } = params
    return api.get('/admin/fees/export', { params: { startDate, endDate, status } })
  },

  // Mark fees as paid
  markPaid: (dropId, transactionHash, reason) =>
    api.put(`/admin/fees/${dropId}/mark-paid`, { transactionHash, reason }),

  // Mark fees as refunded (super admin only)
  markRefunded: (dropId, transactionHash, reason) =>
    api.put(`/admin/fees/${dropId}/mark-refunded`, { transactionHash, reason }),
}

// ============================================
// Rewards Management APIs
// ============================================
export const rewardsAPI = {
  // Get all top performers (traders, creators, influencers)
  getTopPerformers: (params = {}) => {
    const { month, year, limit = 10 } = params
    return api.get('/admin/rewards/top-performers', { params: { month, year, limit } })
  },

  // Get top traders
  getTopTraders: (params = {}) => {
    const { month, year, limit = 10 } = params
    return api.get('/admin/rewards/top-traders', { params: { month, year, limit } })
  },

  // Get top creators
  getTopCreators: (params = {}) => {
    const { month, year, limit = 10 } = params
    return api.get('/admin/rewards/top-creators', { params: { month, year, limit } })
  },

  // Get top influencers
  getTopInfluencers: (params = {}) => {
    const { month, year, limit = 10 } = params
    return api.get('/admin/rewards/top-influencers', { params: { month, year, limit } })
  },

  // Get reward configuration
  getConfig: () => api.get('/admin/rewards/config'),

  // Distribute rewards
  distribute: (data) => {
    const { month, year, category, rewards, dryRun = false } = data
    return api.post('/admin/rewards/distribute', { month, year, category, rewards, dryRun })
  },

  // Get reward history
  getHistory: (params = {}) => {
    const { page = 1, limit = 20, month, year, category, walletAddress, status } = params
    return api.get('/admin/rewards/history', {
      params: { page, limit, month, year, category, walletAddress, status }
    })
  },

  // Get reward summary by year
  getSummary: (year) => api.get('/admin/rewards/summary', { params: { year } }),
}

// ============================================
// Admin Wallet Management APIs
// ============================================
export const walletsAPI = {
  // Get all admin wallets
  getWallets: () => api.get('/admin/wallets'),

  // Get platform fees wallet
  getPlatformFeesWallet: () => api.get('/admin/wallets/platform-fees'),

  // Update platform fees wallet
  updatePlatformFeesWallet: (data) => {
    const { walletAddress, label, description } = data
    return api.put('/admin/wallets/platform-fees', { walletAddress, label, description })
  },

  // Create or update admin wallet
  createWallet: (data) => {
    const { walletAddress, type, label, description, isActive = true } = data
    return api.post('/admin/wallets', { walletAddress, type, label, description, isActive })
  },

  // Delete admin wallet
  deleteWallet: (walletId) => api.delete(`/admin/wallets/${walletId}`),
}

// ============================================
// Auth APIs (kept for reference, using Xaman direct auth)
// ============================================
export const authAPI = {
  // Get current admin profile
  getProfile: () => api.get('/auth/profile'),

  // Logout
  logout: () => api.post('/auth/logout'),
}
