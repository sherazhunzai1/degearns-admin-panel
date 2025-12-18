import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { walletsAPI } from '../../services/api'

// Async thunks
export const fetchAllWallets = createAsyncThunk(
  'wallets/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const response = await walletsAPI.getWallets()
      return response.data.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch wallets')
    }
  }
)

export const fetchPlatformFeesWallet = createAsyncThunk(
  'wallets/fetchPlatformFees',
  async (_, { rejectWithValue }) => {
    try {
      const response = await walletsAPI.getPlatformFeesWallet()
      return response.data.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch platform fees wallet')
    }
  }
)

export const updatePlatformFeesWallet = createAsyncThunk(
  'wallets/updatePlatformFees',
  async (data, { rejectWithValue }) => {
    try {
      const response = await walletsAPI.updatePlatformFeesWallet(data)
      return response.data.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update platform fees wallet')
    }
  }
)

export const createWallet = createAsyncThunk(
  'wallets/create',
  async (data, { rejectWithValue }) => {
    try {
      const response = await walletsAPI.createWallet(data)
      return response.data.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create wallet')
    }
  }
)

export const deleteWallet = createAsyncThunk(
  'wallets/delete',
  async (walletId, { rejectWithValue }) => {
    try {
      await walletsAPI.deleteWallet(walletId)
      return walletId
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete wallet')
    }
  }
)

const initialState = {
  wallets: [],
  platformFeesWallet: null,
  loading: false,
  updating: false,
  error: null,
  updateSuccess: false,
}

const walletsSlice = createSlice({
  name: 'wallets',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null
    },
    clearUpdateSuccess: (state) => {
      state.updateSuccess = false
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch All Wallets
      .addCase(fetchAllWallets.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchAllWallets.fulfilled, (state, action) => {
        state.loading = false
        state.wallets = action.payload?.wallets || []
      })
      .addCase(fetchAllWallets.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })

      // Fetch Platform Fees Wallet
      .addCase(fetchPlatformFeesWallet.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchPlatformFeesWallet.fulfilled, (state, action) => {
        state.loading = false
        state.platformFeesWallet = action.payload?.wallet || null
      })
      .addCase(fetchPlatformFeesWallet.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })

      // Update Platform Fees Wallet
      .addCase(updatePlatformFeesWallet.pending, (state) => {
        state.updating = true
        state.error = null
        state.updateSuccess = false
      })
      .addCase(updatePlatformFeesWallet.fulfilled, (state, action) => {
        state.updating = false
        state.platformFeesWallet = action.payload?.wallet || state.platformFeesWallet
        state.updateSuccess = true
        // Update in wallets array if exists
        const index = state.wallets.findIndex(w => w.type === 'platformFees')
        if (index !== -1 && action.payload?.wallet) {
          state.wallets[index] = action.payload.wallet
        }
      })
      .addCase(updatePlatformFeesWallet.rejected, (state, action) => {
        state.updating = false
        state.error = action.payload
      })

      // Create Wallet
      .addCase(createWallet.pending, (state) => {
        state.updating = true
        state.error = null
      })
      .addCase(createWallet.fulfilled, (state, action) => {
        state.updating = false
        if (action.payload?.wallet) {
          // Check if wallet with same type exists and update or add
          const index = state.wallets.findIndex(w => w.type === action.payload.wallet.type)
          if (index !== -1) {
            state.wallets[index] = action.payload.wallet
          } else {
            state.wallets.push(action.payload.wallet)
          }
        }
        state.updateSuccess = true
      })
      .addCase(createWallet.rejected, (state, action) => {
        state.updating = false
        state.error = action.payload
      })

      // Delete Wallet
      .addCase(deleteWallet.pending, (state) => {
        state.updating = true
        state.error = null
      })
      .addCase(deleteWallet.fulfilled, (state, action) => {
        state.updating = false
        state.wallets = state.wallets.filter(w => w.id !== action.payload)
        state.updateSuccess = true
      })
      .addCase(deleteWallet.rejected, (state, action) => {
        state.updating = false
        state.error = action.payload
      })
  },
})

export const { clearError, clearUpdateSuccess } = walletsSlice.actions
export default walletsSlice.reducer
