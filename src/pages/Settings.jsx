import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
  Save,
  Wallet,
  Percent,
  Shield,
  AlertTriangle,
  CheckCircle,
  Copy,
  RefreshCw,
  Bell,
  Settings2,
  Lock,
  Loader2,
  RotateCcw,
  Layers,
  MessageSquare,
  Plus,
  Trash2,
  Edit3,
  X,
  CreditCard,
  Coins,
  Gift,
  Building,
  Vault,
  TrendingUp,
  Calendar,
  ChevronLeft,
  ChevronRight,
  History,
  ArrowUpRight,
  ArrowDownRight,
  Crown
} from 'lucide-react'
import {
  fetchAllSettings,
  bulkUpdateSettings,
  resetSetting,
  updateSettingLocal,
  clearSaveSuccess,
  clearError
} from '../store/slices/settingsSlice'
import {
  fetchAllWallets,
  fetchPlatformFeesWallet,
  updatePlatformFeesWallet,
  createWallet,
  deleteWallet,
  clearUpdateSuccess,
  clearError as clearWalletError
} from '../store/slices/walletsSlice'
import {
  fetchTreasury,
  fetchTreasuryStatistics,
  fetchTreasuryHistory,
  updateTreasury,
  setSelectedYear,
  setHistoryFilters,
  setHistoryPage,
  clearError as clearTreasuryError,
  clearUpdateSuccess as clearTreasuryUpdateSuccess
} from '../store/slices/treasurySlice'

const WALLET_TYPES = [
  { value: 'platformFees', label: 'Platform Fees', icon: CreditCard, color: 'text-green-400' },
  { value: 'royalties', label: 'Royalties', icon: Coins, color: 'text-purple-400' },
  { value: 'marketplace', label: 'Marketplace', icon: Building, color: 'text-blue-400' },
  { value: 'treasury', label: 'Treasury', icon: Building, color: 'text-orange-400' },
  { value: 'rewards', label: 'Rewards', icon: Gift, color: 'text-yellow-400' },
  { value: 'subscriptions', label: 'Subscriptions', icon: Crown, color: 'text-pink-400' },
  { value: 'other', label: 'Other', icon: Wallet, color: 'text-gray-400' },
]

const Settings = () => {
  const dispatch = useDispatch()
  const { settings, loading, saving, error, saveSuccess } = useSelector((state) => state.settings)
  const {
    wallets,
    platformFeesWallet,
    loading: walletsLoading,
    updating: walletsUpdating,
    error: walletsError,
    updateSuccess: walletsUpdateSuccess
  } = useSelector((state) => state.wallets)

  const {
    wallet: treasuryWallet,
    balance: treasuryBalance,
    thisMonth: treasuryThisMonth,
    allTime: treasuryAllTime,
    statistics: treasuryStats,
    selectedYear: treasuryYear,
    history: treasuryHistory,
    historyFilters,
    loading: treasuryLoading,
    statsLoading: treasuryStatsLoading,
    historyLoading: treasuryHistoryLoading,
    updateLoading: treasuryUpdateLoading,
    error: treasuryError,
    updateSuccess: treasuryUpdateSuccess
  } = useSelector((state) => state.treasury)

  const [activeTab, setActiveTab] = useState('fees')
  const [pendingChanges, setPendingChanges] = useState({})
  const [showResetModal, setShowResetModal] = useState(false)
  const [resetKey, setResetKey] = useState(null)

  // Wallet management state
  const [showWalletModal, setShowWalletModal] = useState(false)
  const [editingWallet, setEditingWallet] = useState(null)
  const [walletForm, setWalletForm] = useState({
    walletAddress: '',
    type: 'platformFees',
    label: '',
    description: '',
    isActive: true
  })
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [walletToDelete, setWalletToDelete] = useState(null)
  const [copiedAddress, setCopiedAddress] = useState(null)

  // Treasury state
  const [showTreasuryModal, setShowTreasuryModal] = useState(false)
  const [treasuryForm, setTreasuryForm] = useState({
    label: '',
    description: ''
  })

  useEffect(() => {
    dispatch(fetchAllSettings())
  }, [dispatch])

  useEffect(() => {
    if (activeTab === 'wallets') {
      dispatch(fetchAllWallets())
      dispatch(fetchPlatformFeesWallet())
    }
  }, [dispatch, activeTab])

  useEffect(() => {
    if (activeTab === 'treasury') {
      dispatch(fetchTreasury())
      dispatch(fetchTreasuryStatistics(treasuryYear))
      dispatch(fetchTreasuryHistory({
        ...historyFilters,
        page: treasuryHistory.pagination.page,
        limit: treasuryHistory.pagination.limit
      }))
    }
  }, [dispatch, activeTab, treasuryYear])

  useEffect(() => {
    if (activeTab === 'treasury') {
      dispatch(fetchTreasuryHistory({
        ...historyFilters,
        page: treasuryHistory.pagination.page,
        limit: treasuryHistory.pagination.limit
      }))
    }
  }, [dispatch, activeTab, historyFilters, treasuryHistory.pagination.page])

  useEffect(() => {
    if (treasuryUpdateSuccess) {
      setShowTreasuryModal(false)
      const timer = setTimeout(() => {
        dispatch(clearTreasuryUpdateSuccess())
      }, 3000)
      return () => clearTimeout(timer)
    }
  }, [treasuryUpdateSuccess, dispatch])

  useEffect(() => {
    if (saveSuccess) {
      const timer = setTimeout(() => {
        dispatch(clearSaveSuccess())
      }, 3000)
      return () => clearTimeout(timer)
    }
  }, [saveSuccess, dispatch])

  useEffect(() => {
    if (walletsUpdateSuccess) {
      const timer = setTimeout(() => {
        dispatch(clearUpdateSuccess())
      }, 3000)
      return () => clearTimeout(timer)
    }
  }, [walletsUpdateSuccess, dispatch])

  const handleSettingChange = (category, key, value) => {
    dispatch(updateSettingLocal({ category, key, value }))
    setPendingChanges(prev => ({
      ...prev,
      [key]: { category, value }
    }))
  }

  const handleSave = async () => {
    const settingsToUpdate = Object.entries(pendingChanges).map(([key, { value }]) => ({
      key,
      value: typeof value === 'boolean' ? value : String(value)
    }))

    if (settingsToUpdate.length === 0) return

    await dispatch(bulkUpdateSettings({
      settings: settingsToUpdate,
      reason: 'Admin updated settings'
    }))
    setPendingChanges({})
  }

  const handleResetSetting = async () => {
    if (!resetKey) return
    await dispatch(resetSetting({ key: resetKey, reason: 'Admin reset to default' }))
    setShowResetModal(false)
    setResetKey(null)
  }

  const copyToClipboard = (text, id) => {
    navigator.clipboard.writeText(text)
    setCopiedAddress(id)
    setTimeout(() => setCopiedAddress(null), 2000)
  }

  const getSettingValue = (setting) => {
    if (setting.parsedValue !== undefined) return setting.parsedValue
    if (setting.value === 'true') return true
    if (setting.value === 'false') return false
    if (!isNaN(setting.value) && setting.value !== '') return parseFloat(setting.value)
    return setting.value
  }

  // Wallet handlers
  const handleOpenWalletModal = (wallet = null) => {
    if (wallet) {
      setEditingWallet(wallet)
      setWalletForm({
        walletAddress: wallet.walletAddress || '',
        type: wallet.type || 'platformFees',
        label: wallet.label || '',
        description: wallet.description || '',
        isActive: wallet.isActive !== false
      })
    } else {
      setEditingWallet(null)
      setWalletForm({
        walletAddress: '',
        type: 'platformFees',
        label: '',
        description: '',
        isActive: true
      })
    }
    setShowWalletModal(true)
  }

  const handleSaveWallet = async () => {
    if (!walletForm.walletAddress) return

    if (walletForm.type === 'platformFees') {
      await dispatch(updatePlatformFeesWallet({
        walletAddress: walletForm.walletAddress,
        label: walletForm.label,
        description: walletForm.description
      }))
    } else {
      await dispatch(createWallet(walletForm))
    }

    setShowWalletModal(false)
    setEditingWallet(null)
    dispatch(fetchAllWallets())
    dispatch(fetchPlatformFeesWallet())
  }

  const handleDeleteWallet = async () => {
    if (!walletToDelete) return
    await dispatch(deleteWallet(walletToDelete.id))
    setShowDeleteModal(false)
    setWalletToDelete(null)
    dispatch(fetchAllWallets())
  }

  const getWalletTypeInfo = (type) => {
    return WALLET_TYPES.find(t => t.value === type) || WALLET_TYPES[5]
  }

  // Treasury handlers
  const handleOpenTreasuryModal = () => {
    setTreasuryForm({
      label: treasuryWallet?.label || '',
      description: treasuryWallet?.description || ''
    })
    setShowTreasuryModal(true)
  }

  const handleSaveTreasury = async () => {
    await dispatch(updateTreasury(treasuryForm))
    dispatch(fetchTreasury())
  }

  const formatXRP = (drops) => {
    if (!drops) return '0.00'
    const xrp = parseFloat(drops) / 1000000
    return xrp.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 6 })
  }

  const getMonthName = (month) => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    return months[month - 1] || ''
  }

  const getCategoryColor = (category) => {
    switch (category) {
      case 'trader': return 'text-blue-400 bg-blue-500/20'
      case 'creator': return 'text-purple-400 bg-purple-500/20'
      case 'influencer': return 'text-orange-400 bg-orange-500/20'
      default: return 'text-gray-400 bg-gray-500/20'
    }
  }

  const getStatusBadge = (status) => {
    switch (status) {
      case 'completed': return 'badge-success'
      case 'pending': return 'bg-yellow-500/20 text-yellow-400'
      case 'processing': return 'bg-blue-500/20 text-blue-400'
      case 'failed': return 'bg-red-500/20 text-red-400'
      default: return 'bg-gray-500/20 text-gray-400'
    }
  }

  const tabs = [
    { id: 'fees', name: 'Fees', icon: Percent },
    { id: 'wallets', name: 'Wallets', icon: Wallet },
    { id: 'treasury', name: 'Treasury', icon: Vault },
    { id: 'marketplace', name: 'Marketplace', icon: Building },
    { id: 'drops', name: 'Drops', icon: Layers },
    { id: 'social', name: 'Social', icon: MessageSquare },
    { id: 'notifications', name: 'Notifications', icon: Bell },
    { id: 'general', name: 'General', icon: Settings2 }
  ]

  const renderSettingInput = (setting, category) => {
    const value = getSettingValue(setting)

    if (setting.dataType === 'boolean' || typeof value === 'boolean') {
      return (
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={Boolean(value)}
            onChange={(e) => handleSettingChange(category, setting.key, e.target.checked)}
            className="sr-only peer"
          />
          <div className="w-11 h-6 bg-gray-700 rounded-full peer peer-focus:ring-2 peer-focus:ring-primary-500 peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-500"></div>
        </label>
      )
    }

    if (setting.dataType === 'number' || (!isNaN(value) && typeof value === 'number')) {
      return (
        <input
          type="number"
          value={value}
          onChange={(e) => handleSettingChange(category, setting.key, parseFloat(e.target.value) || 0)}
          className="input-field w-48"
        />
      )
    }

    if (setting.dataType === 'json' || (typeof value === 'object' && value !== null)) {
      return (
        <textarea
          value={typeof value === 'string' ? value : JSON.stringify(value, null, 2)}
          onChange={(e) => handleSettingChange(category, setting.key, e.target.value)}
          className="input-field w-full h-24 font-mono text-sm resize-none"
        />
      )
    }

    return (
      <div className="flex gap-2">
        <input
          type="text"
          value={value || ''}
          onChange={(e) => handleSettingChange(category, setting.key, e.target.value)}
          className="input-field flex-1"
        />
        {setting.key.toLowerCase().includes('wallet') && (
          <button
            onClick={() => copyToClipboard(value, setting.key)}
            className="p-3 rounded-lg bg-dark-300 hover:bg-dark-100 text-gray-400 hover:text-white transition-colors"
          >
            {copiedAddress === setting.key ? <CheckCircle className="w-5 h-5 text-green-400" /> : <Copy className="w-5 h-5" />}
          </button>
        )}
      </div>
    )
  }

  const renderSettingCard = (setting, category) => {
    const hasChanges = pendingChanges[setting.key] !== undefined

    return (
      <div
        key={setting.key}
        className={`p-4 rounded-xl ${hasChanges ? 'bg-primary-500/10 border border-primary-500/30' : 'bg-dark-300 border border-gray-700'}`}
      >
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <h4 className="font-medium text-white">{setting.label || setting.key}</h4>
            {setting.description && (
              <p className="text-gray-500 text-sm mt-1">{setting.description}</p>
            )}
          </div>
          <button
            onClick={() => {
              setResetKey(setting.key)
              setShowResetModal(true)
            }}
            className="p-2 rounded-lg hover:bg-dark-200 text-gray-400 hover:text-white transition-colors"
            title="Reset to default"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
        {renderSettingInput(setting, category)}
        {setting.defaultValue !== undefined && (
          <p className="text-gray-500 text-xs mt-2">
            Default: {String(setting.defaultValue)}
          </p>
        )}
      </div>
    )
  }

  const renderWalletCard = (wallet) => {
    const typeInfo = getWalletTypeInfo(wallet.type)
    const TypeIcon = typeInfo.icon

    return (
      <div
        key={wallet.id}
        className={`p-4 rounded-xl bg-dark-300 border ${wallet.isActive ? 'border-gray-700' : 'border-gray-800 opacity-60'}`}
      >
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl bg-dark-400 flex items-center justify-center ${typeInfo.color}`}>
              <TypeIcon className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-medium text-white">{wallet.label || typeInfo.label}</h4>
              <span className={`text-xs ${wallet.isActive ? 'text-green-400' : 'text-gray-500'}`}>
                {wallet.isActive ? 'Active' : 'Inactive'}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => handleOpenWalletModal(wallet)}
              className="p-2 rounded-lg hover:bg-dark-200 text-gray-400 hover:text-white transition-colors"
              title="Edit wallet"
            >
              <Edit3 className="w-4 h-4" />
            </button>
            {wallet.type !== 'platformFees' && (
              <button
                onClick={() => {
                  setWalletToDelete(wallet)
                  setShowDeleteModal(true)
                }}
                className="p-2 rounded-lg hover:bg-red-500/20 text-gray-400 hover:text-red-400 transition-colors"
                title="Delete wallet"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <code className="flex-1 text-sm text-gray-300 bg-dark-400 px-3 py-2 rounded-lg font-mono truncate">
              {wallet.walletAddress}
            </code>
            <button
              onClick={() => copyToClipboard(wallet.walletAddress, wallet.id)}
              className="p-2 rounded-lg bg-dark-400 hover:bg-dark-200 text-gray-400 hover:text-white transition-colors flex-shrink-0"
            >
              {copiedAddress === wallet.id ? <CheckCircle className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>
          {wallet.description && (
            <p className="text-gray-500 text-sm">{wallet.description}</p>
          )}
          <p className="text-gray-500 text-xs">
            Updated: {wallet.updatedAt ? new Date(wallet.updatedAt).toLocaleDateString() : 'N/A'}
          </p>
        </div>
      </div>
    )
  }

  const currentSettings = settings[activeTab] || []

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-white">Platform Settings</h2>
          <p className="text-gray-400 text-sm mt-1">Configure marketplace and platform settings</p>
        </div>
        <div className="flex items-center gap-3">
          {Object.keys(pendingChanges).length > 0 && (
            <span className="text-yellow-400 text-sm">
              {Object.keys(pendingChanges).length} unsaved changes
            </span>
          )}
          {activeTab !== 'wallets' && (
            <button
              onClick={handleSave}
              disabled={saving || Object.keys(pendingChanges).length === 0}
              className="btn-primary flex items-center gap-2"
            >
              {saving ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : saveSuccess ? (
                <CheckCircle className="w-4 h-4" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              {saving ? 'Saving...' : saveSuccess ? 'Saved!' : 'Save Changes'}
            </button>
          )}
        </div>
      </div>

      {/* Error Messages */}
      {error && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 flex items-center justify-between">
          <span className="text-red-400">{error}</span>
          <button onClick={() => dispatch(clearError())} className="text-red-400 hover:text-red-300">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
      {walletsError && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 flex items-center justify-between">
          <span className="text-red-400">{walletsError}</span>
          <button onClick={() => dispatch(clearWalletError())} className="text-red-400 hover:text-red-300">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Success Message */}
      {walletsUpdateSuccess && (
        <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/30 flex items-center gap-2">
          <CheckCircle className="w-5 h-5 text-green-400" />
          <span className="text-green-400">Wallet updated successfully!</span>
        </div>
      )}

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 p-1 bg-dark-300 rounded-xl">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
              activeTab === tab.id
                ? 'bg-primary-500 text-white'
                : 'text-gray-400 hover:text-white hover:bg-dark-200'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.name}
            {tab.id === 'wallets' && wallets.length > 0 && (
              <span className="text-xs opacity-60">({wallets.length})</span>
            )}
            {tab.id !== 'wallets' && (settings[tab.id]?.length || 0) > 0 && (
              <span className="text-xs opacity-60">({settings[tab.id].length})</span>
            )}
          </button>
        ))}
      </div>

      {/* Settings Content */}
      {loading && activeTab !== 'wallets' ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 text-primary-500 animate-spin" />
        </div>
      ) : (
        <div className="space-y-6">
          {/* Wallets Tab */}
          {activeTab === 'wallets' && (
            <div className="space-y-6">
              {/* Platform Fees Wallet - Prominent Display */}
              <div className="p-6 rounded-xl bg-dark-200 border border-gray-800">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center">
                      <CreditCard className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-white">Platform Fees Wallet</h3>
                      <p className="text-gray-400 text-sm">Primary wallet for receiving platform fees</p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleOpenWalletModal(platformFeesWallet)}
                    className="btn-primary flex items-center gap-2"
                  >
                    <Edit3 className="w-4 h-4" />
                    {platformFeesWallet ? 'Update' : 'Configure'}
                  </button>
                </div>

                {walletsLoading ? (
                  <div className="flex items-center justify-center h-24">
                    <Loader2 className="w-6 h-6 text-primary-500 animate-spin" />
                  </div>
                ) : platformFeesWallet ? (
                  <div className="p-4 rounded-xl bg-dark-300 border border-green-500/30">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-gray-400 text-sm">Wallet Address</span>
                      <span className="badge badge-success">Active</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <code className="flex-1 text-white bg-dark-400 px-4 py-3 rounded-lg font-mono">
                        {platformFeesWallet.walletAddress}
                      </code>
                      <button
                        onClick={() => copyToClipboard(platformFeesWallet.walletAddress, 'platform-fees')}
                        className="p-3 rounded-lg bg-dark-400 hover:bg-dark-200 text-gray-400 hover:text-white transition-colors"
                      >
                        {copiedAddress === 'platform-fees' ? (
                          <CheckCircle className="w-5 h-5 text-green-400" />
                        ) : (
                          <Copy className="w-5 h-5" />
                        )}
                      </button>
                    </div>
                    {platformFeesWallet.description && (
                      <p className="text-gray-400 text-sm mt-3">{platformFeesWallet.description}</p>
                    )}
                  </div>
                ) : (
                  <div className="p-8 rounded-xl bg-dark-300 border border-dashed border-gray-600 text-center">
                    <Wallet className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                    <p className="text-gray-400">No platform fees wallet configured</p>
                    <p className="text-gray-500 text-sm mt-1">Click "Configure" to set up the platform fees wallet</p>
                  </div>
                )}
              </div>

              {/* All Admin Wallets */}
              <div className="p-6 rounded-xl bg-dark-200 border border-gray-800">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary-500/20 flex items-center justify-center">
                      <Wallet className="w-5 h-5 text-primary-400" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-white">All Admin Wallets</h3>
                      <p className="text-gray-400 text-sm">Manage all administrative wallets</p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleOpenWalletModal()}
                    className="btn-secondary flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    Add Wallet
                  </button>
                </div>

                {walletsLoading ? (
                  <div className="flex items-center justify-center h-48">
                    <Loader2 className="w-8 h-8 text-primary-500 animate-spin" />
                  </div>
                ) : wallets.length === 0 ? (
                  <div className="p-12 rounded-xl bg-dark-300 border border-dashed border-gray-600 text-center">
                    <Wallet className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                    <p className="text-gray-400">No admin wallets configured</p>
                    <p className="text-gray-500 text-sm mt-1">Add wallets for different purposes</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {wallets.map(wallet => renderWalletCard(wallet))}
                  </div>
                )}
              </div>

              {/* Wallet Types Info */}
              <div className="p-6 rounded-xl bg-dark-200 border border-gray-800">
                <h4 className="text-white font-medium mb-4">Wallet Types</h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {WALLET_TYPES.map(type => {
                    const Icon = type.icon
                    return (
                      <div key={type.value} className="flex items-center gap-3 p-3 rounded-lg bg-dark-300">
                        <Icon className={`w-5 h-5 ${type.color}`} />
                        <span className="text-gray-300 text-sm">{type.label}</span>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Treasury Tab */}
          {activeTab === 'treasury' && (
            <div className="space-y-6">
              {/* Treasury Error */}
              {treasuryError && (
                <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 flex items-center justify-between">
                  <span className="text-red-400">{treasuryError}</span>
                  <button onClick={() => dispatch(clearTreasuryError())} className="text-red-400 hover:text-red-300">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}

              {/* Treasury Success */}
              {treasuryUpdateSuccess && (
                <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/30 flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-400" />
                  <span className="text-green-400">Treasury wallet updated successfully!</span>
                </div>
              )}

              {/* Treasury Wallet Card */}
              <div className="p-6 rounded-xl bg-dark-200 border border-gray-800">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center">
                      <Vault className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-white">Treasury Wallet</h3>
                      <p className="text-gray-400 text-sm">Reward distribution wallet</p>
                    </div>
                  </div>
                  {treasuryWallet && (
                    <button
                      onClick={handleOpenTreasuryModal}
                      className="btn-primary flex items-center gap-2"
                    >
                      <Edit3 className="w-4 h-4" />
                      Edit Details
                    </button>
                  )}
                </div>

                {treasuryLoading ? (
                  <div className="flex items-center justify-center h-32">
                    <Loader2 className="w-8 h-8 text-primary-500 animate-spin" />
                  </div>
                ) : treasuryWallet ? (
                  <div className="space-y-4">
                    {/* Wallet Info */}
                    <div className="p-4 rounded-xl bg-dark-300 border border-orange-500/30">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-gray-400 text-sm">Wallet Address</span>
                        <div className="flex items-center gap-2">
                          <span className={`badge ${treasuryWallet.isActive ? 'badge-success' : 'bg-gray-500/20 text-gray-400'}`}>
                            {treasuryWallet.isActive ? 'Active' : 'Inactive'}
                          </span>
                          <span className="badge bg-orange-500/20 text-orange-400">
                            {treasuryWallet.configMethod}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <code className="flex-1 text-white bg-dark-400 px-4 py-3 rounded-lg font-mono">
                          {treasuryWallet.address}
                        </code>
                        <button
                          onClick={() => copyToClipboard(treasuryWallet.address, 'treasury')}
                          className="p-3 rounded-lg bg-dark-400 hover:bg-dark-200 text-gray-400 hover:text-white transition-colors"
                        >
                          {copiedAddress === 'treasury' ? (
                            <CheckCircle className="w-5 h-5 text-green-400" />
                          ) : (
                            <Copy className="w-5 h-5" />
                          )}
                        </button>
                      </div>
                      {treasuryWallet.label && (
                        <p className="text-gray-300 text-sm mt-3">{treasuryWallet.label}</p>
                      )}
                      {treasuryWallet.description && (
                        <p className="text-gray-500 text-sm mt-1">{treasuryWallet.description}</p>
                      )}
                    </div>

                    {/* Balance */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="p-4 rounded-xl bg-dark-300">
                        <div className="flex items-center gap-2 mb-2">
                          <Coins className="w-4 h-4 text-orange-400" />
                          <span className="text-gray-400 text-sm">Current Balance</span>
                        </div>
                        <p className="text-2xl font-bold text-white">
                          {treasuryBalance?.xrp || formatXRP(treasuryBalance?.drops)} <span className="text-gray-400 text-sm font-normal">XRP</span>
                        </p>
                        {treasuryBalance?.error && (
                          <p className="text-red-400 text-xs mt-1">{treasuryBalance.error}</p>
                        )}
                      </div>

                      <div className="p-4 rounded-xl bg-dark-300">
                        <div className="flex items-center gap-2 mb-2">
                          <TrendingUp className="w-4 h-4 text-green-400" />
                          <span className="text-gray-400 text-sm">This Month</span>
                        </div>
                        <p className="text-2xl font-bold text-white">
                          {treasuryThisMonth?.totalDistributedXrp || formatXRP(treasuryThisMonth?.totalDistributed) || '0.00'} <span className="text-gray-400 text-sm font-normal">XRP</span>
                        </p>
                        <p className="text-gray-500 text-xs mt-1">
                          {treasuryThisMonth?.totalRewards || 0} rewards distributed
                        </p>
                      </div>

                      <div className="p-4 rounded-xl bg-dark-300">
                        <div className="flex items-center gap-2 mb-2">
                          <History className="w-4 h-4 text-purple-400" />
                          <span className="text-gray-400 text-sm">All Time</span>
                        </div>
                        <p className="text-2xl font-bold text-white">
                          {treasuryAllTime?.totalDistributedXrp || formatXRP(treasuryAllTime?.totalDistributed) || '0.00'} <span className="text-gray-400 text-sm font-normal">XRP</span>
                        </p>
                        <p className="text-gray-500 text-xs mt-1">
                          {treasuryAllTime?.totalRewards || 0} total rewards
                        </p>
                      </div>
                    </div>

                    {/* This Month Category Breakdown */}
                    {treasuryThisMonth?.categoryBreakdown && (
                      <div className="p-4 rounded-xl bg-dark-300">
                        <h4 className="text-white font-medium mb-4">
                          {getMonthName(treasuryThisMonth?.month)} {treasuryThisMonth?.year} Breakdown
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          {['trader', 'creator', 'influencer'].map(category => {
                            const data = treasuryThisMonth.categoryBreakdown[category]
                            if (!data) return null
                            return (
                              <div key={category} className="p-3 rounded-lg bg-dark-400">
                                <div className="flex items-center justify-between mb-2">
                                  <span className={`badge ${getCategoryColor(category)}`}>
                                    {category.charAt(0).toUpperCase() + category.slice(1)}s
                                  </span>
                                  <span className="text-gray-400 text-xs">{data.count} rewards</span>
                                </div>
                                <p className="text-white font-semibold">
                                  {data.amountXrp || formatXRP(data.amount)} XRP
                                </p>
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="p-8 rounded-xl bg-dark-300 border border-dashed border-gray-600 text-center">
                    <Vault className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                    <p className="text-gray-400">Treasury wallet not configured</p>
                    <p className="text-gray-500 text-sm mt-1">
                      Configure TREASURY_WALLET_SEED or TREASURY_WALLET_SECRET_NUMBERS in your .env file
                    </p>
                  </div>
                )}
              </div>

              {/* Yearly Statistics */}
              <div className="p-6 rounded-xl bg-dark-200 border border-gray-800">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center">
                      <TrendingUp className="w-5 h-5 text-blue-400" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-white">Yearly Statistics</h3>
                      <p className="text-gray-400 text-sm">Monthly distribution breakdown</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => dispatch(setSelectedYear(treasuryYear - 1))}
                      className="p-2 rounded-lg hover:bg-dark-300 text-gray-400 hover:text-white"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <span className="text-white font-medium px-3">{treasuryYear}</span>
                    <button
                      onClick={() => dispatch(setSelectedYear(treasuryYear + 1))}
                      disabled={treasuryYear >= new Date().getFullYear()}
                      className="p-2 rounded-lg hover:bg-dark-300 text-gray-400 hover:text-white disabled:opacity-50"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                {treasuryStatsLoading ? (
                  <div className="flex items-center justify-center h-48">
                    <Loader2 className="w-8 h-8 text-primary-500 animate-spin" />
                  </div>
                ) : treasuryStats?.monthlyBreakdown ? (
                  <div className="space-y-4">
                    {/* Year Total */}
                    {treasuryStats.yearTotal && (
                      <div className="p-4 rounded-xl bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20">
                        <div className="flex items-center justify-between">
                          <span className="text-gray-300">Year Total</span>
                          <div className="text-right">
                            <p className="text-xl font-bold text-white">
                              {treasuryStats.yearTotal.amountXrp || formatXRP(treasuryStats.yearTotal.amount)} XRP
                            </p>
                            <p className="text-gray-400 text-sm">{treasuryStats.yearTotal.count} rewards</p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Monthly Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                      {Array.from({ length: 12 }, (_, i) => i + 1).map(month => {
                        const data = treasuryStats.monthlyBreakdown[month]
                        const hasData = data && data.total && parseFloat(data.total.amount) > 0
                        return (
                          <div
                            key={month}
                            className={`p-3 rounded-lg ${hasData ? 'bg-dark-300' : 'bg-dark-400 opacity-50'}`}
                          >
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-gray-400 text-sm">{getMonthName(month)}</span>
                              {hasData && (
                                <span className="text-gray-500 text-xs">{data.total.count}</span>
                              )}
                            </div>
                            <p className={`font-semibold ${hasData ? 'text-white' : 'text-gray-600'}`}>
                              {hasData ? `${data.total.amountXrp || formatXRP(data.total.amount)} XRP` : '--'}
                            </p>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                ) : (
                  <div className="p-8 text-center">
                    <Calendar className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                    <p className="text-gray-400">No distribution data for {treasuryYear}</p>
                  </div>
                )}
              </div>

              {/* Distribution History */}
              <div className="p-6 rounded-xl bg-dark-200 border border-gray-800">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center">
                      <History className="w-5 h-5 text-purple-400" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-white">Distribution History</h3>
                      <p className="text-gray-400 text-sm">Recent reward distributions</p>
                    </div>
                  </div>
                </div>

                {/* Filters */}
                <div className="flex flex-wrap gap-3 mb-4">
                  <select
                    value={historyFilters.category || ''}
                    onChange={(e) => dispatch(setHistoryFilters({ category: e.target.value || undefined }))}
                    className="input-field w-36"
                  >
                    <option value="">All Categories</option>
                    <option value="trader">Traders</option>
                    <option value="creator">Creators</option>
                    <option value="influencer">Influencers</option>
                  </select>

                  <select
                    value={historyFilters.status || ''}
                    onChange={(e) => dispatch(setHistoryFilters({ status: e.target.value || undefined }))}
                    className="input-field w-36"
                  >
                    <option value="">All Status</option>
                    <option value="completed">Completed</option>
                    <option value="pending">Pending</option>
                    <option value="processing">Processing</option>
                    <option value="failed">Failed</option>
                  </select>

                  <select
                    value={historyFilters.month || ''}
                    onChange={(e) => dispatch(setHistoryFilters({ month: e.target.value ? parseInt(e.target.value) : undefined }))}
                    className="input-field w-32"
                  >
                    <option value="">All Months</option>
                    {Array.from({ length: 12 }, (_, i) => (
                      <option key={i + 1} value={i + 1}>{getMonthName(i + 1)}</option>
                    ))}
                  </select>
                </div>

                {treasuryHistoryLoading ? (
                  <div className="flex items-center justify-center h-48">
                    <Loader2 className="w-8 h-8 text-primary-500 animate-spin" />
                  </div>
                ) : treasuryHistory.distributions.length === 0 ? (
                  <div className="p-8 text-center">
                    <History className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                    <p className="text-gray-400">No distributions found</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* Summary */}
                    {treasuryHistory.summary && (
                      <div className="p-3 rounded-lg bg-dark-300 flex items-center justify-between">
                        <span className="text-gray-400 text-sm">
                          Total: {treasuryHistory.summary.totalDistributedXrp || formatXRP(treasuryHistory.summary.totalDistributed)} XRP
                        </span>
                        <span className="text-gray-400 text-sm">
                          {treasuryHistory.summary.totalRewards} rewards
                        </span>
                      </div>
                    )}

                    {/* Distribution List */}
                    <div className="space-y-2">
                      {treasuryHistory.distributions.map((dist) => (
                        <div
                          key={dist.id}
                          className="p-4 rounded-xl bg-dark-300 flex items-center gap-4"
                        >
                          {/* Recipient */}
                          <div className="flex items-center gap-3 flex-1 min-w-0">
                            {dist.recipient?.profileImage ? (
                              <img
                                src={dist.recipient.profileImage}
                                alt=""
                                className="w-10 h-10 rounded-full object-cover"
                              />
                            ) : (
                              <div className="w-10 h-10 rounded-full bg-dark-400 flex items-center justify-center">
                                <Wallet className="w-5 h-5 text-gray-500" />
                              </div>
                            )}
                            <div className="min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="text-white font-medium truncate">
                                  {dist.recipient?.username || dist.recipientWallet?.slice(0, 12) + '...'}
                                </span>
                                {dist.recipient?.isVerified && (
                                  <CheckCircle className="w-4 h-4 text-blue-400 flex-shrink-0" />
                                )}
                              </div>
                              <div className="flex items-center gap-2 text-xs text-gray-500">
                                <span className={`badge ${getCategoryColor(dist.category)}`}>
                                  #{dist.rank} {dist.category}
                                </span>
                                <span>{getMonthName(dist.periodMonth)} {dist.periodYear}</span>
                              </div>
                            </div>
                          </div>

                          {/* Amount */}
                          <div className="text-right">
                            <p className="text-white font-semibold">
                              {dist.amountXrp || formatXRP(dist.amount)} XRP
                            </p>
                            <span className={`badge text-xs ${getStatusBadge(dist.transactionStatus)}`}>
                              {dist.transactionStatus}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Pagination */}
                    {treasuryHistory.pagination.totalPages > 1 && (
                      <div className="flex items-center justify-between pt-4 border-t border-gray-700">
                        <p className="text-gray-400 text-sm">
                          Page {treasuryHistory.pagination.page} of {treasuryHistory.pagination.totalPages}
                        </p>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => dispatch(setHistoryPage(treasuryHistory.pagination.page - 1))}
                            disabled={treasuryHistory.pagination.page === 1}
                            className="p-2 rounded-lg hover:bg-dark-300 disabled:opacity-50 text-gray-400"
                          >
                            <ChevronLeft className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => dispatch(setHistoryPage(treasuryHistory.pagination.page + 1))}
                            disabled={treasuryHistory.pagination.page >= treasuryHistory.pagination.totalPages}
                            className="p-2 rounded-lg hover:bg-dark-300 disabled:opacity-50 text-gray-400"
                          >
                            <ChevronRight className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Fees Tab */}
          {activeTab === 'fees' && currentSettings.length > 0 && (
            <div className="p-6 rounded-xl bg-dark-200 border border-gray-800">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-primary-500/20 flex items-center justify-center">
                  <Percent className="w-5 h-5 text-primary-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">Fee Settings</h3>
                  <p className="text-gray-400 text-sm">Configure platform and creator fees</p>
                </div>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {currentSettings.map(setting => renderSettingCard(setting, 'fees'))}
              </div>
            </div>
          )}

          {/* Marketplace Tab */}
          {activeTab === 'marketplace' && (
            <div className="space-y-6">
              <div className="p-4 rounded-xl bg-yellow-500/10 border border-yellow-500/30 flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-yellow-400 font-medium">Important Security Notice</p>
                  <p className="text-yellow-400/80 text-sm mt-1">
                    Changing wallet addresses requires careful verification. Make sure you have access to the new wallets before updating.
                  </p>
                </div>
              </div>
              {currentSettings.length > 0 && (
                <div className="p-6 rounded-xl bg-dark-200 border border-gray-800">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-xl bg-green-500/20 flex items-center justify-center">
                      <Building className="w-5 h-5 text-green-400" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-white">Marketplace Settings</h3>
                      <p className="text-gray-400 text-sm">Configure marketplace parameters</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {currentSettings.map(setting => renderSettingCard(setting, 'marketplace'))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Drops Tab */}
          {activeTab === 'drops' && currentSettings.length > 0 && (
            <div className="p-6 rounded-xl bg-dark-200 border border-gray-800">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center">
                  <Layers className="w-5 h-5 text-purple-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">Drop Settings</h3>
                  <p className="text-gray-400 text-sm">Configure NFT drop parameters</p>
                </div>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {currentSettings.map(setting => renderSettingCard(setting, 'drops'))}
              </div>
            </div>
          )}

          {/* Social Tab */}
          {activeTab === 'social' && currentSettings.length > 0 && (
            <div className="p-6 rounded-xl bg-dark-200 border border-gray-800">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-cyan-500/20 flex items-center justify-center">
                  <MessageSquare className="w-5 h-5 text-cyan-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">Social Settings</h3>
                  <p className="text-gray-400 text-sm">Configure posts and social features</p>
                </div>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {currentSettings.map(setting => renderSettingCard(setting, 'social'))}
              </div>
            </div>
          )}

          {/* Notifications Tab */}
          {activeTab === 'notifications' && currentSettings.length > 0 && (
            <div className="p-6 rounded-xl bg-dark-200 border border-gray-800">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center">
                  <Bell className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">Notification Settings</h3>
                  <p className="text-gray-400 text-sm">Configure admin and system notifications</p>
                </div>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {currentSettings.map(setting => renderSettingCard(setting, 'notifications'))}
              </div>
            </div>
          )}

          {/* General Tab */}
          {activeTab === 'general' && (
            <div className="space-y-6">
              {currentSettings.length > 0 && (
                <div className="p-6 rounded-xl bg-dark-200 border border-gray-800">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-xl bg-orange-500/20 flex items-center justify-center">
                      <Settings2 className="w-5 h-5 text-orange-400" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-white">General Settings</h3>
                      <p className="text-gray-400 text-sm">Platform-wide configuration options</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {currentSettings.map(setting => renderSettingCard(setting, 'general'))}
                  </div>
                </div>
              )}

              {/* Security Section */}
              <div className="p-6 rounded-xl bg-dark-200 border border-gray-800">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-red-500/20 flex items-center justify-center">
                    <Lock className="w-5 h-5 text-red-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white">Security Settings</h3>
                    <p className="text-gray-400 text-sm">Manage platform security options</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="p-4 rounded-xl bg-dark-300 border border-gray-700">
                    <h4 className="font-medium text-white mb-2">Admin Access Control</h4>
                    <p className="text-gray-400 text-sm mb-4">
                      Only wallets in the approved admin list can access this panel.
                    </p>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between p-3 rounded-lg bg-dark-400">
                        <code className="text-sm text-gray-300">Connected via Xaman Wallet</code>
                        <span className="badge badge-success">Current Admin</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-dark-300 border border-gray-700">
                    <h4 className="font-medium text-white mb-2">Session Info</h4>
                    <p className="text-gray-400 text-sm mb-4">
                      Your current admin session information.
                    </p>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <Shield className="w-4 h-4 text-green-400" />
                        <span className="text-gray-300 text-sm">Secure Connection</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Empty State for other tabs */}
          {activeTab !== 'wallets' && activeTab !== 'general' && currentSettings.length === 0 && (
            <div className="p-12 rounded-xl bg-dark-200 border border-gray-800 text-center">
              <Settings2 className="w-12 h-12 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400">No settings found in this category</p>
              <p className="text-gray-500 text-sm mt-1">Settings will appear here once configured</p>
            </div>
          )}
        </div>
      )}

      {/* Wallet Modal */}
      {showWalletModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70" onClick={() => setShowWalletModal(false)} />
          <div className="relative w-full max-w-lg bg-dark-300 rounded-2xl border border-gray-800 p-6 animate-fade-in">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-white">
                {editingWallet ? 'Edit Wallet' : 'Add New Wallet'}
              </h3>
              <button
                onClick={() => setShowWalletModal(false)}
                className="p-2 rounded-lg hover:bg-dark-200 text-gray-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">Wallet Type</label>
                <select
                  value={walletForm.type}
                  onChange={(e) => setWalletForm({ ...walletForm, type: e.target.value })}
                  className="input-field w-full"
                  disabled={editingWallet?.type === 'platformFees'}
                >
                  {WALLET_TYPES.map(type => (
                    <option key={type.value} value={type.value}>{type.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">Wallet Address *</label>
                <input
                  type="text"
                  value={walletForm.walletAddress}
                  onChange={(e) => setWalletForm({ ...walletForm, walletAddress: e.target.value })}
                  placeholder="rXXX..."
                  className="input-field w-full font-mono"
                />
                <p className="text-gray-500 text-xs mt-1">Must be a valid XRPL r-address</p>
              </div>

              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">Label</label>
                <input
                  type="text"
                  value={walletForm.label}
                  onChange={(e) => setWalletForm({ ...walletForm, label: e.target.value })}
                  placeholder="e.g., Main Platform Fees Wallet"
                  className="input-field w-full"
                />
              </div>

              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">Description</label>
                <textarea
                  value={walletForm.description}
                  onChange={(e) => setWalletForm({ ...walletForm, description: e.target.value })}
                  placeholder="Describe the purpose of this wallet..."
                  className="input-field w-full h-20 resize-none"
                />
              </div>

              {walletForm.type !== 'platformFees' && (
                <div className="flex items-center justify-between p-3 rounded-lg bg-dark-400">
                  <span className="text-gray-300">Active</span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={walletForm.isActive}
                      onChange={(e) => setWalletForm({ ...walletForm, isActive: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-700 rounded-full peer peer-focus:ring-2 peer-focus:ring-primary-500 peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-500"></div>
                  </label>
                </div>
              )}
            </div>

            <div className="flex items-center gap-3 mt-6">
              <button
                onClick={() => setShowWalletModal(false)}
                className="btn-secondary flex-1"
                disabled={walletsUpdating}
              >
                Cancel
              </button>
              <button
                onClick={handleSaveWallet}
                disabled={walletsUpdating || !walletForm.walletAddress}
                className="btn-primary flex-1"
              >
                {walletsUpdating ? (
                  <Loader2 className="w-4 h-4 animate-spin mx-auto" />
                ) : (
                  'Save Wallet'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Wallet Modal */}
      {showDeleteModal && walletToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70" onClick={() => setShowDeleteModal(false)} />
          <div className="relative w-full max-w-md bg-dark-300 rounded-2xl border border-gray-800 p-6 animate-fade-in">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center">
                <Trash2 className="w-6 h-6 text-red-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">Delete Wallet</h3>
                <p className="text-gray-400 text-sm">This action cannot be undone</p>
              </div>
            </div>
            <p className="text-gray-300 mb-6">
              Are you sure you want to delete the wallet <strong className="text-white">{walletToDelete.label || getWalletTypeInfo(walletToDelete.type).label}</strong>?
            </p>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="btn-secondary flex-1"
                disabled={walletsUpdating}
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteWallet}
                disabled={walletsUpdating}
                className="btn-danger flex-1"
              >
                {walletsUpdating ? (
                  <Loader2 className="w-4 h-4 animate-spin mx-auto" />
                ) : (
                  'Delete Wallet'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Treasury Edit Modal */}
      {showTreasuryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70" onClick={() => setShowTreasuryModal(false)} />
          <div className="relative w-full max-w-lg bg-dark-300 rounded-2xl border border-gray-800 p-6 animate-fade-in">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center">
                  <Vault className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-white">Edit Treasury Details</h3>
              </div>
              <button
                onClick={() => setShowTreasuryModal(false)}
                className="p-2 rounded-lg hover:bg-dark-200 text-gray-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="p-3 rounded-lg bg-dark-400">
                <span className="text-gray-400 text-xs">Wallet Address</span>
                <p className="text-white font-mono text-sm mt-1">{treasuryWallet?.address}</p>
              </div>

              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">Label</label>
                <input
                  type="text"
                  value={treasuryForm.label}
                  onChange={(e) => setTreasuryForm({ ...treasuryForm, label: e.target.value })}
                  placeholder="e.g., Main Treasury Wallet"
                  className="input-field w-full"
                />
              </div>

              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">Description</label>
                <textarea
                  value={treasuryForm.description}
                  onChange={(e) => setTreasuryForm({ ...treasuryForm, description: e.target.value })}
                  placeholder="Describe the purpose of this treasury wallet..."
                  className="input-field w-full h-24 resize-none"
                />
              </div>

              <div className="p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/30">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-yellow-400 flex-shrink-0 mt-0.5" />
                  <p className="text-yellow-400/80 text-sm">
                    The wallet address is configured via environment variables and cannot be changed from this panel.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 mt-6">
              <button
                onClick={() => setShowTreasuryModal(false)}
                className="btn-secondary flex-1"
                disabled={treasuryUpdateLoading}
              >
                Cancel
              </button>
              <button
                onClick={handleSaveTreasury}
                disabled={treasuryUpdateLoading}
                className="btn-primary flex-1"
              >
                {treasuryUpdateLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin mx-auto" />
                ) : (
                  'Save Changes'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reset Setting Modal */}
      {showResetModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70" onClick={() => setShowResetModal(false)} />
          <div className="relative w-full max-w-md bg-dark-300 rounded-2xl border border-gray-800 p-6 animate-fade-in">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 rounded-full bg-yellow-500/20 flex items-center justify-center">
                <RotateCcw className="w-6 h-6 text-yellow-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">Reset Setting</h3>
                <p className="text-gray-400 text-sm">This will restore the default value</p>
              </div>
            </div>
            <p className="text-gray-300 mb-6">
              Are you sure you want to reset <strong className="text-white">{resetKey}</strong> to its default value?
            </p>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowResetModal(false)}
                className="btn-secondary flex-1"
                disabled={saving}
              >
                Cancel
              </button>
              <button
                onClick={handleResetSetting}
                disabled={saving}
                className="btn-primary flex-1"
              >
                {saving ? (
                  <Loader2 className="w-4 h-4 animate-spin mx-auto" />
                ) : (
                  'Reset to Default'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Settings
