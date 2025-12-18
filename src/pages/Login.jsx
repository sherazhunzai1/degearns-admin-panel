import { useEffect, useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Wallet, Shield, ArrowRight, AlertCircle, Smartphone, QrCode, Loader2, X, RefreshCw } from 'lucide-react'
import {
  initiateXamanLogin,
  verifyXamanSignature,
  clearError,
  cancelXamanLogin,
  setWebsocketConnected,
  setLoginStep,
  demoLogin,
} from '../store/slices/authSlice'
import xamanService from '../services/xaman'

const Login = () => {
  const dispatch = useDispatch()
  const {
    loading,
    xamanLoading,
    error,
    qrData,
    payloadId,
    loginStep,
    websocketConnected,
  } = useSelector((state) => state.auth)

  // Handle WebSocket connection and listen for sign events
  useEffect(() => {
    if (qrData?.websocketUrl && payloadId && loginStep === 'qr_displayed') {
      const connectWs = async () => {
        try {
          await xamanService.connectWebSocket(qrData.websocketUrl, {
            onOpened: () => {
              dispatch(setWebsocketConnected(true))
            },
            onSigned: async () => {
              dispatch(setLoginStep('waiting_signature'))
              // Verify the signature with backend
              dispatch(verifyXamanSignature(payloadId))
            },
            onRejected: () => {
              dispatch(setLoginStep('error'))
              dispatch(clearError())
            },
            onExpired: () => {
              dispatch(setLoginStep('error'))
            },
          })
        } catch (err) {
          console.error('WebSocket connection failed:', err)
        }
      }
      connectWs()
    }

    // Cleanup on unmount
    return () => {
      xamanService.closeWebSocket()
    }
  }, [qrData?.websocketUrl, payloadId, loginStep, dispatch])

  const handleConnectWallet = useCallback(async () => {
    dispatch(clearError())
    dispatch(initiateXamanLogin())
  }, [dispatch])

  const handleCancel = useCallback(() => {
    dispatch(cancelXamanLogin())
  }, [dispatch])

  const handleDemoLogin = useCallback(() => {
    dispatch(demoLogin())
  }, [dispatch])

  const handleRetry = useCallback(() => {
    dispatch(cancelXamanLogin())
    setTimeout(() => {
      handleConnectWallet()
    }, 100)
  }, [dispatch, handleConnectWallet])

  const isLoading = loading || xamanLoading
  const showQR = loginStep === 'qr_displayed' || loginStep === 'waiting_signature'
  const isWaitingSignature = loginStep === 'waiting_signature' || loginStep === 'verifying'

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
                  <div className="flex-1">
                    <p className="text-red-400 text-sm">{error}</p>
                    <button
                      onClick={handleRetry}
                      className="mt-2 text-sm text-primary-400 hover:text-primary-300 flex items-center gap-1"
                    >
                      <RefreshCw className="w-3 h-3" />
                      Try again
                    </button>
                  </div>
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
                disabled={isLoading}
                className="w-full py-4 px-6 gradient-bg rounded-xl text-white font-semibold
                         flex items-center justify-center gap-3 hover:opacity-90 transition-opacity
                         disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-primary-500/30"
              >
                {isLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
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
                  onClick={handleDemoLogin}
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
                <div className="flex items-center justify-between mb-4">
                  <div></div>
                  <h2 className="text-xl font-semibold text-white">
                    {isWaitingSignature ? 'Verifying...' : 'Scan QR Code'}
                  </h2>
                  <button
                    onClick={handleCancel}
                    className="p-2 rounded-lg hover:bg-dark-300 transition-colors text-gray-400"
                    disabled={isWaitingSignature}
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <p className="text-gray-400 text-sm mb-6">
                  {isWaitingSignature
                    ? 'Please wait while we verify your signature...'
                    : 'Open your Xaman wallet app and scan this QR code'}
                </p>

                {/* QR Code */}
                <div className="w-56 h-56 mx-auto bg-white rounded-xl p-3 mb-6 relative">
                  {qrData?.qrCodeUrl ? (
                    <img
                      src={qrData.qrCodeUrl}
                      alt="Xaman Login QR Code"
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <div className="w-full h-full bg-dark-300 rounded-lg flex items-center justify-center">
                      <QrCode className="w-24 h-24 text-gray-600" />
                    </div>
                  )}
                  {isWaitingSignature && (
                    <div className="absolute inset-0 bg-white/80 rounded-xl flex items-center justify-center">
                      <Loader2 className="w-12 h-12 text-primary-500 animate-spin" />
                    </div>
                  )}
                </div>

                {/* WebSocket status */}
                <div className="flex items-center justify-center gap-2 text-sm mb-4">
                  <div className={`w-2 h-2 rounded-full ${websocketConnected ? 'bg-green-500' : 'bg-yellow-500'} animate-pulse`}></div>
                  <span className={websocketConnected ? 'text-green-400' : 'text-yellow-400'}>
                    {websocketConnected ? 'Waiting for signature...' : 'Connecting...'}
                  </span>
                </div>

                {/* Mobile deep link */}
                <div className="flex items-center justify-center gap-2 text-gray-400 text-sm mb-6">
                  <Smartphone className="w-4 h-4" />
                  <span>Or open in Xaman app</span>
                </div>

                {qrData?.deepLink && (
                  <a
                    href={qrData.deepLink}
                    className="inline-flex items-center gap-2 mb-6 px-4 py-2 bg-primary-500/20 rounded-lg text-primary-400 hover:bg-primary-500/30 text-sm transition-colors"
                  >
                    <Wallet className="w-4 h-4" />
                    Open in Xaman App
                  </a>
                )}

                {/* Cancel button */}
                <div className="mt-4">
                  <button
                    onClick={handleCancel}
                    disabled={isWaitingSignature}
                    className="w-full py-3 px-6 bg-dark-300 rounded-xl text-gray-300 font-medium
                             hover:bg-dark-200 transition-colors disabled:opacity-50"
                  >
                    Cancel
                  </button>
                </div>

                {error && (
                  <div className="mt-4 p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
                    <p className="text-red-400 text-sm">{error}</p>
                    <button
                      onClick={handleRetry}
                      className="mt-2 text-sm text-primary-400 hover:text-primary-300 flex items-center gap-1 mx-auto"
                    >
                      <RefreshCw className="w-3 h-3" />
                      Try again
                    </button>
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
