import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
  Layers,
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  Play,
  Pause,
  Trash2,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  TrendingUp,
  DollarSign,
  Users,
  Loader2
} from 'lucide-react'
import {
  fetchDrops,
  fetchDropStatistics,
  setFilters,
  setPage,
  pauseDrop,
  resumeDrop,
  updateFeesStatus
} from '../store/slices/dropsSlice'

const Drops = () => {
  const dispatch = useDispatch()
  const { drops, statistics, pagination, filters, loading, statsLoading, actionLoading } = useSelector((state) => state.drops)
  const [searchTerm, setSearchTerm] = useState('')
  const [showFilters, setShowFilters] = useState(false)

  useEffect(() => {
    dispatch(fetchDrops(filters))
    dispatch(fetchDropStatistics())
  }, [dispatch, filters, pagination.page])

  const handleSearch = (e) => {
    e.preventDefault()
    dispatch(setFilters({ search: searchTerm }))
  }

  const handleStatusFilter = (status) => {
    dispatch(setFilters({ status: status === 'all' ? undefined : status }))
  }

  const handleFeesFilter = (feesStatus) => {
    dispatch(setFilters({ platformFeesStatus: feesStatus === 'all' ? undefined : feesStatus }))
  }

  const handlePauseDrop = (dropId) => {
    if (confirm('Are you sure you want to pause this drop?')) {
      dispatch(pauseDrop({ dropId, reason: 'Admin paused' }))
    }
  }

  const handleResumeDrop = (dropId) => {
    dispatch(resumeDrop({ dropId, status: 'active', enableMinting: true, reason: 'Admin resumed' }))
  }

  const handleMarkPaid = (dropId) => {
    const txHash = prompt('Enter transaction hash:')
    if (txHash) {
      dispatch(updateFeesStatus({ dropId, platformFeesStatus: 'paid', transactionHash: txHash, reason: 'Manually marked as paid' }))
    }
  }

  const getStatusBadge = (status) => {
    const badges = {
      active: { color: 'bg-green-500/20 text-green-400', icon: Play },
      paused: { color: 'bg-yellow-500/20 text-yellow-400', icon: Pause },
      draft: { color: 'bg-gray-500/20 text-gray-400', icon: Clock },
      ended: { color: 'bg-blue-500/20 text-blue-400', icon: CheckCircle },
      sold_out: { color: 'bg-purple-500/20 text-purple-400', icon: TrendingUp }
    }
    const badge = badges[status] || badges.draft
    const Icon = badge.icon
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${badge.color}`}>
        <Icon className="w-3 h-3" />
        {status?.replace('_', ' ')}
      </span>
    )
  }

  const getFeesBadge = (status) => {
    const badges = {
      paid: { color: 'bg-green-500/20 text-green-400', icon: CheckCircle },
      pending: { color: 'bg-yellow-500/20 text-yellow-400', icon: Clock },
      failed: { color: 'bg-red-500/20 text-red-400', icon: XCircle },
      refunded: { color: 'bg-blue-500/20 text-blue-400', icon: AlertCircle }
    }
    const badge = badges[status] || badges.pending
    const Icon = badge.icon
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${badge.color}`}>
        <Icon className="w-3 h-3" />
        {status}
      </span>
    )
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary-500/20 flex items-center justify-center">
              <Layers className="w-5 h-5 text-primary-400" />
            </div>
            <div>
              <p className="text-gray-400 text-sm">Total Drops</p>
              <p className="text-xl font-bold text-white">{statistics.totalDrops}</p>
            </div>
          </div>
        </div>
        <div className="glass rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center">
              <Play className="w-5 h-5 text-green-400" />
            </div>
            <div>
              <p className="text-gray-400 text-sm">Active</p>
              <p className="text-xl font-bold text-white">{statistics.statusBreakdown?.active || 0}</p>
            </div>
          </div>
        </div>
        <div className="glass rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
              <Users className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <p className="text-gray-400 text-sm">Total Mints</p>
              <p className="text-xl font-bold text-white">{statistics.totalMints}</p>
            </div>
          </div>
        </div>
        <div className="glass rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-yellow-500/20 flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-yellow-400" />
            </div>
            <div>
              <p className="text-gray-400 text-sm">Platform Fees</p>
              <p className="text-xl font-bold text-white">{statistics.totalPlatformFeesCollectedXrp || '0'} XRP</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="glass rounded-xl p-4">
        <div className="flex flex-col lg:flex-row gap-4">
          <form onSubmit={handleSearch} className="flex-1 flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search drops..."
                className="w-full pl-10 pr-4 py-2 bg-dark-300 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-primary-500"
              />
            </div>
            <button type="submit" className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600">
              Search
            </button>
          </form>

          <div className="flex gap-2 flex-wrap">
            <select
              value={filters.status || 'all'}
              onChange={(e) => handleStatusFilter(e.target.value)}
              className="px-3 py-2 bg-dark-300 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-primary-500"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="paused">Paused</option>
              <option value="draft">Draft</option>
              <option value="ended">Ended</option>
              <option value="sold_out">Sold Out</option>
            </select>

            <select
              value={filters.platformFeesStatus || 'all'}
              onChange={(e) => handleFeesFilter(e.target.value)}
              className="px-3 py-2 bg-dark-300 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-primary-500"
            >
              <option value="all">All Fees Status</option>
              <option value="paid">Paid</option>
              <option value="pending">Pending</option>
              <option value="failed">Failed</option>
            </select>
          </div>
        </div>
      </div>

      {/* Drops Table */}
      <div className="glass rounded-xl overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center p-12">
            <Loader2 className="w-8 h-8 text-primary-500 animate-spin" />
          </div>
        ) : drops.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 text-gray-400">
            <Layers className="w-12 h-12 mb-4" />
            <p>No drops found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-dark-300">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Drop</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Creator</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Status</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Progress</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Fees</th>
                  <th className="px-4 py-3 text-right text-sm font-medium text-gray-400">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {drops.map((drop) => (
                  <tr key={drop.id} className="hover:bg-dark-300/50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        {drop.image && (
                          <img src={drop.image} alt={drop.name} className="w-10 h-10 rounded-lg object-cover" />
                        )}
                        <div>
                          <p className="font-medium text-white">{drop.name}</p>
                          <p className="text-sm text-gray-400">{drop.pricePerNft ? `${(parseInt(drop.pricePerNft) / 1000000).toFixed(2)} XRP` : 'Free'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div>
                        <p className="text-white">{drop.creator?.username || 'Unknown'}</p>
                        <p className="text-xs text-gray-400 truncate max-w-[120px]">{drop.creator?.walletAddress}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3">{getStatusBadge(drop.status)}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-dark-500 rounded-full h-2 max-w-[100px]">
                          <div
                            className="bg-primary-500 h-2 rounded-full"
                            style={{ width: `${drop.totalSupply ? (drop.mintedCount / drop.totalSupply) * 100 : 0}%` }}
                          />
                        </div>
                        <span className="text-sm text-gray-400">{drop.mintedCount}/{drop.totalSupply}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">{getFeesBadge(drop.platformFeesStatus)}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        {drop.status === 'active' && (
                          <button
                            onClick={() => handlePauseDrop(drop.id)}
                            disabled={actionLoading}
                            className="p-2 rounded-lg hover:bg-yellow-500/20 text-yellow-400"
                            title="Pause"
                          >
                            <Pause className="w-4 h-4" />
                          </button>
                        )}
                        {drop.status === 'paused' && (
                          <button
                            onClick={() => handleResumeDrop(drop.id)}
                            disabled={actionLoading}
                            className="p-2 rounded-lg hover:bg-green-500/20 text-green-400"
                            title="Resume"
                          >
                            <Play className="w-4 h-4" />
                          </button>
                        )}
                        {drop.platformFeesStatus === 'pending' && (
                          <button
                            onClick={() => handleMarkPaid(drop.id)}
                            disabled={actionLoading}
                            className="p-2 rounded-lg hover:bg-primary-500/20 text-primary-400"
                            title="Mark Paid"
                          >
                            <DollarSign className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-800">
            <p className="text-sm text-gray-400">
              Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total}
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => dispatch(setPage(pagination.page - 1))}
                disabled={pagination.page === 1}
                className="p-2 rounded-lg hover:bg-dark-300 disabled:opacity-50 disabled:cursor-not-allowed text-gray-400"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={() => dispatch(setPage(pagination.page + 1))}
                disabled={pagination.page === pagination.totalPages}
                className="p-2 rounded-lg hover:bg-dark-300 disabled:opacity-50 disabled:cursor-not-allowed text-gray-400"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Drops
