import { XummPkce } from 'xumm-oauth2-pkce'

// Xaman (XUMM) Wallet Service
// This service handles direct Xaman wallet authentication without backend

// You need to create an app at https://apps.xumm.dev to get your API key
// For development, you can use this demo API key (replace with your own for production)
const XUMM_API_KEY = import.meta.env.VITE_XUMM_API_KEY || 'your-xumm-api-key'

// List of authorized admin wallet addresses
// Add your admin wallet addresses here
const AUTHORIZED_ADMIN_WALLETS = [
  // Add authorized admin wallet addresses here
  // Example: 'rYourAdminWalletAddress123'
]

class XamanService {
  constructor() {
    this.xumm = null
    this.initialized = false
  }

  /**
   * Initialize the Xaman SDK
   */
  async initialize() {
    if (this.initialized && this.xumm) {
      return true
    }

    try {
      this.xumm = new XummPkce(XUMM_API_KEY, {
        implicit: true, // Use implicit flow for simpler auth
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
   * Initiate login with Xaman wallet
   * Opens popup or redirects to Xaman for authentication
   */
  async initiateLogin() {
    try {
      await this.initialize()

      if (!this.xumm) {
        throw new Error('Xaman SDK not initialized')
      }

      // Authorize with Xaman - this will open a popup or redirect
      const authResult = await this.xumm.authorize()

      if (authResult && authResult.me) {
        const walletAddress = authResult.me.account
        const userToken = authResult.me.sub

        // Check if wallet is authorized (if admin list is configured)
        if (AUTHORIZED_ADMIN_WALLETS.length > 0 && !AUTHORIZED_ADMIN_WALLETS.includes(walletAddress)) {
          this.logout()
          return {
            success: false,
            error: 'This wallet is not authorized to access the admin panel',
          }
        }

        // Create user object
        const user = {
          id: userToken,
          address: walletAddress,
          username: authResult.me.name || `Admin_${walletAddress.slice(0, 6)}`,
          picture: authResult.me.picture || null,
          role: 'admin',
          loginTime: new Date().toISOString(),
        }

        // Store auth data in localStorage
        const token = `xumm_${Date.now()}_${walletAddress}`
        localStorage.setItem('degearns_admin_token', token)
        localStorage.setItem('degearns_admin_user', JSON.stringify(user))

        return {
          success: true,
          user,
          token,
          walletAddress,
        }
      }

      return {
        success: false,
        error: 'Authentication cancelled or failed',
      }
    } catch (error) {
      console.error('Xaman login error:', error)
      return {
        success: false,
        error: error.message || 'Failed to authenticate with Xaman wallet',
      }
    }
  }

  /**
   * Check if user is already authenticated
   */
  async checkExistingAuth() {
    try {
      await this.initialize()

      if (!this.xumm) {
        return { authenticated: false }
      }

      // Check if there's an existing session
      const state = await this.xumm.state()

      if (state && state.me) {
        const user = {
          id: state.me.sub,
          address: state.me.account,
          username: state.me.name || `Admin_${state.me.account.slice(0, 6)}`,
          picture: state.me.picture || null,
          role: 'admin',
          loginTime: new Date().toISOString(),
        }

        return {
          authenticated: true,
          user,
        }
      }

      return { authenticated: false }
    } catch (error) {
      console.error('Check auth error:', error)
      return { authenticated: false }
    }
  }

  /**
   * Logout from Xaman
   */
  async logout() {
    try {
      if (this.xumm) {
        await this.xumm.logout()
      }
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      // Clear local storage regardless of SDK logout result
      localStorage.removeItem('degearns_admin_token')
      localStorage.removeItem('degearns_admin_user')
    }
  }

  /**
   * Check if running on mobile device
   */
  isMobile() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent
    )
  }

  /**
   * Get Xaman app deep link
   */
  getDeepLink() {
    return 'xumm://xumm.app'
  }
}

// Export singleton instance
export const xamanService = new XamanService()
export default xamanService
