import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
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
    // Login state
    loginLoading: false,
    loginStep: 'idle', // idle, connecting, success, error
  }
}

// Async thunk to login with Xaman wallet
export const loginWithXaman = createAsyncThunk(
  'auth/loginWithXaman',
  async (_, { rejectWithValue }) => {
    try {
      const result = await xamanService.initiateLogin()

      if (!result.success) {
        return rejectWithValue(result.error || 'Login failed')
      }

      return result
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to connect to Xaman wallet')
    }
  }
)

// Async thunk to check existing auth
export const checkExistingAuth = createAsyncThunk(
  'auth/checkExistingAuth',
  async (_, { rejectWithValue }) => {
    try {
      const result = await xamanService.checkExistingAuth()
      return result
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to check authentication')
    }
  }
)

// Async thunk to logout
export const logout = createAsyncThunk(
  'auth/logout',
  async () => {
    await xamanService.logout()
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
    setLoginStep: (state, action) => {
      state.loginStep = action.payload
    },
    resetLoginState: (state) => {
      state.loginLoading = false
      state.loginStep = 'idle'
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
      // Login with Xaman
      .addCase(loginWithXaman.pending, (state) => {
        state.loginLoading = true
        state.error = null
        state.loginStep = 'connecting'
      })
      .addCase(loginWithXaman.fulfilled, (state, action) => {
        state.loginLoading = false
        state.user = action.payload.user
        state.token = action.payload.token
        state.isAuthenticated = true
        state.loginStep = 'success'
        state.error = null
      })
      .addCase(loginWithXaman.rejected, (state, action) => {
        state.loginLoading = false
        state.error = action.payload || 'Login failed'
        state.loginStep = 'error'
      })

      // Check existing auth
      .addCase(checkExistingAuth.pending, (state) => {
        state.loading = true
      })
      .addCase(checkExistingAuth.fulfilled, (state, action) => {
        state.loading = false
        if (action.payload.authenticated) {
          state.user = action.payload.user
          state.isAuthenticated = true
        }
      })
      .addCase(checkExistingAuth.rejected, (state) => {
        state.loading = false
      })

      // Logout
      .addCase(logout.fulfilled, (state) => {
        state.user = null
        state.token = null
        state.isAuthenticated = false
        state.loginStep = 'idle'
        state.loading = false
        state.error = null
      })
  },
})

export const {
  clearError,
  setLoginStep,
  resetLoginState,
  demoLogin,
} = authSlice.actions

export default authSlice.reducer
