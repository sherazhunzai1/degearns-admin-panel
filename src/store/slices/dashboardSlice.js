import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { dashboardAPI } from '../../services/api'

const initialState = {
  stats: {
    totalVolume: '0',
    totalNFTs: '0',
    totalUsers: '0',
    totalTransactions: '0',
    platformFees: '0',
    activeListings: '0',
    avgSalePrice: '0',
    dailyActiveUsers: '0',
    activeOffers: '0',
  },
  volumeData: [],
  categoryData: [],
  userActivityData: [],
  recentTransactions: [],
  loading: false,
  error: null,
}

// Fetch dashboard stats
export const fetchDashboardStats = createAsyncThunk(
  'dashboard/fetchStats',
  async (_, { rejectWithValue }) => {
    try {
      const response = await dashboardAPI.getStats()
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch stats')
    }
  }
)

// Fetch volume data
export const fetchVolumeData = createAsyncThunk(
  'dashboard/fetchVolumeData',
  async (period = '7d', { rejectWithValue }) => {
    try {
      const response = await dashboardAPI.getVolumeData(period)
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch volume data')
    }
  }
)

// Fetch category data
export const fetchCategoryData = createAsyncThunk(
  'dashboard/fetchCategoryData',
  async (_, { rejectWithValue }) => {
    try {
      const response = await dashboardAPI.getCategoryData()
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch category data')
    }
  }
)

// Fetch user activity data
export const fetchUserActivityData = createAsyncThunk(
  'dashboard/fetchUserActivityData',
  async (period = '7d', { rejectWithValue }) => {
    try {
      const response = await dashboardAPI.getUserActivity(period)
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch user activity')
    }
  }
)

// Fetch recent transactions
export const fetchRecentTransactions = createAsyncThunk(
  'dashboard/fetchRecentTransactions',
  async (limit = 5, { rejectWithValue }) => {
    try {
      const response = await dashboardAPI.getRecentTransactions(limit)
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch recent transactions')
    }
  }
)

// Fetch all dashboard data
export const fetchAllDashboardData = createAsyncThunk(
  'dashboard/fetchAll',
  async (_, { dispatch }) => {
    await Promise.all([
      dispatch(fetchDashboardStats()),
      dispatch(fetchVolumeData()),
      dispatch(fetchCategoryData()),
      dispatch(fetchUserActivityData()),
      dispatch(fetchRecentTransactions()),
    ])
  }
)

const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null
    },
    // For demo/mock data
    setMockData: (state) => {
      state.stats = {
        totalVolume: '1,234,567',
        totalNFTs: '45,678',
        totalUsers: '12,345',
        totalTransactions: '98,765',
        platformFees: '24,567',
        activeListings: '8,901',
        avgSalePrice: '1,234',
        dailyActiveUsers: '3,456',
        activeOffers: '847',
      }
      state.volumeData = [
        { name: 'Jan', volume: 4000, trades: 240 },
        { name: 'Feb', volume: 3000, trades: 198 },
        { name: 'Mar', volume: 5000, trades: 320 },
        { name: 'Apr', volume: 4500, trades: 280 },
        { name: 'May', volume: 6000, trades: 390 },
        { name: 'Jun', volume: 5500, trades: 350 },
        { name: 'Jul', volume: 7000, trades: 420 },
      ]
      state.categoryData = [
        { name: 'Art', value: 35 },
        { name: 'Gaming', value: 25 },
        { name: 'Music', value: 20 },
        { name: 'Collectibles', value: 15 },
        { name: 'Other', value: 5 },
      ]
      state.userActivityData = [
        { name: 'Mon', active: 2400, new: 400 },
        { name: 'Tue', active: 1398, new: 300 },
        { name: 'Wed', active: 9800, new: 500 },
        { name: 'Thu', active: 3908, new: 450 },
        { name: 'Fri', active: 4800, new: 600 },
        { name: 'Sat', active: 3800, new: 350 },
        { name: 'Sun', active: 4300, new: 420 },
      ]
      state.recentTransactions = [
        { id: 1, type: 'Sale', nft: 'Cosmic Dreams #124', price: '2,500 XRP', time: '2 mins ago', status: 'completed' },
        { id: 2, type: 'Listing', nft: 'Abstract Wave #89', price: '1,200 XRP', time: '5 mins ago', status: 'pending' },
        { id: 3, type: 'Transfer', nft: 'Digital Galaxy #45', price: '-', time: '12 mins ago', status: 'completed' },
        { id: 4, type: 'Sale', nft: 'Neon City #201', price: '5,800 XRP', time: '18 mins ago', status: 'completed' },
        { id: 5, type: 'Offer', nft: 'Ethereal Being #67', price: '3,200 XRP', time: '25 mins ago', status: 'active' },
      ]
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Stats
      .addCase(fetchDashboardStats.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchDashboardStats.fulfilled, (state, action) => {
        state.loading = false
        state.stats = action.payload
      })
      .addCase(fetchDashboardStats.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })

      // Fetch Volume Data
      .addCase(fetchVolumeData.fulfilled, (state, action) => {
        state.volumeData = action.payload
      })

      // Fetch Category Data
      .addCase(fetchCategoryData.fulfilled, (state, action) => {
        state.categoryData = action.payload
      })

      // Fetch User Activity
      .addCase(fetchUserActivityData.fulfilled, (state, action) => {
        state.userActivityData = action.payload
      })

      // Fetch Recent Transactions
      .addCase(fetchRecentTransactions.fulfilled, (state, action) => {
        state.recentTransactions = action.payload
      })
  },
})

export const { clearError, setMockData } = dashboardSlice.actions
export default dashboardSlice.reducer
