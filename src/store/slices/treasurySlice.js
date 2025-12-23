import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { treasuryAPI } from '../../services/api'

// Async thunks
export const fetchTreasury = createAsyncThunk(
  'treasury/fetchTreasury',
  async (_, { rejectWithValue }) => {
    try {
      const response = await treasuryAPI.getTreasury()
      return response.data.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch treasury')
    }
  }
)

export const fetchTreasuryStatistics = createAsyncThunk(
  'treasury/fetchStatistics',
  async (year, { rejectWithValue }) => {
    try {
      const response = await treasuryAPI.getStatistics(year)
      return response.data.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch treasury statistics')
    }
  }
)

export const fetchTreasuryHistory = createAsyncThunk(
  'treasury/fetchHistory',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await treasuryAPI.getHistory(params)
      return response.data.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch distribution history')
    }
  }
)

export const updateTreasury = createAsyncThunk(
  'treasury/update',
  async (data, { rejectWithValue }) => {
    try {
      const response = await treasuryAPI.updateTreasury(data)
      return response.data.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update treasury')
    }
  }
)

export const fetchTreasuryDebug = createAsyncThunk(
  'treasury/fetchDebug',
  async (_, { rejectWithValue }) => {
    try {
      const response = await treasuryAPI.getDebug()
      return response.data.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch debug info')
    }
  }
)

const initialState = {
  // Treasury wallet data
  wallet: null,
  balance: null,
  thisMonth: null,
  allTime: null,

  // Statistics
  statistics: null,
  selectedYear: new Date().getFullYear(),

  // Distribution history
  history: {
    distributions: [],
    summary: null,
    pagination: {
      page: 1,
      limit: 20,
      total: 0,
      totalPages: 0
    }
  },
  historyFilters: {
    month: undefined,
    year: undefined,
    category: undefined,
    status: undefined
  },

  // Debug info
  debug: null,

  // Loading states
  loading: false,
  statsLoading: false,
  historyLoading: false,
  updateLoading: false,
  debugLoading: false,

  // Error and success
  error: null,
  updateSuccess: false
}

const treasurySlice = createSlice({
  name: 'treasury',
  initialState,
  reducers: {
    setSelectedYear: (state, action) => {
      state.selectedYear = action.payload
    },
    setHistoryFilters: (state, action) => {
      state.historyFilters = { ...state.historyFilters, ...action.payload }
      state.history.pagination.page = 1 // Reset to first page on filter change
    },
    setHistoryPage: (state, action) => {
      state.history.pagination.page = action.payload
    },
    clearError: (state) => {
      state.error = null
    },
    clearUpdateSuccess: (state) => {
      state.updateSuccess = false
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch Treasury
      .addCase(fetchTreasury.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchTreasury.fulfilled, (state, action) => {
        state.loading = false
        state.wallet = action.payload.wallet
        state.balance = action.payload.balance
        state.thisMonth = action.payload.thisMonth
        state.allTime = action.payload.allTime
      })
      .addCase(fetchTreasury.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })

      // Fetch Statistics
      .addCase(fetchTreasuryStatistics.pending, (state) => {
        state.statsLoading = true
      })
      .addCase(fetchTreasuryStatistics.fulfilled, (state, action) => {
        state.statsLoading = false
        state.statistics = action.payload
      })
      .addCase(fetchTreasuryStatistics.rejected, (state, action) => {
        state.statsLoading = false
        state.error = action.payload
      })

      // Fetch History
      .addCase(fetchTreasuryHistory.pending, (state) => {
        state.historyLoading = true
      })
      .addCase(fetchTreasuryHistory.fulfilled, (state, action) => {
        state.historyLoading = false
        state.history.distributions = action.payload.distributions || []
        state.history.summary = action.payload.summary || null
        state.history.pagination = action.payload.pagination || state.history.pagination
      })
      .addCase(fetchTreasuryHistory.rejected, (state, action) => {
        state.historyLoading = false
        state.error = action.payload
      })

      // Update Treasury
      .addCase(updateTreasury.pending, (state) => {
        state.updateLoading = true
        state.updateSuccess = false
      })
      .addCase(updateTreasury.fulfilled, (state, action) => {
        state.updateLoading = false
        state.updateSuccess = true
        if (action.payload.wallet) {
          state.wallet = { ...state.wallet, ...action.payload.wallet }
        }
      })
      .addCase(updateTreasury.rejected, (state, action) => {
        state.updateLoading = false
        state.error = action.payload
      })

      // Fetch Debug
      .addCase(fetchTreasuryDebug.pending, (state) => {
        state.debugLoading = true
      })
      .addCase(fetchTreasuryDebug.fulfilled, (state, action) => {
        state.debugLoading = false
        state.debug = action.payload
      })
      .addCase(fetchTreasuryDebug.rejected, (state, action) => {
        state.debugLoading = false
        state.error = action.payload
      })
  }
})

export const {
  setSelectedYear,
  setHistoryFilters,
  setHistoryPage,
  clearError,
  clearUpdateSuccess
} = treasurySlice.actions

export default treasurySlice.reducer
