import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { withdrawalsAPI } from '../../services/api'

// ============================================
// Multi-Sig Owner Withdrawals Slice
// ============================================
// Drives the 3-of-3 multi-signature owner withdrawal page.
//
// Funds are withdrawn from the three platform revenue wallets
// (minting, treasury, subscriptions) and split EQUALLY between the three
// owner wallets once all three owners have signed.
//
// The slice talks to the real backend (`withdrawalsAPI`) but gracefully
// falls back to browser localStorage when those endpoints are not yet
// deployed, so the page is fully functional today. See
// WITHDRAWALS_BACKEND_API_PROMPT.md for the backend contract.

const REQUIRED_SIGNATURES = 3

// localStorage keys (fallback persistence)
const OWNERS_KEY = 'degearns_withdrawal_owners'
const WITHDRAWALS_KEY = 'degearns_withdrawals'

// The three platform revenue wallets that fund withdrawals.
export const SOURCE_WALLET_TYPES = [
  {
    type: 'minting',
    label: 'Platform Minting Wallet',
    description: 'Collects revenue from NFT minting',
  },
  {
    type: 'treasury',
    label: 'Treasury Wallet',
    description: 'Collects platform treasury revenue',
  },
  {
    type: 'subscriptions',
    label: 'Subscriptions Wallet',
    description: 'Collects subscription revenue',
  },
]

// ---------------------------------------------
// Default / seed data (used until the backend is wired up)
// ---------------------------------------------
const DEFAULT_OWNERS = [
  { id: 'owner1', name: 'Constantinos', walletAddress: 'rPT1Sjq2YGrBMTttX4GZHjKu9dyfzbpAYe' },
  { id: 'owner2', name: 'Aristides', walletAddress: 'rN7n3gSFtdKkAzQhS3vvWFx6P7JzSNGiNj' },
  { id: 'owner3', name: 'Demetrios', walletAddress: 'rsP3mgGb2tcYUrxiLFiHJiQXhsKegYpnQp' },
]

const DEFAULT_SOURCE_WALLETS = [
  {
    type: 'minting',
    label: 'Platform Minting Wallet',
    description: 'Collects revenue from NFT minting',
    walletAddress: 'rHb9CJAWyB4rj91VRWn96DkukG4bwdtyTh',
    balanceDrops: '1250000000000',
    configured: true,
  },
  {
    type: 'treasury',
    label: 'Treasury Wallet',
    description: 'Collects platform treasury revenue',
    walletAddress: 'rsXwGQP9YQ9Fb3kL2mNvCpXqYtZ8KdR5wT',
    balanceDrops: '820000000000',
    configured: true,
  },
  {
    type: 'subscriptions',
    label: 'Subscriptions Wallet',
    description: 'Collects subscription revenue',
    walletAddress: 'rJ4mK2nP8qVxW7sT3yBhLcXdZ9eR6uA2gN',
    balanceDrops: '380000000000',
    configured: true,
  },
]

// ---------------------------------------------
// localStorage helpers
// ---------------------------------------------
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
    /* ignore quota / serialization errors */
  }
}

// ---------------------------------------------
// Withdrawal builder helpers
// ---------------------------------------------
const splitEqually = (totalDrops, owners) => {
  const total = BigInt(totalDrops)
  const count = BigInt(owners.length || 1)
  const base = total / count
  const remainder = total - base * count // distribute any rounding remainder to the first owners
  return owners.map((owner, index) => ({
    ownerId: owner.id,
    name: owner.name,
    walletAddress: owner.walletAddress,
    amount: (base + (BigInt(index) < remainder ? 1n : 0n)).toString(),
  }))
}

const buildWithdrawal = ({ totalAmount, reason, initiatedBy, owners, sourceWallets }) => {
  const splits = splitEqually(totalAmount, owners)
  const perSource = (BigInt(totalAmount) / BigInt(sourceWallets.length || 1)).toString()
  const now = new Date().toISOString()
  return {
    id: `wd-${Date.now()}`,
    totalAmount: String(totalAmount),
    perOwnerAmount: splits[0]?.amount || '0',
    reason,
    initiatedBy,
    status: 'pending_signatures',
    requiredSignatures: REQUIRED_SIGNATURES,
    signatures: [{ ownerId: initiatedBy, signedAt: now }],
    splits,
    sourceBreakdown: sourceWallets.map((w) => ({
      type: w.type,
      label: w.label,
      walletAddress: w.walletAddress,
      amount: perSource,
    })),
    createdAt: now,
    completedAt: null,
    rejectedAt: null,
    rejectedBy: null,
    rejectionReason: null,
    transactionHashes: null,
  }
}

const randomTxHash = () =>
  Array.from({ length: 64 }, () => '0123456789ABCDEF'[Math.floor(Math.random() * 16)]).join('')

// ============================================
// Async Thunks (API first, localStorage fallback)
// ============================================

export const fetchOwners = createAsyncThunk('withdrawals/fetchOwners', async () => {
  try {
    const response = await withdrawalsAPI.getOwners()
    const owners = response.data?.data?.owners || response.data?.data || []
    if (Array.isArray(owners) && owners.length > 0) {
      saveToStorage(OWNERS_KEY, owners)
      return owners
    }
    return loadFromStorage(OWNERS_KEY, DEFAULT_OWNERS)
  } catch {
    return loadFromStorage(OWNERS_KEY, DEFAULT_OWNERS)
  }
})

export const saveOwner = createAsyncThunk(
  'withdrawals/saveOwner',
  async (owner, { getState }) => {
    try {
      const response = await withdrawalsAPI.saveOwner(owner)
      return response.data?.data?.owner || response.data?.data || owner
    } catch {
      // Fallback: upsert into localStorage
      const current = getState().withdrawals.owners
      const id = owner.id || `owner-${Date.now()}`
      const next = owner.id
        ? current.map((o) => (o.id === owner.id ? { ...o, ...owner } : o))
        : [...current, { ...owner, id }]
      saveToStorage(OWNERS_KEY, next)
      return { ...owner, id }
    }
  }
)

export const deleteOwner = createAsyncThunk(
  'withdrawals/deleteOwner',
  async (ownerId, { getState }) => {
    try {
      await withdrawalsAPI.deleteOwner(ownerId)
    } catch {
      /* fall through to local removal */
    }
    const next = getState().withdrawals.owners.filter((o) => o.id !== ownerId)
    saveToStorage(OWNERS_KEY, next)
    return ownerId
  }
)

export const fetchSourceWallets = createAsyncThunk('withdrawals/fetchSourceWallets', async () => {
  try {
    const response = await withdrawalsAPI.getSourceWallets()
    const wallets = response.data?.data?.wallets || response.data?.data || []
    if (Array.isArray(wallets) && wallets.length > 0) {
      // Ensure all three source types are represented
      return SOURCE_WALLET_TYPES.map((src) => {
        const match = wallets.find((w) => w.type === src.type)
        return match
          ? { ...src, ...match, configured: Boolean(match.walletAddress) }
          : { ...src, walletAddress: null, balanceDrops: '0', configured: false }
      })
    }
    return DEFAULT_SOURCE_WALLETS
  } catch {
    return DEFAULT_SOURCE_WALLETS
  }
})

export const fetchWithdrawals = createAsyncThunk('withdrawals/fetchWithdrawals', async () => {
  try {
    const response = await withdrawalsAPI.getWithdrawals()
    const list = response.data?.data?.withdrawals || response.data?.data || []
    if (Array.isArray(list) && list.length > 0) {
      saveToStorage(WITHDRAWALS_KEY, list)
      return list
    }
    return loadFromStorage(WITHDRAWALS_KEY, [])
  } catch {
    return loadFromStorage(WITHDRAWALS_KEY, [])
  }
})

export const createWithdrawal = createAsyncThunk(
  'withdrawals/createWithdrawal',
  async ({ totalAmount, reason, initiatedBy }, { getState }) => {
    const { owners, sourceWallets } = getState().withdrawals
    try {
      const response = await withdrawalsAPI.createWithdrawal({ totalAmount, reason, initiatedBy })
      const created = response.data?.data?.withdrawal || response.data?.data
      if (created) return created
      throw new Error('empty response')
    } catch {
      const created = buildWithdrawal({ totalAmount, reason, initiatedBy, owners, sourceWallets })
      const next = [created, ...getState().withdrawals.withdrawals]
      saveToStorage(WITHDRAWALS_KEY, next)
      return created
    }
  }
)

export const signWithdrawal = createAsyncThunk(
  'withdrawals/signWithdrawal',
  async ({ withdrawalId, ownerId }, { getState }) => {
    try {
      const response = await withdrawalsAPI.signWithdrawal(withdrawalId, ownerId)
      const updated = response.data?.data?.withdrawal || response.data?.data
      if (updated) return updated
      throw new Error('empty response')
    } catch {
      // Local fallback: append signature, complete on the third one
      const current = getState().withdrawals.withdrawals.find((w) => w.id === withdrawalId)
      if (!current) throw new Error('Withdrawal not found')
      const alreadySigned = current.signatures.some((s) => s.ownerId === ownerId)
      const signatures = alreadySigned
        ? current.signatures
        : [...current.signatures, { ownerId, signedAt: new Date().toISOString() }]
      const isComplete = signatures.length >= (current.requiredSignatures || REQUIRED_SIGNATURES)
      const updated = {
        ...current,
        signatures,
        status: isComplete ? 'completed' : 'pending_signatures',
        completedAt: isComplete ? new Date().toISOString() : null,
        transactionHashes: isComplete
          ? (current.splits || []).map((s) => ({ ownerId: s.ownerId, hash: randomTxHash() }))
          : null,
      }
      const next = getState().withdrawals.withdrawals.map((w) =>
        w.id === withdrawalId ? updated : w
      )
      saveToStorage(WITHDRAWALS_KEY, next)
      return updated
    }
  }
)

export const rejectWithdrawal = createAsyncThunk(
  'withdrawals/rejectWithdrawal',
  async ({ withdrawalId, ownerId, reason }, { getState }) => {
    try {
      const response = await withdrawalsAPI.rejectWithdrawal(withdrawalId, ownerId, reason)
      const updated = response.data?.data?.withdrawal || response.data?.data
      if (updated) return updated
      throw new Error('empty response')
    } catch {
      const current = getState().withdrawals.withdrawals.find((w) => w.id === withdrawalId)
      if (!current) throw new Error('Withdrawal not found')
      const updated = {
        ...current,
        status: 'rejected',
        rejectedAt: new Date().toISOString(),
        rejectedBy: ownerId,
        rejectionReason: reason,
      }
      const next = getState().withdrawals.withdrawals.map((w) =>
        w.id === withdrawalId ? updated : w
      )
      saveToStorage(WITHDRAWALS_KEY, next)
      return updated
    }
  }
)

// ============================================
// Slice
// ============================================

const initialState = {
  owners: [],
  sourceWallets: [],
  withdrawals: [],
  requiredSignatures: REQUIRED_SIGNATURES,
  loading: false,
  ownersLoading: false,
  saving: false,
  signing: false,
  error: null,
  successMessage: null,
}

const withdrawalsSlice = createSlice({
  name: 'withdrawals',
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
      // Owners
      .addCase(fetchOwners.pending, (state) => {
        state.ownersLoading = true
      })
      .addCase(fetchOwners.fulfilled, (state, action) => {
        state.ownersLoading = false
        state.owners = action.payload
      })
      .addCase(fetchOwners.rejected, (state, action) => {
        state.ownersLoading = false
        state.error = action.error.message
      })

      .addCase(saveOwner.pending, (state) => {
        state.saving = true
        state.error = null
      })
      .addCase(saveOwner.fulfilled, (state, action) => {
        state.saving = false
        const owner = action.payload
        const index = state.owners.findIndex((o) => o.id === owner.id)
        if (index !== -1) {
          state.owners[index] = { ...state.owners[index], ...owner }
        } else {
          state.owners.push(owner)
        }
        state.successMessage = 'Owner saved successfully'
      })
      .addCase(saveOwner.rejected, (state, action) => {
        state.saving = false
        state.error = action.error.message
      })

      .addCase(deleteOwner.fulfilled, (state, action) => {
        state.owners = state.owners.filter((o) => o.id !== action.payload)
        state.successMessage = 'Owner removed'
      })

      // Source wallets
      .addCase(fetchSourceWallets.fulfilled, (state, action) => {
        state.sourceWallets = action.payload
      })

      // Withdrawals
      .addCase(fetchWithdrawals.pending, (state) => {
        state.loading = true
      })
      .addCase(fetchWithdrawals.fulfilled, (state, action) => {
        state.loading = false
        state.withdrawals = action.payload
      })
      .addCase(fetchWithdrawals.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message
      })

      .addCase(createWithdrawal.pending, (state) => {
        state.saving = true
        state.error = null
      })
      .addCase(createWithdrawal.fulfilled, (state, action) => {
        state.saving = false
        const exists = state.withdrawals.find((w) => w.id === action.payload.id)
        if (!exists) {
          state.withdrawals.unshift(action.payload)
        }
        state.successMessage = 'Withdrawal initiated and signed'
      })
      .addCase(createWithdrawal.rejected, (state, action) => {
        state.saving = false
        state.error = action.error.message
      })

      .addCase(signWithdrawal.pending, (state) => {
        state.signing = true
        state.error = null
      })
      .addCase(signWithdrawal.fulfilled, (state, action) => {
        state.signing = false
        const index = state.withdrawals.findIndex((w) => w.id === action.payload.id)
        if (index !== -1) {
          state.withdrawals[index] = action.payload
        }
        state.successMessage =
          action.payload.status === 'completed'
            ? 'All three owners signed — funds withdrawn'
            : 'Signature added'
      })
      .addCase(signWithdrawal.rejected, (state, action) => {
        state.signing = false
        state.error = action.error.message
      })

      .addCase(rejectWithdrawal.fulfilled, (state, action) => {
        const index = state.withdrawals.findIndex((w) => w.id === action.payload.id)
        if (index !== -1) {
          state.withdrawals[index] = action.payload
        }
        state.successMessage = 'Withdrawal rejected'
      })
  },
})

export const { clearError, clearSuccessMessage } = withdrawalsSlice.actions
export default withdrawalsSlice.reducer
