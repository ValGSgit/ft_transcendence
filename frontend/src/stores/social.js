import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import api from '../services/api'

export const useSocialStore = defineStore('social', () => {
  // State
  const posts = ref([])
  const friends = ref([])
  const friendRequests = ref([])
  const notifications = ref([])
  const onlineUsers = ref(new Set())
  const loading = ref(false)
  const error = ref(null)

  // Pagination
  const currentPage = ref(1)
  const hasMore = ref(true)

  // Getters
  const unreadNotifications = computed(() => 
    notifications.value.filter(n => !n.read).length
  )

  const pendingRequests = computed(() =>
    friendRequests.value.filter(r => r.status === 'pending')
  )

  // Post Actions
  async function fetchPosts(page = 1, reset = false) {
    loading.value = true
    error.value = null
    try {
      const response = await api.get('/posts', { params: { page, limit: 10 } })
      if (reset) {
        posts.value = response.data.posts
      } else {
        posts.value.push(...response.data.posts)
      }
      currentPage.value = page
      hasMore.value = response.data.hasMore
      return response.data
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to fetch posts'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function createPost(postData) {
    loading.value = true
    error.value = null
    try {
      const response = await api.post('/posts', postData)
      posts.value.unshift(response.data.post)
      return response.data.post
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to create post'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function likePost(postId) {
    try {
      const response = await api.post(`/posts/${postId}/like`)
      const postIndex = posts.value.findIndex(p => p.id === postId)
      if (postIndex !== -1) {
        posts.value[postIndex] = response.data.post
      }
      return response.data.post
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to like post'
      throw err
    }
  }

  async function commentOnPost(postId, content) {
    try {
      const response = await api.post(`/posts/${postId}/comments`, { content })
      const postIndex = posts.value.findIndex(p => p.id === postId)
      if (postIndex !== -1) {
        if (!posts.value[postIndex].comments) {
          posts.value[postIndex].comments = []
        }
        posts.value[postIndex].comments.push(response.data.comment)
      }
      return response.data.comment
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to add comment'
      throw err
    }
  }

  async function deletePost(postId) {
    try {
      await api.delete(`/posts/${postId}`)
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
      friends.value = response.data.friends
      return response.data.friends
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to fetch friends'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function fetchFriendRequests() {
    try {
      const response = await api.get('/friends/requests')
      friendRequests.value = response.data.requests
      return response.data.requests
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to fetch requests'
      throw err
    }
  }

  async function sendFriendRequest(userId) {
    try {
      const response = await api.post('/friends/request', { userId })
      return response.data
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to send request'
      throw err
    }
  }

  async function acceptFriendRequest(requestId) {
    try {
      const response = await api.post(`/friends/accept/${requestId}`)
      // Remove from requests, add to friends
      friendRequests.value = friendRequests.value.filter(r => r.id !== requestId)
      if (response.data.friend) {
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
      await api.post(`/friends/decline/${requestId}`)
      friendRequests.value = friendRequests.value.filter(r => r.id !== requestId)
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to decline request'
      throw err
    }
  }

  async function removeFriend(friendId) {
    try {
      await api.delete(`/friends/${friendId}`)
      friends.value = friends.value.filter(f => f.id !== friendId)
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to remove friend'
      throw err
    }
  }

  async function blockUser(userId) {
    try {
      await api.post(`/friends/block/${userId}`)
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
      notifications.value = response.data.notifications
      return response.data.notifications
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to fetch notifications'
      throw err
    }
  }

  async function markNotificationRead(notificationId) {
    try {
      await api.put(`/notifications/${notificationId}/read`)
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
      await api.put('/notifications/read-all')
      notifications.value.forEach(n => n.read = true)
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
    notifications.value.unshift(notification)
  }

  // Reset state
  function reset() {
    posts.value = []
    friends.value = []
    friendRequests.value = []
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
    likePost,
    commentOnPost,
    deletePost,
    // Friend Actions
    fetchFriends,
    fetchFriendRequests,
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
