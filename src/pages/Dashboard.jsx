import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
  TrendingUp,
  Users,
  Layers,
  FolderOpen,
  DollarSign,
  Activity,
  MessageSquare,
  Loader2,
  Trophy,
  Palette,
  Megaphone,
  ShoppingCart,
  ShieldCheck,
  ChevronLeft,
  ChevronRight
} from 'lucide-react'
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts'
import {
  fetchDashboardOverview,
  fetchGrowthData,
  fetchTopCreators,
  fetchPlatformHealth,
  fetchRevenueData
} from '../store/slices/dashboardSlice'
import { fetchTopPerformers } from '../store/slices/rewardsSlice'

const COLORS = ['#0ea5e9', '#8b5cf6', '#10b981', '#f59e0b', '#6366f1']

const StatCard = ({ title, value, subValue, icon: Icon, color, loading }) => (
  <div className="stat-card">
    <div className="flex items-center justify-between mb-4">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color}`}>
        <Icon className="w-6 h-6 text-white" />
      </div>
    </div>
    <h3 className="text-gray-400 text-sm font-medium mb-1">{title}</h3>
    {loading ? (
      <div className="h-8 bg-dark-300 rounded animate-pulse"></div>
    ) : (
      <>
        <p className="text-2xl font-bold text-white">{value}</p>
        {subValue && <p className="text-xs text-gray-400 mt-1">{subValue}</p>}
      </>
    )}
  </div>
)

const PerformerCard = ({ performer, rank, type }) => {
  const user = performer.user || {}

  const getMetricValue = () => {
    switch (type) {
      case 'trader':
        return `${parseFloat(performer.totalSpentXrp || 0).toLocaleString()} XRP`
      case 'creator':
        return `${parseFloat(performer.totalRevenueXrp || 0).toLocaleString()} XRP`
      case 'influencer':
        return `${(performer.engagementScore || 0).toLocaleString()} pts`
      default:
        return '-'
    }
  }

  const getMetricLabel = () => {
    switch (type) {
      case 'trader':
        return `${performer.mintCount || 0} mints`
      case 'creator':
        return `${performer.totalMints || 0} mints • ${performer.dropCount || 0} drops`
      case 'influencer':
        return `${performer.totalFollowers || 0} followers`
      default:
        return ''
    }
  }

  const getRankBadge = () => {
    if (rank === 1) return 'bg-gradient-to-br from-yellow-400 to-yellow-600'
    if (rank === 2) return 'bg-gradient-to-br from-gray-300 to-gray-500'
    if (rank === 3) return 'bg-gradient-to-br from-amber-600 to-amber-800'
    return 'bg-gradient-to-br from-gray-600 to-gray-700'
  }

  return (
    <div className="flex items-center justify-between p-3 rounded-lg bg-dark-300 hover:bg-dark-400 transition-colors">
      <div className="flex items-center gap-3">
        <div className={`w-8 h-8 rounded-full ${getRankBadge()} flex items-center justify-center text-white text-sm font-bold`}>
          {rank}
        </div>
        {user.profileImage ? (
          <img src={user.profileImage} alt={user.username} className="w-10 h-10 rounded-full object-cover" />
        ) : (
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-purple-500 flex items-center justify-center">
            <span className="text-white font-medium text-sm">
              {(user.username || 'U')[0].toUpperCase()}
            </span>
          </div>
        )}
        <div>
          <div className="flex items-center gap-1.5">
            <p className="text-white font-medium text-sm">{user.username || 'Unknown'}</p>
            {user.isVerified && <ShieldCheck className="w-3.5 h-3.5 text-primary-400" />}
          </div>
          <p className="text-xs text-gray-400">{getMetricLabel()}</p>
        </div>
      </div>
      <div className="text-right">
        <p className="text-white font-semibold text-sm">{getMetricValue()}</p>
      </div>
    </div>
  )
}

const Dashboard = () => {
  const dispatch = useDispatch()
  const { overview, growth, topCreators, health, revenue, loading } = useSelector((state) => state.dashboard)
  const { topPerformers, performersLoading } = useSelector((state) => state.rewards)

  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1)
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())

  useEffect(() => {
    dispatch(fetchDashboardOverview())
    dispatch(fetchGrowthData('30d'))
    dispatch(fetchTopCreators({ metric: 'mints', limit: 5 }))
    dispatch(fetchPlatformHealth())
    dispatch(fetchRevenueData('30d'))
  }, [dispatch])

  useEffect(() => {
    dispatch(fetchTopPerformers({ month: selectedMonth, year: selectedYear, limit: 10 }))
  }, [dispatch, selectedMonth, selectedYear])

  const handlePreviousMonth = () => {
    if (selectedMonth === 1) {
      setSelectedMonth(12)
      setSelectedYear(prev => prev - 1)
    } else {
      setSelectedMonth(prev => prev - 1)
    }
  }

  const handleNextMonth = () => {
    const now = new Date()
    const currentMonth = now.getMonth() + 1
    const currentYear = now.getFullYear()

    if (selectedYear < currentYear || (selectedYear === currentYear && selectedMonth < currentMonth)) {
      if (selectedMonth === 12) {
        setSelectedMonth(1)
        setSelectedYear(prev => prev + 1)
      } else {
        setSelectedMonth(prev => prev + 1)
      }
    }
  }

  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
                      'July', 'August', 'September', 'October', 'November', 'December']

  // Custom tooltip for charts
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="glass rounded-lg p-3 border border-gray-700">
          <p className="text-white font-medium mb-1">{label}</p>
          {payload.map((entry, index) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: {entry.value?.toLocaleString()}
            </p>
          ))}
        </div>
      )
    }
    return null
  }

  // Transform growth data for charts
  const userGrowthChart = growth.userGrowth?.map(item => ({
    date: new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    users: item.count
  })) || []

  const mintGrowthChart = growth.mintGrowth?.map(item => ({
    date: new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    mints: item.count,
    revenue: parseInt(item.revenue) / 1000000
  })) || []

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Users"
          value={overview.users?.total?.toLocaleString() || '0'}
          subValue={`${overview.users?.newToday || 0} new today`}
          icon={Users}
          color="bg-gradient-to-br from-primary-500 to-primary-600"
          loading={loading.overview}
        />
        <StatCard
          title="Total Drops"
          value={overview.drops?.total?.toLocaleString() || '0'}
          subValue={`${overview.drops?.active || 0} active`}
          icon={Layers}
          color="bg-gradient-to-br from-purple-500 to-purple-600"
          loading={loading.overview}
        />
        <StatCard
          title="Collections"
          value={overview.collections?.total?.toLocaleString() || '0'}
          subValue={`${overview.collections?.verified || 0} verified`}
          icon={FolderOpen}
          color="bg-gradient-to-br from-green-500 to-green-600"
          loading={loading.overview}
        />
        <StatCard
          title="Platform Fees"
          value={`${parseFloat(overview.revenue?.totalPlatformFeesXrp || 0).toLocaleString()} XRP`}
          subValue="Total collected"
          icon={DollarSign}
          color="bg-gradient-to-br from-orange-500 to-orange-600"
          loading={loading.overview}
        />
      </div>

      {/* Secondary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Mints"
          value={overview.drops?.totalMints?.toLocaleString() || '0'}
          icon={Activity}
          color="bg-gradient-to-br from-pink-500 to-pink-600"
          loading={loading.overview}
        />
        <StatCard
          title="Social Posts"
          value={overview.social?.posts?.toLocaleString() || '0'}
          subValue={`${overview.social?.comments || 0} comments`}
          icon={MessageSquare}
          color="bg-gradient-to-br from-cyan-500 to-cyan-600"
          loading={loading.overview}
        />
        <StatCard
          title="Verified Users"
          value={overview.users?.verified?.toLocaleString() || '0'}
          icon={Users}
          color="bg-gradient-to-br from-indigo-500 to-indigo-600"
          loading={loading.overview}
        />
        <StatCard
          title="Total Volume"
          value={`${parseFloat(overview.revenue?.totalVolumeXrp || 0).toLocaleString()} XRP`}
          icon={TrendingUp}
          color="bg-gradient-to-br from-rose-500 to-rose-600"
          loading={loading.overview}
        />
      </div>

      {/* Top Performers Section */}
      <div className="p-6 rounded-xl bg-dark-200 border border-gray-800">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-yellow-500 to-orange-500 flex items-center justify-center">
              <Trophy className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">Top Performers</h3>
              <p className="text-gray-400 text-sm">Monthly leaderboard rankings</p>
            </div>
          </div>

          {/* Month Selector */}
          <div className="flex items-center gap-2 bg-dark-300 rounded-lg px-2 py-1">
            <button
              onClick={handlePreviousMonth}
              className="p-1.5 rounded-lg hover:bg-dark-400 text-gray-400 hover:text-white transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <span className="text-white font-medium min-w-[140px] text-center">
              {monthNames[selectedMonth - 1]} {selectedYear}
            </span>
            <button
              onClick={handleNextMonth}
              className="p-1.5 rounded-lg hover:bg-dark-400 text-gray-400 hover:text-white transition-colors"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {performersLoading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="w-8 h-8 text-primary-500 animate-spin" />
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Top Traders */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <ShoppingCart className="w-5 h-5 text-blue-400" />
                <h4 className="text-white font-medium">Top Traders</h4>
                <span className="text-xs text-gray-400">(by spend)</span>
              </div>
              <div className="space-y-2">
                {(topPerformers.traders || []).slice(0, 10).map((performer, index) => (
                  <PerformerCard
                    key={performer.walletAddress}
                    performer={performer}
                    rank={performer.rank || index + 1}
                    type="trader"
                  />
                ))}
                {(!topPerformers.traders || topPerformers.traders.length === 0) && (
                  <p className="text-gray-400 text-center py-8 text-sm">No traders this month</p>
                )}
              </div>
            </div>

            {/* Top Creators */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Palette className="w-5 h-5 text-purple-400" />
                <h4 className="text-white font-medium">Top Creators</h4>
                <span className="text-xs text-gray-400">(by revenue)</span>
              </div>
              <div className="space-y-2">
                {(topPerformers.creators || []).slice(0, 10).map((performer, index) => (
                  <PerformerCard
                    key={performer.walletAddress}
                    performer={performer}
                    rank={performer.rank || index + 1}
                    type="creator"
                  />
                ))}
                {(!topPerformers.creators || topPerformers.creators.length === 0) && (
                  <p className="text-gray-400 text-center py-8 text-sm">No creators this month</p>
                )}
              </div>
            </div>

            {/* Top Influencers */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Megaphone className="w-5 h-5 text-orange-400" />
                <h4 className="text-white font-medium">Top Influencers</h4>
                <span className="text-xs text-gray-400">(by engagement)</span>
              </div>
              <div className="space-y-2">
                {(topPerformers.influencers || []).slice(0, 10).map((performer, index) => (
                  <PerformerCard
                    key={performer.walletAddress}
                    performer={performer}
                    rank={performer.rank || index + 1}
                    type="influencer"
                  />
                ))}
                {(!topPerformers.influencers || topPerformers.influencers.length === 0) && (
                  <p className="text-gray-400 text-center py-8 text-sm">No influencers this month</p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User Growth Chart */}
        <div className="p-6 rounded-xl bg-dark-200 border border-gray-800">
          <h3 className="text-lg font-semibold text-white mb-4">User Growth (30 days)</h3>
          <div className="h-80">
            {loading.growth ? (
              <div className="flex items-center justify-center h-full">
                <Loader2 className="w-8 h-8 text-primary-500 animate-spin" />
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={userGrowthChart}>
                  <defs>
                    <linearGradient id="userGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="date" stroke="#9ca3af" fontSize={12} />
                  <YAxis stroke="#9ca3af" fontSize={12} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area
                    type="monotone"
                    dataKey="users"
                    name="New Users"
                    stroke="#0ea5e9"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#userGradient)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Mint Revenue Chart */}
        <div className="p-6 rounded-xl bg-dark-200 border border-gray-800">
          <h3 className="text-lg font-semibold text-white mb-4">Mint Activity (30 days)</h3>
          <div className="h-80">
            {loading.growth ? (
              <div className="flex items-center justify-center h-full">
                <Loader2 className="w-8 h-8 text-primary-500 animate-spin" />
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={mintGrowthChart}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="date" stroke="#9ca3af" fontSize={12} />
                  <YAxis stroke="#9ca3af" fontSize={12} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend formatter={(value) => <span className="text-gray-300">{value}</span>} />
                  <Bar dataKey="mints" name="Mints" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      {/* Platform Health & Revenue */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Platform Health */}
        <div className="p-6 rounded-xl bg-dark-200 border border-gray-800">
          <h3 className="text-lg font-semibold text-white mb-4">Platform Health</h3>
          {loading.health ? (
            <div className="flex items-center justify-center h-48">
              <Loader2 className="w-8 h-8 text-primary-500 animate-spin" />
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-lg bg-dark-300">
                  <div className="flex items-center gap-2 mb-2">
                    <Activity className="w-4 h-4 text-green-400" />
                    <span className="text-gray-400 text-sm">Activity (24h)</span>
                  </div>
                  <p className="text-2xl font-bold text-white">{health.activity?.usersLast24h || 0}</p>
                  <p className="text-xs text-gray-400">active users</p>
                </div>
                <div className="p-4 rounded-lg bg-dark-300">
                  <div className="flex items-center gap-2 mb-2">
                    <Layers className="w-4 h-4 text-purple-400" />
                    <span className="text-gray-400 text-sm">Mints (24h)</span>
                  </div>
                  <p className="text-2xl font-bold text-white">{health.activity?.mintsLast24h || 0}</p>
                  <p className="text-xs text-gray-400">new mints</p>
                </div>
              </div>

              <div className="p-4 rounded-lg bg-dark-300">
                <h4 className="text-white font-medium mb-3">Pending Items</h4>
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400 text-sm">Pending Fees</span>
                    <span className="text-yellow-400 font-medium">{health.pendingItems?.pendingFeesDrops || 0}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400 text-sm">Unverified Collections</span>
                    <span className="text-yellow-400 font-medium">{health.pendingItems?.unverifiedCollections || 0}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400 text-sm">Hidden Posts</span>
                    <span className="text-red-400 font-medium">{health.pendingItems?.hiddenPosts || 0}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400 text-sm">Banned Users</span>
                    <span className="text-red-400 font-medium">{health.pendingItems?.bannedUsers || 0}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Revenue Summary */}
        <div className="p-6 rounded-xl bg-dark-200 border border-gray-800">
          <h3 className="text-lg font-semibold text-white mb-4">Revenue Summary (30 days)</h3>
          {loading.revenue ? (
            <div className="flex items-center justify-center h-48">
              <Loader2 className="w-8 h-8 text-primary-500 animate-spin" />
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 rounded-lg bg-dark-300">
                <p className="text-3xl font-bold text-primary-400 mb-1">
                  {parseFloat(revenue.summary?.totalPlatformFeesXrp || 0).toLocaleString()}
                </p>
                <p className="text-gray-400 text-sm">Platform Fees (XRP)</p>
              </div>
              <div className="text-center p-4 rounded-lg bg-dark-300">
                <p className="text-3xl font-bold text-green-400 mb-1">
                  {parseFloat(revenue.summary?.totalMintRevenueXrp || 0).toLocaleString()}
                </p>
                <p className="text-gray-400 text-sm">Mint Revenue (XRP)</p>
              </div>
              <div className="text-center p-4 rounded-lg bg-dark-300">
                <p className="text-3xl font-bold text-purple-400 mb-1">
                  {(revenue.summary?.totalMints || 0).toLocaleString()}
                </p>
                <p className="text-gray-400 text-sm">Total Mints</p>
              </div>
              <div className="text-center p-4 rounded-lg bg-dark-300">
                <p className="text-3xl font-bold text-orange-400 mb-1">
                  {growth.days || 30}
                </p>
                <p className="text-gray-400 text-sm">Days Period</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Dashboard
