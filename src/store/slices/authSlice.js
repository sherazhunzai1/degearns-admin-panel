import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import api from '../../services/api'
import xamanService from '../../services/xaman'

// Check for existing auth on load
const getInitialState = () => {
  const token = localStorage.getItem('degearns_admin_token')
  const userStr = localStorage.getItem('degearns_admin_user')
  let user = null

  try {
    user = userStr ? JSON.parse(userStr) : null
  } catch (e) {
    localStorage.removeItem('degearns_admin_user')
  }

  return {
    user,
    token,
    isAuthenticated: !!token && !!user,
    loading: false,
    error: null,
    // Xaman login state
    xamanLoading: false,
    qrData: null,
    payloadId: null,
    websocketConnected: false,
    loginStep: 'idle', // idle, qr_displayed, waiting_signature, verifying, success, error
  }
}

// Async thunk to initiate Xaman login
export const initiateXamanLogin = createAsyncThunk(
  'auth/initiateXamanLogin',
  async (_, { rejectWithValue }) => {
    try {
      const result = await xamanService.initiateLogin()
      if (!result.success) {
        return rejectWithValue(result.error)
      }
      return result
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to initiate login')
    }
  }
)

// Async thunk to verify Xaman signature
export const verifyXamanSignature = createAsyncThunk(
  'auth/verifyXamanSignature',
  async (payloadId, { rejectWithValue }) => {
    try {
      const result = await xamanService.verifySignature(payloadId)
      if (!result.success) {
        return rejectWithValue(result.error)
      }
      return result
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to verify signature')
    }
  }
)

// Async thunk to get user profile
export const fetchUserProfile = createAsyncThunk(
  'auth/fetchUserProfile',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/auth/profile')
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch profile')
    }
  }
)

// Async thunk to logout
export const logout = createAsyncThunk(
  'auth/logout',
  async (_, { rejectWithValue }) => {
    try {
      await api.post('/auth/logout')
    } catch (error) {
      // Continue with logout even if API call fails
      console.error('Logout API error:', error)
    }
    // Clear local storage
    localStorage.removeItem('degearns_admin_token')
    localStorage.removeItem('degearns_admin_user')
    xamanService.cancelLogin()
    return null
  }
)

const authSlice = createSlice({
  name: 'auth',
  initialState: getInitialState(),
  reducers: {
    clearError: (state) => {
      state.error = null
    },
    setQrData: (state, action) => {
      state.qrData = action.payload
    },
    setWebsocketConnected: (state, action) => {
      state.websocketConnected = action.payload
    },
    setLoginStep: (state, action) => {
      state.loginStep = action.payload
    },
    cancelXamanLogin: (state) => {
      xamanService.cancelLogin()
      state.qrData = null
      state.payloadId = null
      state.websocketConnected = false
      state.loginStep = 'idle'
      state.xamanLoading = false
      state.error = null
    },
    // Demo login for testing
    demoLogin: (state) => {
      const demoUser = {
        id: 'demo-admin',
        address: 'rDeGeArNsAdMiN1234567890XRP',
        username: 'Demo Admin',
        role: 'admin',
        loginTime: new Date().toISOString(),
      }
      state.user = demoUser
      state.token = 'demo-token'
      state.isAuthenticated = true
      state.loginStep = 'success'
      localStorage.setItem('degearns_admin_token', 'demo-token')
      localStorage.setItem('degearns_admin_user', JSON.stringify(demoUser))
    },
  },
  extraReducers: (builder) => {
    builder
      // Initiate Xaman Login
      .addCase(initiateXamanLogin.pending, (state) => {
        state.xamanLoading = true
        state.error = null
        state.loginStep = 'idle'
      })
      .addCase(initiateXamanLogin.fulfilled, (state, action) => {
        state.xamanLoading = false
        state.qrData = {
          qrCodeUrl: action.payload.qrCodeUrl,
          qrCodeData: action.payload.qrCodeData,
          deepLink: action.payload.deepLink,
          websocketUrl: action.payload.websocketUrl,
          expiresAt: action.payload.expiresAt,
        }
        state.payloadId = action.payload.payloadId
        state.loginStep = 'qr_displayed'
      })
      .addCase(initiateXamanLogin.rejected, (state, action) => {
        state.xamanLoading = false
        state.error = action.payload || 'Failed to initiate login'
        state.loginStep = 'error'
      })

      // Verify Xaman Signature
      .addCase(verifyXamanSignature.pending, (state) => {
        state.loading = true
        state.error = null
        state.loginStep = 'verifying'
      })
      .addCase(verifyXamanSignature.fulfilled, (state, action) => {
        state.loading = false
        state.user = action.payload.user
        state.token = action.payload.token
        state.isAuthenticated = true
        state.qrData = null
        state.payloadId = null
        state.websocketConnected = false
        state.loginStep = 'success'
      })
      .addCase(verifyXamanSignature.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload || 'Failed to verify signature'
        state.loginStep = 'error'
      })

      // Fetch User Profile
      .addCase(fetchUserProfile.pending, (state) => {
        state.loading = true
      })
      .addCase(fetchUserProfile.fulfilled, (state, action) => {
        state.loading = false
        state.user = action.payload
        localStorage.setItem('degearns_admin_user', JSON.stringify(action.payload))
      })
      .addCase(fetchUserProfile.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })

      // Logout
      .addCase(logout.fulfilled, (state) => {
        state.user = null
        state.token = null
        state.isAuthenticated = false
        state.qrData = null
        state.payloadId = null
        state.websocketConnected = false
        state.loginStep = 'idle'
        state.loading = false
        state.error = null
      })
  },
})

export const {
  clearError,
  setQrData,
  setWebsocketConnected,
  setLoginStep,
  cancelXamanLogin,
  demoLogin,
} = authSlice.actions

export default authSlice.reducer
