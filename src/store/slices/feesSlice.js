import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { feesAPI } from '../../services/api'

// Async thunks
export const fetchFeesOverview = createAsyncThunk(
  'fees/fetchOverview',
  async (_, { rejectWithValue }) => {
    try {
      const response = await feesAPI.getOverview()
      return response.data.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch fees overview')
    }
  }
)

export const fetchFeeTransactions = createAsyncThunk(
  'fees/fetchTransactions',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await feesAPI.getTransactions(params)
      return response.data.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch fee transactions')
    }
  }
)

export const fetchFeeStatistics = createAsyncThunk(
  'fees/fetchStatistics',
  async (period = '30d', { rejectWithValue }) => {
    try {
      const response = await feesAPI.getStatistics(period)
      return response.data.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch fee statistics')
    }
  }
)

export const fetchPendingFees = createAsyncThunk(
  'fees/fetchPending',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await feesAPI.getPending(params)
      return response.data.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch pending fees')
    }
  }
)

export const fetchFailedFees = createAsyncThunk(
  'fees/fetchFailed',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await feesAPI.getFailed(params)
      return response.data.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch failed fees')
    }
  }
)

export const exportFeeReport = createAsyncThunk(
  'fees/exportReport',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await feesAPI.exportReport(params)
      return response.data.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to export fee report')
    }
  }
)

export const markFeesPaid = createAsyncThunk(
  'fees/markPaid',
  async ({ dropId, transactionHash, reason }, { rejectWithValue }) => {
    try {
      const response = await feesAPI.markPaid(dropId, transactionHash, reason)
      return { dropId, ...response.data.data }
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to mark fees as paid')
    }
  }
)

export const markFeesRefunded = createAsyncThunk(
  'fees/markRefunded',
  async ({ dropId, transactionHash, reason }, { rejectWithValue }) => {
    try {
      const response = await feesAPI.markRefunded(dropId, transactionHash, reason)
      return { dropId, ...response.data.data }
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to mark fees as refunded')
    }
  }
)

const initialState = {
  overview: {
    platformFees: {
      collected: '0',
      collectedXrp: '0',
      pending: '0',
      pendingXrp: '0',
      failed: '0',
      failedXrp: '0',
      refunded: '0',
      refundedXrp: '0'
    },
    mintRevenue: {
      total: '0',
      totalXrp: '0'
    },
    drops: {
      paidFees: 0,
      pendingFees: 0
    },
    platformFeesWallet: {
      address: '',
      label: ''
    }
  },
  transactions: [],
  statistics: null,
  pendingFees: [],
  failedFees: [],
  exportReport: null,
  pagination: {
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  },
  filters: {
    status: undefined,
    sortBy: 'updatedAt',
    sortOrder: 'DESC',
  },
  loading: false,
  actionLoading: false,
  error: null,
}

const feesSlice = createSlice({
  name: 'fees',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null
    },
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload }
      state.pagination.page = 1
    },
    setPage: (state, action) => {
      state.pagination.page = action.payload
    },
    clearExportReport: (state) => {
      state.exportReport = null
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Overview
      .addCase(fetchFeesOverview.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchFeesOverview.fulfilled, (state, action) => {
        state.loading = false
        if (action.payload) {
          state.overview = action.payload
        }
      })
      .addCase(fetchFeesOverview.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })

      // Fetch Transactions
      .addCase(fetchFeeTransactions.pending, (state) => {
        state.loading = true
      })
      .addCase(fetchFeeTransactions.fulfilled, (state, action) => {
        state.loading = false
        state.transactions = action.payload?.drops || []
        state.pagination = action.payload?.pagination || state.pagination
      })
      .addCase(fetchFeeTransactions.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })

      // Fetch Statistics
      .addCase(fetchFeeStatistics.fulfilled, (state, action) => {
        state.statistics = action.payload
      })

      // Fetch Pending Fees
      .addCase(fetchPendingFees.fulfilled, (state, action) => {
        state.pendingFees = action.payload?.drops || []
      })

      // Fetch Failed Fees
      .addCase(fetchFailedFees.fulfilled, (state, action) => {
        state.failedFees = action.payload?.drops || []
      })

      // Export Report
      .addCase(exportFeeReport.pending, (state) => {
        state.actionLoading = true
      })
      .addCase(exportFeeReport.fulfilled, (state, action) => {
        state.actionLoading = false
        state.exportReport = action.payload
      })
      .addCase(exportFeeReport.rejected, (state, action) => {
        state.actionLoading = false
        state.error = action.payload
      })

      // Mark Paid
      .addCase(markFeesPaid.pending, (state) => {
        state.actionLoading = true
      })
      .addCase(markFeesPaid.fulfilled, (state, action) => {
        state.actionLoading = false
        // Update transaction in list
        const index = state.transactions.findIndex((t) => t.id === action.payload.dropId)
        if (index !== -1) {
          state.transactions[index].platformFeesStatus = 'paid'
        }
        // Remove from pending
        state.pendingFees = state.pendingFees.filter((d) => d.id !== action.payload.dropId)
      })
      .addCase(markFeesPaid.rejected, (state, action) => {
        state.actionLoading = false
        state.error = action.payload
      })

      // Mark Refunded
      .addCase(markFeesRefunded.pending, (state) => {
        state.actionLoading = true
      })
      .addCase(markFeesRefunded.fulfilled, (state, action) => {
        state.actionLoading = false
        const index = state.transactions.findIndex((t) => t.id === action.payload.dropId)
        if (index !== -1) {
          state.transactions[index].platformFeesStatus = 'refunded'
        }
      })
      .addCase(markFeesRefunded.rejected, (state, action) => {
        state.actionLoading = false
        state.error = action.payload
      })
  },
})

export const { clearError, setFilters, setPage, clearExportReport } = feesSlice.actions
export default feesSlice.reducer
