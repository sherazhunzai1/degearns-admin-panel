import { useState, useMemo, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
  ArrowUpRight,
  ArrowDownRight,
  Wallet,
  Shield,
  ShieldCheck,
  ShieldAlert,
  Clock,
  CheckCircle,
  XCircle,
  Loader2,
  Search,
  ChevronLeft,
  ChevronRight,
  X,
  Send,
  Eye,
  FileText,
  Copy,
  Check,
  Ban,
  ExternalLink,
  Users,
  Coins,
  Vault,
  Crown,
  Edit3,
  Plus,
  SplitSquareHorizontal,
  AlertCircle,
} from 'lucide-react'
import {
  fetchOwners,
  fetchSourceWallets,
  fetchWithdrawals,
  saveOwner,
  createWithdrawal,
  signWithdrawal,
  rejectWithdrawal,
  clearError,
  clearSuccessMessage,
} from '../store/slices/withdrawalsSlice'
import { findOwnerByAddress } from '../services/owners'

// Icons for the three revenue source wallets
const SOURCE_ICONS = {
  minting: Coins,
  treasury: Vault,
  subscriptions: Crown,
}

// ============================================
// Helpers
// ============================================

const dropsToXrp = (drops) => {
  if (!drops) return '0.00'
  return (parseFloat(drops) / 1000000).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}

const xrpToDrops = (xrp) => {
  const n = parseFloat(xrp)
  if (isNaN(n)) return '0'
  return Math.round(n * 1000000).toString()
}

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

const formatAddress = (address) => {
  if (!address) return '-'
  return `${address.slice(0, 8)}...${address.slice(-6)}`
}

const isValidXrplAddress = (address) =>
  typeof address === 'string' && /^r[1-9A-HJ-NP-Za-km-z]{24,34}$/.test(address.trim())

const initials = (name) =>
  (name || '?')
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

// ============================================
// Helper Components
// ============================================

const StatusBadge = ({ status }) => {
  const config = {
    pending_signatures: {
      bg: 'bg-yellow-500/20',
      text: 'text-yellow-400',
      border: 'border-yellow-500/30',
      icon: Clock,
      label: 'Awaiting Signatures',
    },
    completed: {
      bg: 'bg-green-500/20',
      text: 'text-green-400',
      border: 'border-green-500/30',
      icon: CheckCircle,
      label: 'Completed',
    },
    rejected: {
      bg: 'bg-red-500/20',
      text: 'text-red-400',
      border: 'border-red-500/30',
      icon: XCircle,
      label: 'Rejected',
    },
  }

  const c = config[status] || config.pending_signatures
  const Icon = c.icon

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs rounded-full font-medium ${c.bg} ${c.text} border ${c.border}`}
    >
      <Icon className="w-3 h-3" />
      {c.label}
    </span>
  )
}

const StatsCard = ({ title, value, subValue, icon: Icon, color, trend, trendUp }) => (
  <div className="p-5 rounded-xl bg-dark-300 border border-gray-800">
    <div className="flex items-center justify-between mb-3">
      <div className={`w-10 h-10 rounded-lg ${color} flex items-center justify-center`}>
        <Icon className="w-5 h-5 text-white" />
      </div>
      {trend && (
        <span
          className={`text-xs font-medium flex items-center gap-1 ${trendUp ? 'text-green-400' : 'text-red-400'}`}
        >
          {trendUp ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
          {trend}
        </span>
      )}
    </div>
    <p className="text-2xl font-bold text-white">{value}</p>
    <p className="text-sm text-gray-400">{title}</p>
    {subValue && <p className="text-xs text-gray-500 mt-1">{subValue}</p>}
  </div>
)

const OwnerAvatar = ({ owner, size = 'md', dim = false }) => {
  const sizeClasses = {
    sm: 'w-6 h-6 text-[10px]',
    md: 'w-8 h-8 text-xs',
    lg: 'w-10 h-10 text-sm',
    xl: 'w-12 h-12 text-base',
  }
  return (
    <div
      className={`${sizeClasses[size]} rounded-full bg-gradient-to-br from-primary-500 to-purple-500 flex items-center justify-center flex-shrink-0 ${dim ? 'opacity-40 grayscale' : ''}`}
    >
      <span className="text-white font-medium">{initials(owner?.name)}</span>
    </div>
  )
}

// Three-owner signature progress
const SignatureProgress = ({ withdrawal, owners }) => {
  const required = withdrawal.requiredSignatures || 3
  const signedIds = (withdrawal.signatures || []).map((s) => s.ownerId)
  const rejected = withdrawal.status === 'rejected'

  return (
    <div className="flex items-center gap-3">
      <div className="flex -space-x-2">
        {owners.map((owner) => {
          const signed = signedIds.includes(owner.id)
          return (
            <div key={owner.id} className="relative" title={`${owner.name}${signed ? ' — signed' : ''}`}>
              <OwnerAvatar owner={owner} size="md" dim={!signed && !rejected} />
              {signed && (
                <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full bg-green-500 border border-dark-300 flex items-center justify-center">
                  <Check className="w-2 h-2 text-white" />
                </span>
              )}
            </div>
          )
        })}
      </div>
      <div className="flex flex-col">
        <span
          className={`text-xs font-medium ${rejected ? 'text-red-400' : signedIds.length >= required ? 'text-green-400' : 'text-yellow-400'}`}
        >
          {rejected ? 'Rejected' : `${signedIds.length} of ${required} signatures`}
        </span>
        <div className="w-28 h-1.5 rounded-full bg-dark-400 mt-1 overflow-hidden">
          <div
            className={`h-full rounded-full transition-all ${rejected ? 'bg-red-500' : 'bg-green-500'}`}
            style={{ width: `${Math.min(100, (signedIds.length / required) * 100)}%` }}
          />
        </div>
      </div>
    </div>
  )
}

// ============================================
// Main Component
// ============================================

const Withdrawals = () => {
  const dispatch = useDispatch()
  const { user } = useSelector((state) => state.auth)
  const {
    owners,
    sourceWallets,
    withdrawals,
    requiredSignatures,
    loading,
    saving,
    signing,
    error,
    successMessage,
  } = useSelector((state) => state.withdrawals)

  // The acting owner is the wallet currently connected via Xaman. Only this
  // owner can initiate, sign or reject — and only for themselves.
  const currentOwner =
    findOwnerByAddress(user?.address, owners) ||
    owners.find((o) => o.id === user?.ownerId) ||
    null

  // Modal states
  const [showInitiateModal, setShowInitiateModal] = useState(false)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [showSignModal, setShowSignModal] = useState(false)
  const [showRejectModal, setShowRejectModal] = useState(false)
  const [showOwnerModal, setShowOwnerModal] = useState(false)
  const [selectedWithdrawal, setSelectedWithdrawal] = useState(null)
  const [editingOwner, setEditingOwner] = useState(null)

  // Form states
  const [initiateForm, setInitiateForm] = useState({ amount: '', reason: '' })
  const [ownerForm, setOwnerForm] = useState({ id: null, name: '', walletAddress: '' })
  const [rejectionReason, setRejectionReason] = useState('')

  // Filters
  const [statusFilter, setStatusFilter] = useState('')
  const [searchInput, setSearchInput] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [copiedKey, setCopiedKey] = useState(null)

  // Load data
  useEffect(() => {
    dispatch(fetchOwners())
    dispatch(fetchSourceWallets())
    dispatch(fetchWithdrawals())
  }, [dispatch])

  // Auto-dismiss success messages
  useEffect(() => {
    if (successMessage) {
      const t = setTimeout(() => dispatch(clearSuccessMessage()), 3500)
      return () => clearTimeout(t)
    }
  }, [successMessage, dispatch])

  // ---- Derived data ----
  const ownerById = (id) => owners.find((o) => o.id === id)

  const combinedBalance = useMemo(
    () => sourceWallets.reduce((sum, w) => sum + parseFloat(w.balanceDrops || 0), 0),
    [sourceWallets]
  )

  const totalWithdrawn = withdrawals
    .filter((w) => w.status === 'completed')
    .reduce((sum, w) => sum + parseFloat(w.totalAmount || 0), 0)

  const pendingCount = withdrawals.filter((w) => w.status === 'pending_signatures').length
  const completedCount = withdrawals.filter((w) => w.status === 'completed').length
  const rejectedCount = withdrawals.filter((w) => w.status === 'rejected').length

  const hasSigned = (wd, ownerId) => (wd.signatures || []).some((s) => s.ownerId === ownerId)

  const myPendingSignatures = withdrawals.filter(
    (w) => w.status === 'pending_signatures' && currentOwner && !hasSigned(w, currentOwner.id)
  )

  const ownersConfigured = owners.length >= 3 && owners.every((o) => isValidXrplAddress(o.walletAddress))
  const sourcesConfigured = sourceWallets.length > 0 && sourceWallets.every((w) => w.configured)

  // Filtered withdrawals
  const filteredWithdrawals = useMemo(() => {
    let result = [...withdrawals]
    if (statusFilter) result = result.filter((w) => w.status === statusFilter)
    if (searchInput) {
      const search = searchInput.toLowerCase()
      result = result.filter((w) => {
        const initiator = ownerById(w.initiatedBy)
        return (
          w.reason?.toLowerCase().includes(search) ||
          initiator?.name.toLowerCase().includes(search) ||
          w.id?.toLowerCase().includes(search)
        )
      })
    }
    return result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [withdrawals, statusFilter, searchInput, owners])

  // Pagination
  const itemsPerPage = 10
  const totalPages = Math.ceil(filteredWithdrawals.length / itemsPerPage)
  const paginatedWithdrawals = filteredWithdrawals.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  const copyToClipboard = (text, key) => {
    navigator.clipboard.writeText(text)
    setCopiedKey(key)
    setTimeout(() => setCopiedKey(null), 2000)
  }

  // Equal-split preview for the initiate form
  const perOwnerXrp = useMemo(() => {
    const amount = parseFloat(initiateForm.amount)
    if (isNaN(amount) || amount <= 0 || owners.length === 0) return 0
    return amount / owners.length
  }, [initiateForm.amount, owners.length])

  const perSourceXrp = useMemo(() => {
    const amount = parseFloat(initiateForm.amount)
    if (isNaN(amount) || amount <= 0 || sourceWallets.length === 0) return 0
    return amount / sourceWallets.length
  }, [initiateForm.amount, sourceWallets.length])

  const amountExceedsBalance =
    parseFloat(initiateForm.amount) > 0 &&
    combinedBalance > 0 &&
    parseFloat(xrpToDrops(initiateForm.amount)) > combinedBalance

  // ---- Handlers ----
  const handleInitiateSubmit = async (e) => {
    e.preventDefault()
    if (!currentOwner || !initiateForm.amount || !initiateForm.reason) return
    await dispatch(
      createWithdrawal({
        totalAmount: xrpToDrops(initiateForm.amount),
        reason: initiateForm.reason,
        initiatedBy: currentOwner.id,
      })
    )
    setShowInitiateModal(false)
    setInitiateForm({ amount: '', reason: '' })
  }

  const handleSign = async () => {
    if (!selectedWithdrawal || !currentOwner) return
    await dispatch(signWithdrawal({ withdrawalId: selectedWithdrawal.id, ownerId: currentOwner.id }))
    setShowSignModal(false)
    setSelectedWithdrawal(null)
  }

  const handleReject = async () => {
    if (!selectedWithdrawal || !currentOwner || !rejectionReason) return
    await dispatch(
      rejectWithdrawal({
        withdrawalId: selectedWithdrawal.id,
        ownerId: currentOwner.id,
        reason: rejectionReason,
      })
    )
    setShowRejectModal(false)
    setSelectedWithdrawal(null)
    setRejectionReason('')
  }

  const handleOpenOwnerModal = (owner = null, slotIndex = null) => {
    if (owner) {
      setEditingOwner(owner)
      setOwnerForm({ id: owner.id, name: owner.name, walletAddress: owner.walletAddress })
    } else {
      setEditingOwner(null)
      setOwnerForm({ id: null, name: `Owner ${slotIndex != null ? slotIndex + 1 : owners.length + 1}`, walletAddress: '' })
    }
    setShowOwnerModal(true)
  }

  const handleSaveOwner = async () => {
    if (!ownerForm.name || !isValidXrplAddress(ownerForm.walletAddress)) return
    await dispatch(saveOwner(ownerForm))
    setShowOwnerModal(false)
    setEditingOwner(null)
    setOwnerForm({ id: null, name: '', walletAddress: '' })
  }

  const ownerSlots = Math.max(3, owners.length)

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Error / Success banners */}
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

      {/* Connected owner banner */}
      {currentOwner ? (
        <div className="p-4 rounded-xl bg-dark-300 border border-gray-800">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex items-center gap-3">
              <OwnerAvatar owner={currentOwner} size="lg" />
              <div>
                <p className="text-sm text-gray-400">Connected wallet · authorized owner</p>
                <p className="text-white font-medium">{currentOwner.name}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <code className="text-xs text-gray-300 bg-dark-400 px-2 py-1.5 rounded font-mono">
                {formatAddress(currentOwner.walletAddress)}
              </code>
              <span className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-green-500/20 text-green-400 border border-green-500/30 text-xs">
                <ShieldCheck className="w-3.5 h-3.5" /> Signer
              </span>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-4 rounded-xl bg-yellow-500/10 border border-yellow-500/30">
          <div className="flex items-start gap-3">
            <ShieldAlert className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-yellow-400 font-medium">Connected wallet is not a current owner</p>
              <p className="text-gray-400 text-sm mt-1">
                Your wallet ({formatAddress(user?.address)}) is not in the current owner list, so you
                cannot initiate or sign withdrawals. Sign in with one of the three owner wallets.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Stats Overview */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Total Withdrawn"
          value={`${dropsToXrp(totalWithdrawn.toString())} XRP`}
          icon={ArrowUpRight}
          color="bg-gradient-to-br from-primary-500 to-primary-600"
          subValue={`Available: ${dropsToXrp(combinedBalance.toString())} XRP`}
        />
        <StatsCard
          title="Awaiting Signatures"
          value={pendingCount}
          icon={Clock}
          color="bg-gradient-to-br from-yellow-500 to-yellow-600"
          subValue={
            myPendingSignatures.length > 0
              ? `${myPendingSignatures.length} need your signature`
              : 'No action needed'
          }
        />
        <StatsCard
          title="Completed"
          value={completedCount}
          icon={CheckCircle}
          color="bg-gradient-to-br from-green-500 to-green-600"
        />
        <StatsCard
          title="Rejected"
          value={rejectedCount}
          icon={XCircle}
          color="bg-gradient-to-br from-red-500 to-red-600"
        />
      </div>

      {/* Revenue Source Wallets */}
      <div className="rounded-xl bg-dark-300 border border-gray-800 overflow-hidden">
        <div className="p-5 border-b border-gray-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary-500 to-blue-600 flex items-center justify-center">
              <Wallet className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">Revenue Source Wallets</h3>
              <p className="text-sm text-gray-400">
                Funds are pulled equally from these three platform wallets
              </p>
            </div>
          </div>
          <div className="text-right hidden sm:block">
            <p className="text-xs text-gray-400">Combined Available</p>
            <p className="text-xl font-bold text-white">{dropsToXrp(combinedBalance.toString())} XRP</p>
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 p-5">
          {sourceWallets.map((wallet) => {
            const Icon = SOURCE_ICONS[wallet.type] || Wallet
            return (
              <div key={wallet.type} className="p-4 rounded-xl bg-dark-400 border border-gray-700">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-9 h-9 rounded-lg bg-dark-300 flex items-center justify-center text-primary-400">
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-white font-medium truncate">{wallet.label}</p>
                    <p className="text-xs text-gray-500 truncate">{wallet.description}</p>
                  </div>
                </div>
                {wallet.configured && wallet.walletAddress ? (
                  <>
                    <div className="flex items-center gap-2 mb-2">
                      <code className="flex-1 text-xs text-gray-300 bg-dark-300 px-2 py-1.5 rounded font-mono truncate">
                        {formatAddress(wallet.walletAddress)}
                      </code>
                      <button
                        onClick={() => copyToClipboard(wallet.walletAddress, `src-${wallet.type}`)}
                        className="p-1.5 rounded-lg bg-dark-300 hover:bg-dark-200 text-gray-400 hover:text-white transition-colors"
                      >
                        {copiedKey === `src-${wallet.type}` ? (
                          <Check className="w-3.5 h-3.5 text-green-400" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                    <p className="text-lg font-bold text-white">
                      {dropsToXrp(wallet.balanceDrops)}{' '}
                      <span className="text-xs text-gray-400 font-normal">XRP</span>
                    </p>
                  </>
                ) : (
                  <div className="flex items-center gap-2 text-yellow-400 text-xs">
                    <AlertCircle className="w-4 h-4" />
                    Not configured — set this wallet in Settings → Wallets
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Owners Configuration */}
      <div className="rounded-xl bg-dark-300 border border-gray-800 overflow-hidden">
        <div className="p-5 border-b border-gray-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary-500 to-purple-500 flex items-center justify-center">
              <Users className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">Authorized Owners</h3>
              <p className="text-sm text-gray-400">
                Three owners must sign every withdrawal. Wallet addresses are stored in the database.
              </p>
            </div>
          </div>
          {!ownersConfigured && (
            <span className="hidden sm:flex items-center gap-1.5 text-xs text-yellow-400">
              <AlertCircle className="w-4 h-4" /> Configure 3 owners
            </span>
          )}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 p-5">
          {Array.from({ length: ownerSlots }).map((_, index) => {
            const owner = owners[index]
            if (!owner) {
              return (
                <button
                  key={`empty-${index}`}
                  onClick={() => handleOpenOwnerModal(null, index)}
                  className="p-4 rounded-xl bg-dark-400 border border-dashed border-gray-600 hover:border-primary-500 transition-colors flex flex-col items-center justify-center gap-2 text-gray-400 hover:text-white min-h-[120px]"
                >
                  <Plus className="w-6 h-6" />
                  <span className="text-sm">Add Owner {index + 1}</span>
                </button>
              )
            }
            const valid = isValidXrplAddress(owner.walletAddress)
            return (
              <div
                key={owner.id}
                className={`p-4 rounded-xl bg-dark-400 border ${
                  owner.id === currentOwner?.id ? 'border-primary-500/50' : 'border-gray-700'
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <OwnerAvatar owner={owner} size="lg" />
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-white font-medium">{owner.name}</p>
                        {owner.id === currentOwner?.id && (
                          <span className="px-1.5 py-0.5 text-[10px] rounded-full bg-primary-500/20 text-primary-400 border border-primary-500/30">
                            You
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-gray-500">Owner {index + 1}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => handleOpenOwnerModal(owner)}
                    className="p-1.5 rounded-lg hover:bg-dark-300 text-gray-400 hover:text-white transition-colors"
                    title="Edit owner"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                </div>
                <div className="flex items-center gap-2 mb-2">
                  <code className="flex-1 text-xs text-gray-300 bg-dark-300 px-2 py-1.5 rounded font-mono truncate">
                    {owner.walletAddress || 'No address set'}
                  </code>
                  {owner.walletAddress && (
                    <button
                      onClick={() => copyToClipboard(owner.walletAddress, `owner-${owner.id}`)}
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
                <div className="flex items-center gap-2">
                  {valid ? (
                    <>
                      <ShieldCheck className="w-4 h-4 text-green-400" />
                      <span className="text-sm text-green-400">Authorized Signer</span>
                    </>
                  ) : (
                    <>
                      <ShieldAlert className="w-4 h-4 text-yellow-400" />
                      <span className="text-sm text-yellow-400">Invalid address</span>
                    </>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Pending Signatures Section */}
      {myPendingSignatures.length > 0 && (
        <div className="rounded-xl bg-dark-300 border border-yellow-500/30 overflow-hidden">
          <div className="p-5 border-b border-yellow-500/20 bg-yellow-500/5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-yellow-500/20 flex items-center justify-center">
                <ShieldAlert className="w-5 h-5 text-yellow-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">Awaiting Your Signature</h3>
                <p className="text-sm text-gray-400">
                  {myPendingSignatures.length} withdrawal{myPendingSignatures.length > 1 ? 's' : ''} need
                  {myPendingSignatures.length === 1 ? 's' : ''} {currentOwner?.name}'s signature
                </p>
              </div>
            </div>
          </div>
          <div className="divide-y divide-gray-800">
            {myPendingSignatures.map((wd) => {
              const initiator = ownerById(wd.initiatedBy)
              return (
                <div key={wd.id} className="p-5 hover:bg-dark-400/30 transition-colors">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div className="flex items-start gap-4 flex-1">
                      <OwnerAvatar owner={initiator} size="lg" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="text-white font-medium">{initiator?.name}</p>
                          <span className="text-gray-500 text-sm">requested a withdrawal</span>
                        </div>
                        <p className="text-2xl font-bold text-white mb-1">
                          {dropsToXrp(wd.totalAmount)}{' '}
                          <span className="text-sm text-gray-400 font-normal">XRP total</span>
                        </p>
                        <p className="text-sm text-primary-300 mb-2 flex items-center gap-1.5">
                          <SplitSquareHorizontal className="w-4 h-4" />
                          {dropsToXrp(wd.perOwnerAmount)} XRP to each of the {owners.length} owners
                        </p>
                        <p className="text-sm text-gray-400 mb-2">{wd.reason}</p>
                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {formatDate(wd.createdAt)}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 lg:flex-shrink-0">
                      <button
                        onClick={() => {
                          setSelectedWithdrawal(wd)
                          setShowRejectModal(true)
                        }}
                        className="px-4 py-2 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500/20 transition-colors text-sm font-medium flex items-center gap-2"
                      >
                        <XCircle className="w-4 h-4" />
                        Reject
                      </button>
                      <button
                        onClick={() => {
                          setSelectedWithdrawal(wd)
                          setShowSignModal(true)
                        }}
                        className="px-4 py-2 rounded-lg bg-green-500 hover:bg-green-600 text-white transition-colors text-sm font-medium flex items-center gap-2"
                      >
                        <ShieldCheck className="w-4 h-4" />
                        Sign
                      </button>
                    </div>
                  </div>
                  <div className="mt-4 pt-4 border-t border-gray-800">
                    <SignatureProgress withdrawal={wd} owners={owners} />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Withdrawal History */}
      <div className="rounded-xl bg-dark-300 border border-gray-800 overflow-hidden">
        <div className="p-5 border-b border-gray-800">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <h3 className="text-lg font-semibold text-white">Withdrawal History</h3>
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by reason, owner, id..."
                  value={searchInput}
                  onChange={(e) => {
                    setSearchInput(e.target.value)
                    setCurrentPage(1)
                  }}
                  className="w-full sm:w-72 pl-9 pr-4 py-2 rounded-lg bg-dark-400 border border-gray-700 text-white text-sm focus:outline-none focus:border-primary-500"
                />
              </div>
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value)
                  setCurrentPage(1)
                }}
                className="px-3 py-2 rounded-lg bg-dark-400 border border-gray-700 text-white text-sm focus:outline-none focus:border-primary-500"
              >
                <option value="">All Status</option>
                <option value="pending_signatures">Awaiting Signatures</option>
                <option value="completed">Completed</option>
                <option value="rejected">Rejected</option>
              </select>
              <button
                onClick={() => setShowInitiateModal(true)}
                disabled={!ownersConfigured || !currentOwner}
                title={
                  !currentOwner
                    ? 'Connect an owner wallet to initiate'
                    : !ownersConfigured
                      ? 'Configure 3 owners first'
                      : undefined
                }
                className="btn-primary flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send className="w-4 h-4" />
                Initiate Withdrawal
              </button>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 text-primary-500 animate-spin" />
            </div>
          ) : paginatedWithdrawals.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-gray-400">
              <FileText className="w-12 h-12 mb-3 opacity-50" />
              <p>No withdrawals found</p>
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="bg-dark-400">
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Initiated By</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Total</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Per Owner</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Signatures</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Date</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-400 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {paginatedWithdrawals.map((wd) => {
                  const initiator = ownerById(wd.initiatedBy)
                  const sigCount = (wd.signatures || []).length
                  return (
                    <tr key={wd.id} className="hover:bg-dark-400/50 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <OwnerAvatar owner={initiator} size="sm" />
                          <span className="text-white text-sm">{initiator?.name || 'Unknown'}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-white text-sm font-medium">{dropsToXrp(wd.totalAmount)} XRP</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-primary-300 text-sm">{dropsToXrp(wd.perOwnerAmount)} XRP</span>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`text-sm font-medium ${
                            wd.status === 'rejected'
                              ? 'text-red-400'
                              : sigCount >= (wd.requiredSignatures || 3)
                                ? 'text-green-400'
                                : 'text-yellow-400'
                          }`}
                        >
                          {sigCount}/{wd.requiredSignatures || 3}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge status={wd.status} />
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-300">{formatDate(wd.createdAt)}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1">
                          {wd.status === 'pending_signatures' &&
                            currentOwner &&
                            !hasSigned(wd, currentOwner.id) && (
                              <button
                                onClick={() => {
                                  setSelectedWithdrawal(wd)
                                  setShowSignModal(true)
                                }}
                                className="p-1.5 rounded-lg hover:bg-green-500/20 text-gray-400 hover:text-green-400 transition-colors"
                                title="Sign"
                              >
                                <ShieldCheck className="w-4 h-4" />
                              </button>
                            )}
                          <button
                            onClick={() => {
                              setSelectedWithdrawal(wd)
                              setShowDetailModal(true)
                            }}
                            className="p-1.5 rounded-lg hover:bg-dark-400 text-gray-400 hover:text-white transition-colors"
                            title="View Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}
        </div>

        {totalPages > 1 && (
          <div className="p-4 border-t border-gray-800 flex items-center justify-between">
            <p className="text-sm text-gray-400">
              Showing {(currentPage - 1) * itemsPerPage + 1} -{' '}
              {Math.min(currentPage * itemsPerPage, filteredWithdrawals.length)} of{' '}
              {filteredWithdrawals.length}
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(currentPage - 1)}
                disabled={currentPage <= 1}
                className="p-2 rounded-lg hover:bg-dark-400 text-gray-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <span className="text-white text-sm">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage(currentPage + 1)}
                disabled={currentPage >= totalPages}
                className="p-2 rounded-lg hover:bg-dark-400 text-gray-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ============================================ */}
      {/* Initiate Withdrawal Modal */}
      {/* ============================================ */}
      {showInitiateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-xl bg-dark-300 border border-gray-800 shadow-xl">
            <div className="flex items-center justify-between p-5 border-b border-gray-800 sticky top-0 bg-dark-300">
              <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                <Send className="w-5 h-5 text-primary-400" />
                Initiate Withdrawal
              </h3>
              <button
                onClick={() => setShowInitiateModal(false)}
                className="p-1.5 rounded-lg hover:bg-dark-400 text-gray-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleInitiateSubmit} className="p-5 space-y-4">
              {/* Source pool info */}
              <div className="p-3 rounded-lg bg-dark-400 border border-gray-700">
                <p className="text-xs text-gray-400 mb-2">Funded equally from</p>
                <div className="space-y-1.5">
                  {sourceWallets.map((w) => {
                    const Icon = SOURCE_ICONS[w.type] || Wallet
                    return (
                      <div key={w.type} className="flex items-center justify-between text-sm">
                        <span className="flex items-center gap-2 text-gray-300">
                          <Icon className="w-4 h-4 text-primary-400" />
                          {w.label}
                        </span>
                        <span className="text-gray-500">{dropsToXrp(w.balanceDrops)} XRP</span>
                      </div>
                    )
                  })}
                </div>
                <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-700 text-sm">
                  <span className="text-gray-400">Combined available</span>
                  <span className="text-white font-semibold">
                    {dropsToXrp(combinedBalance.toString())} XRP
                  </span>
                </div>
              </div>

              {/* Amount */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Total Amount (XRP) *</label>
                <input
                  type="number"
                  value={initiateForm.amount}
                  onChange={(e) => setInitiateForm({ ...initiateForm, amount: e.target.value })}
                  placeholder="Enter total amount to withdraw"
                  required
                  min="0.000001"
                  step="any"
                  className="w-full px-3 py-2 rounded-lg bg-dark-400 border border-gray-700 text-white focus:outline-none focus:border-primary-500"
                />
                {amountExceedsBalance && (
                  <p className="text-red-400 text-xs mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" /> Amount exceeds combined available balance
                  </p>
                )}
              </div>

              {/* Equal split preview */}
              {perOwnerXrp > 0 && (
                <div className="p-3 rounded-lg bg-primary-500/10 border border-primary-500/30">
                  <div className="flex items-center gap-2 mb-3">
                    <SplitSquareHorizontal className="w-4 h-4 text-primary-400" />
                    <p className="text-primary-400 text-sm font-medium">Equal Split Preview</p>
                  </div>
                  <div className="space-y-2">
                    {owners.map((owner) => (
                      <div key={owner.id} className="flex items-center justify-between text-sm">
                        <span className="flex items-center gap-2 text-gray-300">
                          <OwnerAvatar owner={owner} size="sm" />
                          {owner.name}
                        </span>
                        <span className="text-white font-medium">
                          {perOwnerXrp.toLocaleString('en-US', {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}{' '}
                          XRP
                        </span>
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-gray-500 mt-3">
                    Each source wallet contributes ~
                    {perSourceXrp.toLocaleString('en-US', {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}{' '}
                    XRP
                  </p>
                </div>
              )}

              {/* Reason */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Reason *</label>
                <textarea
                  value={initiateForm.reason}
                  onChange={(e) => setInitiateForm({ ...initiateForm, reason: e.target.value })}
                  placeholder="Describe the purpose of this withdrawal..."
                  rows={3}
                  required
                  className="w-full px-3 py-2 rounded-lg bg-dark-400 border border-gray-700 text-white focus:outline-none focus:border-primary-500 resize-none"
                />
              </div>

              {/* Multi-sig notice */}
              <div className="p-3 rounded-lg bg-dark-400 border border-gray-700">
                <div className="flex items-start gap-2">
                  <Shield className="w-4 h-4 text-primary-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-primary-400 text-sm font-medium">
                      {requiredSignatures}-of-{requiredSignatures} Multi-Signature Required
                    </p>
                    <p className="text-gray-400 text-xs mt-1">
                      You ({currentOwner?.name}) sign now as the first of {requiredSignatures}{' '}
                      signatures. The other {owners.length - 1} owners must also sign before the funds
                      are released.
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowInitiateModal(false)}
                  className="flex-1 px-4 py-2 rounded-lg bg-dark-400 border border-gray-700 text-gray-300 hover:bg-dark-500 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={
                    saving || !initiateForm.amount || !initiateForm.reason || amountExceedsBalance
                  }
                  className="flex-1 btn-primary flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {saving ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Signing...
                    </>
                  ) : (
                    <>
                      <Shield className="w-4 h-4" />
                      Sign & Submit
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================ */}
      {/* Sign Modal */}
      {/* ============================================ */}
      {showSignModal && selectedWithdrawal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-xl bg-dark-300 border border-gray-800 shadow-xl">
            <div className="flex items-center justify-between p-5 border-b border-gray-800">
              <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-green-400" />
                Sign Withdrawal
              </h3>
              <button
                onClick={() => {
                  setShowSignModal(false)
                  setSelectedWithdrawal(null)
                }}
                className="p-1.5 rounded-lg hover:bg-dark-400 text-gray-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              <div className="p-4 rounded-lg bg-dark-400 border border-gray-700">
                <div className="flex items-center gap-3 mb-3">
                  <OwnerAvatar owner={ownerById(selectedWithdrawal.initiatedBy)} size="lg" />
                  <div>
                    <p className="text-white font-medium">
                      {ownerById(selectedWithdrawal.initiatedBy)?.name}
                    </p>
                    <p className="text-xs text-gray-400">
                      Initiated {formatDate(selectedWithdrawal.createdAt)}
                    </p>
                  </div>
                </div>
                <div className="space-y-2 mt-3">
                  <div className="flex justify-between">
                    <span className="text-gray-400 text-sm">Total Amount</span>
                    <span className="text-white font-semibold">
                      {dropsToXrp(selectedWithdrawal.totalAmount)} XRP
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400 text-sm">To each owner</span>
                    <span className="text-primary-300 font-medium">
                      {dropsToXrp(selectedWithdrawal.perOwnerAmount)} XRP
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400 text-sm">Reason</span>
                    <span className="text-gray-300 text-sm text-right max-w-[220px]">
                      {selectedWithdrawal.reason}
                    </span>
                  </div>
                </div>
              </div>

              <div className="p-3 rounded-lg bg-dark-400 border border-gray-700">
                <SignatureProgress withdrawal={selectedWithdrawal} owners={owners} />
              </div>

              <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/30">
                <div className="flex items-start gap-2">
                  <ShieldCheck className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                  <p className="text-green-400 text-sm">
                    Signing as <strong>{currentOwner?.name}</strong> with your connected Xaman wallet.{' '}
                    {(selectedWithdrawal.signatures || []).length + 1 >=
                    (selectedWithdrawal.requiredSignatures || 3)
                      ? `You are the final signer — this releases ${dropsToXrp(selectedWithdrawal.perOwnerAmount)} XRP to each owner.`
                      : `${(selectedWithdrawal.requiredSignatures || 3) - (selectedWithdrawal.signatures || []).length - 1} more signature(s) required after yours.`}
                  </p>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowSignModal(false)
                    setSelectedWithdrawal(null)
                  }}
                  className="flex-1 px-4 py-2 rounded-lg bg-dark-400 border border-gray-700 text-gray-300 hover:bg-dark-500 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSign}
                  disabled={signing}
                  className="flex-1 px-4 py-2 rounded-lg bg-green-500 hover:bg-green-600 text-white font-medium flex items-center justify-center gap-2 disabled:opacity-50 transition-colors"
                >
                  {signing ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Signing...
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="w-4 h-4" />
                      Approve & Sign
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================ */}
      {/* Reject Modal */}
      {/* ============================================ */}
      {showRejectModal && selectedWithdrawal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-xl bg-dark-300 border border-gray-800 shadow-xl">
            <div className="flex items-center justify-between p-5 border-b border-gray-800">
              <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                <Ban className="w-5 h-5 text-red-400" />
                Reject Withdrawal
              </h3>
              <button
                onClick={() => {
                  setShowRejectModal(false)
                  setSelectedWithdrawal(null)
                  setRejectionReason('')
                }}
                className="p-1.5 rounded-lg hover:bg-dark-400 text-gray-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              <div className="p-3 rounded-lg bg-dark-400 border border-gray-700">
                <div className="flex items-center gap-3 mb-2">
                  <OwnerAvatar owner={ownerById(selectedWithdrawal.initiatedBy)} />
                  <div>
                    <p className="text-white font-medium">
                      {ownerById(selectedWithdrawal.initiatedBy)?.name}
                    </p>
                    <p className="text-gray-500 text-sm">
                      {dropsToXrp(selectedWithdrawal.totalAmount)} XRP total
                    </p>
                  </div>
                </div>
                <p className="text-sm text-gray-400">{selectedWithdrawal.reason}</p>
              </div>

              <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30">
                <p className="text-red-400 text-sm">
                  Rejecting cancels this withdrawal request for all owners. This cannot be undone.
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Rejection Reason *</label>
                <textarea
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="Explain why this withdrawal is being rejected..."
                  rows={3}
                  required
                  className="w-full px-3 py-2 rounded-lg bg-dark-400 border border-gray-700 text-white focus:outline-none focus:border-primary-500 resize-none"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowRejectModal(false)
                    setSelectedWithdrawal(null)
                    setRejectionReason('')
                  }}
                  className="flex-1 px-4 py-2 rounded-lg bg-dark-400 border border-gray-700 text-gray-300 hover:bg-dark-500 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleReject}
                  disabled={!rejectionReason}
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

      {/* ============================================ */}
      {/* Owner Edit Modal */}
      {/* ============================================ */}
      {showOwnerModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-xl bg-dark-300 border border-gray-800 shadow-xl">
            <div className="flex items-center justify-between p-5 border-b border-gray-800">
              <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                <Users className="w-5 h-5 text-primary-400" />
                {editingOwner ? 'Edit Owner' : 'Add Owner'}
              </h3>
              <button
                onClick={() => setShowOwnerModal(false)}
                className="p-1.5 rounded-lg hover:bg-dark-400 text-gray-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Owner Name *</label>
                <input
                  type="text"
                  value={ownerForm.name}
                  onChange={(e) => setOwnerForm({ ...ownerForm, name: e.target.value })}
                  placeholder="e.g., Constantinos"
                  className="w-full px-3 py-2 rounded-lg bg-dark-400 border border-gray-700 text-white focus:outline-none focus:border-primary-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Wallet Address *</label>
                <input
                  type="text"
                  value={ownerForm.walletAddress}
                  onChange={(e) => setOwnerForm({ ...ownerForm, walletAddress: e.target.value })}
                  placeholder="rXXX..."
                  className="w-full px-3 py-2 rounded-lg bg-dark-400 border border-gray-700 text-white font-mono focus:outline-none focus:border-primary-500"
                />
                {ownerForm.walletAddress && !isValidXrplAddress(ownerForm.walletAddress) && (
                  <p className="text-red-400 text-xs mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" /> Must be a valid XRPL r-address
                  </p>
                )}
                <p className="text-gray-500 text-xs mt-1">
                  This address is stored in the database and receives an equal share of every
                  withdrawal.
                </p>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowOwnerModal(false)}
                  className="flex-1 px-4 py-2 rounded-lg bg-dark-400 border border-gray-700 text-gray-300 hover:bg-dark-500 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveOwner}
                  disabled={saving || !ownerForm.name || !isValidXrplAddress(ownerForm.walletAddress)}
                  className="flex-1 btn-primary flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save Owner'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================ */}
      {/* Detail Modal */}
      {/* ============================================ */}
      {showDetailModal && selectedWithdrawal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-2xl max-h-[80vh] rounded-xl bg-dark-300 border border-gray-800 shadow-xl flex flex-col">
            <div className="flex items-center justify-between p-5 border-b border-gray-800">
              <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                <FileText className="w-5 h-5 text-primary-400" />
                Withdrawal Details
              </h3>
              <button
                onClick={() => {
                  setShowDetailModal(false)
                  setSelectedWithdrawal(null)
                }}
                className="p-1.5 rounded-lg hover:bg-dark-400 text-gray-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 overflow-y-auto flex-1 space-y-5">
              <div className="flex items-center justify-between">
                <StatusBadge status={selectedWithdrawal.status} />
                <div className="text-right">
                  <p className="text-2xl font-bold text-white">
                    {dropsToXrp(selectedWithdrawal.totalAmount)}{' '}
                    <span className="text-sm text-gray-400 font-normal">XRP total</span>
                  </p>
                  <p className="text-sm text-primary-300">
                    {dropsToXrp(selectedWithdrawal.perOwnerAmount)} XRP per owner
                  </p>
                </div>
              </div>

              {/* Signature progress */}
              <div className="p-4 rounded-lg bg-dark-400 border border-gray-700">
                <h4 className="text-sm font-medium text-gray-300 mb-3">Signatures</h4>
                <SignatureProgress withdrawal={selectedWithdrawal} owners={owners} />
                <div className="mt-3 space-y-1.5">
                  {owners.map((owner) => {
                    const sig = (selectedWithdrawal.signatures || []).find((s) => s.ownerId === owner.id)
                    return (
                      <div key={owner.id} className="flex items-center justify-between text-sm">
                        <span className="flex items-center gap-2 text-gray-300">
                          <OwnerAvatar owner={owner} size="sm" dim={!sig} />
                          {owner.name}
                        </span>
                        {sig ? (
                          <span className="text-green-400 text-xs flex items-center gap-1">
                            <Check className="w-3 h-3" /> Signed {formatDate(sig.signedAt)}
                          </span>
                        ) : (
                          <span className="text-gray-500 text-xs">
                            {selectedWithdrawal.status === 'rejected' ? '—' : 'Pending'}
                          </span>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Split breakdown */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-3 rounded-lg bg-dark-400 border border-gray-700">
                  <p className="text-xs text-gray-500 mb-2">Destination Split (equal)</p>
                  <div className="space-y-1.5">
                    {(selectedWithdrawal.splits || []).map((s) => (
                      <div key={s.ownerId} className="flex items-center justify-between text-sm">
                        <span className="text-gray-300">{s.name || ownerById(s.ownerId)?.name}</span>
                        <span className="text-white">{dropsToXrp(s.amount)} XRP</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="p-3 rounded-lg bg-dark-400 border border-gray-700">
                  <p className="text-xs text-gray-500 mb-2">Source Breakdown (equal)</p>
                  <div className="space-y-1.5">
                    {(selectedWithdrawal.sourceBreakdown || []).map((s) => (
                      <div key={s.type} className="flex items-center justify-between text-sm">
                        <span className="text-gray-300">{s.label}</span>
                        <span className="text-white">{dropsToXrp(s.amount)} XRP</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Reason */}
              <div className="p-3 rounded-lg bg-dark-400 border border-gray-700">
                <p className="text-xs text-gray-500 mb-1">Reason</p>
                <p className="text-white text-sm">{selectedWithdrawal.reason}</p>
              </div>

              {/* Rejection reason */}
              {selectedWithdrawal.rejectionReason && (
                <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30">
                  <p className="text-xs text-red-400 mb-1">
                    Rejected by {ownerById(selectedWithdrawal.rejectedBy)?.name || 'an owner'}
                  </p>
                  <p className="text-red-300 text-sm">{selectedWithdrawal.rejectionReason}</p>
                </div>
              )}

              {/* Transaction hashes */}
              {selectedWithdrawal.transactionHashes && (
                <div className="p-3 rounded-lg bg-dark-400 border border-gray-700">
                  <p className="text-xs text-gray-500 mb-2">Transaction Hashes</p>
                  <div className="space-y-2">
                    {selectedWithdrawal.transactionHashes.map((tx) => (
                      <div key={tx.ownerId} className="flex items-center gap-2">
                        <span className="text-xs text-gray-400 w-24 flex-shrink-0">
                          {ownerById(tx.ownerId)?.name}
                        </span>
                        <code className="text-white text-xs font-mono truncate flex-1">{tx.hash}</code>
                        <button
                          onClick={() => copyToClipboard(tx.hash, `tx-${tx.ownerId}`)}
                          className="p-1 rounded hover:bg-dark-300 text-gray-400 hover:text-white transition-colors flex-shrink-0"
                        >
                          {copiedKey === `tx-${tx.ownerId}` ? (
                            <Check className="w-3.5 h-3.5 text-green-400" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                        <a
                          href="#"
                          className="p-1 rounded hover:bg-dark-300 text-gray-400 hover:text-white transition-colors flex-shrink-0"
                          title="View on XRPL Explorer"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Timeline */}
              <div className="p-4 rounded-lg bg-dark-400 border border-gray-700">
                <h4 className="text-sm font-medium text-gray-300 mb-3">Timeline</h4>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 rounded-full bg-primary-400 mt-1.5 flex-shrink-0" />
                    <div>
                      <p className="text-white text-sm">
                        Initiated by {ownerById(selectedWithdrawal.initiatedBy)?.name}
                      </p>
                      <p className="text-gray-500 text-xs">{formatDate(selectedWithdrawal.createdAt)}</p>
                    </div>
                  </div>
                  {(selectedWithdrawal.signatures || [])
                    .filter((s) => s.ownerId !== selectedWithdrawal.initiatedBy)
                    .map((s) => (
                      <div key={s.ownerId} className="flex items-start gap-3">
                        <div className="w-2 h-2 rounded-full bg-green-400 mt-1.5 flex-shrink-0" />
                        <div>
                          <p className="text-white text-sm">Signed by {ownerById(s.ownerId)?.name}</p>
                          <p className="text-gray-500 text-xs">{formatDate(s.signedAt)}</p>
                        </div>
                      </div>
                    ))}
                  {selectedWithdrawal.status === 'completed' && (
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 rounded-full bg-green-400 mt-1.5 flex-shrink-0" />
                      <div>
                        <p className="text-white text-sm">
                          Funds released equally to {owners.length} owners
                        </p>
                        <p className="text-gray-500 text-xs">{formatDate(selectedWithdrawal.completedAt)}</p>
                      </div>
                    </div>
                  )}
                  {selectedWithdrawal.status === 'rejected' && (
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 rounded-full bg-red-400 mt-1.5 flex-shrink-0" />
                      <div>
                        <p className="text-white text-sm">Rejected</p>
                        <p className="text-gray-500 text-xs">{formatDate(selectedWithdrawal.rejectedAt)}</p>
                      </div>
                    </div>
                  )}
                  {selectedWithdrawal.status === 'pending_signatures' && (
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 rounded-full bg-yellow-400 mt-1.5 flex-shrink-0 animate-pulse" />
                      <div>
                        <p className="text-yellow-400 text-sm">
                          Awaiting{' '}
                          {(selectedWithdrawal.requiredSignatures || 3) -
                            (selectedWithdrawal.signatures || []).length}{' '}
                          more signature(s)
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-gray-800">
              <button
                onClick={() => {
                  setShowDetailModal(false)
                  setSelectedWithdrawal(null)
                }}
                className="w-full px-4 py-2 rounded-lg bg-dark-400 border border-gray-700 text-gray-300 hover:bg-dark-500 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Withdrawals
