import { useState } from 'react'
import {
  Search,
  Filter,
  ArrowUpRight,
  ArrowDownRight,
  ArrowLeftRight,
  ExternalLink,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Download,
  RefreshCw,
  Eye,
  Image
} from 'lucide-react'

// Mock transactions data
const mockTransactions = [
  {
    id: 1,
    type: 'sale',
    nft: 'Cosmic Dreams #124',
    collection: 'Cosmic Collection',
    from: 'rSeller123456789',
    to: 'rBuyer987654321',
    amount: '2,500 XRP',
    fee: '62.5 XRP',
    date: '2024-06-15 14:32:15',
    status: 'completed',
    txHash: 'ABC123DEF456GHI789'
  },
  {
    id: 2,
    type: 'listing',
    nft: 'Abstract Wave #89',
    collection: 'Abstract Art',
    from: 'rCreator555444333',
    to: '-',
    amount: '1,200 XRP',
    fee: '-',
    date: '2024-06-15 14:28:45',
    status: 'active',
    txHash: 'JKL012MNO345PQR678'
  },
  {
    id: 3,
    type: 'transfer',
    nft: 'Digital Galaxy #45',
    collection: 'Galaxy Series',
    from: 'rOwner111222333',
    to: 'rRecipient444555666',
    amount: '-',
    fee: '10 XRP',
    date: '2024-06-15 14:15:22',
    status: 'completed',
    txHash: 'STU901VWX234YZA567'
  },
  {
    id: 4,
    type: 'auction_bid',
    nft: 'Ethereal Being #67',
    collection: 'Ethereal Beings',
    from: 'rBidder777888999',
    to: '-',
    amount: '3,200 XRP',
    fee: '-',
    date: '2024-06-15 13:58:30',
    status: 'pending',
    txHash: 'BCD890EFG123HIJ456'
  },
  {
    id: 5,
    type: 'sale',
    nft: 'Neon City #201',
    collection: 'Neon Cities',
    from: 'rArtist000111222',
    to: 'rCollector333444555',
    amount: '5,800 XRP',
    fee: '145 XRP',
    date: '2024-06-15 13:45:10',
    status: 'completed',
    txHash: 'KLM789NOP012QRS345'
  },
  {
    id: 6,
    type: 'auction_end',
    nft: 'Rare Gem #12',
    collection: 'Rare Gems',
    from: 'rSeller666777888',
    to: 'rWinner999000111',
    amount: '12,500 XRP',
    fee: '312.5 XRP',
    date: '2024-06-15 13:30:00',
    status: 'completed',
    txHash: 'TUV678WXY901ZAB234'
  },
  {
    id: 7,
    type: 'offer_accepted',
    nft: 'Pixel Art #567',
    collection: 'Pixel Universe',
    from: 'rHolder222333444',
    to: 'rOfferor555666777',
    amount: '890 XRP',
    fee: '22.25 XRP',
    date: '2024-06-15 13:15:45',
    status: 'completed',
    txHash: 'CDE567FGH890IJK123'
  },
  {
    id: 8,
    type: 'mint',
    nft: 'New Creation #1',
    collection: 'Fresh Mints',
    from: '-',
    to: 'rCreator888999000',
    amount: '-',
    fee: '25 XRP',
    date: '2024-06-15 12:58:30',
    status: 'completed',
    txHash: 'LMN456OPQ789RST012'
  },
]

// Generate more mock transactions
const generateMoreTransactions = () => {
  const types = ['sale', 'listing', 'transfer', 'auction_bid', 'auction_end', 'offer_accepted', 'mint']
  const statuses = ['completed', 'completed', 'completed', 'pending', 'active', 'failed']
  const transactions = [...mockTransactions]

  for (let i = 9; i <= 100; i++) {
    const type = types[Math.floor(Math.random() * types.length)]
    transactions.push({
      id: i,
      type,
      nft: `NFT #${Math.floor(Math.random() * 1000)}`,
      collection: `Collection ${Math.floor(Math.random() * 50)}`,
      from: `r${Math.random().toString(36).substring(2, 12)}`,
      to: type === 'listing' || type === 'auction_bid' || type === 'mint' ? '-' : `r${Math.random().toString(36).substring(2, 12)}`,
      amount: type === 'transfer' || type === 'mint' ? '-' : `${Math.floor(Math.random() * 10000)} XRP`,
      fee: `${Math.floor(Math.random() * 100)} XRP`,
      date: `2024-06-${String(Math.floor(Math.random() * 15) + 1).padStart(2, '0')} ${String(Math.floor(Math.random() * 24)).padStart(2, '0')}:${String(Math.floor(Math.random() * 60)).padStart(2, '0')}:${String(Math.floor(Math.random() * 60)).padStart(2, '0')}`,
      status: statuses[Math.floor(Math.random() * statuses.length)],
      txHash: Math.random().toString(36).substring(2, 20).toUpperCase()
    })
  }
  return transactions
}

const allTransactions = generateMoreTransactions()

const Transactions = () => {
  const [transactions] = useState(allTransactions)
  const [searchQuery, setSearchQuery] = useState('')
  const [typeFilter, setTypeFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [dateRange, setDateRange] = useState('7d')

  const itemsPerPage = 15

  // Filter transactions
  const filteredTransactions = transactions.filter(tx => {
    const matchesSearch =
      tx.nft.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tx.collection.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tx.from.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tx.to.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tx.txHash.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesType = typeFilter === 'all' || tx.type === typeFilter
    const matchesStatus = statusFilter === 'all' || tx.status === statusFilter

    return matchesSearch && matchesType && matchesStatus
  })

  // Pagination
  const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage)
  const paginatedTransactions = filteredTransactions.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  const getTypeIcon = (type) => {
    switch (type) {
      case 'sale':
      case 'auction_end':
      case 'offer_accepted':
        return <ArrowLeftRight className="w-4 h-4 text-green-400" />
      case 'listing':
        return <ArrowUpRight className="w-4 h-4 text-blue-400" />
      case 'transfer':
        return <ArrowDownRight className="w-4 h-4 text-purple-400" />
      case 'auction_bid':
        return <ArrowUpRight className="w-4 h-4 text-orange-400" />
      case 'mint':
        return <Image className="w-4 h-4 text-pink-400" />
      default:
        return <ArrowLeftRight className="w-4 h-4 text-gray-400" />
    }
  }

  const getTypeBadge = (type) => {
    const typeStyles = {
      sale: 'bg-green-500/20 text-green-400',
      listing: 'bg-blue-500/20 text-blue-400',
      transfer: 'bg-purple-500/20 text-purple-400',
      auction_bid: 'bg-orange-500/20 text-orange-400',
      auction_end: 'bg-green-500/20 text-green-400',
      offer_accepted: 'bg-cyan-500/20 text-cyan-400',
      mint: 'bg-pink-500/20 text-pink-400'
    }
    const typeLabels = {
      sale: 'Sale',
      listing: 'Listing',
      transfer: 'Transfer',
      auction_bid: 'Auction Bid',
      auction_end: 'Auction End',
      offer_accepted: 'Offer Accepted',
      mint: 'Mint'
    }
    return (
      <span className={`badge ${typeStyles[type] || 'bg-gray-500/20 text-gray-400'}`}>
        {typeLabels[type] || type}
      </span>
    )
  }

  const getStatusBadge = (status) => {
    switch (status) {
      case 'completed':
        return <span className="badge badge-success">Completed</span>
      case 'pending':
        return <span className="badge badge-warning">Pending</span>
      case 'active':
        return <span className="badge badge-info">Active</span>
      case 'failed':
        return <span className="badge badge-danger">Failed</span>
      default:
        return <span className="badge badge-info">{status}</span>
    }
  }

  // Calculate stats
  const stats = {
    totalVolume: filteredTransactions
      .filter(tx => tx.amount !== '-')
      .reduce((sum, tx) => sum + parseInt(tx.amount.replace(/[^0-9]/g, '') || 0), 0),
    totalFees: filteredTransactions
      .filter(tx => tx.fee !== '-')
      .reduce((sum, tx) => sum + parseInt(tx.fee.replace(/[^0-9]/g, '') || 0), 0),
    totalSales: filteredTransactions.filter(tx => tx.type === 'sale' || tx.type === 'auction_end' || tx.type === 'offer_accepted').length,
    totalTransfers: filteredTransactions.filter(tx => tx.type === 'transfer').length
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-white">Transactions</h2>
          <p className="text-gray-400 text-sm mt-1">Monitor all marketplace transactions</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="btn-secondary flex items-center gap-2">
            <Download className="w-4 h-4" />
            Export
          </button>
          <button className="btn-secondary flex items-center gap-2">
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="stat-card">
          <p className="text-gray-400 text-sm mb-1">Total Volume</p>
          <p className="text-2xl font-bold text-white">{stats.totalVolume.toLocaleString()} XRP</p>
        </div>
        <div className="stat-card">
          <p className="text-gray-400 text-sm mb-1">Total Fees</p>
          <p className="text-2xl font-bold text-green-400">{stats.totalFees.toLocaleString()} XRP</p>
        </div>
        <div className="stat-card">
          <p className="text-gray-400 text-sm mb-1">Total Sales</p>
          <p className="text-2xl font-bold text-white">{stats.totalSales}</p>
        </div>
        <div className="stat-card">
          <p className="text-gray-400 text-sm mb-1">Total Transfers</p>
          <p className="text-2xl font-bold text-white">{stats.totalTransfers}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col lg:flex-row gap-4">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search by NFT, collection, wallet, or TX hash..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value)
              setCurrentPage(1)
            }}
            className="input-field pl-10"
          />
        </div>

        {/* Type Filter */}
        <select
          value={typeFilter}
          onChange={(e) => {
            setTypeFilter(e.target.value)
            setCurrentPage(1)
          }}
          className="input-field w-full lg:w-44"
        >
          <option value="all">All Types</option>
          <option value="sale">Sale</option>
          <option value="listing">Listing</option>
          <option value="transfer">Transfer</option>
          <option value="auction_bid">Auction Bid</option>
          <option value="auction_end">Auction End</option>
          <option value="offer_accepted">Offer Accepted</option>
          <option value="mint">Mint</option>
        </select>

        {/* Status Filter */}
        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value)
            setCurrentPage(1)
          }}
          className="input-field w-full lg:w-40"
        >
          <option value="all">All Status</option>
          <option value="completed">Completed</option>
          <option value="pending">Pending</option>
          <option value="active">Active</option>
          <option value="failed">Failed</option>
        </select>

        {/* Date Range */}
        <select
          value={dateRange}
          onChange={(e) => setDateRange(e.target.value)}
          className="input-field w-full lg:w-40"
        >
          <option value="24h">Last 24 hours</option>
          <option value="7d">Last 7 days</option>
          <option value="30d">Last 30 days</option>
          <option value="90d">Last 90 days</option>
          <option value="all">All time</option>
        </select>
      </div>

      {/* Transactions Table */}
      <div className="rounded-xl bg-dark-200 border border-gray-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-800">
                <th className="text-left text-gray-400 font-medium text-sm px-6 py-4">Type</th>
                <th className="text-left text-gray-400 font-medium text-sm px-6 py-4">NFT</th>
                <th className="text-left text-gray-400 font-medium text-sm px-6 py-4">From</th>
                <th className="text-left text-gray-400 font-medium text-sm px-6 py-4">To</th>
                <th className="text-left text-gray-400 font-medium text-sm px-6 py-4">Amount</th>
                <th className="text-left text-gray-400 font-medium text-sm px-6 py-4">Fee</th>
                <th className="text-left text-gray-400 font-medium text-sm px-6 py-4">Date</th>
                <th className="text-left text-gray-400 font-medium text-sm px-6 py-4">Status</th>
                <th className="text-right text-gray-400 font-medium text-sm px-6 py-4">TX</th>
              </tr>
            </thead>
            <tbody>
              {paginatedTransactions.map((tx) => (
                <tr key={tx.id} className="border-b border-gray-800/50 table-row-hover">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-dark-300 flex items-center justify-center">
                        {getTypeIcon(tx.type)}
                      </div>
                      {getTypeBadge(tx.type)}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <p className="text-white font-medium">{tx.nft}</p>
                      <p className="text-gray-400 text-xs">{tx.collection}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {tx.from !== '-' ? (
                      <code className="text-sm text-gray-300 bg-dark-300 px-2 py-1 rounded">
                        {tx.from.slice(0, 6)}...{tx.from.slice(-4)}
                      </code>
                    ) : (
                      <span className="text-gray-500">-</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    {tx.to !== '-' ? (
                      <code className="text-sm text-gray-300 bg-dark-300 px-2 py-1 rounded">
                        {tx.to.slice(0, 6)}...{tx.to.slice(-4)}
                      </code>
                    ) : (
                      <span className="text-gray-500">-</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-white font-medium">{tx.amount}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-green-400">{tx.fee}</span>
                  </td>
                  <td className="px-6 py-4 text-gray-400 text-sm whitespace-nowrap">{tx.date}</td>
                  <td className="px-6 py-4">{getStatusBadge(tx.status)}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        className="p-2 rounded-lg hover:bg-dark-300 text-gray-400 hover:text-primary-400 transition-colors"
                        title="View on Explorer"
                      >
                        <ExternalLink className="w-4 h-4" />
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
            {Math.min(currentPage * itemsPerPage, filteredTransactions.length)} of {filteredTransactions.length}
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
    </div>
  )
}

export default Transactions
