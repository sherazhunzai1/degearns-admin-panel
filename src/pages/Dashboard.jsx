import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
  TrendingUp,
  TrendingDown,
  Users,
  Layers,
  FolderOpen,
  DollarSign,
  Activity,
  MessageSquare,
  Clock,
  AlertCircle,
  Loader2
} from 'lucide-react'
import {
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
import {
  fetchDashboardOverview,
  fetchGrowthData,
  fetchTopCreators,
  fetchPlatformHealth,
  fetchRevenueData
} from '../store/slices/dashboardSlice'

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

const Dashboard = () => {
  const dispatch = useDispatch()
  const { overview, growth, topCreators, health, revenue, loading } = useSelector((state) => state.dashboard)

  useEffect(() => {
    dispatch(fetchDashboardOverview())
    dispatch(fetchGrowthData('30d'))
    dispatch(fetchTopCreators({ metric: 'mints', limit: 5 }))
    dispatch(fetchPlatformHealth())
    dispatch(fetchRevenueData('30d'))
  }, [dispatch])

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

      {/* Top Creators & Platform Health */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Creators */}
        <div className="p-6 rounded-xl bg-dark-200 border border-gray-800">
          <h3 className="text-lg font-semibold text-white mb-4">Top Creators by Mints</h3>
          {loading.topCreators ? (
            <div className="flex items-center justify-center h-48">
              <Loader2 className="w-8 h-8 text-primary-500 animate-spin" />
            </div>
          ) : (
            <div className="space-y-3">
              {(topCreators.topCreators || []).slice(0, 5).map((creator, index) => (
                <div
                  key={creator.creatorWalletAddress}
                  className="flex items-center justify-between p-3 rounded-lg bg-dark-300"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-500 to-purple-500 flex items-center justify-center text-white font-medium">
                      {index + 1}
                    </div>
                    <div>
                      <p className="text-white font-medium">{creator.creator?.username || 'Unknown'}</p>
                      <p className="text-xs text-gray-400">{creator.dropCount} drops</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-white font-medium">{creator.totalMints?.toLocaleString()}</p>
                    <p className="text-xs text-gray-400">mints</p>
                  </div>
                </div>
              ))}
              {(!topCreators.topCreators || topCreators.topCreators.length === 0) && (
                <p className="text-gray-400 text-center py-8">No creators found</p>
              )}
            </div>
          )}
        </div>

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
      </div>

      {/* Revenue Summary */}
      <div className="p-6 rounded-xl bg-dark-200 border border-gray-800">
        <h3 className="text-lg font-semibold text-white mb-4">Revenue Summary (30 days)</h3>
        {loading.revenue ? (
          <div className="flex items-center justify-center h-24">
            <Loader2 className="w-8 h-8 text-primary-500 animate-spin" />
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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
  )
}

export default Dashboard
