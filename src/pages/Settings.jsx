import { useState } from 'react'
import {
  Save,
  Wallet,
  Percent,
  Shield,
  AlertTriangle,
  CheckCircle,
  Copy,
  ExternalLink,
  RefreshCw,
  Key,
  Globe,
  Bell,
  Settings2,
  Database,
  Lock,
  Gift
} from 'lucide-react'

const Settings = () => {
  const [platformSettings, setPlatformSettings] = useState({
    platformFee: 2.5,
    royaltyFee: 5.0,
    minListingPrice: 1,
    maxListingPrice: 1000000,
    auctionMinDuration: 24,
    auctionMaxDuration: 168,
    enableAuctions: true,
    enableOffers: true,
    enableRoyalties: true,
    maintenanceMode: false
  })

  const [walletSettings, setWalletSettings] = useState({
    adminWallet: 'rDeGeArNsAdMiN1234567890XRP',
    treasuryWallet: 'rTrEaSuRyWaLlEt9876543210ABC',
    feeCollectorWallet: 'rFeEcOlLeCt0r1122334455DEF',
    rewardPoolWallet: 'rReWaRdPoOl6677889900GHI'
  })

  const [notifications, setNotifications] = useState({
    emailNotifications: true,
    largeTransactionAlert: true,
    largeTransactionThreshold: 10000,
    newUserAlert: false,
    systemAlerts: true
  })

  const [isSaving, setIsSaving] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [activeTab, setActiveTab] = useState('platform')

  const handlePlatformChange = (key, value) => {
    setPlatformSettings(prev => ({ ...prev, [key]: value }))
    setSaveSuccess(false)
  }

  const handleWalletChange = (key, value) => {
    setWalletSettings(prev => ({ ...prev, [key]: value }))
    setSaveSuccess(false)
  }

  const handleNotificationChange = (key, value) => {
    setNotifications(prev => ({ ...prev, [key]: value }))
    setSaveSuccess(false)
  }

  const handleSave = async () => {
    setIsSaving(true)
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    setIsSaving(false)
    setSaveSuccess(true)
    setTimeout(() => setSaveSuccess(false), 3000)
  }

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text)
  }

  const tabs = [
    { id: 'platform', name: 'Platform', icon: Settings2 },
    { id: 'wallets', name: 'Wallets', icon: Wallet },
    { id: 'notifications', name: 'Notifications', icon: Bell },
    { id: 'security', name: 'Security', icon: Shield }
  ]

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-white">Platform Settings</h2>
          <p className="text-gray-400 text-sm mt-1">Configure marketplace settings and admin wallets</p>
        </div>
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="btn-primary flex items-center gap-2"
        >
          {isSaving ? (
            <RefreshCw className="w-4 h-4 animate-spin" />
          ) : saveSuccess ? (
            <CheckCircle className="w-4 h-4" />
          ) : (
            <Save className="w-4 h-4" />
          )}
          {isSaving ? 'Saving...' : saveSuccess ? 'Saved!' : 'Save Changes'}
        </button>
      </div>

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
          </button>
        ))}
      </div>

      {/* Platform Settings */}
      {activeTab === 'platform' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Fees */}
          <div className="p-6 rounded-xl bg-dark-200 border border-gray-800">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-primary-500/20 flex items-center justify-center">
                <Percent className="w-5 h-5 text-primary-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">Fee Settings</h3>
                <p className="text-gray-400 text-sm">Configure platform fees</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">
                  Platform Fee (%)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="20"
                    value={platformSettings.platformFee}
                    onChange={(e) => handlePlatformChange('platformFee', parseFloat(e.target.value))}
                    className="input-field pr-12"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">%</span>
                </div>
                <p className="text-gray-500 text-xs mt-1">Fee charged on each sale</p>
              </div>

              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">
                  Default Royalty Fee (%)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="15"
                    value={platformSettings.royaltyFee}
                    onChange={(e) => handlePlatformChange('royaltyFee', parseFloat(e.target.value))}
                    className="input-field pr-12"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">%</span>
                </div>
                <p className="text-gray-500 text-xs mt-1">Default creator royalty on secondary sales</p>
              </div>
            </div>
          </div>

          {/* Listing Settings */}
          <div className="p-6 rounded-xl bg-dark-200 border border-gray-800">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-green-500/20 flex items-center justify-center">
                <Database className="w-5 h-5 text-green-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">Listing Settings</h3>
                <p className="text-gray-400 text-sm">Configure listing parameters</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">
                  Minimum Listing Price (XRP)
                </label>
                <input
                  type="number"
                  min="0"
                  value={platformSettings.minListingPrice}
                  onChange={(e) => handlePlatformChange('minListingPrice', parseInt(e.target.value))}
                  className="input-field"
                />
              </div>

              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">
                  Maximum Listing Price (XRP)
                </label>
                <input
                  type="number"
                  min="0"
                  value={platformSettings.maxListingPrice}
                  onChange={(e) => handlePlatformChange('maxListingPrice', parseInt(e.target.value))}
                  className="input-field"
                />
              </div>
            </div>
          </div>

          {/* Auction Settings */}
          <div className="p-6 rounded-xl bg-dark-200 border border-gray-800">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center">
                <Globe className="w-5 h-5 text-purple-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">Auction Settings</h3>
                <p className="text-gray-400 text-sm">Configure auction parameters</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">
                  Minimum Auction Duration (hours)
                </label>
                <input
                  type="number"
                  min="1"
                  value={platformSettings.auctionMinDuration}
                  onChange={(e) => handlePlatformChange('auctionMinDuration', parseInt(e.target.value))}
                  className="input-field"
                />
              </div>

              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">
                  Maximum Auction Duration (hours)
                </label>
                <input
                  type="number"
                  min="1"
                  value={platformSettings.auctionMaxDuration}
                  onChange={(e) => handlePlatformChange('auctionMaxDuration', parseInt(e.target.value))}
                  className="input-field"
                />
              </div>
            </div>
          </div>

          {/* Feature Toggles */}
          <div className="p-6 rounded-xl bg-dark-200 border border-gray-800">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-orange-500/20 flex items-center justify-center">
                <Settings2 className="w-5 h-5 text-orange-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">Feature Toggles</h3>
                <p className="text-gray-400 text-sm">Enable or disable features</p>
              </div>
            </div>

            <div className="space-y-4">
              {[
                { key: 'enableAuctions', label: 'Enable Auctions', desc: 'Allow users to create auctions' },
                { key: 'enableOffers', label: 'Enable Offers', desc: 'Allow users to make offers on NFTs' },
                { key: 'enableRoyalties', label: 'Enable Royalties', desc: 'Enable creator royalties on secondary sales' },
                { key: 'maintenanceMode', label: 'Maintenance Mode', desc: 'Put platform in maintenance mode', danger: true }
              ].map((feature) => (
                <div key={feature.key} className="flex items-center justify-between py-3 border-b border-gray-800 last:border-0">
                  <div>
                    <p className={`font-medium ${feature.danger ? 'text-red-400' : 'text-white'}`}>{feature.label}</p>
                    <p className="text-gray-500 text-sm">{feature.desc}</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={platformSettings[feature.key]}
                      onChange={(e) => handlePlatformChange(feature.key, e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className={`w-11 h-6 rounded-full peer peer-focus:ring-2
                      ${feature.danger ? 'peer-focus:ring-red-500 peer-checked:bg-red-500' : 'peer-focus:ring-primary-500 peer-checked:bg-primary-500'}
                      bg-gray-700 peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5
                      after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all`}
                    ></div>
                  </label>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Wallet Settings */}
      {activeTab === 'wallets' && (
        <div className="space-y-6">
          {/* Warning */}
          <div className="p-4 rounded-xl bg-yellow-500/10 border border-yellow-500/30 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-yellow-400 font-medium">Important Security Notice</p>
              <p className="text-yellow-400/80 text-sm mt-1">
                Changing wallet addresses requires careful verification. Make sure you have access to the new wallets before updating.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Admin Wallet */}
            <div className="p-6 rounded-xl bg-dark-200 border border-gray-800">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-primary-500/20 flex items-center justify-center">
                  <Key className="w-5 h-5 text-primary-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">Admin Wallet</h3>
                  <p className="text-gray-400 text-sm">Primary admin control wallet</p>
                </div>
              </div>

              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">
                  Wallet Address
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={walletSettings.adminWallet}
                    onChange={(e) => handleWalletChange('adminWallet', e.target.value)}
                    className="input-field flex-1 font-mono text-sm"
                  />
                  <button
                    onClick={() => copyToClipboard(walletSettings.adminWallet)}
                    className="p-3 rounded-lg bg-dark-300 hover:bg-dark-100 text-gray-400 hover:text-white transition-colors"
                  >
                    <Copy className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Treasury Wallet */}
            <div className="p-6 rounded-xl bg-dark-200 border border-gray-800">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-green-500/20 flex items-center justify-center">
                  <Wallet className="w-5 h-5 text-green-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">Treasury Wallet</h3>
                  <p className="text-gray-400 text-sm">Main treasury for platform funds</p>
                </div>
              </div>

              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">
                  Wallet Address
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={walletSettings.treasuryWallet}
                    onChange={(e) => handleWalletChange('treasuryWallet', e.target.value)}
                    className="input-field flex-1 font-mono text-sm"
                  />
                  <button
                    onClick={() => copyToClipboard(walletSettings.treasuryWallet)}
                    className="p-3 rounded-lg bg-dark-300 hover:bg-dark-100 text-gray-400 hover:text-white transition-colors"
                  >
                    <Copy className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Fee Collector Wallet */}
            <div className="p-6 rounded-xl bg-dark-200 border border-gray-800">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center">
                  <Percent className="w-5 h-5 text-purple-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">Fee Collector Wallet</h3>
                  <p className="text-gray-400 text-sm">Receives platform fees from sales</p>
                </div>
              </div>

              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">
                  Wallet Address
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={walletSettings.feeCollectorWallet}
                    onChange={(e) => handleWalletChange('feeCollectorWallet', e.target.value)}
                    className="input-field flex-1 font-mono text-sm"
                  />
                  <button
                    onClick={() => copyToClipboard(walletSettings.feeCollectorWallet)}
                    className="p-3 rounded-lg bg-dark-300 hover:bg-dark-100 text-gray-400 hover:text-white transition-colors"
                  >
                    <Copy className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Reward Pool Wallet */}
            <div className="p-6 rounded-xl bg-dark-200 border border-gray-800">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-orange-500/20 flex items-center justify-center">
                  <Gift className="w-5 h-5 text-orange-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">Reward Pool Wallet</h3>
                  <p className="text-gray-400 text-sm">Holds funds for user rewards</p>
                </div>
              </div>

              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">
                  Wallet Address
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={walletSettings.rewardPoolWallet}
                    onChange={(e) => handleWalletChange('rewardPoolWallet', e.target.value)}
                    className="input-field flex-1 font-mono text-sm"
                  />
                  <button
                    onClick={() => copyToClipboard(walletSettings.rewardPoolWallet)}
                    className="p-3 rounded-lg bg-dark-300 hover:bg-dark-100 text-gray-400 hover:text-white transition-colors"
                  >
                    <Copy className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Notification Settings */}
      {activeTab === 'notifications' && (
        <div className="p-6 rounded-xl bg-dark-200 border border-gray-800">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center">
              <Bell className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">Notification Preferences</h3>
              <p className="text-gray-400 text-sm">Configure admin notifications</p>
            </div>
          </div>

          <div className="space-y-6">
            {/* Email Notifications */}
            <div className="flex items-center justify-between py-3 border-b border-gray-800">
              <div>
                <p className="font-medium text-white">Email Notifications</p>
                <p className="text-gray-500 text-sm">Receive email alerts for important events</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={notifications.emailNotifications}
                  onChange={(e) => handleNotificationChange('emailNotifications', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-700 rounded-full peer peer-focus:ring-2 peer-focus:ring-primary-500 peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-500"></div>
              </label>
            </div>

            {/* Large Transaction Alert */}
            <div className="py-3 border-b border-gray-800">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="font-medium text-white">Large Transaction Alerts</p>
                  <p className="text-gray-500 text-sm">Get notified for high-value transactions</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={notifications.largeTransactionAlert}
                    onChange={(e) => handleNotificationChange('largeTransactionAlert', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-700 rounded-full peer peer-focus:ring-2 peer-focus:ring-primary-500 peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-500"></div>
                </label>
              </div>
              {notifications.largeTransactionAlert && (
                <div>
                  <label className="block text-gray-400 text-sm mb-2">Threshold (XRP)</label>
                  <input
                    type="number"
                    value={notifications.largeTransactionThreshold}
                    onChange={(e) => handleNotificationChange('largeTransactionThreshold', parseInt(e.target.value))}
                    className="input-field w-48"
                  />
                </div>
              )}
            </div>

            {/* New User Alert */}
            <div className="flex items-center justify-between py-3 border-b border-gray-800">
              <div>
                <p className="font-medium text-white">New User Alerts</p>
                <p className="text-gray-500 text-sm">Get notified when new users register</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={notifications.newUserAlert}
                  onChange={(e) => handleNotificationChange('newUserAlert', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-700 rounded-full peer peer-focus:ring-2 peer-focus:ring-primary-500 peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-500"></div>
              </label>
            </div>

            {/* System Alerts */}
            <div className="flex items-center justify-between py-3">
              <div>
                <p className="font-medium text-white">System Alerts</p>
                <p className="text-gray-500 text-sm">Critical system and security notifications</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={notifications.systemAlerts}
                  onChange={(e) => handleNotificationChange('systemAlerts', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-700 rounded-full peer peer-focus:ring-2 peer-focus:ring-primary-500 peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-500"></div>
              </label>
            </div>
          </div>
        </div>
      )}

      {/* Security Settings */}
      {activeTab === 'security' && (
        <div className="space-y-6">
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
                    <code className="text-sm text-gray-300">rDeGeArNsAdMiN1234567890XRP</code>
                    <span className="badge badge-success">Primary Admin</span>
                  </div>
                </div>
                <button className="mt-4 btn-secondary text-sm">
                  + Add Admin Wallet
                </button>
              </div>

              <div className="p-4 rounded-xl bg-dark-300 border border-gray-700">
                <h4 className="font-medium text-white mb-2">Session Management</h4>
                <p className="text-gray-400 text-sm mb-4">
                  Manage active admin sessions and security settings.
                </p>
                <div className="flex items-center gap-4">
                  <button className="btn-secondary text-sm">
                    View Active Sessions
                  </button>
                  <button className="btn-danger text-sm">
                    Revoke All Sessions
                  </button>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-dark-300 border border-gray-700">
                <h4 className="font-medium text-white mb-2">Audit Log</h4>
                <p className="text-gray-400 text-sm mb-4">
                  View all admin actions and changes to platform settings.
                </p>
                <button className="btn-secondary text-sm">
                  <ExternalLink className="w-4 h-4 mr-2 inline" />
                  View Audit Log
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Settings
