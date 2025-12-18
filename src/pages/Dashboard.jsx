import { useState, useEffect } from 'react'
import {
  TrendingUp,
  TrendingDown,
  Users,
  Image,
  ArrowLeftRight,
  DollarSign,
  Activity,
  Eye,
  ShoppingCart,
  Percent
} from 'lucide-react'
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts'

// Mock data for charts
const volumeData = [
  { name: 'Jan', volume: 4000, trades: 240 },
  { name: 'Feb', volume: 3000, trades: 198 },
  { name: 'Mar', volume: 5000, trades: 320 },
  { name: 'Apr', volume: 4500, trades: 280 },
  { name: 'May', volume: 6000, trades: 390 },
  { name: 'Jun', volume: 5500, trades: 350 },
  { name: 'Jul', volume: 7000, trades: 420 },
]

const nftCategoryData = [
  { name: 'Art', value: 35 },
  { name: 'Gaming', value: 25 },
  { name: 'Music', value: 20 },
  { name: 'Collectibles', value: 15 },
  { name: 'Other', value: 5 },
]

const userActivityData = [
  { name: 'Mon', active: 2400, new: 400 },
  { name: 'Tue', active: 1398, new: 300 },
  { name: 'Wed', active: 9800, new: 500 },
  { name: 'Thu', active: 3908, new: 450 },
  { name: 'Fri', active: 4800, new: 600 },
  { name: 'Sat', active: 3800, new: 350 },
  { name: 'Sun', active: 4300, new: 420 },
]

const recentTransactions = [
  { id: 1, type: 'Sale', nft: 'Cosmic Dreams #124', price: '2,500 XRP', time: '2 mins ago', status: 'completed' },
  { id: 2, type: 'Listing', nft: 'Abstract Wave #89', price: '1,200 XRP', time: '5 mins ago', status: 'pending' },
  { id: 3, type: 'Transfer', nft: 'Digital Galaxy #45', price: '-', time: '12 mins ago', status: 'completed' },
  { id: 4, type: 'Sale', nft: 'Neon City #201', price: '5,800 XRP', time: '18 mins ago', status: 'completed' },
  { id: 5, type: 'Auction', nft: 'Ethereal Being #67', price: '3,200 XRP', time: '25 mins ago', status: 'active' },
]

const COLORS = ['#0ea5e9', '#8b5cf6', '#10b981', '#f59e0b', '#6366f1']

const StatCard = ({ title, value, change, changeType, icon: Icon, color }) => (
  <div className="stat-card">
    <div className="flex items-center justify-between mb-4">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color}`}>
        <Icon className="w-6 h-6 text-white" />
      </div>
      {change && (
        <div className={`flex items-center gap-1 text-sm ${changeType === 'up' ? 'text-green-400' : 'text-red-400'}`}>
          {changeType === 'up' ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
          <span>{change}%</span>
        </div>
      )}
    </div>
    <h3 className="text-gray-400 text-sm font-medium mb-1">{title}</h3>
    <p className="text-2xl font-bold text-white">{value}</p>
  </div>
)

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalVolume: '1,234,567',
    totalNFTs: '45,678',
    totalUsers: '12,345',
    totalTransactions: '98,765',
    platformFees: '24,567',
    activeListings: '8,901',
    avgSalePrice: '1,234',
    dailyActiveUsers: '3,456'
  })

  const [loading, setLoading] = useState(false)

  // Custom tooltip for charts
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="glass rounded-lg p-3 border border-gray-700">
          <p className="text-white font-medium mb-1">{label}</p>
          {payload.map((entry, index) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: {entry.value.toLocaleString()}
            </p>
          ))}
        </div>
      )
    }
    return null
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Volume (XRP)"
          value={stats.totalVolume}
          change="12.5"
          changeType="up"
          icon={DollarSign}
          color="bg-gradient-to-br from-primary-500 to-primary-600"
        />
        <StatCard
          title="Total NFTs"
          value={stats.totalNFTs}
          change="8.2"
          changeType="up"
          icon={Image}
          color="bg-gradient-to-br from-purple-500 to-purple-600"
        />
        <StatCard
          title="Total Users"
          value={stats.totalUsers}
          change="15.3"
          changeType="up"
          icon={Users}
          color="bg-gradient-to-br from-green-500 to-green-600"
        />
        <StatCard
          title="Transactions"
          value={stats.totalTransactions}
          change="5.7"
          changeType="up"
          icon={ArrowLeftRight}
          color="bg-gradient-to-br from-orange-500 to-orange-600"
        />
      </div>

      {/* Secondary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Platform Fees (XRP)"
          value={stats.platformFees}
          change="18.4"
          changeType="up"
          icon={Percent}
          color="bg-gradient-to-br from-pink-500 to-pink-600"
        />
        <StatCard
          title="Active Listings"
          value={stats.activeListings}
          change="3.1"
          changeType="down"
          icon={ShoppingCart}
          color="bg-gradient-to-br from-cyan-500 to-cyan-600"
        />
        <StatCard
          title="Avg Sale Price (XRP)"
          value={stats.avgSalePrice}
          change="7.8"
          changeType="up"
          icon={Activity}
          color="bg-gradient-to-br from-indigo-500 to-indigo-600"
        />
        <StatCard
          title="Daily Active Users"
          value={stats.dailyActiveUsers}
          change="22.1"
          changeType="up"
          icon={Eye}
          color="bg-gradient-to-br from-rose-500 to-rose-600"
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Volume Chart */}
        <div className="p-6 rounded-xl bg-dark-200 border border-gray-800">
          <h3 className="text-lg font-semibold text-white mb-4">Trading Volume</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={volumeData}>
                <defs>
                  <linearGradient id="volumeGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="name" stroke="#9ca3af" />
                <YAxis stroke="#9ca3af" />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone"
                  dataKey="volume"
                  stroke="#0ea5e9"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#volumeGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* NFT Categories */}
        <div className="p-6 rounded-xl bg-dark-200 border border-gray-800">
          <h3 className="text-lg font-semibold text-white mb-4">NFT Categories</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={nftCategoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {nftCategoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend
                  formatter={(value) => <span className="text-gray-300">{value}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* User Activity & Recent Transactions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User Activity Chart */}
        <div className="p-6 rounded-xl bg-dark-200 border border-gray-800">
          <h3 className="text-lg font-semibold text-white mb-4">User Activity</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={userActivityData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="name" stroke="#9ca3af" />
                <YAxis stroke="#9ca3af" />
                <Tooltip content={<CustomTooltip />} />
                <Legend
                  formatter={(value) => <span className="text-gray-300">{value}</span>}
                />
                <Bar dataKey="active" name="Active Users" fill="#0ea5e9" radius={[4, 4, 0, 0]} />
                <Bar dataKey="new" name="New Users" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="p-6 rounded-xl bg-dark-200 border border-gray-800">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">Recent Transactions</h3>
            <a href="/transactions" className="text-primary-400 text-sm hover:text-primary-300">
              View All →
            </a>
          </div>
          <div className="space-y-3">
            {recentTransactions.map((tx) => (
              <div
                key={tx.id}
                className="flex items-center justify-between p-3 rounded-lg bg-dark-300 table-row-hover"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    tx.type === 'Sale' ? 'bg-green-500/20' :
                    tx.type === 'Listing' ? 'bg-blue-500/20' :
                    tx.type === 'Transfer' ? 'bg-purple-500/20' :
                    'bg-orange-500/20'
                  }`}>
                    <ArrowLeftRight className={`w-5 h-5 ${
                      tx.type === 'Sale' ? 'text-green-400' :
                      tx.type === 'Listing' ? 'text-blue-400' :
                      tx.type === 'Transfer' ? 'text-purple-400' :
                      'text-orange-400'
                    }`} />
                  </div>
                  <div>
                    <p className="text-white font-medium text-sm">{tx.nft}</p>
                    <p className="text-gray-400 text-xs">{tx.type} • {tx.time}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-white font-medium text-sm">{tx.price}</p>
                  <span className={`badge ${
                    tx.status === 'completed' ? 'badge-success' :
                    tx.status === 'pending' ? 'badge-warning' :
                    'badge-info'
                  }`}>
                    {tx.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="p-6 rounded-xl bg-dark-200 border border-gray-800">
        <h3 className="text-lg font-semibold text-white mb-4">Platform Overview</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-4 rounded-lg bg-dark-300">
            <p className="text-3xl font-bold text-primary-400 mb-1">2.5%</p>
            <p className="text-gray-400 text-sm">Platform Fee</p>
          </div>
          <div className="text-center p-4 rounded-lg bg-dark-300">
            <p className="text-3xl font-bold text-green-400 mb-1">99.9%</p>
            <p className="text-gray-400 text-sm">Uptime</p>
          </div>
          <div className="text-center p-4 rounded-lg bg-dark-300">
            <p className="text-3xl font-bold text-purple-400 mb-1">1.2s</p>
            <p className="text-gray-400 text-sm">Avg Response</p>
          </div>
          <div className="text-center p-4 rounded-lg bg-dark-300">
            <p className="text-3xl font-bold text-orange-400 mb-1">847</p>
            <p className="text-gray-400 text-sm">Active Auctions</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
