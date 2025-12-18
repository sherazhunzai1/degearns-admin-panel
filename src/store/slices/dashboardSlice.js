import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { dashboardAPI } from '../../services/api'

// Async thunks
export const fetchDashboardOverview = createAsyncThunk(
  'dashboard/fetchOverview',
  async (_, { rejectWithValue }) => {
    try {
      const response = await dashboardAPI.getOverview()
      return response.data.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch dashboard data')
    }
  }
)

export const fetchGrowthData = createAsyncThunk(
  'dashboard/fetchGrowth',
  async (period = '30d', { rejectWithValue }) => {
    try {
      const response = await dashboardAPI.getGrowth(period)
      return response.data.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch growth data')
    }
  }
)

export const fetchTopCreators = createAsyncThunk(
  'dashboard/fetchTopCreators',
  async ({ metric = 'mints', limit = 10 } = {}, { rejectWithValue }) => {
    try {
      const response = await dashboardAPI.getTopCreators(metric, limit)
      return response.data.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch top creators')
    }
  }
)

export const fetchRecentActivities = createAsyncThunk(
  'dashboard/fetchActivities',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await dashboardAPI.getActivities(params)
      return response.data.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch activities')
    }
  }
)

export const fetchPlatformHealth = createAsyncThunk(
  'dashboard/fetchHealth',
  async (_, { rejectWithValue }) => {
    try {
      const response = await dashboardAPI.getHealth()
      return response.data.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch platform health')
    }
  }
)

export const fetchRevenueData = createAsyncThunk(
  'dashboard/fetchRevenue',
  async (period = '30d', { rejectWithValue }) => {
    try {
      const response = await dashboardAPI.getRevenue(period)
      return response.data.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch revenue data')
    }
  }
)

// Fetch all dashboard data at once
export const fetchAllDashboardData = createAsyncThunk(
  'dashboard/fetchAll',
  async (_, { dispatch }) => {
    await Promise.all([
      dispatch(fetchDashboardOverview()),
      dispatch(fetchGrowthData()),
      dispatch(fetchTopCreators()),
      dispatch(fetchPlatformHealth()),
      dispatch(fetchRevenueData()),
    ])
  }
)

const initialState = {
  // Overview stats
  overview: {
    users: { total: 0, verified: 0, banned: 0, admins: 0, newToday: 0, newThisWeek: 0 },
    collections: { total: 0, verified: 0 },
    drops: { total: 0, active: 0, totalMints: 0 },
    social: { posts: 0, activePosts: 0, comments: 0, follows: 0 },
    revenue: {
      totalMintRevenue: '0',
      totalMintRevenueXrp: '0',
      totalPlatformFees: '0',
      totalPlatformFeesXrp: '0',
      totalVolume: '0',
      totalVolumeXrp: '0'
    }
  },
  // Growth data
  growth: {
    period: '30d',
    days: 30,
    userGrowth: [],
    dropGrowth: [],
    mintGrowth: [],
    postGrowth: []
  },
  // Top creators
  topCreators: {
    metric: 'mints',
    topCreators: []
  },
  // Recent activities
  activities: {
    items: [],
    pagination: { total: 0, page: 1, limit: 20, totalPages: 0 }
  },
  // Platform health
  health: {
    activity: {
      usersLast24h: 0,
      usersLastHour: 0,
      dropsLast24h: 0,
      mintsLast24h: 0,
      mintsLastHour: 0,
      postsLast24h: 0,
      adminActivitiesLast24h: 0
    },
    pendingItems: {
      pendingFeesDrops: 0,
      unverifiedCollections: 0,
      hiddenPosts: 0,
      bannedUsers: 0
    },
    timestamp: null
  },
  // Revenue data
  revenue: {
    period: '30d',
    days: 30,
    summary: {
      totalPlatformFees: '0',
      totalPlatformFeesXrp: '0',
      totalMintRevenue: '0',
      totalMintRevenueXrp: '0',
      totalMints: 0
    },
    daily: {
      platformFees: [],
      mintRevenue: []
    }
  },
  // Loading states
  loading: {
    overview: false,
    growth: false,
    topCreators: false,
    activities: false,
    health: false,
    revenue: false
  },
  // Error states
  errors: {
    overview: null,
    growth: null,
    topCreators: null,
    activities: null,
    health: null,
    revenue: null
  }
}

const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState,
  reducers: {
    clearErrors: (state) => {
      state.errors = {
        overview: null,
        growth: null,
        topCreators: null,
        activities: null,
        health: null,
        revenue: null
      }
    },
    setGrowthPeriod: (state, action) => {
      state.growth.period = action.payload
    },
    setRevenuePeriod: (state, action) => {
      state.revenue.period = action.payload
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch Overview
      .addCase(fetchDashboardOverview.pending, (state) => {
        state.loading.overview = true
        state.errors.overview = null
      })
      .addCase(fetchDashboardOverview.fulfilled, (state, action) => {
        state.loading.overview = false
        if (action.payload) {
          state.overview = action.payload
        }
      })
      .addCase(fetchDashboardOverview.rejected, (state, action) => {
        state.loading.overview = false
        state.errors.overview = action.payload
      })

      // Fetch Growth
      .addCase(fetchGrowthData.pending, (state) => {
        state.loading.growth = true
        state.errors.growth = null
      })
      .addCase(fetchGrowthData.fulfilled, (state, action) => {
        state.loading.growth = false
        if (action.payload) {
          state.growth = action.payload
        }
      })
      .addCase(fetchGrowthData.rejected, (state, action) => {
        state.loading.growth = false
        state.errors.growth = action.payload
      })

      // Fetch Top Creators
      .addCase(fetchTopCreators.pending, (state) => {
        state.loading.topCreators = true
        state.errors.topCreators = null
      })
      .addCase(fetchTopCreators.fulfilled, (state, action) => {
        state.loading.topCreators = false
        if (action.payload) {
          state.topCreators = action.payload
        }
      })
      .addCase(fetchTopCreators.rejected, (state, action) => {
        state.loading.topCreators = false
        state.errors.topCreators = action.payload
      })

      // Fetch Activities
      .addCase(fetchRecentActivities.pending, (state) => {
        state.loading.activities = true
        state.errors.activities = null
      })
      .addCase(fetchRecentActivities.fulfilled, (state, action) => {
        state.loading.activities = false
        if (action.payload) {
          state.activities = {
            items: action.payload.activities || [],
            pagination: action.payload.pagination || { total: 0, page: 1, limit: 20, totalPages: 0 }
          }
        }
      })
      .addCase(fetchRecentActivities.rejected, (state, action) => {
        state.loading.activities = false
        state.errors.activities = action.payload
      })

      // Fetch Health
      .addCase(fetchPlatformHealth.pending, (state) => {
        state.loading.health = true
        state.errors.health = null
      })
      .addCase(fetchPlatformHealth.fulfilled, (state, action) => {
        state.loading.health = false
        if (action.payload) {
          state.health = action.payload
        }
      })
      .addCase(fetchPlatformHealth.rejected, (state, action) => {
        state.loading.health = false
        state.errors.health = action.payload
      })

      // Fetch Revenue
      .addCase(fetchRevenueData.pending, (state) => {
        state.loading.revenue = true
        state.errors.revenue = null
      })
      .addCase(fetchRevenueData.fulfilled, (state, action) => {
        state.loading.revenue = false
        if (action.payload) {
          state.revenue = action.payload
        }
      })
      .addCase(fetchRevenueData.rejected, (state, action) => {
        state.loading.revenue = false
        state.errors.revenue = action.payload
      })
  }
})

export const { clearErrors, setGrowthPeriod, setRevenuePeriod } = dashboardSlice.actions
export default dashboardSlice.reducer
