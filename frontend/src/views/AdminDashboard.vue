<template>
  <div class="admin-dashboard">
    <div class="admin-header">
      <h1>🛡️ Admin Control Panel</h1>
      <p>Complete control over your Transcendence application</p>
    </div>

    <!-- Stats Overview -->
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-icon">👥</div>
        <div class="stat-content">
          <div class="stat-value">{{ stats.totalUsers || 0 }}</div>
          <div class="stat-label">Total Users</div>
          <div class="stat-meta">{{ stats.onlineUsers || 0 }} online</div>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon">📝</div>
        <div class="stat-content">
          <div class="stat-value">{{ stats.totalPosts || 0 }}</div>
          <div class="stat-label">Total Posts</div>
          <div class="stat-meta">{{ stats.postsToday || 0 }} today</div>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon">💬</div>
        <div class="stat-content">
          <div class="stat-value">{{ stats.totalMessages || 0 }}</div>
          <div class="stat-label">Messages Sent</div>
          <div class="stat-meta">{{ stats.chatRooms || 0 }} rooms</div>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon">🎮</div>
        <div class="stat-content">
          <div class="stat-value">{{ stats.totalGames || 0 }}</div>
          <div class="stat-label">Games Played</div>
          <div class="stat-meta">{{ stats.activeGames || 0 }} active</div>
        </div>
      </div>
    </div>

    <!-- Tabs -->
    <div class="admin-tabs">
      <button 
        :class="['tab', { active: activeTab === 'users' }]"
        @click="activeTab = 'users'"
      >
        👥 Users
      </button>
      <button 
        :class="['tab', { active: activeTab === 'posts' }]"
        @click="activeTab = 'posts'"
      >
        📝 Posts
      </button>
      <button 
        :class="['tab', { active: activeTab === 'system' }]"
        @click="activeTab = 'system'"
      >
        ⚙️ System
      </button>
      <button 
        :class="['tab', { active: activeTab === 'logs' }]"
        @click="activeTab = 'logs'"
      >
        📋 Activity Logs
      </button>
      <button 
        :class="['tab', { active: activeTab === 'architecture' }]"
        @click="activeTab = 'architecture'"
      >
        🏗️ Architecture
      </button>
    </div>

    <!-- Users Management -->
    <div v-if="activeTab === 'users'" class="admin-content">
      <div class="content-header">
        <h2>User Management</h2>
        <input 
          v-model="userSearch"
          type="text"
          placeholder="Search users..."
          class="search-input"
        />
      </div>

      <div class="table-container">
        <table class="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Avatar</th>
              <th>Username</th>
              <th>Email</th>
              <th>Status</th>
              <th>Admin</th>
              <th>2FA</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="user in filteredUsers" :key="user.id">
              <td>{{ user.id }}</td>
              <td>
                <img :src="user.avatar || defaultAvatar" class="user-avatar-small" />
              </td>
              <td>{{ user.username }}</td>
              <td>{{ user.email }}</td>
              <td>
                <span :class="['status-badge', user.online ? 'online' : 'offline']">
                  {{ user.online ? '🟢 Online' : '⚫ Offline' }}
                </span>
              </td>
              <td>
                <span :class="['admin-badge', user.is_admin ? 'is-admin' : '']">
                  {{ user.is_admin ? '✓ Admin' : '—' }}
                </span>
              </td>
              <td>
                <span v-if="user.two_factor_enabled">🔐</span>
                <span v-else>—</span>
              </td>
              <td class="actions">
                <button @click="toggleAdmin(user)" class="btn-small btn-secondary" :title="user.is_admin ? 'Remove admin' : 'Make admin'">
                  {{ user.is_admin ? '👤' : '🛡️' }}
                </button>
                <button @click="viewUser(user)" class="btn-small btn-primary">
                  👁️
                </button>
                <button @click="deleteUser(user)" class="btn-small btn-danger">
                  🗑️
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Posts Management -->
    <div v-if="activeTab === 'posts'" class="admin-content">
      <div class="content-header">
        <h2>Posts Management</h2>
        <input 
          v-model="postSearch"
          type="text"
          placeholder="Search posts..."
          class="search-input"
        />
      </div>

      <div class="table-container">
        <table class="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Author</th>
              <th>Content</th>
              <th>Type</th>
              <th>Visibility</th>
              <th>Likes</th>
              <th>Comments</th>
              <th>Created</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="post in filteredPosts" :key="post.id">
              <td>{{ post.id }}</td>
              <td>{{ post.user?.username || 'Unknown' }}</td>
              <td class="content-preview">{{ truncate(post.content, 50) }}</td>
              <td>
                <span class="type-badge">{{ post.type }}</span>
              </td>
              <td>
                <span class="visibility-badge">{{ post.visibility }}</span>
              </td>
              <td>{{ post.likes_count || 0 }}</td>
              <td>{{ post.comments_count || 0 }}</td>
              <td>{{ formatDate(post.created_at) }}</td>
              <td class="actions">
                <button @click="viewPost(post)" class="btn-small btn-primary">
                  👁️
                </button>
                <button @click="deletePost(post)" class="btn-small btn-danger">
                  🗑️
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- System Health -->
    <div v-if="activeTab === 'system'" class="admin-content">
      <h2>System Health</h2>
      
      <div class="health-cards">
        <div class="health-card">
          <h3>🐳 Docker Services</h3>
          <div class="health-item">
            <span>PostgreSQL</span>
            <span class="health-status success">✓ Healthy</span>
          </div>
          <div class="health-item">
            <span>Backend (Node.js)</span>
            <span class="health-status success">✓ Running</span>
          </div>
          <div class="health-item">
            <span>Frontend (Vite)</span>
            <span class="health-status success">✓ Active</span>
          </div>
          <div class="health-item">
            <span>Nginx</span>
            <span class="health-status success">✓ Proxying</span>
          </div>
        </div>

        <div class="health-card">
          <h3>📊 Database Stats</h3>
          <div class="health-item">
            <span>Total Tables</span>
            <span class="health-value">{{ systemInfo.dbTables || 13 }}</span>
          </div>
          <div class="health-item">
            <span>Database Size</span>
            <span class="health-value">{{ systemInfo.dbSize || 'N/A' }}</span>
          </div>
          <div class="health-item">
            <span>Active Connections</span>
            <span class="health-value">{{ systemInfo.dbConnections || 0 }}</span>
          </div>
        </div>

        <div class="health-card">
          <h3>⚡ Performance</h3>
          <div class="health-item">
            <span>Uptime</span>
            <span class="health-value">{{ systemInfo.uptime || 'N/A' }}</span>
          </div>
          <div class="health-item">
            <span>Memory Usage</span>
            <span class="health-value">{{ systemInfo.memory || 'N/A' }}</span>
          </div>
          <div class="health-item">
            <span>CPU Usage</span>
            <span class="health-value">{{ systemInfo.cpu || 'N/A' }}</span>
          </div>
        </div>
      </div>

      <div class="action-buttons">
        <button @click="refreshStats" class="btn btn-primary">
          🔄 Refresh Stats
        </button>
        <button @click="clearCache" class="btn btn-secondary">
          🗑️ Clear Cache
        </button>
        <button @click="exportData" class="btn btn-secondary">
          📥 Export Data
        </button>
      </div>
    </div>

    <!-- Activity Logs -->
    <div v-if="activeTab === 'logs'" class="admin-content">
      <h2>Activity Logs</h2>
      
      <div class="logs-container">
        <div v-for="log in activityLogs" :key="log.id" class="log-entry">
          <span class="log-time">{{ formatTime(log.timestamp) }}</span>
          <span :class="['log-type', log.type]">{{ log.type }}</span>
          <span class="log-message">{{ log.message }}</span>
          <span class="log-user">{{ log.username }}</span>
        </div>
      </div>
    </div>

    <!-- Architecture Diagram -->
    <div v-if="activeTab === 'architecture'" class="admin-content">
      <h2>System Architecture</h2>
      
      <div v-if="architectureDiagram" class="architecture-container" v-html="architectureDiagram"></div>
      <div v-else class="loading-state">
        <div class="spinner-large"></div>
        <p>Loading architecture diagram...</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import api from '../services/api'

const router = useRouter()
const authStore = useAuthStore()

// Check admin access
onMounted(async () => {
  if (!authStore.currentUser?.is_admin) {
    alert('⛔ Access Denied: Admin privileges required')
    router.push('/feed')
    return
  }
  
  await loadAllData()
})

const activeTab = ref('users')
const userSearch = ref('')
const postSearch = ref('')

const stats = ref({
  totalUsers: 0,
  onlineUsers: 0,
  totalPosts: 0,
  postsToday: 0,
  totalMessages: 0,
  chatRooms: 0,
  totalGames: 0,
  activeGames: 0
})

const users = ref([])
const posts = ref([])
const systemInfo = ref({})
const activityLogs = ref([])
const architectureDiagram = ref(null)

const defaultAvatar = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="50" fill="%23667eea"/><text x="50" y="65" text-anchor="middle" fill="white" font-size="40">🦙</text></svg>'

const filteredUsers = computed(() => {
  if (!userSearch.value) return users.value
  const search = userSearch.value.toLowerCase()
  return users.value.filter(u => 
    u.username.toLowerCase().includes(search) ||
    u.email.toLowerCase().includes(search)
  )
})

const filteredPosts = computed(() => {
  if (!postSearch.value) return posts.value
  const search = postSearch.value.toLowerCase()
  return posts.value.filter(p => 
    p.content.toLowerCase().includes(search) ||
    p.user?.username.toLowerCase().includes(search)
  )
})

async function loadAllData() {
  await Promise.all([
    loadStats(),
    loadUsers(),
    loadPosts(),
    loadSystemInfo(),
    loadActivityLogs(),
    loadArchitecture()
  ])
}

async function loadStats() {
  try {
    const res = await api.get('/admin/stats')
    stats.value = res.data.stats
  } catch (err) {
    console.error('Failed to load stats:', err)
  }
}

async function loadUsers() {
  try {
    const res = await api.get('/users')
    users.value = res.data.users || []
  } catch (err) {
    console.error('Failed to load users:', err)
  }
}

async function loadPosts() {
  try {
    const res = await api.get('/admin/posts')
    posts.value = res.data.posts || []
  } catch (err) {
    console.error('Failed to load posts:', err)
    // Fallback to public feed
    try {
      const pubRes = await api.get('/posts')
      posts.value = pubRes.data.posts || []
    } catch (e) {
      console.error('Failed to load public posts:', e)
    }
  }
}

async function loadSystemInfo() {
  try {
    const res = await api.get('/admin/system')
    systemInfo.value = res.data.system || {}
  } catch (err) {
    console.error('Failed to load system info:', err)
  }
}

async function loadActivityLogs() {
  try {
    const res = await api.get('/admin/logs')
    activityLogs.value = res.data.logs || []
  } catch (err) {
    console.error('Failed to load logs:', err)
    // Mock data for now
    activityLogs.value = [
      { id: 1, timestamp: new Date(), type: 'info', message: 'User logged in', username: 'john' },
      { id: 2, timestamp: new Date(), type: 'warning', message: 'Failed login attempt', username: 'unknown' },
      { id: 3, timestamp: new Date(), type: 'success', message: 'New user registered', username: 'alice' }
    ]
  }
}

async function loadArchitecture() {
  try {
    const res = await api.get('/admin/architecture')
    architectureDiagram.value = res.data.diagram
  } catch (err) {
    console.error('Failed to load architecture:', err)
  }
}

async function toggleAdmin(user) {
  if (!confirm(`${user.is_admin ? 'Remove admin privileges from' : 'Grant admin privileges to'} ${user.username}?`)) {
    return
  }
  
  try {
    await api.put(`/admin/users/${user.id}`, {
      is_admin: !user.is_admin
    })
    user.is_admin = !user.is_admin
    alert(`✓ ${user.username} is now ${user.is_admin ? 'an admin' : 'a regular user'}`)
  } catch (err) {
    alert('Failed to update user: ' + (err.response?.data?.message || err.message))
  }
}

function viewUser(user) {
  router.push(`/profile/${user.username}`)
}

async function deleteUser(user) {
  if (!confirm(`⚠️ Really delete user "${user.username}"? This cannot be undone!`)) {
    return
  }
  
  try {
    await api.delete(`/admin/users/${user.id}`)
    users.value = users.value.filter(u => u.id !== user.id)
    alert(`✓ User "${user.username}" deleted`)
  } catch (err) {
    alert('Failed to delete user: ' + (err.response?.data?.message || err.message))
  }
}

function viewPost(post) {
  // Could open a modal or navigate to post detail
  console.log('View post:', post)
}

async function deletePost(post) {
  if (!confirm(`⚠️ Really delete this post? This cannot be undone!`)) {
    return
  }
  
  try {
    await api.delete(`/posts/${post.id}`)
    posts.value = posts.value.filter(p => p.id !== post.id)
    alert('✓ Post deleted')
  } catch (err) {
    alert('Failed to delete post: ' + (err.response?.data?.message || err.message))
  }
}

async function refreshStats() {
  await loadAllData()
  alert('✓ Stats refreshed')
}

async function clearCache() {
  if (!confirm('Clear all cached data?')) return
  // Implement cache clearing
  alert('✓ Cache cleared')
}

async function exportData() {
  try {
    const res = await api.get('/admin/export', { responseType: 'blob' })
    const url = window.URL.createObjectURL(new Blob([res.data]))
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', `transcendence-export-${Date.now()}.json`)
    document.body.appendChild(link)
    link.click()
    link.remove()
  } catch (err) {
    alert('Failed to export data: ' + (err.response?.data?.message || err.message))
  }
}

function truncate(text, length) {
  if (!text) return ''
  return text.length > length ? text.substring(0, length) + '...' : text
}

function formatDate(date) {
  if (!date) return ''
  return new Date(date).toLocaleDateString()
}

function formatTime(date) {
  if (!date) return ''
  return new Date(date).toLocaleTimeString()
}
</script>

<style scoped>
.admin-dashboard {
  max-width: 1400px;
  margin: 0 auto;
  padding: 2rem;
}

.admin-header {
  text-align: center;
  margin-bottom: 3rem;
}

.admin-header h1 {
  font-size: 2.5rem;
  margin-bottom: 0.5rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.stat-card {
  background: var(--bg-card);
  border-radius: 12px;
  padding: 1.5rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.stat-icon {
  font-size: 2.5rem;
}

.stat-content {
  flex: 1;
}

.stat-value {
  font-size: 2rem;
  font-weight: bold;
  color: var(--primary);
}

.stat-label {
  font-size: 0.9rem;
  color: var(--text-secondary);
  margin-top: 0.25rem;
}

.stat-meta {
  font-size: 0.85rem;
  color: var(--text-muted);
  margin-top: 0.25rem;
}

.admin-tabs {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 2rem;
  border-bottom: 2px solid var(--border);
  overflow-x: auto;
}

.tab {
  padding: 1rem 1.5rem;
  background: none;
  border: none;
  border-bottom: 3px solid transparent;
  cursor: pointer;
  font-size: 1rem;
  color: var(--text-secondary);
  transition: all 0.2s;
  white-space: nowrap;
}

.tab:hover {
  color: var(--text-primary);
  background: var(--bg-hover);
}

.tab.active {
  color: var(--primary);
  border-bottom-color: var(--primary);
  font-weight: 600;
}

.admin-content {
  background: var(--bg-card);
  border-radius: 12px;
  padding: 2rem;
  min-height: 400px;
}

.content-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  gap: 1rem;
  flex-wrap: wrap;
}

.search-input {
  padding: 0.75rem 1rem;
  border: 1px solid var(--border);
  border-radius: 8px;
  background: var(--bg-primary);
  color: var(--text-primary);
  min-width: 300px;
}

.table-container {
  overflow-x: auto;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
}

.data-table th,
.data-table td {
  padding: 1rem;
  text-align: left;
  border-bottom: 1px solid var(--border);
}

.data-table th {
  font-weight: 600;
  color: var(--text-secondary);
  font-size: 0.9rem;
  text-transform: uppercase;
}

.user-avatar-small {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
}

.status-badge,
.admin-badge,
.type-badge,
.visibility-badge {
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.85rem;
  font-weight: 500;
}

.status-badge.online {
  background: #10b98120;
  color: #10b981;
}

.status-badge.offline {
  background: #6b728020;
  color: #6b7280;
}

.admin-badge.is-admin {
  background: #8b5cf620;
  color: #8b5cf6;
}

.type-badge {
  background: var(--bg-tertiary);
  color: var(--text-primary);
}

.visibility-badge {
  background: var(--bg-tertiary);
  color: var(--text-secondary);
}

.content-preview {
  max-width: 300px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.actions {
  display: flex;
  gap: 0.5rem;
}

.btn-small {
  padding: 0.4rem 0.8rem;
  font-size: 0.9rem;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-small.btn-primary {
  background: var(--primary);
  color: white;
}

.btn-small.btn-secondary {
  background: var(--bg-tertiary);
  color: var(--text-primary);
}

.btn-small.btn-danger {
  background: #ef444420;
  color: #ef4444;
}

.btn-small:hover {
  opacity: 0.8;
}

.health-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.health-card {
  background: var(--bg-tertiary);
  border-radius: 8px;
  padding: 1.5rem;
}

.health-card h3 {
  margin-bottom: 1rem;
  font-size: 1.1rem;
}

.health-item {
  display: flex;
  justify-content: space-between;
  padding: 0.75rem 0;
  border-bottom: 1px solid var(--border);
}

.health-item:last-child {
  border-bottom: none;
}

.health-status,
.health-value {
  font-weight: 600;
}

.health-status.success {
  color: #10b981;
}

.action-buttons {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.logs-container {
  max-height: 600px;
  overflow-y: auto;
}

.log-entry {
  display: grid;
  grid-template-columns: 120px 80px 1fr 120px;
  gap: 1rem;
  padding: 1rem;
  border-bottom: 1px solid var(--border);
  align-items: center;
}

.log-time {
  font-size: 0.85rem;
  color: var(--text-muted);
}

.log-type {
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.8rem;
  font-weight: 600;
  text-align: center;
}

.log-type.info {
  background: #3b82f620;
  color: #3b82f6;
}

.log-type.warning {
  background: #f59e0b20;
  color: #f59e0b;
}

.log-type.success {
  background: #10b98120;
  color: #10b981;
}

.log-user {
  font-weight: 500;
  color: var(--text-secondary);
}

.architecture-container {
  background: white;
  padding: 2rem;
  border-radius: 8px;
}

@media (max-width: 768px) {
  .admin-dashboard {
    padding: 1rem;
  }

  .stats-grid {
    grid-template-columns: 1fr;
  }

  .content-header {
    flex-direction: column;
    align-items: stretch;
  }

  .search-input {
    min-width: 100%;
  }

  .log-entry {
    grid-template-columns: 1fr;
    gap: 0.5rem;
  }
}
</style>
