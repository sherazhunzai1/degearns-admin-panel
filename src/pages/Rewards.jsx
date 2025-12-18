import { useState } from 'react'
import {
  Gift,
  Send,
  Search,
  Plus,
  Trophy,
  History,
  CheckCircle,
  Clock,
  X,
  AlertCircle,
  User,
  Wallet,
  Calendar,
  Filter,
  Download,
  RefreshCw,
  Crown,
  Medal,
  Star
} from 'lucide-react'

// Mock reward history
const rewardHistory = [
  { id: 1, recipient: 'CryptoWhale', address: 'rWhale123456789', amount: '5,000 XRP', type: 'Top Trader', date: '2024-06-15', status: 'completed', txHash: 'ABC123...' },
  { id: 2, recipient: 'PixelArtist', address: 'rPixel123456789', amount: '3,000 XRP', type: 'Top Creator', date: '2024-06-15', status: 'completed', txHash: 'DEF456...' },
  { id: 3, recipient: 'NFTInfluencer1', address: 'rInfluencer123', amount: '2,500 XRP', type: 'Top Influencer', date: '2024-06-15', status: 'pending', txHash: '-' },
  { id: 4, recipient: 'NFTMaster', address: 'rMaster987654321', amount: '4,000 XRP', type: 'Weekly Bonus', date: '2024-06-14', status: 'completed', txHash: 'GHI789...' },
  { id: 5, recipient: 'DigitalDreams', address: 'rDreams987654321', amount: '2,000 XRP', type: 'Top Creator', date: '2024-06-14', status: 'completed', txHash: 'JKL012...' },
  { id: 6, recipient: 'CryptoGuru', address: 'rGuru987654321', amount: '1,500 XRP', type: 'Referral Bonus', date: '2024-06-13', status: 'completed', txHash: 'MNO345...' },
  { id: 7, recipient: 'DiamondHands', address: 'rDiamond555444333', amount: '3,500 XRP', type: 'Top Trader', date: '2024-06-13', status: 'failed', txHash: '-' },
  { id: 8, recipient: 'TokenKing', address: 'rToken111222333', amount: '2,800 XRP', type: 'Monthly Bonus', date: '2024-06-12', status: 'completed', txHash: 'PQR678...' },
]

// Mock recipients for quick select
const quickRecipients = [
  { username: 'CryptoWhale', address: 'rWhale123456789', type: 'Top Trader', rank: 1 },
  { username: 'PixelArtist', address: 'rPixel123456789', type: 'Top Creator', rank: 1 },
  { username: 'NFTInfluencer1', address: 'rInfluencer123', type: 'Top Influencer', rank: 1 },
  { username: 'NFTMaster', address: 'rMaster987654321', type: 'Top Trader', rank: 2 },
  { username: 'DigitalDreams', address: 'rDreams987654321', type: 'Top Creator', rank: 2 },
]

const rewardPresets = [
  { name: 'Top Trader Reward', amount: 5000, description: 'Monthly reward for top trader' },
  { name: 'Top Creator Reward', amount: 3000, description: 'Monthly reward for top creator' },
  { name: 'Top Influencer Reward', amount: 2500, description: 'Monthly reward for top influencer' },
  { name: 'Weekly Bonus', amount: 1000, description: 'Weekly performance bonus' },
  { name: 'Referral Bonus', amount: 500, description: 'User referral bonus' },
]

const Rewards = () => {
  const [showSendModal, setShowSendModal] = useState(false)
  const [showBatchModal, setShowBatchModal] = useState(false)
  const [selectedRecipient, setSelectedRecipient] = useState(null)
  const [rewardAmount, setRewardAmount] = useState('')
  const [rewardNote, setRewardNote] = useState('')
  const [rewardType, setRewardType] = useState('manual')
  const [searchQuery, setSearchQuery] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [isSending, setIsSending] = useState(false)
  const [sendSuccess, setSendSuccess] = useState(false)

  const poolBalance = '125,000 XRP'
  const totalRewarded = '89,500 XRP'
  const pendingRewards = '3,500 XRP'

  const filteredHistory = rewardHistory.filter(reward => {
    const matchesSearch =
      reward.recipient.toLowerCase().includes(searchQuery.toLowerCase()) ||
      reward.address.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = filterStatus === 'all' || reward.status === filterStatus
    return matchesSearch && matchesStatus
  })

  const handleSendReward = async () => {
    if (!selectedRecipient || !rewardAmount) return

    setIsSending(true)
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000))
    setIsSending(false)
    setSendSuccess(true)

    setTimeout(() => {
      setSendSuccess(false)
      setShowSendModal(false)
      setSelectedRecipient(null)
      setRewardAmount('')
      setRewardNote('')
    }, 2000)
  }

  const selectPreset = (preset) => {
    setRewardAmount(preset.amount.toString())
    setRewardType(preset.name)
  }

  const getStatusBadge = (status) => {
    switch (status) {
      case 'completed':
        return (
          <span className="badge badge-success flex items-center gap-1">
            <CheckCircle className="w-3 h-3" />
            Completed
          </span>
        )
      case 'pending':
        return (
          <span className="badge badge-warning flex items-center gap-1">
            <Clock className="w-3 h-3" />
            Pending
          </span>
        )
      case 'failed':
        return (
          <span className="badge badge-danger flex items-center gap-1">
            <X className="w-3 h-3" />
            Failed
          </span>
        )
      default:
        return <span className="badge badge-info">{status}</span>
    }
  }

  const getRankIcon = (rank) => {
    if (rank === 1) return <Crown className="w-4 h-4 text-yellow-400" />
    if (rank === 2) return <Medal className="w-4 h-4 text-gray-300" />
    return <Star className="w-4 h-4 text-orange-400" />
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-white">Rewards Management</h2>
          <p className="text-gray-400 text-sm mt-1">Send rewards to top performers</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowBatchModal(true)}
            className="btn-secondary flex items-center gap-2"
          >
            <Trophy className="w-4 h-4" />
            Batch Reward
          </button>
          <button
            onClick={() => setShowSendModal(true)}
            className="btn-primary flex items-center gap-2"
          >
            <Send className="w-4 h-4" />
            Send Reward
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="stat-card">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-green-500/20 flex items-center justify-center">
              <Wallet className="w-5 h-5 text-green-400" />
            </div>
            <div>
              <p className="text-gray-400 text-sm">Reward Pool Balance</p>
              <p className="text-2xl font-bold text-white">{poolBalance}</p>
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-primary-500/20 flex items-center justify-center">
              <Gift className="w-5 h-5 text-primary-400" />
            </div>
            <div>
              <p className="text-gray-400 text-sm">Total Rewarded</p>
              <p className="text-2xl font-bold text-white">{totalRewarded}</p>
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-yellow-500/20 flex items-center justify-center">
              <Clock className="w-5 h-5 text-yellow-400" />
            </div>
            <div>
              <p className="text-gray-400 text-sm">Pending Rewards</p>
              <p className="text-2xl font-bold text-white">{pendingRewards}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Recipients */}
      <div className="p-6 rounded-xl bg-dark-200 border border-gray-800">
        <h3 className="text-lg font-semibold text-white mb-4">Quick Reward - Top Performers</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {quickRecipients.map((recipient, index) => (
            <button
              key={index}
              onClick={() => {
                setSelectedRecipient(recipient)
                setShowSendModal(true)
              }}
              className="p-4 rounded-xl bg-dark-300 border border-gray-700 hover:border-primary-500/50 transition-all group"
            >
              <div className="flex items-center gap-2 mb-2">
                {getRankIcon(recipient.rank)}
                <span className="text-xs text-gray-400">{recipient.type}</span>
              </div>
              <p className="text-white font-medium group-hover:text-primary-400 transition-colors">
                {recipient.username}
              </p>
              <code className="text-xs text-gray-500">
                {recipient.address.slice(0, 6)}...{recipient.address.slice(-4)}
              </code>
            </button>
          ))}
        </div>
      </div>

      {/* Reward History */}
      <div className="rounded-xl bg-dark-200 border border-gray-800 overflow-hidden">
        <div className="p-4 border-b border-gray-800 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            <History className="w-5 h-5 text-gray-400" />
            Reward History
          </h3>
          <div className="flex items-center gap-4">
            <div className="relative flex-1 sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="input-field pl-10 py-2 text-sm"
              />
            </div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="input-field w-32 py-2 text-sm"
            >
              <option value="all">All Status</option>
              <option value="completed">Completed</option>
              <option value="pending">Pending</option>
              <option value="failed">Failed</option>
            </select>
            <button className="p-2 rounded-lg bg-dark-300 hover:bg-dark-100 text-gray-400 hover:text-white transition-colors">
              <Download className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-800">
                <th className="text-left text-gray-400 font-medium text-sm px-6 py-4">Recipient</th>
                <th className="text-left text-gray-400 font-medium text-sm px-6 py-4">Amount</th>
                <th className="text-left text-gray-400 font-medium text-sm px-6 py-4">Type</th>
                <th className="text-left text-gray-400 font-medium text-sm px-6 py-4">Date</th>
                <th className="text-left text-gray-400 font-medium text-sm px-6 py-4">Status</th>
                <th className="text-left text-gray-400 font-medium text-sm px-6 py-4">TX Hash</th>
              </tr>
            </thead>
            <tbody>
              {filteredHistory.map((reward) => (
                <tr key={reward.id} className="border-b border-gray-800/50 table-row-hover">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-500 to-purple-500 flex items-center justify-center">
                        <User className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <p className="text-white font-medium">{reward.recipient}</p>
                        <code className="text-gray-400 text-xs">
                          {reward.address.slice(0, 6)}...{reward.address.slice(-4)}
                        </code>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-white font-semibold">{reward.amount}</p>
                  </td>
                  <td className="px-6 py-4">
                    <span className="badge badge-info">{reward.type}</span>
                  </td>
                  <td className="px-6 py-4 text-gray-400">{reward.date}</td>
                  <td className="px-6 py-4">{getStatusBadge(reward.status)}</td>
                  <td className="px-6 py-4">
                    {reward.txHash !== '-' ? (
                      <code className="text-primary-400 text-sm hover:underline cursor-pointer">
                        {reward.txHash}
                      </code>
                    ) : (
                      <span className="text-gray-500">-</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Send Reward Modal */}
      {showSendModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70" onClick={() => !isSending && setShowSendModal(false)} />
          <div className="relative w-full max-w-lg bg-dark-300 rounded-2xl border border-gray-800 overflow-hidden animate-fade-in">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800">
              <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                <Gift className="w-5 h-5 text-primary-400" />
                Send Reward
              </h3>
              <button
                onClick={() => !isSending && setShowSendModal(false)}
                className="p-2 rounded-lg hover:bg-dark-200 text-gray-400"
                disabled={isSending}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6">
              {sendSuccess ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="w-8 h-8 text-green-400" />
                  </div>
                  <h4 className="text-xl font-semibold text-white mb-2">Reward Sent!</h4>
                  <p className="text-gray-400">The reward has been successfully sent.</p>
                </div>
              ) : (
                <>
                  {/* Recipient */}
                  <div>
                    <label className="block text-gray-300 text-sm font-medium mb-2">Recipient</label>
                    {selectedRecipient ? (
                      <div className="flex items-center justify-between p-4 rounded-xl bg-dark-400 border border-gray-700">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-purple-500 flex items-center justify-center">
                            <User className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <p className="text-white font-medium">{selectedRecipient.username}</p>
                            <code className="text-gray-400 text-xs">{selectedRecipient.address}</code>
                          </div>
                        </div>
                        <button
                          onClick={() => setSelectedRecipient(null)}
                          className="p-2 rounded-lg hover:bg-dark-300 text-gray-400"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                          type="text"
                          placeholder="Search by username or wallet address..."
                          className="input-field pl-10"
                        />
                      </div>
                    )}
                  </div>

                  {/* Reward Presets */}
                  <div>
                    <label className="block text-gray-300 text-sm font-medium mb-2">Quick Presets</label>
                    <div className="grid grid-cols-2 gap-2">
                      {rewardPresets.slice(0, 4).map((preset, index) => (
                        <button
                          key={index}
                          onClick={() => selectPreset(preset)}
                          className={`p-3 rounded-lg border text-left transition-all ${
                            rewardAmount === preset.amount.toString()
                              ? 'bg-primary-500/20 border-primary-500'
                              : 'bg-dark-400 border-gray-700 hover:border-gray-600'
                          }`}
                        >
                          <p className="text-white font-medium text-sm">{preset.name}</p>
                          <p className="text-primary-400 font-semibold">{preset.amount.toLocaleString()} XRP</p>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Amount */}
                  <div>
                    <label className="block text-gray-300 text-sm font-medium mb-2">Amount (XRP)</label>
                    <input
                      type="number"
                      value={rewardAmount}
                      onChange={(e) => setRewardAmount(e.target.value)}
                      placeholder="Enter amount"
                      className="input-field"
                    />
                  </div>

                  {/* Note */}
                  <div>
                    <label className="block text-gray-300 text-sm font-medium mb-2">Note (Optional)</label>
                    <textarea
                      value={rewardNote}
                      onChange={(e) => setRewardNote(e.target.value)}
                      placeholder="Add a note for this reward..."
                      rows={3}
                      className="input-field resize-none"
                    />
                  </div>

                  {/* Warning */}
                  <div className="p-4 rounded-xl bg-yellow-500/10 border border-yellow-500/30 flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-yellow-400 text-sm">
                        This will send <strong>{rewardAmount || '0'} XRP</strong> from the reward pool.
                        Please verify the recipient and amount before confirming.
                      </p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setShowSendModal(false)}
                      className="btn-secondary flex-1"
                      disabled={isSending}
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSendReward}
                      disabled={!selectedRecipient || !rewardAmount || isSending}
                      className="btn-primary flex-1 flex items-center justify-center gap-2"
                    >
                      {isSending ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          Sending...
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4" />
                          Send Reward
                        </>
                      )}
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Batch Reward Modal */}
      {showBatchModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70" onClick={() => setShowBatchModal(false)} />
          <div className="relative w-full max-w-2xl bg-dark-300 rounded-2xl border border-gray-800 overflow-hidden animate-fade-in">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800">
              <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                <Trophy className="w-5 h-5 text-yellow-400" />
                Batch Reward - Top Performers
              </h3>
              <button
                onClick={() => setShowBatchModal(false)}
                className="p-2 rounded-lg hover:bg-dark-200 text-gray-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6">
              <p className="text-gray-400">
                Send rewards to all top 10 performers in a selected category. The amounts are based on their ranking.
              </p>

              {/* Category Selection */}
              <div className="grid grid-cols-3 gap-4">
                {[
                  { name: 'Top Traders', icon: '📈', total: '50,000 XRP' },
                  { name: 'Top Creators', icon: '🎨', total: '30,000 XRP' },
                  { name: 'Top Influencers', icon: '📣', total: '25,000 XRP' }
                ].map((category, index) => (
                  <button
                    key={index}
                    className="p-4 rounded-xl bg-dark-400 border border-gray-700 hover:border-primary-500/50 transition-all text-center"
                  >
                    <span className="text-3xl mb-2 block">{category.icon}</span>
                    <p className="text-white font-medium mb-1">{category.name}</p>
                    <p className="text-primary-400 font-semibold text-sm">{category.total}</p>
                  </button>
                ))}
              </div>

              {/* Reward Distribution Preview */}
              <div className="p-4 rounded-xl bg-dark-400 border border-gray-700">
                <h4 className="text-white font-medium mb-3">Reward Distribution</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between text-gray-400">
                    <span>🥇 Rank 1</span>
                    <span className="text-white">10,000 XRP</span>
                  </div>
                  <div className="flex justify-between text-gray-400">
                    <span>🥈 Rank 2</span>
                    <span className="text-white">8,000 XRP</span>
                  </div>
                  <div className="flex justify-between text-gray-400">
                    <span>🥉 Rank 3</span>
                    <span className="text-white">6,000 XRP</span>
                  </div>
                  <div className="flex justify-between text-gray-400">
                    <span>Rank 4-10</span>
                    <span className="text-white">~3,714 XRP each</span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setShowBatchModal(false)}
                  className="btn-secondary flex-1"
                >
                  Cancel
                </button>
                <button className="btn-primary flex-1 flex items-center justify-center gap-2">
                  <Send className="w-4 h-4" />
                  Send Batch Rewards
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Rewards
