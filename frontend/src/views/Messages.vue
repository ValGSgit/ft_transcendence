<template>
  <div class="messages-page">
    <!-- Conversations List -->
    <aside class="conversations-sidebar">
      <div class="sidebar-header">
        <h2>Messages</h2>
        <button class="new-message-btn" @click="showNewMessageModal = true">
          ✏️
        </button>
      </div>

      <div class="search-wrapper">
        <span class="search-icon">🔍</span>
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Search messages..."
          class="search-input"
        />
      </div>

      <div class="conversations-list">
        <div
          v-for="conversation in filteredConversations"
          :key="conversation.id"
          :class="['conversation-item', { active: activeConversation?.id === conversation.id }]"
          @click="selectConversation(conversation)"
        >
          <div class="avatar-wrapper">
            <img :src="conversation.user.avatar || defaultAvatar" class="avatar" />
            <span v-if="conversation.user.isOnline" class="online-dot"></span>
          </div>
          <div class="conversation-info">
            <span class="conversation-name">{{ conversation.user.username }}</span>
            <span class="last-message">
              {{ formatLastMessage(conversation.lastMessage) }}
            </span>
          </div>
          <div class="conversation-meta">
            <span class="message-time">{{ formatTime(conversation.lastMessage?.createdAt) }}</span>
            <span v-if="conversation.unreadCount" class="unread-badge">
              {{ conversation.unreadCount }}
            </span>
          </div>
        </div>

        <div v-if="filteredConversations.length === 0" class="empty-conversations">
          <p>{{ searchQuery ? 'No conversations found' : 'No messages yet' }}</p>
        </div>
      </div>
    </aside>

    <!-- Chat Area -->
    <main class="chat-area">
      <template v-if="activeConversation">
        <!-- Chat Header -->
        <header class="chat-header">
          <router-link :to="`/profile/${activeConversation.user.username}`" class="chat-user">
            <div class="avatar-wrapper">
              <img :src="activeConversation.user.avatar || defaultAvatar" class="avatar" />
              <span v-if="activeConversation.user.isOnline" class="online-dot"></span>
            </div>
            <div class="user-info">
              <span class="username">{{ activeConversation.user.username }}</span>
              <span class="user-status">
                {{ activeConversation.user.isOnline ? 'Active now' : `Active ${formatTime(activeConversation.user.lastSeen)}` }}
              </span>
            </div>
          </router-link>
          <div class="chat-actions">
            <button class="action-btn" @click="visitFarm" title="Visit Farm">🦙</button>
            <button class="action-btn" @click="startGame" title="Challenge to Game">🎮</button>
            <button class="action-btn" @click="showChatInfo = !showChatInfo" title="Info">ℹ️</button>
          </div>
        </header>

        <!-- Messages -->
        <div class="messages-container" ref="messagesContainer">
          <div 
            v-for="(message, index) in messages" 
            :key="message.id"
            :class="['message', { own: message.senderId === currentUser?.id }]"
          >
            <!-- Date Separator -->
            <div 
              v-if="shouldShowDate(message, messages[index - 1])"
              class="date-separator"
            >
              <span>{{ formatDate(message.createdAt) }}</span>
            </div>

            <div class="message-content">
              <img 
                v-if="message.senderId !== currentUser?.id"
                :src="activeConversation.user.avatar || defaultAvatar" 
                class="message-avatar"
              />
              <div class="message-bubble">
                <p class="message-text">{{ message.content }}</p>
                
                <!-- Farm Share -->
                <div v-if="message.farmData" class="shared-farm">
                  <div class="farm-preview">
                    <span class="farm-icon">🦙</span>
                    <div class="farm-info">
                      <span class="farm-title">{{ message.farmData.title }}</span>
                      <span class="farm-stats">
                        {{ message.farmData.alpacas }} alpacas • {{ message.farmData.coins }} coins
                      </span>
                    </div>
                  </div>
                  <button class="visit-btn" @click="visitUserFarm(message.farmData.userId)">
                    Visit Farm
                  </button>
                </div>

                <!-- Image -->
                <img v-if="message.image" :src="message.image" class="message-image" />

                <span class="message-time">{{ formatMessageTime(message.createdAt) }}</span>
              </div>
            </div>
          </div>

          <!-- Typing Indicator -->
          <div v-if="isTyping" class="typing-indicator">
            <img :src="activeConversation.user.avatar || defaultAvatar" class="message-avatar" />
            <div class="typing-bubble">
              <span class="dot"></span>
              <span class="dot"></span>
              <span class="dot"></span>
            </div>
          </div>
        </div>

        <!-- Message Input -->
        <div class="message-input-area">
          <div class="input-actions">
            <button class="input-action-btn" @click="attachImage" title="Add Photo">📷</button>
            <button class="input-action-btn" @click="shareFarm" title="Share Farm">🦙</button>
            <button class="input-action-btn" title="Add Emoji">😊</button>
          </div>
          <div class="input-wrapper">
            <textarea
              v-model="newMessage"
              @keydown.enter.exact.prevent="sendMessage"
              @input="handleTyping"
              placeholder="Type a message..."
              rows="1"
              class="message-input"
            ></textarea>
          </div>
          <button 
            class="send-btn" 
            @click="sendMessage"
            :disabled="!newMessage.trim()"
          >
            ➤
          </button>
        </div>
      </template>

      <!-- No Conversation Selected -->
      <div v-else class="no-conversation">
        <div class="empty-chat">
          <div class="empty-icon">💬</div>
          <h3>Select a conversation</h3>
          <p>Choose a friend to start chatting or send a new message</p>
          <button class="btn btn-primary" @click="showNewMessageModal = true">
            ✉️ New Message
          </button>
        </div>
      </div>
    </main>

    <!-- Chat Info Sidebar -->
    <aside v-if="showChatInfo && activeConversation" class="chat-info-sidebar">
      <div class="info-header">
        <h3>Chat Info</h3>
        <button class="close-btn" @click="showChatInfo = false">✕</button>
      </div>
      
      <div class="info-content">
        <div class="info-user">
          <img :src="activeConversation.user.avatar || defaultAvatar" class="info-avatar" />
          <h4>{{ activeConversation.user.username }}</h4>
        </div>

        <div class="info-actions">
          <button @click="visitProfile">
            <span class="icon">👤</span>
            View Profile
          </button>
          <button @click="visitFarm">
            <span class="icon">🦙</span>
            Visit Farm
          </button>
          <button @click="muteConversation">
            <span class="icon">🔔</span>
            {{ activeConversation.muted ? 'Unmute' : 'Mute' }} Notifications
          </button>
        </div>

        <div class="shared-media" v-if="sharedMedia.length">
          <h5>Shared Media</h5>
          <div class="media-grid">
            <img 
              v-for="media in sharedMedia" 
              :key="media.id" 
              :src="media.url" 
              class="media-item"
            />
          </div>
        </div>
      </div>
    </aside>

    <!-- New Message Modal -->
    <div v-if="showNewMessageModal" class="modal-overlay" @click.self="showNewMessageModal = false">
      <div class="modal new-message-modal">
        <div class="modal-header">
          <h3>New Message</h3>
          <button class="close-btn" @click="showNewMessageModal = false">✕</button>
        </div>
        <div class="modal-content">
          <div class="search-wrapper">
            <span class="search-icon">🔍</span>
            <input
              v-model="newMessageSearch"
              type="text"
              placeholder="Search friends..."
              class="search-input"
            />
          </div>
          <div class="friends-list">
            <div
              v-for="friend in searchedFriends"
              :key="friend.id"
              class="friend-item"
              @click="startNewConversation(friend)"
            >
              <img :src="friend.avatar || defaultAvatar" class="avatar" />
              <span class="friend-name">{{ friend.username }}</span>
            </div>
            <div v-if="searchedFriends.length === 0" class="no-results">
              <p>No friends found</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, nextTick, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { useChatStore } from '../stores/chat'
import { useSocialStore } from '../stores/social'
import { socketService } from '../services/socket'

const router = useRouter()
const authStore = useAuthStore()
const chatStore = useChatStore()
const socialStore = useSocialStore()

const defaultAvatar = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="50" fill="%23667eea"/><text x="50" y="65" text-anchor="middle" fill="white" font-size="40">🦙</text></svg>'

const messagesContainer = ref(null)
const searchQuery = ref('')
const newMessage = ref('')
const showChatInfo = ref(false)
const showNewMessageModal = ref(false)
const newMessageSearch = ref('')
const sharedMedia = ref([])
const typingTimeout = ref(null)

const currentUser = computed(() => authStore.currentUser)
const conversations = computed(() => chatStore.conversations)
const activeConversation = computed(() => chatStore.activeConversation)
const messages = computed(() => chatStore.messages)
const isTyping = computed(() => chatStore.typingUsers.includes(activeConversation.value?.user.id))

const filteredConversations = computed(() => {
  if (!searchQuery.value) return conversations.value
  const query = searchQuery.value.toLowerCase()
  return conversations.value.filter(c =>
    c.user.username.toLowerCase().includes(query) ||
    c.lastMessage?.content.toLowerCase().includes(query)
  )
})

const searchedFriends = computed(() => {
  const friends = socialStore.friends
  if (!newMessageSearch.value) return friends
  const query = newMessageSearch.value.toLowerCase()
  return friends.filter(f => f.username.toLowerCase().includes(query))
})

onMounted(() => {
  chatStore.fetchConversations()
  socialStore.fetchFriends()
})

watch(messages, () => {
  nextTick(() => {
    scrollToBottom()
  })
})

function selectConversation(conversation) {
  chatStore.setActiveConversation(conversation)
  chatStore.fetchMessages(conversation.id)
  chatStore.markAsRead(conversation.id)
}

function startNewConversation(friend) {
  const existing = conversations.value.find(c => c.user.id === friend.id)
  if (existing) {
    selectConversation(existing)
  } else {
    chatStore.startConversation(friend)
  }
  showNewMessageModal.value = false
}

function sendMessage() {
  if (!newMessage.value.trim()) return
  
  chatStore.sendMessage(activeConversation.value.id, {
    content: newMessage.value
  })
  
  newMessage.value = ''
  socketService.stopTyping(activeConversation.value.id)
}

function handleTyping() {
  socketService.startTyping(activeConversation.value.id)
  
  clearTimeout(typingTimeout.value)
  typingTimeout.value = setTimeout(() => {
    socketService.stopTyping(activeConversation.value.id)
  }, 2000)
}

function scrollToBottom() {
  if (messagesContainer.value) {
    messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
  }
}

function attachImage() {
  // TODO: Implement image attachment
}

function shareFarm() {
  // TODO: Implement farm sharing
}

function visitFarm() {
  router.push(`/game?visit=${activeConversation.value.user.username}`)
}

function visitUserFarm(userId) {
  // TODO: Get username from userId
  router.push('/game')
}

function visitProfile() {
  router.push(`/profile/${activeConversation.value.user.username}`)
}

function startGame() {
  socketService.challengeToGame(activeConversation.value.user.id)
}

function muteConversation() {
  chatStore.toggleMute(activeConversation.value.id)
}

function formatLastMessage(message) {
  if (!message) return 'No messages yet'
  const content = message.content
  if (content.length > 30) return content.slice(0, 30) + '...'
  return content
}

function formatTime(dateString) {
  if (!dateString) return ''
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now - date
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMins / 60)
  const diffDays = Math.floor(diffHours / 24)

  if (diffMins < 1) return 'now'
  if (diffMins < 60) return `${diffMins}m`
  if (diffHours < 24) return `${diffHours}h`
  if (diffDays < 7) return `${diffDays}d`
  
  return date.toLocaleDateString()
}

function formatMessageTime(dateString) {
  const date = new Date(dateString)
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

function formatDate(dateString) {
  const date = new Date(dateString)
  const today = new Date()
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)

  if (date.toDateString() === today.toDateString()) return 'Today'
  if (date.toDateString() === yesterday.toDateString()) return 'Yesterday'
  
  return date.toLocaleDateString('en-US', { 
    weekday: 'long', 
    month: 'short', 
    day: 'numeric' 
  })
}

function shouldShowDate(current, previous) {
  if (!previous) return true
  const currentDate = new Date(current.createdAt).toDateString()
  const previousDate = new Date(previous.createdAt).toDateString()
  return currentDate !== previousDate
}
</script>

<style scoped>
.messages-page {
  display: flex;
  height: calc(100vh - 60px);
  background: #f0f2f5;
}

/* Conversations Sidebar */
.conversations-sidebar {
  width: 340px;
  background: white;
  border-right: 1px solid #e4e6e9;
  display: flex;
  flex-direction: column;
}

.sidebar-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.25rem 1rem;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.95) 0%, rgba(240, 242, 245, 0.8) 100%);
  backdrop-filter: blur(10px);
}

.sidebar-header h2 {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 700;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.new-message-btn {
  width: 38px;
  height: 38px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  cursor: pointer;
  font-size: 1.1rem;
  color: white;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 4px 8px rgba(102, 126, 234, 0.3);
}

.new-message-btn:hover {
  transform: scale(1.1) rotate(5deg);
  box-shadow: 0 6px 12px rgba(102, 126, 234, 0.4);
}

.new-message-btn:active {
  transform: scale(0.95);
}

.search-wrapper {
  display: flex;
  align-items: center;
  padding: 0.5rem 1rem;
  background: #f0f2f5;
  margin: 0.5rem 1rem;
  border-radius: 20px;
}

.search-icon {
  margin-right: 0.5rem;
}

.search-input {
  flex: 1;
  border: none;
  background: none;
  font-size: 0.9rem;
}

.search-input:focus {
  outline: none;
}

.conversations-list {
  flex: 1;
  overflow-y: auto;
}

.conversation-item {
  display: flex;
  align-items: center;
  padding: 0.875rem 1rem;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  border-radius: 12px;
  margin: 0 0.5rem;
  position: relative;
}

.conversation-item::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 3px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 2px;
  opacity: 0;
  transition: opacity 0.2s;
}

.conversation-item.active::before {
  opacity: 1;
}

.conversation-item:hover {
  background: #f0f2f5;
  transform: translateX(2px);
}

.conversation-item.active {
  background: linear-gradient(90deg, rgba(102, 126, 234, 0.1) 0%, rgba(240, 242, 245, 0.5) 100%);
}

.avatar-wrapper {
  position: relative;
}

.avatar {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  object-fit: cover;
}

.online-dot {
  position: absolute;
  bottom: 2px;
  right: 2px;
  width: 12px;
  height: 12px;
  background: #22c55e;
  border: 2px solid white;
  border-radius: 50%;
}

.conversation-info {
  flex: 1;
  margin-left: 0.75rem;
  min-width: 0;
}

.conversation-name {
  font-weight: 600;
  display: block;
}

.last-message {
  color: #65676b;
  font-size: 0.85rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  display: block;
}

.conversation-meta {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 0.25rem;
}

.message-time {
  color: #65676b;
  font-size: 0.75rem;
}

.unread-badge {
  background: #667eea;
  color: white;
  font-size: 0.7rem;
  padding: 0.125rem 0.5rem;
  border-radius: 10px;
}

/* Chat Area */
.chat-area {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.chat-header {
  display: flex;
  align-items: center;
  padding: 0.75rem 1rem;
  background: white;
  border-bottom: 1px solid #e4e6e9;
}

.chat-user {
  display: flex;
  align-items: center;
  text-decoration: none;
  color: inherit;
  flex: 1;
}

.chat-user .avatar {
  width: 40px;
  height: 40px;
}

.user-info {
  margin-left: 0.75rem;
}

.username {
  font-weight: 600;
  display: block;
}

.user-status {
  color: #65676b;
  font-size: 0.8rem;
}

.chat-actions {
  display: flex;
  gap: 0.5rem;
}

.action-btn {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: #f0f2f5;
  border: none;
  cursor: pointer;
  font-size: 1rem;
}

.action-btn:hover {
  background: #e4e6e9;
}

/* Messages */
.messages-container {
  flex: 1;
  overflow-y: auto;
  padding: 1rem;
}

.date-separator {
  text-align: center;
  margin: 1rem 0;
}

.date-separator span {
  background: #e4e6e9;
  padding: 0.25rem 1rem;
  border-radius: 20px;
  font-size: 0.8rem;
  color: #65676b;
}

.message {
  margin-bottom: 0.5rem;
}

.message-content {
  display: flex;
  align-items: flex-end;
  gap: 0.5rem;
}

.message.own .message-content {
  flex-direction: row-reverse;
}

.message-avatar {
  width: 28px;
  height: 28px;
  border-radius: 50%;
}

.message-bubble {
  max-width: 60%;
  background: #f0f2f5;
  padding: 0.75rem 1rem;
  border-radius: 18px;
}

.message.own .message-bubble {
  background: #667eea;
  color: white;
}

.message-text {
  margin: 0;
  word-wrap: break-word;
}

.message-time {
  display: block;
  font-size: 0.7rem;
  opacity: 0.7;
  margin-top: 0.25rem;
  text-align: right;
}

.shared-farm {
  background: rgba(0, 0, 0, 0.1);
  border-radius: 12px;
  padding: 0.75rem;
  margin-top: 0.5rem;
}

.farm-preview {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.farm-icon {
  font-size: 2rem;
}

.farm-title {
  font-weight: 600;
  display: block;
}

.farm-stats {
  font-size: 0.8rem;
  opacity: 0.9;
}

.visit-btn {
  width: 100%;
  padding: 0.5rem;
  background: rgba(255, 255, 255, 0.2);
  border: none;
  border-radius: 8px;
  color: inherit;
  cursor: pointer;
  margin-top: 0.5rem;
}

.message-image {
  max-width: 100%;
  border-radius: 12px;
  margin-top: 0.5rem;
}

/* Typing Indicator */
.typing-indicator {
  display: flex;
  align-items: flex-end;
  gap: 0.5rem;
}

.typing-bubble {
  background: #f0f2f5;
  padding: 0.75rem 1rem;
  border-radius: 18px;
  display: flex;
  gap: 0.25rem;
}

.typing-bubble .dot {
  width: 8px;
  height: 8px;
  background: #65676b;
  border-radius: 50%;
  animation: typing 1.4s infinite;
}

.typing-bubble .dot:nth-child(2) {
  animation-delay: 0.2s;
}

.typing-bubble .dot:nth-child(3) {
  animation-delay: 0.4s;
}

@keyframes typing {
  0%, 100% { opacity: 0.4; }
  50% { opacity: 1; }
}

/* Message Input */
.message-input-area {
  display: flex;
  align-items: flex-end;
  padding: 0.75rem 1rem;
  background: white;
  border-top: 1px solid #e4e6e9;
  gap: 0.5rem;
}

.input-actions {
  display: flex;
  gap: 0.25rem;
}

.input-action-btn {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: none;
  border: none;
  cursor: pointer;
  font-size: 1.1rem;
}

.input-action-btn:hover {
  background: #f0f2f5;
}

.input-wrapper {
  flex: 1;
  background: #f0f2f5;
  border-radius: 20px;
  padding: 0.5rem 1rem;
}

.message-input {
  width: 100%;
  border: none;
  background: none;
  resize: none;
  font-size: 0.95rem;
  max-height: 100px;
}

.message-input:focus {
  outline: none;
}

.send-btn {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: #667eea;
  color: white;
  border: none;
  cursor: pointer;
  font-size: 1rem;
}

.send-btn:disabled {
  background: #ccc;
  cursor: not-allowed;
}

/* No Conversation */
.no-conversation {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}

.empty-chat {
  text-align: center;
  color: #65676b;
}

.empty-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
}

.empty-chat h3 {
  margin: 0 0 0.5rem;
  color: #333;
}

.empty-chat p {
  margin: 0 0 1rem;
}

.empty-conversations {
  text-align: center;
  padding: 2rem;
  color: #65676b;
}

/* Chat Info Sidebar */
.chat-info-sidebar {
  width: 280px;
  background: white;
  border-left: 1px solid #e4e6e9;
}

.info-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  border-bottom: 1px solid #e4e6e9;
}

.info-header h3 {
  margin: 0;
}

.close-btn {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: #f0f2f5;
  border: none;
  cursor: pointer;
}

.info-content {
  padding: 1rem;
}

.info-user {
  text-align: center;
  margin-bottom: 1.5rem;
}

.info-avatar {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  margin-bottom: 0.5rem;
}

.info-user h4 {
  margin: 0;
}

.info-actions {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.info-actions button {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  width: 100%;
  padding: 0.75rem;
  background: #f0f2f5;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  text-align: left;
}

.info-actions button:hover {
  background: #e4e6e9;
}

.info-actions .icon {
  font-size: 1.25rem;
}

.shared-media h5 {
  margin: 1.5rem 0 0.75rem;
}

.media-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.25rem;
}

.media-item {
  width: 100%;
  aspect-ratio: 1;
  object-fit: cover;
  border-radius: 4px;
}

/* Modal */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
}

.modal {
  background: white;
  border-radius: 12px;
  width: 90%;
  max-width: 500px;
  max-height: 80vh;
  overflow: hidden;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  border-bottom: 1px solid #e4e6e9;
}

.modal-header h3 {
  margin: 0;
}

.modal-content {
  padding: 1rem;
  overflow-y: auto;
  max-height: 60vh;
}

.friends-list {
  margin-top: 1rem;
}

.friend-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem;
  border-radius: 8px;
  cursor: pointer;
}

.friend-item:hover {
  background: #f0f2f5;
}

.friend-item .avatar {
  width: 40px;
  height: 40px;
}

.friend-name {
  font-weight: 600;
}

.no-results {
  text-align: center;
  padding: 2rem;
  color: #65676b;
}

/* Buttons */
.btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
}

.btn-primary {
  background: #667eea;
  color: white;
}

.btn-primary:hover {
  background: #5a6fd6;
}

/* Responsive */
@media (max-width: 768px) {
  .conversations-sidebar {
    display: none;
  }

  .chat-info-sidebar {
    display: none;
  }
}
</style>
