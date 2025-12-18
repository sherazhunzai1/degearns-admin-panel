import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { settingsAPI } from '../../services/api'

// Async thunks
export const initializeSettings = createAsyncThunk(
  'settings/initialize',
  async (_, { rejectWithValue }) => {
    try {
      const response = await settingsAPI.initialize()
      return response.data.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to initialize settings')
    }
  }
)

export const fetchAllSettings = createAsyncThunk(
  'settings/fetchAll',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await settingsAPI.getSettings(params)
      return response.data.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch settings')
    }
  }
)

export const fetchPublicSettings = createAsyncThunk(
  'settings/fetchPublic',
  async (_, { rejectWithValue }) => {
    try {
      const response = await settingsAPI.getPublicSettings()
      return response.data.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch public settings')
    }
  }
)

export const fetchSetting = createAsyncThunk(
  'settings/fetchOne',
  async (key, { rejectWithValue }) => {
    try {
      const response = await settingsAPI.getSetting(key)
      return response.data.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch setting')
    }
  }
)

export const updateSetting = createAsyncThunk(
  'settings/update',
  async ({ key, data }, { rejectWithValue }) => {
    try {
      const response = await settingsAPI.updateSetting(key, data)
      return { key, ...response.data.data }
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update setting')
    }
  }
)

export const resetSetting = createAsyncThunk(
  'settings/reset',
  async ({ key, reason }, { rejectWithValue }) => {
    try {
      const response = await settingsAPI.resetSetting(key, reason)
      return { key, ...response.data.data }
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to reset setting')
    }
  }
)

export const createSetting = createAsyncThunk(
  'settings/create',
  async (data, { rejectWithValue }) => {
    try {
      const response = await settingsAPI.createSetting(data)
      return response.data.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create setting')
    }
  }
)

export const deleteSetting = createAsyncThunk(
  'settings/delete',
  async ({ key, reason }, { rejectWithValue }) => {
    try {
      await settingsAPI.deleteSetting(key, reason)
      return { key }
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete setting')
    }
  }
)

export const bulkUpdateSettings = createAsyncThunk(
  'settings/bulkUpdate',
  async ({ settings, reason }, { rejectWithValue }) => {
    try {
      const response = await settingsAPI.bulkUpdate(settings, reason)
      return response.data.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to bulk update settings')
    }
  }
)

const initialState = {
  // Settings grouped by category
  settings: {
    fees: [],
    marketplace: [],
    drops: [],
    social: [],
    notifications: [],
    general: []
  },
  // Flat public settings for easy access
  publicSettings: {},
  // Total count
  total: 0,
  loading: false,
  saving: false,
  error: null,
  saveSuccess: false,
}

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
    updateSettingLocal: (state, action) => {
      const { category, key, value } = action.payload
      if (state.settings[category]) {
        const index = state.settings[category].findIndex((s) => s.key === key)
        if (index !== -1) {
          state.settings[category][index].value = value
          state.settings[category][index].parsedValue = value
        }
      }
      state.saveSuccess = false
    },
  },
  extraReducers: (builder) => {
    builder
      // Initialize Settings
      .addCase(initializeSettings.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(initializeSettings.fulfilled, (state) => {
        state.loading = false
        state.saveSuccess = true
      })
      .addCase(initializeSettings.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })

      // Fetch All Settings
      .addCase(fetchAllSettings.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchAllSettings.fulfilled, (state, action) => {
        state.loading = false
        if (action.payload?.settings) {
          state.settings = action.payload.settings
        }
        if (action.payload?.total !== undefined) {
          state.total = action.payload.total
        }
      })
      .addCase(fetchAllSettings.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })

      // Fetch Public Settings
      .addCase(fetchPublicSettings.fulfilled, (state, action) => {
        if (action.payload) {
          state.publicSettings = action.payload
        }
      })

      // Update Setting
      .addCase(updateSetting.pending, (state) => {
        state.saving = true
        state.error = null
      })
      .addCase(updateSetting.fulfilled, (state, action) => {
        state.saving = false
        state.saveSuccess = true
        if (action.payload?.setting) {
          const { category } = action.payload.setting
          if (state.settings[category]) {
            const index = state.settings[category].findIndex(
              (s) => s.key === action.payload.setting.key
            )
            if (index !== -1) {
              state.settings[category][index] = action.payload.setting
            }
          }
        }
      })
      .addCase(updateSetting.rejected, (state, action) => {
        state.saving = false
        state.error = action.payload
      })

      // Reset Setting
      .addCase(resetSetting.pending, (state) => {
        state.saving = true
      })
      .addCase(resetSetting.fulfilled, (state, action) => {
        state.saving = false
        state.saveSuccess = true
        if (action.payload?.setting) {
          const { category } = action.payload.setting
          if (state.settings[category]) {
            const index = state.settings[category].findIndex(
              (s) => s.key === action.payload.setting.key
            )
            if (index !== -1) {
              state.settings[category][index] = action.payload.setting
            }
          }
        }
      })
      .addCase(resetSetting.rejected, (state, action) => {
        state.saving = false
        state.error = action.payload
      })

      // Create Setting
      .addCase(createSetting.pending, (state) => {
        state.saving = true
      })
      .addCase(createSetting.fulfilled, (state, action) => {
        state.saving = false
        state.saveSuccess = true
        if (action.payload?.setting) {
          const { category } = action.payload.setting
          if (state.settings[category]) {
            state.settings[category].push(action.payload.setting)
          }
        }
      })
      .addCase(createSetting.rejected, (state, action) => {
        state.saving = false
        state.error = action.payload
      })

      // Delete Setting
      .addCase(deleteSetting.pending, (state) => {
        state.saving = true
      })
      .addCase(deleteSetting.fulfilled, (state, action) => {
        state.saving = false
        state.saveSuccess = true
        // Remove from all categories
        Object.keys(state.settings).forEach((category) => {
          state.settings[category] = state.settings[category].filter(
            (s) => s.key !== action.payload.key
          )
        })
      })
      .addCase(deleteSetting.rejected, (state, action) => {
        state.saving = false
        state.error = action.payload
      })

      // Bulk Update
      .addCase(bulkUpdateSettings.pending, (state) => {
        state.saving = true
        state.error = null
      })
      .addCase(bulkUpdateSettings.fulfilled, (state, action) => {
        state.saving = false
        state.saveSuccess = true
        if (action.payload?.updated) {
          action.payload.updated.forEach((updatedSetting) => {
            const { category } = updatedSetting
            if (state.settings[category]) {
              const index = state.settings[category].findIndex(
                (s) => s.key === updatedSetting.key
              )
              if (index !== -1) {
                state.settings[category][index] = updatedSetting
              }
            }
          })
        }
      })
      .addCase(bulkUpdateSettings.rejected, (state, action) => {
        state.saving = false
        state.error = action.payload
      })
  },
})

export const { clearError, clearSaveSuccess, updateSettingLocal } = settingsSlice.actions
export default settingsSlice.reducer
