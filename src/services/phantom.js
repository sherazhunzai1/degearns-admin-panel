import { getSolanaAuthorizedOwners, findOwnerBySolanaAddress } from './owners'

// ============================================
// Phantom (Solana) Wallet Service
// ============================================
// Handles admin login via the Phantom browser wallet. Only the three platform
// owners (per GET /admin/withdrawals/owners/solana/public) may sign in.

const PHANTOM_INSTALL_URL = 'https://phantom.app/download'

// Resolve the injected Phantom provider, if installed.
const getProvider = () => {
  if (typeof window === 'undefined') return null
  if (window.phantom?.solana?.isPhantom) return window.phantom.solana
  if (window.solana?.isPhantom) return window.solana
  return null
}

const buildOwnerUser = (owner, walletAddress) => ({
  id: owner.id,
  ownerId: owner.id,
  address: walletAddress,
  chain: 'solana',
  username: owner.name,
  role: 'owner',
  loginTime: new Date().toISOString(),
})

class PhantomService {
  get installUrl() {
    return PHANTOM_INSTALL_URL
  }

  isInstalled() {
    return Boolean(getProvider())
  }

  /**
   * Connect Phantom, prove wallet ownership via a signed message, and verify
   * the wallet belongs to one of the three platform owners.
   */
  async initiateLogin() {
    const provider = getProvider()
    if (!provider) {
      return {
        success: false,
        needsInstall: true,
        error: 'Phantom wallet not found. Install the Phantom browser extension to continue.',
      }
    }

    try {
      const resp = await provider.connect()
      const walletAddress = resp?.publicKey?.toString() || provider.publicKey?.toString()

      if (!walletAddress) {
        return { success: false, error: 'Could not read the Phantom wallet address.' }
      }

      // Prove ownership: the owner must approve a sign-in message in Phantom.
      try {
        const message = new TextEncoder().encode(
          `Sign in to DeGearns Admin Panel\nWallet: ${walletAddress}\nTime: ${new Date().toISOString()}`
        )
        await provider.signMessage(message, 'utf8')
      } catch {
        await this.logout()
        return { success: false, error: 'Sign-in request was rejected in Phantom.' }
      }

      // Only the platform owners may enter.
      const owners = await getSolanaAuthorizedOwners()
      const owner = findOwnerBySolanaAddress(walletAddress, owners)
      if (!owner) {
        await this.logout()
        return {
          success: false,
          error:
            'This Phantom wallet is not one of the platform owners and cannot access the admin panel.',
        }
      }

      const user = buildOwnerUser(owner, walletAddress)
      const token = `phantom_${Date.now()}_${walletAddress}`
      localStorage.setItem('degearns_admin_token', token)
      localStorage.setItem('degearns_admin_user', JSON.stringify(user))

      return { success: true, user, token, walletAddress }
    } catch (error) {
      // Phantom throws { code: 4001 } when the user rejects the connection.
      if (error?.code === 4001) {
        return { success: false, error: 'Connection request was rejected in Phantom.' }
      }
      return { success: false, error: error?.message || 'Failed to connect to Phantom wallet' }
    }
  }

  /**
   * Silently restore a trusted Phantom session (no popup) and re-verify the
   * wallet is still an owner.
   */
  async checkExistingAuth() {
    const provider = getProvider()
    if (!provider) return { authenticated: false }

    try {
      const resp = await provider.connect({ onlyIfTrusted: true })
      const walletAddress = resp?.publicKey?.toString() || provider.publicKey?.toString()
      if (!walletAddress) return { authenticated: false }

      const owners = await getSolanaAuthorizedOwners()
      const owner = findOwnerBySolanaAddress(walletAddress, owners)
      if (!owner) {
        await this.logout()
        return { authenticated: false }
      }

      return { authenticated: true, user: buildOwnerUser(owner, walletAddress) }
    } catch {
      return { authenticated: false }
    }
  }

  async logout() {
    const provider = getProvider()
    try {
      if (provider?.disconnect) await provider.disconnect()
    } catch {
      /* ignore disconnect errors */
    } finally {
      localStorage.removeItem('degearns_admin_token')
      localStorage.removeItem('degearns_admin_user')
    }
  }
}

export const phantomService = new PhantomService()
export default phantomService
