import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { collectionsAPI } from '../../services/api'

// Async thunks
export const fetchCollections = createAsyncThunk(
  'collections/fetchCollections',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await collectionsAPI.getCollections(params)
      return response.data.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch collections')
    }
  }
)

export const fetchCollectionStatistics = createAsyncThunk(
  'collections/fetchStatistics',
  async (_, { rejectWithValue }) => {
    try {
      const response = await collectionsAPI.getStatistics()
      return response.data.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch collection statistics')
    }
  }
)

export const fetchPendingVerification = createAsyncThunk(
  'collections/fetchPendingVerification',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await collectionsAPI.getPendingVerification(params)
      return response.data.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch pending verifications')
    }
  }
)

export const fetchCollectionDetails = createAsyncThunk(
  'collections/fetchDetails',
  async (collectionId, { rejectWithValue }) => {
    try {
      const response = await collectionsAPI.getCollection(collectionId)
      return response.data.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch collection details')
    }
  }
)

export const updateCollection = createAsyncThunk(
  'collections/update',
  async ({ collectionId, data }, { rejectWithValue }) => {
    try {
      const response = await collectionsAPI.updateCollection(collectionId, data)
      return response.data.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update collection')
    }
  }
)

export const updateCollectionVerification = createAsyncThunk(
  'collections/updateVerification',
  async ({ collectionId, isVerified, reason }, { rejectWithValue }) => {
    try {
      const response = await collectionsAPI.updateVerification(collectionId, isVerified, reason)
      return { collectionId, isVerified, ...response.data.data }
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update verification')
    }
  }
)

export const deleteCollection = createAsyncThunk(
  'collections/delete',
  async ({ collectionId, reason }, { rejectWithValue }) => {
    try {
      await collectionsAPI.deleteCollection(collectionId, reason)
      return { collectionId }
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete collection')
    }
  }
)

export const bulkVerifyCollections = createAsyncThunk(
  'collections/bulkVerify',
  async ({ collectionIds, isVerified, reason }, { rejectWithValue }) => {
    try {
      const response = await collectionsAPI.bulkVerify(collectionIds, isVerified, reason)
      return { collectionIds, isVerified, ...response.data.data }
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to bulk verify collections')
    }
  }
)

const initialState = {
  collections: [],
  selectedCollection: null,
  pendingVerifications: [],
  statistics: {
    totalCollections: 0,
    verifiedCollections: 0,
    unverifiedCollections: 0,
    totalVolume: '0',
    totalVolumeXrp: '0',
    categoryBreakdown: {
      art: 0,
      music: 0,
      photography: 0,
      gaming: 0,
      collectibles: 0,
      other: 0
    },
    newCollections: {
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
    category: undefined,
    isVerified: undefined,
    creatorWallet: undefined,
    sortBy: 'createdAt',
    sortOrder: 'DESC',
  },
  loading: false,
  statsLoading: false,
  actionLoading: false,
  error: null,
}

const collectionsSlice = createSlice({
  name: 'collections',
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
    clearSelectedCollection: (state) => {
      state.selectedCollection = null
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Collections
      .addCase(fetchCollections.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchCollections.fulfilled, (state, action) => {
        state.loading = false
        state.collections = action.payload?.collections || []
        state.pagination = action.payload?.pagination || state.pagination
      })
      .addCase(fetchCollections.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })

      // Fetch Statistics
      .addCase(fetchCollectionStatistics.pending, (state) => {
        state.statsLoading = true
      })
      .addCase(fetchCollectionStatistics.fulfilled, (state, action) => {
        state.statsLoading = false
        if (action.payload) {
          state.statistics = action.payload
        }
      })
      .addCase(fetchCollectionStatistics.rejected, (state, action) => {
        state.statsLoading = false
        state.error = action.payload
      })

      // Fetch Pending Verifications
      .addCase(fetchPendingVerification.fulfilled, (state, action) => {
        state.pendingVerifications = action.payload?.collections || []
      })

      // Fetch Collection Details
      .addCase(fetchCollectionDetails.pending, (state) => {
        state.loading = true
      })
      .addCase(fetchCollectionDetails.fulfilled, (state, action) => {
        state.loading = false
        state.selectedCollection = action.payload
      })
      .addCase(fetchCollectionDetails.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })

      // Update Collection
      .addCase(updateCollection.pending, (state) => {
        state.actionLoading = true
      })
      .addCase(updateCollection.fulfilled, (state, action) => {
        state.actionLoading = false
        if (action.payload?.collection) {
          const index = state.collections.findIndex((c) => c.id === action.payload.collection.id)
          if (index !== -1) {
            state.collections[index] = action.payload.collection
          }
          if (state.selectedCollection?.id === action.payload.collection.id) {
            state.selectedCollection = action.payload.collection
          }
        }
      })
      .addCase(updateCollection.rejected, (state, action) => {
        state.actionLoading = false
        state.error = action.payload
      })

      // Update Verification
      .addCase(updateCollectionVerification.pending, (state) => {
        state.actionLoading = true
      })
      .addCase(updateCollectionVerification.fulfilled, (state, action) => {
        state.actionLoading = false
        const index = state.collections.findIndex((c) => c.id === action.payload.collectionId)
        if (index !== -1) {
          state.collections[index].isVerified = action.payload.isVerified
        }
        if (state.selectedCollection?.id === action.payload.collectionId) {
          state.selectedCollection.isVerified = action.payload.isVerified
        }
        // Remove from pending verifications if verified
        if (action.payload.isVerified) {
          state.pendingVerifications = state.pendingVerifications.filter(
            (c) => c.id !== action.payload.collectionId
          )
        }
      })
      .addCase(updateCollectionVerification.rejected, (state, action) => {
        state.actionLoading = false
        state.error = action.payload
      })

      // Delete Collection
      .addCase(deleteCollection.pending, (state) => {
        state.actionLoading = true
      })
      .addCase(deleteCollection.fulfilled, (state, action) => {
        state.actionLoading = false
        state.collections = state.collections.filter((c) => c.id !== action.payload.collectionId)
        if (state.selectedCollection?.id === action.payload.collectionId) {
          state.selectedCollection = null
        }
      })
      .addCase(deleteCollection.rejected, (state, action) => {
        state.actionLoading = false
        state.error = action.payload
      })

      // Bulk Verify
      .addCase(bulkVerifyCollections.pending, (state) => {
        state.actionLoading = true
      })
      .addCase(bulkVerifyCollections.fulfilled, (state, action) => {
        state.actionLoading = false
        const { collectionIds, isVerified } = action.payload
        state.collections = state.collections.map((collection) => {
          if (collectionIds.includes(collection.id)) {
            return { ...collection, isVerified }
          }
          return collection
        })
        if (isVerified) {
          state.pendingVerifications = state.pendingVerifications.filter(
            (c) => !collectionIds.includes(c.id)
          )
        }
      })
      .addCase(bulkVerifyCollections.rejected, (state, action) => {
        state.actionLoading = false
        state.error = action.payload
      })
  },
})

export const { clearError, setFilters, setPage, clearSelectedCollection } = collectionsSlice.actions
export default collectionsSlice.reducer
