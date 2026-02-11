import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import api from '../services/api'
import { socketService } from '../services/socket'

export const useChatStore = defineStore('chat', () => {
  // State
  const conversations = ref([])
  const activeConversation = ref(null)
  const messages = ref([])
  const typing = ref({}) // { conversationId: [userIds] }
  const loading = ref(false)
  const error = ref(null)

  // Getters
  const unreadCount = computed(() =>
    (conversations.value || []).reduce((sum, conv) => sum + (conv.unreadCount || 0), 0)
  )

  const totalUnread = computed(() => unreadCount.value)

  const typingUsers = computed(() => {
    if (!activeConversation.value) return []
    return typing.value[activeConversation.value.id] || []
  })

  const sortedConversations = computed(() =>
    [...(conversations.value || [])].sort((a, b) => 
      new Date(b.lastMessageAt || b.createdAt || 0) - new Date(a.lastMessageAt || a.createdAt || 0)
    )
  )

  // Actions
  async function fetchConversations() {
    loading.value = true
    error.value = null
    try {
      const response = await api.get('/chat/rooms')
      const responseData = response.data.data || response.data
      const rooms = responseData.rooms || responseData || []
      conversations.value = Array.isArray(rooms) ? rooms : []
      return conversations.value
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to fetch conversations'
      conversations.value = []
      throw err
    } finally {
      loading.value = false
    }
  }

  async function fetchMessages(conversationId, page = 1) {
    loading.value = true
    error.value = null
    try {
      const response = await api.get(`/chat/rooms/${conversationId}/messages`, {
        params: { page, limit: 50 }
      })
      const responseData = response.data.data || response.data
      const fetchedMessages = responseData.messages || responseData || []
      if (page === 1) {
        messages.value = Array.isArray(fetchedMessages) ? [...fetchedMessages].reverse() : []
      } else {
        messages.value.unshift(...(Array.isArray(fetchedMessages) ? [...fetchedMessages].reverse() : []))
      }
      return response.data
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to fetch messages'
      messages.value = []
      throw err
    } finally {
      loading.value = false
    }
  }

  async function sendMessage(conversationId, messageData, type = 'text') {
    try {
      // Handle both string content and object with content property
      const content = typeof messageData === 'string' ? messageData : messageData.content
      const msgType = typeof messageData === 'object' ? messageData.type || type : type
      
      const response = await api.post(`/chat/rooms/${conversationId}/messages`, {
        content,
        type: msgType
      })
      const responseData = response.data.data || response.data
      const msg = responseData.message || responseData
      messages.value.push(msg)
      
      // Update conversation's last message
      const conv = conversations.value.find(c => c.id === conversationId)
      if (conv) {
        conv.lastMessage = msg
        conv.lastMessageAt = msg.createdAt || msg.created_at
      }
      
      // Emit via socket for real-time delivery
      socketService.emit('chat:message', {
        conversationId,
        message: msg
      })
      
      return msg
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to send message'
      throw err
    }
  }

  async function startConversation(userId) {
    try {
      // Use direct message endpoint to get or create a DM room
      const targetId = typeof userId === 'object' ? userId.id : userId
      const response = await api.get(`/chat/direct/${targetId}`)
      const responseData = response.data.data || response.data
      const room = responseData.room || responseData
      
      // Add user info to room for display purposes
      if (typeof userId === 'object') {
        room.user = userId
      }
      
      const existingIndex = conversations.value.findIndex(c => c.id === room.id)
      if (existingIndex === -1) {
        conversations.value.unshift(room)
      }
      
      // Set as active and fetch messages
      activeConversation.value = room
      await fetchMessages(room.id)
      
      return room
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to start conversation'
      throw err
    }
  }

  async function createGroupConversation(name, userIds) {
    try {
      const response = await api.post('/chat/rooms', { name, members: userIds, type: 'group' })
      const responseData = response.data.data || response.data
      const room = responseData.room || responseData
      conversations.value.unshift(room)
      return room
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to create group'
      throw err
    }
  }

  async function markAsRead(conversationId) {
    try {
      // Mark messages as read locally (backend can handle this via reading messages)
      const conv = conversations.value.find(c => c.id === conversationId)
      if (conv) {
        conv.unreadCount = 0
      }
    } catch (err) {
      console.error('Failed to mark as read:', err)
    }
  }

  function setActiveConversation(conversation) {
    activeConversation.value = conversation
    messages.value = []
  }

  // Socket event handlers
  function handleNewMessage(data) {
    const { conversationId, message } = data
    
    // Add message if viewing this conversation
    if (activeConversation.value?.id === conversationId) {
      const exists = messages.value.some(m => m.id === message.id)
      if (!exists) {
        messages.value.push(message)
      }
    }
    
    // Update conversation
    const conv = conversations.value.find(c => c.id === conversationId)
    if (conv) {
      conv.lastMessage = message
      conv.lastMessageAt = message.createdAt
      if (activeConversation.value?.id !== conversationId) {
        conv.unreadCount = (conv.unreadCount || 0) + 1
      }
    }
  }

  function handleTyping(data) {
    const { conversationId, userId, isTyping } = data
    if (!typing.value[conversationId]) {
      typing.value[conversationId] = []
    }
    
    if (isTyping) {
      if (!typing.value[conversationId].includes(userId)) {
        typing.value[conversationId].push(userId)
      }
    } else {
      if (Array.isArray(typing.value[conversationId])) {
        typing.value[conversationId] = typing.value[conversationId].filter(id => id !== userId)
      }
    }
  }

  function sendTypingIndicator(conversationId, isTyping) {
    socketService.emit('chat:typing', { conversationId, isTyping })
  }

  function reset() {
    conversations.value = []
    activeConversation.value = null
    messages.value = []
    typing.value = {}
  }

  return {
    // State
    conversations,
    activeConversation,
    messages,
    typing,
    loading,
    error,
    // Getters
    unreadCount,
    totalUnread,
    typingUsers,
    sortedConversations,
    // Actions
    fetchConversations,
    fetchMessages,
    sendMessage,
    startConversation,
    createGroupConversation,
    markAsRead,
    setActiveConversation,
    sendTypingIndicator,
    closeActiveConversation: () => { activeConversation.value = null },
    // Socket handlers
    handleNewMessage,
    handleTyping,
    // Reset
    reset
  }
})
