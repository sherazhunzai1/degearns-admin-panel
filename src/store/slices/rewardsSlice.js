import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { rewardsAPI } from '../../services/api'

// Async thunks
export const fetchTopPerformers = createAsyncThunk(
  'rewards/fetchTopPerformers',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await rewardsAPI.getTopPerformers(params)
      return response.data.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch top performers')
    }
  }
)

export const fetchTopTraders = createAsyncThunk(
  'rewards/fetchTopTraders',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await rewardsAPI.getTopTraders(params)
      return response.data.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch top traders')
    }
  }
)

export const fetchTopCreators = createAsyncThunk(
  'rewards/fetchTopCreators',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await rewardsAPI.getTopCreators(params)
      return response.data.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch top creators')
    }
  }
)

export const fetchTopInfluencers = createAsyncThunk(
  'rewards/fetchTopInfluencers',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await rewardsAPI.getTopInfluencers(params)
      return response.data.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch top influencers')
    }
  }
)

export const fetchRewardConfig = createAsyncThunk(
  'rewards/fetchConfig',
  async (_, { rejectWithValue }) => {
    try {
      const response = await rewardsAPI.getConfig()
      return response.data.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch reward config')
    }
  }
)

export const distributeRewards = createAsyncThunk(
  'rewards/distribute',
  async (data, { rejectWithValue }) => {
    try {
      const response = await rewardsAPI.distribute(data)
      return response.data.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to distribute rewards')
    }
  }
)

export const fetchRewardHistory = createAsyncThunk(
  'rewards/fetchHistory',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await rewardsAPI.getHistory(params)
      return response.data.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch reward history')
    }
  }
)

export const fetchRewardSummary = createAsyncThunk(
  'rewards/fetchSummary',
  async (year, { rejectWithValue }) => {
    try {
      const response = await rewardsAPI.getSummary(year)
      return response.data.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch reward summary')
    }
  }
)

const initialState = {
  // Top performers data
  topPerformers: {
    traders: [],
    creators: [],
    influencers: [],
    period: {
      month: new Date().getMonth() + 1,
      year: new Date().getFullYear()
    }
  },
  // Reward configuration
  rewardConfig: {
    trader: {},
    creator: {},
    influencer: {}
  },
  // Reward history
  history: {
    rewards: [],
    totals: {
      totalDistributed: '0',
      totalDistributedXrp: '0.000000',
      totalRewards: 0
    },
    pagination: {
      page: 1,
      limit: 20,
      total: 0,
      totalPages: 0
    }
  },
  // Yearly summary
  summary: {
    year: new Date().getFullYear(),
    monthlyBreakdown: {},
    yearTotal: {
      amount: '0',
      amountXrp: '0.000000',
      count: 0
    }
  },
  // Distribution results
  distributionResults: null,
  // Loading states
  loading: false,
  performersLoading: false,
  historyLoading: false,
  distributing: false,
  error: null,
}

const rewardsSlice = createSlice({
  name: 'rewards',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null
    },
    clearDistributionResults: (state) => {
      state.distributionResults = null
    },
    setPeriod: (state, action) => {
      state.topPerformers.period = action.payload
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Top Performers
      .addCase(fetchTopPerformers.pending, (state) => {
        state.performersLoading = true
        state.error = null
      })
      .addCase(fetchTopPerformers.fulfilled, (state, action) => {
        state.performersLoading = false
        if (action.payload) {
          state.topPerformers = {
            traders: action.payload.traders || [],
            creators: action.payload.creators || [],
            influencers: action.payload.influencers || [],
            period: action.payload.period || state.topPerformers.period
          }
        }
      })
      .addCase(fetchTopPerformers.rejected, (state, action) => {
        state.performersLoading = false
        state.error = action.payload
      })

      // Fetch Top Traders
      .addCase(fetchTopTraders.pending, (state) => {
        state.performersLoading = true
      })
      .addCase(fetchTopTraders.fulfilled, (state, action) => {
        state.performersLoading = false
        if (action.payload?.topPerformers) {
          state.topPerformers.traders = action.payload.topPerformers
        }
        if (action.payload?.period) {
          state.topPerformers.period = action.payload.period
        }
      })
      .addCase(fetchTopTraders.rejected, (state, action) => {
        state.performersLoading = false
        state.error = action.payload
      })

      // Fetch Top Creators
      .addCase(fetchTopCreators.pending, (state) => {
        state.performersLoading = true
      })
      .addCase(fetchTopCreators.fulfilled, (state, action) => {
        state.performersLoading = false
        if (action.payload?.topPerformers) {
          state.topPerformers.creators = action.payload.topPerformers
        }
        if (action.payload?.period) {
          state.topPerformers.period = action.payload.period
        }
      })
      .addCase(fetchTopCreators.rejected, (state, action) => {
        state.performersLoading = false
        state.error = action.payload
      })

      // Fetch Top Influencers
      .addCase(fetchTopInfluencers.pending, (state) => {
        state.performersLoading = true
      })
      .addCase(fetchTopInfluencers.fulfilled, (state, action) => {
        state.performersLoading = false
        if (action.payload?.topPerformers) {
          state.topPerformers.influencers = action.payload.topPerformers
        }
        if (action.payload?.period) {
          state.topPerformers.period = action.payload.period
        }
      })
      .addCase(fetchTopInfluencers.rejected, (state, action) => {
        state.performersLoading = false
        state.error = action.payload
      })

      // Fetch Reward Config
      .addCase(fetchRewardConfig.pending, (state) => {
        state.loading = true
      })
      .addCase(fetchRewardConfig.fulfilled, (state, action) => {
        state.loading = false
        if (action.payload?.rewardConfig) {
          state.rewardConfig = action.payload.rewardConfig
        }
      })
      .addCase(fetchRewardConfig.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })

      // Distribute Rewards
      .addCase(distributeRewards.pending, (state) => {
        state.distributing = true
        state.error = null
      })
      .addCase(distributeRewards.fulfilled, (state, action) => {
        state.distributing = false
        state.distributionResults = action.payload
      })
      .addCase(distributeRewards.rejected, (state, action) => {
        state.distributing = false
        state.error = action.payload
      })

      // Fetch Reward History
      .addCase(fetchRewardHistory.pending, (state) => {
        state.historyLoading = true
      })
      .addCase(fetchRewardHistory.fulfilled, (state, action) => {
        state.historyLoading = false
        if (action.payload) {
          state.history = {
            rewards: action.payload.rewards || [],
            totals: action.payload.totals || state.history.totals,
            pagination: action.payload.pagination || state.history.pagination
          }
        }
      })
      .addCase(fetchRewardHistory.rejected, (state, action) => {
        state.historyLoading = false
        state.error = action.payload
      })

      // Fetch Reward Summary
      .addCase(fetchRewardSummary.pending, (state) => {
        state.loading = true
      })
      .addCase(fetchRewardSummary.fulfilled, (state, action) => {
        state.loading = false
        if (action.payload) {
          state.summary = {
            year: action.payload.year || state.summary.year,
            monthlyBreakdown: action.payload.monthlyBreakdown || {},
            yearTotal: action.payload.yearTotal || state.summary.yearTotal
          }
        }
      })
      .addCase(fetchRewardSummary.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
  },
})

export const { clearError, clearDistributionResults, setPeriod } = rewardsSlice.actions
export default rewardsSlice.reducer
