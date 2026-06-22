import { useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Wallet, Shield, ArrowRight, AlertCircle, Ghost, Loader2, RefreshCw, ExternalLink } from 'lucide-react'
import {
  loginWithPhantom,
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

  const handleConnectWallet = useCallback(async () => {
    dispatch(clearError())
    dispatch(loginWithPhantom())
  }, [dispatch])

  const handleRetry = useCallback(() => {
    dispatch(resetLoginState())
  }, [dispatch])

  const isConnecting = loginStep === 'connecting'

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
                ? 'Approve the connection and sign-in request in Phantom...'
                : 'Connect your Phantom wallet to access the admin dashboard'
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
              <p className="text-white font-medium mb-2">Connecting to Phantom...</p>
              <p className="text-gray-400 text-sm mb-6">
                The Phantom extension should open. Approve the connection, then sign the sign-in
                message to continue.
              </p>
              <div className="flex items-center justify-center gap-2 text-yellow-400 text-sm">
                <AlertCircle className="w-4 h-4" />
                <span>Don't see the popup? Open the Phantom extension manually.</span>
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
                    <Wallet className="w-4 h-4 text-green-400" />
                  </div>
                  <span className="text-sm">Owner-only wallet access</span>
                </div>
                <div className="flex items-center gap-3 text-gray-300">
                  <div className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center">
                    <Ghost className="w-4 h-4 text-purple-400" />
                  </div>
                  <span className="text-sm">Sign in with Solana Phantom wallet</span>
                </div>
              </div>

              {/* Connect Button */}
              <button
                onClick={handleConnectWallet}
                disabled={loginLoading}
                className="w-full py-4 px-6 gradient-bg rounded-xl text-white font-semibold
                         flex items-center justify-center gap-3 hover:opacity-90 transition-opacity
                         disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-primary-500/30"
              >
                {loginLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <Ghost className="w-5 h-5" />
                    Connect Phantom Wallet
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>

              {/* Phantom App Link */}
              <div className="mt-4 text-center">
                <a
                  href="https://phantom.app/download"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-gray-400 text-sm hover:text-primary-400 transition-colors"
                >
                  Don't have Phantom?
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

        {/* Setup Instructions */}
        <div className="mt-6 p-4 rounded-xl bg-dark-400/50 border border-gray-800">
          <p className="text-gray-400 text-xs text-center">
            <strong className="text-gray-300">Note:</strong> Install the Phantom wallet from{' '}
            <a
              href="https://phantom.app/download"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary-400 hover:underline"
            >
              phantom.app
            </a>
            {' '}and connect with one of the registered owner wallets to sign in.
          </p>
        </div>
      </div>
    </div>
  )
}

export default Login
