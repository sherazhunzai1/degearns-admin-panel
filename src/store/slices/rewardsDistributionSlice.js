import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { rewardsDistributionAPI } from '../../services/api'

// ============ Rankings Thunks ============

export const fetchFormula = createAsyncThunk(
  'rewardsDistribution/fetchFormula',
  async (_, { rejectWithValue }) => {
    try {
      const response = await rewardsDistributionAPI.getFormula()
      return response.data.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch formula')
    }
  }
)

export const fetchRankings = createAsyncThunk(
  'rewardsDistribution/fetchRankings',
  async (params, { rejectWithValue }) => {
    try {
      const response = await rewardsDistributionAPI.getRankings(params)
      return response.data.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch rankings')
    }
  }
)

export const setRankings = createAsyncThunk(
  'rewardsDistribution/setRankings',
  async (data, { rejectWithValue }) => {
    try {
      const response = await rewardsDistributionAPI.setRankings(data)
      return response.data.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to set rankings')
    }
  }
)

export const finalizeRanking = createAsyncThunk(
  'rewardsDistribution/finalizeRanking',
  async ({ month, year, category }, { rejectWithValue }) => {
    try {
      const response = await rewardsDistributionAPI.finalizeRanking(month, year, category)
      return response.data.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to finalize ranking')
    }
  }
)

export const unfinalizeRanking = createAsyncThunk(
  'rewardsDistribution/unfinalizeRanking',
  async ({ month, year, category }, { rejectWithValue }) => {
    try {
      const response = await rewardsDistributionAPI.unfinalizeRanking(month, year, category)
      return response.data.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to unfinalize ranking')
    }
  }
)

export const deleteRanking = createAsyncThunk(
  'rewardsDistribution/deleteRanking',
  async ({ year, month, category }, { rejectWithValue }) => {
    try {
      await rewardsDistributionAPI.deleteRanking(year, month, category)
      return { category }
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete ranking')
    }
  }
)

// ============ Distribution Thunks ============

export const fetchDistributionStatus = createAsyncThunk(
  'rewardsDistribution/fetchDistributionStatus',
  async ({ month, year }, { rejectWithValue }) => {
    try {
      const response = await rewardsDistributionAPI.getDistributionStatus(month, year)
      return response.data.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch distribution status')
    }
  }
)

export const executeDistribution = createAsyncThunk(
  'rewardsDistribution/executeDistribution',
  async ({ month, year, dryRun = false }, { rejectWithValue }) => {
    try {
      const response = await rewardsDistributionAPI.executeDistribution(month, year, dryRun)
      return { ...response.data.data, dryRun }
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to execute distribution')
    }
  }
)

export const fetchDistributionBatch = createAsyncThunk(
  'rewardsDistribution/fetchDistributionBatch',
  async (batchId, { rejectWithValue }) => {
    try {
      const response = await rewardsDistributionAPI.getDistributionBatch(batchId)
      return response.data.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch batch details')
    }
  }
)

export const retryDistribution = createAsyncThunk(
  'rewardsDistribution/retryDistribution',
  async (batchId, { rejectWithValue }) => {
    try {
      const response = await rewardsDistributionAPI.retryDistribution(batchId)
      return response.data.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to retry distribution')
    }
  }
)

// ============ Statistics Thunks ============

export const fetchStats = createAsyncThunk(
  'rewardsDistribution/fetchStats',
  async (_, { rejectWithValue }) => {
    try {
      const response = await rewardsDistributionAPI.getStats()
      return response.data.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch stats')
    }
  }
)

export const fetchTransactions = createAsyncThunk(
  'rewardsDistribution/fetchTransactions',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await rewardsDistributionAPI.getTransactions(params)
      return response.data.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch transactions')
    }
  }
)

export const fetchMonthlyBreakdown = createAsyncThunk(
  'rewardsDistribution/fetchMonthlyBreakdown',
  async (year, { rejectWithValue }) => {
    try {
      const response = await rewardsDistributionAPI.getMonthlyBreakdown(year)
      return response.data.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch monthly breakdown')
    }
  }
)

const initialState = {
  // Period selection
  selectedMonth: new Date().getMonth() + 1,
  selectedYear: new Date().getFullYear(),

  // Formula
  formula: null,
  formulaLoading: false,

  // Rankings
  rankings: null,
  categoryStatus: null,
  readyForDistribution: false,
  rankingsLoading: false,
  rankingsActionLoading: false,

  // Distribution
  distributionStatus: null,
  distributionStatusLoading: false,
  distributionPreview: null,
  distributionResult: null,
  distributionLoading: false,

  // Batch
  currentBatch: null,
  batchLoading: false,

  // Statistics
  stats: null,
  statsLoading: false,

  // Transactions
  transactions: [],
  transactionsSummary: null,
  transactionsPagination: {
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0
  },
  transactionsFilters: {
    month: undefined,
    year: undefined,
    category: undefined,
    status: undefined
  },
  transactionsLoading: false,

  // Monthly breakdown
  monthlyBreakdown: null,
  breakdownYear: new Date().getFullYear(),
  breakdownLoading: false,

  // General
  error: null,
  successMessage: null
}

const rewardsDistributionSlice = createSlice({
  name: 'rewardsDistribution',
  initialState,
  reducers: {
    setSelectedPeriod: (state, action) => {
      state.selectedMonth = action.payload.month
      state.selectedYear = action.payload.year
    },
    setTransactionsPage: (state, action) => {
      state.transactionsPagination.page = action.payload
    },
    setTransactionsFilters: (state, action) => {
      state.transactionsFilters = { ...state.transactionsFilters, ...action.payload }
      state.transactionsPagination.page = 1
    },
    setBreakdownYear: (state, action) => {
      state.breakdownYear = action.payload
    },
    clearError: (state) => {
      state.error = null
    },
    clearSuccessMessage: (state) => {
      state.successMessage = null
    },
    clearDistributionPreview: (state) => {
      state.distributionPreview = null
    },
    clearDistributionResult: (state) => {
      state.distributionResult = null
    }
  },
  extraReducers: (builder) => {
    builder
      // Formula
      .addCase(fetchFormula.pending, (state) => {
        state.formulaLoading = true
      })
      .addCase(fetchFormula.fulfilled, (state, action) => {
        state.formulaLoading = false
        state.formula = action.payload
      })
      .addCase(fetchFormula.rejected, (state, action) => {
        state.formulaLoading = false
        state.error = action.payload
      })

      // Rankings
      .addCase(fetchRankings.pending, (state) => {
        state.rankingsLoading = true
      })
      .addCase(fetchRankings.fulfilled, (state, action) => {
        state.rankingsLoading = false
        state.rankings = action.payload.rankings
        state.categoryStatus = action.payload.categoryStatus
        state.readyForDistribution = action.payload.readyForDistribution
      })
      .addCase(fetchRankings.rejected, (state, action) => {
        state.rankingsLoading = false
        state.error = action.payload
      })

      // Set Rankings
      .addCase(setRankings.pending, (state) => {
        state.rankingsActionLoading = true
      })
      .addCase(setRankings.fulfilled, (state, action) => {
        state.rankingsActionLoading = false
        state.successMessage = `Rankings updated successfully`
      })
      .addCase(setRankings.rejected, (state, action) => {
        state.rankingsActionLoading = false
        state.error = action.payload
      })

      // Finalize Ranking
      .addCase(finalizeRanking.pending, (state) => {
        state.rankingsActionLoading = true
      })
      .addCase(finalizeRanking.fulfilled, (state, action) => {
        state.rankingsActionLoading = false
        state.successMessage = 'Ranking finalized successfully'
      })
      .addCase(finalizeRanking.rejected, (state, action) => {
        state.rankingsActionLoading = false
        state.error = action.payload
      })

      // Unfinalize Ranking
      .addCase(unfinalizeRanking.pending, (state) => {
        state.rankingsActionLoading = true
      })
      .addCase(unfinalizeRanking.fulfilled, (state, action) => {
        state.rankingsActionLoading = false
        state.successMessage = 'Ranking unfinalized - ready for editing'
      })
      .addCase(unfinalizeRanking.rejected, (state, action) => {
        state.rankingsActionLoading = false
        state.error = action.payload
      })

      // Delete Ranking
      .addCase(deleteRanking.pending, (state) => {
        state.rankingsActionLoading = true
      })
      .addCase(deleteRanking.fulfilled, (state, action) => {
        state.rankingsActionLoading = false
        state.successMessage = 'Ranking deleted successfully'
      })
      .addCase(deleteRanking.rejected, (state, action) => {
        state.rankingsActionLoading = false
        state.error = action.payload
      })

      // Distribution Status
      .addCase(fetchDistributionStatus.pending, (state) => {
        state.distributionStatusLoading = true
      })
      .addCase(fetchDistributionStatus.fulfilled, (state, action) => {
        state.distributionStatusLoading = false
        state.distributionStatus = action.payload
      })
      .addCase(fetchDistributionStatus.rejected, (state, action) => {
        state.distributionStatusLoading = false
        state.error = action.payload
      })

      // Execute Distribution
      .addCase(executeDistribution.pending, (state) => {
        state.distributionLoading = true
      })
      .addCase(executeDistribution.fulfilled, (state, action) => {
        state.distributionLoading = false
        if (action.payload.dryRun) {
          state.distributionPreview = action.payload
          state.successMessage = 'Distribution preview generated'
        } else {
          state.distributionResult = action.payload
          state.successMessage = 'Distribution executed successfully!'
        }
      })
      .addCase(executeDistribution.rejected, (state, action) => {
        state.distributionLoading = false
        state.error = action.payload
      })

      // Distribution Batch
      .addCase(fetchDistributionBatch.pending, (state) => {
        state.batchLoading = true
      })
      .addCase(fetchDistributionBatch.fulfilled, (state, action) => {
        state.batchLoading = false
        state.currentBatch = action.payload
      })
      .addCase(fetchDistributionBatch.rejected, (state, action) => {
        state.batchLoading = false
        state.error = action.payload
      })

      // Retry Distribution
      .addCase(retryDistribution.pending, (state) => {
        state.distributionLoading = true
      })
      .addCase(retryDistribution.fulfilled, (state, action) => {
        state.distributionLoading = false
        state.successMessage = 'Retry completed'
      })
      .addCase(retryDistribution.rejected, (state, action) => {
        state.distributionLoading = false
        state.error = action.payload
      })

      // Stats
      .addCase(fetchStats.pending, (state) => {
        state.statsLoading = true
      })
      .addCase(fetchStats.fulfilled, (state, action) => {
        state.statsLoading = false
        state.stats = action.payload
      })
      .addCase(fetchStats.rejected, (state, action) => {
        state.statsLoading = false
        state.error = action.payload
      })

      // Transactions
      .addCase(fetchTransactions.pending, (state) => {
        state.transactionsLoading = true
      })
      .addCase(fetchTransactions.fulfilled, (state, action) => {
        state.transactionsLoading = false
        state.transactions = action.payload.transactions || []
        state.transactionsSummary = action.payload.summary || null
        state.transactionsPagination = action.payload.pagination || state.transactionsPagination
      })
      .addCase(fetchTransactions.rejected, (state, action) => {
        state.transactionsLoading = false
        state.error = action.payload
      })

      // Monthly Breakdown
      .addCase(fetchMonthlyBreakdown.pending, (state) => {
        state.breakdownLoading = true
      })
      .addCase(fetchMonthlyBreakdown.fulfilled, (state, action) => {
        state.breakdownLoading = false
        state.monthlyBreakdown = action.payload
      })
      .addCase(fetchMonthlyBreakdown.rejected, (state, action) => {
        state.breakdownLoading = false
        state.error = action.payload
      })
  }
})

export const {
  setSelectedPeriod,
  setTransactionsPage,
  setTransactionsFilters,
  setBreakdownYear,
  clearError,
  clearSuccessMessage,
  clearDistributionPreview,
  clearDistributionResult
} = rewardsDistributionSlice.actions

export default rewardsDistributionSlice.reducer
