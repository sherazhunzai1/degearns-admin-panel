import { useState, useEffect, useMemo } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
  Users,
  UserCog,
  UserPlus,
  ShieldCheck,
  ShieldAlert,
  Clock,
  CheckCircle,
  XCircle,
  Loader2,
  X,
  ArrowRight,
  Ban,
  Copy,
  Check,
  AlertCircle,
  History,
} from 'lucide-react'
import {
  fetchOwnerChanges,
  createOwnerChange,
  signOwnerChange,
  rejectOwnerChange,
  clearError,
  clearSuccessMessage,
} from '../store/slices/ownerChangesSlice'
import { getXrplAuthorizedOwners, getSolanaAuthorizedOwners } from '../services/owners'

// ============================================
// Helpers
// ============================================

const isValidXrplAddress = (address) =>
  typeof address === 'string' && /^r[1-9A-HJ-NP-Za-km-z]{24,34}$/.test(address.trim())

const isValidSolanaAddress = (address) =>
  typeof address === 'string' && /^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(address.trim())

const NETWORKS = [
  {
    key: 'xrpl',
    label: 'XRPL Owners',
    walletLabel: 'Xaman',
    addressField: 'walletAddress',
    isValid: isValidXrplAddress,
    placeholder: 'rXXX...',
    addressHint: 'a valid XRPL r-address',
  },
  {
    key: 'solana',
    label: 'Solana Owners',
    walletLabel: 'Phantom',
    addressField: 'solanaAddress',
    isValid: isValidSolanaAddress,
    placeholder: 'Solana wallet address...',
    addressHint: 'a valid Solana (base58) address',
  },
]

const initials = (name) =>
  (name || '?')
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

const formatAddress = (address) =>
  address ? `${address.slice(0, 8)}...${address.slice(-6)}` : '-'

const formatDate = (dateString) => {
  if (!dateString) return '-'
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

const Avatar = ({ name, size = 'md' }) => {
  const sizeClasses = {
    sm: 'w-6 h-6 text-[10px]',
    md: 'w-9 h-9 text-xs',
    lg: 'w-11 h-11 text-sm',
  }
  return (
    <div
      className={`${sizeClasses[size]} rounded-full bg-gradient-to-br from-primary-500 to-purple-500 flex items-center justify-center flex-shrink-0`}
    >
      <span className="text-white font-medium">{initials(name)}</span>
    </div>
  )
}

const StatusBadge = ({ request }) => {
  const required = request.requiredSignatures || 2
  const signed = (request.signatures || []).length
  let config
  if (request.status === 'approved') {
    config = { bg: 'bg-green-500/20', text: 'text-green-400', border: 'border-green-500/30', icon: CheckCircle, label: 'Completed' }
  } else if (request.status === 'rejected') {
    config = { bg: 'bg-red-500/20', text: 'text-red-400', border: 'border-red-500/30', icon: XCircle, label: 'Rejected' }
  } else {
    config = { bg: 'bg-yellow-500/20', text: 'text-yellow-400', border: 'border-yellow-500/30', icon: Clock, label: `Awaiting Signatures (${signed}/${required})` }
  }
  const Icon = config.icon
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs rounded-full font-medium ${config.bg} ${config.text} border ${config.border}`}>
      <Icon className="w-3 h-3" />
      {config.label}
    </span>
  )
}

// ============================================
// Main Component
// ============================================

const OwnerManagement = () => {
  const dispatch = useDispatch()
  const { user } = useSelector((state) => state.auth)
  const { requests, loading, saving, signing, error, successMessage } = useSelector(
    (state) => state.ownerChanges
  )

  // Default to the network the owner logged in with
  const [network, setNetwork] = useState(user?.chain === 'solana' ? 'solana' : 'xrpl')
  const net = NETWORKS.find((n) => n.key === network) || NETWORKS[0]

  const [networkOwners, setNetworkOwners] = useState([])
  const [ownersLoading, setOwnersLoading] = useState(false)

  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showRejectModal, setShowRejectModal] = useState(false)
  const [selectedRequest, setSelectedRequest] = useState(null)
  const [createForm, setCreateForm] = useState({ target: null, newOwnerName: '', newOwnerWallet: '' })
  const [rejectionReason, setRejectionReason] = useState('')
  const [copiedKey, setCopiedKey] = useState(null)

  // Load owners for the selected network
  useEffect(() => {
    let active = true
    setOwnersLoading(true)
    const loader = network === 'solana' ? getSolanaAuthorizedOwners : getXrplAuthorizedOwners
    loader()
      .then((list) => {
        if (active) setNetworkOwners(Array.isArray(list) ? list : [])
      })
      .finally(() => {
        if (active) setOwnersLoading(false)
      })
    return () => {
      active = false
    }
  }, [network])

  // Load change requests for the selected network
  useEffect(() => {
    dispatch(fetchOwnerChanges({ network }))
  }, [dispatch, network])

  useEffect(() => {
    if (successMessage) {
      const t = setTimeout(() => dispatch(clearSuccessMessage()), 3500)
      return () => clearTimeout(t)
    }
  }, [successMessage, dispatch])

  const ownerWallet = (owner) =>
    owner?.[net.addressField] || owner?.walletAddress || owner?.solanaAddress || owner?.address || ''

  // The owner currently connected (only they can act on this network)
  const currentOwner =
    networkOwners.find((o) => o.id === user?.ownerId) ||
    networkOwners.find((o) => ownerWallet(o) && ownerWallet(o) === user?.address) ||
    null

  const networkRequests = requests[network] || []
  const pendingRequest = networkRequests.find((r) => r.status === 'pending')
  const history = useMemo(
    () =>
      (requests[network] || [])
        .filter((r) => r.status !== 'pending')
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)),
    [requests, network]
  )

  const hasSigned = (request, ownerId) =>
    (request?.signatures || []).some((s) => s.ownerId === ownerId)

  const copyToClipboard = (text, key) => {
    navigator.clipboard.writeText(text)
    setCopiedKey(key)
    setTimeout(() => setCopiedKey(null), 2000)
  }

  // ---- Handlers ----
  const handleOpenCreate = (target) => {
    setCreateForm({ target, newOwnerName: '', newOwnerWallet: '' })
    setShowCreateModal(true)
  }

  const createValid =
    createForm.target &&
    createForm.newOwnerName.trim() &&
    net.isValid(createForm.newOwnerWallet)

  const handleCreate = async () => {
    if (!createValid || !currentOwner) return
    await dispatch(
      createOwnerChange({
        network,
        targetOwner: createForm.target,
        newOwnerName: createForm.newOwnerName.trim(),
        newOwnerWallet: createForm.newOwnerWallet.trim(),
        initiator: currentOwner,
      })
    )
    setShowCreateModal(false)
    setCreateForm({ target: null, newOwnerName: '', newOwnerWallet: '' })
  }

  const handleSign = async (request) => {
    if (!currentOwner) return
    await dispatch(
      signOwnerChange({
        network,
        id: request.id,
        ownerId: currentOwner.id,
        ownerName: currentOwner.name,
      })
    )
  }

  const handleReject = async () => {
    if (!selectedRequest || !currentOwner || !rejectionReason.trim()) return
    await dispatch(
      rejectOwnerChange({
        network,
        id: selectedRequest.id,
        ownerId: currentOwner.id,
        reason: rejectionReason.trim(),
      })
    )
    setShowRejectModal(false)
    setSelectedRequest(null)
    setRejectionReason('')
  }

  const canSign =
    currentOwner &&
    pendingRequest &&
    currentOwner.id !== pendingRequest.targetOwnerId &&
    !hasSigned(pendingRequest, currentOwner.id)
  const canReject = currentOwner && pendingRequest

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Banners */}
      {error && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 flex items-center justify-between">
          <span className="text-red-400 text-sm flex items-center gap-2">
            <AlertCircle className="w-4 h-4" /> {error}
          </span>
          <button onClick={() => dispatch(clearError())} className="text-red-400 hover:text-red-300">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
      {successMessage && (
        <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/30 flex items-center gap-2">
          <CheckCircle className="w-5 h-5 text-green-400" />
          <span className="text-green-400 text-sm">{successMessage}</span>
        </div>
      )}

      {/* Header + network tabs */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary-500 to-purple-500 flex items-center justify-center">
            <UserCog className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-white">Owner Management</h2>
            <p className="text-sm text-gray-400">
              Propose replacing an owner — requires 2-of-3 signatures
            </p>
          </div>
        </div>
        <div className="flex gap-1 p-1 bg-dark-300 rounded-xl w-fit">
          {NETWORKS.map((n) => (
            <button
              key={n.key}
              onClick={() => setNetwork(n.key)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                network === n.key
                  ? 'bg-primary-500 text-white'
                  : 'text-gray-400 hover:text-white hover:bg-dark-200'
              }`}
            >
              {n.label}
            </button>
          ))}
        </div>
      </div>

      {/* Connected owner notice */}
      {!currentOwner && !ownersLoading && (
        <div className="p-4 rounded-xl bg-yellow-500/10 border border-yellow-500/30">
          <div className="flex items-start gap-3">
            <ShieldAlert className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-yellow-400 font-medium">
                Connected wallet is not an owner on {net.label.replace(' Owners', '')}
              </p>
              <p className="text-gray-400 text-sm mt-1">
                Sign in with one of the {net.walletLabel} owner wallets to propose or sign changes on
                this network. You can still view requests below.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Pending Request Banner */}
      {pendingRequest && (
        <div className="rounded-xl bg-dark-300 border border-yellow-500/40 overflow-hidden">
          <div className="p-5 border-b border-yellow-500/20 bg-yellow-500/5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-yellow-500/20 flex items-center justify-center">
                <UserCog className="w-5 h-5 text-yellow-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">Pending Owner Change</h3>
                <p className="text-sm text-gray-400">
                  Initiated by {pendingRequest.initiatorName || 'an owner'} ·{' '}
                  {formatDate(pendingRequest.createdAt)}
                </p>
              </div>
            </div>
            <StatusBadge request={pendingRequest} />
          </div>

          <div className="p-5 space-y-4">
            {/* Replace visual */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <div className="flex-1 p-4 rounded-xl bg-red-500/10 border border-red-500/30">
                <p className="text-xs text-red-400 mb-2 flex items-center gap-1">
                  <XCircle className="w-3.5 h-3.5" /> Removing
                </p>
                <div className="flex items-center gap-3">
                  <Avatar name={pendingRequest.targetOwnerName} size="md" />
                  <div className="min-w-0">
                    <p className="text-white font-medium truncate">{pendingRequest.targetOwnerName}</p>
                    <p className="text-xs text-gray-400 font-mono truncate">
                      {formatAddress(pendingRequest.targetOwnerWallet)}
                    </p>
                  </div>
                </div>
              </div>
              <ArrowRight className="w-6 h-6 text-gray-500 mx-auto rotate-90 sm:rotate-0 flex-shrink-0" />
              <div className="flex-1 p-4 rounded-xl bg-green-500/10 border border-green-500/30">
                <p className="text-xs text-green-400 mb-2 flex items-center gap-1">
                  <UserPlus className="w-3.5 h-3.5" /> Replacing with
                </p>
                <div className="flex items-center gap-3">
                  <Avatar name={pendingRequest.newOwnerName} size="md" />
                  <div className="min-w-0">
                    <p className="text-white font-medium truncate">{pendingRequest.newOwnerName}</p>
                    <p className="text-xs text-gray-400 font-mono truncate">
                      {formatAddress(pendingRequest.newOwnerWallet)}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Signatures */}
            <div className="p-3 rounded-lg bg-dark-400 border border-gray-700">
              <p className="text-xs text-gray-400 mb-2">
                Signatures ({(pendingRequest.signatures || []).length}/
                {pendingRequest.requiredSignatures || 2})
              </p>
              <div className="flex flex-wrap gap-2">
                {(pendingRequest.signatures || []).map((s) => (
                  <span
                    key={s.ownerId}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-green-500/20 text-green-400 border border-green-500/30 text-xs"
                  >
                    <Check className="w-3 h-3" /> {s.ownerName || 'Owner'}
                  </span>
                ))}
                {pendingRequest.targetOwnerId && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-dark-300 text-gray-500 border border-gray-700 text-xs">
                    <Ban className="w-3 h-3" /> {pendingRequest.targetOwnerName} (cannot sign)
                  </span>
                )}
              </div>
            </div>

            {/* Actions */}
            {currentOwner && (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setSelectedRequest(pendingRequest)
                    setShowRejectModal(true)
                  }}
                  disabled={!canReject}
                  className="px-4 py-2 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500/20 transition-colors text-sm font-medium flex items-center gap-2 disabled:opacity-50"
                >
                  <XCircle className="w-4 h-4" />
                  Reject
                </button>
                <button
                  onClick={() => handleSign(pendingRequest)}
                  disabled={!canSign || signing}
                  title={
                    currentOwner.id === pendingRequest.targetOwnerId
                      ? 'You are the owner being removed and cannot sign'
                      : hasSigned(pendingRequest, currentOwner.id)
                        ? 'You have already signed'
                        : undefined
                  }
                  className="px-4 py-2 rounded-lg bg-green-500 hover:bg-green-600 text-white transition-colors text-sm font-medium flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {signing ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
                  Sign
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Owner List */}
      <div className="rounded-xl bg-dark-300 border border-gray-800 overflow-hidden">
        <div className="p-5 border-b border-gray-800 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary-500 to-blue-600 flex items-center justify-center">
            <Users className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">{net.label}</h3>
            <p className="text-sm text-gray-400">Current authorized owners on this network</p>
          </div>
        </div>

        {ownersLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 text-primary-500 animate-spin" />
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 p-5">
            {networkOwners.map((owner) => {
              const isYou = owner.id === currentOwner?.id
              return (
                <div key={owner.id} className="p-4 rounded-xl bg-dark-400 border border-gray-700">
                  <div className="flex items-center gap-3 mb-3">
                    <Avatar name={owner.name} size="lg" />
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-white font-medium truncate">{owner.name}</p>
                        {isYou && (
                          <span className="px-1.5 py-0.5 text-[10px] rounded-full bg-primary-500/20 text-primary-400 border border-primary-500/30">
                            You
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-green-400 flex items-center gap-1">
                        <ShieldCheck className="w-3 h-3" /> Authorized Owner
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 mb-3">
                    <code className="flex-1 text-xs text-gray-300 bg-dark-300 px-2 py-1.5 rounded font-mono truncate">
                      {ownerWallet(owner) || 'No address'}
                    </code>
                    {ownerWallet(owner) && (
                      <button
                        onClick={() => copyToClipboard(ownerWallet(owner), `owner-${owner.id}`)}
                        className="p-1.5 rounded-lg bg-dark-300 hover:bg-dark-200 text-gray-400 hover:text-white transition-colors"
                      >
                        {copiedKey === `owner-${owner.id}` ? (
                          <Check className="w-3.5 h-3.5 text-green-400" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    )}
                  </div>
                  <button
                    onClick={() => handleOpenCreate(owner)}
                    disabled={!currentOwner || isYou || Boolean(pendingRequest)}
                    title={
                      isYou
                        ? 'You cannot remove yourself'
                        : pendingRequest
                          ? 'A change request is already pending'
                          : !currentOwner
                            ? 'Connect an owner wallet to request a change'
                            : undefined
                    }
                    className="w-full px-3 py-2 rounded-lg bg-dark-300 border border-gray-700 text-gray-300 hover:text-white hover:border-primary-500 transition-colors text-sm font-medium flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <UserCog className="w-4 h-4" />
                    Request Change
                  </button>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* History */}
      <div className="rounded-xl bg-dark-300 border border-gray-800 overflow-hidden">
        <div className="p-5 border-b border-gray-800 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
            <History className="w-5 h-5 text-purple-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">Change History</h3>
            <p className="text-sm text-gray-400">Past approved and rejected change requests</p>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 text-primary-500 animate-spin" />
          </div>
        ) : history.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-gray-400">
            <History className="w-12 h-12 mb-3 opacity-50" />
            <p>No past change requests</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-dark-400">
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Removed</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Replacement</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Initiated By</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {history.map((r) => (
                  <tr key={r.id} className="hover:bg-dark-400/50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Avatar name={r.targetOwnerName} size="sm" />
                        <span className="text-white text-sm">{r.targetOwnerName}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Avatar name={r.newOwnerName} size="sm" />
                        <div className="min-w-0">
                          <p className="text-white text-sm truncate">{r.newOwnerName}</p>
                          <p className="text-gray-500 text-xs font-mono">{formatAddress(r.newOwnerWallet)}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-300 text-sm">{r.initiatorName || '-'}</td>
                    <td className="px-4 py-3">
                      <StatusBadge request={r} />
                    </td>
                    <td className="px-4 py-3 text-gray-300 text-sm">{formatDate(r.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create Modal */}
      {showCreateModal && createForm.target && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-xl bg-dark-300 border border-gray-800 shadow-xl">
            <div className="flex items-center justify-between p-5 border-b border-gray-800">
              <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                <UserCog className="w-5 h-5 text-primary-400" />
                Request Owner Change
              </h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-1.5 rounded-lg hover:bg-dark-400 text-gray-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              {/* Target */}
              <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30">
                <p className="text-xs text-red-400 mb-2">Owner to remove</p>
                <div className="flex items-center gap-3">
                  <Avatar name={createForm.target.name} size="md" />
                  <div className="min-w-0">
                    <p className="text-white font-medium">{createForm.target.name}</p>
                    <p className="text-xs text-gray-400 font-mono truncate">
                      {ownerWallet(createForm.target)}
                    </p>
                  </div>
                </div>
              </div>

              {/* New owner name */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">New Owner Name *</label>
                <input
                  type="text"
                  value={createForm.newOwnerName}
                  onChange={(e) => setCreateForm({ ...createForm, newOwnerName: e.target.value })}
                  placeholder="e.g., New Person"
                  className="w-full px-3 py-2 rounded-lg bg-dark-400 border border-gray-700 text-white focus:outline-none focus:border-primary-500"
                />
              </div>

              {/* New owner wallet */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  New Owner {net.key === 'solana' ? 'Solana' : 'XRPL'} Wallet *
                </label>
                <input
                  type="text"
                  value={createForm.newOwnerWallet}
                  onChange={(e) => setCreateForm({ ...createForm, newOwnerWallet: e.target.value })}
                  placeholder={net.placeholder}
                  className="w-full px-3 py-2 rounded-lg bg-dark-400 border border-gray-700 text-white font-mono focus:outline-none focus:border-primary-500"
                />
                {createForm.newOwnerWallet && !net.isValid(createForm.newOwnerWallet) && (
                  <p className="text-red-400 text-xs mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" /> Must be {net.addressHint}
                  </p>
                )}
              </div>

              {/* Notice */}
              <div className="p-3 rounded-lg bg-dark-400 border border-gray-700">
                <div className="flex items-start gap-2">
                  <ShieldCheck className="w-4 h-4 text-primary-400 mt-0.5 flex-shrink-0" />
                  <p className="text-gray-400 text-xs">
                    You ({currentOwner?.name}) sign now as the first of 2 signatures. One more owner
                    (not {createForm.target.name}) must sign to approve. The removed owner can reject.
                  </p>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 px-4 py-2 rounded-lg bg-dark-400 border border-gray-700 text-gray-300 hover:bg-dark-500 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreate}
                  disabled={saving || !createValid}
                  className="flex-1 btn-primary flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserCog className="w-4 h-4" />}
                  Submit & Sign
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {showRejectModal && selectedRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-xl bg-dark-300 border border-gray-800 shadow-xl">
            <div className="flex items-center justify-between p-5 border-b border-gray-800">
              <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                <Ban className="w-5 h-5 text-red-400" />
                Reject Change Request
              </h3>
              <button
                onClick={() => {
                  setShowRejectModal(false)
                  setSelectedRequest(null)
                  setRejectionReason('')
                }}
                className="p-1.5 rounded-lg hover:bg-dark-400 text-gray-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              <div className="p-3 rounded-lg bg-dark-400 border border-gray-700 text-sm text-gray-300">
                Reject replacing <strong className="text-white">{selectedRequest.targetOwnerName}</strong>{' '}
                with <strong className="text-white">{selectedRequest.newOwnerName}</strong>?
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Rejection Reason *</label>
                <textarea
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="Explain why you don't approve this change..."
                  rows={3}
                  className="w-full px-3 py-2 rounded-lg bg-dark-400 border border-gray-700 text-white focus:outline-none focus:border-primary-500 resize-none"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowRejectModal(false)
                    setSelectedRequest(null)
                    setRejectionReason('')
                  }}
                  className="flex-1 px-4 py-2 rounded-lg bg-dark-400 border border-gray-700 text-gray-300 hover:bg-dark-500 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleReject}
                  disabled={!rejectionReason.trim()}
                  className="flex-1 px-4 py-2 rounded-lg bg-red-500 hover:bg-red-600 text-white font-medium flex items-center justify-center gap-2 disabled:opacity-50 transition-colors"
                >
                  <XCircle className="w-4 h-4" />
                  Reject
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default OwnerManagement
