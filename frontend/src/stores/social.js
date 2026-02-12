import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import api from '../services/api'

export const useSocialStore = defineStore('social', () => {
  // State
  const posts = ref([])
  const friends = ref([])
  const friendRequests = ref([])
  const sentRequests = ref([])
  const notifications = ref([])
  const onlineUsers = ref(new Set())
  const loading = ref(false)
  const error = ref(null)

  // Pagination
  const currentPage = ref(1)
  const hasMore = ref(true)

  // Getters
  const unreadNotifications = computed(() => 
    (notifications.value || []).filter(n => !n.read).length
  )

  const pendingRequests = computed(() =>
    (friendRequests.value || []).filter(r => r.status === 'pending')
  )

  // Post Actions
  async function fetchPosts(page = 1, reset = false) {
    loading.value = true
    error.value = null
    try {
      const response = await api.get('/posts', { params: { page, limit: 10 } })
      const responseData = response.data.data || response.data
      const fetchedPosts = responseData.posts || responseData || []
      if (reset) {
        posts.value = Array.isArray(fetchedPosts) ? fetchedPosts : []
      } else {
        if (!Array.isArray(posts.value)) posts.value = []
        posts.value.push(...(Array.isArray(fetchedPosts) ? fetchedPosts : []))
      }
      currentPage.value = page
      hasMore.value = responseData.hasMore !== undefined ? responseData.hasMore : fetchedPosts.length >= 10
      return responseData
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to fetch posts'
      if (reset) {
        posts.value = []
      }
      return { posts: [], hasMore: false }
    } finally {
      loading.value = false
    }
  }

  async function createPost(postData) {
    loading.value = true
    error.value = null
    try {
      const response = await api.post('/posts', postData)
      const responseData = response.data.data || response.data
      const newPost = responseData.post || responseData
      if (!Array.isArray(posts.value)) posts.value = []
      posts.value.unshift(newPost)
      return newPost
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to create post'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function likePost(postId) {
    try {
      const postIndex = posts.value.findIndex(p => p.id === postId)
      if (postIndex !== -1) {
        const post = posts.value[postIndex]
        // Optimistic update
        if (post.user_liked) {
          // Unlike
          await api.delete(`/posts/${postId}/like`)
          posts.value[postIndex].user_liked = false
          posts.value[postIndex].likes_count = Math.max(0, (post.likes_count || 0) - 1)
        } else {
          // Like
          await api.post(`/posts/${postId}/like`)
          posts.value[postIndex].user_liked = true
          posts.value[postIndex].likes_count = (post.likes_count || 0) + 1
        }
      }
      return posts.value[postIndex]
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to like post'
      throw err
    }
  }

  async function commentOnPost(postId, content) {
    try {
      const response = await api.post(`/posts/${postId}/comments`, { content })
      const responseData = response.data.data || response.data
      const newComment = responseData.comment || responseData
      const postIndex = posts.value.findIndex(p => p.id === postId)
      if (postIndex !== -1) {
        if (!posts.value[postIndex].comments) {
          posts.value[postIndex].comments = []
        }
        posts.value[postIndex].comments.push(newComment)
        // Increment comments count
        posts.value[postIndex].comments_count = (posts.value[postIndex].comments_count || 0) + 1
      }
      return newComment
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to add comment'
      throw err
    }
  }

  async function fetchPostComments(postId) {
    try {
      const response = await api.get(`/posts/${postId}/comments`)
      const responseData = response.data.data || response.data
      const comments = responseData.comments || responseData || []
      const postIndex = posts.value.findIndex(p => p.id === postId)
      if (postIndex !== -1) {
        posts.value[postIndex].comments = comments
      }
      return comments
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to fetch comments'
      return []
    }
  }

  async function updatePost(postId, postData) {
    try {
      const response = await api.put(`/posts/${postId}`, postData)
      const responseData = response.data.data || response.data
      const updatedPost = responseData.post || responseData
      const postIndex = posts.value.findIndex(p => p.id === postId)
      if (postIndex !== -1) {
        posts.value[postIndex] = { ...posts.value[postIndex], ...updatedPost }
      }
      return updatedPost
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to update post'
      throw err
    }
  }

  async function deletePost(postId) {
    try {
      await api.delete(`/posts/${postId}`)
      if (!Array.isArray(posts.value)) posts.value = []
      posts.value = posts.value.filter(p => p.id !== postId)
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to delete post'
      throw err
    }
  }

  // Friend Actions
  async function fetchFriends() {
    loading.value = true
    error.value = null
    try {
      const response = await api.get('/friends')
      const responseData = response.data.data || response.data
      friends.value = responseData.friends || responseData || []
      return friends.value
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to fetch friends'
      // Return empty array instead of throwing
      friends.value = []
      return []
    } finally {
      loading.value = false
    }
  }

  async function fetchFriendRequests() {
    try {
      const response = await api.get('/friends/requests/pending')
      const responseData = response.data.data || response.data
      friendRequests.value = responseData.requests || responseData || []
      return friendRequests.value
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to fetch requests'
      friendRequests.value = []
      return []
    }
  }

  async function fetchSentRequests() {
    try {
      const response = await api.get('/friends/requests/sent')
      const responseData = response.data.data || response.data
      sentRequests.value = responseData.requests || responseData || []
      return sentRequests.value
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to fetch sent requests'
      sentRequests.value = []
      return []
    }
  }

  async function sendFriendRequest(userId) {
    try {
      const response = await api.post('/friends/requests', { receiverId: userId })
      // Add to sent requests for UI updates
      const responseData = response.data.data || response.data
      if (responseData.request) {
        sentRequests.value.push(responseData.request)
      }
      return response.data
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to send request'
      throw err
    }
  }

  async function acceptFriendRequest(requestId) {
    try {
      const response = await api.post(`/friends/requests/${requestId}/accept`)
      // Remove from requests, add to friends
      if (!Array.isArray(friendRequests.value)) friendRequests.value = []
      friendRequests.value = friendRequests.value.filter(r => r.id !== requestId)
      if (response.data.friend) {
        if (!Array.isArray(friends.value)) friends.value = []
        friends.value.push(response.data.friend)
      }
      return response.data
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to accept request'
      throw err
    }
  }

  async function declineFriendRequest(requestId) {
    try {
      await api.post(`/friends/requests/${requestId}/decline`)
      if (!Array.isArray(friendRequests.value)) friendRequests.value = []
      friendRequests.value = friendRequests.value.filter(r => r.id !== requestId)
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to decline request'
      throw err
    }
  }

  async function removeFriend(friendId) {
    try {
      await api.delete(`/friends/${friendId}`)
      if (!Array.isArray(friends.value)) friends.value = []
      friends.value = friends.value.filter(f => f.id !== friendId)
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to remove friend'
      throw err
    }
  }

  async function blockUser(userId) {
    try {
      await api.post('/friends/block', { userId })
      if (!Array.isArray(friends.value)) friends.value = []
      friends.value = friends.value.filter(f => f.id !== userId)
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to block user'
      throw err
    }
  }

  // Notification Actions
  async function fetchNotifications() {
    try {
      const response = await api.get('/notifications')
      const responseData = response.data.data || response.data
      notifications.value = responseData.notifications || responseData || []
      return notifications.value
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to fetch notifications'
      notifications.value = []
      throw err
    }
  }

  async function markNotificationRead(notificationId) {
    try {
      await api.post(`/notifications/${notificationId}/read`)
      const notification = notifications.value.find(n => n.id === notificationId)
      if (notification) {
        notification.read = true
      }
    } catch (err) {
      console.error('Failed to mark notification as read:', err)
    }
  }

  async function markAllNotificationsRead() {
    try {
      await api.post('/notifications/read-all')
      if (Array.isArray(notifications.value)) {
        notifications.value.forEach(n => n.read = true)
      }
    } catch (err) {
      console.error('Failed to mark all notifications as read:', err)
    }
  }

  // Online status
  function setUserOnline(userId) {
    onlineUsers.value.add(userId)
  }

  function setUserOffline(userId) {
    onlineUsers.value.delete(userId)
  }

  function isUserOnline(userId) {
    return onlineUsers.value.has(userId)
  }

  // Add notification (from socket)
  function addNotification(notification) {
    if (!Array.isArray(notifications.value)) notifications.value = []
    notifications.value.unshift(notification)
  }

  // Reset state
  function reset() {
    posts.value = []
    friends.value = []
    friendRequests.value = []
    sentRequests.value = []
    notifications.value = []
    onlineUsers.value = new Set()
    currentPage.value = 1
    hasMore.value = true
  }

  return {
    // State
    posts,
    friends,
    friendRequests,
    sentRequests,
    notifications,
    onlineUsers,
    loading,
    error,
    currentPage,
    hasMore,
    // Getters
    unreadNotifications,
    pendingRequests,
    // Post Actions
    fetchPosts,
    createPost,
    updatePost,
    likePost,
    commentOnPost,
    fetchPostComments,
    deletePost,
    // Friend Actions
    fetchFriends,
    fetchFriendRequests,
    fetchSentRequests,
    sendFriendRequest,
    acceptFriendRequest,
    declineFriendRequest,
    removeFriend,
    blockUser,
    // Notification Actions
    fetchNotifications,
    markNotificationRead,
    markAllNotificationsRead,
    addNotification,
    // Online status
    setUserOnline,
    setUserOffline,
    isUserOnline,
    // Reset
    reset
  }
})
