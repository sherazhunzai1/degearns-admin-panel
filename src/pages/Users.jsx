import { useState } from 'react'
import {
  Search,
  Filter,
  MoreVertical,
  Ban,
  CheckCircle,
  Eye,
  Trash2,
  Mail,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  X,
  User,
  Wallet,
  Calendar,
  Activity,
  Image,
  DollarSign
} from 'lucide-react'

// Mock users data
const mockUsers = [
  {
    id: 1,
    address: 'rUserWallet123456789ABC',
    username: 'CryptoArtist',
    email: 'artist@email.com',
    status: 'active',
    role: 'creator',
    joinDate: '2024-01-15',
    totalVolume: '125,000 XRP',
    nftsOwned: 45,
    nftsCreated: 128,
    lastActive: '2 hours ago',
    avatar: null
  },
  {
    id: 2,
    address: 'rTraderPro987654321XYZ',
    username: 'NFTTrader',
    email: 'trader@email.com',
    status: 'active',
    role: 'trader',
    joinDate: '2024-02-20',
    totalVolume: '89,500 XRP',
    nftsOwned: 234,
    nftsCreated: 0,
    lastActive: '30 mins ago',
    avatar: null
  },
  {
    id: 3,
    address: 'rInfluencer555444333BBB',
    username: 'CryptoInfluencer',
    email: 'influencer@email.com',
    status: 'blocked',
    role: 'influencer',
    joinDate: '2024-03-10',
    totalVolume: '45,200 XRP',
    nftsOwned: 89,
    nftsCreated: 12,
    lastActive: '1 day ago',
    avatar: null
  },
  {
    id: 4,
    address: 'rCollector888777666AAA',
    username: 'RareCollector',
    email: 'collector@email.com',
    status: 'active',
    role: 'collector',
    joinDate: '2024-01-05',
    totalVolume: '567,890 XRP',
    nftsOwned: 1245,
    nftsCreated: 0,
    lastActive: '5 mins ago',
    avatar: null
  },
  {
    id: 5,
    address: 'rNewUser111222333DDD',
    username: 'NewCollector',
    email: 'newuser@email.com',
    status: 'pending',
    role: 'user',
    joinDate: '2024-06-01',
    totalVolume: '500 XRP',
    nftsOwned: 3,
    nftsCreated: 0,
    lastActive: '1 hour ago',
    avatar: null
  },
]

// Generate more mock users
const generateMoreUsers = () => {
  const roles = ['creator', 'trader', 'collector', 'influencer', 'user']
  const statuses = ['active', 'active', 'active', 'blocked', 'pending']
  const users = [...mockUsers]

  for (let i = 6; i <= 50; i++) {
    users.push({
      id: i,
      address: `rUser${Math.random().toString(36).substring(2, 15)}`,
      username: `User${i}`,
      email: `user${i}@email.com`,
      status: statuses[Math.floor(Math.random() * statuses.length)],
      role: roles[Math.floor(Math.random() * roles.length)],
      joinDate: '2024-05-15',
      totalVolume: `${Math.floor(Math.random() * 100000)} XRP`,
      nftsOwned: Math.floor(Math.random() * 500),
      nftsCreated: Math.floor(Math.random() * 50),
      lastActive: `${Math.floor(Math.random() * 24)} hours ago`,
      avatar: null
    })
  }
  return users
}

const allUsers = generateMoreUsers()

const Users = () => {
  const [users, setUsers] = useState(allUsers)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [roleFilter, setRoleFilter] = useState('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedUser, setSelectedUser] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [showConfirmModal, setShowConfirmModal] = useState(false)
  const [actionType, setActionType] = useState(null)
  const [actionUser, setActionUser] = useState(null)

  const itemsPerPage = 10

  // Filter users
  const filteredUsers = users.filter(user => {
    const matchesSearch =
      user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesStatus = statusFilter === 'all' || user.status === statusFilter
    const matchesRole = roleFilter === 'all' || user.role === roleFilter

    return matchesSearch && matchesStatus && matchesRole
  })

  // Pagination
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage)
  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  const handleBlockUnblock = (user) => {
    setActionUser(user)
    setActionType(user.status === 'blocked' ? 'unblock' : 'block')
    setShowConfirmModal(true)
  }

  const confirmAction = () => {
    if (actionType === 'block') {
      setUsers(users.map(u =>
        u.id === actionUser.id ? { ...u, status: 'blocked' } : u
      ))
    } else if (actionType === 'unblock') {
      setUsers(users.map(u =>
        u.id === actionUser.id ? { ...u, status: 'active' } : u
      ))
    }
    setShowConfirmModal(false)
    setActionUser(null)
    setActionType(null)
  }

  const viewUserDetails = (user) => {
    setSelectedUser(user)
    setShowModal(true)
  }

  const getStatusBadge = (status) => {
    switch (status) {
      case 'active':
        return <span className="badge badge-success">Active</span>
      case 'blocked':
        return <span className="badge badge-danger">Blocked</span>
      case 'pending':
        return <span className="badge badge-warning">Pending</span>
      default:
        return <span className="badge badge-info">{status}</span>
    }
  }

  const getRoleBadge = (role) => {
    const colors = {
      creator: 'bg-purple-500/20 text-purple-400',
      trader: 'bg-blue-500/20 text-blue-400',
      collector: 'bg-green-500/20 text-green-400',
      influencer: 'bg-orange-500/20 text-orange-400',
      user: 'bg-gray-500/20 text-gray-400'
    }
    return (
      <span className={`badge ${colors[role] || colors.user}`}>
        {role.charAt(0).toUpperCase() + role.slice(1)}
      </span>
    )
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-white">User Management</h2>
          <p className="text-gray-400 text-sm mt-1">Manage and monitor all platform users</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-gray-400 text-sm">Total: {filteredUsers.length} users</span>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search by username, address, or email..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value)
              setCurrentPage(1)
            }}
            className="input-field pl-10"
          />
        </div>

        {/* Status Filter */}
        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value)
            setCurrentPage(1)
          }}
          className="input-field w-full sm:w-40"
        >
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="blocked">Blocked</option>
          <option value="pending">Pending</option>
        </select>

        {/* Role Filter */}
        <select
          value={roleFilter}
          onChange={(e) => {
            setRoleFilter(e.target.value)
            setCurrentPage(1)
          }}
          className="input-field w-full sm:w-40"
        >
          <option value="all">All Roles</option>
          <option value="creator">Creator</option>
          <option value="trader">Trader</option>
          <option value="collector">Collector</option>
          <option value="influencer">Influencer</option>
          <option value="user">User</option>
        </select>
      </div>

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
                <th className="text-left text-gray-400 font-medium text-sm px-6 py-4">Volume</th>
                <th className="text-left text-gray-400 font-medium text-sm px-6 py-4">Last Active</th>
                <th className="text-right text-gray-400 font-medium text-sm px-6 py-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedUsers.map((user) => (
                <tr key={user.id} className="border-b border-gray-800/50 table-row-hover">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-purple-500 flex items-center justify-center">
                        <User className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="text-white font-medium">{user.username}</p>
                        <p className="text-gray-400 text-xs">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <code className="text-sm text-gray-300 bg-dark-300 px-2 py-1 rounded">
                      {user.address.slice(0, 8)}...{user.address.slice(-6)}
                    </code>
                  </td>
                  <td className="px-6 py-4">{getRoleBadge(user.role)}</td>
                  <td className="px-6 py-4">{getStatusBadge(user.status)}</td>
                  <td className="px-6 py-4 text-gray-300">{user.totalVolume}</td>
                  <td className="px-6 py-4 text-gray-400 text-sm">{user.lastActive}</td>
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
                        onClick={() => handleBlockUnblock(user)}
                        className={`p-2 rounded-lg transition-colors ${
                          user.status === 'blocked'
                            ? 'hover:bg-green-500/20 text-green-400'
                            : 'hover:bg-red-500/20 text-red-400'
                        }`}
                        title={user.status === 'blocked' ? 'Unblock User' : 'Block User'}
                      >
                        {user.status === 'blocked' ? (
                          <CheckCircle className="w-4 h-4" />
                        ) : (
                          <Ban className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-gray-800">
          <p className="text-gray-400 text-sm">
            Showing {(currentPage - 1) * itemsPerPage + 1} to{' '}
            {Math.min(currentPage * itemsPerPage, filteredUsers.length)} of {filteredUsers.length}
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-2 rounded-lg hover:bg-dark-300 disabled:opacity-50 disabled:cursor-not-allowed text-gray-400"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let pageNum
              if (totalPages <= 5) {
                pageNum = i + 1
              } else if (currentPage <= 3) {
                pageNum = i + 1
              } else if (currentPage >= totalPages - 2) {
                pageNum = totalPages - 4 + i
              } else {
                pageNum = currentPage - 2 + i
              }
              return (
                <button
                  key={pageNum}
                  onClick={() => setCurrentPage(pageNum)}
                  className={`w-10 h-10 rounded-lg font-medium transition-colors ${
                    currentPage === pageNum
                      ? 'bg-primary-500 text-white'
                      : 'hover:bg-dark-300 text-gray-400'
                  }`}
                >
                  {pageNum}
                </button>
              )
            })}
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-2 rounded-lg hover:bg-dark-300 disabled:opacity-50 disabled:cursor-not-allowed text-gray-400"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* User Details Modal */}
      {showModal && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70" onClick={() => setShowModal(false)} />
          <div className="relative w-full max-w-2xl bg-dark-300 rounded-2xl border border-gray-800 overflow-hidden animate-fade-in">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800">
              <h3 className="text-lg font-semibold text-white">User Details</h3>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 rounded-lg hover:bg-dark-200 text-gray-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6">
              {/* User Info */}
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary-500 to-purple-500 flex items-center justify-center">
                  <User className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h4 className="text-xl font-semibold text-white">{selectedUser.username}</h4>
                  <p className="text-gray-400">{selectedUser.email}</p>
                  <div className="flex items-center gap-2 mt-1">
                    {getRoleBadge(selectedUser.role)}
                    {getStatusBadge(selectedUser.status)}
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
                  <code className="text-white text-xs break-all">{selectedUser.address}</code>
                </div>
                <div className="p-4 rounded-xl bg-dark-400">
                  <div className="flex items-center gap-2 mb-2">
                    <DollarSign className="w-4 h-4 text-green-400" />
                    <span className="text-gray-400 text-sm">Total Volume</span>
                  </div>
                  <p className="text-white font-semibold">{selectedUser.totalVolume}</p>
                </div>
                <div className="p-4 rounded-xl bg-dark-400">
                  <div className="flex items-center gap-2 mb-2">
                    <Image className="w-4 h-4 text-purple-400" />
                    <span className="text-gray-400 text-sm">NFTs Owned</span>
                  </div>
                  <p className="text-white font-semibold">{selectedUser.nftsOwned}</p>
                </div>
                <div className="p-4 rounded-xl bg-dark-400">
                  <div className="flex items-center gap-2 mb-2">
                    <Activity className="w-4 h-4 text-orange-400" />
                    <span className="text-gray-400 text-sm">NFTs Created</span>
                  </div>
                  <p className="text-white font-semibold">{selectedUser.nftsCreated}</p>
                </div>
              </div>

              {/* Additional Info */}
              <div className="space-y-3">
                <div className="flex items-center justify-between py-3 border-b border-gray-800">
                  <span className="text-gray-400">Join Date</span>
                  <span className="text-white">{selectedUser.joinDate}</span>
                </div>
                <div className="flex items-center justify-between py-3 border-b border-gray-800">
                  <span className="text-gray-400">Last Active</span>
                  <span className="text-white">{selectedUser.lastActive}</span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-3 pt-4">
                <button
                  onClick={() => {
                    setShowModal(false)
                    handleBlockUnblock(selectedUser)
                  }}
                  className={selectedUser.status === 'blocked' ? 'btn-success flex-1' : 'btn-danger flex-1'}
                >
                  {selectedUser.status === 'blocked' ? (
                    <>
                      <CheckCircle className="w-4 h-4 mr-2 inline" />
                      Unblock User
                    </>
                  ) : (
                    <>
                      <Ban className="w-4 h-4 mr-2 inline" />
                      Block User
                    </>
                  )}
                </button>
                <button className="btn-secondary flex-1">
                  <Mail className="w-4 h-4 mr-2 inline" />
                  Send Message
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
                actionType === 'block' ? 'bg-red-500/20' : 'bg-green-500/20'
              }`}>
                <AlertTriangle className={`w-6 h-6 ${
                  actionType === 'block' ? 'text-red-400' : 'text-green-400'
                }`} />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">
                  {actionType === 'block' ? 'Block User' : 'Unblock User'}
                </h3>
                <p className="text-gray-400 text-sm">This action can be reversed later</p>
              </div>
            </div>
            <p className="text-gray-300 mb-6">
              Are you sure you want to {actionType} <strong className="text-white">{actionUser.username}</strong>?
              {actionType === 'block' && ' They will not be able to access the platform.'}
            </p>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowConfirmModal(false)}
                className="btn-secondary flex-1"
              >
                Cancel
              </button>
              <button
                onClick={confirmAction}
                className={actionType === 'block' ? 'btn-danger flex-1' : 'btn-success flex-1'}
              >
                Confirm {actionType === 'block' ? 'Block' : 'Unblock'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Users
