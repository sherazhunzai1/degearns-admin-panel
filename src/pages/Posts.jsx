import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
  MessageSquare,
  Search,
  ChevronLeft,
  ChevronRight,
  Eye,
  EyeOff,
  Trash2,
  Image,
  Video,
  FileText,
  AlertTriangle,
  Loader2
} from 'lucide-react'
import {
  fetchPosts,
  fetchPostStatistics,
  setFilters,
  setPage,
  togglePostVisibility,
  deletePost
} from '../store/slices/postsSlice'

const Posts = () => {
  const dispatch = useDispatch()
  const { posts, statistics, pagination, filters, loading, actionLoading } = useSelector((state) => state.posts)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    dispatch(fetchPosts(filters))
    dispatch(fetchPostStatistics())
  }, [dispatch, filters, pagination.page])

  const handleSearch = (e) => {
    e.preventDefault()
    dispatch(setFilters({ search: searchTerm }))
  }

  const handleTypeFilter = (postType) => {
    dispatch(setFilters({ postType: postType === 'all' ? undefined : postType }))
  }

  const handleVisibilityFilter = (isActive) => {
    dispatch(setFilters({ isActive: isActive === 'all' ? undefined : isActive === 'true' }))
  }

  const handleToggleVisibility = (postId, currentStatus) => {
    const reason = currentStatus ? 'Hidden by admin' : 'Restored by admin'
    dispatch(togglePostVisibility({ postId, isActive: !currentStatus, reason }))
  }

  const handleDeletePost = (postId) => {
    if (confirm('Are you sure you want to delete this post? This action cannot be undone.')) {
      dispatch(deletePost({ postId, reason: 'Deleted by admin' }))
    }
  }

  const getTypeIcon = (type) => {
    switch (type) {
      case 'image': return <Image className="w-4 h-4" />
      case 'video': return <Video className="w-4 h-4" />
      case 'mixed': return <FileText className="w-4 h-4" />
      default: return <FileText className="w-4 h-4" />
    }
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary-500/20 flex items-center justify-center">
              <MessageSquare className="w-5 h-5 text-primary-400" />
            </div>
            <div>
              <p className="text-gray-400 text-sm">Total Posts</p>
              <p className="text-xl font-bold text-white">{statistics.totalPosts}</p>
            </div>
          </div>
        </div>
        <div className="glass rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center">
              <Eye className="w-5 h-5 text-green-400" />
            </div>
            <div>
              <p className="text-gray-400 text-sm">Active</p>
              <p className="text-xl font-bold text-white">{statistics.activePosts}</p>
            </div>
          </div>
        </div>
        <div className="glass rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-red-500/20 flex items-center justify-center">
              <EyeOff className="w-5 h-5 text-red-400" />
            </div>
            <div>
              <p className="text-gray-400 text-sm">Hidden</p>
              <p className="text-xl font-bold text-white">{statistics.hiddenPosts}</p>
            </div>
          </div>
        </div>
        <div className="glass rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
              <MessageSquare className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <p className="text-gray-400 text-sm">Comments</p>
              <p className="text-xl font-bold text-white">{statistics.totalComments}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="glass rounded-xl p-4">
        <div className="flex flex-col lg:flex-row gap-4">
          <form onSubmit={handleSearch} className="flex-1 flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search posts..."
                className="w-full pl-10 pr-4 py-2 bg-dark-300 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-primary-500"
              />
            </div>
            <button type="submit" className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600">
              Search
            </button>
          </form>

          <div className="flex gap-2 flex-wrap">
            <select
              value={filters.postType || 'all'}
              onChange={(e) => handleTypeFilter(e.target.value)}
              className="px-3 py-2 bg-dark-300 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-primary-500"
            >
              <option value="all">All Types</option>
              <option value="text">Text</option>
              <option value="image">Image</option>
              <option value="video">Video</option>
              <option value="mixed">Mixed</option>
            </select>

            <select
              value={filters.isActive === undefined ? 'all' : filters.isActive.toString()}
              onChange={(e) => handleVisibilityFilter(e.target.value)}
              className="px-3 py-2 bg-dark-300 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-primary-500"
            >
              <option value="all">All Visibility</option>
              <option value="true">Active</option>
              <option value="false">Hidden</option>
            </select>
          </div>
        </div>
      </div>

      {/* Posts List */}
      <div className="glass rounded-xl overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center p-12">
            <Loader2 className="w-8 h-8 text-primary-500 animate-spin" />
          </div>
        ) : posts.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 text-gray-400">
            <MessageSquare className="w-12 h-12 mb-4" />
            <p>No posts found</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-800">
            {posts.map((post) => (
              <div key={post.id} className={`p-4 hover:bg-dark-300/50 ${!post.isActive && 'opacity-60'}`}>
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-purple-500 flex items-center justify-center flex-shrink-0">
                    <span className="text-white font-medium text-sm">
                      {post.author?.username?.[0]?.toUpperCase() || 'U'}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-white">{post.author?.username || 'Unknown'}</span>
                      <span className="text-gray-500 text-sm">•</span>
                      <span className="text-gray-500 text-sm">{new Date(post.createdAt).toLocaleDateString()}</span>
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs ${
                        post.isActive ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                      }`}>
                        {post.isActive ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                        {post.isActive ? 'Active' : 'Hidden'}
                      </span>
                    </div>
                    <p className="text-gray-300 line-clamp-2 mb-2">{post.content}</p>
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        {getTypeIcon(post.postType)} {post.postType}
                      </span>
                      <span>{post.likesCount || 0} likes</span>
                      <span>{post.commentsCount || 0} comments</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleToggleVisibility(post.id, post.isActive)}
                      disabled={actionLoading}
                      className={`p-2 rounded-lg ${
                        post.isActive
                          ? 'hover:bg-yellow-500/20 text-yellow-400'
                          : 'hover:bg-green-500/20 text-green-400'
                      }`}
                      title={post.isActive ? 'Hide' : 'Show'}
                    >
                      {post.isActive ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                    <button
                      onClick={() => handleDeletePost(post.id)}
                      disabled={actionLoading}
                      className="p-2 rounded-lg hover:bg-red-500/20 text-red-400"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-800">
            <p className="text-sm text-gray-400">
              Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total}
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => dispatch(setPage(pagination.page - 1))}
                disabled={pagination.page === 1}
                className="p-2 rounded-lg hover:bg-dark-300 disabled:opacity-50 disabled:cursor-not-allowed text-gray-400"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={() => dispatch(setPage(pagination.page + 1))}
                disabled={pagination.page === pagination.totalPages}
                className="p-2 rounded-lg hover:bg-dark-300 disabled:opacity-50 disabled:cursor-not-allowed text-gray-400"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Posts
