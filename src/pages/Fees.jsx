import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
  DollarSign,
  Search,
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  Clock,
  XCircle,
  AlertCircle,
  Download,
  TrendingUp,
  Loader2
} from 'lucide-react'
import {
  fetchFeesOverview,
  fetchFeeTransactions,
  fetchPendingFees,
  setFilters,
  setPage,
  markFeesPaid
} from '../store/slices/feesSlice'

const Fees = () => {
  const dispatch = useDispatch()
  const { overview, transactions, pendingFees, pagination, filters, loading, actionLoading } = useSelector((state) => state.fees)
  const [activeTab, setActiveTab] = useState('all')

  useEffect(() => {
    dispatch(fetchFeesOverview())
    dispatch(fetchFeeTransactions(filters))
    dispatch(fetchPendingFees())
  }, [dispatch, filters, pagination.page])

  const handleStatusFilter = (status) => {
    dispatch(setFilters({ status: status === 'all' ? undefined : status }))
  }

  const handleMarkPaid = (dropId) => {
    const txHash = prompt('Enter transaction hash:')
    if (txHash) {
      dispatch(markFeesPaid({ dropId, transactionHash: txHash, reason: 'Manually marked as paid' }))
    }
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
            <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-green-400" />
            </div>
            <div>
              <p className="text-gray-400 text-sm">Collected</p>
              <p className="text-xl font-bold text-white">{overview.platformFees?.collectedXrp || '0'} XRP</p>
            </div>
          </div>
        </div>
        <div className="glass rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-yellow-500/20 flex items-center justify-center">
              <Clock className="w-5 h-5 text-yellow-400" />
            </div>
            <div>
              <p className="text-gray-400 text-sm">Pending</p>
              <p className="text-xl font-bold text-white">{overview.platformFees?.pendingXrp || '0'} XRP</p>
            </div>
          </div>
        </div>
        <div className="glass rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-red-500/20 flex items-center justify-center">
              <XCircle className="w-5 h-5 text-red-400" />
            </div>
            <div>
              <p className="text-gray-400 text-sm">Failed</p>
              <p className="text-xl font-bold text-white">{overview.platformFees?.failedXrp || '0'} XRP</p>
            </div>
          </div>
        </div>
        <div className="glass rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <p className="text-gray-400 text-sm">Total Mint Revenue</p>
              <p className="text-xl font-bold text-white">{overview.mintRevenue?.totalXrp || '0'} XRP</p>
            </div>
          </div>
        </div>
      </div>

      {/* Platform Wallet Info */}
      {overview.platformFeesWallet?.address && (
        <div className="glass rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm mb-1">Platform Fees Wallet</p>
              <p className="text-white font-mono">{overview.platformFeesWallet.address}</p>
            </div>
            <span className="text-gray-400">{overview.platformFeesWallet.label}</span>
          </div>
        </div>
      )}

      {/* Tabs & Filters */}
      <div className="glass rounded-xl p-4">
        <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                activeTab === 'all'
                  ? 'bg-primary-500 text-white'
                  : 'bg-dark-300 text-gray-400 hover:text-white'
              }`}
            >
              All Transactions
            </button>
            <button
              onClick={() => setActiveTab('pending')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                activeTab === 'pending'
                  ? 'bg-primary-500 text-white'
                  : 'bg-dark-300 text-gray-400 hover:text-white'
              }`}
            >
              Pending ({pendingFees.length})
            </button>
          </div>

          <div className="flex gap-2">
            <select
              value={filters.status || 'all'}
              onChange={(e) => handleStatusFilter(e.target.value)}
              className="px-3 py-2 bg-dark-300 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-primary-500"
            >
              <option value="all">All Status</option>
              <option value="paid">Paid</option>
              <option value="pending">Pending</option>
              <option value="failed">Failed</option>
              <option value="refunded">Refunded</option>
            </select>
          </div>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="glass rounded-xl overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center p-12">
            <Loader2 className="w-8 h-8 text-primary-500 animate-spin" />
          </div>
        ) : (activeTab === 'pending' ? pendingFees : transactions).length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 text-gray-400">
            <DollarSign className="w-12 h-12 mb-4" />
            <p>No transactions found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-dark-300">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Drop</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Creator</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Platform Fees</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Mints</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Status</th>
                  <th className="px-4 py-3 text-right text-sm font-medium text-gray-400">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {(activeTab === 'pending' ? pendingFees : transactions).map((item) => (
                  <tr key={item.id} className="hover:bg-dark-300/50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        {item.image && (
                          <img src={item.image} alt={item.name} className="w-10 h-10 rounded-lg object-cover" />
                        )}
                        <div>
                          <p className="font-medium text-white">{item.name}</p>
                          <p className="text-xs text-gray-400">ID: {item.id?.slice(0, 8)}...</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-white">{item.creator?.username || 'Unknown'}</p>
                      <p className="text-xs text-gray-400 truncate max-w-[120px]">{item.creatorWalletAddress || item.creator?.walletAddress}</p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-white font-medium">
                        {item.feesBreakdown?.totalPlatformFeesXrp || '0'} XRP
                      </p>
                      <p className="text-xs text-gray-400">
                        Setup: {item.feesBreakdown?.setupFeeXrp || '0'} + Per NFT: {item.feesBreakdown?.platformFeePerNftXrp || '0'}
                      </p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-white">{item.mintedCount || 0}</p>
                      <p className="text-xs text-gray-400">of {item.totalSupply || 0}</p>
                    </td>
                    <td className="px-4 py-3">{getFeesBadge(item.platformFeesStatus)}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        {item.platformFeesStatus === 'pending' && (
                          <button
                            onClick={() => handleMarkPaid(item.id)}
                            disabled={actionLoading}
                            className="px-3 py-1 rounded-lg bg-green-500/20 text-green-400 hover:bg-green-500/30 text-sm font-medium"
                          >
                            Mark Paid
                          </button>
                        )}
                        {item.platformFeesTransactionHash && (
                          <a
                            href={`https://xrpscan.com/tx/${item.platformFeesTransactionHash}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 rounded-lg hover:bg-dark-300 text-gray-400"
                            title="View Transaction"
                          >
                            <Download className="w-4 h-4" />
                          </a>
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
        {activeTab === 'all' && pagination.totalPages > 1 && (
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

export default Fees
