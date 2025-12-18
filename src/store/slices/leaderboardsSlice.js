import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { leaderboardsAPI } from '../../services/api'

const initialState = {
  traders: [],
  creators: [],
  influencers: [],
  period: '30d',
  loading: false,
  error: null,
}

// Fetch top traders
export const fetchTopTraders = createAsyncThunk(
  'leaderboards/fetchTopTraders',
  async ({ period = '30d', limit = 10 } = {}, { rejectWithValue }) => {
    try {
      const response = await leaderboardsAPI.getTopTraders(period, limit)
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch traders')
    }
  }
)

// Fetch top creators
export const fetchTopCreators = createAsyncThunk(
  'leaderboards/fetchTopCreators',
  async ({ period = '30d', limit = 10 } = {}, { rejectWithValue }) => {
    try {
      const response = await leaderboardsAPI.getTopCreators(period, limit)
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch creators')
    }
  }
)

// Fetch top influencers
export const fetchTopInfluencers = createAsyncThunk(
  'leaderboards/fetchTopInfluencers',
  async ({ period = '30d', limit = 10 } = {}, { rejectWithValue }) => {
    try {
      const response = await leaderboardsAPI.getTopInfluencers(period, limit)
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch influencers')
    }
  }
)

// Fetch all leaderboards
export const fetchAllLeaderboards = createAsyncThunk(
  'leaderboards/fetchAll',
  async (period = '30d', { dispatch }) => {
    await Promise.all([
      dispatch(fetchTopTraders({ period })),
      dispatch(fetchTopCreators({ period })),
      dispatch(fetchTopInfluencers({ period })),
    ])
  }
)

const leaderboardsSlice = createSlice({
  name: 'leaderboards',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null
    },
    setPeriod: (state, action) => {
      state.period = action.payload
    },
    // For demo/mock data
    setMockLeaderboards: (state) => {
      state.traders = [
        { rank: 1, username: 'CryptoWhale', address: 'rWhale123456789', volume: '2,450,000 XRP', trades: 1245, change: 12.5 },
        { rank: 2, username: 'NFTMaster', address: 'rMaster987654321', volume: '1,890,000 XRP', trades: 987, change: 8.3 },
        { rank: 3, username: 'DiamondHands', address: 'rDiamond555444333', volume: '1,567,000 XRP', trades: 756, change: -2.1 },
        { rank: 4, username: 'TokenKing', address: 'rToken111222333', volume: '1,234,000 XRP', trades: 654, change: 15.7 },
        { rank: 5, username: 'ArtCollector', address: 'rArt444555666', volume: '989,000 XRP', trades: 543, change: 5.4 },
        { rank: 6, username: 'RareFinder', address: 'rRare777888999', volume: '876,000 XRP', trades: 432, change: -1.2 },
        { rank: 7, username: 'GemHunter', address: 'rGem000111222', volume: '765,000 XRP', trades: 321, change: 9.8 },
        { rank: 8, username: 'FloorSweeper', address: 'rFloor333444555', volume: '654,000 XRP', trades: 298, change: 3.6 },
        { rank: 9, username: 'WhaleCatcher', address: 'rCatcher666777888', volume: '543,000 XRP', trades: 276, change: -4.5 },
        { rank: 10, username: 'BluechipHolder', address: 'rBlue999000111', volume: '432,000 XRP', trades: 234, change: 7.2 },
      ]
      state.creators = [
        { rank: 1, username: 'PixelArtist', address: 'rPixel123456789', sales: '1,890,000 XRP', nftsCreated: 456, followers: 12500, change: 18.2 },
        { rank: 2, username: 'DigitalDreams', address: 'rDreams987654321', sales: '1,567,000 XRP', nftsCreated: 389, followers: 10200, change: 9.5 },
        { rank: 3, username: '3DArtMaster', address: 'r3DArt555444333', sales: '1,234,000 XRP', nftsCreated: 298, followers: 8900, change: 5.8 },
        { rank: 4, username: 'AbstractVision', address: 'rAbstract111222333', sales: '987,000 XRP', nftsCreated: 256, followers: 7600, change: -2.3 },
        { rank: 5, username: 'CryptoCanvas', address: 'rCanvas444555666', sales: '876,000 XRP', nftsCreated: 234, followers: 6500, change: 12.1 },
        { rank: 6, username: 'NeonArtist', address: 'rNeon777888999', sales: '765,000 XRP', nftsCreated: 212, followers: 5800, change: 7.4 },
        { rank: 7, username: 'SurrealWorld', address: 'rSurreal000111222', sales: '654,000 XRP', nftsCreated: 189, followers: 4900, change: -1.5 },
        { rank: 8, username: 'MotionMaker', address: 'rMotion333444555', sales: '543,000 XRP', nftsCreated: 167, followers: 4200, change: 4.8 },
        { rank: 9, username: 'VectorVibes', address: 'rVector666777888', sales: '432,000 XRP', nftsCreated: 145, followers: 3600, change: 8.9 },
        { rank: 10, username: 'PolyArtist', address: 'rPoly999000111', sales: '321,000 XRP', nftsCreated: 123, followers: 2800, change: 15.3 },
      ]
      state.influencers = [
        { rank: 1, username: 'NFTInfluencer1', address: 'rInfluencer123', followers: 125000, engagement: '8.5%', referrals: 2345, earnings: '45,000 XRP', change: 22.5 },
        { rank: 2, username: 'CryptoGuru', address: 'rGuru987654321', followers: 98000, engagement: '7.2%', referrals: 1890, earnings: '38,000 XRP', change: 15.3 },
        { rank: 3, username: 'NFTExpert', address: 'rExpert555444333', followers: 87000, engagement: '9.1%', referrals: 1567, earnings: '32,000 XRP', change: 8.7 },
        { rank: 4, username: 'BlockchainBoss', address: 'rBoss111222333', followers: 76000, engagement: '6.8%', referrals: 1234, earnings: '28,000 XRP', change: -3.2 },
        { rank: 5, username: 'CryptoQueen', address: 'rQueen444555666', followers: 65000, engagement: '8.9%', referrals: 1098, earnings: '24,000 XRP', change: 11.4 },
        { rank: 6, username: 'NFTWhiz', address: 'rWhiz777888999', followers: 54000, engagement: '7.5%', referrals: 987, earnings: '21,000 XRP', change: 6.8 },
        { rank: 7, username: 'TokenTalk', address: 'rTalk000111222', followers: 43000, engagement: '8.2%', referrals: 876, earnings: '18,000 XRP', change: -1.9 },
        { rank: 8, username: 'ArtAdvocate', address: 'rAdvocate333444555', followers: 32000, engagement: '9.4%', referrals: 765, earnings: '15,000 XRP', change: 9.5 },
        { rank: 9, username: 'DigitalDiva', address: 'rDiva666777888', followers: 28000, engagement: '7.8%', referrals: 654, earnings: '12,000 XRP', change: 4.2 },
        { rank: 10, username: 'MetaMaven', address: 'rMaven999000111', followers: 21000, engagement: '8.6%', referrals: 543, earnings: '9,000 XRP', change: 13.7 },
      ]
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Top Traders
      .addCase(fetchTopTraders.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchTopTraders.fulfilled, (state, action) => {
        state.loading = false
        state.traders = action.payload
      })
      .addCase(fetchTopTraders.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })

      // Fetch Top Creators
      .addCase(fetchTopCreators.fulfilled, (state, action) => {
        state.creators = action.payload
      })

      // Fetch Top Influencers
      .addCase(fetchTopInfluencers.fulfilled, (state, action) => {
        state.influencers = action.payload
      })
  },
})

export const { clearError, setPeriod, setMockLeaderboards } = leaderboardsSlice.actions
export default leaderboardsSlice.reducer
