import { useEffect, useState, useRef } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
  Search,
  Plus,
  Edit3,
  Trash2,
  Eye,
  EyeOff,
  GripVertical,
  Image as ImageIcon,
  Link as LinkIcon,
  Calendar,
  CheckCircle,
  X,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Clock,
  AlertCircle,
  ExternalLink,
  Upload,
  CloudUpload
} from 'lucide-react'
import { uploadToIPFS, isIPFSConfigured } from '../services/ipfs'
import {
  fetchBanners,
  fetchBannerStatistics,
  createBanner,
  updateBanner,
  toggleBannerStatus,
  reorderBanners,
  deleteBanner,
  setFilters,
  setPage,
  clearError,
  clearActionSuccess,
  reorderBannersLocally
} from '../store/slices/bannersSlice'

const Banners = () => {
  const dispatch = useDispatch()
  const {
    banners,
    statistics,
    pagination,
    filters,
    loading,
    statsLoading,
    actionLoading,
    error,
    actionSuccess
  } = useSelector((state) => state.banners)

  const [showModal, setShowModal] = useState(false)
  const [editingBanner, setEditingBanner] = useState(null)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [bannerToDelete, setBannerToDelete] = useState(null)
  const [localSearch, setLocalSearch] = useState('')
  const [draggedBanner, setDraggedBanner] = useState(null)

  // File upload state
  const [selectedFile, setSelectedFile] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState(null)
  const fileInputRef = useRef(null)

  const [bannerForm, setBannerForm] = useState({
    title: '',
    subtitle: '',
    image: '',
    link: '',
    linkText: '',
    position: '',
    isActive: true,
    startDate: '',
    endDate: ''
  })

  useEffect(() => {
    dispatch(fetchBannerStatistics())
  }, [dispatch])

  useEffect(() => {
    const params = {
      page: pagination.page,
      limit: pagination.limit,
      ...filters
    }
    Object.keys(params).forEach(key => params[key] === undefined && delete params[key])
    dispatch(fetchBanners(params))
  }, [dispatch, pagination.page, pagination.limit, filters])

  useEffect(() => {
    if (actionSuccess) {
      setShowModal(false)
      setEditingBanner(null)
      resetForm()
      const timer = setTimeout(() => {
        dispatch(clearActionSuccess())
      }, 3000)
      return () => clearTimeout(timer)
    }
  }, [actionSuccess, dispatch])

  const resetForm = () => {
    setBannerForm({
      title: '',
      subtitle: '',
      image: '',
      link: '',
      linkText: '',
      position: '',
      isActive: true,
      startDate: '',
      endDate: ''
    })
    setSelectedFile(null)
    setImagePreview(null)
    setUploadProgress(0)
    setUploadError(null)
  }

  // Handle file selection
  const handleFileSelect = (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      setUploadError('Please select a valid image file (JPEG, PNG, GIF, or WebP)')
      return
    }

    // Validate file size (10MB max)
    if (file.size > 10 * 1024 * 1024) {
      setUploadError('Image size must be less than 10MB')
      return
    }

    setSelectedFile(file)
    setUploadError(null)

    // Create preview
    const reader = new FileReader()
    reader.onload = (e) => {
      setImagePreview(e.target.result)
    }
    reader.readAsDataURL(file)
  }

  // Handle drag and drop for file upload
  const handleFileDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()

    const file = e.dataTransfer?.files?.[0]
    if (file) {
      const fakeEvent = { target: { files: [file] } }
      handleFileSelect(fakeEvent)
    }
  }

  const handleFileDragOver = (e) => {
    e.preventDefault()
    e.stopPropagation()
  }

  // Upload file to IPFS
  const uploadFileToIPFS = async () => {
    if (!selectedFile) return null

    setUploading(true)
    setUploadProgress(0)
    setUploadError(null)

    try {
      const result = await uploadToIPFS(selectedFile, {
        type: 'banner',
        name: `banner-${Date.now()}-${selectedFile.name}`,
        onProgress: (progress) => setUploadProgress(progress)
      })

      return result.url
    } catch (error) {
      setUploadError(error.message)
      return null
    } finally {
      setUploading(false)
    }
  }

  const handleSearch = (e) => {
    e.preventDefault()
    dispatch(setFilters({ search: localSearch }))
  }

  const handleOpenModal = (banner = null) => {
    if (banner) {
      setEditingBanner(banner)
      setBannerForm({
        title: banner.title || '',
        subtitle: banner.subtitle || '',
        image: banner.image || '',
        link: banner.link || '',
        linkText: banner.linkText || '',
        position: banner.position || '',
        isActive: banner.isActive !== false,
        startDate: banner.startDate ? new Date(banner.startDate).toISOString().slice(0, 16) : '',
        endDate: banner.endDate ? new Date(banner.endDate).toISOString().slice(0, 16) : ''
      })
      // Set image preview if editing and banner has image
      if (banner.image) {
        setImagePreview(banner.image)
      }
    } else {
      setEditingBanner(null)
      resetForm()
    }
    setShowModal(true)
  }

  const handleSaveBanner = async () => {
    // Check if we need an image
    const hasImage = bannerForm.image || selectedFile
    if (!bannerForm.title || !hasImage) return

    let imageUrl = bannerForm.image

    // If a new file is selected, upload to IPFS first
    if (selectedFile) {
      const uploadedUrl = await uploadFileToIPFS()
      if (!uploadedUrl) {
        // Upload failed, error is already set
        return
      }
      imageUrl = uploadedUrl
    }

    const data = {
      ...bannerForm,
      image: imageUrl,
      position: bannerForm.position ? parseInt(bannerForm.position) : undefined,
      startDate: bannerForm.startDate || null,
      endDate: bannerForm.endDate || null
    }

    if (editingBanner) {
      await dispatch(updateBanner({ bannerId: editingBanner.id, data }))
    } else {
      await dispatch(createBanner(data))
    }
    dispatch(fetchBannerStatistics())
  }

  const handleToggleStatus = async (banner) => {
    await dispatch(toggleBannerStatus(banner.id))
  }

  const handleDeleteBanner = async () => {
    if (!bannerToDelete) return
    await dispatch(deleteBanner(bannerToDelete.id))
    setShowDeleteModal(false)
    setBannerToDelete(null)
  }

  const handleDragStart = (e, banner) => {
    setDraggedBanner(banner)
    e.dataTransfer.effectAllowed = 'move'
  }

  const handleDragOver = (e, targetBanner) => {
    e.preventDefault()
    if (!draggedBanner || draggedBanner.id === targetBanner.id) return

    const newBanners = [...banners]
    const draggedIndex = newBanners.findIndex(b => b.id === draggedBanner.id)
    const targetIndex = newBanners.findIndex(b => b.id === targetBanner.id)

    newBanners.splice(draggedIndex, 1)
    newBanners.splice(targetIndex, 0, draggedBanner)

    dispatch(reorderBannersLocally(newBanners))
  }

  const handleDragEnd = async () => {
    if (!draggedBanner) return

    const bannerOrders = banners.map((banner, index) => ({
      id: banner.id,
      position: index + 1
    }))

    await dispatch(reorderBanners(bannerOrders))
    setDraggedBanner(null)
    dispatch(fetchBanners({ ...filters, page: pagination.page, limit: pagination.limit }))
  }

  const getStatusBadge = (banner) => {
    if (!banner.isActive) {
      return <span className="badge bg-gray-500/20 text-gray-400">Inactive</span>
    }
    if (banner.isCurrentlyVisible) {
      return <span className="badge badge-success">Visible</span>
    }
    if (banner.startDate && new Date(banner.startDate) > new Date()) {
      return <span className="badge bg-blue-500/20 text-blue-400">Scheduled</span>
    }
    if (banner.endDate && new Date(banner.endDate) < new Date()) {
      return <span className="badge bg-orange-500/20 text-orange-400">Expired</span>
    }
    return <span className="badge badge-success">Active</span>
  }

  const totalPages = pagination.totalPages || Math.ceil(pagination.total / pagination.limit)

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Statistics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="stat-card">
          <div className="flex items-center gap-3 mb-2">
            <ImageIcon className="w-5 h-5 text-primary-400" />
            <span className="text-gray-400 text-sm">Total</span>
          </div>
          {statsLoading ? (
            <div className="h-8 bg-dark-300 rounded animate-pulse"></div>
          ) : (
            <p className="text-2xl font-bold text-white">{statistics.totalBanners}</p>
          )}
        </div>

        <div className="stat-card">
          <div className="flex items-center gap-3 mb-2">
            <Eye className="w-5 h-5 text-green-400" />
            <span className="text-gray-400 text-sm">Active</span>
          </div>
          {statsLoading ? (
            <div className="h-8 bg-dark-300 rounded animate-pulse"></div>
          ) : (
            <p className="text-2xl font-bold text-green-400">{statistics.activeBanners}</p>
          )}
        </div>

        <div className="stat-card">
          <div className="flex items-center gap-3 mb-2">
            <EyeOff className="w-5 h-5 text-gray-400" />
            <span className="text-gray-400 text-sm">Inactive</span>
          </div>
          {statsLoading ? (
            <div className="h-8 bg-dark-300 rounded animate-pulse"></div>
          ) : (
            <p className="text-2xl font-bold text-gray-400">{statistics.inactiveBanners}</p>
          )}
        </div>

        <div className="stat-card">
          <div className="flex items-center gap-3 mb-2">
            <Clock className="w-5 h-5 text-blue-400" />
            <span className="text-gray-400 text-sm">Scheduled</span>
          </div>
          {statsLoading ? (
            <div className="h-8 bg-dark-300 rounded animate-pulse"></div>
          ) : (
            <p className="text-2xl font-bold text-blue-400">{statistics.scheduledBanners}</p>
          )}
        </div>

        <div className="stat-card">
          <div className="flex items-center gap-3 mb-2">
            <AlertCircle className="w-5 h-5 text-orange-400" />
            <span className="text-gray-400 text-sm">Expired</span>
          </div>
          {statsLoading ? (
            <div className="h-8 bg-dark-300 rounded animate-pulse"></div>
          ) : (
            <p className="text-2xl font-bold text-orange-400">{statistics.expiredBanners}</p>
          )}
        </div>

        <div className="stat-card">
          <div className="flex items-center gap-3 mb-2">
            <CheckCircle className="w-5 h-5 text-purple-400" />
            <span className="text-gray-400 text-sm">Visible Now</span>
          </div>
          {statsLoading ? (
            <div className="h-8 bg-dark-300 rounded animate-pulse"></div>
          ) : (
            <p className="text-2xl font-bold text-purple-400">{statistics.currentlyVisibleCount}</p>
          )}
        </div>
      </div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-white">Banner Management</h2>
          <p className="text-gray-400 text-sm mt-1">Manage homepage banners and their display order</p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="btn-primary flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Banner
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <form onSubmit={handleSearch} className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search banners..."
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            className="input-field pl-10"
          />
        </form>

        <select
          value={filters.isActive === undefined ? '' : filters.isActive ? 'active' : 'inactive'}
          onChange={(e) => {
            if (e.target.value === '') {
              dispatch(setFilters({ isActive: undefined }))
            } else {
              dispatch(setFilters({ isActive: e.target.value === 'active' }))
            }
          }}
          className="input-field w-full sm:w-40"
        >
          <option value="">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>

        <select
          value={filters.sortBy}
          onChange={(e) => dispatch(setFilters({ sortBy: e.target.value }))}
          className="input-field w-full sm:w-40"
        >
          <option value="position">Position</option>
          <option value="createdAt">Created Date</option>
          <option value="title">Title</option>
        </select>
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 flex items-center justify-between">
          <span className="text-red-400">{error}</span>
          <button onClick={() => dispatch(clearError())} className="text-red-400 hover:text-red-300">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Success Message */}
      {actionSuccess && (
        <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/30 flex items-center gap-2">
          <CheckCircle className="w-5 h-5 text-green-400" />
          <span className="text-green-400">Banner saved successfully!</span>
        </div>
      )}

      {/* Banners List */}
      <div className="rounded-xl bg-dark-200 border border-gray-800 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="w-8 h-8 text-primary-500 animate-spin" />
          </div>
        ) : banners.length === 0 ? (
          <div className="p-12 text-center">
            <ImageIcon className="w-12 h-12 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400">No banners found</p>
            <p className="text-gray-500 text-sm mt-1">Create your first banner to get started</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-800">
            {banners.map((banner) => (
              <div
                key={banner.id}
                draggable
                onDragStart={(e) => handleDragStart(e, banner)}
                onDragOver={(e) => handleDragOver(e, banner)}
                onDragEnd={handleDragEnd}
                className={`flex items-center gap-4 p-4 hover:bg-dark-300 transition-colors ${
                  draggedBanner?.id === banner.id ? 'opacity-50 bg-dark-300' : ''
                }`}
              >
                {/* Drag Handle */}
                <div className="cursor-grab active:cursor-grabbing text-gray-500 hover:text-gray-300">
                  <GripVertical className="w-5 h-5" />
                </div>

                {/* Position */}
                <div className="w-8 h-8 rounded-lg bg-dark-400 flex items-center justify-center text-gray-400 font-medium">
                  {banner.position}
                </div>

                {/* Banner Image */}
                <div className="w-32 h-20 rounded-lg overflow-hidden bg-dark-400 flex-shrink-0">
                  {banner.image ? (
                    <img
                      src={banner.image}
                      alt={banner.title}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.onerror = null
                        e.target.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 60"><rect fill="%231a1a2e" width="100" height="60"/><text x="50" y="35" text-anchor="middle" fill="%234a5568" font-size="10">No Image</text></svg>'
                      }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <ImageIcon className="w-8 h-8 text-gray-600" />
                    </div>
                  )}
                </div>

                {/* Banner Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="text-white font-medium truncate">{banner.title}</h4>
                    {getStatusBadge(banner)}
                  </div>
                  {banner.subtitle && (
                    <p className="text-gray-400 text-sm truncate mb-1">{banner.subtitle}</p>
                  )}
                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    {banner.link && (
                      <span className="flex items-center gap-1">
                        <LinkIcon className="w-3 h-3" />
                        {banner.linkText || 'Link'}
                      </span>
                    )}
                    {banner.startDate && (
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(banner.startDate).toLocaleDateString()}
                      </span>
                    )}
                    {banner.endDate && (
                      <span className="flex items-center gap-1">
                        <span className="text-gray-600">→</span>
                        {new Date(banner.endDate).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  {banner.link && (
                    <a
                      href={banner.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 rounded-lg hover:bg-dark-400 text-gray-400 hover:text-white transition-colors"
                      title="Preview link"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  )}
                  <button
                    onClick={() => handleToggleStatus(banner)}
                    disabled={actionLoading}
                    className={`p-2 rounded-lg transition-colors ${
                      banner.isActive
                        ? 'hover:bg-yellow-500/20 text-yellow-400'
                        : 'hover:bg-green-500/20 text-green-400'
                    }`}
                    title={banner.isActive ? 'Deactivate' : 'Activate'}
                  >
                    {banner.isActive ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                  <button
                    onClick={() => handleOpenModal(banner)}
                    className="p-2 rounded-lg hover:bg-dark-400 text-gray-400 hover:text-white transition-colors"
                    title="Edit"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => {
                      setBannerToDelete(banner)
                      setShowDeleteModal(true)
                    }}
                    className="p-2 rounded-lg hover:bg-red-500/20 text-gray-400 hover:text-red-400 transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-gray-800">
            <p className="text-gray-400 text-sm">
              Showing {((pagination.page - 1) * pagination.limit) + 1} to{' '}
              {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total}
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => dispatch(setPage(pagination.page - 1))}
                disabled={pagination.page === 1 || loading}
                className="p-2 rounded-lg hover:bg-dark-300 disabled:opacity-50 disabled:cursor-not-allowed text-gray-400"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum
                if (totalPages <= 5) {
                  pageNum = i + 1
                } else if (pagination.page <= 3) {
                  pageNum = i + 1
                } else if (pagination.page >= totalPages - 2) {
                  pageNum = totalPages - 4 + i
                } else {
                  pageNum = pagination.page - 2 + i
                }
                return (
                  <button
                    key={pageNum}
                    onClick={() => dispatch(setPage(pageNum))}
                    disabled={loading}
                    className={`w-10 h-10 rounded-lg font-medium transition-colors ${
                      pagination.page === pageNum
                        ? 'bg-primary-500 text-white'
                        : 'hover:bg-dark-300 text-gray-400'
                    }`}
                  >
                    {pageNum}
                  </button>
                )
              })}
              <button
                onClick={() => dispatch(setPage(pagination.page + 1))}
                disabled={pagination.page === totalPages || loading}
                className="p-2 rounded-lg hover:bg-dark-300 disabled:opacity-50 disabled:cursor-not-allowed text-gray-400"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Drag and Drop Hint */}
      <p className="text-gray-500 text-sm text-center">
        Drag and drop banners to reorder them. Changes are saved automatically.
      </p>

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70" onClick={() => setShowModal(false)} />
          <div className="relative w-full max-w-2xl bg-dark-300 rounded-2xl border border-gray-800 overflow-hidden animate-fade-in">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800">
              <h3 className="text-lg font-semibold text-white">
                {editingBanner ? 'Edit Banner' : 'Create New Banner'}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 rounded-lg hover:bg-dark-200 text-gray-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
              {/* Title */}
              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">
                  Title <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={bannerForm.title}
                  onChange={(e) => setBannerForm({ ...bannerForm, title: e.target.value })}
                  placeholder="Enter banner title"
                  maxLength={200}
                  className="input-field w-full"
                />
              </div>

              {/* Subtitle */}
              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">Subtitle</label>
                <input
                  type="text"
                  value={bannerForm.subtitle}
                  onChange={(e) => setBannerForm({ ...bannerForm, subtitle: e.target.value })}
                  placeholder="Optional subtitle"
                  maxLength={500}
                  className="input-field w-full"
                />
              </div>

              {/* Image Upload */}
              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">
                  Banner Image <span className="text-red-400">*</span>
                </label>

                {/* File Drop Zone */}
                <div
                  onClick={() => fileInputRef.current?.click()}
                  onDrop={handleFileDrop}
                  onDragOver={handleFileDragOver}
                  className={`relative border-2 border-dashed rounded-xl transition-all cursor-pointer ${
                    imagePreview
                      ? 'border-primary-500/50 bg-primary-500/5'
                      : 'border-gray-600 hover:border-primary-500/50 hover:bg-dark-400'
                  }`}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/gif,image/webp"
                    onChange={handleFileSelect}
                    className="hidden"
                  />

                  {imagePreview ? (
                    <div className="relative">
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="w-full h-48 object-cover rounded-xl"
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity rounded-xl flex items-center justify-center">
                        <div className="text-center">
                          <Upload className="w-8 h-8 text-white mx-auto mb-2" />
                          <p className="text-white text-sm">Click to change image</p>
                        </div>
                      </div>
                      {selectedFile && (
                        <div className="absolute bottom-2 left-2 right-2 bg-black/60 rounded-lg px-3 py-1.5">
                          <p className="text-white text-xs truncate">{selectedFile.name}</p>
                          <p className="text-gray-400 text-xs">{(selectedFile.size / 1024).toFixed(1)} KB</p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="p-8 text-center">
                      <CloudUpload className="w-12 h-12 text-gray-500 mx-auto mb-3" />
                      <p className="text-gray-300 font-medium mb-1">
                        Drop your image here or click to browse
                      </p>
                      <p className="text-gray-500 text-sm">
                        Supports: JPEG, PNG, GIF, WebP (Max 10MB)
                      </p>
                    </div>
                  )}
                </div>

                {/* Upload Progress */}
                {uploading && (
                  <div className="mt-3">
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="text-gray-400">Uploading to IPFS...</span>
                      <span className="text-primary-400">{uploadProgress}%</span>
                    </div>
                    <div className="w-full h-2 bg-dark-400 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-primary-500 to-purple-500 transition-all duration-300"
                        style={{ width: `${uploadProgress}%` }}
                      />
                    </div>
                  </div>
                )}

                {/* Upload Error */}
                {uploadError && (
                  <div className="mt-2 p-3 rounded-lg bg-red-500/10 border border-red-500/30 flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                    <p className="text-red-400 text-sm">{uploadError}</p>
                  </div>
                )}

                {/* IPFS Configuration Warning */}
                {!isIPFSConfigured() && (
                  <div className="mt-2 p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/30 flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-yellow-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-yellow-400 text-sm font-medium">IPFS not configured</p>
                      <p className="text-yellow-400/70 text-xs mt-0.5">
                        Set VITE_PINATA_JWT in your environment variables to enable uploads.
                      </p>
                    </div>
                  </div>
                )}

                {/* Existing Image URL (for editing) */}
                {editingBanner && bannerForm.image && !selectedFile && (
                  <p className="mt-2 text-gray-500 text-xs truncate">
                    Current: {bannerForm.image}
                  </p>
                )}
              </div>

              {/* Link */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">Link URL</label>
                  <input
                    type="text"
                    value={bannerForm.link}
                    onChange={(e) => setBannerForm({ ...bannerForm, link: e.target.value })}
                    placeholder="/collections or https://..."
                    className="input-field w-full"
                  />
                </div>
                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">Link Text (CTA)</label>
                  <input
                    type="text"
                    value={bannerForm.linkText}
                    onChange={(e) => setBannerForm({ ...bannerForm, linkText: e.target.value })}
                    placeholder="e.g., Learn More"
                    className="input-field w-full"
                  />
                </div>
              </div>

              {/* Position and Status */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">Position</label>
                  <input
                    type="number"
                    value={bannerForm.position}
                    onChange={(e) => setBannerForm({ ...bannerForm, position: e.target.value })}
                    placeholder="Auto"
                    min={1}
                    className="input-field w-full"
                  />
                  <p className="text-gray-500 text-xs mt-1">Leave empty for auto-increment</p>
                </div>
                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">Status</label>
                  <div className="flex items-center justify-between p-3 rounded-lg bg-dark-400">
                    <span className="text-gray-300">Active</span>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={bannerForm.isActive}
                        onChange={(e) => setBannerForm({ ...bannerForm, isActive: e.target.checked })}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-700 rounded-full peer peer-focus:ring-2 peer-focus:ring-primary-500 peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-500"></div>
                    </label>
                  </div>
                </div>
              </div>

              {/* Schedule */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">Start Date</label>
                  <input
                    type="datetime-local"
                    value={bannerForm.startDate}
                    onChange={(e) => setBannerForm({ ...bannerForm, startDate: e.target.value })}
                    className="input-field w-full"
                  />
                </div>
                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">End Date</label>
                  <input
                    type="datetime-local"
                    value={bannerForm.endDate}
                    onChange={(e) => setBannerForm({ ...bannerForm, endDate: e.target.value })}
                    className="input-field w-full"
                  />
                </div>
              </div>
              <p className="text-gray-500 text-xs">
                Leave dates empty for the banner to be visible immediately and indefinitely.
              </p>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center gap-3 px-6 py-4 border-t border-gray-800">
              <button
                onClick={() => setShowModal(false)}
                className="btn-secondary flex-1"
                disabled={actionLoading || uploading}
              >
                Cancel
              </button>
              <button
                onClick={handleSaveBanner}
                disabled={actionLoading || uploading || !bannerForm.title || (!bannerForm.image && !selectedFile)}
                className="btn-primary flex-1"
              >
                {uploading ? (
                  <div className="flex items-center justify-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Uploading...</span>
                  </div>
                ) : actionLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin mx-auto" />
                ) : (
                  editingBanner ? 'Save Changes' : 'Create Banner'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && bannerToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70" onClick={() => setShowDeleteModal(false)} />
          <div className="relative w-full max-w-md bg-dark-300 rounded-2xl border border-gray-800 p-6 animate-fade-in">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center">
                <Trash2 className="w-6 h-6 text-red-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">Delete Banner</h3>
                <p className="text-gray-400 text-sm">This action cannot be undone</p>
              </div>
            </div>
            <p className="text-gray-300 mb-6">
              Are you sure you want to delete <strong className="text-white">{bannerToDelete.title}</strong>?
            </p>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="btn-secondary flex-1"
                disabled={actionLoading}
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteBanner}
                disabled={actionLoading}
                className="btn-danger flex-1"
              >
                {actionLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin mx-auto" />
                ) : (
                  'Delete Banner'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Banners
