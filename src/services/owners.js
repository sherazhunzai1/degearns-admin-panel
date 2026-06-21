import { withdrawalsAPI } from './api'

// ============================================
// Platform Owners — single source of truth
// ============================================
// The admin panel is restricted to the three platform owners. Their wallet
// addresses are stored in the database (via `withdrawalsAPI`) and mirrored to
// localStorage so they can be checked synchronously at app-load / login time
// before any authenticated API call is possible.

// localStorage key shared with the withdrawals slice
export const OWNERS_STORAGE_KEY = 'degearns_withdrawal_owners'

// Seed owners used until the backend owner endpoints are deployed.
//
// ONLY these wallet addresses can log in and sign withdrawals. To bootstrap
// before the backend is live, replace the three addresses below with the real
// owners' Xaman wallet addresses (this is the login allowlist). Once the
// backend `/admin/withdrawals/owners` endpoint is deployed it becomes the
// source of truth and these seeds are no longer used.
export const DEFAULT_OWNERS = [
  { id: 'owner1', name: 'Constantinos', walletAddress: 'rPT1Sjq2YGrBMTttX4GZHjKu9dyfzbpAYe' },
  { id: 'owner2', name: 'Aristides', walletAddress: 'rN7n3gSFtdKkAzQhS3vvWFx6P7JzSNGiNj' },
  { id: 'owner3', name: 'Demetrios', walletAddress: 'rsP3mgGb2tcYUrxiLFiHJiQXhsKegYpnQp' },
]

const readStoredOwners = () => {
  try {
    const raw = localStorage.getItem(OWNERS_STORAGE_KEY)
    const parsed = raw ? JSON.parse(raw) : null
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : null
  } catch {
    return null
  }
}

// Find an owner by exact wallet address (XRPL addresses are case-sensitive).
export const findOwnerByAddress = (address, owners) => {
  if (!address) return null
  const target = String(address).trim()
  return (owners || []).find((o) => o.walletAddress && o.walletAddress.trim() === target) || null
}

// Synchronous list of known owners (localStorage first, then seed defaults).
// Used for load-time session validation before an API call is possible.
export const getKnownOwnersSync = () => readStoredOwners() || DEFAULT_OWNERS

// Synchronous check used to gate a restored session.
export const isAuthorizedOwnerSync = (address) =>
  Boolean(findOwnerByAddress(address, getKnownOwnersSync()))

// Authoritative owner list: try the database first, fall back to the
// locally-known list. At login time there is no auth token yet, so the API
// call typically falls through to localStorage / defaults.
export const getAuthorizedOwners = async () => {
  try {
    const response = await withdrawalsAPI.getOwners()
    const owners = response.data?.data?.owners || response.data?.data || []
    if (Array.isArray(owners) && owners.length > 0) {
      try {
        localStorage.setItem(OWNERS_STORAGE_KEY, JSON.stringify(owners))
      } catch {
        /* ignore storage errors */
      }
      return owners
    }
  } catch {
    /* fall through to local / default list */
  }
  return getKnownOwnersSync()
}
