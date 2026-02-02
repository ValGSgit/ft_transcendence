<template>
  <div class="profile-page">
    <!-- Loading State -->
    <div v-if="loading && !profile" class="loading-container">
      <div class="loading-spinner">🦙</div>
      <p>Loading profile...</p>
    </div>

    <!-- Profile Content -->
    <template v-else-if="profile">
    <!-- Cover Photo -->
    <div class="cover-section">
      <div class="cover-photo" :style="{ backgroundImage: `url(${profile?.coverPhoto || defaultCover})` }">
        <button v-if="isOwnProfile" class="edit-cover-btn" @click="editCoverPhoto">
          📷 Edit Cover Photo
        </button>
      </div>
      
      <!-- Profile Info -->
      <div class="profile-info">
        <div class="avatar-section">
          <img 
            :src="profile?.avatar || defaultAvatar" 
            :alt="profile?.username"
            class="profile-avatar"
          />
          <button v-if="isOwnProfile" class="edit-avatar-btn" @click="editAvatar">📷</button>
        </div>
        
        <div class="info-content">
          <h1 class="username">{{ profile?.username }}</h1>
          <p class="friend-count">{{ profile?.friendCount || 0 }} friends</p>
          <p v-if="profile?.bio" class="bio">{{ profile.bio }}</p>
        </div>
        
        <div class="profile-actions">
          <template v-if="isOwnProfile">
            <router-link to="/settings" class="btn btn-secondary">
              ⚙️ Edit Profile
            </router-link>
          </template>
          <template v-else>
            <button 
              v-if="!isFriend && !hasPendingRequest"
              class="btn btn-primary"
              @click="sendFriendRequest"
              :disabled="loading"
            >
              ➕ Add Friend
            </button>
            <button 
              v-else-if="hasPendingRequest"
              class="btn btn-secondary"
              disabled
            >
              ⏳ Request Sent
            </button>
            <button v-else class="btn btn-secondary">
              ✓ Friends
            </button>
            <button class="btn btn-primary" @click="startChat">
              💬 Message
            </button>
          </template>
        </div>
      </div>
    </div>

    <!-- Navigation Tabs -->
    <div class="profile-tabs">
      <button 
        :class="['tab', { active: activeTab === 'posts' }]"
        @click="activeTab = 'posts'"
      >
        Posts
      </button>
      <button 
        :class="['tab', { active: activeTab === 'about' }]"
        @click="activeTab = 'about'"
      >
        About
      </button>
      <button 
        :class="['tab', { active: activeTab === 'friends' }]"
        @click="activeTab = 'friends'"
      >
        Friends
      </button>
      <button 
        :class="['tab', { active: activeTab === 'farm' }]"
        @click="activeTab = 'farm'"
      >
        🦙 Farm
      </button>
      <button 
        :class="['tab', { active: activeTab === 'achievements' }]"
        @click="activeTab = 'achievements'"
      >
        🏆 Achievements
      </button>
    </div>

    <!-- Tab Content -->
    <div class="profile-content">
      <!-- Posts Tab -->
      <div v-if="activeTab === 'posts'" class="posts-tab">
        <div class="content-grid">
          <!-- Intro Card -->
          <aside class="intro-card card">
            <h3>Intro</h3>
            <p v-if="profile?.bio" class="intro-bio">{{ profile.bio }}</p>
            
            <ul class="intro-list">
              <li v-if="profile?.location">
                📍 Lives in <strong>{{ profile.location }}</strong>
              </li>
              <li v-if="profile?.workplace">
                💼 Works at <strong>{{ profile.workplace }}</strong>
              </li>
              <li>
                📅 Joined {{ formatJoinDate(profile?.createdAt) }}
              </li>
              <li>
                🦙 Farm Level: <strong>{{ profile?.farmLevel || 1 }}</strong>
              </li>
            </ul>

            <button v-if="isOwnProfile" class="btn btn-secondary btn-full">
              Edit Details
            </button>
          </aside>

          <!-- Posts Feed -->
          <div class="posts-feed">
            <div v-if="isOwnProfile" class="create-post-card card">
              <div class="create-post-input">
                <img :src="authStore.currentUser?.avatar || defaultAvatar" class="avatar" />
                <button class="post-input-btn" @click="openCreatePost">
                  What's on your mind?
                </button>
              </div>
              <div class="post-type-btns">
                <button @click="openCreatePost('photo')">📷 Photo</button>
                <button @click="openCreatePost('farm')">🦙 Farm Update</button>
                <button @click="openCreatePost('achievement')">🏆 Achievement</button>
              </div>
            </div>

            <TransitionGroup name="post-list">
              <PostCard
                v-for="post in userPosts"
                :key="post.id"
                :post="post"
                @like="handleLike"
                @comment="handleComment"
                @share="handleShare"
                @delete="handleDelete"
              />
            </TransitionGroup>

            <div v-if="userPosts.length === 0" class="empty-state">
              <p>{{ isOwnProfile ? "You haven't posted anything yet." : "No posts to show." }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- About Tab -->
      <div v-if="activeTab === 'about'" class="about-tab card">
        <h3>About {{ profile?.username }}</h3>
        
        <div class="about-section">
          <h4>Overview</h4>
          <ul class="about-list">
            <li v-if="profile?.location">
              <span class="about-icon">📍</span>
              <span>Lives in {{ profile.location }}</span>
            </li>
            <li v-if="profile?.workplace">
              <span class="about-icon">💼</span>
              <span>Works at {{ profile.workplace }}</span>
            </li>
            <li>
              <span class="about-icon">📅</span>
              <span>Joined {{ formatJoinDate(profile?.createdAt) }}</span>
            </li>
          </ul>
        </div>

        <div class="about-section">
          <h4>Game Stats</h4>
          <div class="stats-grid">
            <div class="stat-card">
              <span class="stat-icon">🦙</span>
              <span class="stat-value">{{ profile?.totalAlpacas || 0 }}</span>
              <span class="stat-label">Alpacas Raised</span>
            </div>
            <div class="stat-card">
              <span class="stat-icon">💰</span>
              <span class="stat-value">{{ profile?.totalCoins || 0 }}</span>
              <span class="stat-label">Coins Earned</span>
            </div>
            <div class="stat-card">
              <span class="stat-icon">🏆</span>
              <span class="stat-value">{{ profile?.achievements?.length || 0 }}</span>
              <span class="stat-label">Achievements</span>
            </div>
            <div class="stat-card">
              <span class="stat-icon">⭐</span>
              <span class="stat-value">{{ profile?.farmLevel || 1 }}</span>
              <span class="stat-label">Farm Level</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Friends Tab -->
      <div v-if="activeTab === 'friends'" class="friends-tab card">
        <div class="friends-header">
          <h3>Friends</h3>
          <span class="friend-total">{{ friends.length }} friends</span>
        </div>

        <input 
          v-model="friendSearch"
          type="text"
          placeholder="Search friends..."
          class="search-input"
        />

        <div class="friends-grid">
          <router-link
            v-for="friend in filteredFriends"
            :key="friend.id"
            :to="`/profile/${friend.username}`"
            class="friend-card"
          >
            <img :src="friend.avatar || defaultAvatar" class="friend-avatar" />
            <span class="friend-name">{{ friend.username }}</span>
          </router-link>
        </div>

        <div v-if="filteredFriends.length === 0" class="empty-state">
          <p>{{ friendSearch ? 'No friends found' : 'No friends yet' }}</p>
        </div>
      </div>

      <!-- Farm Tab -->
      <div v-if="activeTab === 'farm'" class="farm-tab card">
        <div class="farm-header">
          <h3>🦙 {{ profile?.username }}'s Farm</h3>
          <button v-if="!isOwnProfile" class="btn btn-primary" @click="visitFarm">
            🎮 Visit Farm
          </button>
        </div>

        <div class="farm-preview">
          <div class="farm-stats-row">
            <div class="farm-stat">
              <span class="stat-icon">🦙</span>
              <div>
                <span class="stat-value">{{ profile?.farmStats?.alpacas || 0 }}</span>
                <span class="stat-label">Alpacas</span>
              </div>
            </div>
            <div class="farm-stat">
              <span class="stat-icon">💰</span>
              <div>
                <span class="stat-value">{{ profile?.farmStats?.coins || 0 }}</span>
                <span class="stat-label">Coins</span>
              </div>
            </div>
            <div class="farm-stat">
              <span class="stat-icon">🏠</span>
              <div>
                <span class="stat-value">{{ profile?.farmStats?.buildings || 0 }}</span>
                <span class="stat-label">Buildings</span>
              </div>
            </div>
          </div>

          <div v-if="isOwnProfile" class="farm-action">
            <router-link to="/game" class="btn btn-primary btn-large">
              🎮 Play Now
            </router-link>
          </div>
        </div>
      </div>

      <!-- Achievements Tab -->
      <div v-if="activeTab === 'achievements'" class="achievements-tab card">
        <h3>🏆 Achievements</h3>

        <div class="achievements-grid">
          <div 
            v-for="achievement in achievements" 
            :key="achievement.id"
            :class="['achievement-card', { unlocked: achievement.unlocked }]"
          >
            <span class="achievement-icon">{{ achievement.icon }}</span>
            <div class="achievement-info">
              <span class="achievement-name">{{ achievement.name }}</span>
              <span class="achievement-desc">{{ achievement.description }}</span>
            </div>
            <span v-if="achievement.unlocked" class="achievement-date">
              {{ formatDate(achievement.unlockedAt) }}
            </span>
          </div>
        </div>
      </div>
    </div>
    </template>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { useSocialStore } from '../stores/social'
import { useChatStore } from '../stores/chat'
import api from '../services/api'
import PostCard from '../components/PostCard.vue'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const socialStore = useSocialStore()
const chatStore = useChatStore()

const defaultAvatar = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="50" fill="%23667eea"/><text x="50" y="65" text-anchor="middle" fill="white" font-size="40">🦙</text></svg>'
const defaultCover = 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&h=400&fit=crop'

const profile = ref(null)
const userPosts = ref([])
const friends = ref([])
const achievements = ref([])
const loading = ref(false)
const activeTab = ref('posts')
const friendSearch = ref('')

const isOwnProfile = computed(() => 
  authStore.currentUser?.username === route.params.username
)

const isFriend = computed(() => 
  socialStore.friends.some(f => f.username === profile.value?.username)
)

const hasPendingRequest = computed(() => 
  socialStore.sentRequests?.some(r => r.username === profile.value?.username)
)

const filteredFriends = computed(() => {
  if (!friendSearch.value) return friends.value
  const search = friendSearch.value.toLowerCase()
  return friends.value.filter(f => 
    f.username.toLowerCase().includes(search)
  )
})

onMounted(() => {
  loadProfile()
})

watch(() => route.params.username, () => {
  loadProfile()
})

async function loadProfile() {
  loading.value = true
  try {
    const username = route.params.username || authStore.currentUser?.username
    
    if (!username) {
      router.push('/login')
      return
    }
    
    // Load profile data by username
    const profileRes = await api.get(`/users/username/${username}`)
    profile.value = {
      ...profileRes.data.user,
      ...profileRes.data.stats,
      friendCount: profileRes.data.stats?.friendCount || 0,
      farmLevel: profileRes.data.stats?.farmLevel || 1,
      totalAlpacas: profileRes.data.stats?.totalAlpacas || 0,
      totalCoins: profileRes.data.stats?.totalCoins || 0
    }

    // Load user's posts (would need backend endpoint)
    try {
      const postsRes = await api.get(`/posts/user/${username}`)
      userPosts.value = postsRes.data
    } catch (err) {
      // Posts endpoint might not exist yet
      userPosts.value = []
    }

    // Load friends list from Friend model
    try {
      const friendsRes = await api.get(`/friends`)
      friends.value = friendsRes.data.filter(f => f.status === 'accepted')
    } catch (err) {
      friends.value = []
    }

    // Load achievements
    achievements.value = getAchievements()
  } catch (error) {
    console.error('Failed to load profile:', error)
    if (error.response?.status === 404) {
      router.push('/404')
    }
  } finally {
    loading.value = false
  }
}

function getAchievements() {
  // Sample achievements - would come from backend
  return [
    { id: 1, icon: '🌟', name: 'First Steps', description: 'Create your first alpaca', unlocked: true, unlockedAt: new Date() },
    { id: 2, icon: '🦙', name: 'Alpaca Lover', description: 'Own 10 alpacas', unlocked: true, unlockedAt: new Date() },
    { id: 3, icon: '💰', name: 'Rich Farmer', description: 'Earn 10,000 coins', unlocked: false },
    { id: 4, icon: '👥', name: 'Social Butterfly', description: 'Make 10 friends', unlocked: false },
    { id: 5, icon: '🏆', name: 'Champion', description: 'Reach farm level 10', unlocked: false },
    { id: 6, icon: '🎨', name: 'Decorator', description: 'Place 20 decorations', unlocked: false },
  ]
}

async function sendFriendRequest() {
  try {
    await socialStore.sendFriendRequest(profile.value.id)
  } catch (error) {
    console.error('Failed to send friend request:', error)
  }
}

function startChat() {
  chatStore.startConversation(profile.value)
  router.push('/messages')
}

function visitFarm() {
  router.push(`/game?visit=${profile.value.username}`)
}

function handleLike(postId) {
  socialStore.likePost(postId)
}

function handleComment(postId, content) {
  socialStore.commentOnPost(postId, content)
}

function handleShare(post) {
  // TODO: Implement share modal
}

function handleDelete(postId) {
  socialStore.deletePost(postId)
  userPosts.value = userPosts.value.filter(p => p.id !== postId)
}

function openCreatePost(type) {
  router.push({ path: '/feed', query: { createPost: true, type } })
}

function editCoverPhoto() {
  // TODO: Implement cover photo editor
}

function editAvatar() {
  // TODO: Implement avatar editor
}

function formatJoinDate(dateString) {
  if (!dateString) return 'Unknown'
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric'
  })
}

function formatDate(dateString) {
  if (!dateString) return ''
  return new Date(dateString).toLocaleDateString()
}
</script>

<style scoped>
.profile-page {
  max-width: 900px;
  margin: 0 auto;
}

/* Cover Section */
.cover-section {
  position: relative;
}

.cover-photo {
  height: 300px;
  background-size: cover;
  background-position: center;
  border-radius: 0 0 12px 12px;
  position: relative;
}

.edit-cover-btn {
  position: absolute;
  bottom: 1rem;
  right: 1rem;
  padding: 0.5rem 1rem;
  background: rgba(0, 0, 0, 0.6);
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
}

.profile-info {
  display: flex;
  align-items: flex-end;
  padding: 0 2rem;
  margin-top: -5rem;
  gap: 1.5rem;
}

.avatar-section {
  position: relative;
}

.profile-avatar {
  width: 168px;
  height: 168px;
  border-radius: 50%;
  border: 5px solid white;
  object-fit: cover;
  background: white;
}

.edit-avatar-btn {
  position: absolute;
  bottom: 10px;
  right: 10px;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: #e4e6e9;
  border: none;
  cursor: pointer;
}

.info-content {
  flex: 1;
  padding-bottom: 1rem;
}

.username {
  font-size: 2rem;
  font-weight: bold;
  margin: 0;
}

.friend-count {
  color: #65676b;
  margin: 0.25rem 0;
}

.bio {
  margin: 0.5rem 0 0;
  max-width: 500px;
}

.profile-actions {
  display: flex;
  gap: 0.5rem;
  padding-bottom: 1rem;
}

/* Tabs */
.profile-tabs {
  display: flex;
  gap: 0.5rem;
  padding: 1rem 2rem;
  border-bottom: 1px solid #e4e6e9;
  margin-top: 1rem;
}

.tab {
  padding: 1rem 1.5rem;
  background: none;
  border: none;
  cursor: pointer;
  font-weight: 600;
  color: #65676b;
  border-radius: 8px;
  transition: background 0.2s;
}

.tab:hover {
  background: #f0f2f5;
}

.tab.active {
  color: #667eea;
  border-bottom: 3px solid #667eea;
  margin-bottom: -1px;
}

/* Content */
.profile-content {
  padding: 1rem;
}

.card {
  background: white;
  border-radius: 12px;
  padding: 1rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

/* Posts Tab */
.content-grid {
  display: grid;
  grid-template-columns: 300px 1fr;
  gap: 1rem;
}

@media (max-width: 768px) {
  .content-grid {
    grid-template-columns: 1fr;
  }
}

.intro-card h3 {
  font-size: 1.25rem;
  margin: 0 0 1rem;
}

.intro-bio {
  margin-bottom: 1rem;
}

.intro-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.intro-list li {
  padding: 0.5rem 0;
  border-top: 1px solid #e4e6e9;
}

.btn-full {
  width: 100%;
  margin-top: 1rem;
}

/* Create Post Card */
.create-post-card {
  margin-bottom: 1rem;
}

.create-post-input {
  display: flex;
  gap: 0.75rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #e4e6e9;
}

.avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
}

.post-input-btn {
  flex: 1;
  padding: 0.75rem 1rem;
  background: #f0f2f5;
  border: none;
  border-radius: 20px;
  text-align: left;
  color: #65676b;
  cursor: pointer;
}

.post-input-btn:hover {
  background: #e4e6e9;
}

.post-type-btns {
  display: flex;
  justify-content: space-around;
  padding-top: 0.5rem;
}

.post-type-btns button {
  padding: 0.5rem 1rem;
  background: none;
  border: none;
  cursor: pointer;
  color: #65676b;
  font-weight: 600;
  border-radius: 8px;
}

.post-type-btns button:hover {
  background: #f0f2f5;
}

/* About Tab */
.about-section {
  margin-bottom: 2rem;
}

.about-section h4 {
  margin: 0 0 1rem;
  color: #333;
}

.about-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.about-list li {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 0;
}

.about-icon {
  font-size: 1.25rem;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 1rem;
}

.stat-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 1.5rem;
  background: #f8f9fa;
  border-radius: 12px;
}

.stat-card .stat-icon {
  font-size: 2rem;
  margin-bottom: 0.5rem;
}

.stat-card .stat-value {
  font-size: 1.5rem;
  font-weight: bold;
}

.stat-card .stat-label {
  color: #65676b;
  font-size: 0.85rem;
}

/* Friends Tab */
.friends-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.friends-header h3 {
  margin: 0;
}

.friend-total {
  color: #65676b;
}

.search-input {
  width: 100%;
  padding: 0.75rem 1rem;
  border: none;
  background: #f0f2f5;
  border-radius: 20px;
  margin-bottom: 1rem;
}

.friends-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 1rem;
}

.friend-card {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 12px;
  text-decoration: none;
  color: inherit;
  transition: background 0.2s;
}

.friend-card:hover {
  background: #e4e6e9;
}

.friend-avatar {
  width: 50px;
  height: 50px;
  border-radius: 50%;
}

.friend-name {
  font-weight: 600;
}

/* Farm Tab */
.farm-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.farm-header h3 {
  margin: 0;
}

.farm-preview {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 16px;
  padding: 2rem;
  color: white;
}

.farm-stats-row {
  display: flex;
  justify-content: space-around;
  margin-bottom: 2rem;
}

.farm-stat {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.farm-stat .stat-icon {
  font-size: 2.5rem;
}

.farm-stat .stat-value {
  font-size: 1.75rem;
  font-weight: bold;
  display: block;
}

.farm-stat .stat-label {
  opacity: 0.9;
  font-size: 0.9rem;
}

.farm-action {
  text-align: center;
}

.btn-large {
  padding: 1rem 2rem;
  font-size: 1.1rem;
}

/* Achievements Tab */
.achievements-grid {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-top: 1rem;
}

.achievement-card {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 12px;
  opacity: 0.5;
}

.achievement-card.unlocked {
  opacity: 1;
  background: linear-gradient(135deg, #f8f9fa 0%, #fff9e6 100%);
}

.achievement-icon {
  font-size: 2rem;
}

.achievement-info {
  flex: 1;
}

.achievement-name {
  font-weight: 600;
  display: block;
}

.achievement-desc {
  color: #65676b;
  font-size: 0.9rem;
}

.achievement-date {
  color: #65676b;
  font-size: 0.85rem;
}

/* Utility */
.empty-state {
  text-align: center;
  padding: 2rem;
  color: #65676b;
}

.btn {
  padding: 0.75rem 1.25rem;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
}

.btn-primary {
  background: #667eea;
  color: white;
}

.btn-primary:hover {
  background: #5a6fd6;
}

.btn-secondary {
  background: #e4e6e9;
  color: #333;
}

.btn-secondary:hover {
  background: #d8dadc;
}

/* Animations */
.post-list-enter-active,
.post-list-leave-active {
  transition: all 0.3s ease;
}

.post-list-enter-from,
.post-list-leave-to {
  opacity: 0;
  transform: translateY(-20px);
}

/* Loading State */
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 60vh;
  gap: 1rem;
}

.loading-spinner {
  font-size: 4rem;
  animation: bounce 1s infinite;
}

@keyframes bounce {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-20px);
  }
}
</style>

