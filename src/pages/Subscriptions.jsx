import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
  Crown,
  Zap,
  Star,
  Users,
  Search,
  Plus,
  X,
  ChevronLeft,
  ChevronRight,
  Calendar,
  Clock,
  Ban,
  CheckCircle,
  XCircle,
  Loader2,
  AlertCircle,
  RefreshCw,
  Eye,
  History,
  PlusCircle,
  MinusCircle,
  Sparkles
} from 'lucide-react'
import {
  fetchSubscriptions,
  fetchSubscriptionStats,
  createSubscription,
  cancelSubscription,
  extendSubscription,
  fetchUserSubscriptionHistory,
  setFilters,
  setPage,
  clearError,
  clearSuccessMessage,
  clearSelectedUserHistory
} from '../store/slices/subscriptionsSlice'

const PLAN_COLORS = {
  free: { bg: 'bg-gray-500/20', text: 'text-gray-400', border: 'border-gray-500/30' },
  basic: { bg: 'bg-blue-500/20', text: 'text-blue-400', border: 'border-blue-500/30' },
  pro: { bg: 'bg-purple-500/20', text: 'text-purple-400', border: 'border-purple-500/30' },
  premium: { bg: 'bg-yellow-500/20', text: 'text-yellow-400', border: 'border-yellow-500/30' }
}

const PLAN_ICONS = {
  free: Users,
  basic: Zap,
  pro: Star,
  premium: Crown
}

// Stats Card Component
const StatsCard = ({ title, value, icon: Icon, color, subValue }) => (
  <div className="p-5 rounded-xl bg-dark-300 border border-gray-800">
    <div className="flex items-center justify-between mb-3">
      <div className={`w-10 h-10 rounded-lg ${color} flex items-center justify-center`}>
        <Icon className="w-5 h-5 text-white" />
      </div>
    </div>
    <p className="text-2xl font-bold text-white">{value}</p>
    <p className="text-sm text-gray-400">{title}</p>
    {subValue && <p className="text-xs text-gray-500 mt-1">{subValue}</p>}
  </div>
)

// Plan Badge Component
const PlanBadge = ({ plan, size = 'sm' }) => {
  const colors = PLAN_COLORS[plan?.toLowerCase()] || PLAN_COLORS.free
  const Icon = PLAN_ICONS[plan?.toLowerCase()] || Users
  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-3 py-1 text-sm'

  return (
    <span className={`inline-flex items-center gap-1 ${sizeClasses} rounded-full ${colors.bg} ${colors.text} border ${colors.border} font-medium capitalize`}>
      <Icon className={size === 'sm' ? 'w-3 h-3' : 'w-4 h-4'} />
      {plan}
    </span>
  )
}

// Status Badge Component
const StatusBadge = ({ isActive }) => (
  <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs rounded-full font-medium ${
    isActive
      ? 'bg-green-500/20 text-green-400 border border-green-500/30'
      : 'bg-red-500/20 text-red-400 border border-red-500/30'
  }`}>
    {isActive ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
    {isActive ? 'Active' : 'Expired'}
  </span>
)

const Subscriptions = () => {
  const dispatch = useDispatch()
  const {
    subscriptions,
    pagination,
    filters,
    stats,
    selectedUserHistory,
    loading,
    error,
    successMessage
  } = useSelector((state) => state.subscriptions)

  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showCancelModal, setShowCancelModal] = useState(false)
  const [showExtendModal, setShowExtendModal] = useState(false)
  const [showHistoryModal, setShowHistoryModal] = useState(false)
  const [selectedSubscription, setSelectedSubscription] = useState(null)

  // Form states
  const [createForm, setCreateForm] = useState({
    walletAddress: '',
    planType: 'basic',
    durationDays: 30,
    paymentTransactionHash: '',
    paymentAmount: '',
    notes: ''
  })
  const [cancelReason, setCancelReason] = useState('')
  const [extendForm, setExtendForm] = useState({
    additionalDays: 15,
    reason: ''
  })
  const [searchInput, setSearchInput] = useState('')

  // Load data on mount
  useEffect(() => {
    dispatch(fetchSubscriptionStats())
    dispatch(fetchSubscriptions({ ...filters, page: pagination.page }))
  }, [dispatch])

  // Refetch when filters or page change
  useEffect(() => {
    dispatch(fetchSubscriptions({ ...filters, page: pagination.page }))
  }, [dispatch, filters, pagination.page])

  // Clear messages after delay
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => dispatch(clearSuccessMessage()), 5000)
      return () => clearTimeout(timer)
    }
  }, [successMessage, dispatch])

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => dispatch(clearError()), 5000)
      return () => clearTimeout(timer)
    }
  }, [error, dispatch])

  // Handlers
  const handleSearch = (e) => {
    e.preventDefault()
    dispatch(setFilters({ search: searchInput }))
    dispatch(setPage(1))
  }

  const handleFilterChange = (key, value) => {
    dispatch(setFilters({ [key]: value }))
    dispatch(setPage(1))
  }

  const handleCreateSubmit = async (e) => {
    e.preventDefault()
    const result = await dispatch(createSubscription(createForm))
    if (!result.error) {
      setShowCreateModal(false)
      setCreateForm({
        walletAddress: '',
        planType: 'basic',
        durationDays: 30,
        paymentTransactionHash: '',
        paymentAmount: '',
        notes: ''
      })
      dispatch(fetchSubscriptionStats())
    }
  }

  const handleCancelSubmit = async () => {
    if (!selectedSubscription) return
    const result = await dispatch(cancelSubscription({
      subscriptionId: selectedSubscription.id,
      reason: cancelReason
    }))
    if (!result.error) {
      setShowCancelModal(false)
      setSelectedSubscription(null)
      setCancelReason('')
      dispatch(fetchSubscriptionStats())
    }
  }

  const handleExtendSubmit = async () => {
    if (!selectedSubscription) return
    const result = await dispatch(extendSubscription({
      subscriptionId: selectedSubscription.id,
      additionalDays: extendForm.additionalDays,
      reason: extendForm.reason
    }))
    if (!result.error) {
      setShowExtendModal(false)
      setSelectedSubscription(null)
      setExtendForm({ additionalDays: 15, reason: '' })
    }
  }

  const handleViewHistory = (subscription) => {
    setSelectedSubscription(subscription)
    dispatch(fetchUserSubscriptionHistory(subscription.userWalletAddress))
    setShowHistoryModal(true)
  }

  const formatDate = (dateString) => {
    if (!dateString) return '-'
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const formatAddress = (address) => {
    if (!address) return '-'
    return `${address.slice(0, 8)}...${address.slice(-6)}`
  }

  const dropsToXrp = (drops) => {
    if (!drops) return '0'
    return (parseFloat(drops) / 1000000).toFixed(2)
  }

  const totalActive = Object.values(stats.activeByPlan || {}).reduce((a, b) => a + b, 0)
  const totalAll = Object.values(stats.totalByPlan || {}).reduce((a, b) => a + b, 0)

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Success/Error Messages */}
      {successMessage && (
        <div className="p-4 rounded-lg bg-green-500/20 border border-green-500/30 flex items-center gap-3">
          <CheckCircle className="w-5 h-5 text-green-400" />
          <p className="text-green-400">{successMessage}</p>
        </div>
      )}
      {error && (
        <div className="p-4 rounded-lg bg-red-500/20 border border-red-500/30 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-400" />
          <p className="text-red-400">{error}</p>
        </div>
      )}

      {/* Stats Overview */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <StatsCard
          title="Total Subscriptions"
          value={totalAll.toLocaleString()}
          icon={Users}
          color="bg-gradient-to-br from-primary-500 to-primary-600"
          subValue={`${totalActive} active`}
        />
        <StatsCard
          title="Premium"
          value={(stats.activeByPlan?.premium || 0).toLocaleString()}
          icon={Crown}
          color="bg-gradient-to-br from-yellow-500 to-yellow-600"
          subValue={`${stats.totalByPlan?.premium || 0} total`}
        />
        <StatsCard
          title="Pro"
          value={(stats.activeByPlan?.pro || 0).toLocaleString()}
          icon={Star}
          color="bg-gradient-to-br from-purple-500 to-purple-600"
          subValue={`${stats.totalByPlan?.pro || 0} total`}
        />
        <StatsCard
          title="Basic"
          value={(stats.activeByPlan?.basic || 0).toLocaleString()}
          icon={Zap}
          color="bg-gradient-to-br from-blue-500 to-blue-600"
          subValue={`${stats.totalByPlan?.basic || 0} total`}
        />
        <StatsCard
          title="Free"
          value={(stats.activeByPlan?.free || 0).toLocaleString()}
          icon={Users}
          color="bg-gradient-to-br from-gray-500 to-gray-600"
          subValue={`${stats.totalByPlan?.free || 0} total`}
        />
      </div>

      {/* Recent Subscriptions */}
      {stats.recentSubscriptions?.length > 0 && (
        <div className="p-5 rounded-xl bg-dark-300 border border-gray-800">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-yellow-400" />
            Recent Subscriptions
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
            {stats.recentSubscriptions.slice(0, 4).map((sub) => (
              <div key={sub.id} className="p-3 rounded-lg bg-dark-400 border border-gray-700">
                <div className="flex items-center gap-2 mb-2">
                  {sub.user?.profileImage ? (
                    <img src={sub.user.profileImage} alt="" className="w-8 h-8 rounded-full object-cover" />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-500 to-purple-500 flex items-center justify-center">
                      <span className="text-white text-xs font-medium">
                        {(sub.user?.username || 'U')[0].toUpperCase()}
                      </span>
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="text-white text-sm font-medium truncate">{sub.user?.username || 'Unknown'}</p>
                    <p className="text-gray-500 text-xs truncate">{formatAddress(sub.userWalletAddress)}</p>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <PlanBadge plan={sub.planType} />
                  <span className="text-xs text-gray-400">{formatDate(sub.startDate)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Subscriptions List */}
      <div className="rounded-xl bg-dark-300 border border-gray-800 overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-gray-800">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <h3 className="text-lg font-semibold text-white">All Subscriptions</h3>

            <div className="flex flex-col sm:flex-row gap-3">
              {/* Search */}
              <form onSubmit={handleSearch} className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search wallet..."
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  className="w-full sm:w-64 pl-9 pr-4 py-2 rounded-lg bg-dark-400 border border-gray-700 text-white text-sm focus:outline-none focus:border-primary-500"
                />
              </form>

              {/* Filters */}
              <select
                value={filters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
                className="px-3 py-2 rounded-lg bg-dark-400 border border-gray-700 text-white text-sm focus:outline-none focus:border-primary-500"
              >
                <option value="">All Status</option>
                <option value="active">Active</option>
                <option value="expired">Expired</option>
              </select>

              <select
                value={filters.planType}
                onChange={(e) => handleFilterChange('planType', e.target.value)}
                className="px-3 py-2 rounded-lg bg-dark-400 border border-gray-700 text-white text-sm focus:outline-none focus:border-primary-500"
              >
                <option value="">All Plans</option>
                <option value="free">Free</option>
                <option value="basic">Basic</option>
                <option value="pro">Pro</option>
                <option value="premium">Premium</option>
              </select>

              {/* Create Button */}
              <button
                onClick={() => setShowCreateModal(true)}
                className="btn-primary flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Create
              </button>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          {loading.subscriptions ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 text-primary-500 animate-spin" />
            </div>
          ) : subscriptions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-gray-400">
              <Users className="w-12 h-12 mb-3 opacity-50" />
              <p>No subscriptions found</p>
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="bg-dark-400">
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">User</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Plan</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Start Date</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">End Date</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Payment</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-400 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {subscriptions.map((sub) => (
                  <tr key={sub.id} className="hover:bg-dark-400/50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        {sub.user?.profileImage ? (
                          <img src={sub.user.profileImage} alt="" className="w-8 h-8 rounded-full object-cover" />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-500 to-purple-500 flex items-center justify-center">
                            <span className="text-white text-xs font-medium">
                              {(sub.user?.username || 'U')[0].toUpperCase()}
                            </span>
                          </div>
                        )}
                        <div>
                          <p className="text-white text-sm font-medium">{sub.user?.username || 'Unknown'}</p>
                          <p className="text-gray-500 text-xs">{formatAddress(sub.userWalletAddress)}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <PlanBadge plan={sub.planType} />
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge isActive={sub.isActive} />
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-300">{formatDate(sub.startDate)}</td>
                    <td className="px-4 py-3 text-sm text-gray-300">{formatDate(sub.endDate)}</td>
                    <td className="px-4 py-3 text-sm text-gray-300">
                      {sub.paymentAmount ? `${dropsToXrp(sub.paymentAmount)} XRP` : '-'}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => handleViewHistory(sub)}
                          className="p-1.5 rounded-lg hover:bg-dark-400 text-gray-400 hover:text-white transition-colors"
                          title="View History"
                        >
                          <History className="w-4 h-4" />
                        </button>
                        {sub.isActive && (
                          <>
                            <button
                              onClick={() => {
                                setSelectedSubscription(sub)
                                setShowExtendModal(true)
                              }}
                              className="p-1.5 rounded-lg hover:bg-green-500/20 text-gray-400 hover:text-green-400 transition-colors"
                              title="Extend"
                            >
                              <PlusCircle className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => {
                                setSelectedSubscription(sub)
                                setShowCancelModal(true)
                              }}
                              className="p-1.5 rounded-lg hover:bg-red-500/20 text-gray-400 hover:text-red-400 transition-colors"
                              title="Cancel"
                            >
                              <Ban className="w-4 h-4" />
                            </button>
                          </>
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
        {pagination.totalPages > 1 && (
          <div className="p-4 border-t border-gray-800 flex items-center justify-between">
            <p className="text-sm text-gray-400">
              Showing {((pagination.page - 1) * pagination.limit) + 1} - {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total}
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => dispatch(setPage(pagination.page - 1))}
                disabled={pagination.page <= 1}
                className="p-2 rounded-lg hover:bg-dark-400 text-gray-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <span className="text-white text-sm">
                Page {pagination.page} of {pagination.totalPages}
              </span>
              <button
                onClick={() => dispatch(setPage(pagination.page + 1))}
                disabled={pagination.page >= pagination.totalPages}
                className="p-2 rounded-lg hover:bg-dark-400 text-gray-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Create Subscription Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-xl bg-dark-300 border border-gray-800 shadow-xl">
            <div className="flex items-center justify-between p-5 border-b border-gray-800">
              <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                <Plus className="w-5 h-5 text-primary-400" />
                Create Subscription
              </h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-1.5 rounded-lg hover:bg-dark-400 text-gray-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Wallet Address *</label>
                <input
                  type="text"
                  value={createForm.walletAddress}
                  onChange={(e) => setCreateForm({ ...createForm, walletAddress: e.target.value })}
                  placeholder="rXXXXXXXX..."
                  required
                  className="w-full px-3 py-2 rounded-lg bg-dark-400 border border-gray-700 text-white focus:outline-none focus:border-primary-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Plan Type *</label>
                  <select
                    value={createForm.planType}
                    onChange={(e) => setCreateForm({ ...createForm, planType: e.target.value })}
                    required
                    className="w-full px-3 py-2 rounded-lg bg-dark-400 border border-gray-700 text-white focus:outline-none focus:border-primary-500"
                  >
                    <option value="basic">Basic</option>
                    <option value="pro">Pro</option>
                    <option value="premium">Premium</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Duration (days)</label>
                  <input
                    type="number"
                    value={createForm.durationDays}
                    onChange={(e) => setCreateForm({ ...createForm, durationDays: parseInt(e.target.value) || 30 })}
                    min="1"
                    className="w-full px-3 py-2 rounded-lg bg-dark-400 border border-gray-700 text-white focus:outline-none focus:border-primary-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Payment Transaction Hash</label>
                <input
                  type="text"
                  value={createForm.paymentTransactionHash}
                  onChange={(e) => setCreateForm({ ...createForm, paymentTransactionHash: e.target.value })}
                  placeholder="Optional"
                  className="w-full px-3 py-2 rounded-lg bg-dark-400 border border-gray-700 text-white focus:outline-none focus:border-primary-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Payment Amount (drops)</label>
                <input
                  type="text"
                  value={createForm.paymentAmount}
                  onChange={(e) => setCreateForm({ ...createForm, paymentAmount: e.target.value })}
                  placeholder="Optional"
                  className="w-full px-3 py-2 rounded-lg bg-dark-400 border border-gray-700 text-white focus:outline-none focus:border-primary-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Notes</label>
                <textarea
                  value={createForm.notes}
                  onChange={(e) => setCreateForm({ ...createForm, notes: e.target.value })}
                  placeholder="Optional admin notes..."
                  rows={2}
                  className="w-full px-3 py-2 rounded-lg bg-dark-400 border border-gray-700 text-white focus:outline-none focus:border-primary-500 resize-none"
                />
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
                  type="submit"
                  disabled={loading.create}
                  className="flex-1 btn-primary flex items-center justify-center gap-2"
                >
                  {loading.create ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Plus className="w-4 h-4" />
                  )}
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Cancel Subscription Modal */}
      {showCancelModal && selectedSubscription && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-xl bg-dark-300 border border-gray-800 shadow-xl">
            <div className="flex items-center justify-between p-5 border-b border-gray-800">
              <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                <Ban className="w-5 h-5 text-red-400" />
                Cancel Subscription
              </h3>
              <button
                onClick={() => {
                  setShowCancelModal(false)
                  setSelectedSubscription(null)
                }}
                className="p-1.5 rounded-lg hover:bg-dark-400 text-gray-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              <div className="p-3 rounded-lg bg-dark-400 border border-gray-700">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-purple-500 flex items-center justify-center">
                    <span className="text-white font-medium">
                      {(selectedSubscription.user?.username || 'U')[0].toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <p className="text-white font-medium">{selectedSubscription.user?.username || 'Unknown'}</p>
                    <p className="text-gray-500 text-sm">{formatAddress(selectedSubscription.userWalletAddress)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <PlanBadge plan={selectedSubscription.planType} />
                  <span className="text-gray-400 text-sm">
                    Expires: {formatDate(selectedSubscription.endDate)}
                  </span>
                </div>
              </div>

              <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30">
                <p className="text-red-400 text-sm">
                  This will immediately cancel the subscription. The user will lose access to premium features.
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Reason *</label>
                <textarea
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  placeholder="Enter cancellation reason..."
                  rows={3}
                  required
                  className="w-full px-3 py-2 rounded-lg bg-dark-400 border border-gray-700 text-white focus:outline-none focus:border-primary-500 resize-none"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowCancelModal(false)
                    setSelectedSubscription(null)
                  }}
                  className="flex-1 px-4 py-2 rounded-lg bg-dark-400 border border-gray-700 text-gray-300 hover:bg-dark-500 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCancelSubmit}
                  disabled={loading.cancel || !cancelReason}
                  className="flex-1 px-4 py-2 rounded-lg bg-red-500 hover:bg-red-600 text-white font-medium flex items-center justify-center gap-2 disabled:opacity-50 transition-colors"
                >
                  {loading.cancel ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Ban className="w-4 h-4" />
                  )}
                  Cancel Subscription
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Extend Subscription Modal */}
      {showExtendModal && selectedSubscription && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-xl bg-dark-300 border border-gray-800 shadow-xl">
            <div className="flex items-center justify-between p-5 border-b border-gray-800">
              <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                <PlusCircle className="w-5 h-5 text-green-400" />
                Extend Subscription
              </h3>
              <button
                onClick={() => {
                  setShowExtendModal(false)
                  setSelectedSubscription(null)
                }}
                className="p-1.5 rounded-lg hover:bg-dark-400 text-gray-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              <div className="p-3 rounded-lg bg-dark-400 border border-gray-700">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-purple-500 flex items-center justify-center">
                    <span className="text-white font-medium">
                      {(selectedSubscription.user?.username || 'U')[0].toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <p className="text-white font-medium">{selectedSubscription.user?.username || 'Unknown'}</p>
                    <p className="text-gray-500 text-sm">{formatAddress(selectedSubscription.userWalletAddress)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <PlanBadge plan={selectedSubscription.planType} />
                  <span className="text-gray-400 text-sm">
                    Current end: {formatDate(selectedSubscription.endDate)}
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Additional Days *</label>
                <input
                  type="number"
                  value={extendForm.additionalDays}
                  onChange={(e) => setExtendForm({ ...extendForm, additionalDays: parseInt(e.target.value) || 1 })}
                  min="1"
                  className="w-full px-3 py-2 rounded-lg bg-dark-400 border border-gray-700 text-white focus:outline-none focus:border-primary-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Reason</label>
                <textarea
                  value={extendForm.reason}
                  onChange={(e) => setExtendForm({ ...extendForm, reason: e.target.value })}
                  placeholder="Enter reason for extension..."
                  rows={2}
                  className="w-full px-3 py-2 rounded-lg bg-dark-400 border border-gray-700 text-white focus:outline-none focus:border-primary-500 resize-none"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowExtendModal(false)
                    setSelectedSubscription(null)
                  }}
                  className="flex-1 px-4 py-2 rounded-lg bg-dark-400 border border-gray-700 text-gray-300 hover:bg-dark-500 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleExtendSubmit}
                  disabled={loading.extend || extendForm.additionalDays < 1}
                  className="flex-1 px-4 py-2 rounded-lg bg-green-500 hover:bg-green-600 text-white font-medium flex items-center justify-center gap-2 disabled:opacity-50 transition-colors"
                >
                  {loading.extend ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <PlusCircle className="w-4 h-4" />
                  )}
                  Extend
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* User History Modal */}
      {showHistoryModal && selectedSubscription && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-2xl max-h-[80vh] rounded-xl bg-dark-300 border border-gray-800 shadow-xl flex flex-col">
            <div className="flex items-center justify-between p-5 border-b border-gray-800">
              <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                <History className="w-5 h-5 text-primary-400" />
                Subscription History
              </h3>
              <button
                onClick={() => {
                  setShowHistoryModal(false)
                  setSelectedSubscription(null)
                  dispatch(clearSelectedUserHistory())
                }}
                className="p-1.5 rounded-lg hover:bg-dark-400 text-gray-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 overflow-y-auto flex-1">
              {loading.userHistory ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 text-primary-500 animate-spin" />
                </div>
              ) : selectedUserHistory ? (
                <div className="space-y-6">
                  {/* User Info */}
                  <div className="p-4 rounded-lg bg-dark-400 border border-gray-700">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary-500 to-purple-500 flex items-center justify-center">
                        <span className="text-white font-medium text-lg">
                          {(selectedUserHistory.stats?.user?.username || 'U')[0].toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <p className="text-white font-semibold">{selectedUserHistory.stats?.user?.username || 'Unknown'}</p>
                        <p className="text-gray-400 text-sm">{formatAddress(selectedUserHistory.stats?.user?.walletAddress)}</p>
                      </div>
                    </div>
                    {selectedUserHistory.stats?.scores && (
                      <div className="grid grid-cols-3 gap-3">
                        <div className="p-2 rounded-lg bg-dark-500 text-center">
                          <p className="text-lg font-semibold text-blue-400">{selectedUserHistory.stats.scores.traderScore?.toFixed(1) || 0}</p>
                          <p className="text-xs text-gray-400">Trader</p>
                        </div>
                        <div className="p-2 rounded-lg bg-dark-500 text-center">
                          <p className="text-lg font-semibold text-purple-400">{selectedUserHistory.stats.scores.creatorScore?.toFixed(1) || 0}</p>
                          <p className="text-xs text-gray-400">Creator</p>
                        </div>
                        <div className="p-2 rounded-lg bg-dark-500 text-center">
                          <p className="text-lg font-semibold text-orange-400">{selectedUserHistory.stats.scores.influencerScore?.toFixed(1) || 0}</p>
                          <p className="text-xs text-gray-400">Influencer</p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Subscription History */}
                  <div>
                    <h4 className="text-white font-medium mb-3">Subscription History</h4>
                    {selectedUserHistory.subscriptionHistory?.length > 0 ? (
                      <div className="space-y-2">
                        {selectedUserHistory.subscriptionHistory.map((sub, index) => (
                          <div key={sub.id || index} className="p-3 rounded-lg bg-dark-400 border border-gray-700 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <PlanBadge plan={sub.planType} />
                              <div>
                                <p className="text-gray-300 text-sm">
                                  {formatDate(sub.startDate)} - {formatDate(sub.endDate)}
                                </p>
                              </div>
                            </div>
                            <StatusBadge isActive={sub.isActive} />
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-400 text-center py-4">No subscription history</p>
                    )}
                  </div>
                </div>
              ) : (
                <p className="text-gray-400 text-center py-12">Failed to load user history</p>
              )}
            </div>

            <div className="p-4 border-t border-gray-800">
              <button
                onClick={() => {
                  setShowHistoryModal(false)
                  setSelectedSubscription(null)
                  dispatch(clearSelectedUserHistory())
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

export default Subscriptions
