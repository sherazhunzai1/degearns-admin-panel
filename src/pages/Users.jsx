import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
  Search,
  Ban,
  CheckCircle,
  Eye,
  ChevronLeft,
  ChevronRight,
  X,
  User,
  Wallet,
  Activity,
  Image,
  DollarSign,
  Loader2,
  Shield,
  ShieldCheck,
  Users as UsersIcon,
  UserCheck,
  UserX
} from 'lucide-react'
import {
  fetchUsers,
  fetchUserStatistics,
  fetchUserDetails,
  banUser,
  unbanUser,
  updateUserVerification,
  setFilters,
  setPage,
  clearSelectedUser
} from '../store/slices/usersSlice'

const Users = () => {
  const dispatch = useDispatch()
  const {
    users,
    selectedUser,
    statistics,
    pagination,
    filters,
    loading,
    statsLoading,
    actionLoading,
    error
  } = useSelector((state) => state.users)

  const [showModal, setShowModal] = useState(false)
  const [showConfirmModal, setShowConfirmModal] = useState(false)
  const [actionType, setActionType] = useState(null)
  const [actionUser, setActionUser] = useState(null)
  const [banReason, setBanReason] = useState('')
  const [localSearch, setLocalSearch] = useState('')

  useEffect(() => {
    dispatch(fetchUserStatistics())
  }, [dispatch])

  useEffect(() => {
    const params = {
      page: pagination.page,
      limit: pagination.limit,
      ...filters
    }
    // Remove undefined values
    Object.keys(params).forEach(key => params[key] === undefined && delete params[key])
    dispatch(fetchUsers(params))
  }, [dispatch, pagination.page, pagination.limit, filters])

  const handleSearch = (e) => {
    e.preventDefault()
    dispatch(setFilters({ search: localSearch }))
  }

  const handleBanUnban = (user) => {
    setActionUser(user)
    setActionType(user.isBanned ? 'unban' : 'ban')
    setBanReason('')
    setShowConfirmModal(true)
  }

  const handleVerify = async (user) => {
    await dispatch(updateUserVerification({
      walletAddress: user.walletAddress,
      isVerified: !user.isVerified,
      reason: user.isVerified ? 'Admin removed verification' : 'Admin verified user'
    }))
  }

  const confirmAction = async () => {
    if (actionType === 'ban') {
      await dispatch(banUser({
        walletAddress: actionUser.walletAddress,
        reason: banReason || 'Banned by admin'
      }))
    } else if (actionType === 'unban') {
      await dispatch(unbanUser({
        walletAddress: actionUser.walletAddress,
        reason: banReason || 'Unbanned by admin'
      }))
    }
    setShowConfirmModal(false)
    setActionUser(null)
    setActionType(null)
    setBanReason('')
  }

  const viewUserDetails = async (user) => {
    await dispatch(fetchUserDetails(user.walletAddress))
    setShowModal(true)
  }

  const closeModal = () => {
    setShowModal(false)
    dispatch(clearSelectedUser())
  }

  const getStatusBadge = (user) => {
    if (user.isBanned) {
      return <span className="badge badge-danger">Banned</span>
    }
    if (user.isVerified) {
      return <span className="badge badge-success">Verified</span>
    }
    return <span className="badge badge-info">Active</span>
  }

  const getRoleBadge = (role) => {
    const colors = {
      super_admin: 'bg-red-500/20 text-red-400',
      admin: 'bg-orange-500/20 text-orange-400',
      creator: 'bg-purple-500/20 text-purple-400',
      user: 'bg-gray-500/20 text-gray-400'
    }
    return (
      <span className={`badge ${colors[role] || colors.user}`}>
        {role?.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()) || 'User'}
      </span>
    )
  }

  const totalPages = pagination.totalPages || Math.ceil(pagination.total / pagination.limit)

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="stat-card">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center">
              <UsersIcon className="w-6 h-6 text-white" />
            </div>
          </div>
          <h3 className="text-gray-400 text-sm font-medium mb-1">Total Users</h3>
          {statsLoading ? (
            <div className="h-8 bg-dark-300 rounded animate-pulse"></div>
          ) : (
            <p className="text-2xl font-bold text-white">{statistics.totalUsers?.toLocaleString() || 0}</p>
          )}
        </div>

        <div className="stat-card">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center">
              <UserCheck className="w-6 h-6 text-white" />
            </div>
          </div>
          <h3 className="text-gray-400 text-sm font-medium mb-1">Verified Users</h3>
          {statsLoading ? (
            <div className="h-8 bg-dark-300 rounded animate-pulse"></div>
          ) : (
            <p className="text-2xl font-bold text-white">{statistics.verifiedUsers?.toLocaleString() || 0}</p>
          )}
        </div>

        <div className="stat-card">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center">
              <UserX className="w-6 h-6 text-white" />
            </div>
          </div>
          <h3 className="text-gray-400 text-sm font-medium mb-1">Banned Users</h3>
          {statsLoading ? (
            <div className="h-8 bg-dark-300 rounded animate-pulse"></div>
          ) : (
            <p className="text-2xl font-bold text-white">{statistics.bannedUsers?.toLocaleString() || 0}</p>
          )}
        </div>

        <div className="stat-card">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center">
              <Activity className="w-6 h-6 text-white" />
            </div>
          </div>
          <h3 className="text-gray-400 text-sm font-medium mb-1">New Today</h3>
          {statsLoading ? (
            <div className="h-8 bg-dark-300 rounded animate-pulse"></div>
          ) : (
            <p className="text-2xl font-bold text-white">{statistics.newUsers?.today || 0}</p>
          )}
        </div>
      </div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-white">User Management</h2>
          <p className="text-gray-400 text-sm mt-1">Manage and monitor all platform users</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-gray-400 text-sm">Total: {pagination.total || 0} users</span>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Search */}
        <form onSubmit={handleSearch} className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search by username or wallet address..."
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            className="input-field pl-10"
          />
        </form>

        {/* Role Filter */}
        <select
          value={filters.role || ''}
          onChange={(e) => dispatch(setFilters({ role: e.target.value || undefined }))}
          className="input-field w-full sm:w-40"
        >
          <option value="">All Roles</option>
          <option value="super_admin">Super Admin</option>
          <option value="admin">Admin</option>
          <option value="creator">Creator</option>
          <option value="user">User</option>
        </select>

        {/* Status Filter */}
        <select
          value={filters.isBanned === undefined ? '' : filters.isBanned ? 'banned' : 'active'}
          onChange={(e) => {
            if (e.target.value === '') {
              dispatch(setFilters({ isBanned: undefined }))
            } else {
              dispatch(setFilters({ isBanned: e.target.value === 'banned' }))
            }
          }}
          className="input-field w-full sm:w-40"
        >
          <option value="">All Status</option>
          <option value="active">Active</option>
          <option value="banned">Banned</option>
        </select>

        {/* Verified Filter */}
        <select
          value={filters.isVerified === undefined ? '' : filters.isVerified ? 'verified' : 'unverified'}
          onChange={(e) => {
            if (e.target.value === '') {
              dispatch(setFilters({ isVerified: undefined }))
            } else {
              dispatch(setFilters({ isVerified: e.target.value === 'verified' }))
            }
          }}
          className="input-field w-full sm:w-40"
        >
          <option value="">All Verified</option>
          <option value="verified">Verified</option>
          <option value="unverified">Unverified</option>
        </select>
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400">
          {error}
        </div>
      )}

      {/* Users Table */}
      <div className="rounded-xl bg-dark-200 border border-gray-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-800">
                <th className="text-left text-gray-400 font-medium text-sm px-6 py-4">User</th>
                <th className="text-left text-gray-400 font-medium text-sm px-6 py-4">Wallet</th>
                <th className="text-left text-gray-400 font-medium text-sm px-6 py-4">Role</th>
                <th className="text-left text-gray-400 font-medium text-sm px-6 py-4">Status</th>
                <th className="text-left text-gray-400 font-medium text-sm px-6 py-4">Joined</th>
                <th className="text-right text-gray-400 font-medium text-sm px-6 py-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center">
                    <Loader2 className="w-8 h-8 text-primary-500 animate-spin mx-auto" />
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-gray-400">
                    No users found
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user.walletAddress} className="border-b border-gray-800/50 table-row-hover">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {user.profilePicture ? (
                          <img
                            src={user.profilePicture}
                            alt={user.username}
                            className="w-10 h-10 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-purple-500 flex items-center justify-center">
                            <User className="w-5 h-5 text-white" />
                          </div>
                        )}
                        <div>
                          <p className="text-white font-medium">{user.username || 'Unknown'}</p>
                          {user.isVerified && (
                            <div className="flex items-center gap-1">
                              <ShieldCheck className="w-3 h-3 text-primary-400" />
                              <span className="text-xs text-primary-400">Verified</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <code className="text-sm text-gray-300 bg-dark-300 px-2 py-1 rounded">
                        {user.walletAddress?.slice(0, 8)}...{user.walletAddress?.slice(-6)}
                      </code>
                    </td>
                    <td className="px-6 py-4">{getRoleBadge(user.role)}</td>
                    <td className="px-6 py-4">{getStatusBadge(user)}</td>
                    <td className="px-6 py-4 text-gray-400 text-sm">
                      {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => viewUserDetails(user)}
                          className="p-2 rounded-lg hover:bg-dark-300 transition-colors text-gray-400 hover:text-white"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleVerify(user)}
                          disabled={actionLoading}
                          className={`p-2 rounded-lg transition-colors ${
                            user.isVerified
                              ? 'hover:bg-yellow-500/20 text-yellow-400'
                              : 'hover:bg-blue-500/20 text-blue-400'
                          }`}
                          title={user.isVerified ? 'Remove Verification' : 'Verify User'}
                        >
                          {user.isVerified ? (
                            <Shield className="w-4 h-4" />
                          ) : (
                            <ShieldCheck className="w-4 h-4" />
                          )}
                        </button>
                        <button
                          onClick={() => handleBanUnban(user)}
                          disabled={actionLoading}
                          className={`p-2 rounded-lg transition-colors ${
                            user.isBanned
                              ? 'hover:bg-green-500/20 text-green-400'
                              : 'hover:bg-red-500/20 text-red-400'
                          }`}
                          title={user.isBanned ? 'Unban User' : 'Ban User'}
                        >
                          {user.isBanned ? (
                            <CheckCircle className="w-4 h-4" />
                          ) : (
                            <Ban className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 0 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-gray-800">
            <p className="text-gray-400 text-sm">
              Showing {((pagination.page - 1) * pagination.limit) + 1} to{' '}
              {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total}
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => dispatch(setPage(pagination.page - 1))}
                disabled={pagination.page === 1 || loading}
                className="p-2 rounded-lg hover:bg-dark-300 disabled:opacity-50 disabled:cursor-not-allowed text-gray-400"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum
                if (totalPages <= 5) {
                  pageNum = i + 1
                } else if (pagination.page <= 3) {
                  pageNum = i + 1
                } else if (pagination.page >= totalPages - 2) {
                  pageNum = totalPages - 4 + i
                } else {
                  pageNum = pagination.page - 2 + i
                }
                return (
                  <button
                    key={pageNum}
                    onClick={() => dispatch(setPage(pageNum))}
                    disabled={loading}
                    className={`w-10 h-10 rounded-lg font-medium transition-colors ${
                      pagination.page === pageNum
                        ? 'bg-primary-500 text-white'
                        : 'hover:bg-dark-300 text-gray-400'
                    }`}
                  >
                    {pageNum}
                  </button>
                )
              })}
              <button
                onClick={() => dispatch(setPage(pagination.page + 1))}
                disabled={pagination.page === totalPages || loading}
                className="p-2 rounded-lg hover:bg-dark-300 disabled:opacity-50 disabled:cursor-not-allowed text-gray-400"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* User Details Modal */}
      {showModal && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70" onClick={closeModal} />
          <div className="relative w-full max-w-2xl bg-dark-300 rounded-2xl border border-gray-800 overflow-hidden animate-fade-in">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800">
              <h3 className="text-lg font-semibold text-white">User Details</h3>
              <button
                onClick={closeModal}
                className="p-2 rounded-lg hover:bg-dark-200 text-gray-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6">
              {/* User Info */}
              <div className="flex items-center gap-4">
                {selectedUser.profilePicture ? (
                  <img
                    src={selectedUser.profilePicture}
                    alt={selectedUser.username}
                    className="w-16 h-16 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary-500 to-purple-500 flex items-center justify-center">
                    <User className="w-8 h-8 text-white" />
                  </div>
                )}
                <div>
                  <h4 className="text-xl font-semibold text-white">{selectedUser.username || 'Unknown'}</h4>
                  {selectedUser.bio && <p className="text-gray-400 text-sm">{selectedUser.bio}</p>}
                  <div className="flex items-center gap-2 mt-1">
                    {getRoleBadge(selectedUser.role)}
                    {getStatusBadge(selectedUser)}
                  </div>
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-4 rounded-xl bg-dark-400">
                  <div className="flex items-center gap-2 mb-2">
                    <Wallet className="w-4 h-4 text-primary-400" />
                    <span className="text-gray-400 text-sm">Wallet</span>
                  </div>
                  <code className="text-white text-xs break-all">{selectedUser.walletAddress}</code>
                </div>
                <div className="p-4 rounded-xl bg-dark-400">
                  <div className="flex items-center gap-2 mb-2">
                    <DollarSign className="w-4 h-4 text-green-400" />
                    <span className="text-gray-400 text-sm">Total Volume</span>
                  </div>
                  <p className="text-white font-semibold">
                    {selectedUser.stats?.totalVolumeXrp || '0'} XRP
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-dark-400">
                  <div className="flex items-center gap-2 mb-2">
                    <Image className="w-4 h-4 text-purple-400" />
                    <span className="text-gray-400 text-sm">NFTs Owned</span>
                  </div>
                  <p className="text-white font-semibold">{selectedUser.stats?.ownedNfts || 0}</p>
                </div>
                <div className="p-4 rounded-xl bg-dark-400">
                  <div className="flex items-center gap-2 mb-2">
                    <Activity className="w-4 h-4 text-orange-400" />
                    <span className="text-gray-400 text-sm">Drops Created</span>
                  </div>
                  <p className="text-white font-semibold">{selectedUser.stats?.dropsCreated || 0}</p>
                </div>
              </div>

              {/* Additional Info */}
              <div className="space-y-3">
                <div className="flex items-center justify-between py-3 border-b border-gray-800">
                  <span className="text-gray-400">Joined</span>
                  <span className="text-white">
                    {selectedUser.createdAt ? new Date(selectedUser.createdAt).toLocaleDateString() : 'N/A'}
                  </span>
                </div>
                <div className="flex items-center justify-between py-3 border-b border-gray-800">
                  <span className="text-gray-400">Total Mints</span>
                  <span className="text-white">{selectedUser.stats?.totalMints || 0}</span>
                </div>
                <div className="flex items-center justify-between py-3 border-b border-gray-800">
                  <span className="text-gray-400">Posts</span>
                  <span className="text-white">{selectedUser.stats?.postsCount || 0}</span>
                </div>
                <div className="flex items-center justify-between py-3 border-b border-gray-800">
                  <span className="text-gray-400">Followers</span>
                  <span className="text-white">{selectedUser.stats?.followersCount || 0}</span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-3 pt-4">
                <button
                  onClick={() => {
                    closeModal()
                    handleVerify(selectedUser)
                  }}
                  disabled={actionLoading}
                  className={selectedUser.isVerified ? 'btn-secondary flex-1' : 'btn-primary flex-1'}
                >
                  {selectedUser.isVerified ? (
                    <>
                      <Shield className="w-4 h-4 mr-2 inline" />
                      Remove Verification
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="w-4 h-4 mr-2 inline" />
                      Verify User
                    </>
                  )}
                </button>
                <button
                  onClick={() => {
                    closeModal()
                    handleBanUnban(selectedUser)
                  }}
                  disabled={actionLoading}
                  className={selectedUser.isBanned ? 'btn-success flex-1' : 'btn-danger flex-1'}
                >
                  {selectedUser.isBanned ? (
                    <>
                      <CheckCircle className="w-4 h-4 mr-2 inline" />
                      Unban User
                    </>
                  ) : (
                    <>
                      <Ban className="w-4 h-4 mr-2 inline" />
                      Ban User
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Confirm Action Modal */}
      {showConfirmModal && actionUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70" onClick={() => setShowConfirmModal(false)} />
          <div className="relative w-full max-w-md bg-dark-300 rounded-2xl border border-gray-800 p-6 animate-fade-in">
            <div className="flex items-center gap-4 mb-4">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                actionType === 'ban' ? 'bg-red-500/20' : 'bg-green-500/20'
              }`}>
                {actionType === 'ban' ? (
                  <Ban className="w-6 h-6 text-red-400" />
                ) : (
                  <CheckCircle className="w-6 h-6 text-green-400" />
                )}
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">
                  {actionType === 'ban' ? 'Ban User' : 'Unban User'}
                </h3>
                <p className="text-gray-400 text-sm">This action can be reversed later</p>
              </div>
            </div>
            <p className="text-gray-300 mb-4">
              Are you sure you want to {actionType} <strong className="text-white">{actionUser.username || actionUser.walletAddress}</strong>?
              {actionType === 'ban' && ' They will not be able to access the platform.'}
            </p>

            <div className="mb-6">
              <label className="block text-gray-300 text-sm font-medium mb-2">
                Reason (optional)
              </label>
              <textarea
                value={banReason}
                onChange={(e) => setBanReason(e.target.value)}
                placeholder={`Enter reason for ${actionType}...`}
                className="input-field w-full h-24 resize-none"
              />
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowConfirmModal(false)}
                className="btn-secondary flex-1"
                disabled={actionLoading}
              >
                Cancel
              </button>
              <button
                onClick={confirmAction}
                disabled={actionLoading}
                className={actionType === 'ban' ? 'btn-danger flex-1' : 'btn-success flex-1'}
              >
                {actionLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin mx-auto" />
                ) : (
                  `Confirm ${actionType === 'ban' ? 'Ban' : 'Unban'}`
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Users
