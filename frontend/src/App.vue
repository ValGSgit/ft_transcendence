<template>
  <div id="app" :class="{ 'game-mode': isGameRoute }">
    <!-- Navigation Bar (hidden in game mode) -->
    <nav class="navbar">
      <div class="nav-container">
        <!-- Logo -->
        <router-link to="/" class="nav-logo">
          <span class="logo-icon">🦙</span>
          <span class="logo-text">Alpacagram</span>
        </router-link>

        <!-- Search Bar -->
        <div class="nav-search" v-if="isAuthenticated">
          <span class="search-icon">🔍</span>
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Search Alpacagram"
            @focus="showSearchResults = true"
            @blur="hideSearchResults"
          />
          <div v-if="showSearchResults && searchQuery" class="search-results">
            <div v-if="searchLoading" class="search-loading">Searching...</div>
            <div v-else-if="searchResults.length === 0" class="search-empty">No results</div>
            <router-link
              v-else
              v-for="result in searchResults"
              :key="result.id"
              :to="`/profile/${result.username}`"
              class="search-result"
            >
              <img :src="result.avatar || defaultAvatar" class="result-avatar" />
              <span class="result-name">{{ result.username }}</span>
            </router-link>
          </div>
        </div>

        <!-- Navigation Links -->
        <div class="nav-links" v-if="isAuthenticated">
          <router-link to="/" class="nav-link" title="Home">🏠</router-link>
          <router-link to="/feed" class="nav-link" title="Feed">📰</router-link>
          <router-link to="/friends" class="nav-link" title="Friends">👥</router-link>
          <router-link to="/messages" class="nav-link" title="Messages">
            💬
            <span v-if="unreadMessages" class="badge">{{ unreadMessages }}</span>
          </router-link>
          <router-link to="/game" class="nav-link game-link" title="Play Game">🎮</router-link>
          <button class="nav-link theme-toggle" @click="toggleTheme" :title="isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'">
            {{ isDarkMode ? '☀️' : '🌙' }}
          </button>
        </div>

        <!-- User Menu -->
        <div class="nav-user" v-if="isAuthenticated">
          <!-- Notifications -->
          <div class="notification-wrapper">
            <button class="nav-btn" @click="showNotifications = !showNotifications">
              🔔
              <span v-if="unreadNotifications" class="badge">{{ unreadNotifications }}</span>
            </button>
            <div v-if="showNotifications" class="notification-dropdown">
              <div class="dropdown-header">
                <h4>Notifications</h4>
                <button @click="markAllRead">Mark all read</button>
              </div>
              <div class="notification-list">
                <div
                  v-for="notification in notifications"
                  :key="notification.id"
                  :class="['notification-item', { unread: !notification.read }]"
                  @click="handleNotification(notification)"
                >
                  <img :src="notification.actor?.avatar || defaultAvatar" class="notification-avatar" />
                  <div class="notification-content">
                    <p>{{ notification.message }}</p>
                    <span class="notification-time">{{ formatTime(notification.createdAt) }}</span>
                  </div>
                </div>
                <div v-if="notifications.length === 0" class="notification-empty">
                  No notifications yet
                </div>
              </div>
            </div>
          </div>

          <!-- Profile Dropdown -->
          <div class="profile-wrapper">
            <button class="profile-btn" @click="showProfileMenu = !showProfileMenu">
              <img :src="currentUser?.avatar || defaultAvatar" class="profile-avatar" />
              <span class="profile-name">{{ currentUser?.username }}</span>
              <span class="dropdown-arrow">▼</span>
            </button>
            <div v-if="showProfileMenu" class="profile-dropdown">
              <router-link :to="`/profile/${currentUser?.username}`" class="dropdown-item">
                <span class="item-icon">👤</span>
                View Profile
              </router-link>
              <router-link to="/settings" class="dropdown-item">
                <span class="item-icon">⚙️</span>
                Settings
              </router-link>
              <button class="dropdown-item" @click="toggleTheme">
                <span class="item-icon">{{ isDarkMode ? '☀️' : '🌙' }}</span>
                {{ isDarkMode ? 'Light Mode' : 'Dark Mode' }}
              </button>
              <div class="dropdown-divider"></div>
              <button class="dropdown-item" @click="logout">
                <span class="item-icon">🚪</span>
                Log Out
              </button>
            </div>
          </div>
        </div>

        <!-- Auth Links (when not logged in) -->
        <div class="nav-auth" v-else>
          <button class="theme-toggle-btn" @click="toggleTheme" :title="isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'">
            {{ isDarkMode ? '☀️' : '🌙' }}
          </button>
          <router-link to="/login" class="btn btn-secondary">Log In</router-link>
          <router-link to="/register" class="btn btn-primary">Sign Up</router-link>
        </div>
      </div>
    </nav>

    <!-- Main Content -->
    <main :class="{ 'has-navbar': !isGameRoute }">
      <router-view v-slot="{ Component }">
        <transition name="fade" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </main>

    <!-- Chat Widget (floating) -->
    <div v-if="isAuthenticated && !isGameRoute && activeChatUser" class="chat-widget">
      <div class="chat-header" @click="chatMinimized = !chatMinimized">
        <img :src="activeChatUser.avatar || defaultAvatar" class="chat-avatar" />
        <span class="chat-name">{{ activeChatUser.username }}</span>
        <span class="chat-status" :class="{ online: activeChatUser.isOnline }"></span>
        <div class="chat-controls">
          <button @click.stop="chatMinimized = !chatMinimized">
            {{ chatMinimized ? '▲' : '▼' }}
          </button>
          <button @click.stop="closeChat">✕</button>
        </div>
      </div>
      <div v-if="!chatMinimized" class="chat-body">
        <div class="chat-messages" ref="chatMessages">
          <div
            v-for="msg in chatMessages"
            :key="msg.id"
            :class="['chat-message', { own: msg.senderId === currentUser?.id }]"
          >
            {{ msg.content }}
          </div>
        </div>
        <div class="chat-input">
          <input
            v-model="newChatMessage"
            @keyup.enter="sendChatMessage"
            placeholder="Type a message..."
          />
          <button @click="sendChatMessage">➤</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from './stores/auth'
import { useSocialStore } from './stores/social'
import { useChatStore } from './stores/chat'
import { useThemeStore } from './stores/theme'
import { socketService } from './services/socket'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const socialStore = useSocialStore()
const chatStore = useChatStore()
const themeStore = useThemeStore()

const defaultAvatar = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="50" fill="%23667eea"/><text x="50" y="65" text-anchor="middle" fill="white" font-size="40">🦙</text></svg>'

// Reactive state
const searchQuery = ref('')
const searchResults = ref([])
const searchLoading = ref(false)
const showSearchResults = ref(false)
const showNotifications = ref(false)
const showProfileMenu = ref(false)
const chatMinimized = ref(false)
const newChatMessage = ref('')

// Computed
const isAuthenticated = computed(() => authStore.isAuthenticated)
const currentUser = computed(() => authStore.currentUser)
const isGameRoute = computed(() => route.path === '/game')
const notifications = computed(() => socialStore.notifications)
const unreadNotifications = computed(() => notifications.value.filter(n => !n.read).length)
const unreadMessages = computed(() => chatStore.totalUnread)
const activeChatUser = computed(() => chatStore.activeConversation?.user)
const chatMessages = computed(() => chatStore.messages)
const isDarkMode = computed(() => themeStore.isDarkMode)

function toggleTheme() {
  themeStore.toggleTheme()
}

// Watchers
let searchTimeout = null
watch(searchQuery, (val) => {
  if (searchTimeout) clearTimeout(searchTimeout)
  if (!val) {
    searchResults.value = []
    return
  }
  searchLoading.value = true
  searchTimeout = setTimeout(async () => {
    try {
      const res = await fetch(`/api/users/search?q=${encodeURIComponent(val)}`)
      searchResults.value = await res.json()
    } catch (e) {
      searchResults.value = []
    } finally {
      searchLoading.value = false
    }
  }, 300)
})

// Methods
function hideSearchResults() {
  setTimeout(() => {
    showSearchResults.value = false
  }, 200)
}

function markAllRead() {
  socialStore.markAllNotificationsRead()
}

function handleNotification(notification) {
  socialStore.markNotificationRead(notification.id)
  showNotifications.value = false
  
  // Navigate based on notification type
  if (notification.type === 'friend_request') {
    router.push('/friends')
  } else if (notification.type === 'message') {
    router.push('/messages')
  } else if (notification.postId) {
    router.push(`/feed#post-${notification.postId}`)
  }
}

function logout() {
  showProfileMenu.value = false
  authStore.logout()
  router.push('/')
}

function closeChat() {
  chatStore.closeActiveConversation()
}

function sendChatMessage() {
  if (!newChatMessage.value.trim()) return
  chatStore.sendMessage(chatStore.activeConversation.id, {
    content: newChatMessage.value
  })
  newChatMessage.value = ''
}

function formatTime(dateString) {
  const date = new Date(dateString)
  const now = new Date()
  const diff = Math.floor((now - date) / 1000)
  
  if (diff < 60) return 'Just now'
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
  return `${Math.floor(diff / 86400)}d ago`
}

// Click outside handlers
function handleClickOutside(e) {
  if (showNotifications.value && !e.target.closest('.notification-wrapper')) {
    showNotifications.value = false
  }
  if (showProfileMenu.value && !e.target.closest('.profile-wrapper')) {
    showProfileMenu.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
  
  // Initialize socket if authenticated
  if (isAuthenticated.value) {
    socketService.connect(authStore.token)
    socialStore.fetchNotifications()
    chatStore.fetchConversations()
  }
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})

// Watch auth changes
watch(isAuthenticated, (val) => {
  if (val) {
    socketService.connect(authStore.token)
    socialStore.fetchNotifications()
  } else {
    socketService.disconnect()
  }
})
</script>

<style>
/* Global Styles */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
  background: #f0f2f5;
  color: #1c1e21;
  line-height: 1.5;
}

a {
  text-decoration: none;
  color: inherit;
}

button {
  font-family: inherit;
}

#app {
  min-height: 100vh;
}

#app.game-mode {
  overflow: hidden;
}

/* Navbar */
.navbar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 60px;
  background: var(--bg-secondary);
  box-shadow: var(--shadow);
  z-index: 1000;
  border-bottom: 1px solid var(--border-color);
}

.nav-container {
  max-width: 1200px;
  margin: 0 auto;
  height: 100%;
  display: flex;
  align-items: center;
  padding: 0 1rem;
  gap: 1rem;
}

.nav-logo {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: bold;
  font-size: 1.25rem;
  color: var(--primary);
}

.logo-icon {
  font-size: 1.75rem;
}

/* Search */
.nav-search {
  position: relative;
  flex: 1;
  max-width: 400px;
}

.nav-search input {
  width: 100%;
  padding: 0.5rem 1rem 0.5rem 2.5rem;
  border: none;
  background: var(--bg-tertiary);
  border-radius: 20px;
  font-size: 0.95rem;
  color: var(--text-primary);
}

.nav-search input:focus {
  outline: none;
  background: var(--bg-input);
}

.nav-search input::placeholder {
  color: var(--text-tertiary);
}

.nav-search .search-icon {
  position: absolute;
  left: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  font-size: 0.9rem;
}

.search-results {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: var(--bg-card);
  border-radius: 8px;
  box-shadow: var(--shadow-lg);
  border: 1px solid var(--border-color);
  margin-top: 0.5rem;
  max-height: 300px;
  overflow-y: auto;
}

.search-result {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  cursor: pointer;
  color: var(--text-primary);
}

.search-result:hover {
  background: var(--bg-hover);
}

.result-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
}

.search-loading,
.search-empty {
  padding: 1rem;
  text-align: center;
  color: var(--text-tertiary);
}

/* Nav Links */
.nav-links {
  display: flex;
  gap: 0.5rem;
}

.nav-link {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  border-radius: 50%;
  font-size: 1.25rem;
  position: relative;
  transition: background 0.2s;
  background: transparent;
  border: none;
  cursor: pointer;
  color: var(--text-primary);
}

.nav-link:hover {
  background: var(--bg-hover);
}

.nav-link.router-link-active {
  color: var(--primary);
}

.theme-toggle {
  font-size: 1.2rem;
}

.theme-toggle-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  font-size: 1.2rem;
  background: var(--bg-tertiary);
  border: 1px solid var(--border-color);
  cursor: pointer;
  transition: all 0.2s;
}

.theme-toggle-btn:hover {
  background: var(--bg-hover);
  transform: rotate(15deg);
}

.game-link {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white !important;
}

.game-link:hover {
  opacity: 0.9;
}

.badge {
  position: absolute;
  top: -2px;
  right: -2px;
  background: #e74c3c;
  color: white;
  font-size: 0.7rem;
  padding: 0.125rem 0.375rem;
  border-radius: 10px;
  min-width: 18px;
  text-align: center;
}

/* User Menu */
.nav-user {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.nav-btn {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  border: none;
  background: var(--bg-tertiary);
  cursor: pointer;
  font-size: 1.1rem;
  position: relative;
}

.nav-btn:hover {
  background: var(--bg-hover);
}

/* Profile Button */
.profile-wrapper,
.notification-wrapper {
  position: relative;
}

.profile-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.25rem 0.5rem 0.25rem 0.25rem;
  border: none;
  background: var(--bg-tertiary);
  border-radius: 20px;
  cursor: pointer;
  color: var(--text-primary);
}

.profile-btn:hover {
  background: var(--bg-hover);
}

.profile-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
}

.profile-name {
  font-weight: 600;
  font-size: 0.9rem;
}

.dropdown-arrow {
  font-size: 0.6rem;
  color: var(--text-tertiary);
}

/* Dropdowns */
.profile-dropdown,
.notification-dropdown {
  position: absolute;
  top: 100%;
  right: 0;
  background: var(--bg-card);
  border-radius: 12px;
  box-shadow: var(--shadow-lg);
  border: 1px solid var(--border-color);
  margin-top: 0.5rem;
  min-width: 250px;
  overflow: hidden;
  z-index: 100;
}

.notification-dropdown {
  width: 360px;
}

.dropdown-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  border-bottom: 1px solid var(--border-color);
}

.dropdown-header h4 {
  margin: 0;
  color: var(--text-primary);
}

.dropdown-header button {
  background: none;
  border: none;
  color: var(--primary);
  cursor: pointer;
  font-size: 0.85rem;
}

.notification-list {
  max-height: 400px;
  overflow-y: auto;
}

.notification-item {
  display: flex;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  cursor: pointer;
}

.notification-item:hover {
  background: var(--bg-hover);
}

.notification-item.unread {
  background: rgba(0, 240, 255, 0.1);
}

.notification-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
}

.notification-content p {
  margin: 0;
  font-size: 0.9rem;
  color: var(--text-primary);
}

.notification-time {
  font-size: 0.8rem;
  color: var(--text-tertiary);
}

.notification-empty {
  padding: 2rem;
  text-align: center;
  color: var(--text-tertiary);
}

.dropdown-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  width: 100%;
  border: none;
  background: none;
  cursor: pointer;
  text-align: left;
  font-size: 0.95rem;
  color: var(--text-primary);
}

.dropdown-item:hover {
  background: var(--bg-hover);
}

.item-icon {
  font-size: 1.1rem;
}

.dropdown-divider {
  height: 1px;
  background: var(--border-color);
  margin: 0.5rem 0;
}

/* Auth Links */
.nav-auth {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

.btn {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  font-size: 0.9rem;
  transition: all 0.2s;
}

.btn-primary {
  background: var(--primary);
  color: var(--bg-primary);
}

.btn-primary:hover {
  filter: brightness(1.1);
}

.btn-secondary {
  background: var(--bg-tertiary);
  color: var(--text-primary);
  border: 1px solid var(--border-color);
}

.btn-secondary:hover {
  background: var(--bg-hover);
}

/* Main Content */
main {
  min-height: 100vh;
}

main.has-navbar {
  padding-top: 60px;
}

/* Chat Widget */
.chat-widget {
  position: fixed;
  bottom: 0;
  right: 1rem;
  width: 328px;
  background: var(--bg-card);
  border-radius: 12px 12px 0 0;
  box-shadow: var(--shadow-lg);
  border: 1px solid var(--border-color);
  border-bottom: none;
  z-index: 1000;
}

.chat-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.75rem;
  background: var(--primary);
  color: var(--bg-primary);
  border-radius: 12px 12px 0 0;
  cursor: pointer;
}

.chat-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
}

.chat-name {
  flex: 1;
  font-weight: 600;
}

.chat-status {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #ccc;
}

.chat-status.online {
  background: #22c55e;
}

.chat-controls {
  display: flex;
  gap: 0.25rem;
}

.chat-controls button {
  background: none;
  border: none;
  color: white;
  cursor: pointer;
  padding: 0.25rem 0.5rem;
}

.chat-body {
  height: 350px;
  display: flex;
  flex-direction: column;
}

.chat-messages {
  flex: 1;
  overflow-y: auto;
  padding: 0.75rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.chat-message {
  max-width: 80%;
  padding: 0.5rem 0.75rem;
  border-radius: 18px;
  background: var(--bg-tertiary);
  color: var(--text-primary);
  align-self: flex-start;
}

.chat-message.own {
  background: var(--primary);
  color: var(--bg-primary);
  align-self: flex-end;
}

.chat-input {
  display: flex;
  padding: 0.5rem;
  border-top: 1px solid var(--border-color);
}

.chat-input input {
  flex: 1;
  padding: 0.5rem 1rem;
  border: none;
  background: var(--bg-tertiary);
  border-radius: 20px;
  font-size: 0.9rem;
  color: var(--text-primary);
}

.chat-input input:focus {
  outline: none;
  background: var(--bg-input);
}

.chat-input input::placeholder {
  color: var(--text-tertiary);
}

.chat-input button {
  width: 36px;
  height: 36px;
  border: none;
  background: var(--primary);
  color: var(--bg-primary);
  border-radius: 50%;
  margin-left: 0.5rem;
  cursor: pointer;
}

/* Transitions */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* Responsive */
@media (max-width: 768px) {
  .nav-search {
    display: none;
  }

  .profile-name {
    display: none;
  }

  .logo-text {
    display: none;
  }

  .chat-widget {
    width: 100%;
    right: 0;
    border-radius: 0;
  }

  .notification-dropdown {
    width: 100vw;
    right: -1rem;
    border-radius: 0;
  }
}
</style>