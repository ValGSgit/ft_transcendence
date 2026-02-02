<template>
  <div class="friends-page">
    <!-- Header -->
    <header class="page-header">
      <h1>Friends</h1>
    </header>

    <!-- Tabs -->
    <div class="friends-tabs">
      <button 
        :class="['tab', { active: activeTab === 'all' }]"
        @click="activeTab = 'all'"
      >
        All Friends
        <span class="badge" v-if="friends.length">{{ friends.length }}</span>
      </button>
      <button 
        :class="['tab', { active: activeTab === 'requests' }]"
        @click="activeTab = 'requests'"
      >
        Friend Requests
        <span class="badge highlight" v-if="friendRequests.length">{{ friendRequests.length }}</span>
      </button>
      <button 
        :class="['tab', { active: activeTab === 'suggestions' }]"
        @click="activeTab = 'suggestions'"
      >
        Suggestions
      </button>
      <button 
        :class="['tab', { active: activeTab === 'online' }]"
        @click="activeTab = 'online'"
      >
        Online
        <span class="badge online" v-if="onlineFriends.length">{{ onlineFriends.length }}</span>
      </button>
    </div>

    <!-- Search -->
    <div class="search-section">
      <div class="search-input-wrapper">
        <span class="search-icon">🔍</span>
        <input
          v-model="searchQuery"
          type="text"
          :placeholder="searchPlaceholder"
          class="search-input"
        />
      </div>
    </div>

    <!-- Content -->
    <div class="friends-content">
      <!-- All Friends -->
      <section v-if="activeTab === 'all'" class="friends-section">
        <div class="friends-grid" v-if="filteredFriends.length">
          <div v-for="friend in filteredFriends" :key="friend.id" class="friend-card card">
            <router-link :to="`/profile/${friend.username}`" class="friend-avatar-link">
              <img :src="friend.avatar || defaultAvatar" class="friend-avatar" />
              <span v-if="friend.isOnline" class="online-indicator"></span>
            </router-link>
            <div class="friend-info">
              <router-link :to="`/profile/${friend.username}`" class="friend-name">
                {{ friend.username }}
              </router-link>
              <span class="mutual-friends" v-if="friend.mutualFriends">
                {{ friend.mutualFriends }} mutual friends
              </span>
            </div>
            <div class="friend-actions">
              <button class="action-btn" @click="messageUser(friend)" title="Message">
                💬
              </button>
              <button class="action-btn" @click="visitFarm(friend)" title="Visit Farm">
                🦙
              </button>
              <div class="dropdown-wrapper">
                <button class="action-btn" @click="toggleMenu(friend.id)">⋯</button>
                <div v-if="openMenuId === friend.id" class="dropdown-menu">
                  <button @click="unfriend(friend)">👋 Unfriend</button>
                  <button @click="blockUser(friend)">🚫 Block</button>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div v-else class="empty-state">
          <div class="empty-icon">👥</div>
          <h3>{{ searchQuery ? 'No friends found' : 'No friends yet' }}</h3>
          <p>{{ searchQuery ? 'Try a different search' : 'Connect with other alpaca farmers!' }}</p>
          <button v-if="!searchQuery" class="btn btn-primary" @click="activeTab = 'suggestions'">
            Find Friends
          </button>
        </div>
      </section>

      <!-- Friend Requests -->
      <section v-if="activeTab === 'requests'" class="requests-section">
        <!-- Received Requests -->
        <div class="requests-group">
          <h3>Received Requests</h3>
          <div v-if="filteredRequests.length" class="requests-list">
            <div v-for="request in filteredRequests" :key="request.id" class="request-card card">
              <router-link :to="`/profile/${request.username}`" class="request-avatar-link">
                <img :src="request.avatar || defaultAvatar" class="request-avatar" />
              </router-link>
              <div class="request-info">
                <router-link :to="`/profile/${request.username}`" class="request-name">
                  {{ request.username }}
                </router-link>
                <span class="mutual-friends" v-if="request.mutualFriends">
                  {{ request.mutualFriends }} mutual friends
                </span>
                <span class="request-time">{{ formatTime(request.createdAt) }}</span>
              </div>
              <div class="request-actions">
                <button 
                  class="btn btn-primary"
                  @click="acceptRequest(request)"
                  :disabled="processingId === request.id"
                >
                  {{ processingId === request.id ? '...' : 'Confirm' }}
                </button>
                <button 
                  class="btn btn-secondary"
                  @click="declineRequest(request)"
                  :disabled="processingId === request.id"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
          <div v-else class="empty-state-small">
            <p>No pending friend requests</p>
          </div>
        </div>

        <!-- Sent Requests -->
        <div class="requests-group">
          <h3>Sent Requests</h3>
          <div v-if="sentRequests.length" class="requests-list">
            <div v-for="request in sentRequests" :key="request.id" class="request-card card">
              <router-link :to="`/profile/${request.username}`" class="request-avatar-link">
                <img :src="request.avatar || defaultAvatar" class="request-avatar" />
              </router-link>
              <div class="request-info">
                <router-link :to="`/profile/${request.username}`" class="request-name">
                  {{ request.username }}
                </router-link>
                <span class="request-time">Sent {{ formatTime(request.createdAt) }}</span>
              </div>
              <div class="request-actions">
                <button 
                  class="btn btn-secondary"
                  @click="cancelRequest(request)"
                  :disabled="processingId === request.id"
                >
                  Cancel Request
                </button>
              </div>
            </div>
          </div>
          <div v-else class="empty-state-small">
            <p>No sent requests</p>
          </div>
        </div>
      </section>

      <!-- Suggestions -->
      <section v-if="activeTab === 'suggestions'" class="suggestions-section">
        <h3>People You May Know</h3>
        <div v-if="suggestions.length" class="suggestions-grid">
          <div v-for="user in suggestions" :key="user.id" class="suggestion-card card">
            <router-link :to="`/profile/${user.username}`">
              <img :src="user.avatar || defaultAvatar" class="suggestion-avatar" />
            </router-link>
            <router-link :to="`/profile/${user.username}`" class="suggestion-name">
              {{ user.username }}
            </router-link>
            <span class="suggestion-reason" v-if="user.mutualFriends">
              {{ user.mutualFriends }} mutual friends
            </span>
            <span class="suggestion-reason" v-else-if="user.reason">
              {{ user.reason }}
            </span>
            <div class="suggestion-actions">
              <button 
                class="btn btn-primary btn-full"
                @click="sendRequest(user)"
                :disabled="user.requestSent"
              >
                {{ user.requestSent ? 'Request Sent' : 'Add Friend' }}
              </button>
              <button class="btn btn-secondary btn-full" @click="dismissSuggestion(user)">
                Remove
              </button>
            </div>
          </div>
        </div>
        <div v-else class="empty-state">
          <div class="empty-icon">🔍</div>
          <h3>No suggestions</h3>
          <p>We'll show you friend suggestions here</p>
        </div>
      </section>

      <!-- Online Friends -->
      <section v-if="activeTab === 'online'" class="online-section">
        <div v-if="onlineFriends.length" class="friends-grid">
          <div v-for="friend in onlineFriends" :key="friend.id" class="friend-card card">
            <router-link :to="`/profile/${friend.username}`" class="friend-avatar-link">
              <img :src="friend.avatar || defaultAvatar" class="friend-avatar" />
              <span class="online-indicator"></span>
            </router-link>
            <div class="friend-info">
              <router-link :to="`/profile/${friend.username}`" class="friend-name">
                {{ friend.username }}
              </router-link>
              <span class="status-text">{{ friend.status || 'Online' }}</span>
            </div>
            <div class="friend-actions">
              <button class="btn btn-primary" @click="messageUser(friend)">
                💬 Message
              </button>
              <button class="btn btn-secondary" @click="visitFarm(friend)">
                🦙 Visit Farm
              </button>
            </div>
          </div>
        </div>
        <div v-else class="empty-state">
          <div class="empty-icon">😴</div>
          <h3>No friends online</h3>
          <p>When your friends come online, they'll appear here</p>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useSocialStore } from '../stores/social'
import { useChatStore } from '../stores/chat'
import api from '../services/api'

const router = useRouter()
const socialStore = useSocialStore()
const chatStore = useChatStore()

const defaultAvatar = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="50" fill="%23667eea"/><text x="50" y="65" text-anchor="middle" fill="white" font-size="40">🦙</text></svg>'

const activeTab = ref('all')
const searchQuery = ref('')
const openMenuId = ref(null)
const processingId = ref(null)
const suggestions = ref([])
const sentRequests = ref([])

const friends = computed(() => socialStore.friends || [])
const friendRequests = computed(() => socialStore.friendRequests || [])
const onlineFriends = computed(() => (friends.value || []).filter(f => f.isOnline))

const filteredFriends = computed(() => {
  const list = friends.value || []
  if (!searchQuery.value) return list
  const query = searchQuery.value.toLowerCase()
  return list.filter(f => 
    f.username?.toLowerCase().includes(query)
  )
})

const filteredRequests = computed(() => {
  const list = friendRequests.value || []
  if (!searchQuery.value) return list
  const query = searchQuery.value.toLowerCase()
  return list.filter(r => 
    r.username?.toLowerCase().includes(query)
  )
})

const searchPlaceholder = computed(() => {
  switch (activeTab.value) {
    case 'all': return 'Search friends...'
    case 'requests': return 'Search requests...'
    case 'suggestions': return 'Search people...'
    case 'online': return 'Search online friends...'
    default: return 'Search...'
  }
})

onMounted(() => {
  loadData()
})

async function loadData() {
  try {
    await socialStore.fetchFriends()
    await socialStore.fetchFriendRequests()
    
    // Load suggestions (endpoint may not exist yet - graceful fallback)
    try {
      const suggestionsRes = await api.get('/friends/suggestions')
      suggestions.value = suggestionsRes.data?.suggestions || suggestionsRes.data || []
    } catch (e) {
      // Endpoint not implemented - use empty array
      suggestions.value = []
    }
    
    // Load sent requests (endpoint may not exist yet - graceful fallback)
    try {
      const sentRes = await api.get('/friends/requests/sent')
      sentRequests.value = sentRes.data?.requests || sentRes.data || []
    } catch (e) {
      // Endpoint not implemented - use empty array
      sentRequests.value = []
    }
  } catch (error) {
    console.error('Failed to load friends data:', error)
  }
}

function toggleMenu(friendId) {
  openMenuId.value = openMenuId.value === friendId ? null : friendId
}

async function acceptRequest(request) {
  processingId.value = request.id
  try {
    await socialStore.acceptFriendRequest(request.id)
  } catch (error) {
    console.error('Failed to accept request:', error)
  } finally {
    processingId.value = null
  }
}

async function declineRequest(request) {
  processingId.value = request.id
  try {
    await socialStore.declineFriendRequest(request.id)
  } catch (error) {
    console.error('Failed to decline request:', error)
  } finally {
    processingId.value = null
  }
}

async function cancelRequest(request) {
  processingId.value = request.id
  try {
    await api.delete(`/friends/requests/${request.id}`)
    sentRequests.value = sentRequests.value.filter(r => r.id !== request.id)
  } catch (error) {
    console.error('Failed to cancel request:', error)
  } finally {
    processingId.value = null
  }
}

async function sendRequest(user) {
  try {
    await socialStore.sendFriendRequest(user.id)
    user.requestSent = true
  } catch (error) {
    console.error('Failed to send request:', error)
  }
}

function dismissSuggestion(user) {
  suggestions.value = suggestions.value.filter(s => s.id !== user.id)
}

async function unfriend(friend) {
  openMenuId.value = null
  if (confirm(`Remove ${friend.username} as a friend?`)) {
    try {
      await socialStore.removeFriend(friend.id)
    } catch (error) {
      console.error('Failed to unfriend:', error)
    }
  }
}

async function blockUser(friend) {
  openMenuId.value = null
  if (confirm(`Block ${friend.username}? They won't be able to see your profile or contact you.`)) {
    try {
      await api.post(`/users/${friend.id}/block`)
      await socialStore.removeFriend(friend.id)
    } catch (error) {
      console.error('Failed to block user:', error)
    }
  }
}

function messageUser(friend) {
  chatStore.startConversation(friend)
  router.push('/messages')
}

function visitFarm(friend) {
  router.push(`/game?visit=${friend.username}`)
}

function formatTime(dateString) {
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now - date
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
  
  if (diffDays < 1) return 'Today'
  if (diffDays === 1) return 'Yesterday'
  if (diffDays < 7) return `${diffDays} days ago`
  
  return date.toLocaleDateString()
}
</script>

<style scoped>
.friends-page {
  max-width: 1000px;
  margin: 0 auto;
  padding: 1rem;
}

.page-header {
  margin-bottom: 1.5rem;
}

.page-header h1 {
  margin: 0;
  font-size: 1.75rem;
  color: var(--text-primary);
}

/* Tabs */
.friends-tabs {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1rem;
  flex-wrap: wrap;
}

.tab {
  padding: 0.875rem 1.5rem;
  background: var(--bg-card);
  border: 2px solid transparent;
  border-radius: 24px;
  cursor: pointer;
  font-weight: 600;
  color: var(--text-secondary);
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: var(--shadow);
}

.tab:hover {
  background: var(--bg-hover);
  border-color: var(--border-color);
  transform: translateY(-2px);
  box-shadow: var(--shadow);
}

.tab.active {
  background: var(--primary);
  color: white;
  border-color: transparent;
  box-shadow: var(--shadow-lg);
  transform: translateY(-2px);
}

.badge {
  background: var(--bg-tertiary);
  padding: 0.125rem 0.5rem;
  border-radius: 10px;
  font-size: 0.8rem;
}

.tab.active .badge {
  background: rgba(255, 255, 255, 0.2);
}

.badge.highlight {
  background: #e74c3c;
  color: white;
}

.badge.online {
  background: #22c55e;
  color: white;
}

/* Search */
.search-section {
  margin-bottom: 1.5rem;
}

.search-input-wrapper {
  display: flex;
  align-items: center;
  background: var(--bg-card);
  border-radius: 24px;
  padding: 0.75rem 1.25rem;
  box-shadow: var(--shadow);
  border: 2px solid transparent;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.search-input-wrapper:focus-within {
  border-color: var(--primary);
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1), var(--shadow);
}

.search-icon {
  margin-right: 0.5rem;
  color: var(--text-secondary);
}

.search-input {
  flex: 1;
  border: none;
  background: none;
  font-size: 1rem;
  padding: 0.25rem;
  color: var(--text-primary);
}

.search-input:focus {
  outline: none;
}

.search-input::placeholder {
  color: var(--text-tertiary);
}

/* Cards */
.card {
  background: var(--bg-card);
  border-radius: 12px;
  padding: 1rem;
  box-shadow: var(--shadow);
}

/* Friends Grid */
.friends-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 1rem;
}

.friend-card {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.friend-avatar-link {
  position: relative;
}

.friend-avatar {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  object-fit: cover;
}

.online-indicator {
  position: absolute;
  bottom: 2px;
  right: 2px;
  width: 14px;
  height: 14px;
  background: #22c55e;
  border: 2px solid var(--bg-card);
  border-radius: 50%;
}

.friend-info {
  flex: 1;
}

.friend-name {
  font-weight: 600;
  color: var(--text-primary);
  text-decoration: none;
  display: block;
}

.friend-name:hover {
  text-decoration: underline;
}

.mutual-friends,
.status-text {
  color: var(--text-secondary);
  font-size: 0.85rem;
}

.friend-actions {
  display: flex;
  gap: 0.5rem;
}

.action-btn {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: none;
  background: var(--bg-tertiary);
  cursor: pointer;
  font-size: 1rem;
  transition: background 0.2s;
  color: var(--text-secondary);
}

.action-btn:hover {
  background: var(--bg-hover);
}

/* Dropdown */
.dropdown-wrapper {
  position: relative;
}

.dropdown-menu {
  position: absolute;
  right: 0;
  top: 100%;
  background: var(--bg-card);
  border-radius: 8px;
  box-shadow: var(--shadow-lg);
  z-index: 10;
  overflow: hidden;
  min-width: 150px;
}

.dropdown-menu button {
  display: block;
  width: 100%;
  padding: 0.75rem 1rem;
  border: none;
  background: none;
  text-align: left;
  cursor: pointer;
  color: var(--text-primary);
}

.dropdown-menu button:hover {
  background: var(--bg-hover);
}

/* Requests */
.requests-group {
  margin-bottom: 2rem;
}

.requests-group h3 {
  margin: 0 0 1rem;
  font-size: 1.1rem;
  color: var(--text-primary);
}

.requests-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.request-card {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.request-avatar {
  width: 70px;
  height: 70px;
  border-radius: 50%;
  object-fit: cover;
}

.request-info {
  flex: 1;
}

.request-name {
  font-weight: 600;
  color: var(--text-primary);
  text-decoration: none;
  display: block;
}

.request-time {
  color: var(--text-secondary);
  font-size: 0.8rem;
  display: block;
}

.request-actions {
  display: flex;
  gap: 0.5rem;
}

/* Suggestions */
.suggestions-section h3 {
  margin: 0 0 1rem;
  color: var(--text-primary);
}

.suggestions-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 1rem;
}

.suggestion-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 1.5rem;
}

.suggestion-avatar {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  object-fit: cover;
  margin-bottom: 0.75rem;
}

.suggestion-name {
  font-weight: 600;
  color: var(--text-primary);
  text-decoration: none;
  margin-bottom: 0.25rem;
}

.suggestion-reason {
  color: var(--text-secondary);
  font-size: 0.85rem;
  margin-bottom: 1rem;
}

.suggestion-actions {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  width: 100%;
}

/* Empty States */
.empty-state {
  text-align: center;
  padding: 3rem;
  color: var(--text-secondary);
}

.empty-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
}

.empty-state h3 {
  margin: 0 0 0.5rem;
  color: var(--text-primary);
}

.empty-state p {
  margin: 0 0 1rem;
}

.empty-state-small {
  text-align: center;
  padding: 1.5rem;
  color: var(--text-secondary);
  background: var(--bg-tertiary);
  border-radius: 12px;
}

/* Buttons */
.btn {
  padding: 0.6rem 1rem;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
}

.btn-primary {
  background: var(--primary);
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background: var(--primary-hover);
}

.btn-primary:disabled {
  background: var(--bg-tertiary);
  color: var(--text-tertiary);
  cursor: not-allowed;
}

.btn-secondary {
  background: var(--bg-tertiary);
  color: var(--text-primary);
}

.btn-secondary:hover:not(:disabled) {
  background: var(--bg-hover);
}

.btn-full {
  width: 100%;
}

@media (max-width: 640px) {
  .friends-grid {
    grid-template-columns: 1fr;
  }
  
  .friend-card {
    flex-wrap: wrap;
  }
  
  .friend-actions {
    width: 100%;
    justify-content: flex-end;
    margin-top: 0.5rem;
  }
}
</style>
