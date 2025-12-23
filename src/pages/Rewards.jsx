import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
  Gift,
  TrendingUp,
  Users,
  Wallet,
  Calendar,
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  XCircle,
  Clock,
  Loader2,
  Play,
  Eye,
  Lock,
  Unlock,
  Trash2,
  AlertTriangle,
  X,
  RefreshCw,
  Award,
  Crown,
  Medal,
  Search,
  Plus,
  Edit3,
  Send,
  BarChart3,
  History,
  Info,
  Copy,
  ExternalLink
} from 'lucide-react'
import {
  fetchFormula,
  fetchRankings,
  setRankings,
  finalizeRanking,
  unfinalizeRanking,
  deleteRanking,
  fetchDistributionStatus,
  executeDistribution,
  fetchStats,
  fetchTransactions,
  fetchMonthlyBreakdown,
  setSelectedPeriod,
  setTransactionsPage,
  setTransactionsFilters,
  setBreakdownYear,
  clearError,
  clearSuccessMessage,
  clearDistributionPreview,
  clearDistributionResult
} from '../store/slices/rewardsDistributionSlice'

const CATEGORIES = [
  { id: 'trader', name: 'Traders', icon: TrendingUp, color: 'blue', description: 'Top spenders on minting' },
  { id: 'creator', name: 'Creators', icon: Award, color: 'purple', description: 'Highest revenue creators' },
  { id: 'influencer', name: 'Influencers', icon: Users, color: 'orange', description: 'Most followers & engagement' }
]

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
]

const Rewards = () => {
  const dispatch = useDispatch()
  const {
    selectedMonth,
    selectedYear,
    formula,
    formulaLoading,
    rankings,
    categoryStatus,
    readyForDistribution,
    rankingsLoading,
    rankingsActionLoading,
    distributionStatus,
    distributionStatusLoading,
    distributionPreview,
    distributionResult,
    distributionLoading,
    stats,
    statsLoading,
    transactions,
    transactionsSummary,
    transactionsPagination,
    transactionsFilters,
    transactionsLoading,
    monthlyBreakdown,
    breakdownYear,
    breakdownLoading,
    error,
    successMessage
  } = useSelector((state) => state.rewardsDistribution)

  const [activeTab, setActiveTab] = useState('overview')
  const [showRankingModal, setShowRankingModal] = useState(false)
  const [editingCategory, setEditingCategory] = useState(null)
  const [rankingForm, setRankingForm] = useState([])
  const [rankingNotes, setRankingNotes] = useState('')
  const [showConfirmModal, setShowConfirmModal] = useState(null)
  const [showPreviewModal, setShowPreviewModal] = useState(false)
  const [copiedAddress, setCopiedAddress] = useState(null)

  // Initial data fetch
  useEffect(() => {
    dispatch(fetchStats())
    dispatch(fetchFormula())
    dispatch(fetchMonthlyBreakdown(breakdownYear))
  }, [dispatch, breakdownYear])

  // Fetch rankings when period changes
  useEffect(() => {
    if (activeTab === 'rankings' || activeTab === 'distribution') {
      dispatch(fetchRankings({ month: selectedMonth, year: selectedYear }))
    }
  }, [dispatch, selectedMonth, selectedYear, activeTab])

  // Fetch distribution status
  useEffect(() => {
    if (activeTab === 'distribution') {
      dispatch(fetchDistributionStatus({ month: selectedMonth, year: selectedYear }))
    }
  }, [dispatch, selectedMonth, selectedYear, activeTab])

  // Fetch transactions
  useEffect(() => {
    if (activeTab === 'history') {
      dispatch(fetchTransactions({
        ...transactionsFilters,
        page: transactionsPagination.page,
        limit: transactionsPagination.limit
      }))
    }
  }, [dispatch, activeTab, transactionsFilters, transactionsPagination.page])

  // Clear success message after delay
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => {
        dispatch(clearSuccessMessage())
      }, 5000)
      return () => clearTimeout(timer)
    }
  }, [successMessage, dispatch])

  const formatXRP = (drops) => {
    if (!drops) return '0.00'
    const xrp = parseFloat(drops) / 1000000
    return xrp.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 6 })
  }

  const getMonthName = (month) => MONTHS[month - 1] || ''

  const getCategoryInfo = (categoryId) => {
    return CATEGORIES.find(c => c.id === categoryId) || CATEGORIES[0]
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'finalized': return 'text-green-400 bg-green-500/20'
      case 'draft': return 'text-yellow-400 bg-yellow-500/20'
      case 'distributed': return 'text-blue-400 bg-blue-500/20'
      case 'not_set': return 'text-gray-400 bg-gray-500/20'
      default: return 'text-gray-400 bg-gray-500/20'
    }
  }

  const getTransactionStatusBadge = (status) => {
    switch (status) {
      case 'completed': return 'badge-success'
      case 'pending': return 'bg-yellow-500/20 text-yellow-400'
      case 'processing': return 'bg-blue-500/20 text-blue-400'
      case 'failed': return 'bg-red-500/20 text-red-400'
      default: return 'bg-gray-500/20 text-gray-400'
    }
  }

  const getRankBadge = (rank) => {
    if (rank === 1) return <Crown className="w-5 h-5 text-yellow-400" />
    if (rank === 2) return <Medal className="w-5 h-5 text-gray-300" />
    if (rank === 3) return <Medal className="w-5 h-5 text-amber-600" />
    return <span className="w-5 h-5 flex items-center justify-center text-gray-400 text-sm font-bold">#{rank}</span>
  }

  const copyToClipboard = (text, id) => {
    navigator.clipboard.writeText(text)
    setCopiedAddress(id)
    setTimeout(() => setCopiedAddress(null), 2000)
  }

  // Period navigation
  const handlePrevMonth = () => {
    if (selectedMonth === 1) {
      dispatch(setSelectedPeriod({ month: 12, year: selectedYear - 1 }))
    } else {
      dispatch(setSelectedPeriod({ month: selectedMonth - 1, year: selectedYear }))
    }
  }

  const handleNextMonth = () => {
    const now = new Date()
    const currentMonth = now.getMonth() + 1
    const currentYear = now.getFullYear()

    if (selectedMonth === 12) {
      if (selectedYear < currentYear) {
        dispatch(setSelectedPeriod({ month: 1, year: selectedYear + 1 }))
      }
    } else if (selectedYear < currentYear || selectedMonth < currentMonth) {
      dispatch(setSelectedPeriod({ month: selectedMonth + 1, year: selectedYear }))
    }
  }

  // Ranking management
  const handleOpenRankingModal = (category) => {
    const existingRanking = rankings?.find(r => r.category === category)
    if (existingRanking?.rankings) {
      setRankingForm(existingRanking.rankings.map(r => ({
        rank: r.rank,
        walletAddress: r.walletAddress || ''
      })))
      setRankingNotes(existingRanking.notes || '')
    } else {
      setRankingForm(Array.from({ length: 10 }, (_, i) => ({ rank: i + 1, walletAddress: '' })))
      setRankingNotes('')
    }
    setEditingCategory(category)
    setShowRankingModal(true)
  }

  const handleSaveRankings = async () => {
    const validRankings = rankingForm.filter(r => r.walletAddress.trim())
    if (validRankings.length !== 10) {
      return
    }

    await dispatch(setRankings({
      month: selectedMonth,
      year: selectedYear,
      category: editingCategory,
      rankings: rankingForm,
      notes: rankingNotes
    }))
    setShowRankingModal(false)
    dispatch(fetchRankings({ month: selectedMonth, year: selectedYear }))
  }

  const handleFinalizeRanking = async (category) => {
    await dispatch(finalizeRanking({ month: selectedMonth, year: selectedYear, category }))
    dispatch(fetchRankings({ month: selectedMonth, year: selectedYear }))
    setShowConfirmModal(null)
  }

  const handleUnfinalizeRanking = async (category) => {
    await dispatch(unfinalizeRanking({ month: selectedMonth, year: selectedYear, category }))
    dispatch(fetchRankings({ month: selectedMonth, year: selectedYear }))
    setShowConfirmModal(null)
  }

  const handleDeleteRanking = async (category) => {
    await dispatch(deleteRanking({ year: selectedYear, month: selectedMonth, category }))
    dispatch(fetchRankings({ month: selectedMonth, year: selectedYear }))
    setShowConfirmModal(null)
  }

  // Distribution
  const handlePreviewDistribution = async () => {
    await dispatch(executeDistribution({ month: selectedMonth, year: selectedYear, dryRun: true }))
    setShowPreviewModal(true)
  }

  const handleExecuteDistribution = async () => {
    await dispatch(executeDistribution({ month: selectedMonth, year: selectedYear, dryRun: false }))
    setShowPreviewModal(false)
    dispatch(fetchDistributionStatus({ month: selectedMonth, year: selectedYear }))
    dispatch(fetchRankings({ month: selectedMonth, year: selectedYear }))
    dispatch(fetchStats())
  }

  const tabs = [
    { id: 'overview', name: 'Overview', icon: BarChart3 },
    { id: 'rankings', name: 'Rankings', icon: Award },
    { id: 'distribution', name: 'Distribution', icon: Send },
    { id: 'history', name: 'History', icon: History }
  ]

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-white flex items-center gap-3">
            <Gift className="w-6 h-6 text-primary-400" />
            Rewards Distribution
          </h2>
          <p className="text-gray-400 text-sm mt-1">Manage monthly rewards for top performers</p>
        </div>
      </div>

      {/* Error/Success Messages */}
      {error && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 flex items-center justify-between">
          <span className="text-red-400">{error}</span>
          <button onClick={() => dispatch(clearError())} className="text-red-400 hover:text-red-300">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {successMessage && (
        <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/30 flex items-center gap-2">
          <CheckCircle className="w-5 h-5 text-green-400" />
          <span className="text-green-400">{successMessage}</span>
        </div>
      )}

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 p-1 bg-dark-300 rounded-xl">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
              activeTab === tab.id
                ? 'bg-primary-500 text-white'
                : 'text-gray-400 hover:text-white hover:bg-dark-200'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.name}
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="stat-card">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-purple-500 flex items-center justify-center">
                  <Gift className="w-5 h-5 text-white" />
                </div>
                <span className="text-gray-400 text-sm">All Time Distributed</span>
              </div>
              {statsLoading ? (
                <div className="h-8 bg-dark-300 rounded animate-pulse"></div>
              ) : (
                <>
                  <p className="text-2xl font-bold text-white">
                    {stats?.allTime?.totalRewardsXrp || formatXRP(stats?.allTime?.totalRewardsDrops) || '0'} <span className="text-gray-400 text-sm font-normal">XRP</span>
                  </p>
                  <p className="text-gray-500 text-xs mt-1">
                    {stats?.allTime?.totalTransactions || 0} transactions
                  </p>
                </>
              )}
            </div>

            <div className="stat-card">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-green-500/20 flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-green-400" />
                </div>
                <span className="text-gray-400 text-sm">This Month</span>
              </div>
              {statsLoading ? (
                <div className="h-8 bg-dark-300 rounded animate-pulse"></div>
              ) : (
                <>
                  <p className="text-2xl font-bold text-white">
                    {stats?.thisMonth?.totalRewardsXrp || formatXRP(stats?.thisMonth?.totalRewardsDrops) || '0'} <span className="text-gray-400 text-sm font-normal">XRP</span>
                  </p>
                  <p className="text-gray-500 text-xs mt-1">
                    {getMonthName(stats?.thisMonth?.month)} {stats?.thisMonth?.year}
                  </p>
                </>
              )}
            </div>

            <div className="stat-card">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center">
                  <Users className="w-5 h-5 text-blue-400" />
                </div>
                <span className="text-gray-400 text-sm">Unique Recipients</span>
              </div>
              {statsLoading ? (
                <div className="h-8 bg-dark-300 rounded animate-pulse"></div>
              ) : (
                <p className="text-2xl font-bold text-white">{stats?.allTime?.uniqueRecipients || 0}</p>
              )}
            </div>

            <div className="stat-card">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-orange-500/20 flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5 text-orange-400" />
                </div>
                <span className="text-gray-400 text-sm">Pending/Failed</span>
              </div>
              {statsLoading ? (
                <div className="h-8 bg-dark-300 rounded animate-pulse"></div>
              ) : (
                <div className="flex items-center gap-3">
                  <span className="text-2xl font-bold text-yellow-400">{stats?.status?.pending || 0}</span>
                  <span className="text-gray-500">/</span>
                  <span className="text-2xl font-bold text-red-400">{stats?.status?.failed || 0}</span>
                </div>
              )}
            </div>
          </div>

          {/* Category Breakdown */}
          <div className="p-6 rounded-xl bg-dark-200 border border-gray-800">
            <h3 className="text-lg font-semibold text-white mb-4">Category Breakdown (All Time)</h3>
            {statsLoading ? (
              <div className="flex items-center justify-center h-32">
                <Loader2 className="w-8 h-8 text-primary-500 animate-spin" />
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {CATEGORIES.map(category => {
                  const data = stats?.categoryBreakdown?.[category.id]
                  return (
                    <div key={category.id} className="p-4 rounded-xl bg-dark-300">
                      <div className="flex items-center gap-3 mb-3">
                        <div className={`w-10 h-10 rounded-xl bg-${category.color}-500/20 flex items-center justify-center`}>
                          <category.icon className={`w-5 h-5 text-${category.color}-400`} />
                        </div>
                        <div>
                          <h4 className="text-white font-medium">{category.name}</h4>
                          <p className="text-gray-500 text-xs">{category.description}</p>
                        </div>
                      </div>
                      <p className="text-xl font-bold text-white">
                        {data?.totalAmountXrp || formatXRP(data?.totalAmount) || '0'} <span className="text-gray-400 text-sm font-normal">XRP</span>
                      </p>
                      <p className="text-gray-500 text-xs mt-1">{data?.totalTransactions || 0} transactions</p>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* Monthly Breakdown Chart */}
          <div className="p-6 rounded-xl bg-dark-200 border border-gray-800">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-white">Monthly Distribution ({breakdownYear})</h3>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => dispatch(setBreakdownYear(breakdownYear - 1))}
                  className="p-2 rounded-lg hover:bg-dark-300 text-gray-400 hover:text-white"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <span className="text-white font-medium px-3">{breakdownYear}</span>
                <button
                  onClick={() => dispatch(setBreakdownYear(breakdownYear + 1))}
                  disabled={breakdownYear >= new Date().getFullYear()}
                  className="p-2 rounded-lg hover:bg-dark-300 text-gray-400 hover:text-white disabled:opacity-50"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>

            {breakdownLoading ? (
              <div className="flex items-center justify-center h-48">
                <Loader2 className="w-8 h-8 text-primary-500 animate-spin" />
              </div>
            ) : (
              <div className="space-y-4">
                {/* Year Total */}
                {monthlyBreakdown?.yearTotal && (
                  <div className="p-4 rounded-xl bg-gradient-to-r from-primary-500/10 to-purple-500/10 border border-primary-500/20">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-300">Year Total</span>
                      <div className="text-right">
                        <p className="text-xl font-bold text-white">
                          {monthlyBreakdown.yearTotal.amountXrp || formatXRP(monthlyBreakdown.yearTotal.amount)} XRP
                        </p>
                        <p className="text-gray-400 text-sm">{monthlyBreakdown.yearTotal.transactions} transactions</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Monthly Grid */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                  {monthlyBreakdown?.monthlyBreakdown?.map((monthData) => {
                    const hasData = monthData.total && parseFloat(monthData.total.amount) > 0
                    const isDistributed = monthlyBreakdown?.distributionStatus?.[monthData.month]?.distributed
                    return (
                      <div
                        key={monthData.month}
                        className={`p-3 rounded-lg ${hasData ? 'bg-dark-300' : 'bg-dark-400 opacity-50'}`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-gray-400 text-sm">{monthData.monthName}</span>
                          {isDistributed && (
                            <CheckCircle className="w-4 h-4 text-green-400" />
                          )}
                        </div>
                        <p className={`font-semibold ${hasData ? 'text-white' : 'text-gray-600'}`}>
                          {hasData ? `${monthData.total.amountXrp || formatXRP(monthData.total.amount)} XRP` : '--'}
                        </p>
                        {hasData && (
                          <p className="text-gray-500 text-xs mt-1">{monthData.total.transactions} txns</p>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Formula Info */}
          {formula && (
            <div className="p-6 rounded-xl bg-dark-200 border border-gray-800">
              <div className="flex items-center gap-3 mb-4">
                <Info className="w-5 h-5 text-primary-400" />
                <h3 className="text-lg font-semibold text-white">Distribution Formula</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-gray-300 font-medium mb-2">Category Allocation</h4>
                  <p className="text-gray-400 text-sm">{formula.formula?.categoryAllocation}</p>
                </div>
                <div>
                  <h4 className="text-gray-300 font-medium mb-2">Rank Distribution</h4>
                  <div className="space-y-1">
                    {Object.entries(formula.formula?.rankDistribution || {}).map(([rank, percentage]) => (
                      <div key={rank} className="flex items-center justify-between text-sm">
                        <span className="text-gray-400">{rank}</span>
                        <span className="text-white">{percentage}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Rankings Tab */}
      {activeTab === 'rankings' && (
        <div className="space-y-6">
          {/* Period Selector */}
          <div className="flex items-center justify-between p-4 rounded-xl bg-dark-200 border border-gray-800">
            <button
              onClick={handlePrevMonth}
              className="p-2 rounded-lg hover:bg-dark-300 text-gray-400 hover:text-white"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div className="text-center">
              <h3 className="text-lg font-semibold text-white">
                {getMonthName(selectedMonth)} {selectedYear}
              </h3>
              <p className="text-gray-400 text-sm">
                {readyForDistribution ? (
                  <span className="text-green-400">Ready for distribution</span>
                ) : (
                  'Configure rankings below'
                )}
              </p>
            </div>
            <button
              onClick={handleNextMonth}
              className="p-2 rounded-lg hover:bg-dark-300 text-gray-400 hover:text-white"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          {/* Category Rankings */}
          {rankingsLoading ? (
            <div className="flex items-center justify-center h-48">
              <Loader2 className="w-8 h-8 text-primary-500 animate-spin" />
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {CATEGORIES.map(category => {
                const status = categoryStatus?.[category.id]
                const ranking = rankings?.find(r => r.category === category.id)
                const isFinalized = status?.status === 'finalized'
                const isDistributed = status?.status === 'distributed'

                return (
                  <div key={category.id} className="p-6 rounded-xl bg-dark-200 border border-gray-800">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl bg-${category.color}-500/20 flex items-center justify-center`}>
                          <category.icon className={`w-5 h-5 text-${category.color}-400`} />
                        </div>
                        <div>
                          <h4 className="text-white font-medium">{category.name}</h4>
                          <span className={`badge text-xs ${getStatusColor(status?.status || 'not_set')}`}>
                            {status?.status || 'not_set'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Rankings List */}
                    {ranking?.rankings && ranking.rankings.length > 0 ? (
                      <div className="space-y-2 mb-4">
                        {ranking.rankings.slice(0, 5).map((r) => (
                          <div key={r.rank} className="flex items-center gap-3 p-2 rounded-lg bg-dark-300">
                            {getRankBadge(r.rank)}
                            <div className="flex-1 min-w-0">
                              <p className="text-white text-sm truncate">
                                {r.username || r.walletAddress?.slice(0, 12) + '...'}
                              </p>
                            </div>
                            {r.isVerified && (
                              <CheckCircle className="w-4 h-4 text-blue-400 flex-shrink-0" />
                            )}
                          </div>
                        ))}
                        {ranking.rankings.length > 5 && (
                          <p className="text-gray-500 text-xs text-center">
                            +{ranking.rankings.length - 5} more
                          </p>
                        )}
                      </div>
                    ) : (
                      <div className="p-8 text-center mb-4">
                        <Users className="w-10 h-10 text-gray-600 mx-auto mb-2" />
                        <p className="text-gray-400 text-sm">No rankings set</p>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex flex-wrap gap-2">
                      {!isDistributed && (
                        <>
                          <button
                            onClick={() => handleOpenRankingModal(category.id)}
                            disabled={isFinalized || rankingsActionLoading}
                            className="btn-secondary flex-1 flex items-center justify-center gap-2 text-sm"
                          >
                            {ranking ? <Edit3 className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                            {ranking ? 'Edit' : 'Set'}
                          </button>

                          {ranking && !isFinalized && (
                            <button
                              onClick={() => setShowConfirmModal({ type: 'finalize', category: category.id })}
                              disabled={rankingsActionLoading}
                              className="btn-primary flex-1 flex items-center justify-center gap-2 text-sm"
                            >
                              <Lock className="w-4 h-4" />
                              Finalize
                            </button>
                          )}

                          {isFinalized && (
                            <button
                              onClick={() => setShowConfirmModal({ type: 'unfinalize', category: category.id })}
                              disabled={rankingsActionLoading}
                              className="btn-secondary flex-1 flex items-center justify-center gap-2 text-sm"
                            >
                              <Unlock className="w-4 h-4" />
                              Unlock
                            </button>
                          )}

                          {ranking && !isFinalized && (
                            <button
                              onClick={() => setShowConfirmModal({ type: 'delete', category: category.id })}
                              disabled={rankingsActionLoading}
                              className="p-2 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </>
                      )}

                      {isDistributed && (
                        <div className="w-full p-2 rounded-lg bg-green-500/10 text-center">
                          <span className="text-green-400 text-sm flex items-center justify-center gap-2">
                            <CheckCircle className="w-4 h-4" />
                            Distributed
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}

      {/* Distribution Tab */}
      {activeTab === 'distribution' && (
        <div className="space-y-6">
          {/* Period Selector */}
          <div className="flex items-center justify-between p-4 rounded-xl bg-dark-200 border border-gray-800">
            <button
              onClick={handlePrevMonth}
              className="p-2 rounded-lg hover:bg-dark-300 text-gray-400 hover:text-white"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div className="text-center">
              <h3 className="text-lg font-semibold text-white">
                {getMonthName(selectedMonth)} {selectedYear}
              </h3>
            </div>
            <button
              onClick={handleNextMonth}
              className="p-2 rounded-lg hover:bg-dark-300 text-gray-400 hover:text-white"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          {distributionStatusLoading ? (
            <div className="flex items-center justify-center h-48">
              <Loader2 className="w-8 h-8 text-primary-500 animate-spin" />
            </div>
          ) : (
            <>
              {/* Treasury Status */}
              {distributionStatus?.treasury && (
                <div className="p-6 rounded-xl bg-dark-200 border border-gray-800">
                  <div className="flex items-center gap-3 mb-4">
                    <Wallet className="w-5 h-5 text-orange-400" />
                    <h3 className="text-lg font-semibold text-white">Treasury Wallet</h3>
                    {distributionStatus.treasury.configured ? (
                      <span className="badge badge-success">Configured</span>
                    ) : (
                      <span className="badge bg-red-500/20 text-red-400">Not Configured</span>
                    )}
                  </div>
                  {distributionStatus.treasury.configured && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-gray-400 text-sm">Address</p>
                        <div className="flex items-center gap-2 mt-1">
                          <code className="text-white bg-dark-400 px-3 py-2 rounded-lg font-mono text-sm flex-1 truncate">
                            {distributionStatus.treasury.address}
                          </code>
                          <button
                            onClick={() => copyToClipboard(distributionStatus.treasury.address, 'treasury-dist')}
                            className="p-2 rounded-lg bg-dark-400 hover:bg-dark-300 text-gray-400"
                          >
                            {copiedAddress === 'treasury-dist' ? (
                              <CheckCircle className="w-4 h-4 text-green-400" />
                            ) : (
                              <Copy className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                      </div>
                      <div>
                        <p className="text-gray-400 text-sm">Balance</p>
                        <p className="text-2xl font-bold text-white mt-1">
                          {distributionStatus.treasury.balanceXrp || formatXRP(distributionStatus.treasury.balance)} XRP
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Requirements */}
              <div className="p-6 rounded-xl bg-dark-200 border border-gray-800">
                <h3 className="text-lg font-semibold text-white mb-4">Distribution Requirements</h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    {distributionStatus?.requirements?.treasuryConfigured ? (
                      <CheckCircle className="w-5 h-5 text-green-400" />
                    ) : (
                      <XCircle className="w-5 h-5 text-red-400" />
                    )}
                    <span className="text-gray-300">Treasury wallet configured</span>
                  </div>
                  <div className="flex items-center gap-3">
                    {distributionStatus?.requirements?.allCategoriesFinalized ? (
                      <CheckCircle className="w-5 h-5 text-green-400" />
                    ) : (
                      <XCircle className="w-5 h-5 text-red-400" />
                    )}
                    <span className="text-gray-300">All category rankings finalized</span>
                  </div>
                  <div className="flex items-center gap-3">
                    {distributionStatus?.requirements?.notYetDistributed ? (
                      <CheckCircle className="w-5 h-5 text-green-400" />
                    ) : (
                      <XCircle className="w-5 h-5 text-yellow-400" />
                    )}
                    <span className="text-gray-300">
                      {distributionStatus?.requirements?.notYetDistributed
                        ? 'Not yet distributed'
                        : 'Already distributed for this period'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Expected Distribution */}
              {distributionStatus?.expectedDistribution && distributionStatus?.readyForDistribution && (
                <div className="p-6 rounded-xl bg-dark-200 border border-gray-800">
                  <h3 className="text-lg font-semibold text-white mb-4">Expected Distribution</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div className="p-4 rounded-xl bg-dark-300">
                      <p className="text-gray-400 text-sm">Total to Distribute</p>
                      <p className="text-2xl font-bold text-white">{distributionStatus.expectedDistribution.totalBalance}</p>
                    </div>
                    <div className="p-4 rounded-xl bg-dark-300">
                      <p className="text-gray-400 text-sm">Per Category</p>
                      <p className="text-2xl font-bold text-white">{distributionStatus.expectedDistribution.perCategory}</p>
                    </div>
                  </div>

                  <h4 className="text-gray-300 font-medium mb-3">Breakdown by Rank</h4>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                    {Object.entries(distributionStatus.expectedDistribution.breakdown || {}).slice(0, 10).map(([rank, data]) => (
                      <div key={rank} className="p-3 rounded-lg bg-dark-300 text-center">
                        <p className="text-gray-400 text-xs capitalize">{rank.replace('rank', 'Rank ')}</p>
                        <p className="text-white font-semibold text-sm">{data.amount}</p>
                        <p className="text-gray-500 text-xs">{data.percentage}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Distribution Actions */}
              <div className="flex justify-center gap-4">
                <button
                  onClick={handlePreviewDistribution}
                  disabled={!distributionStatus?.readyForDistribution || distributionLoading}
                  className="btn-secondary flex items-center gap-2"
                >
                  {distributionLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                  Preview Distribution
                </button>
                <button
                  onClick={() => setShowPreviewModal(true)}
                  disabled={!distributionStatus?.readyForDistribution || distributionLoading}
                  className="btn-primary flex items-center gap-2"
                >
                  {distributionLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                  Execute Distribution
                </button>
              </div>

              {/* Already Distributed Notice */}
              {distributionStatus?.alreadyDistributed && (
                <div className="p-6 rounded-xl bg-green-500/10 border border-green-500/30 text-center">
                  <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-3" />
                  <h3 className="text-lg font-semibold text-green-400 mb-2">Distribution Complete</h3>
                  <p className="text-gray-400">
                    Rewards for {getMonthName(selectedMonth)} {selectedYear} have already been distributed.
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* History Tab */}
      {activeTab === 'history' && (
        <div className="space-y-6">
          {/* Filters */}
          <div className="flex flex-wrap gap-3 p-4 rounded-xl bg-dark-200 border border-gray-800">
            <select
              value={transactionsFilters.category || ''}
              onChange={(e) => dispatch(setTransactionsFilters({ category: e.target.value || undefined }))}
              className="input-field w-40"
            >
              <option value="">All Categories</option>
              <option value="trader">Traders</option>
              <option value="creator">Creators</option>
              <option value="influencer">Influencers</option>
            </select>

            <select
              value={transactionsFilters.status || ''}
              onChange={(e) => dispatch(setTransactionsFilters({ status: e.target.value || undefined }))}
              className="input-field w-36"
            >
              <option value="">All Status</option>
              <option value="completed">Completed</option>
              <option value="pending">Pending</option>
              <option value="processing">Processing</option>
              <option value="failed">Failed</option>
            </select>

            <select
              value={transactionsFilters.month || ''}
              onChange={(e) => dispatch(setTransactionsFilters({ month: e.target.value ? parseInt(e.target.value) : undefined }))}
              className="input-field w-36"
            >
              <option value="">All Months</option>
              {MONTHS.map((name, i) => (
                <option key={i} value={i + 1}>{name}</option>
              ))}
            </select>

            <select
              value={transactionsFilters.year || ''}
              onChange={(e) => dispatch(setTransactionsFilters({ year: e.target.value ? parseInt(e.target.value) : undefined }))}
              className="input-field w-28"
            >
              <option value="">All Years</option>
              {[2024, 2025, 2026].map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>

          {/* Summary */}
          {transactionsSummary && (
            <div className="p-4 rounded-xl bg-dark-200 border border-gray-800 flex items-center justify-between">
              <span className="text-gray-400">
                Total: {transactionsSummary.totalAmountXrp || formatXRP(transactionsSummary.totalAmount)} XRP
              </span>
              <span className="text-gray-400">
                {transactionsSummary.totalTransactions} transactions
              </span>
            </div>
          )}

          {/* Transactions List */}
          {transactionsLoading ? (
            <div className="flex items-center justify-center h-48">
              <Loader2 className="w-8 h-8 text-primary-500 animate-spin" />
            </div>
          ) : transactions.length === 0 ? (
            <div className="p-12 text-center rounded-xl bg-dark-200 border border-gray-800">
              <History className="w-12 h-12 text-gray-600 mx-auto mb-3" />
              <p className="text-gray-400">No transactions found</p>
            </div>
          ) : (
            <div className="rounded-xl bg-dark-200 border border-gray-800 overflow-hidden">
              <div className="divide-y divide-gray-800">
                {transactions.map((tx) => (
                  <div key={tx.id} className="p-4 flex items-center gap-4 hover:bg-dark-300 transition-colors">
                    {/* Rank Badge */}
                    <div className="flex-shrink-0">
                      {getRankBadge(tx.rank)}
                    </div>

                    {/* Recipient */}
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      {tx.recipient?.profileImage ? (
                        <img
                          src={tx.recipient.profileImage}
                          alt=""
                          className="w-10 h-10 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-dark-400 flex items-center justify-center">
                          <Wallet className="w-5 h-5 text-gray-500" />
                        </div>
                      )}
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-white font-medium truncate">
                            {tx.recipient?.username || tx.recipientWallet?.slice(0, 12) + '...'}
                          </span>
                          {tx.recipient?.isVerified && (
                            <CheckCircle className="w-4 h-4 text-blue-400 flex-shrink-0" />
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <span className={`badge ${getStatusColor(tx.category === 'trader' ? 'finalized' : tx.category === 'creator' ? 'draft' : 'distributed').replace('text-', '').replace('-400', '-400 bg-').replace('bg-bg', 'bg')}`}>
                            {tx.category}
                          </span>
                          <span>{getMonthName(tx.periodMonth)} {tx.periodYear}</span>
                        </div>
                      </div>
                    </div>

                    {/* Amount */}
                    <div className="text-right flex-shrink-0">
                      <p className="text-white font-semibold">
                        {tx.rewardAmountXrp || formatXRP(tx.rewardAmount)} XRP
                      </p>
                      <span className={`badge text-xs ${getTransactionStatusBadge(tx.transactionStatus)}`}>
                        {tx.transactionStatus}
                      </span>
                    </div>

                    {/* Transaction Link */}
                    {tx.transactionHash && (
                      <a
                        href={`https://xrpscan.com/tx/${tx.transactionHash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 rounded-lg hover:bg-dark-400 text-gray-400 hover:text-white"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    )}
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {transactionsPagination.totalPages > 1 && (
                <div className="flex items-center justify-between px-4 py-3 border-t border-gray-800">
                  <p className="text-gray-400 text-sm">
                    Page {transactionsPagination.page} of {transactionsPagination.totalPages}
                  </p>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => dispatch(setTransactionsPage(transactionsPagination.page - 1))}
                      disabled={transactionsPagination.page === 1}
                      className="p-2 rounded-lg hover:bg-dark-300 disabled:opacity-50 text-gray-400"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => dispatch(setTransactionsPage(transactionsPagination.page + 1))}
                      disabled={transactionsPagination.page >= transactionsPagination.totalPages}
                      className="p-2 rounded-lg hover:bg-dark-300 disabled:opacity-50 text-gray-400"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Set Rankings Modal */}
      {showRankingModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70" onClick={() => setShowRankingModal(false)} />
          <div className="relative w-full max-w-2xl bg-dark-300 rounded-2xl border border-gray-800 overflow-hidden animate-fade-in">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800">
              <div className="flex items-center gap-3">
                <Award className="w-5 h-5 text-primary-400" />
                <h3 className="text-lg font-semibold text-white">
                  Set {getCategoryInfo(editingCategory).name} Rankings
                </h3>
              </div>
              <button
                onClick={() => setShowRankingModal(false)}
                className="p-2 rounded-lg hover:bg-dark-200 text-gray-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 max-h-[60vh] overflow-y-auto">
              <p className="text-gray-400 text-sm mb-4">
                Enter wallet addresses for each rank position. All 10 positions must be filled.
              </p>

              <div className="space-y-3">
                {rankingForm.map((item, index) => (
                  <div key={item.rank} className="flex items-center gap-3">
                    <div className="w-10 flex-shrink-0">
                      {getRankBadge(item.rank)}
                    </div>
                    <input
                      type="text"
                      value={item.walletAddress}
                      onChange={(e) => {
                        const newForm = [...rankingForm]
                        newForm[index].walletAddress = e.target.value
                        setRankingForm(newForm)
                      }}
                      placeholder={`Wallet address for rank ${item.rank}`}
                      className="input-field flex-1 font-mono text-sm"
                    />
                  </div>
                ))}
              </div>

              <div className="mt-4">
                <label className="block text-gray-300 text-sm font-medium mb-2">Notes (optional)</label>
                <textarea
                  value={rankingNotes}
                  onChange={(e) => setRankingNotes(e.target.value)}
                  placeholder="e.g., Based on trading volume for the month..."
                  className="input-field w-full h-20 resize-none"
                />
              </div>
            </div>

            <div className="flex items-center gap-3 px-6 py-4 border-t border-gray-800">
              <button
                onClick={() => setShowRankingModal(false)}
                className="btn-secondary flex-1"
                disabled={rankingsActionLoading}
              >
                Cancel
              </button>
              <button
                onClick={handleSaveRankings}
                disabled={rankingsActionLoading || rankingForm.filter(r => r.walletAddress.trim()).length !== 10}
                className="btn-primary flex-1"
              >
                {rankingsActionLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin mx-auto" />
                ) : (
                  'Save Rankings'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirm Action Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70" onClick={() => setShowConfirmModal(null)} />
          <div className="relative w-full max-w-md bg-dark-300 rounded-2xl border border-gray-800 p-6 animate-fade-in">
            <div className="flex items-center gap-4 mb-4">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                showConfirmModal.type === 'delete' ? 'bg-red-500/20' :
                showConfirmModal.type === 'finalize' ? 'bg-green-500/20' : 'bg-yellow-500/20'
              }`}>
                {showConfirmModal.type === 'delete' ? (
                  <Trash2 className="w-6 h-6 text-red-400" />
                ) : showConfirmModal.type === 'finalize' ? (
                  <Lock className="w-6 h-6 text-green-400" />
                ) : (
                  <Unlock className="w-6 h-6 text-yellow-400" />
                )}
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white capitalize">
                  {showConfirmModal.type} Ranking
                </h3>
                <p className="text-gray-400 text-sm">
                  {getCategoryInfo(showConfirmModal.category).name}
                </p>
              </div>
            </div>

            <p className="text-gray-300 mb-6">
              {showConfirmModal.type === 'delete' && 'This will permanently delete the ranking. This action cannot be undone.'}
              {showConfirmModal.type === 'finalize' && 'This will lock the ranking for distribution. You can unfinalize it later if needed.'}
              {showConfirmModal.type === 'unfinalize' && 'This will unlock the ranking for editing. The status will be reset to draft.'}
            </p>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowConfirmModal(null)}
                className="btn-secondary flex-1"
                disabled={rankingsActionLoading}
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (showConfirmModal.type === 'delete') {
                    handleDeleteRanking(showConfirmModal.category)
                  } else if (showConfirmModal.type === 'finalize') {
                    handleFinalizeRanking(showConfirmModal.category)
                  } else {
                    handleUnfinalizeRanking(showConfirmModal.category)
                  }
                }}
                disabled={rankingsActionLoading}
                className={showConfirmModal.type === 'delete' ? 'btn-danger flex-1' : 'btn-primary flex-1'}
              >
                {rankingsActionLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin mx-auto" />
                ) : (
                  `Confirm ${showConfirmModal.type}`
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Distribution Preview/Execute Modal */}
      {showPreviewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70" onClick={() => {
            setShowPreviewModal(false)
            dispatch(clearDistributionPreview())
          }} />
          <div className="relative w-full max-w-3xl bg-dark-300 rounded-2xl border border-gray-800 overflow-hidden animate-fade-in">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800">
              <div className="flex items-center gap-3">
                <Send className="w-5 h-5 text-primary-400" />
                <h3 className="text-lg font-semibold text-white">
                  {distributionResult ? 'Distribution Complete' : 'Confirm Distribution'}
                </h3>
              </div>
              <button
                onClick={() => {
                  setShowPreviewModal(false)
                  dispatch(clearDistributionPreview())
                  dispatch(clearDistributionResult())
                }}
                className="p-2 rounded-lg hover:bg-dark-200 text-gray-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 max-h-[60vh] overflow-y-auto">
              {distributionResult ? (
                <div className="space-y-4">
                  <div className="p-6 rounded-xl bg-green-500/10 border border-green-500/30 text-center">
                    <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
                    <h4 className="text-xl font-bold text-white mb-2">Distribution Successful!</h4>
                    <p className="text-gray-400">
                      Successfully distributed rewards to {distributionResult.results?.successful?.length || 0} recipients
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 rounded-xl bg-dark-400">
                      <p className="text-gray-400 text-sm">Total Distributed</p>
                      <p className="text-xl font-bold text-white">{distributionResult.results?.totalDistributed}</p>
                    </div>
                    <div className="p-4 rounded-xl bg-dark-400">
                      <p className="text-gray-400 text-sm">Success Rate</p>
                      <p className="text-xl font-bold text-green-400">{distributionResult.results?.successRate}</p>
                    </div>
                  </div>
                </div>
              ) : distributionPreview ? (
                <div className="space-y-4">
                  <div className="p-4 rounded-xl bg-yellow-500/10 border border-yellow-500/30">
                    <div className="flex items-start gap-3">
                      <AlertTriangle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-yellow-400 font-medium">Review Before Executing</p>
                        <p className="text-yellow-400/80 text-sm mt-1">
                          This action will send XRP to {distributionPreview.summary?.totalRecipients} recipients. This cannot be undone.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 rounded-xl bg-dark-400">
                      <p className="text-gray-400 text-sm">Total to Distribute</p>
                      <p className="text-xl font-bold text-white">{distributionPreview.summary?.totalToDistribute}</p>
                    </div>
                    <div className="p-4 rounded-xl bg-dark-400">
                      <p className="text-gray-400 text-sm">Recipients</p>
                      <p className="text-xl font-bold text-white">{distributionPreview.summary?.totalRecipients}</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h4 className="text-gray-300 font-medium">By Category</h4>
                    {distributionPreview.summary?.perCategory?.map((cat) => (
                      <div key={cat.category} className="flex items-center justify-between p-3 rounded-lg bg-dark-400">
                        <span className="text-gray-300 capitalize">{cat.category}s</span>
                        <span className="text-white">{cat.allocation} ({cat.recipients} recipients)</span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center h-48">
                  <Loader2 className="w-8 h-8 text-primary-500 animate-spin" />
                </div>
              )}
            </div>

            <div className="flex items-center gap-3 px-6 py-4 border-t border-gray-800">
              <button
                onClick={() => {
                  setShowPreviewModal(false)
                  dispatch(clearDistributionPreview())
                  dispatch(clearDistributionResult())
                }}
                className="btn-secondary flex-1"
                disabled={distributionLoading}
              >
                {distributionResult ? 'Close' : 'Cancel'}
              </button>
              {!distributionResult && (
                <button
                  onClick={handleExecuteDistribution}
                  disabled={distributionLoading || !distributionPreview}
                  className="btn-primary flex-1 flex items-center justify-center gap-2"
                >
                  {distributionLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      Execute Distribution
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Rewards
