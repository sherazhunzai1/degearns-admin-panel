import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { settingsAPI } from '../../services/api'

const initialState = {
  platform: {
    platformFee: 2.5,
    royaltyFee: 5.0,
    minListingPrice: 1,
    maxListingPrice: 1000000,
    enableOffers: true,
    enableRoyalties: true,
    maintenanceMode: false,
  },
  wallets: {
    adminWallet: '',
    treasuryWallet: '',
    feeCollectorWallet: '',
    rewardPoolWallet: '',
  },
  notifications: {
    emailNotifications: true,
    largeTransactionAlert: true,
    largeTransactionThreshold: 10000,
    newUserAlert: false,
    systemAlerts: true,
  },
  adminList: [],
  loading: false,
  saving: false,
  error: null,
  saveSuccess: false,
}

// Fetch platform settings
export const fetchPlatformSettings = createAsyncThunk(
  'settings/fetchPlatformSettings',
  async (_, { rejectWithValue }) => {
    try {
      const response = await settingsAPI.getPlatformSettings()
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch settings')
    }
  }
)

// Update platform settings
export const updatePlatformSettings = createAsyncThunk(
  'settings/updatePlatformSettings',
  async (data, { rejectWithValue }) => {
    try {
      const response = await settingsAPI.updatePlatformSettings(data)
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update settings')
    }
  }
)

// Fetch wallet settings
export const fetchWalletSettings = createAsyncThunk(
  'settings/fetchWalletSettings',
  async (_, { rejectWithValue }) => {
    try {
      const response = await settingsAPI.getWalletSettings()
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch wallet settings')
    }
  }
)

// Update wallet settings
export const updateWalletSettings = createAsyncThunk(
  'settings/updateWalletSettings',
  async (data, { rejectWithValue }) => {
    try {
      const response = await settingsAPI.updateWalletSettings(data)
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update wallet settings')
    }
  }
)

// Fetch notification settings
export const fetchNotificationSettings = createAsyncThunk(
  'settings/fetchNotificationSettings',
  async (_, { rejectWithValue }) => {
    try {
      const response = await settingsAPI.getNotificationSettings()
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch notification settings')
    }
  }
)

// Update notification settings
export const updateNotificationSettings = createAsyncThunk(
  'settings/updateNotificationSettings',
  async (data, { rejectWithValue }) => {
    try {
      const response = await settingsAPI.updateNotificationSettings(data)
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update notification settings')
    }
  }
)

// Fetch all settings
export const fetchAllSettings = createAsyncThunk(
  'settings/fetchAll',
  async (_, { dispatch }) => {
    await Promise.all([
      dispatch(fetchPlatformSettings()),
      dispatch(fetchWalletSettings()),
      dispatch(fetchNotificationSettings()),
    ])
  }
)

// Save all settings
export const saveAllSettings = createAsyncThunk(
  'settings/saveAll',
  async (data, { dispatch, rejectWithValue }) => {
    try {
      await Promise.all([
        dispatch(updatePlatformSettings(data.platform)),
        dispatch(updateWalletSettings(data.wallets)),
        dispatch(updateNotificationSettings(data.notifications)),
      ])
      return true
    } catch (error) {
      return rejectWithValue('Failed to save settings')
    }
  }
)

// Fetch admin list
export const fetchAdminList = createAsyncThunk(
  'settings/fetchAdminList',
  async (_, { rejectWithValue }) => {
    try {
      const response = await settingsAPI.getAdminList()
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch admin list')
    }
  }
)

// Add admin wallet
export const addAdminWallet = createAsyncThunk(
  'settings/addAdminWallet',
  async (walletAddress, { rejectWithValue }) => {
    try {
      const response = await settingsAPI.addAdminWallet(walletAddress)
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to add admin wallet')
    }
  }
)

// Remove admin wallet
export const removeAdminWallet = createAsyncThunk(
  'settings/removeAdminWallet',
  async (walletAddress, { rejectWithValue }) => {
    try {
      await settingsAPI.removeAdminWallet(walletAddress)
      return walletAddress
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to remove admin wallet')
    }
  }
)

const settingsSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null
    },
    clearSaveSuccess: (state) => {
      state.saveSuccess = false
    },
    updatePlatformLocal: (state, action) => {
      state.platform = { ...state.platform, ...action.payload }
      state.saveSuccess = false
    },
    updateWalletsLocal: (state, action) => {
      state.wallets = { ...state.wallets, ...action.payload }
      state.saveSuccess = false
    },
    updateNotificationsLocal: (state, action) => {
      state.notifications = { ...state.notifications, ...action.payload }
      state.saveSuccess = false
    },
    // For demo/mock data
    setMockSettings: (state) => {
      state.platform = {
        platformFee: 2.5,
        royaltyFee: 5.0,
        minListingPrice: 1,
        maxListingPrice: 1000000,
        enableOffers: true,
        enableRoyalties: true,
        maintenanceMode: false,
      }
      state.wallets = {
        adminWallet: 'rDeGeArNsAdMiN1234567890XRP',
        treasuryWallet: 'rTrEaSuRyWaLlEt9876543210ABC',
        feeCollectorWallet: 'rFeEcOlLeCt0r1122334455DEF',
        rewardPoolWallet: 'rReWaRdPoOl6677889900GHI',
      }
      state.notifications = {
        emailNotifications: true,
        largeTransactionAlert: true,
        largeTransactionThreshold: 10000,
        newUserAlert: false,
        systemAlerts: true,
      }
      state.adminList = [
        { address: 'rDeGeArNsAdMiN1234567890XRP', role: 'Primary Admin', addedAt: '2024-01-01' },
      ]
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Platform Settings
      .addCase(fetchPlatformSettings.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchPlatformSettings.fulfilled, (state, action) => {
        state.loading = false
        state.platform = action.payload
      })
      .addCase(fetchPlatformSettings.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })

      // Update Platform Settings
      .addCase(updatePlatformSettings.pending, (state) => {
        state.saving = true
        state.error = null
      })
      .addCase(updatePlatformSettings.fulfilled, (state, action) => {
        state.saving = false
        state.saveSuccess = true
        if (action.payload) {
          state.platform = action.payload
        }
      })
      .addCase(updatePlatformSettings.rejected, (state, action) => {
        state.saving = false
        state.error = action.payload
      })

      // Fetch Wallet Settings
      .addCase(fetchWalletSettings.fulfilled, (state, action) => {
        state.wallets = action.payload
      })

      // Update Wallet Settings
      .addCase(updateWalletSettings.pending, (state) => {
        state.saving = true
      })
      .addCase(updateWalletSettings.fulfilled, (state, action) => {
        state.saving = false
        state.saveSuccess = true
        if (action.payload) {
          state.wallets = action.payload
        }
      })
      .addCase(updateWalletSettings.rejected, (state, action) => {
        state.saving = false
        state.error = action.payload
      })

      // Fetch Notification Settings
      .addCase(fetchNotificationSettings.fulfilled, (state, action) => {
        state.notifications = action.payload
      })

      // Update Notification Settings
      .addCase(updateNotificationSettings.pending, (state) => {
        state.saving = true
      })
      .addCase(updateNotificationSettings.fulfilled, (state, action) => {
        state.saving = false
        state.saveSuccess = true
        if (action.payload) {
          state.notifications = action.payload
        }
      })
      .addCase(updateNotificationSettings.rejected, (state, action) => {
        state.saving = false
        state.error = action.payload
      })

      // Save All Settings
      .addCase(saveAllSettings.pending, (state) => {
        state.saving = true
        state.error = null
      })
      .addCase(saveAllSettings.fulfilled, (state) => {
        state.saving = false
        state.saveSuccess = true
      })
      .addCase(saveAllSettings.rejected, (state, action) => {
        state.saving = false
        state.error = action.payload
      })

      // Fetch Admin List
      .addCase(fetchAdminList.fulfilled, (state, action) => {
        state.adminList = action.payload
      })

      // Add Admin Wallet
      .addCase(addAdminWallet.fulfilled, (state, action) => {
        state.adminList.push(action.payload)
      })

      // Remove Admin Wallet
      .addCase(removeAdminWallet.fulfilled, (state, action) => {
        state.adminList = state.adminList.filter((admin) => admin.address !== action.payload)
      })
  },
})

export const {
  clearError,
  clearSaveSuccess,
  updatePlatformLocal,
  updateWalletsLocal,
  updateNotificationsLocal,
  setMockSettings,
} = settingsSlice.actions

export default settingsSlice.reducer
