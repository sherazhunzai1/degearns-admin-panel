import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { bannersAPI } from '../../services/api'

// Async thunks
export const fetchBanners = createAsyncThunk(
  'banners/fetchBanners',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await bannersAPI.getBanners(params)
      return response.data.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch banners')
    }
  }
)

export const fetchBannerStatistics = createAsyncThunk(
  'banners/fetchStatistics',
  async (_, { rejectWithValue }) => {
    try {
      const response = await bannersAPI.getStatistics()
      return response.data.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch banner statistics')
    }
  }
)

export const fetchBannerById = createAsyncThunk(
  'banners/fetchById',
  async (bannerId, { rejectWithValue }) => {
    try {
      const response = await bannersAPI.getBanner(bannerId)
      return response.data.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch banner')
    }
  }
)

export const createBanner = createAsyncThunk(
  'banners/create',
  async (data, { rejectWithValue }) => {
    try {
      const response = await bannersAPI.createBanner(data)
      return response.data.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create banner')
    }
  }
)

export const updateBanner = createAsyncThunk(
  'banners/update',
  async ({ bannerId, data }, { rejectWithValue }) => {
    try {
      const response = await bannersAPI.updateBanner(bannerId, data)
      return response.data.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update banner')
    }
  }
)

export const toggleBannerStatus = createAsyncThunk(
  'banners/toggleStatus',
  async (bannerId, { rejectWithValue }) => {
    try {
      const response = await bannersAPI.toggleStatus(bannerId)
      return response.data.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to toggle banner status')
    }
  }
)

export const reorderBanners = createAsyncThunk(
  'banners/reorder',
  async (bannerOrders, { rejectWithValue }) => {
    try {
      const response = await bannersAPI.reorderBanners(bannerOrders)
      return response.data.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to reorder banners')
    }
  }
)

export const deleteBanner = createAsyncThunk(
  'banners/delete',
  async (bannerId, { rejectWithValue }) => {
    try {
      await bannersAPI.deleteBanner(bannerId)
      return bannerId
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete banner')
    }
  }
)

const initialState = {
  banners: [],
  selectedBanner: null,
  statistics: {
    totalBanners: 0,
    activeBanners: 0,
    inactiveBanners: 0,
    scheduledBanners: 0,
    expiredBanners: 0,
    currentlyVisibleCount: 0
  },
  pagination: {
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0
  },
  filters: {
    search: '',
    isActive: undefined,
    sortBy: 'position',
    sortOrder: 'ASC'
  },
  loading: false,
  statsLoading: false,
  actionLoading: false,
  error: null,
  actionSuccess: false,
}

const bannersSlice = createSlice({
  name: 'banners',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null
    },
    clearActionSuccess: (state) => {
      state.actionSuccess = false
    },
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload }
      state.pagination.page = 1
    },
    setPage: (state, action) => {
      state.pagination.page = action.payload
    },
    clearSelectedBanner: (state) => {
      state.selectedBanner = null
    },
    updateBannerLocally: (state, action) => {
      const index = state.banners.findIndex(b => b.id === action.payload.id)
      if (index !== -1) {
        state.banners[index] = { ...state.banners[index], ...action.payload }
      }
    },
    reorderBannersLocally: (state, action) => {
      state.banners = action.payload
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Banners
      .addCase(fetchBanners.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchBanners.fulfilled, (state, action) => {
        state.loading = false
        state.banners = action.payload?.banners || []
        if (action.payload?.pagination) {
          state.pagination = {
            ...state.pagination,
            ...action.payload.pagination
          }
        }
      })
      .addCase(fetchBanners.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })

      // Fetch Statistics
      .addCase(fetchBannerStatistics.pending, (state) => {
        state.statsLoading = true
      })
      .addCase(fetchBannerStatistics.fulfilled, (state, action) => {
        state.statsLoading = false
        if (action.payload) {
          state.statistics = action.payload
        }
      })
      .addCase(fetchBannerStatistics.rejected, (state, action) => {
        state.statsLoading = false
        state.error = action.payload
      })

      // Fetch Banner by ID
      .addCase(fetchBannerById.pending, (state) => {
        state.actionLoading = true
      })
      .addCase(fetchBannerById.fulfilled, (state, action) => {
        state.actionLoading = false
        state.selectedBanner = action.payload?.banner || null
      })
      .addCase(fetchBannerById.rejected, (state, action) => {
        state.actionLoading = false
        state.error = action.payload
      })

      // Create Banner
      .addCase(createBanner.pending, (state) => {
        state.actionLoading = true
        state.error = null
        state.actionSuccess = false
      })
      .addCase(createBanner.fulfilled, (state, action) => {
        state.actionLoading = false
        state.actionSuccess = true
        if (action.payload?.banner) {
          state.banners.unshift(action.payload.banner)
          state.statistics.totalBanners += 1
          if (action.payload.banner.isActive) {
            state.statistics.activeBanners += 1
          } else {
            state.statistics.inactiveBanners += 1
          }
        }
      })
      .addCase(createBanner.rejected, (state, action) => {
        state.actionLoading = false
        state.error = action.payload
      })

      // Update Banner
      .addCase(updateBanner.pending, (state) => {
        state.actionLoading = true
        state.error = null
        state.actionSuccess = false
      })
      .addCase(updateBanner.fulfilled, (state, action) => {
        state.actionLoading = false
        state.actionSuccess = true
        if (action.payload?.banner) {
          const index = state.banners.findIndex(b => b.id === action.payload.banner.id)
          if (index !== -1) {
            state.banners[index] = action.payload.banner
          }
        }
      })
      .addCase(updateBanner.rejected, (state, action) => {
        state.actionLoading = false
        state.error = action.payload
      })

      // Toggle Status
      .addCase(toggleBannerStatus.pending, (state) => {
        state.actionLoading = true
      })
      .addCase(toggleBannerStatus.fulfilled, (state, action) => {
        state.actionLoading = false
        if (action.payload?.banner) {
          const index = state.banners.findIndex(b => b.id === action.payload.banner.id)
          if (index !== -1) {
            const wasActive = state.banners[index].isActive
            state.banners[index] = action.payload.banner
            if (wasActive && !action.payload.banner.isActive) {
              state.statistics.activeBanners -= 1
              state.statistics.inactiveBanners += 1
            } else if (!wasActive && action.payload.banner.isActive) {
              state.statistics.activeBanners += 1
              state.statistics.inactiveBanners -= 1
            }
          }
        }
      })
      .addCase(toggleBannerStatus.rejected, (state, action) => {
        state.actionLoading = false
        state.error = action.payload
      })

      // Reorder Banners
      .addCase(reorderBanners.pending, (state) => {
        state.actionLoading = true
      })
      .addCase(reorderBanners.fulfilled, (state) => {
        state.actionLoading = false
        state.actionSuccess = true
      })
      .addCase(reorderBanners.rejected, (state, action) => {
        state.actionLoading = false
        state.error = action.payload
      })

      // Delete Banner
      .addCase(deleteBanner.pending, (state) => {
        state.actionLoading = true
        state.error = null
      })
      .addCase(deleteBanner.fulfilled, (state, action) => {
        state.actionLoading = false
        const deletedBanner = state.banners.find(b => b.id === action.payload)
        state.banners = state.banners.filter(b => b.id !== action.payload)
        state.statistics.totalBanners -= 1
        if (deletedBanner?.isActive) {
          state.statistics.activeBanners -= 1
        } else {
          state.statistics.inactiveBanners -= 1
        }
        state.actionSuccess = true
      })
      .addCase(deleteBanner.rejected, (state, action) => {
        state.actionLoading = false
        state.error = action.payload
      })
  },
})

export const {
  clearError,
  clearActionSuccess,
  setFilters,
  setPage,
  clearSelectedBanner,
  updateBannerLocally,
  reorderBannersLocally
} = bannersSlice.actions

export default bannersSlice.reducer
