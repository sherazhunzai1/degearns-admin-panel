import { createContext, useContext, useState, useEffect } from 'react'

const AuthContext = createContext(null)

// Admin wallet addresses that are allowed to access the panel
const ADMIN_WALLETS = [
  'rDEGEARNS...', // Replace with actual admin wallet
  // Add more admin wallets as needed
]

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [qrCode, setQrCode] = useState(null)
  const [wsUrl, setWsUrl] = useState(null)

  useEffect(() => {
    // Check for existing session
    const savedUser = localStorage.getItem('degearns_admin_user')
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser))
      } catch (e) {
        localStorage.removeItem('degearns_admin_user')
      }
    }
    setLoading(false)
  }, [])

  const initiateXamanLogin = async () => {
    setError(null)
    setLoading(true)

    try {
      // In production, this would be a call to your backend which uses XUMM SDK
      // For demo purposes, we'll simulate the XUMM sign-in flow

      // Simulated XUMM payload response
      const mockPayload = {
        uuid: 'mock-uuid-' + Date.now(),
        refs: {
          qr_png: 'https://xumm.app/sign/mock-qr.png',
          websocket_status: 'wss://xumm.app/sign/mock-ws'
        },
        next: {
          always: 'https://xumm.app/sign/mock'
        }
      }

      setQrCode(mockPayload.refs.qr_png)
      setWsUrl(mockPayload.next.always)

      // In production, you would connect to websocket and wait for sign
      // For demo, we'll show how to handle the callback

      return {
        success: true,
        qrUrl: mockPayload.refs.qr_png,
        deepLink: mockPayload.next.always,
        uuid: mockPayload.uuid
      }
    } catch (err) {
      setError('Failed to initiate Xaman login. Please try again.')
      console.error('Xaman login error:', err)
      return { success: false, error: err.message }
    } finally {
      setLoading(false)
    }
  }

  const handleXamanCallback = async (payloadUuid) => {
    setLoading(true)
    setError(null)

    try {
      // In production, verify the signed payload with your backend
      // For demo purposes, we'll simulate a successful sign-in

      // Simulated signed response
      const mockSignedData = {
        account: 'rDeGeArNsAdMiN1234567890XRP',
        txid: 'mock-txid-' + Date.now()
      }

      // Check if the wallet is an admin wallet
      // For demo, we'll allow any wallet
      const isAdmin = true // In production: ADMIN_WALLETS.includes(mockSignedData.account)

      if (!isAdmin) {
        throw new Error('This wallet is not authorized as an admin.')
      }

      const userData = {
        address: mockSignedData.account,
        loginTime: new Date().toISOString(),
        isAdmin: true
      }

      setUser(userData)
      localStorage.setItem('degearns_admin_user', JSON.stringify(userData))
      setQrCode(null)
      setWsUrl(null)

      return { success: true, user: userData }
    } catch (err) {
      setError(err.message || 'Failed to verify Xaman signature.')
      return { success: false, error: err.message }
    } finally {
      setLoading(false)
    }
  }

  const demoLogin = () => {
    // Demo login for testing without actual Xaman wallet
    const userData = {
      address: 'rDeGeArNsAdMiN1234567890XRP',
      loginTime: new Date().toISOString(),
      isAdmin: true
    }
    setUser(userData)
    localStorage.setItem('degearns_admin_user', JSON.stringify(userData))
    setQrCode(null)
    setWsUrl(null)
  }

  const logout = () => {
    setUser(null)
    setQrCode(null)
    setWsUrl(null)
    localStorage.removeItem('degearns_admin_user')
  }

  const value = {
    user,
    loading,
    error,
    qrCode,
    wsUrl,
    isAuthenticated: !!user,
    initiateXamanLogin,
    handleXamanCallback,
    demoLogin,
    logout,
    clearError: () => setError(null)
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export default AuthContext
