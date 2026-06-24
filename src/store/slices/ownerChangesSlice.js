import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { ownerChangesAPI } from '../../services/api'

// ============================================
// Multi-Sig Owner Change Requests Slice
// ============================================
// Owners propose removing an owner and replacing them with a new wallet.
// Requires 2-of-3 signatures from the remaining owners (the target owner
// cannot sign their own removal but can reject). Scoped per network
// (xrpl / solana). API first, with localStorage fallback so the UI works
// before / without the backend.

const REQUIRED_SIGNATURES = 2

const STORAGE_KEY = (network) => `degearns_owner_changes_${network}`

const loadFromStorage = (key, fallback) => {
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : fallback
  } catch {
    return fallback
  }
}

const saveToStorage = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    /* ignore */
  }
}

const ownerWalletOf = (owner) =>
  owner?.walletAddress || owner?.solanaAddress || owner?.address || ''

// ============================================
// Async Thunks
// ============================================

export const fetchOwnerChanges = createAsyncThunk(
  'ownerChanges/fetch',
  async ({ network = 'xrpl', status } = {}) => {
    try {
      const res = await ownerChangesAPI.list({ network, status })
      const requests = res.data?.data?.requests || res.data?.data || []
      if (Array.isArray(requests)) {
        saveToStorage(STORAGE_KEY(network), requests)
        return { network, requests }
      }
      return { network, requests: loadFromStorage(STORAGE_KEY(network), []) }
    } catch {
      return { network, requests: loadFromStorage(STORAGE_KEY(network), []) }
    }
  }
)

export const createOwnerChange = createAsyncThunk(
  'ownerChanges/create',
  async ({ network, targetOwner, newOwnerName, newOwnerWallet, initiator }) => {
    const payload = {
      network,
      targetOwnerId: targetOwner.id,
      newOwnerName,
      newOwnerWallet,
      initiatedBy: initiator.id,
    }
    try {
      const res = await ownerChangesAPI.create(payload)
      const created = res.data?.data?.request || res.data?.data
      if (created) return { network, request: created }
      throw new Error('empty response')
    } catch (err) {
      // Surface real backend validation errors (e.g. duplicate pending request)
      const apiMessage = err?.response?.data?.message
      if (apiMessage) throw new Error(apiMessage)
      const now = new Date().toISOString()
      const request = {
        id: `oc-${network}-${Date.now()}`,
        network,
        targetOwnerId: targetOwner.id,
        targetOwnerName: targetOwner.name,
        targetOwnerWallet: ownerWalletOf(targetOwner),
        newOwnerName,
        newOwnerWallet,
        initiatedBy: initiator.id,
        initiatorName: initiator.name,
        status: 'pending',
        requiredSignatures: REQUIRED_SIGNATURES,
        signatures: [{ ownerId: initiator.id, ownerName: initiator.name, signedAt: now }],
        createdAt: now,
      }
      const next = [request, ...loadFromStorage(STORAGE_KEY(network), [])]
      saveToStorage(STORAGE_KEY(network), next)
      return { network, request }
    }
  }
)

export const signOwnerChange = createAsyncThunk(
  'ownerChanges/sign',
  async ({ network, id, ownerId, ownerName }) => {
    try {
      const res = await ownerChangesAPI.sign(id, ownerId)
      const updated = res.data?.data?.request || res.data?.data
      if (updated) return { network, request: updated }
      throw new Error('empty response')
    } catch (err) {
      const apiMessage = err?.response?.data?.message
      if (apiMessage) throw new Error(apiMessage)
      const list = loadFromStorage(STORAGE_KEY(network), [])
      const current = list.find((r) => r.id === id)
      if (!current) throw new Error('Request not found')
      const already = (current.signatures || []).some((s) => s.ownerId === ownerId)
      const signatures = already
        ? current.signatures
        : [...(current.signatures || []), { ownerId, ownerName, signedAt: new Date().toISOString() }]
      const approved = signatures.length >= (current.requiredSignatures || REQUIRED_SIGNATURES)
      const updated = {
        ...current,
        signatures,
        status: approved ? 'approved' : 'pending',
        approvedAt: approved ? new Date().toISOString() : null,
      }
      const next = list.map((r) => (r.id === id ? updated : r))
      saveToStorage(STORAGE_KEY(network), next)
      return { network, request: updated }
    }
  }
)

export const rejectOwnerChange = createAsyncThunk(
  'ownerChanges/reject',
  async ({ network, id, ownerId, reason }) => {
    try {
      const res = await ownerChangesAPI.reject(id, ownerId, reason)
      const updated = res.data?.data?.request || res.data?.data
      if (updated) return { network, request: updated }
      throw new Error('empty response')
    } catch (err) {
      const apiMessage = err?.response?.data?.message
      if (apiMessage) throw new Error(apiMessage)
      const list = loadFromStorage(STORAGE_KEY(network), [])
      const current = list.find((r) => r.id === id)
      if (!current) throw new Error('Request not found')
      const updated = {
        ...current,
        status: 'rejected',
        rejectedBy: ownerId,
        rejectionReason: reason,
        rejectedAt: new Date().toISOString(),
      }
      const next = list.map((r) => (r.id === id ? updated : r))
      saveToStorage(STORAGE_KEY(network), next)
      return { network, request: updated }
    }
  }
)

// ============================================
// Slice
// ============================================

const upsert = (list, request) => {
  const index = list.findIndex((r) => r.id === request.id)
  if (index !== -1) {
    const next = [...list]
    next[index] = request
    return next
  }
  return [request, ...list]
}

const initialState = {
  requests: { xrpl: [], solana: [] },
  loading: false,
  saving: false,
  signing: false,
  error: null,
  successMessage: null,
}

const ownerChangesSlice = createSlice({
  name: 'ownerChanges',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null
    },
    clearSuccessMessage: (state) => {
      state.successMessage = null
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchOwnerChanges.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchOwnerChanges.fulfilled, (state, action) => {
        state.loading = false
        state.requests[action.payload.network] = action.payload.requests
      })
      .addCase(fetchOwnerChanges.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message
      })

      .addCase(createOwnerChange.pending, (state) => {
        state.saving = true
        state.error = null
      })
      .addCase(createOwnerChange.fulfilled, (state, action) => {
        state.saving = false
        const { network, request } = action.payload
        state.requests[network] = upsert(state.requests[network] || [], request)
        state.successMessage = 'Change request created and signed'
      })
      .addCase(createOwnerChange.rejected, (state, action) => {
        state.saving = false
        state.error = action.error.message
      })

      .addCase(signOwnerChange.pending, (state) => {
        state.signing = true
        state.error = null
      })
      .addCase(signOwnerChange.fulfilled, (state, action) => {
        state.signing = false
        const { network, request } = action.payload
        state.requests[network] = upsert(state.requests[network] || [], request)
        state.successMessage =
          request.status === 'approved'
            ? 'Approved — owner replaced'
            : 'Signature added'
      })
      .addCase(signOwnerChange.rejected, (state, action) => {
        state.signing = false
        state.error = action.error.message
      })

      .addCase(rejectOwnerChange.fulfilled, (state, action) => {
        const { network, request } = action.payload
        state.requests[network] = upsert(state.requests[network] || [], request)
        state.successMessage = 'Change request rejected'
      })
      .addCase(rejectOwnerChange.rejected, (state, action) => {
        state.error = action.error.message
      })
  },
})

export const { clearError, clearSuccessMessage } = ownerChangesSlice.actions
export default ownerChangesSlice.reducer
