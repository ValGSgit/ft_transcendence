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
    conversations.value.reduce((sum, conv) => sum + (conv.unreadCount || 0), 0)
  )

  const sortedConversations = computed(() =>
    [...conversations.value].sort((a, b) => 
      new Date(b.lastMessageAt || b.createdAt) - new Date(a.lastMessageAt || a.createdAt)
    )
  )

  // Actions
  async function fetchConversations() {
    loading.value = true
    error.value = null
    try {
      const response = await api.get('/chat/conversations')
      conversations.value = response.data.conversations
      return response.data.conversations
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to fetch conversations'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function fetchMessages(conversationId, page = 1) {
    loading.value = true
    error.value = null
    try {
      const response = await api.get(`/chat/conversations/${conversationId}/messages`, {
        params: { page, limit: 50 }
      })
      if (page === 1) {
        messages.value = response.data.messages.reverse()
      } else {
        messages.value.unshift(...response.data.messages.reverse())
      }
      return response.data
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to fetch messages'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function sendMessage(conversationId, content, type = 'text') {
    try {
      const response = await api.post(`/chat/conversations/${conversationId}/messages`, {
        content,
        type
      })
      messages.value.push(response.data.message)
      
      // Update conversation's last message
      const conv = conversations.value.find(c => c.id === conversationId)
      if (conv) {
        conv.lastMessage = response.data.message
        conv.lastMessageAt = response.data.message.createdAt
      }
      
      // Emit via socket for real-time delivery
      socketService.emit('chat:message', {
        conversationId,
        message: response.data.message
      })
      
      return response.data.message
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to send message'
      throw err
    }
  }

  async function startConversation(userId) {
    try {
      const response = await api.post('/chat/conversations', { userId })
      const existingIndex = conversations.value.findIndex(c => c.id === response.data.conversation.id)
      if (existingIndex === -1) {
        conversations.value.unshift(response.data.conversation)
      }
      return response.data.conversation
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to start conversation'
      throw err
    }
  }

  async function createGroupConversation(name, userIds) {
    try {
      const response = await api.post('/chat/conversations/group', { name, userIds })
      conversations.value.unshift(response.data.conversation)
      return response.data.conversation
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to create group'
      throw err
    }
  }

  async function markAsRead(conversationId) {
    try {
      await api.put(`/chat/conversations/${conversationId}/read`)
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
      typing.value[conversationId] = typing.value[conversationId].filter(id => id !== userId)
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
    // Socket handlers
    handleNewMessage,
    handleTyping,
    // Reset
    reset
  }
})
