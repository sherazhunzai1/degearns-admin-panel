import { useState } from 'react'
import { Outlet, NavLink, useLocation } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { logout } from '../store/slices/authSlice'
import {
  LayoutDashboard,
  Users,
  Settings,
  LogOut,
  Menu,
  X,
  ChevronRight,
  Wallet,
  Layers,
  FolderOpen,
  MessageSquare,
  DollarSign,
  Image
} from 'lucide-react'

const Layout = () => {
  const dispatch = useDispatch()
  const { user } = useSelector((state) => state.auth)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const location = useLocation()

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Users', href: '/users', icon: Users },
    { name: 'Drops', href: '/drops', icon: Layers },
    { name: 'Collections', href: '/collections', icon: FolderOpen },
    { name: 'Posts', href: '/posts', icon: MessageSquare },
    { name: 'Banners', href: '/banners', icon: Image },
    { name: 'Fees', href: '/fees', icon: DollarSign },
    { name: 'Settings', href: '/settings', icon: Settings },
  ]

  const getPageTitle = () => {
    const currentNav = navigation.find(nav => nav.href === location.pathname)
    return currentNav?.name || 'Dashboard'
  }

  const handleLogout = () => {
    dispatch(logout())
  }

  return (
    <div className="min-h-screen bg-dark-500 flex">
      {/* Sidebar - Desktop */}
      <aside
        className={`hidden lg:flex flex-col fixed left-0 top-0 h-screen bg-dark-400 border-r border-gray-800 transition-all duration-300 z-40 ${
          sidebarOpen ? 'w-64' : 'w-20'
        }`}
      >
        {/* Logo */}
        <div className="p-4 flex items-center justify-between border-b border-gray-800">
          <div className={`flex items-center gap-3 ${!sidebarOpen && 'justify-center w-full'}`}>
            <div className="w-10 h-10 rounded-xl gradient-bg flex items-center justify-center flex-shrink-0">
              <span className="text-lg font-bold text-white">DG</span>
            </div>
            {sidebarOpen && (
              <div className="animate-fade-in">
                <h1 className="font-bold text-white">DeGearns</h1>
                <p className="text-xs text-gray-400">Admin Panel</p>
              </div>
            )}
          </div>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className={`p-2 rounded-lg hover:bg-dark-300 transition-colors text-gray-400 ${!sidebarOpen && 'hidden'}`}
          >
            <ChevronRight className={`w-5 h-5 transition-transform ${sidebarOpen ? 'rotate-180' : ''}`} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2">
          {navigation.map((item) => (
            <NavLink
              key={item.name}
              to={item.href}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 ${
                  isActive
                    ? 'bg-primary-500/20 text-primary-400'
                    : 'text-gray-400 hover:bg-dark-300 hover:text-white'
                } ${!sidebarOpen && 'justify-center'}`
              }
              title={!sidebarOpen ? item.name : undefined}
            >
              <item.icon className="w-5 h-5 flex-shrink-0" />
              {sidebarOpen && <span className="font-medium animate-fade-in">{item.name}</span>}
            </NavLink>
          ))}
        </nav>

        {/* Collapse button when sidebar is collapsed */}
        {!sidebarOpen && (
          <div className="p-4 border-t border-gray-800">
            <button
              onClick={() => setSidebarOpen(true)}
              className="w-full p-3 rounded-xl hover:bg-dark-300 transition-colors text-gray-400"
            >
              <ChevronRight className="w-5 h-5 mx-auto" />
            </button>
          </div>
        )}

        {/* User section */}
        <div className={`p-4 border-t border-gray-800 ${!sidebarOpen && 'flex flex-col items-center'}`}>
          {sidebarOpen ? (
            <div className="flex items-center gap-3 mb-3 p-3 rounded-xl bg-dark-300">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-purple-500 flex items-center justify-center">
                <Wallet className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">{user?.username || 'Admin'}</p>
                <p className="text-xs text-gray-400 truncate">
                  {user?.address?.slice(0, 8)}...{user?.address?.slice(-6)}
                </p>
              </div>
            </div>
          ) : (
            <div className="mb-3 w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-purple-500 flex items-center justify-center">
              <Wallet className="w-5 h-5 text-white" />
            </div>
          )}
          <button
            onClick={handleLogout}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-red-400 hover:bg-red-500/10 transition-colors w-full ${
              !sidebarOpen && 'justify-center'
            }`}
            title={!sidebarOpen ? 'Logout' : undefined}
          >
            <LogOut className="w-5 h-5" />
            {sidebarOpen && <span>Logout</span>}
          </button>
        </div>
      </aside>

      {/* Mobile sidebar */}
      <div
        className={`lg:hidden fixed inset-0 z-50 ${mobileMenuOpen ? 'visible' : 'invisible'}`}
      >
        {/* Backdrop */}
        <div
          className={`absolute inset-0 bg-black/50 transition-opacity ${
            mobileMenuOpen ? 'opacity-100' : 'opacity-0'
          }`}
          onClick={() => setMobileMenuOpen(false)}
        />

        {/* Sidebar */}
        <aside
          className={`absolute left-0 top-0 h-full w-64 bg-dark-400 border-r border-gray-800 transition-transform ${
            mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          {/* Logo */}
          <div className="p-4 flex items-center justify-between border-b border-gray-800">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl gradient-bg flex items-center justify-center">
                <span className="text-lg font-bold text-white">DG</span>
              </div>
              <div>
                <h1 className="font-bold text-white">DeGearns</h1>
                <p className="text-xs text-gray-400">Admin Panel</p>
              </div>
            </div>
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="p-2 rounded-lg hover:bg-dark-300 transition-colors text-gray-400"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="p-4 space-y-2">
            {navigation.map((item) => (
              <NavLink
                key={item.name}
                to={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 ${
                    isActive
                      ? 'bg-primary-500/20 text-primary-400'
                      : 'text-gray-400 hover:bg-dark-300 hover:text-white'
                  }`
                }
              >
                <item.icon className="w-5 h-5" />
                <span className="font-medium">{item.name}</span>
              </NavLink>
            ))}
          </nav>

          {/* User section */}
          <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-800">
            <div className="flex items-center gap-3 mb-3 p-3 rounded-xl bg-dark-300">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-purple-500 flex items-center justify-center">
                <Wallet className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">{user?.username || 'Admin'}</p>
                <p className="text-xs text-gray-400 truncate">
                  {user?.address?.slice(0, 8)}...{user?.address?.slice(-6)}
                </p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-red-400 hover:bg-red-500/10 transition-colors w-full"
            >
              <LogOut className="w-5 h-5" />
              <span>Logout</span>
            </button>
          </div>
        </aside>
      </div>

      {/* Main content */}
      <main className={`flex-1 transition-all duration-300 ${sidebarOpen ? 'lg:ml-64' : 'lg:ml-20'}`}>
        {/* Top bar */}
        <header className="sticky top-0 z-30 bg-dark-500/80 backdrop-blur-lg border-b border-gray-800">
          <div className="flex items-center justify-between px-4 py-4 lg:px-8">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setMobileMenuOpen(true)}
                className="lg:hidden p-2 rounded-lg hover:bg-dark-300 transition-colors text-gray-400"
              >
                <Menu className="w-6 h-6" />
              </button>
              <h1 className="text-xl lg:text-2xl font-bold text-white">{getPageTitle()}</h1>
            </div>
            <div className="flex items-center gap-4">
              <div className="hidden sm:flex items-center gap-2 px-3 py-2 rounded-lg bg-dark-300">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                <span className="text-sm text-gray-400">Connected</span>
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <div className="p-4 lg:p-8">
          <Outlet />
        </div>
      </main>
    </div>
  )
}

export default Layout
