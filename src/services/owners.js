import { withdrawalsAPI } from './api'

// ============================================
// Platform Owners — single source of truth
// ============================================
// The admin panel is restricted to the three platform owners.
//
// - LOGIN identity is the owner's **Solana** wallet (Phantom). The login
//   allowlist comes from `GET /admin/withdrawals/owners/solana/public`.
// - WITHDRAWAL destinations are the owner's **XRPL** wallet (`walletAddress`).
//
// Owner lists are mirrored to localStorage so they can be checked
// synchronously at app-load / login time before any API call resolves.

// localStorage keys
export const OWNERS_STORAGE_KEY = 'degearns_withdrawal_owners' // full owners (XRPL)
export const SOLANA_OWNERS_STORAGE_KEY = 'degearns_owner_solana' // login allowlist

// Seed owners used until the backend owner endpoints are deployed.
//
// ONLY these Solana wallet addresses can log in (the login allowlist); the
// XRPL `walletAddress` is the withdrawal destination. To bootstrap before the
// backend is live, replace the addresses below with the real owner wallets.
// Once `GET /admin/withdrawals/owners/solana/public` is deployed it becomes
// the source of truth and these seeds are no longer used.
export const DEFAULT_OWNERS = [
  {
    id: 'owner1',
    name: 'Constantinos',
    walletAddress: 'rPT1Sjq2YGrBMTttX4GZHjKu9dyfzbpAYe',
    solanaAddress: '7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU',
  },
  {
    id: 'owner2',
    name: 'Aristides',
    walletAddress: 'rN7n3gSFtdKkAzQhS3vvWFx6P7JzSNGiNj',
    solanaAddress: '9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM',
  },
  {
    id: 'owner3',
    name: 'Demetrios',
    walletAddress: 'rsP3mgGb2tcYUrxiLFiHJiQXhsKegYpnQp',
    solanaAddress: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
  },
]

// Resolve an owner's Solana address from a variety of possible field names.
const ownerSolanaAddress = (o) =>
  o?.solanaAddress || o?.solana || o?.solanaWallet || o?.walletAddress || o?.address || null

const readStored = (key) => {
  try {
    const raw = localStorage.getItem(key)
    const parsed = raw ? JSON.parse(raw) : null
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : null
  } catch {
    return null
  }
}

const writeStored = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    /* ignore storage errors */
  }
}

// ---------------------------------------------
// XRPL owners (withdrawal destinations)
// ---------------------------------------------

// Find an owner by exact XRPL wallet address (addresses are case-sensitive).
export const findOwnerByAddress = (address, owners) => {
  if (!address) return null
  const target = String(address).trim()
  return (owners || []).find((o) => o.walletAddress && o.walletAddress.trim() === target) || null
}

export const getKnownOwnersSync = () => readStored(OWNERS_STORAGE_KEY) || DEFAULT_OWNERS

// Authoritative owner list (with XRPL addresses): database first, then local.
export const getAuthorizedOwners = async () => {
  try {
    const response = await withdrawalsAPI.getOwners()
    const owners = response.data?.data?.owners || response.data?.data || []
    if (Array.isArray(owners) && owners.length > 0) {
      writeStored(OWNERS_STORAGE_KEY, owners)
      return owners
    }
  } catch {
    /* fall through to local / default list */
  }
  return getKnownOwnersSync()
}

// ---------------------------------------------
// Solana owners (Phantom login allowlist)
// ---------------------------------------------

// Find an owner by exact Solana wallet address (case-sensitive base58).
export const findOwnerBySolanaAddress = (address, owners) => {
  if (!address) return null
  const target = String(address).trim()
  return (owners || []).find((o) => ownerSolanaAddress(o) === target) || null
}

const seedSolanaOwners = () =>
  DEFAULT_OWNERS.map((o) => ({ id: o.id, name: o.name, solanaAddress: o.solanaAddress }))

export const getKnownSolanaOwnersSync = () =>
  readStored(SOLANA_OWNERS_STORAGE_KEY) || seedSolanaOwners()

// Synchronous check used to gate a restored Phantom session at load time.
export const isAuthorizedSolanaOwnerSync = (address) =>
  Boolean(findOwnerBySolanaAddress(address, getKnownSolanaOwnersSync()))

// Authoritative Solana login allowlist: public endpoint first, then local.
// Called at login time when there is no auth token, so it usually falls
// through to the locally-known list.
export const getSolanaAuthorizedOwners = async () => {
  try {
    const response = await withdrawalsAPI.getSolanaOwnersPublic()
    const owners = response.data?.data?.owners || response.data?.data || []
    if (Array.isArray(owners) && owners.length > 0) {
      const normalized = owners.map((o) => ({
        id: o.id,
        name: o.name,
        solanaAddress: ownerSolanaAddress(o),
      }))
      writeStored(SOLANA_OWNERS_STORAGE_KEY, normalized)
      return normalized
    }
  } catch {
    /* fall through to local / default list */
  }
  return getKnownSolanaOwnersSync()
}
