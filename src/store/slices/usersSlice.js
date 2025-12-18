import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { usersAPI } from '../../services/api'

// Async thunks
export const fetchUsers = createAsyncThunk(
  'users/fetchUsers',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await usersAPI.getUsers(params)
      return response.data.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch users')
    }
  }
)

export const fetchUserStatistics = createAsyncThunk(
  'users/fetchStatistics',
  async (_, { rejectWithValue }) => {
    try {
      const response = await usersAPI.getStatistics()
      return response.data.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch user statistics')
    }
  }
)

export const fetchUserDetails = createAsyncThunk(
  'users/fetchUserDetails',
  async (walletAddress, { rejectWithValue }) => {
    try {
      const response = await usersAPI.getUser(walletAddress)
      return response.data.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch user details')
    }
  }
)

export const updateUserRole = createAsyncThunk(
  'users/updateRole',
  async ({ walletAddress, role, reason }, { rejectWithValue }) => {
    try {
      const response = await usersAPI.updateRole(walletAddress, role, reason)
      return { walletAddress, ...response.data.data }
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update user role')
    }
  }
)

export const updateUserVerification = createAsyncThunk(
  'users/updateVerification',
  async ({ walletAddress, isVerified, reason }, { rejectWithValue }) => {
    try {
      const response = await usersAPI.updateVerification(walletAddress, isVerified, reason)
      return { walletAddress, isVerified, ...response.data.data }
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update verification')
    }
  }
)

export const banUser = createAsyncThunk(
  'users/banUser',
  async ({ walletAddress, reason }, { rejectWithValue }) => {
    try {
      const response = await usersAPI.banUser(walletAddress, reason)
      return { walletAddress, ...response.data.data }
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to ban user')
    }
  }
)

export const unbanUser = createAsyncThunk(
  'users/unbanUser',
  async ({ walletAddress, reason }, { rejectWithValue }) => {
    try {
      const response = await usersAPI.unbanUser(walletAddress, reason)
      return { walletAddress, ...response.data.data }
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to unban user')
    }
  }
)

export const deleteUser = createAsyncThunk(
  'users/deleteUser',
  async ({ walletAddress, reason }, { rejectWithValue }) => {
    try {
      await usersAPI.deleteUser(walletAddress, reason)
      return { walletAddress }
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete user')
    }
  }
)

export const bulkVerifyUsers = createAsyncThunk(
  'users/bulkVerify',
  async ({ walletAddresses, isVerified, reason }, { rejectWithValue }) => {
    try {
      const response = await usersAPI.bulkVerify(walletAddresses, isVerified, reason)
      return { walletAddresses, isVerified, ...response.data.data }
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to bulk verify users')
    }
  }
)

const initialState = {
  users: [],
  selectedUser: null,
  statistics: {
    totalUsers: 0,
    totalAdmins: 0,
    verifiedUsers: 0,
    bannedUsers: 0,
    newUsers: {
      today: 0,
      thisWeek: 0,
      thisMonth: 0
    }
  },
  pagination: {
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  },
  filters: {
    search: '',
    role: undefined,
    isVerified: undefined,
    isBanned: undefined,
    sortBy: 'createdAt',
    sortOrder: 'DESC',
  },
  loading: false,
  statsLoading: false,
  actionLoading: false,
  error: null,
}

const usersSlice = createSlice({
  name: 'users',
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
    clearSelectedUser: (state) => {
      state.selectedUser = null
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
        state.users = action.payload?.users || []
        state.pagination = action.payload?.pagination || {
          page: 1,
          limit: 20,
          total: 0,
          totalPages: 0,
        }
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })

      // Fetch Statistics
      .addCase(fetchUserStatistics.pending, (state) => {
        state.statsLoading = true
      })
      .addCase(fetchUserStatistics.fulfilled, (state, action) => {
        state.statsLoading = false
        if (action.payload) {
          state.statistics = action.payload
        }
      })
      .addCase(fetchUserStatistics.rejected, (state, action) => {
        state.statsLoading = false
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

      // Update Role
      .addCase(updateUserRole.pending, (state) => {
        state.actionLoading = true
      })
      .addCase(updateUserRole.fulfilled, (state, action) => {
        state.actionLoading = false
        const index = state.users.findIndex((u) => u.walletAddress === action.payload.walletAddress)
        if (index !== -1 && action.payload.user) {
          state.users[index] = action.payload.user
        }
        if (state.selectedUser?.walletAddress === action.payload.walletAddress && action.payload.user) {
          state.selectedUser = { ...state.selectedUser, ...action.payload.user }
        }
      })
      .addCase(updateUserRole.rejected, (state, action) => {
        state.actionLoading = false
        state.error = action.payload
      })

      // Update Verification
      .addCase(updateUserVerification.pending, (state) => {
        state.actionLoading = true
      })
      .addCase(updateUserVerification.fulfilled, (state, action) => {
        state.actionLoading = false
        const index = state.users.findIndex((u) => u.walletAddress === action.payload.walletAddress)
        if (index !== -1) {
          state.users[index].isVerified = action.payload.isVerified
        }
        if (state.selectedUser?.walletAddress === action.payload.walletAddress) {
          state.selectedUser.isVerified = action.payload.isVerified
        }
      })
      .addCase(updateUserVerification.rejected, (state, action) => {
        state.actionLoading = false
        state.error = action.payload
      })

      // Ban User
      .addCase(banUser.pending, (state) => {
        state.actionLoading = true
      })
      .addCase(banUser.fulfilled, (state, action) => {
        state.actionLoading = false
        const index = state.users.findIndex((u) => u.walletAddress === action.payload.walletAddress)
        if (index !== -1) {
          state.users[index].isBanned = true
        }
        if (state.selectedUser?.walletAddress === action.payload.walletAddress) {
          state.selectedUser.isBanned = true
        }
      })
      .addCase(banUser.rejected, (state, action) => {
        state.actionLoading = false
        state.error = action.payload
      })

      // Unban User
      .addCase(unbanUser.pending, (state) => {
        state.actionLoading = true
      })
      .addCase(unbanUser.fulfilled, (state, action) => {
        state.actionLoading = false
        const index = state.users.findIndex((u) => u.walletAddress === action.payload.walletAddress)
        if (index !== -1) {
          state.users[index].isBanned = false
        }
        if (state.selectedUser?.walletAddress === action.payload.walletAddress) {
          state.selectedUser.isBanned = false
        }
      })
      .addCase(unbanUser.rejected, (state, action) => {
        state.actionLoading = false
        state.error = action.payload
      })

      // Delete User
      .addCase(deleteUser.pending, (state) => {
        state.actionLoading = true
      })
      .addCase(deleteUser.fulfilled, (state, action) => {
        state.actionLoading = false
        state.users = state.users.filter((u) => u.walletAddress !== action.payload.walletAddress)
        if (state.selectedUser?.walletAddress === action.payload.walletAddress) {
          state.selectedUser = null
        }
      })
      .addCase(deleteUser.rejected, (state, action) => {
        state.actionLoading = false
        state.error = action.payload
      })

      // Bulk Verify
      .addCase(bulkVerifyUsers.pending, (state) => {
        state.actionLoading = true
      })
      .addCase(bulkVerifyUsers.fulfilled, (state, action) => {
        state.actionLoading = false
        const { walletAddresses, isVerified } = action.payload
        state.users = state.users.map((user) => {
          if (walletAddresses.includes(user.walletAddress)) {
            return { ...user, isVerified }
          }
          return user
        })
      })
      .addCase(bulkVerifyUsers.rejected, (state, action) => {
        state.actionLoading = false
        state.error = action.payload
      })
  },
})

export const { clearError, setFilters, setPage, clearSelectedUser } = usersSlice.actions
export default usersSlice.reducer
