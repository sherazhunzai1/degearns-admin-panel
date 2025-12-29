import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { subscriptionsAPI } from '../../services/api'

// ============================================
// Async Thunks
// ============================================

export const fetchSubscriptions = createAsyncThunk(
  'subscriptions/fetchSubscriptions',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await subscriptionsAPI.getSubscriptions(params)
      return response.data.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch subscriptions')
    }
  }
)

export const fetchSubscriptionStats = createAsyncThunk(
  'subscriptions/fetchStats',
  async (_, { rejectWithValue }) => {
    try {
      const response = await subscriptionsAPI.getStats()
      return response.data.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch subscription stats')
    }
  }
)

export const createSubscription = createAsyncThunk(
  'subscriptions/create',
  async (data, { rejectWithValue }) => {
    try {
      const response = await subscriptionsAPI.createSubscription(data)
      return response.data.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create subscription')
    }
  }
)

export const cancelSubscription = createAsyncThunk(
  'subscriptions/cancel',
  async ({ subscriptionId, reason }, { rejectWithValue }) => {
    try {
      const response = await subscriptionsAPI.cancelSubscription(subscriptionId, reason)
      return response.data.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to cancel subscription')
    }
  }
)

export const extendSubscription = createAsyncThunk(
  'subscriptions/extend',
  async ({ subscriptionId, additionalDays, reason }, { rejectWithValue }) => {
    try {
      const response = await subscriptionsAPI.extendSubscription(subscriptionId, additionalDays, reason)
      return response.data.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to extend subscription')
    }
  }
)

export const fetchUserSubscriptionHistory = createAsyncThunk(
  'subscriptions/fetchUserHistory',
  async (walletAddress, { rejectWithValue }) => {
    try {
      const response = await subscriptionsAPI.getUserSubscriptionHistory(walletAddress)
      return response.data.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch user subscription history')
    }
  }
)

// ============================================
// Slice
// ============================================

const initialState = {
  // List data
  subscriptions: [],
  pagination: {
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0
  },

  // Filters
  filters: {
    status: '',
    planType: '',
    search: ''
  },

  // Statistics
  stats: {
    totalByPlan: {
      free: 0,
      basic: 0,
      pro: 0,
      premium: 0
    },
    activeByPlan: {
      free: 0,
      basic: 0,
      pro: 0,
      premium: 0
    },
    recentSubscriptions: []
  },

  // User detail view
  selectedUserHistory: null,

  // Loading states
  loading: {
    subscriptions: false,
    stats: false,
    create: false,
    cancel: false,
    extend: false,
    userHistory: false
  },

  // Success/Error messages
  error: null,
  successMessage: null
}

const subscriptionsSlice = createSlice({
  name: 'subscriptions',
  initialState,
  reducers: {
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload }
    },
    setPage: (state, action) => {
      state.pagination.page = action.payload
    },
    clearError: (state) => {
      state.error = null
    },
    clearSuccessMessage: (state) => {
      state.successMessage = null
    },
    clearSelectedUserHistory: (state) => {
      state.selectedUserHistory = null
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch Subscriptions
      .addCase(fetchSubscriptions.pending, (state) => {
        state.loading.subscriptions = true
        state.error = null
      })
      .addCase(fetchSubscriptions.fulfilled, (state, action) => {
        state.loading.subscriptions = false
        state.subscriptions = action.payload.subscriptions || []
        state.pagination = action.payload.pagination || state.pagination
      })
      .addCase(fetchSubscriptions.rejected, (state, action) => {
        state.loading.subscriptions = false
        state.error = action.payload
      })

      // Fetch Stats
      .addCase(fetchSubscriptionStats.pending, (state) => {
        state.loading.stats = true
        state.error = null
      })
      .addCase(fetchSubscriptionStats.fulfilled, (state, action) => {
        state.loading.stats = false
        state.stats = {
          totalByPlan: action.payload.totalByPlan || state.stats.totalByPlan,
          activeByPlan: action.payload.activeByPlan || state.stats.activeByPlan,
          recentSubscriptions: action.payload.recentSubscriptions || []
        }
      })
      .addCase(fetchSubscriptionStats.rejected, (state, action) => {
        state.loading.stats = false
        state.error = action.payload
      })

      // Create Subscription
      .addCase(createSubscription.pending, (state) => {
        state.loading.create = true
        state.error = null
      })
      .addCase(createSubscription.fulfilled, (state, action) => {
        state.loading.create = false
        state.successMessage = 'Subscription created successfully'
        // Add to list if not already present
        const exists = state.subscriptions.find(s => s.id === action.payload.id)
        if (!exists) {
          state.subscriptions.unshift(action.payload)
        }
      })
      .addCase(createSubscription.rejected, (state, action) => {
        state.loading.create = false
        state.error = action.payload
      })

      // Cancel Subscription
      .addCase(cancelSubscription.pending, (state) => {
        state.loading.cancel = true
        state.error = null
      })
      .addCase(cancelSubscription.fulfilled, (state, action) => {
        state.loading.cancel = false
        state.successMessage = 'Subscription cancelled successfully'
        // Update in list
        const index = state.subscriptions.findIndex(s => s.id === action.payload.id)
        if (index !== -1) {
          state.subscriptions[index] = { ...state.subscriptions[index], ...action.payload }
        }
      })
      .addCase(cancelSubscription.rejected, (state, action) => {
        state.loading.cancel = false
        state.error = action.payload
      })

      // Extend Subscription
      .addCase(extendSubscription.pending, (state) => {
        state.loading.extend = true
        state.error = null
      })
      .addCase(extendSubscription.fulfilled, (state, action) => {
        state.loading.extend = false
        state.successMessage = 'Subscription extended successfully'
        // Update in list
        const index = state.subscriptions.findIndex(s => s.id === action.payload.id)
        if (index !== -1) {
          state.subscriptions[index] = { ...state.subscriptions[index], ...action.payload }
        }
      })
      .addCase(extendSubscription.rejected, (state, action) => {
        state.loading.extend = false
        state.error = action.payload
      })

      // Fetch User History
      .addCase(fetchUserSubscriptionHistory.pending, (state) => {
        state.loading.userHistory = true
        state.error = null
      })
      .addCase(fetchUserSubscriptionHistory.fulfilled, (state, action) => {
        state.loading.userHistory = false
        state.selectedUserHistory = action.payload
      })
      .addCase(fetchUserSubscriptionHistory.rejected, (state, action) => {
        state.loading.userHistory = false
        state.error = action.payload
      })
  }
})

export const {
  setFilters,
  setPage,
  clearError,
  clearSuccessMessage,
  clearSelectedUserHistory
} = subscriptionsSlice.actions

export default subscriptionsSlice.reducer
