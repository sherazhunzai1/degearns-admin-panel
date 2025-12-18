import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { postsAPI } from '../../services/api'

// Async thunks
export const fetchPosts = createAsyncThunk(
  'posts/fetchPosts',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await postsAPI.getPosts(params)
      return response.data.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch posts')
    }
  }
)

export const fetchPostStatistics = createAsyncThunk(
  'posts/fetchStatistics',
  async (_, { rejectWithValue }) => {
    try {
      const response = await postsAPI.getStatistics()
      return response.data.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch post statistics')
    }
  }
)

export const fetchFlaggedContent = createAsyncThunk(
  'posts/fetchFlagged',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await postsAPI.getFlagged(params)
      return response.data.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch flagged content')
    }
  }
)

export const fetchPostDetails = createAsyncThunk(
  'posts/fetchDetails',
  async (postId, { rejectWithValue }) => {
    try {
      const response = await postsAPI.getPost(postId)
      return response.data.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch post details')
    }
  }
)

export const togglePostVisibility = createAsyncThunk(
  'posts/toggleVisibility',
  async ({ postId, isActive, reason }, { rejectWithValue }) => {
    try {
      const response = await postsAPI.toggleVisibility(postId, isActive, reason)
      return { postId, isActive, ...response.data.data }
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to toggle post visibility')
    }
  }
)

export const deletePost = createAsyncThunk(
  'posts/delete',
  async ({ postId, reason }, { rejectWithValue }) => {
    try {
      await postsAPI.deletePost(postId, reason)
      return { postId }
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete post')
    }
  }
)

export const fetchComments = createAsyncThunk(
  'posts/fetchComments',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await postsAPI.getComments(params)
      return response.data.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch comments')
    }
  }
)

export const deleteComment = createAsyncThunk(
  'posts/deleteComment',
  async ({ commentId, reason }, { rejectWithValue }) => {
    try {
      await postsAPI.deleteComment(commentId, reason)
      return { commentId }
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete comment')
    }
  }
)

export const bulkDeletePosts = createAsyncThunk(
  'posts/bulkDelete',
  async ({ postIds, reason }, { rejectWithValue }) => {
    try {
      await postsAPI.bulkDelete(postIds, reason)
      return { postIds }
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to bulk delete posts')
    }
  }
)

export const bulkHidePosts = createAsyncThunk(
  'posts/bulkHide',
  async ({ postIds, isActive, reason }, { rejectWithValue }) => {
    try {
      await postsAPI.bulkHide(postIds, isActive, reason)
      return { postIds, isActive }
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to bulk hide posts')
    }
  }
)

const initialState = {
  posts: [],
  selectedPost: null,
  comments: [],
  flaggedContent: [],
  statistics: {
    totalPosts: 0,
    activePosts: 0,
    hiddenPosts: 0,
    postTypeBreakdown: {
      text: 0,
      image: 0,
      video: 0,
      mixed: 0
    },
    totalComments: 0,
    activeComments: 0,
    totalLikes: 0,
    newPosts: {
      today: 0,
      thisWeek: 0,
      thisMonth: 0
    }
  },
  pagination: {
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  },
  commentsPagination: {
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  },
  filters: {
    search: '',
    postType: undefined,
    visibility: undefined,
    isActive: undefined,
    authorWallet: undefined,
    sortBy: 'createdAt',
    sortOrder: 'DESC',
  },
  loading: false,
  statsLoading: false,
  actionLoading: false,
  error: null,
}

const postsSlice = createSlice({
  name: 'posts',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null
    },
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload }
      state.pagination.page = 1
    },
    setPage: (state, action) => {
      state.pagination.page = action.payload
    },
    clearSelectedPost: (state) => {
      state.selectedPost = null
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Posts
      .addCase(fetchPosts.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchPosts.fulfilled, (state, action) => {
        state.loading = false
        state.posts = action.payload?.posts || []
        state.pagination = action.payload?.pagination || state.pagination
      })
      .addCase(fetchPosts.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })

      // Fetch Statistics
      .addCase(fetchPostStatistics.pending, (state) => {
        state.statsLoading = true
      })
      .addCase(fetchPostStatistics.fulfilled, (state, action) => {
        state.statsLoading = false
        if (action.payload) {
          state.statistics = action.payload
        }
      })
      .addCase(fetchPostStatistics.rejected, (state, action) => {
        state.statsLoading = false
        state.error = action.payload
      })

      // Fetch Flagged Content
      .addCase(fetchFlaggedContent.fulfilled, (state, action) => {
        state.flaggedContent = action.payload?.posts || []
      })

      // Fetch Post Details
      .addCase(fetchPostDetails.pending, (state) => {
        state.loading = true
      })
      .addCase(fetchPostDetails.fulfilled, (state, action) => {
        state.loading = false
        state.selectedPost = action.payload
      })
      .addCase(fetchPostDetails.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })

      // Toggle Visibility
      .addCase(togglePostVisibility.pending, (state) => {
        state.actionLoading = true
      })
      .addCase(togglePostVisibility.fulfilled, (state, action) => {
        state.actionLoading = false
        const index = state.posts.findIndex((p) => p.id === action.payload.postId)
        if (index !== -1) {
          state.posts[index].isActive = action.payload.isActive
        }
        if (state.selectedPost?.id === action.payload.postId) {
          state.selectedPost.isActive = action.payload.isActive
        }
      })
      .addCase(togglePostVisibility.rejected, (state, action) => {
        state.actionLoading = false
        state.error = action.payload
      })

      // Delete Post
      .addCase(deletePost.pending, (state) => {
        state.actionLoading = true
      })
      .addCase(deletePost.fulfilled, (state, action) => {
        state.actionLoading = false
        state.posts = state.posts.filter((p) => p.id !== action.payload.postId)
        if (state.selectedPost?.id === action.payload.postId) {
          state.selectedPost = null
        }
      })
      .addCase(deletePost.rejected, (state, action) => {
        state.actionLoading = false
        state.error = action.payload
      })

      // Fetch Comments
      .addCase(fetchComments.fulfilled, (state, action) => {
        state.comments = action.payload?.comments || []
        state.commentsPagination = action.payload?.pagination || state.commentsPagination
      })

      // Delete Comment
      .addCase(deleteComment.fulfilled, (state, action) => {
        state.comments = state.comments.filter((c) => c.id !== action.payload.commentId)
      })

      // Bulk Delete Posts
      .addCase(bulkDeletePosts.pending, (state) => {
        state.actionLoading = true
      })
      .addCase(bulkDeletePosts.fulfilled, (state, action) => {
        state.actionLoading = false
        state.posts = state.posts.filter((p) => !action.payload.postIds.includes(p.id))
      })
      .addCase(bulkDeletePosts.rejected, (state, action) => {
        state.actionLoading = false
        state.error = action.payload
      })

      // Bulk Hide Posts
      .addCase(bulkHidePosts.pending, (state) => {
        state.actionLoading = true
      })
      .addCase(bulkHidePosts.fulfilled, (state, action) => {
        state.actionLoading = false
        const { postIds, isActive } = action.payload
        state.posts = state.posts.map((post) => {
          if (postIds.includes(post.id)) {
            return { ...post, isActive }
          }
          return post
        })
      })
      .addCase(bulkHidePosts.rejected, (state, action) => {
        state.actionLoading = false
        state.error = action.payload
      })
  },
})

export const { clearError, setFilters, setPage, clearSelectedPost } = postsSlice.actions
export default postsSlice.reducer
