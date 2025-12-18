import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { Wallet, Shield, ArrowRight, AlertCircle, Smartphone, QrCode } from 'lucide-react'

const Login = () => {
  const { initiateXamanLogin, handleXamanCallback, demoLogin, loading, error, qrCode, wsUrl, clearError } = useAuth()
  const [showQR, setShowQR] = useState(false)
  const [payloadUuid, setPayloadUuid] = useState(null)

  const handleConnectWallet = async () => {
    clearError()
    const result = await initiateXamanLogin()
    if (result.success) {
      setPayloadUuid(result.uuid)
      setShowQR(true)
    }
  }

  const handleSignComplete = async () => {
    if (payloadUuid) {
      await handleXamanCallback(payloadUuid)
    }
  }

  return (
    <div className="min-h-screen bg-dark-500 flex items-center justify-center p-4">
      {/* Background effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl"></div>
      </div>

      <div className="relative w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8 animate-fade-in">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl gradient-bg mb-4 shadow-lg shadow-primary-500/30">
            <span className="text-3xl font-bold text-white">DG</span>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">DeGearns</h1>
          <p className="text-gray-400">NFT Marketplace Admin Panel</p>
        </div>

        {/* Login Card */}
        <div className="glass rounded-2xl p-8 animate-fade-in" style={{ animationDelay: '0.1s' }}>
          {!showQR ? (
            <>
              <div className="text-center mb-8">
                <h2 className="text-xl font-semibold text-white mb-2">Admin Login</h2>
                <p className="text-gray-400 text-sm">
                  Connect your Xaman wallet to access the admin dashboard
                </p>
              </div>

              {error && (
                <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                  <p className="text-red-400 text-sm">{error}</p>
                </div>
              )}

              {/* Features list */}
              <div className="space-y-4 mb-8">
                <div className="flex items-center gap-3 text-gray-300">
                  <div className="w-8 h-8 rounded-lg bg-primary-500/20 flex items-center justify-center">
                    <Shield className="w-4 h-4 text-primary-400" />
                  </div>
                  <span className="text-sm">Secure wallet authentication</span>
                </div>
                <div className="flex items-center gap-3 text-gray-300">
                  <div className="w-8 h-8 rounded-lg bg-green-500/20 flex items-center justify-center">
                    <Wallet className="w-4 h-4 text-green-400" />
                  </div>
                  <span className="text-sm">Admin-only wallet access</span>
                </div>
                <div className="flex items-center gap-3 text-gray-300">
                  <div className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center">
                    <QrCode className="w-4 h-4 text-purple-400" />
                  </div>
                  <span className="text-sm">Scan QR with Xaman app</span>
                </div>
              </div>

              {/* Connect Button */}
              <button
                onClick={handleConnectWallet}
                disabled={loading}
                className="w-full py-4 px-6 gradient-bg rounded-xl text-white font-semibold
                         flex items-center justify-center gap-3 hover:opacity-90 transition-opacity
                         disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-primary-500/30"
              >
                {loading ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
                ) : (
                  <>
                    <Wallet className="w-5 h-5" />
                    Connect Xaman Wallet
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>

              {/* Demo Login */}
              <div className="mt-4 text-center">
                <button
                  onClick={demoLogin}
                  className="text-gray-400 text-sm hover:text-primary-400 transition-colors"
                >
                  Demo Login (for testing)
                </button>
              </div>
            </>
          ) : (
            <>
              {/* QR Code Display */}
              <div className="text-center">
                <h2 className="text-xl font-semibold text-white mb-2">Scan QR Code</h2>
                <p className="text-gray-400 text-sm mb-6">
                  Open your Xaman wallet app and scan this QR code
                </p>

                {/* QR Code placeholder */}
                <div className="w-48 h-48 mx-auto bg-white rounded-xl p-4 mb-6">
                  <div className="w-full h-full bg-dark-300 rounded-lg flex items-center justify-center">
                    <QrCode className="w-24 h-24 text-gray-600" />
                  </div>
                </div>

                <div className="flex items-center justify-center gap-2 text-gray-400 text-sm mb-6">
                  <Smartphone className="w-4 h-4" />
                  <span>Or open Xaman app directly</span>
                </div>

                {wsUrl && (
                  <a
                    href={wsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block mb-6 text-primary-400 hover:text-primary-300 text-sm"
                  >
                    Open in Xaman App →
                  </a>
                )}

                <div className="space-y-3">
                  <button
                    onClick={handleSignComplete}
                    disabled={loading}
                    className="w-full py-3 px-6 gradient-bg rounded-xl text-white font-semibold
                             flex items-center justify-center gap-2 hover:opacity-90 transition-opacity
                             disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
                    ) : (
                      <>
                        I've Signed the Request
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => {
                      setShowQR(false)
                      clearError()
                    }}
                    className="w-full py-3 px-6 bg-dark-300 rounded-xl text-gray-300 font-medium
                             hover:bg-dark-200 transition-colors"
                  >
                    Cancel
                  </button>
                </div>

                {error && (
                  <div className="mt-4 p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
                    <p className="text-red-400 text-sm">{error}</p>
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <p className="text-center text-gray-500 text-sm mt-6">
          Only authorized admin wallets can access this panel
        </p>
      </div>
    </div>
  )
}

export default Login
