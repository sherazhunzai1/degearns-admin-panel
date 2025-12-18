import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { usersAPI } from '../../services/api'

const initialState = {
  users: [],
  selectedUser: null,
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  },
  filters: {
    search: '',
    status: 'all',
    role: 'all',
  },
  loading: false,
  actionLoading: false,
  error: null,
}

// Fetch users with pagination and filters
export const fetchUsers = createAsyncThunk(
  'users/fetchUsers',
  async (params, { rejectWithValue, getState }) => {
    try {
      const { users } = getState()
      const queryParams = {
        page: params?.page || users.pagination.page,
        limit: params?.limit || users.pagination.limit,
        search: params?.search ?? users.filters.search,
        status: params?.status ?? users.filters.status,
        role: params?.role ?? users.filters.role,
      }
      const response = await usersAPI.getUsers(queryParams)
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch users')
    }
  }
)

// Fetch single user details
export const fetchUserDetails = createAsyncThunk(
  'users/fetchUserDetails',
  async (userId, { rejectWithValue }) => {
    try {
      const response = await usersAPI.getUser(userId)
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch user details')
    }
  }
)

// Block user
export const blockUser = createAsyncThunk(
  'users/blockUser',
  async ({ userId, reason }, { rejectWithValue }) => {
    try {
      const response = await usersAPI.blockUser(userId, reason)
      return { userId, ...response.data }
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to block user')
    }
  }
)

// Unblock user
export const unblockUser = createAsyncThunk(
  'users/unblockUser',
  async (userId, { rejectWithValue }) => {
    try {
      const response = await usersAPI.unblockUser(userId)
      return { userId, ...response.data }
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to unblock user')
    }
  }
)

const usersSlice = createSlice({
  name: 'users',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null
    },
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload }
      state.pagination.page = 1 // Reset to first page on filter change
    },
    setPage: (state, action) => {
      state.pagination.page = action.payload
    },
    clearSelectedUser: (state) => {
      state.selectedUser = null
    },
    // For demo/mock data
    setMockUsers: (state) => {
      const mockUsers = []
      const roles = ['creator', 'trader', 'collector', 'influencer', 'user']
      const statuses = ['active', 'active', 'active', 'blocked', 'pending']

      for (let i = 1; i <= 50; i++) {
        mockUsers.push({
          id: i,
          address: `rUser${Math.random().toString(36).substring(2, 15)}`,
          username: i <= 5 ? ['CryptoArtist', 'NFTTrader', 'CryptoInfluencer', 'RareCollector', 'NewCollector'][i - 1] : `User${i}`,
          email: `user${i}@email.com`,
          status: statuses[Math.floor(Math.random() * statuses.length)],
          role: roles[Math.floor(Math.random() * roles.length)],
          joinDate: '2024-05-15',
          totalVolume: `${Math.floor(Math.random() * 500000)} XRP`,
          nftsOwned: Math.floor(Math.random() * 500),
          nftsCreated: Math.floor(Math.random() * 50),
          lastActive: `${Math.floor(Math.random() * 24)} hours ago`,
        })
      }

      state.users = mockUsers
      state.pagination = {
        page: 1,
        limit: 10,
        total: 50,
        totalPages: 5,
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Users
      .addCase(fetchUsers.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.loading = false
        state.users = action.payload.users || action.payload.data || []
        state.pagination = {
          page: action.payload.page || 1,
          limit: action.payload.limit || 10,
          total: action.payload.total || 0,
          totalPages: action.payload.totalPages || 0,
        }
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })

      // Fetch User Details
      .addCase(fetchUserDetails.pending, (state) => {
        state.loading = true
      })
      .addCase(fetchUserDetails.fulfilled, (state, action) => {
        state.loading = false
        state.selectedUser = action.payload
      })
      .addCase(fetchUserDetails.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })

      // Block User
      .addCase(blockUser.pending, (state) => {
        state.actionLoading = true
      })
      .addCase(blockUser.fulfilled, (state, action) => {
        state.actionLoading = false
        const index = state.users.findIndex((u) => u.id === action.payload.userId)
        if (index !== -1) {
          state.users[index].status = 'blocked'
        }
        if (state.selectedUser?.id === action.payload.userId) {
          state.selectedUser.status = 'blocked'
        }
      })
      .addCase(blockUser.rejected, (state, action) => {
        state.actionLoading = false
        state.error = action.payload
      })

      // Unblock User
      .addCase(unblockUser.pending, (state) => {
        state.actionLoading = true
      })
      .addCase(unblockUser.fulfilled, (state, action) => {
        state.actionLoading = false
        const index = state.users.findIndex((u) => u.id === action.payload.userId)
        if (index !== -1) {
          state.users[index].status = 'active'
        }
        if (state.selectedUser?.id === action.payload.userId) {
          state.selectedUser.status = 'active'
        }
      })
      .addCase(unblockUser.rejected, (state, action) => {
        state.actionLoading = false
        state.error = action.payload
      })
  },
})

export const { clearError, setFilters, setPage, clearSelectedUser, setMockUsers } = usersSlice.actions
export default usersSlice.reducer
