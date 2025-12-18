import api from './api'

// Xaman (XUMM) Wallet Service
// This service handles the Xaman wallet authentication flow

const XAMAN_WS_TIMEOUT = 300000 // 5 minutes timeout for QR code

class XamanService {
  constructor() {
    this.websocket = null
    this.payloadId = null
  }

  /**
   * Initialize Xaman login flow
   * Returns QR code data and websocket URL for status updates
   */
  async initiateLogin() {
    try {
      const response = await api.post('/auth/xaman/init')
      const { payloadId, qrCodeUrl, qrCodeData, websocketUrl, deepLink, expiresAt } = response.data

      this.payloadId = payloadId

      return {
        success: true,
        payloadId,
        qrCodeUrl,
        qrCodeData,
        websocketUrl,
        deepLink,
        expiresAt,
      }
    } catch (error) {
      console.error('Failed to initiate Xaman login:', error)
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to initiate login',
      }
    }
  }

  /**
   * Connect to Xaman websocket to listen for sign events
   * @param {string} websocketUrl - Websocket URL from payload
   * @param {function} onSigned - Callback when user signs the request
   * @param {function} onRejected - Callback when user rejects
   * @param {function} onExpired - Callback when payload expires
   */
  connectWebSocket(websocketUrl, { onSigned, onRejected, onExpired, onOpened }) {
    return new Promise((resolve, reject) => {
      try {
        this.websocket = new WebSocket(websocketUrl)

        const timeout = setTimeout(() => {
          this.closeWebSocket()
          onExpired?.()
          reject(new Error('Payload expired'))
        }, XAMAN_WS_TIMEOUT)

        this.websocket.onopen = () => {
          console.log('Xaman WebSocket connected')
          onOpened?.()
          resolve(true)
        }

        this.websocket.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data)
            console.log('Xaman WS message:', data)

            if (data.signed === true) {
              clearTimeout(timeout)
              this.closeWebSocket()
              onSigned?.(data)
            } else if (data.signed === false) {
              clearTimeout(timeout)
              this.closeWebSocket()
              onRejected?.()
            } else if (data.expired === true) {
              clearTimeout(timeout)
              this.closeWebSocket()
              onExpired?.()
            }
          } catch (e) {
            console.error('Failed to parse WS message:', e)
          }
        }

        this.websocket.onerror = (error) => {
          console.error('Xaman WebSocket error:', error)
          clearTimeout(timeout)
          reject(error)
        }

        this.websocket.onclose = () => {
          console.log('Xaman WebSocket closed')
          clearTimeout(timeout)
        }
      } catch (error) {
        reject(error)
      }
    })
  }

  /**
   * Verify the signed payload and get auth token
   * @param {string} payloadId - The payload ID
   */
  async verifySignature(payloadId) {
    try {
      const response = await api.post('/auth/xaman/verify', { payloadId })
      const { token, user, walletAddress } = response.data

      // Store auth data
      if (token) {
        localStorage.setItem('degearns_admin_token', token)
      }
      if (user) {
        localStorage.setItem('degearns_admin_user', JSON.stringify(user))
      }

      return {
        success: true,
        token,
        user,
        walletAddress,
      }
    } catch (error) {
      console.error('Failed to verify Xaman signature:', error)
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to verify signature',
      }
    }
  }

  /**
   * Close websocket connection
   */
  closeWebSocket() {
    if (this.websocket) {
      this.websocket.close()
      this.websocket = null
    }
  }

  /**
   * Cancel current login flow
   */
  cancelLogin() {
    this.closeWebSocket()
    this.payloadId = null
  }

  /**
   * Get Xaman app deep link for mobile
   * @param {string} payloadId - The payload ID
   */
  getDeepLink(payloadId) {
    return `xumm://xumm.app/sign/${payloadId}`
  }

  /**
   * Check if running on mobile device
   */
  isMobile() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent
    )
  }
}

// Export singleton instance
export const xamanService = new XamanService()
export default xamanService
