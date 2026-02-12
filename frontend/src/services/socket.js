import { io } from 'socket.io-client'
import { useSocialStore } from '../stores/social'
import { useChatStore } from '../stores/chat'

// Socket connects to the same origin.
// Routing is handled by nginx (Docker) or Vite proxy (local dev).

class SocketService {
  constructor() {
    this.socket = null
    this.connected = false
    this.reconnectAttempts = 0
    this.maxReconnectAttempts = 5
  }

  connect(token) {
    if (this.socket?.connected) {
      return
    }

    this.socket = io({
      auth: { token },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: this.maxReconnectAttempts,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      path: '/socket.io/'
    })

    this.setupEventListeners()
  }

  setupEventListeners() {
    if (!this.socket) return

    // Connection events
    this.socket.on('connect', () => {
      console.log('🔌 Socket connected')
      this.connected = true
      this.reconnectAttempts = 0
    })

    this.socket.on('disconnect', (reason) => {
      console.log('🔌 Socket disconnected:', reason)
      this.connected = false
    })

    this.socket.on('connect_error', (error) => {
      console.error('🔌 Socket connection error:', error.message)
      this.reconnectAttempts++
    })

    // User status events
    this.socket.on('user:online', (userId) => {
      const socialStore = useSocialStore()
      socialStore.setUserOnline(userId)
    })

    this.socket.on('user:offline', (userId) => {
      const socialStore = useSocialStore()
      socialStore.setUserOffline(userId)
    })

    // Notification events
    this.socket.on('notification', (notification) => {
      const socialStore = useSocialStore()
      socialStore.addNotification(notification)
    })

    // Friend events
    this.socket.on('friend:request', (request) => {
      const socialStore = useSocialStore()
      socialStore.friendRequests.push(request)
    })

    this.socket.on('friend:accepted', (friend) => {
      const socialStore = useSocialStore()
      socialStore.friends.push(friend)
    })

    // Chat events
    this.socket.on('chat:message', (data) => {
      const chatStore = useChatStore()
      chatStore.handleNewMessage(data)
    })

    this.socket.on('chat:typing', (data) => {
      const chatStore = useChatStore()
      chatStore.handleTyping(data)
    })

    // Game events
    this.socket.on('game:invite', (data) => {
      const socialStore = useSocialStore()
      socialStore.addNotification({
        id: Date.now(),
        type: 'game_invite',
        message: `${data.from.username} invited you to visit their farm!`,
        data,
        read: false,
        createdAt: new Date().toISOString()
      })
    })

    this.socket.on('game:visit', (data) => {
      // Handle incoming farm visit
      window.dispatchEvent(new CustomEvent('farm:visit', { detail: data }))
    })
  }

  emit(event, data) {
    if (this.socket?.connected) {
      this.socket.emit(event, data)
    } else {
      console.warn('Socket not connected, cannot emit:', event)
    }
  }

  on(event, callback) {
    if (this.socket) {
      this.socket.on(event, callback)
    }
  }

  off(event, callback) {
    if (this.socket) {
      this.socket.off(event, callback)
    }
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect()
      this.socket = null
      this.connected = false
    }
  }

  // Game-specific methods
  inviteToFarm(userId) {
    this.emit('game:invite', { userId })
  }

  visitFarm(userId) {
    this.emit('game:visit', { userId })
  }

  shareFarmState(state) {
    this.emit('game:farm:state', state)
  }

  // Chat typing indicators
  startTyping(conversationId) {
    this.emit('chat:typing', { conversationId, isTyping: true })
  }

  stopTyping(conversationId) {
    this.emit('chat:typing', { conversationId, isTyping: false })
  }

  // Join a room (for chat or multiplayer)
  joinRoom(roomId) {
    this.emit('room:join', { roomId })
  }

  leaveRoom(roomId) {
    this.emit('room:leave', { roomId })
  }
}

export const socketService = new SocketService()
