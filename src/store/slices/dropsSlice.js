import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { dropsAPI } from '../../services/api'

// Async thunks
export const fetchDrops = createAsyncThunk(
  'drops/fetchDrops',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await dropsAPI.getDrops(params)
      return response.data.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch drops')
    }
  }
)

export const fetchDropStatistics = createAsyncThunk(
  'drops/fetchStatistics',
  async (_, { rejectWithValue }) => {
    try {
      const response = await dropsAPI.getStatistics()
      return response.data.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch drop statistics')
    }
  }
)

export const fetchPendingFeesDrops = createAsyncThunk(
  'drops/fetchPendingFees',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await dropsAPI.getPendingFees(params)
      return response.data.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch pending fees drops')
    }
  }
)

export const fetchDropDetails = createAsyncThunk(
  'drops/fetchDetails',
  async (dropId, { rejectWithValue }) => {
    try {
      const response = await dropsAPI.getDrop(dropId)
      return response.data.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch drop details')
    }
  }
)

export const updateDrop = createAsyncThunk(
  'drops/update',
  async ({ dropId, data }, { rejectWithValue }) => {
    try {
      const response = await dropsAPI.updateDrop(dropId, data)
      return response.data.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update drop')
    }
  }
)

export const updateDropStatus = createAsyncThunk(
  'drops/updateStatus',
  async ({ dropId, status, reason }, { rejectWithValue }) => {
    try {
      const response = await dropsAPI.updateStatus(dropId, status, reason)
      return { dropId, ...response.data.data }
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update drop status')
    }
  }
)

export const pauseDrop = createAsyncThunk(
  'drops/pause',
  async ({ dropId, reason }, { rejectWithValue }) => {
    try {
      const response = await dropsAPI.pauseDrop(dropId, reason)
      return { dropId, ...response.data.data }
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to pause drop')
    }
  }
)

export const resumeDrop = createAsyncThunk(
  'drops/resume',
  async ({ dropId, status, enableMinting, reason }, { rejectWithValue }) => {
    try {
      const response = await dropsAPI.resumeDrop(dropId, status, enableMinting, reason)
      return { dropId, ...response.data.data }
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to resume drop')
    }
  }
)

export const updateFeesStatus = createAsyncThunk(
  'drops/updateFeesStatus',
  async ({ dropId, platformFeesStatus, transactionHash, reason }, { rejectWithValue }) => {
    try {
      const response = await dropsAPI.updateFeesStatus(dropId, platformFeesStatus, transactionHash, reason)
      return { dropId, ...response.data.data }
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update fees status')
    }
  }
)

export const deleteDrop = createAsyncThunk(
  'drops/delete',
  async ({ dropId, reason }, { rejectWithValue }) => {
    try {
      await dropsAPI.deleteDrop(dropId, reason)
      return { dropId }
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete drop')
    }
  }
)

export const fetchDropMints = createAsyncThunk(
  'drops/fetchMints',
  async ({ dropId, params = {} }, { rejectWithValue }) => {
    try {
      const response = await dropsAPI.getDropMints(dropId, params)
      return response.data.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch drop mints')
    }
  }
)

const initialState = {
  drops: [],
  selectedDrop: null,
  dropMints: [],
  statistics: {
    totalDrops: 0,
    statusBreakdown: {
      active: 0,
      paused: 0,
      draft: 0,
      ended: 0,
      soldOut: 0
    },
    feesStatus: {
      paid: 0,
      pending: 0
    },
    totalMints: 0,
    totalPlatformFeesCollected: '0',
    totalPlatformFeesCollectedXrp: '0',
    totalMintRevenue: '0',
    totalMintRevenueXrp: '0',
    newDrops: {
      today: 0,
      thisWeek: 0,
      thisMonth: 0
    }
  },
  pendingFeesDrops: [],
  pagination: {
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  },
  filters: {
    search: '',
    status: undefined,
    platformFeesStatus: undefined,
    creatorWallet: undefined,
    sortBy: 'createdAt',
    sortOrder: 'DESC',
  },
  loading: false,
  statsLoading: false,
  actionLoading: false,
  error: null,
}

const dropsSlice = createSlice({
  name: 'drops',
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
    clearSelectedDrop: (state) => {
      state.selectedDrop = null
      state.dropMints = []
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Drops
      .addCase(fetchDrops.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchDrops.fulfilled, (state, action) => {
        state.loading = false
        state.drops = action.payload?.drops || []
        state.pagination = action.payload?.pagination || state.pagination
      })
      .addCase(fetchDrops.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })

      // Fetch Statistics
      .addCase(fetchDropStatistics.pending, (state) => {
        state.statsLoading = true
      })
      .addCase(fetchDropStatistics.fulfilled, (state, action) => {
        state.statsLoading = false
        if (action.payload) {
          state.statistics = action.payload
        }
      })
      .addCase(fetchDropStatistics.rejected, (state, action) => {
        state.statsLoading = false
        state.error = action.payload
      })

      // Fetch Pending Fees Drops
      .addCase(fetchPendingFeesDrops.fulfilled, (state, action) => {
        state.pendingFeesDrops = action.payload?.drops || []
      })

      // Fetch Drop Details
      .addCase(fetchDropDetails.pending, (state) => {
        state.loading = true
      })
      .addCase(fetchDropDetails.fulfilled, (state, action) => {
        state.loading = false
        state.selectedDrop = action.payload
      })
      .addCase(fetchDropDetails.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })

      // Update Drop
      .addCase(updateDrop.pending, (state) => {
        state.actionLoading = true
      })
      .addCase(updateDrop.fulfilled, (state, action) => {
        state.actionLoading = false
        if (action.payload?.drop) {
          const index = state.drops.findIndex((d) => d.id === action.payload.drop.id)
          if (index !== -1) {
            state.drops[index] = action.payload.drop
          }
          if (state.selectedDrop?.id === action.payload.drop.id) {
            state.selectedDrop = { ...state.selectedDrop, ...action.payload.drop }
          }
        }
      })
      .addCase(updateDrop.rejected, (state, action) => {
        state.actionLoading = false
        state.error = action.payload
      })

      // Update Status
      .addCase(updateDropStatus.pending, (state) => {
        state.actionLoading = true
      })
      .addCase(updateDropStatus.fulfilled, (state, action) => {
        state.actionLoading = false
        const index = state.drops.findIndex((d) => d.id === action.payload.dropId)
        if (index !== -1 && action.payload.drop) {
          state.drops[index] = action.payload.drop
        }
      })
      .addCase(updateDropStatus.rejected, (state, action) => {
        state.actionLoading = false
        state.error = action.payload
      })

      // Pause Drop
      .addCase(pauseDrop.pending, (state) => {
        state.actionLoading = true
      })
      .addCase(pauseDrop.fulfilled, (state, action) => {
        state.actionLoading = false
        const index = state.drops.findIndex((d) => d.id === action.payload.dropId)
        if (index !== -1) {
          state.drops[index].status = 'paused'
        }
      })
      .addCase(pauseDrop.rejected, (state, action) => {
        state.actionLoading = false
        state.error = action.payload
      })

      // Resume Drop
      .addCase(resumeDrop.pending, (state) => {
        state.actionLoading = true
      })
      .addCase(resumeDrop.fulfilled, (state, action) => {
        state.actionLoading = false
        const index = state.drops.findIndex((d) => d.id === action.payload.dropId)
        if (index !== -1) {
          state.drops[index].status = 'active'
        }
      })
      .addCase(resumeDrop.rejected, (state, action) => {
        state.actionLoading = false
        state.error = action.payload
      })

      // Update Fees Status
      .addCase(updateFeesStatus.pending, (state) => {
        state.actionLoading = true
      })
      .addCase(updateFeesStatus.fulfilled, (state, action) => {
        state.actionLoading = false
        const index = state.drops.findIndex((d) => d.id === action.payload.dropId)
        if (index !== -1 && action.payload.drop) {
          state.drops[index] = action.payload.drop
        }
      })
      .addCase(updateFeesStatus.rejected, (state, action) => {
        state.actionLoading = false
        state.error = action.payload
      })

      // Delete Drop
      .addCase(deleteDrop.pending, (state) => {
        state.actionLoading = true
      })
      .addCase(deleteDrop.fulfilled, (state, action) => {
        state.actionLoading = false
        state.drops = state.drops.filter((d) => d.id !== action.payload.dropId)
        if (state.selectedDrop?.id === action.payload.dropId) {
          state.selectedDrop = null
        }
      })
      .addCase(deleteDrop.rejected, (state, action) => {
        state.actionLoading = false
        state.error = action.payload
      })

      // Fetch Drop Mints
      .addCase(fetchDropMints.fulfilled, (state, action) => {
        state.dropMints = action.payload?.mints || []
      })
  },
})

export const { clearError, setFilters, setPage, clearSelectedDrop } = dropsSlice.actions
export default dropsSlice.reducer
