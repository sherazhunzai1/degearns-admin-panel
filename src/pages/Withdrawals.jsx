import { useState, useMemo } from 'react'
import { useSelector } from 'react-redux'
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
  AlertCircle,
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
  ExternalLink
} from 'lucide-react'

// ============================================
// Dummy Data
// ============================================

const OWNERS = [
  {
    id: 'owner1',
    name: 'Alex Thompson',
    walletAddress: 'rPT1Sjq2YGrBMTttX4GZHjKu9dyfzbpAYe',
    avatar: null
  },
  {
    id: 'owner2',
    name: 'Jordan Mitchell',
    walletAddress: 'rN7n3gSFtdKkAzQhS3vvWFx6P7JzSNGiNj',
    avatar: null
  }
]

const ADMIN_WALLET = {
  address: 'rHb9CJAWyB4rj91VRWn96DkukG4bwdtyTh',
  balance: '2450000000000', // drops
  label: 'Main Admin Wallet'
}

const DUMMY_WITHDRAWALS = [
  {
    id: 'wd-001',
    amount: '50000000000',
    destinationWallet: OWNERS[0].walletAddress,
    initiatedBy: OWNERS[0],
    approvedBy: OWNERS[1],
    status: 'completed',
    initiatedAt: '2025-01-25T10:30:00.000Z',
    approvedAt: '2025-01-25T14:15:00.000Z',
    completedAt: '2025-01-25T14:16:00.000Z',
    transactionHash: 'E3A7B9F2C1D845A6B7E8F9A0B1C2D3E4F5A6B7C8D9E0F1A2B3C4D5E6F7A8B9',
    reason: 'Monthly profit distribution - January',
    rejectionReason: null
  },
  {
    id: 'wd-002',
    amount: '25000000000',
    destinationWallet: OWNERS[1].walletAddress,
    initiatedBy: OWNERS[1],
    approvedBy: OWNERS[0],
    status: 'completed',
    initiatedAt: '2025-01-20T09:00:00.000Z',
    approvedAt: '2025-01-20T11:30:00.000Z',
    completedAt: '2025-01-20T11:31:00.000Z',
    transactionHash: 'F4B8C0D3E2A956B8C9D0E1F2A3B4C5D6E7F8A9B0C1D2E3F4A5B6C7D8E9F0A1',
    reason: 'Operational expense reimbursement',
    rejectionReason: null
  },
  {
    id: 'wd-003',
    amount: '75000000000',
    destinationWallet: OWNERS[0].walletAddress,
    initiatedBy: OWNERS[0],
    approvedBy: null,
    status: 'pending_approval',
    initiatedAt: '2025-01-27T16:45:00.000Z',
    approvedAt: null,
    completedAt: null,
    transactionHash: null,
    reason: 'Q1 earnings withdrawal',
    rejectionReason: null
  },
  {
    id: 'wd-004',
    amount: '10000000000',
    destinationWallet: OWNERS[1].walletAddress,
    initiatedBy: OWNERS[1],
    approvedBy: null,
    status: 'pending_approval',
    initiatedAt: '2025-01-26T08:20:00.000Z',
    approvedAt: null,
    completedAt: null,
    transactionHash: null,
    reason: 'Marketing budget allocation',
    rejectionReason: null
  },
  {
    id: 'wd-005',
    amount: '30000000000',
    destinationWallet: OWNERS[0].walletAddress,
    initiatedBy: OWNERS[0],
    approvedBy: OWNERS[1],
    status: 'rejected',
    initiatedAt: '2025-01-18T13:00:00.000Z',
    approvedAt: null,
    completedAt: null,
    transactionHash: null,
    reason: 'Emergency fund withdrawal',
    rejectionReason: 'Amount exceeds weekly limit. Please re-submit with adjusted amount.'
  },
  {
    id: 'wd-006',
    amount: '100000000000',
    destinationWallet: OWNERS[1].walletAddress,
    initiatedBy: OWNERS[1],
    approvedBy: OWNERS[0],
    status: 'completed',
    initiatedAt: '2025-01-10T11:00:00.000Z',
    approvedAt: '2025-01-10T15:00:00.000Z',
    completedAt: '2025-01-10T15:01:00.000Z',
    transactionHash: 'A1B2C3D4E5F6A7B8C9D0E1F2A3B4C5D6E7F8A9B0C1D2E3F4A5B6C7D8E9F0G1',
    reason: 'Year-end bonus distribution',
    rejectionReason: null
  },
  {
    id: 'wd-007',
    amount: '15000000000',
    destinationWallet: OWNERS[0].walletAddress,
    initiatedBy: OWNERS[0],
    approvedBy: OWNERS[1],
    status: 'completed',
    initiatedAt: '2025-01-05T07:30:00.000Z',
    approvedAt: '2025-01-05T09:00:00.000Z',
    completedAt: '2025-01-05T09:01:00.000Z',
    transactionHash: 'B2C3D4E5F6A7B8C9D0E1F2A3B4C5D6E7F8A9B0C1D2E3F4A5B6C7D8E9F0H2',
    reason: 'Server infrastructure payment',
    rejectionReason: null
  },
  {
    id: 'wd-008',
    amount: '20000000000',
    destinationWallet: OWNERS[1].walletAddress,
    initiatedBy: OWNERS[1],
    approvedBy: OWNERS[0],
    status: 'rejected',
    initiatedAt: '2024-12-28T14:00:00.000Z',
    approvedAt: null,
    completedAt: null,
    transactionHash: null,
    reason: 'End of year withdrawal',
    rejectionReason: 'Insufficient documentation provided. Please attach relevant invoices.'
  }
]

// ============================================
// Helper Components
// ============================================

const StatusBadge = ({ status }) => {
  const config = {
    pending_approval: {
      bg: 'bg-yellow-500/20',
      text: 'text-yellow-400',
      border: 'border-yellow-500/30',
      icon: Clock,
      label: 'Pending Approval'
    },
    completed: {
      bg: 'bg-green-500/20',
      text: 'text-green-400',
      border: 'border-green-500/30',
      icon: CheckCircle,
      label: 'Completed'
    },
    rejected: {
      bg: 'bg-red-500/20',
      text: 'text-red-400',
      border: 'border-red-500/30',
      icon: XCircle,
      label: 'Rejected'
    }
  }

  const c = config[status] || config.pending_approval
  const Icon = c.icon

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs rounded-full font-medium ${c.bg} ${c.text} border ${c.border}`}>
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
        <span className={`text-xs font-medium flex items-center gap-1 ${trendUp ? 'text-green-400' : 'text-red-400'}`}>
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

const OwnerAvatar = ({ owner, size = 'md' }) => {
  const sizeClasses = {
    sm: 'w-6 h-6 text-[10px]',
    md: 'w-8 h-8 text-xs',
    lg: 'w-10 h-10 text-sm',
    xl: 'w-12 h-12 text-base'
  }
  return (
    <div className={`${sizeClasses[size]} rounded-full bg-gradient-to-br from-primary-500 to-purple-500 flex items-center justify-center flex-shrink-0`}>
      <span className="text-white font-medium">
        {owner.name.split(' ').map(n => n[0]).join('')}
      </span>
    </div>
  )
}

// ============================================
// Multi-sig Step Indicator
// ============================================

const MultiSigSteps = ({ withdrawal }) => {
  const steps = [
    {
      label: 'Initiated',
      description: withdrawal.initiatedBy?.name,
      completed: true,
      time: withdrawal.initiatedAt
    },
    {
      label: 'Approval',
      description: withdrawal.status === 'pending_approval'
        ? 'Waiting for co-owner'
        : withdrawal.status === 'rejected'
          ? 'Rejected'
          : withdrawal.approvedBy?.name,
      completed: withdrawal.status === 'completed' || withdrawal.status === 'rejected',
      rejected: withdrawal.status === 'rejected',
      time: withdrawal.approvedAt
    },
    {
      label: 'Completed',
      description: withdrawal.status === 'completed' ? 'Funds transferred' : '-',
      completed: withdrawal.status === 'completed',
      time: withdrawal.completedAt
    }
  ]

  return (
    <div className="flex items-center gap-2 w-full">
      {steps.map((step, i) => (
        <div key={i} className="flex items-center gap-2 flex-1">
          <div className="flex flex-col items-center">
            <div className={`w-7 h-7 rounded-full flex items-center justify-center border-2 ${
              step.rejected
                ? 'border-red-500 bg-red-500/20'
                : step.completed
                  ? 'border-green-500 bg-green-500/20'
                  : 'border-gray-600 bg-dark-400'
            }`}>
              {step.rejected ? (
                <XCircle className="w-4 h-4 text-red-400" />
              ) : step.completed ? (
                <CheckCircle className="w-4 h-4 text-green-400" />
              ) : (
                <Clock className="w-4 h-4 text-gray-500" />
              )}
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <p className={`text-xs font-medium ${
              step.rejected ? 'text-red-400' : step.completed ? 'text-white' : 'text-gray-500'
            }`}>{step.label}</p>
            <p className="text-[10px] text-gray-500 truncate">{step.description}</p>
          </div>
          {i < steps.length - 1 && (
            <div className={`h-0.5 w-6 flex-shrink-0 ${
              step.completed && !steps[i + 1].rejected ? 'bg-green-500/50' : 'bg-gray-700'
            }`} />
          )}
        </div>
      ))}
    </div>
  )
}

// ============================================
// Main Component
// ============================================

const Withdrawals = () => {
  const { user } = useSelector((state) => state.auth)

  // Simulate current owner (toggle between owner1 and owner2 for testing)
  const [currentOwnerIndex, setCurrentOwnerIndex] = useState(0)
  const currentOwner = OWNERS[currentOwnerIndex]
  const otherOwner = OWNERS[currentOwnerIndex === 0 ? 1 : 0]

  // Modal states
  const [showInitiateModal, setShowInitiateModal] = useState(false)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [showApproveModal, setShowApproveModal] = useState(false)
  const [showRejectModal, setShowRejectModal] = useState(false)
  const [selectedWithdrawal, setSelectedWithdrawal] = useState(null)

  // Form states
  const [initiateForm, setInitiateForm] = useState({
    amount: '',
    reason: '',
    destinationWallet: OWNERS[0].walletAddress
  })
  const [rejectionReason, setRejectionReason] = useState('')
  const [signing, setSigning] = useState(false)
  const [signSuccess, setSignSuccess] = useState(false)

  // Filters
  const [statusFilter, setStatusFilter] = useState('')
  const [searchInput, setSearchInput] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [copiedHash, setCopiedHash] = useState(null)

  // Data (using dummy data)
  const withdrawals = DUMMY_WITHDRAWALS

  // Computed stats
  const totalWithdrawn = withdrawals
    .filter(w => w.status === 'completed')
    .reduce((sum, w) => sum + parseFloat(w.amount), 0)

  const pendingCount = withdrawals.filter(w => w.status === 'pending_approval').length
  const completedCount = withdrawals.filter(w => w.status === 'completed').length
  const rejectedCount = withdrawals.filter(w => w.status === 'rejected').length

  const pendingApprovals = withdrawals.filter(
    w => w.status === 'pending_approval' && w.initiatedBy.id !== currentOwner.id
  )

  // Filtered withdrawals
  const filteredWithdrawals = useMemo(() => {
    let result = [...withdrawals]

    if (statusFilter) {
      result = result.filter(w => w.status === statusFilter)
    }

    if (searchInput) {
      const search = searchInput.toLowerCase()
      result = result.filter(w =>
        w.reason?.toLowerCase().includes(search) ||
        w.initiatedBy?.name.toLowerCase().includes(search) ||
        w.transactionHash?.toLowerCase().includes(search) ||
        w.destinationWallet?.toLowerCase().includes(search)
      )
    }

    return result.sort((a, b) => new Date(b.initiatedAt) - new Date(a.initiatedAt))
  }, [withdrawals, statusFilter, searchInput])

  // Pagination
  const itemsPerPage = 10
  const totalPages = Math.ceil(filteredWithdrawals.length / itemsPerPage)
  const paginatedWithdrawals = filteredWithdrawals.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  // Helpers
  const dropsToXrp = (drops) => {
    if (!drops) return '0'
    return (parseFloat(drops) / 1000000).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  }

  const formatDate = (dateString) => {
    if (!dateString) return '-'
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatAddress = (address) => {
    if (!address) return '-'
    return `${address.slice(0, 8)}...${address.slice(-6)}`
  }

  const copyToClipboard = (text, id) => {
    navigator.clipboard.writeText(text)
    setCopiedHash(id)
    setTimeout(() => setCopiedHash(null), 2000)
  }

  // Handlers
  const handleInitiateSubmit = async (e) => {
    e.preventDefault()
    setSigning(true)
    // Simulate wallet signing
    setTimeout(() => {
      setSigning(false)
      setSignSuccess(true)
      setTimeout(() => {
        setSignSuccess(false)
        setShowInitiateModal(false)
        setInitiateForm({ amount: '', reason: '', destinationWallet: currentOwner.walletAddress })
      }, 1500)
    }, 2000)
  }

  const handleApprove = () => {
    setSigning(true)
    // Simulate wallet signing for approval
    setTimeout(() => {
      setSigning(false)
      setSignSuccess(true)
      setTimeout(() => {
        setSignSuccess(false)
        setShowApproveModal(false)
        setSelectedWithdrawal(null)
      }, 1500)
    }, 2000)
  }

  const handleReject = () => {
    if (!rejectionReason) return
    setShowRejectModal(false)
    setSelectedWithdrawal(null)
    setRejectionReason('')
  }

  const handleSearch = (e) => {
    e.preventDefault()
    setCurrentPage(1)
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Owner Switcher (for demo purposes) */}
      <div className="p-4 rounded-xl bg-dark-300 border border-dashed border-primary-500/40">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary-500/20 flex items-center justify-center">
              <Shield className="w-4 h-4 text-primary-400" />
            </div>
            <div>
              <p className="text-sm text-gray-400">Currently viewing as:</p>
              <p className="text-white font-medium">{currentOwner.name}</p>
            </div>
          </div>
          <button
            onClick={() => setCurrentOwnerIndex(currentOwnerIndex === 0 ? 1 : 0)}
            className="px-4 py-2 rounded-lg bg-dark-400 border border-gray-700 text-gray-300 hover:text-white hover:border-primary-500 transition-colors text-sm"
          >
            Switch to {otherOwner.name}
          </button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Total Withdrawn"
          value={`${dropsToXrp(totalWithdrawn.toString())} XRP`}
          icon={ArrowUpRight}
          color="bg-gradient-to-br from-primary-500 to-primary-600"
          subValue={`Balance: ${dropsToXrp(ADMIN_WALLET.balance)} XRP`}
        />
        <StatsCard
          title="Pending Approvals"
          value={pendingCount}
          icon={Clock}
          color="bg-gradient-to-br from-yellow-500 to-yellow-600"
          subValue={pendingApprovals.length > 0 ? `${pendingApprovals.length} awaiting your approval` : 'No action needed'}
        />
        <StatsCard
          title="Completed"
          value={completedCount}
          icon={CheckCircle}
          color="bg-gradient-to-br from-green-500 to-green-600"
          trend="+12%"
          trendUp={true}
        />
        <StatsCard
          title="Rejected"
          value={rejectedCount}
          icon={XCircle}
          color="bg-gradient-to-br from-red-500 to-red-600"
        />
      </div>

      {/* Owner Wallets */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Admin Wallet */}
        <div className="p-5 rounded-xl bg-dark-300 border border-gray-800">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary-500 to-blue-600 flex items-center justify-center">
              <Wallet className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-white font-medium">{ADMIN_WALLET.label}</p>
              <p className="text-xs text-gray-400">{formatAddress(ADMIN_WALLET.address)}</p>
            </div>
          </div>
          <p className="text-2xl font-bold text-white">{dropsToXrp(ADMIN_WALLET.balance)} <span className="text-sm text-gray-400 font-normal">XRP</span></p>
          <p className="text-xs text-gray-500 mt-1">Available for withdrawal</p>
        </div>

        {/* Owner Wallets */}
        {OWNERS.map((owner) => (
          <div key={owner.id} className={`p-5 rounded-xl bg-dark-300 border ${
            owner.id === currentOwner.id ? 'border-primary-500/50' : 'border-gray-800'
          }`}>
            <div className="flex items-center gap-3 mb-4">
              <OwnerAvatar owner={owner} size="lg" />
              <div>
                <div className="flex items-center gap-2">
                  <p className="text-white font-medium">{owner.name}</p>
                  {owner.id === currentOwner.id && (
                    <span className="px-1.5 py-0.5 text-[10px] rounded-full bg-primary-500/20 text-primary-400 border border-primary-500/30">You</span>
                  )}
                </div>
                <p className="text-xs text-gray-400">{formatAddress(owner.walletAddress)}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-green-400" />
              <span className="text-sm text-green-400">Authorized Signer</span>
            </div>
          </div>
        ))}
      </div>

      {/* Pending Approvals Section */}
      {pendingApprovals.length > 0 && (
        <div className="rounded-xl bg-dark-300 border border-yellow-500/30 overflow-hidden">
          <div className="p-5 border-b border-yellow-500/20 bg-yellow-500/5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-yellow-500/20 flex items-center justify-center">
                <ShieldAlert className="w-5 h-5 text-yellow-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">Pending Your Approval</h3>
                <p className="text-sm text-gray-400">{pendingApprovals.length} withdrawal{pendingApprovals.length > 1 ? 's' : ''} require{pendingApprovals.length === 1 ? 's' : ''} your signature</p>
              </div>
            </div>
          </div>
          <div className="divide-y divide-gray-800">
            {pendingApprovals.map((wd) => (
              <div key={wd.id} className="p-5 hover:bg-dark-400/30 transition-colors">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div className="flex items-start gap-4 flex-1">
                    <OwnerAvatar owner={wd.initiatedBy} size="lg" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="text-white font-medium">{wd.initiatedBy.name}</p>
                        <span className="text-gray-500 text-sm">requested a withdrawal</span>
                      </div>
                      <p className="text-2xl font-bold text-white mb-1">
                        {dropsToXrp(wd.amount)} <span className="text-sm text-gray-400 font-normal">XRP</span>
                      </p>
                      <p className="text-sm text-gray-400 mb-2">{wd.reason}</p>
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {formatDate(wd.initiatedAt)}
                        </span>
                        <span className="flex items-center gap-1">
                          <Send className="w-3 h-3" />
                          To: {formatAddress(wd.destinationWallet)}
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
                        setShowApproveModal(true)
                      }}
                      className="px-4 py-2 rounded-lg bg-green-500 hover:bg-green-600 text-white transition-colors text-sm font-medium flex items-center gap-2"
                    >
                      <ShieldCheck className="w-4 h-4" />
                      Approve & Sign
                    </button>
                  </div>
                </div>

                {/* Multi-sig progress */}
                <div className="mt-4 pt-4 border-t border-gray-800">
                  <MultiSigSteps withdrawal={wd} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Withdrawal History */}
      <div className="rounded-xl bg-dark-300 border border-gray-800 overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-gray-800">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <h3 className="text-lg font-semibold text-white">Withdrawal History</h3>

            <div className="flex flex-col sm:flex-row gap-3">
              {/* Search */}
              <form onSubmit={handleSearch} className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by reason, name, tx..."
                  value={searchInput}
                  onChange={(e) => {
                    setSearchInput(e.target.value)
                    setCurrentPage(1)
                  }}
                  className="w-full sm:w-72 pl-9 pr-4 py-2 rounded-lg bg-dark-400 border border-gray-700 text-white text-sm focus:outline-none focus:border-primary-500"
                />
              </form>

              {/* Status Filter */}
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value)
                  setCurrentPage(1)
                }}
                className="px-3 py-2 rounded-lg bg-dark-400 border border-gray-700 text-white text-sm focus:outline-none focus:border-primary-500"
              >
                <option value="">All Status</option>
                <option value="pending_approval">Pending Approval</option>
                <option value="completed">Completed</option>
                <option value="rejected">Rejected</option>
              </select>

              {/* Initiate Withdrawal Button */}
              <button
                onClick={() => {
                  setInitiateForm({ ...initiateForm, destinationWallet: currentOwner.walletAddress })
                  setShowInitiateModal(true)
                }}
                className="btn-primary flex items-center gap-2"
              >
                <Send className="w-4 h-4" />
                Initiate Withdrawal
              </button>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          {paginatedWithdrawals.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-gray-400">
              <FileText className="w-12 h-12 mb-3 opacity-50" />
              <p>No withdrawals found</p>
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="bg-dark-400">
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Initiated By</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Amount</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Destination</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Date</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Approved By</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-400 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {paginatedWithdrawals.map((wd) => (
                  <tr key={wd.id} className="hover:bg-dark-400/50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <OwnerAvatar owner={wd.initiatedBy} size="sm" />
                        <span className="text-white text-sm">{wd.initiatedBy.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-white text-sm font-medium">{dropsToXrp(wd.amount)} XRP</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-gray-300 text-sm">{formatAddress(wd.destinationWallet)}</span>
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={wd.status} />
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-300">{formatDate(wd.initiatedAt)}</td>
                    <td className="px-4 py-3">
                      {wd.approvedBy ? (
                        <div className="flex items-center gap-2">
                          <OwnerAvatar owner={wd.approvedBy} size="sm" />
                          <span className="text-gray-300 text-sm">{wd.approvedBy.name}</span>
                        </div>
                      ) : (
                        <span className="text-gray-500 text-sm">-</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
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
                        {wd.transactionHash && (
                          <button
                            onClick={() => copyToClipboard(wd.transactionHash, wd.id)}
                            className="p-1.5 rounded-lg hover:bg-dark-400 text-gray-400 hover:text-white transition-colors"
                            title="Copy Transaction Hash"
                          >
                            {copiedHash === wd.id ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-gray-800 flex items-center justify-between">
            <p className="text-sm text-gray-400">
              Showing {((currentPage - 1) * itemsPerPage) + 1} - {Math.min(currentPage * itemsPerPage, filteredWithdrawals.length)} of {filteredWithdrawals.length}
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
          <div className="w-full max-w-lg rounded-xl bg-dark-300 border border-gray-800 shadow-xl">
            <div className="flex items-center justify-between p-5 border-b border-gray-800">
              <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                <Send className="w-5 h-5 text-primary-400" />
                Initiate Withdrawal
              </h3>
              <button
                onClick={() => {
                  setShowInitiateModal(false)
                  setSigning(false)
                  setSignSuccess(false)
                }}
                className="p-1.5 rounded-lg hover:bg-dark-400 text-gray-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {signSuccess ? (
              <div className="p-8 flex flex-col items-center justify-center">
                <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mb-4">
                  <CheckCircle className="w-8 h-8 text-green-400" />
                </div>
                <h4 className="text-lg font-semibold text-white mb-2">Withdrawal Initiated</h4>
                <p className="text-gray-400 text-center text-sm">
                  Your withdrawal request has been signed and submitted. Waiting for {otherOwner.name} to approve.
                </p>
              </div>
            ) : (
              <form onSubmit={handleInitiateSubmit} className="p-5 space-y-4">
                {/* From wallet info */}
                <div className="p-3 rounded-lg bg-dark-400 border border-gray-700">
                  <p className="text-xs text-gray-400 mb-1">From</p>
                  <div className="flex items-center gap-2">
                    <Wallet className="w-4 h-4 text-primary-400" />
                    <span className="text-white text-sm font-medium">{ADMIN_WALLET.label}</span>
                    <span className="text-gray-500 text-xs">({formatAddress(ADMIN_WALLET.address)})</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Balance: {dropsToXrp(ADMIN_WALLET.balance)} XRP</p>
                </div>

                {/* Destination wallet */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Destination Wallet</label>
                  <select
                    value={initiateForm.destinationWallet}
                    onChange={(e) => setInitiateForm({ ...initiateForm, destinationWallet: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-dark-400 border border-gray-700 text-white focus:outline-none focus:border-primary-500"
                  >
                    {OWNERS.map(owner => (
                      <option key={owner.id} value={owner.walletAddress}>
                        {owner.name} ({formatAddress(owner.walletAddress)})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Amount */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Amount (XRP) *</label>
                  <input
                    type="number"
                    value={initiateForm.amount}
                    onChange={(e) => setInitiateForm({ ...initiateForm, amount: e.target.value })}
                    placeholder="Enter amount in XRP"
                    required
                    min="0.000001"
                    step="any"
                    className="w-full px-3 py-2 rounded-lg bg-dark-400 border border-gray-700 text-white focus:outline-none focus:border-primary-500"
                  />
                </div>

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
                <div className="p-3 rounded-lg bg-primary-500/10 border border-primary-500/30">
                  <div className="flex items-start gap-2">
                    <Shield className="w-4 h-4 text-primary-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-primary-400 text-sm font-medium">Multi-Signature Required</p>
                      <p className="text-gray-400 text-xs mt-1">
                        You will sign this request with your wallet. After that, <strong className="text-gray-300">{otherOwner.name}</strong> must also approve and sign to complete the withdrawal.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setShowInitiateModal(false)
                      setSigning(false)
                    }}
                    className="flex-1 px-4 py-2 rounded-lg bg-dark-400 border border-gray-700 text-gray-300 hover:bg-dark-500 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={signing || !initiateForm.amount || !initiateForm.reason}
                    className="flex-1 btn-primary flex items-center justify-center gap-2"
                  >
                    {signing ? (
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
            )}
          </div>
        </div>
      )}

      {/* ============================================ */}
      {/* Approve Modal */}
      {/* ============================================ */}
      {showApproveModal && selectedWithdrawal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-xl bg-dark-300 border border-gray-800 shadow-xl">
            <div className="flex items-center justify-between p-5 border-b border-gray-800">
              <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-green-400" />
                Approve Withdrawal
              </h3>
              <button
                onClick={() => {
                  setShowApproveModal(false)
                  setSelectedWithdrawal(null)
                  setSigning(false)
                  setSignSuccess(false)
                }}
                className="p-1.5 rounded-lg hover:bg-dark-400 text-gray-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {signSuccess ? (
              <div className="p-8 flex flex-col items-center justify-center">
                <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mb-4">
                  <CheckCircle className="w-8 h-8 text-green-400" />
                </div>
                <h4 className="text-lg font-semibold text-white mb-2">Withdrawal Approved</h4>
                <p className="text-gray-400 text-center text-sm">
                  The withdrawal has been approved and funds are being transferred.
                </p>
              </div>
            ) : (
              <div className="p-5 space-y-4">
                {/* Withdrawal Summary */}
                <div className="p-4 rounded-lg bg-dark-400 border border-gray-700">
                  <div className="flex items-center gap-3 mb-3">
                    <OwnerAvatar owner={selectedWithdrawal.initiatedBy} size="lg" />
                    <div>
                      <p className="text-white font-medium">{selectedWithdrawal.initiatedBy.name}</p>
                      <p className="text-xs text-gray-400">Initiated {formatDate(selectedWithdrawal.initiatedAt)}</p>
                    </div>
                  </div>
                  <div className="space-y-2 mt-3">
                    <div className="flex justify-between">
                      <span className="text-gray-400 text-sm">Amount</span>
                      <span className="text-white font-semibold">{dropsToXrp(selectedWithdrawal.amount)} XRP</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400 text-sm">Destination</span>
                      <span className="text-gray-300 text-sm">{formatAddress(selectedWithdrawal.destinationWallet)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400 text-sm">Reason</span>
                      <span className="text-gray-300 text-sm text-right max-w-[200px]">{selectedWithdrawal.reason}</span>
                    </div>
                  </div>
                </div>

                {/* Multi-sig progress */}
                <div className="p-3 rounded-lg bg-dark-400 border border-gray-700">
                  <MultiSigSteps withdrawal={selectedWithdrawal} />
                </div>

                {/* Warning */}
                <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/30">
                  <div className="flex items-start gap-2">
                    <ShieldCheck className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                    <p className="text-green-400 text-sm">
                      By approving, you authorize the transfer of <strong>{dropsToXrp(selectedWithdrawal.amount)} XRP</strong> from the admin wallet. This action cannot be reversed.
                    </p>
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setShowApproveModal(false)
                      setSelectedWithdrawal(null)
                      setSigning(false)
                    }}
                    className="flex-1 px-4 py-2 rounded-lg bg-dark-400 border border-gray-700 text-gray-300 hover:bg-dark-500 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleApprove}
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
            )}
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
              {/* Summary */}
              <div className="p-3 rounded-lg bg-dark-400 border border-gray-700">
                <div className="flex items-center gap-3 mb-2">
                  <OwnerAvatar owner={selectedWithdrawal.initiatedBy} />
                  <div>
                    <p className="text-white font-medium">{selectedWithdrawal.initiatedBy.name}</p>
                    <p className="text-gray-500 text-sm">{dropsToXrp(selectedWithdrawal.amount)} XRP</p>
                  </div>
                </div>
                <p className="text-sm text-gray-400">{selectedWithdrawal.reason}</p>
              </div>

              <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30">
                <p className="text-red-400 text-sm">
                  This will reject the withdrawal request. The initiator will be notified of the rejection.
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
              {/* Status & Amount */}
              <div className="flex items-center justify-between">
                <StatusBadge status={selectedWithdrawal.status} />
                <p className="text-2xl font-bold text-white">
                  {dropsToXrp(selectedWithdrawal.amount)} <span className="text-sm text-gray-400 font-normal">XRP</span>
                </p>
              </div>

              {/* Multi-sig Steps */}
              <div className="p-4 rounded-lg bg-dark-400 border border-gray-700">
                <h4 className="text-sm font-medium text-gray-300 mb-3">Approval Flow</h4>
                <MultiSigSteps withdrawal={selectedWithdrawal} />
              </div>

              {/* Details Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-3 rounded-lg bg-dark-400 border border-gray-700">
                  <p className="text-xs text-gray-500 mb-1">Initiated By</p>
                  <div className="flex items-center gap-2">
                    <OwnerAvatar owner={selectedWithdrawal.initiatedBy} size="sm" />
                    <div>
                      <p className="text-white text-sm">{selectedWithdrawal.initiatedBy.name}</p>
                      <p className="text-gray-500 text-xs">{formatAddress(selectedWithdrawal.initiatedBy.walletAddress)}</p>
                    </div>
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-dark-400 border border-gray-700">
                  <p className="text-xs text-gray-500 mb-1">Approved By</p>
                  {selectedWithdrawal.approvedBy ? (
                    <div className="flex items-center gap-2">
                      <OwnerAvatar owner={selectedWithdrawal.approvedBy} size="sm" />
                      <div>
                        <p className="text-white text-sm">{selectedWithdrawal.approvedBy.name}</p>
                        <p className="text-gray-500 text-xs">{formatAddress(selectedWithdrawal.approvedBy.walletAddress)}</p>
                      </div>
                    </div>
                  ) : (
                    <p className="text-gray-500 text-sm">Awaiting approval</p>
                  )}
                </div>

                <div className="p-3 rounded-lg bg-dark-400 border border-gray-700">
                  <p className="text-xs text-gray-500 mb-1">Source Wallet</p>
                  <p className="text-white text-sm">{ADMIN_WALLET.label}</p>
                  <p className="text-gray-500 text-xs">{formatAddress(ADMIN_WALLET.address)}</p>
                </div>

                <div className="p-3 rounded-lg bg-dark-400 border border-gray-700">
                  <p className="text-xs text-gray-500 mb-1">Destination Wallet</p>
                  <p className="text-white text-sm">{formatAddress(selectedWithdrawal.destinationWallet)}</p>
                  <button
                    onClick={() => copyToClipboard(selectedWithdrawal.destinationWallet, 'dest')}
                    className="text-primary-400 text-xs hover:text-primary-300 flex items-center gap-1 mt-1"
                  >
                    {copiedHash === 'dest' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                    {copiedHash === 'dest' ? 'Copied' : 'Copy address'}
                  </button>
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
                  <p className="text-xs text-red-400 mb-1">Rejection Reason</p>
                  <p className="text-red-300 text-sm">{selectedWithdrawal.rejectionReason}</p>
                </div>
              )}

              {/* Transaction hash */}
              {selectedWithdrawal.transactionHash && (
                <div className="p-3 rounded-lg bg-dark-400 border border-gray-700">
                  <p className="text-xs text-gray-500 mb-1">Transaction Hash</p>
                  <div className="flex items-center gap-2">
                    <p className="text-white text-sm font-mono truncate flex-1">{selectedWithdrawal.transactionHash}</p>
                    <button
                      onClick={() => copyToClipboard(selectedWithdrawal.transactionHash, 'txhash')}
                      className="p-1.5 rounded-lg hover:bg-dark-300 text-gray-400 hover:text-white transition-colors flex-shrink-0"
                    >
                      {copiedHash === 'txhash' ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                    </button>
                    <a
                      href="#"
                      className="p-1.5 rounded-lg hover:bg-dark-300 text-gray-400 hover:text-white transition-colors flex-shrink-0"
                      title="View on XRPL Explorer"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
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
                      <p className="text-white text-sm">Withdrawal initiated by {selectedWithdrawal.initiatedBy.name}</p>
                      <p className="text-gray-500 text-xs">{formatDate(selectedWithdrawal.initiatedAt)}</p>
                    </div>
                  </div>
                  {selectedWithdrawal.approvedAt && (
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 rounded-full bg-green-400 mt-1.5 flex-shrink-0" />
                      <div>
                        <p className="text-white text-sm">Approved by {selectedWithdrawal.approvedBy?.name}</p>
                        <p className="text-gray-500 text-xs">{formatDate(selectedWithdrawal.approvedAt)}</p>
                      </div>
                    </div>
                  )}
                  {selectedWithdrawal.status === 'rejected' && (
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 rounded-full bg-red-400 mt-1.5 flex-shrink-0" />
                      <div>
                        <p className="text-white text-sm">Rejected</p>
                        <p className="text-gray-500 text-xs">{selectedWithdrawal.rejectionReason}</p>
                      </div>
                    </div>
                  )}
                  {selectedWithdrawal.completedAt && (
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 rounded-full bg-green-400 mt-1.5 flex-shrink-0" />
                      <div>
                        <p className="text-white text-sm">Funds transferred</p>
                        <p className="text-gray-500 text-xs">{formatDate(selectedWithdrawal.completedAt)}</p>
                      </div>
                    </div>
                  )}
                  {selectedWithdrawal.status === 'pending_approval' && (
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 rounded-full bg-yellow-400 mt-1.5 flex-shrink-0 animate-pulse" />
                      <div>
                        <p className="text-yellow-400 text-sm">Awaiting co-owner approval</p>
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
