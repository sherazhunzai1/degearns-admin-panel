import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { rewardsAPI } from '../../services/api'

const initialState = {
  poolBalance: '0',
  totalRewarded: '0',
  pendingRewards: '0',
  history: [],
  presets: [],
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  },
  loading: false,
  sendingReward: false,
  error: null,
  sendError: null,
  sendSuccess: false,
}

// Fetch reward pool balance
export const fetchRewardPoolBalance = createAsyncThunk(
  'rewards/fetchPoolBalance',
  async (_, { rejectWithValue }) => {
    try {
      const response = await rewardsAPI.getRewardPoolBalance()
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch pool balance')
    }
  }
)

// Fetch reward history
export const fetchRewardHistory = createAsyncThunk(
  'rewards/fetchHistory',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await rewardsAPI.getRewardHistory(params)
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch history')
    }
  }
)

// Fetch reward presets
export const fetchRewardPresets = createAsyncThunk(
  'rewards/fetchPresets',
  async (_, { rejectWithValue }) => {
    try {
      const response = await rewardsAPI.getRewardPresets()
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch presets')
    }
  }
)

// Send individual reward
export const sendReward = createAsyncThunk(
  'rewards/sendReward',
  async (data, { rejectWithValue }) => {
    try {
      const response = await rewardsAPI.sendReward(data)
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to send reward')
    }
  }
)

// Send batch rewards
export const sendBatchReward = createAsyncThunk(
  'rewards/sendBatchReward',
  async (data, { rejectWithValue }) => {
    try {
      const response = await rewardsAPI.sendBatchReward(data)
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to send batch reward')
    }
  }
)

const rewardsSlice = createSlice({
  name: 'rewards',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null
      state.sendError = null
    },
    clearSendSuccess: (state) => {
      state.sendSuccess = false
    },
    setPage: (state, action) => {
      state.pagination.page = action.payload
    },
    // For demo/mock data
    setMockRewards: (state) => {
      state.poolBalance = '125,000 XRP'
      state.totalRewarded = '89,500 XRP'
      state.pendingRewards = '3,500 XRP'
      state.history = [
        { id: 1, recipient: 'CryptoWhale', address: 'rWhale123456789', amount: '5,000 XRP', type: 'Top Trader', date: '2024-06-15', status: 'completed', txHash: 'ABC123...' },
        { id: 2, recipient: 'PixelArtist', address: 'rPixel123456789', amount: '3,000 XRP', type: 'Top Creator', date: '2024-06-15', status: 'completed', txHash: 'DEF456...' },
        { id: 3, recipient: 'NFTInfluencer1', address: 'rInfluencer123', amount: '2,500 XRP', type: 'Top Influencer', date: '2024-06-15', status: 'pending', txHash: '-' },
        { id: 4, recipient: 'NFTMaster', address: 'rMaster987654321', amount: '4,000 XRP', type: 'Weekly Bonus', date: '2024-06-14', status: 'completed', txHash: 'GHI789...' },
        { id: 5, recipient: 'DigitalDreams', address: 'rDreams987654321', amount: '2,000 XRP', type: 'Top Creator', date: '2024-06-14', status: 'completed', txHash: 'JKL012...' },
        { id: 6, recipient: 'CryptoGuru', address: 'rGuru987654321', amount: '1,500 XRP', type: 'Referral Bonus', date: '2024-06-13', status: 'completed', txHash: 'MNO345...' },
        { id: 7, recipient: 'DiamondHands', address: 'rDiamond555444333', amount: '3,500 XRP', type: 'Top Trader', date: '2024-06-13', status: 'failed', txHash: '-' },
        { id: 8, recipient: 'TokenKing', address: 'rToken111222333', amount: '2,800 XRP', type: 'Monthly Bonus', date: '2024-06-12', status: 'completed', txHash: 'PQR678...' },
      ]
      state.presets = [
        { name: 'Top Trader Reward', amount: 5000, description: 'Monthly reward for top trader' },
        { name: 'Top Creator Reward', amount: 3000, description: 'Monthly reward for top creator' },
        { name: 'Top Influencer Reward', amount: 2500, description: 'Monthly reward for top influencer' },
        { name: 'Weekly Bonus', amount: 1000, description: 'Weekly performance bonus' },
        { name: 'Referral Bonus', amount: 500, description: 'User referral bonus' },
      ]
      state.pagination = {
        page: 1,
        limit: 10,
        total: 8,
        totalPages: 1,
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Pool Balance
      .addCase(fetchRewardPoolBalance.pending, (state) => {
        state.loading = true
      })
      .addCase(fetchRewardPoolBalance.fulfilled, (state, action) => {
        state.loading = false
        state.poolBalance = action.payload.poolBalance
        state.totalRewarded = action.payload.totalRewarded
        state.pendingRewards = action.payload.pendingRewards
      })
      .addCase(fetchRewardPoolBalance.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })

      // Fetch History
      .addCase(fetchRewardHistory.pending, (state) => {
        state.loading = true
      })
      .addCase(fetchRewardHistory.fulfilled, (state, action) => {
        state.loading = false
        state.history = action.payload.history || action.payload.data || []
        state.pagination = {
          page: action.payload.page || 1,
          limit: action.payload.limit || 10,
          total: action.payload.total || 0,
          totalPages: action.payload.totalPages || 0,
        }
      })
      .addCase(fetchRewardHistory.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })

      // Fetch Presets
      .addCase(fetchRewardPresets.fulfilled, (state, action) => {
        state.presets = action.payload
      })

      // Send Reward
      .addCase(sendReward.pending, (state) => {
        state.sendingReward = true
        state.sendError = null
        state.sendSuccess = false
      })
      .addCase(sendReward.fulfilled, (state, action) => {
        state.sendingReward = false
        state.sendSuccess = true
        // Add to history if returned
        if (action.payload.reward) {
          state.history.unshift(action.payload.reward)
        }
      })
      .addCase(sendReward.rejected, (state, action) => {
        state.sendingReward = false
        state.sendError = action.payload
      })

      // Send Batch Reward
      .addCase(sendBatchReward.pending, (state) => {
        state.sendingReward = true
        state.sendError = null
        state.sendSuccess = false
      })
      .addCase(sendBatchReward.fulfilled, (state, action) => {
        state.sendingReward = false
        state.sendSuccess = true
      })
      .addCase(sendBatchReward.rejected, (state, action) => {
        state.sendingReward = false
        state.sendError = action.payload
      })
  },
})

export const { clearError, clearSendSuccess, setPage, setMockRewards } = rewardsSlice.actions
export default rewardsSlice.reducer
