import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { transactionsAPI } from '../../services/api'

const initialState = {
  transactions: [],
  stats: {
    totalVolume: 0,
    totalFees: 0,
    totalSales: 0,
    totalTransfers: 0,
  },
  pagination: {
    page: 1,
    limit: 15,
    total: 0,
    totalPages: 0,
  },
  filters: {
    search: '',
    type: 'all',
    status: 'all',
    dateRange: '7d',
  },
  loading: false,
  error: null,
}

// Fetch transactions with pagination and filters
export const fetchTransactions = createAsyncThunk(
  'transactions/fetchTransactions',
  async (params, { rejectWithValue, getState }) => {
    try {
      const { transactions } = getState()
      const queryParams = {
        page: params?.page || transactions.pagination.page,
        limit: params?.limit || transactions.pagination.limit,
        search: params?.search ?? transactions.filters.search,
        type: params?.type ?? transactions.filters.type,
        status: params?.status ?? transactions.filters.status,
        dateRange: params?.dateRange ?? transactions.filters.dateRange,
      }
      const response = await transactionsAPI.getTransactions(queryParams)
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch transactions')
    }
  }
)

// Fetch transaction stats
export const fetchTransactionStats = createAsyncThunk(
  'transactions/fetchStats',
  async (dateRange = '7d', { rejectWithValue }) => {
    try {
      const response = await transactionsAPI.getTransactionStats(dateRange)
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch stats')
    }
  }
)

const transactionsSlice = createSlice({
  name: 'transactions',
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
    // For demo/mock data
    setMockTransactions: (state) => {
      const types = ['sale', 'listing', 'transfer', 'offer_accepted', 'mint']
      const statuses = ['completed', 'completed', 'completed', 'pending', 'active', 'failed']
      const mockTransactions = [
        { id: 1, type: 'sale', nft: 'Cosmic Dreams #124', collection: 'Cosmic Collection', from: 'rSeller123456789', to: 'rBuyer987654321', amount: '2,500 XRP', fee: '62.5 XRP', date: '2024-06-15 14:32:15', status: 'completed', txHash: 'ABC123DEF456GHI789' },
        { id: 2, type: 'listing', nft: 'Abstract Wave #89', collection: 'Abstract Art', from: 'rCreator555444333', to: '-', amount: '1,200 XRP', fee: '-', date: '2024-06-15 14:28:45', status: 'active', txHash: 'JKL012MNO345PQR678' },
        { id: 3, type: 'transfer', nft: 'Digital Galaxy #45', collection: 'Galaxy Series', from: 'rOwner111222333', to: 'rRecipient444555666', amount: '-', fee: '10 XRP', date: '2024-06-15 14:15:22', status: 'completed', txHash: 'STU901VWX234YZA567' },
        { id: 4, type: 'sale', nft: 'Neon City #201', collection: 'Neon Cities', from: 'rArtist000111222', to: 'rCollector333444555', amount: '5,800 XRP', fee: '145 XRP', date: '2024-06-15 13:45:10', status: 'completed', txHash: 'KLM789NOP012QRS345' },
        { id: 5, type: 'offer_accepted', nft: 'Pixel Art #567', collection: 'Pixel Universe', from: 'rHolder222333444', to: 'rOfferor555666777', amount: '890 XRP', fee: '22.25 XRP', date: '2024-06-15 13:15:45', status: 'completed', txHash: 'CDE567FGH890IJK123' },
        { id: 6, type: 'mint', nft: 'New Creation #1', collection: 'Fresh Mints', from: '-', to: 'rCreator888999000', amount: '-', fee: '25 XRP', date: '2024-06-15 12:58:30', status: 'completed', txHash: 'LMN456OPQ789RST012' },
      ]

      for (let i = 7; i <= 100; i++) {
        const type = types[Math.floor(Math.random() * types.length)]
        mockTransactions.push({
          id: i,
          type,
          nft: `NFT #${Math.floor(Math.random() * 1000)}`,
          collection: `Collection ${Math.floor(Math.random() * 50)}`,
          from: `r${Math.random().toString(36).substring(2, 12)}`,
          to: type === 'listing' || type === 'mint' ? '-' : `r${Math.random().toString(36).substring(2, 12)}`,
          amount: type === 'transfer' || type === 'mint' ? '-' : `${Math.floor(Math.random() * 10000)} XRP`,
          fee: `${Math.floor(Math.random() * 100)} XRP`,
          date: `2024-06-${String(Math.floor(Math.random() * 15) + 1).padStart(2, '0')} ${String(Math.floor(Math.random() * 24)).padStart(2, '0')}:${String(Math.floor(Math.random() * 60)).padStart(2, '0')}:${String(Math.floor(Math.random() * 60)).padStart(2, '0')}`,
          status: statuses[Math.floor(Math.random() * statuses.length)],
          txHash: Math.random().toString(36).substring(2, 20).toUpperCase(),
        })
      }

      state.transactions = mockTransactions
      state.pagination = {
        page: 1,
        limit: 15,
        total: 100,
        totalPages: 7,
      }

      // Calculate stats
      const salesTx = mockTransactions.filter((tx) => tx.type === 'sale' || tx.type === 'offer_accepted')
      state.stats = {
        totalVolume: mockTransactions.filter((tx) => tx.amount !== '-').reduce((sum, tx) => sum + parseInt(tx.amount.replace(/[^0-9]/g, '') || 0), 0),
        totalFees: mockTransactions.filter((tx) => tx.fee !== '-').reduce((sum, tx) => sum + parseInt(tx.fee.replace(/[^0-9]/g, '') || 0), 0),
        totalSales: salesTx.length,
        totalTransfers: mockTransactions.filter((tx) => tx.type === 'transfer').length,
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Transactions
      .addCase(fetchTransactions.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchTransactions.fulfilled, (state, action) => {
        state.loading = false
        state.transactions = action.payload.transactions || action.payload.data || []
        state.pagination = {
          page: action.payload.page || 1,
          limit: action.payload.limit || 15,
          total: action.payload.total || 0,
          totalPages: action.payload.totalPages || 0,
        }
      })
      .addCase(fetchTransactions.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })

      // Fetch Stats
      .addCase(fetchTransactionStats.fulfilled, (state, action) => {
        state.stats = action.payload
      })
  },
})

export const { clearError, setFilters, setPage, setMockTransactions } = transactionsSlice.actions
export default transactionsSlice.reducer
