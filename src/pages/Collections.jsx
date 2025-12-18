import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
  FolderOpen,
  Search,
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  XCircle,
  Trash2,
  BadgeCheck,
  Loader2
} from 'lucide-react'
import {
  fetchCollections,
  fetchCollectionStatistics,
  setFilters,
  setPage,
  updateCollectionVerification
} from '../store/slices/collectionsSlice'

const Collections = () => {
  const dispatch = useDispatch()
  const { collections, statistics, pagination, filters, loading, actionLoading } = useSelector((state) => state.collections)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    dispatch(fetchCollections(filters))
    dispatch(fetchCollectionStatistics())
  }, [dispatch, filters, pagination.page])

  const handleSearch = (e) => {
    e.preventDefault()
    dispatch(setFilters({ search: searchTerm }))
  }

  const handleCategoryFilter = (category) => {
    dispatch(setFilters({ category: category === 'all' ? undefined : category }))
  }

  const handleVerificationFilter = (isVerified) => {
    dispatch(setFilters({ isVerified: isVerified === 'all' ? undefined : isVerified === 'true' }))
  }

  const handleVerify = (collectionId, currentStatus) => {
    const newStatus = !currentStatus
    const reason = newStatus ? 'Verified by admin' : 'Verification removed by admin'
    dispatch(updateCollectionVerification({ collectionId, isVerified: newStatus, reason }))
  }

  const categories = ['art', 'music', 'photography', 'sports', 'gaming', 'collectibles', 'other']

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary-500/20 flex items-center justify-center">
              <FolderOpen className="w-5 h-5 text-primary-400" />
            </div>
            <div>
              <p className="text-gray-400 text-sm">Total Collections</p>
              <p className="text-xl font-bold text-white">{statistics.totalCollections}</p>
            </div>
          </div>
        </div>
        <div className="glass rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center">
              <BadgeCheck className="w-5 h-5 text-green-400" />
            </div>
            <div>
              <p className="text-gray-400 text-sm">Verified</p>
              <p className="text-xl font-bold text-white">{statistics.verifiedCollections}</p>
            </div>
          </div>
        </div>
        <div className="glass rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-yellow-500/20 flex items-center justify-center">
              <XCircle className="w-5 h-5 text-yellow-400" />
            </div>
            <div>
              <p className="text-gray-400 text-sm">Unverified</p>
              <p className="text-xl font-bold text-white">{statistics.unverifiedCollections}</p>
            </div>
          </div>
        </div>
        <div className="glass rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
              <span className="text-purple-400 font-bold">XRP</span>
            </div>
            <div>
              <p className="text-gray-400 text-sm">Total Volume</p>
              <p className="text-xl font-bold text-white">{statistics.totalVolumeXrp || '0'}</p>
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
                placeholder="Search collections..."
                className="w-full pl-10 pr-4 py-2 bg-dark-300 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-primary-500"
              />
            </div>
            <button type="submit" className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600">
              Search
            </button>
          </form>

          <div className="flex gap-2 flex-wrap">
            <select
              value={filters.category || 'all'}
              onChange={(e) => handleCategoryFilter(e.target.value)}
              className="px-3 py-2 bg-dark-300 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-primary-500"
            >
              <option value="all">All Categories</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>{cat.charAt(0).toUpperCase() + cat.slice(1)}</option>
              ))}
            </select>

            <select
              value={filters.isVerified === undefined ? 'all' : filters.isVerified.toString()}
              onChange={(e) => handleVerificationFilter(e.target.value)}
              className="px-3 py-2 bg-dark-300 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-primary-500"
            >
              <option value="all">All Verification</option>
              <option value="true">Verified</option>
              <option value="false">Unverified</option>
            </select>
          </div>
        </div>
      </div>

      {/* Collections Grid */}
      <div className="glass rounded-xl overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center p-12">
            <Loader2 className="w-8 h-8 text-primary-500 animate-spin" />
          </div>
        ) : collections.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 text-gray-400">
            <FolderOpen className="w-12 h-12 mb-4" />
            <p>No collections found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
            {collections.map((collection) => (
              <div key={collection.id} className="bg-dark-300 rounded-xl overflow-hidden">
                <div className="h-32 bg-gradient-to-br from-primary-500/20 to-purple-500/20 relative">
                  {collection.bannerImage && (
                    <img src={collection.bannerImage} alt="" className="w-full h-full object-cover" />
                  )}
                  {collection.image && (
                    <img
                      src={collection.image}
                      alt={collection.name}
                      className="absolute -bottom-6 left-4 w-16 h-16 rounded-xl border-4 border-dark-300 object-cover"
                    />
                  )}
                </div>
                <div className="p-4 pt-8">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-white flex items-center gap-2">
                      {collection.name}
                      {collection.isVerified && (
                        <BadgeCheck className="w-4 h-4 text-primary-400" />
                      )}
                    </h3>
                    <span className="text-xs px-2 py-1 bg-dark-400 rounded-full text-gray-400">
                      {collection.category}
                    </span>
                  </div>
                  <p className="text-sm text-gray-400 mb-3 line-clamp-2">{collection.description}</p>
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-400">
                      <span className="text-white font-medium">{collection.nftCount || 0}</span> NFTs
                    </div>
                    <button
                      onClick={() => handleVerify(collection.id, collection.isVerified)}
                      disabled={actionLoading}
                      className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                        collection.isVerified
                          ? 'bg-green-500/20 text-green-400 hover:bg-green-500/30'
                          : 'bg-gray-500/20 text-gray-400 hover:bg-primary-500/20 hover:text-primary-400'
                      }`}
                    >
                      {collection.isVerified ? 'Verified' : 'Verify'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
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

export default Collections
