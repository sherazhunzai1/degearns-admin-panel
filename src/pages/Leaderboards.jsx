import { useState } from 'react'
import {
  Trophy,
  TrendingUp,
  Crown,
  Star,
  Medal,
  ArrowUp,
  ArrowDown,
  Gift,
  Eye,
  Wallet,
  User,
  Paintbrush,
  Megaphone,
  BarChart3
} from 'lucide-react'

// Mock data for leaderboards
const topTraders = [
  { rank: 1, username: 'CryptoWhale', address: 'rWhale123456789', volume: '2,450,000 XRP', trades: 1245, change: 12.5, avatar: null },
  { rank: 2, username: 'NFTMaster', address: 'rMaster987654321', volume: '1,890,000 XRP', trades: 987, change: 8.3, avatar: null },
  { rank: 3, username: 'DiamondHands', address: 'rDiamond555444333', volume: '1,567,000 XRP', trades: 756, change: -2.1, avatar: null },
  { rank: 4, username: 'TokenKing', address: 'rToken111222333', volume: '1,234,000 XRP', trades: 654, change: 15.7, avatar: null },
  { rank: 5, username: 'ArtCollector', address: 'rArt444555666', volume: '989,000 XRP', trades: 543, change: 5.4, avatar: null },
  { rank: 6, username: 'RareFinder', address: 'rRare777888999', volume: '876,000 XRP', trades: 432, change: -1.2, avatar: null },
  { rank: 7, username: 'GemHunter', address: 'rGem000111222', volume: '765,000 XRP', trades: 321, change: 9.8, avatar: null },
  { rank: 8, username: 'FloorSweeper', address: 'rFloor333444555', volume: '654,000 XRP', trades: 298, change: 3.6, avatar: null },
  { rank: 9, username: 'WhaleCatcher', address: 'rCatcher666777888', volume: '543,000 XRP', trades: 276, change: -4.5, avatar: null },
  { rank: 10, username: 'BluechipHolder', address: 'rBlue999000111', volume: '432,000 XRP', trades: 234, change: 7.2, avatar: null },
]

const topCreators = [
  { rank: 1, username: 'PixelArtist', address: 'rPixel123456789', sales: '1,890,000 XRP', nftsCreated: 456, followers: 12500, change: 18.2, avatar: null },
  { rank: 2, username: 'DigitalDreams', address: 'rDreams987654321', sales: '1,567,000 XRP', nftsCreated: 389, followers: 10200, change: 9.5, avatar: null },
  { rank: 3, username: '3DArtMaster', address: 'r3DArt555444333', sales: '1,234,000 XRP', nftsCreated: 298, followers: 8900, change: 5.8, avatar: null },
  { rank: 4, username: 'AbstractVision', address: 'rAbstract111222333', sales: '987,000 XRP', nftsCreated: 256, followers: 7600, change: -2.3, avatar: null },
  { rank: 5, username: 'CryptoCanvas', address: 'rCanvas444555666', sales: '876,000 XRP', nftsCreated: 234, followers: 6500, change: 12.1, avatar: null },
  { rank: 6, username: 'NeonArtist', address: 'rNeon777888999', sales: '765,000 XRP', nftsCreated: 212, followers: 5800, change: 7.4, avatar: null },
  { rank: 7, username: 'SurrealWorld', address: 'rSurreal000111222', sales: '654,000 XRP', nftsCreated: 189, followers: 4900, change: -1.5, avatar: null },
  { rank: 8, username: 'MotionMaker', address: 'rMotion333444555', sales: '543,000 XRP', nftsCreated: 167, followers: 4200, change: 4.8, avatar: null },
  { rank: 9, username: 'VectorVibes', address: 'rVector666777888', sales: '432,000 XRP', nftsCreated: 145, followers: 3600, change: 8.9, avatar: null },
  { rank: 10, username: 'PolyArtist', address: 'rPoly999000111', sales: '321,000 XRP', nftsCreated: 123, followers: 2800, change: 15.3, avatar: null },
]

const topInfluencers = [
  { rank: 1, username: 'NFTInfluencer1', address: 'rInfluencer123', followers: 125000, engagement: '8.5%', referrals: 2345, earnings: '45,000 XRP', change: 22.5, avatar: null },
  { rank: 2, username: 'CryptoGuru', address: 'rGuru987654321', followers: 98000, engagement: '7.2%', referrals: 1890, earnings: '38,000 XRP', change: 15.3, avatar: null },
  { rank: 3, username: 'NFTExpert', address: 'rExpert555444333', followers: 87000, engagement: '9.1%', referrals: 1567, earnings: '32,000 XRP', change: 8.7, avatar: null },
  { rank: 4, username: 'BlockchainBoss', address: 'rBoss111222333', followers: 76000, engagement: '6.8%', referrals: 1234, earnings: '28,000 XRP', change: -3.2, avatar: null },
  { rank: 5, username: 'CryptoQueen', address: 'rQueen444555666', followers: 65000, engagement: '8.9%', referrals: 1098, earnings: '24,000 XRP', change: 11.4, avatar: null },
  { rank: 6, username: 'NFTWhiz', address: 'rWhiz777888999', followers: 54000, engagement: '7.5%', referrals: 987, earnings: '21,000 XRP', change: 6.8, avatar: null },
  { rank: 7, username: 'TokenTalk', address: 'rTalk000111222', followers: 43000, engagement: '8.2%', referrals: 876, earnings: '18,000 XRP', change: -1.9, avatar: null },
  { rank: 8, username: 'ArtAdvocate', address: 'rAdvocate333444555', followers: 32000, engagement: '9.4%', referrals: 765, earnings: '15,000 XRP', change: 9.5, avatar: null },
  { rank: 9, username: 'DigitalDiva', address: 'rDiva666777888', followers: 28000, engagement: '7.8%', referrals: 654, earnings: '12,000 XRP', change: 4.2, avatar: null },
  { rank: 10, username: 'MetaMaven', address: 'rMaven999000111', followers: 21000, engagement: '8.6%', referrals: 543, earnings: '9,000 XRP', change: 13.7, avatar: null },
]

const getRankBadge = (rank) => {
  if (rank === 1) return <Crown className="w-5 h-5 text-yellow-400" />
  if (rank === 2) return <Medal className="w-5 h-5 text-gray-300" />
  if (rank === 3) return <Medal className="w-5 h-5 text-amber-600" />
  return <span className="text-gray-400 font-bold">#{rank}</span>
}

const Leaderboards = () => {
  const [activeTab, setActiveTab] = useState('traders')
  const [timeRange, setTimeRange] = useState('30d')

  const tabs = [
    { id: 'traders', name: 'Top Traders', icon: BarChart3, color: 'primary' },
    { id: 'creators', name: 'Top Creators', icon: Paintbrush, color: 'purple' },
    { id: 'influencers', name: 'Top Influencers', icon: Megaphone, color: 'orange' },
  ]

  const renderTraderRow = (trader, index) => (
    <tr key={trader.rank} className="border-b border-gray-800/50 table-row-hover" style={{ animationDelay: `${index * 0.05}s` }}>
      <td className="px-6 py-4">
        <div className="flex items-center justify-center w-8 h-8">
          {getRankBadge(trader.rank)}
        </div>
      </td>
      <td className="px-6 py-4">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
            trader.rank <= 3 ? 'bg-gradient-to-br from-yellow-500 to-orange-500' : 'bg-gradient-to-br from-primary-500 to-purple-500'
          }`}>
            <User className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="text-white font-medium">{trader.username}</p>
            <code className="text-gray-400 text-xs">
              {trader.address.slice(0, 6)}...{trader.address.slice(-4)}
            </code>
          </div>
        </div>
      </td>
      <td className="px-6 py-4">
        <p className="text-white font-semibold">{trader.volume}</p>
      </td>
      <td className="px-6 py-4 text-gray-300">{trader.trades.toLocaleString()}</td>
      <td className="px-6 py-4">
        <div className={`flex items-center gap-1 ${trader.change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
          {trader.change >= 0 ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />}
          <span>{Math.abs(trader.change)}%</span>
        </div>
      </td>
      <td className="px-6 py-4">
        <div className="flex items-center gap-2">
          <button className="p-2 rounded-lg hover:bg-dark-300 text-gray-400 hover:text-white transition-colors">
            <Eye className="w-4 h-4" />
          </button>
          <button className="p-2 rounded-lg hover:bg-primary-500/20 text-primary-400 hover:text-primary-300 transition-colors">
            <Gift className="w-4 h-4" />
          </button>
        </div>
      </td>
    </tr>
  )

  const renderCreatorRow = (creator, index) => (
    <tr key={creator.rank} className="border-b border-gray-800/50 table-row-hover" style={{ animationDelay: `${index * 0.05}s` }}>
      <td className="px-6 py-4">
        <div className="flex items-center justify-center w-8 h-8">
          {getRankBadge(creator.rank)}
        </div>
      </td>
      <td className="px-6 py-4">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
            creator.rank <= 3 ? 'bg-gradient-to-br from-purple-500 to-pink-500' : 'bg-gradient-to-br from-primary-500 to-purple-500'
          }`}>
            <Paintbrush className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="text-white font-medium">{creator.username}</p>
            <code className="text-gray-400 text-xs">
              {creator.address.slice(0, 6)}...{creator.address.slice(-4)}
            </code>
          </div>
        </div>
      </td>
      <td className="px-6 py-4">
        <p className="text-white font-semibold">{creator.sales}</p>
      </td>
      <td className="px-6 py-4 text-gray-300">{creator.nftsCreated}</td>
      <td className="px-6 py-4 text-gray-300">{creator.followers.toLocaleString()}</td>
      <td className="px-6 py-4">
        <div className={`flex items-center gap-1 ${creator.change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
          {creator.change >= 0 ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />}
          <span>{Math.abs(creator.change)}%</span>
        </div>
      </td>
      <td className="px-6 py-4">
        <div className="flex items-center gap-2">
          <button className="p-2 rounded-lg hover:bg-dark-300 text-gray-400 hover:text-white transition-colors">
            <Eye className="w-4 h-4" />
          </button>
          <button className="p-2 rounded-lg hover:bg-purple-500/20 text-purple-400 hover:text-purple-300 transition-colors">
            <Gift className="w-4 h-4" />
          </button>
        </div>
      </td>
    </tr>
  )

  const renderInfluencerRow = (influencer, index) => (
    <tr key={influencer.rank} className="border-b border-gray-800/50 table-row-hover" style={{ animationDelay: `${index * 0.05}s` }}>
      <td className="px-6 py-4">
        <div className="flex items-center justify-center w-8 h-8">
          {getRankBadge(influencer.rank)}
        </div>
      </td>
      <td className="px-6 py-4">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
            influencer.rank <= 3 ? 'bg-gradient-to-br from-orange-500 to-red-500' : 'bg-gradient-to-br from-primary-500 to-purple-500'
          }`}>
            <Megaphone className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="text-white font-medium">{influencer.username}</p>
            <code className="text-gray-400 text-xs">
              {influencer.address.slice(0, 6)}...{influencer.address.slice(-4)}
            </code>
          </div>
        </div>
      </td>
      <td className="px-6 py-4 text-gray-300">{influencer.followers.toLocaleString()}</td>
      <td className="px-6 py-4 text-gray-300">{influencer.engagement}</td>
      <td className="px-6 py-4 text-gray-300">{influencer.referrals.toLocaleString()}</td>
      <td className="px-6 py-4">
        <p className="text-white font-semibold">{influencer.earnings}</p>
      </td>
      <td className="px-6 py-4">
        <div className={`flex items-center gap-1 ${influencer.change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
          {influencer.change >= 0 ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />}
          <span>{Math.abs(influencer.change)}%</span>
        </div>
      </td>
      <td className="px-6 py-4">
        <div className="flex items-center gap-2">
          <button className="p-2 rounded-lg hover:bg-dark-300 text-gray-400 hover:text-white transition-colors">
            <Eye className="w-4 h-4" />
          </button>
          <button className="p-2 rounded-lg hover:bg-orange-500/20 text-orange-400 hover:text-orange-300 transition-colors">
            <Gift className="w-4 h-4" />
          </button>
        </div>
      </td>
    </tr>
  )

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-white">Leaderboards</h2>
          <p className="text-gray-400 text-sm mt-1">Top performers on the platform</p>
        </div>
        <select
          value={timeRange}
          onChange={(e) => setTimeRange(e.target.value)}
          className="input-field w-full sm:w-40"
        >
          <option value="7d">Last 7 days</option>
          <option value="30d">Last 30 days</option>
          <option value="90d">Last 90 days</option>
          <option value="all">All time</option>
        </select>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="stat-card">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-primary-500/20 flex items-center justify-center">
              <BarChart3 className="w-5 h-5 text-primary-400" />
            </div>
            <div>
              <p className="text-gray-400 text-sm">Top Trader Volume</p>
              <p className="text-xl font-bold text-white">2,450,000 XRP</p>
            </div>
          </div>
          <p className="text-sm text-gray-400">CryptoWhale • 1,245 trades</p>
        </div>

        <div className="stat-card">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center">
              <Paintbrush className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <p className="text-gray-400 text-sm">Top Creator Sales</p>
              <p className="text-xl font-bold text-white">1,890,000 XRP</p>
            </div>
          </div>
          <p className="text-sm text-gray-400">PixelArtist • 456 NFTs created</p>
        </div>

        <div className="stat-card">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-orange-500/20 flex items-center justify-center">
              <Megaphone className="w-5 h-5 text-orange-400" />
            </div>
            <div>
              <p className="text-gray-400 text-sm">Top Influencer Earnings</p>
              <p className="text-xl font-bold text-white">45,000 XRP</p>
            </div>
          </div>
          <p className="text-sm text-gray-400">NFTInfluencer1 • 125K followers</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 p-1 bg-dark-300 rounded-xl">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
              activeTab === tab.id
                ? tab.color === 'primary' ? 'bg-primary-500 text-white' :
                  tab.color === 'purple' ? 'bg-purple-500 text-white' :
                  'bg-orange-500 text-white'
                : 'text-gray-400 hover:text-white hover:bg-dark-200'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.name}
          </button>
        ))}
      </div>

      {/* Leaderboard Table */}
      <div className="rounded-xl bg-dark-200 border border-gray-800 overflow-hidden">
        <div className="overflow-x-auto">
          {activeTab === 'traders' && (
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-800">
                  <th className="text-left text-gray-400 font-medium text-sm px-6 py-4 w-16">Rank</th>
                  <th className="text-left text-gray-400 font-medium text-sm px-6 py-4">Trader</th>
                  <th className="text-left text-gray-400 font-medium text-sm px-6 py-4">Volume</th>
                  <th className="text-left text-gray-400 font-medium text-sm px-6 py-4">Trades</th>
                  <th className="text-left text-gray-400 font-medium text-sm px-6 py-4">Change</th>
                  <th className="text-left text-gray-400 font-medium text-sm px-6 py-4 w-24">Actions</th>
                </tr>
              </thead>
              <tbody>
                {topTraders.map((trader, index) => renderTraderRow(trader, index))}
              </tbody>
            </table>
          )}

          {activeTab === 'creators' && (
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-800">
                  <th className="text-left text-gray-400 font-medium text-sm px-6 py-4 w-16">Rank</th>
                  <th className="text-left text-gray-400 font-medium text-sm px-6 py-4">Creator</th>
                  <th className="text-left text-gray-400 font-medium text-sm px-6 py-4">Sales</th>
                  <th className="text-left text-gray-400 font-medium text-sm px-6 py-4">NFTs</th>
                  <th className="text-left text-gray-400 font-medium text-sm px-6 py-4">Followers</th>
                  <th className="text-left text-gray-400 font-medium text-sm px-6 py-4">Change</th>
                  <th className="text-left text-gray-400 font-medium text-sm px-6 py-4 w-24">Actions</th>
                </tr>
              </thead>
              <tbody>
                {topCreators.map((creator, index) => renderCreatorRow(creator, index))}
              </tbody>
            </table>
          )}

          {activeTab === 'influencers' && (
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-800">
                  <th className="text-left text-gray-400 font-medium text-sm px-6 py-4 w-16">Rank</th>
                  <th className="text-left text-gray-400 font-medium text-sm px-6 py-4">Influencer</th>
                  <th className="text-left text-gray-400 font-medium text-sm px-6 py-4">Followers</th>
                  <th className="text-left text-gray-400 font-medium text-sm px-6 py-4">Engagement</th>
                  <th className="text-left text-gray-400 font-medium text-sm px-6 py-4">Referrals</th>
                  <th className="text-left text-gray-400 font-medium text-sm px-6 py-4">Earnings</th>
                  <th className="text-left text-gray-400 font-medium text-sm px-6 py-4">Change</th>
                  <th className="text-left text-gray-400 font-medium text-sm px-6 py-4 w-24">Actions</th>
                </tr>
              </thead>
              <tbody>
                {topInfluencers.map((influencer, index) => renderInfluencerRow(influencer, index))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Reward All Button */}
      <div className="flex justify-end">
        <button className="btn-primary flex items-center gap-2">
          <Gift className="w-4 h-4" />
          Reward Top 10 {activeTab === 'traders' ? 'Traders' : activeTab === 'creators' ? 'Creators' : 'Influencers'}
        </button>
      </div>
    </div>
  )
}

export default Leaderboards
