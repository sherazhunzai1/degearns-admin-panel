import { useCallback, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Wallet, Shield, AlertCircle, Ghost, Loader2, RefreshCw, ExternalLink } from 'lucide-react'
import {
  loginWithPhantom,
  loginWithXaman,
  clearError,
  resetLoginState,
} from '../store/slices/authSlice'

const Login = () => {
  const dispatch = useDispatch()
  const {
    loginLoading,
    error,
    loginStep,
  } = useSelector((state) => state.auth)

  // Track which wallet the user is connecting with (for the connecting copy)
  const [connectingWith, setConnectingWith] = useState(null)

  const handleConnectPhantom = useCallback(() => {
    setConnectingWith('phantom')
    dispatch(clearError())
    dispatch(loginWithPhantom())
  }, [dispatch])

  const handleConnectXaman = useCallback(() => {
    setConnectingWith('xaman')
    dispatch(clearError())
    dispatch(loginWithXaman())
  }, [dispatch])

  const handleRetry = useCallback(() => {
    setConnectingWith(null)
    dispatch(resetLoginState())
  }, [dispatch])

  const isConnecting = loginStep === 'connecting'
  const walletName = connectingWith === 'xaman' ? 'Xaman' : 'Phantom'

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
          <div className="text-center mb-8">
            <h2 className="text-xl font-semibold text-white mb-2">Admin Login</h2>
            <p className="text-gray-400 text-sm">
              {isConnecting
                ? `Approve the request in ${walletName} to continue...`
                : 'Connect an owner wallet to access the admin dashboard'
              }
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

          {isConnecting ? (
            // Connecting state
            <div className="text-center py-8">
              <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-primary-500/20 flex items-center justify-center animate-pulse">
                <Loader2 className="w-10 h-10 text-primary-400 animate-spin" />
              </div>
              <p className="text-white font-medium mb-2">Connecting to {walletName}...</p>
              <p className="text-gray-400 text-sm mb-6">
                {connectingWith === 'xaman'
                  ? 'A popup should appear. Scan the QR code or approve the request in your Xaman app.'
                  : 'The Phantom extension should open. Approve the connection, then sign the sign-in message.'}
              </p>
              <div className="flex items-center justify-center gap-2 text-yellow-400 text-sm">
                <AlertCircle className="w-4 h-4" />
                <span>Don't see the popup? Check your wallet extension or popup blocker.</span>
              </div>
            </div>
          ) : (
            <>
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
                    <Shield className="w-4 h-4 text-green-400" />
                  </div>
                  <span className="text-sm">Owner-only wallet access</span>
                </div>
                <div className="flex items-center gap-3 text-gray-300">
                  <div className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center">
                    <Wallet className="w-4 h-4 text-purple-400" />
                  </div>
                  <span className="text-sm">Sign in with Phantom (Solana) or Xaman (XRPL)</span>
                </div>
              </div>

              {/* Connect Buttons */}
              <div className="space-y-3">
                <button
                  onClick={handleConnectPhantom}
                  disabled={loginLoading}
                  className="w-full py-4 px-6 gradient-bg rounded-xl text-white font-semibold
                           flex items-center justify-center gap-3 hover:opacity-90 transition-opacity
                           disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-primary-500/30"
                >
                  {loginLoading && connectingWith === 'phantom' ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      <Ghost className="w-5 h-5" />
                      Connect Phantom Wallet
                    </>
                  )}
                </button>

                <button
                  onClick={handleConnectXaman}
                  disabled={loginLoading}
                  className="w-full py-4 px-6 bg-dark-300 border border-gray-700 rounded-xl text-white font-semibold
                           flex items-center justify-center gap-3 hover:bg-dark-200 transition-colors
                           disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loginLoading && connectingWith === 'xaman' ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      <Wallet className="w-5 h-5" />
                      Connect Xaman Wallet
                    </>
                  )}
                </button>
              </div>

              {/* Install Links */}
              <div className="mt-4 flex items-center justify-center gap-4 text-sm">
                <a
                  href="https://phantom.app/download"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-gray-400 hover:text-primary-400 transition-colors"
                >
                  Get Phantom
                  <ExternalLink className="w-3 h-3" />
                </a>
                <span className="text-gray-700">·</span>
                <a
                  href="https://xumm.app"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-gray-400 hover:text-primary-400 transition-colors"
                >
                  Get Xaman
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <p className="text-center text-gray-500 text-sm mt-6">
          Only the three platform owner wallets can access this panel
        </p>
      </div>
    </div>
  )
}

export default Login
