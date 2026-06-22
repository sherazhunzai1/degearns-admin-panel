import { XummPkce } from 'xumm-oauth2-pkce'
import { getXrplAuthorizedOwners, findOwnerByAddress } from './owners'

// ============================================
// Xaman (XUMM) Wallet Service — XRPL login
// ============================================
// Handles admin login via the Xaman wallet. Only the three platform owners
// (matched on their XRPL wallet address) may sign in.

// Create an app at https://apps.xumm.dev to get your API key.
const XUMM_API_KEY = import.meta.env.VITE_XUMM_API_KEY || 'your-xumm-api-key'

const buildOwnerUser = (owner, walletAddress, sub, picture) => ({
  id: sub || `${owner.id}-${Date.now()}`,
  ownerId: owner.id,
  address: walletAddress,
  chain: 'xrpl',
  username: owner.name,
  picture: picture || null,
  role: 'owner',
  loginTime: new Date().toISOString(),
})

class XamanService {
  constructor() {
    this.xumm = null
    this.initialized = false
  }

  async initialize() {
    if (this.initialized && this.xumm) return true
    try {
      this.xumm = new XummPkce(XUMM_API_KEY, {
        implicit: true,
        redirectUrl: window.location.origin + '/login',
      })
      this.initialized = true
      return true
    } catch (error) {
      console.error('Failed to initialize Xaman SDK:', error)
      return false
    }
  }

  /**
   * Connect Xaman and verify the wallet belongs to one of the three owners.
   */
  async initiateLogin() {
    try {
      await this.initialize()
      if (!this.xumm) throw new Error('Xaman SDK not initialized')

      const authResult = await this.xumm.authorize()

      if (authResult && authResult.me) {
        const walletAddress = authResult.me.account

        // Only the three platform owners may access the admin panel.
        const owners = await getXrplAuthorizedOwners()
        const owner = findOwnerByAddress(walletAddress, owners)
        if (!owner) {
          await this.logout()
          return {
            success: false,
            error:
              'This wallet is not one of the platform owners and cannot access the admin panel.',
          }
        }

        const user = buildOwnerUser(owner, walletAddress, authResult.me.sub, authResult.me.picture)
        const token = `xumm_${Date.now()}_${walletAddress}`
        localStorage.setItem('degearns_admin_token', token)
        localStorage.setItem('degearns_admin_user', JSON.stringify(user))

        return { success: true, user, token, walletAddress }
      }

      return { success: false, error: 'Authentication cancelled or failed' }
    } catch (error) {
      console.error('Xaman login error:', error)
      return { success: false, error: error.message || 'Failed to authenticate with Xaman wallet' }
    }
  }

  /**
   * Restore an existing Xaman session and re-verify the wallet is an owner.
   */
  async checkExistingAuth() {
    try {
      await this.initialize()
      if (!this.xumm) return { authenticated: false }

      const state = await this.xumm.state()

      if (state && state.me) {
        const walletAddress = state.me.account

        const owners = await getXrplAuthorizedOwners()
        const owner = findOwnerByAddress(walletAddress, owners)
        if (!owner) {
          await this.logout()
          return { authenticated: false }
        }

        return {
          authenticated: true,
          user: buildOwnerUser(owner, walletAddress, state.me.sub, state.me.picture),
        }
      }

      return { authenticated: false }
    } catch (error) {
      console.error('Check auth error:', error)
      return { authenticated: false }
    }
  }

  async logout() {
    try {
      if (this.xumm) await this.xumm.logout()
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      localStorage.removeItem('degearns_admin_token')
      localStorage.removeItem('degearns_admin_user')
    }
  }
}

export const xamanService = new XamanService()
export default xamanService
