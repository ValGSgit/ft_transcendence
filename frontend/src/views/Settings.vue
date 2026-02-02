<template>
  <div class="settings-page">
    <div class="settings-container">
      <header class="settings-header">
        <h1>Settings</h1>
      </header>

      <!-- Navigation -->
      <nav class="settings-nav">
        <button 
          v-for="tab in tabs" 
          :key="tab.id"
          :class="['nav-btn', { active: activeTab === tab.id }]"
          @click="activeTab = tab.id"
        >
          <span class="nav-icon">{{ tab.icon }}</span>
          {{ tab.label }}
        </button>
      </nav>

      <!-- Content -->
      <div class="settings-content">
        <!-- Profile Settings -->
        <section v-if="activeTab === 'profile'" class="settings-section">
          <h2>Profile Settings</h2>
          
          <div class="profile-photo-section">
            <img :src="profileData.avatar || defaultAvatar" class="profile-photo" />
            <div class="photo-actions">
              <button class="btn btn-secondary" @click="changeAvatar">
                📷 Change Photo
              </button>
              <button class="btn btn-text" @click="removeAvatar">
                Remove
              </button>
            </div>
          </div>

          <div class="form-group">
            <label>Username</label>
            <input v-model="profileData.username" type="text" class="form-input" />
            <span class="form-hint">Your unique username</span>
          </div>

          <div class="form-group">
            <label>Display Name</label>
            <input v-model="profileData.displayName" type="text" class="form-input" />
          </div>

          <div class="form-group">
            <label>Bio</label>
            <textarea v-model="profileData.bio" class="form-input" rows="3" placeholder="Tell us about yourself..."></textarea>
          </div>

          <div class="form-group">
            <label>Location</label>
            <input v-model="profileData.location" type="text" class="form-input" placeholder="City, Country" />
          </div>

          <div class="form-actions">
            <button class="btn btn-primary" @click="saveProfile" :disabled="saving">
              {{ saving ? 'Saving...' : 'Save Changes' }}
            </button>
          </div>
        </section>

        <!-- Account Settings -->
        <section v-if="activeTab === 'account'" class="settings-section">
          <h2>Account Settings</h2>

          <div class="settings-card">
            <h3>Email Address</h3>
            <div class="form-group">
              <input v-model="accountData.email" type="email" class="form-input" />
            </div>
            <button class="btn btn-secondary">Update Email</button>
          </div>

          <div class="settings-card">
            <h3>Password</h3>
            <div class="form-group">
              <label>Current Password</label>
              <input v-model="passwordData.current" type="password" class="form-input" />
            </div>
            <div class="form-group">
              <label>New Password</label>
              <input v-model="passwordData.new" type="password" class="form-input" />
            </div>
            <div class="form-group">
              <label>Confirm New Password</label>
              <input v-model="passwordData.confirm" type="password" class="form-input" />
            </div>
            <button class="btn btn-secondary" @click="changePassword">Change Password</button>
          </div>

          <div class="settings-card danger-zone">
            <h3>Delete Account</h3>
            <p>Once you delete your account, there is no going back. Please be certain.</p>
            <button class="btn btn-danger" @click="confirmDeleteAccount">
              Delete Account
            </button>
          </div>
        </section>

        <!-- Privacy Settings -->
        <section v-if="activeTab === 'privacy'" class="settings-section">
          <h2>Privacy Settings</h2>

          <div class="settings-card">
            <div class="setting-row">
              <div class="setting-info">
                <h4>Profile Visibility</h4>
                <p>Control who can see your profile</p>
              </div>
              <select v-model="privacyData.profileVisibility" class="form-select">
                <option value="public">Public</option>
                <option value="friends">Friends Only</option>
                <option value="private">Private</option>
              </select>
            </div>

            <div class="setting-row">
              <div class="setting-info">
                <h4>Online Status</h4>
                <p>Show when you're online</p>
              </div>
              <label class="toggle">
                <input type="checkbox" v-model="privacyData.showOnlineStatus" />
                <span class="toggle-slider"></span>
              </label>
            </div>

            <div class="setting-row">
              <div class="setting-info">
                <h4>Activity Status</h4>
                <p>Show your activity in feeds</p>
              </div>
              <label class="toggle">
                <input type="checkbox" v-model="privacyData.showActivity" />
                <span class="toggle-slider"></span>
              </label>
            </div>

            <div class="setting-row">
              <div class="setting-info">
                <h4>Friend Requests</h4>
                <p>Who can send you friend requests</p>
              </div>
              <select v-model="privacyData.friendRequests" class="form-select">
                <option value="everyone">Everyone</option>
                <option value="friends-of-friends">Friends of Friends</option>
                <option value="nobody">Nobody</option>
              </select>
            </div>
          </div>

          <div class="form-actions">
            <button class="btn btn-primary" @click="savePrivacy">Save Privacy Settings</button>
          </div>
        </section>

        <!-- Notifications Settings -->
        <section v-if="activeTab === 'notifications'" class="settings-section">
          <h2>Notification Settings</h2>

          <div class="settings-card">
            <h3>Push Notifications</h3>
            
            <div class="setting-row">
              <div class="setting-info">
                <h4>Friend Requests</h4>
              </div>
              <label class="toggle">
                <input type="checkbox" v-model="notificationData.friendRequests" />
                <span class="toggle-slider"></span>
              </label>
            </div>

            <div class="setting-row">
              <div class="setting-info">
                <h4>Messages</h4>
              </div>
              <label class="toggle">
                <input type="checkbox" v-model="notificationData.messages" />
                <span class="toggle-slider"></span>
              </label>
            </div>

            <div class="setting-row">
              <div class="setting-info">
                <h4>Post Likes</h4>
              </div>
              <label class="toggle">
                <input type="checkbox" v-model="notificationData.postLikes" />
                <span class="toggle-slider"></span>
              </label>
            </div>

            <div class="setting-row">
              <div class="setting-info">
                <h4>Comments</h4>
              </div>
              <label class="toggle">
                <input type="checkbox" v-model="notificationData.comments" />
                <span class="toggle-slider"></span>
              </label>
            </div>

            <div class="setting-row">
              <div class="setting-info">
                <h4>Farm Visits</h4>
              </div>
              <label class="toggle">
                <input type="checkbox" v-model="notificationData.farmVisits" />
                <span class="toggle-slider"></span>
              </label>
            </div>
          </div>

          <div class="settings-card">
            <h3>Email Notifications</h3>
            
            <div class="setting-row">
              <div class="setting-info">
                <h4>Weekly Digest</h4>
                <p>Get a summary of your week</p>
              </div>
              <label class="toggle">
                <input type="checkbox" v-model="notificationData.emailDigest" />
                <span class="toggle-slider"></span>
              </label>
            </div>

            <div class="setting-row">
              <div class="setting-info">
                <h4>Important Updates</h4>
                <p>Security and account alerts</p>
              </div>
              <label class="toggle">
                <input type="checkbox" v-model="notificationData.emailImportant" />
                <span class="toggle-slider"></span>
              </label>
            </div>
          </div>

          <div class="form-actions">
            <button class="btn btn-primary" @click="saveNotifications">Save Notification Settings</button>
          </div>
        </section>

        <!-- Game Settings -->
        <section v-if="activeTab === 'game'" class="settings-section">
          <h2>Game Settings</h2>

          <div class="settings-card">
            <h3>Graphics</h3>
            
            <div class="setting-row">
              <div class="setting-info">
                <h4>Quality</h4>
              </div>
              <select v-model="gameData.quality" class="form-select">
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>

            <div class="setting-row">
              <div class="setting-info">
                <h4>Shadows</h4>
              </div>
              <label class="toggle">
                <input type="checkbox" v-model="gameData.shadows" />
                <span class="toggle-slider"></span>
              </label>
            </div>

            <div class="setting-row">
              <div class="setting-info">
                <h4>Antialiasing</h4>
              </div>
              <label class="toggle">
                <input type="checkbox" v-model="gameData.antialiasing" />
                <span class="toggle-slider"></span>
              </label>
            </div>
          </div>

          <div class="settings-card">
            <h3>Audio</h3>
            
            <div class="setting-row">
              <div class="setting-info">
                <h4>Master Volume</h4>
              </div>
              <input type="range" v-model="gameData.masterVolume" min="0" max="100" class="range-input" />
              <span class="range-value">{{ gameData.masterVolume }}%</span>
            </div>

            <div class="setting-row">
              <div class="setting-info">
                <h4>Music</h4>
              </div>
              <input type="range" v-model="gameData.musicVolume" min="0" max="100" class="range-input" />
              <span class="range-value">{{ gameData.musicVolume }}%</span>
            </div>

            <div class="setting-row">
              <div class="setting-info">
                <h4>Sound Effects</h4>
              </div>
              <input type="range" v-model="gameData.sfxVolume" min="0" max="100" class="range-input" />
              <span class="range-value">{{ gameData.sfxVolume }}%</span>
            </div>
          </div>

          <div class="settings-card">
            <h3>Controls</h3>
            
            <div class="setting-row">
              <div class="setting-info">
                <h4>Camera Sensitivity</h4>
              </div>
              <input type="range" v-model="gameData.cameraSensitivity" min="1" max="10" class="range-input" />
              <span class="range-value">{{ gameData.cameraSensitivity }}</span>
            </div>

            <div class="setting-row">
              <div class="setting-info">
                <h4>Invert Y-Axis</h4>
              </div>
              <label class="toggle">
                <input type="checkbox" v-model="gameData.invertY" />
                <span class="toggle-slider"></span>
              </label>
            </div>
          </div>

          <div class="form-actions">
            <button class="btn btn-primary" @click="saveGameSettings">Save Game Settings</button>
          </div>
        </section>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useAuthStore } from '../stores/auth'
import api from '../services/api'

const authStore = useAuthStore()

const defaultAvatar = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="50" fill="%23667eea"/><text x="50" y="65" text-anchor="middle" fill="white" font-size="40">🦙</text></svg>'

const tabs = [
  { id: 'profile', icon: '👤', label: 'Profile' },
  { id: 'account', icon: '🔐', label: 'Account' },
  { id: 'privacy', icon: '🔒', label: 'Privacy' },
  { id: 'notifications', icon: '🔔', label: 'Notifications' },
  { id: 'game', icon: '🎮', label: 'Game' }
]

const activeTab = ref('profile')
const saving = ref(false)

const profileData = reactive({
  avatar: '',
  username: '',
  displayName: '',
  bio: '',
  location: ''
})

const accountData = reactive({
  email: ''
})

const passwordData = reactive({
  current: '',
  new: '',
  confirm: ''
})

const privacyData = reactive({
  profileVisibility: 'public',
  showOnlineStatus: true,
  showActivity: true,
  friendRequests: 'everyone'
})

const notificationData = reactive({
  friendRequests: true,
  messages: true,
  postLikes: true,
  comments: true,
  farmVisits: true,
  emailDigest: false,
  emailImportant: true
})

const gameData = reactive({
  quality: 'medium',
  shadows: true,
  antialiasing: true,
  masterVolume: 80,
  musicVolume: 60,
  sfxVolume: 80,
  cameraSensitivity: 5,
  invertY: false
})

onMounted(() => {
  loadSettings()
})

async function loadSettings() {
  try {
    const user = authStore.currentUser
    if (user) {
      profileData.avatar = user.avatar || ''
      profileData.username = user.username || ''
      profileData.displayName = user.displayName || user.username || ''
      profileData.bio = user.bio || ''
      profileData.location = user.location || ''
      accountData.email = user.email || ''
    }

    // Load saved settings from localStorage
    const savedPrivacy = localStorage.getItem('privacySettings')
    if (savedPrivacy) Object.assign(privacyData, JSON.parse(savedPrivacy))

    const savedNotifications = localStorage.getItem('notificationSettings')
    if (savedNotifications) Object.assign(notificationData, JSON.parse(savedNotifications))

    const savedGame = localStorage.getItem('gameSettings')
    if (savedGame) Object.assign(gameData, JSON.parse(savedGame))
  } catch (error) {
    console.error('Failed to load settings:', error)
  }
}

async function saveProfile() {
  saving.value = true
  try {
    await api.put('/users/profile', {
      username: profileData.username,
      displayName: profileData.displayName,
      bio: profileData.bio,
      location: profileData.location
    })
    
    // Update local user data
    if (authStore.currentUser) {
      authStore.currentUser.username = profileData.username
      authStore.currentUser.displayName = profileData.displayName
      authStore.currentUser.bio = profileData.bio
      authStore.currentUser.location = profileData.location
    }
  } catch (error) {
    console.error('Failed to save profile:', error)
    alert('Failed to save profile')
  } finally {
    saving.value = false
  }
}

function changeAvatar() {
  const input = document.createElement('input')
  input.type = 'file'
  input.accept = 'image/*'
  input.onchange = async (e) => {
    const file = e.target.files?.[0]
    if (file) {
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('Image must be less than 5MB')
        return
      }
      
      const reader = new FileReader()
      reader.onload = async (event) => {
        try {
          saving.value = true
          
          // Update avatar via API
          await api.put('/users/profile', {
            avatar: event.target.result
          })
          
          // Update local state
          profileData.avatar = event.target.result
          if (authStore.currentUser) {
            authStore.currentUser.avatar = event.target.result
          }
          
          alert('Avatar updated successfully!')
        } catch (error) {
          console.error('Failed to update avatar:', error)
          alert('Failed to update avatar')
        } finally {
          saving.value = false
        }
      }
      reader.readAsDataURL(file)
    }
  }
  input.click()
}

function removeAvatar() {
  profileData.avatar = ''
  if (authStore.currentUser) {
    authStore.currentUser.avatar = ''
  }
}

async function changePassword() {
  if (passwordData.new !== passwordData.confirm) {
    alert('Passwords do not match')
    return
  }

  try {
    await api.put('/users/password', {
      currentPassword: passwordData.current,
      newPassword: passwordData.new
    })
    
    passwordData.current = ''
    passwordData.new = ''
    passwordData.confirm = ''
    alert('Password changed successfully')
  } catch (error) {
    console.error('Failed to change password:', error)
    alert('Failed to change password')
  }
}

function confirmDeleteAccount() {
  if (confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
    deleteAccount()
  }
}

async function deleteAccount() {
  try {
    await api.delete('/users/account')
    authStore.logout()
  } catch (error) {
    console.error('Failed to delete account:', error)
    alert('Failed to delete account')
  }
}

function savePrivacy() {
  localStorage.setItem('privacySettings', JSON.stringify(privacyData))
  alert('Privacy settings saved')
}

function saveNotifications() {
  localStorage.setItem('notificationSettings', JSON.stringify(notificationData))
  alert('Notification settings saved')
}

function saveGameSettings() {
  localStorage.setItem('gameSettings', JSON.stringify(gameData))
  alert('Game settings saved')
}
</script>

<style scoped>
.settings-page {
  min-height: 100vh;
  background: #f0f2f5;
  padding: 2rem 1rem;
}

.settings-container {
  max-width: 900px;
  margin: 0 auto;
}

.settings-header {
  margin-bottom: 2rem;
}

.settings-header h1 {
  margin: 0;
  font-size: 1.75rem;
}

/* Navigation */
.settings-nav {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
  overflow-x: auto;
  padding-bottom: 0.5rem;
}

.nav-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.875rem 1.5rem;
  background: white;
  border: 2px solid transparent;
  border-radius: 12px;
  cursor: pointer;
  font-weight: 600;
  color: #65676b;
  white-space: nowrap;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.nav-btn:hover {
  background: #f8f9fa;
  border-color: rgba(102, 126, 234, 0.2);
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.08);
}

.nav-btn.active {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-color: transparent;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
  transform: translateY(-2px);
}

.nav-icon {
  font-size: 1.2rem;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1));
}

/* Content */
.settings-content {
  background: white;
  border-radius: 16px;
  padding: 2rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05), 0 10px 15px -3px rgba(0, 0, 0, 0.05);
  border: 1px solid rgba(0, 0, 0, 0.05);
}

.settings-section h2 {
  margin: 0 0 1.5rem;
  font-size: 1.25rem;
}

/* Profile Photo */
.profile-photo-section {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  margin-bottom: 2rem;
  padding-bottom: 2rem;
  border-bottom: 1px solid #e4e6e9;
}

.profile-photo {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  object-fit: cover;
}

.photo-actions {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

/* Form Elements */
.form-group {
  margin-bottom: 1.25rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 600;
  color: #333;
}

.form-input {
  width: 100%;
  padding: 0.75rem 1rem;
  border: 1px solid #e4e6e9;
  border-radius: 8px;
  font-size: 1rem;
  transition: border-color 0.2s;
}

.form-input:focus {
  outline: none;
  border-color: #667eea;
}

.form-hint {
  font-size: 0.85rem;
  color: #65676b;
  margin-top: 0.25rem;
  display: block;
}

.form-select {
  padding: 0.5rem 1rem;
  border: 1px solid #e4e6e9;
  border-radius: 8px;
  font-size: 0.9rem;
  background: white;
  cursor: pointer;
}

.form-actions {
  margin-top: 2rem;
  padding-top: 1.5rem;
  border-top: 1px solid #e4e6e9;
}

/* Settings Card */
.settings-card {
  background: #f8f9fa;
  border-radius: 12px;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
}

.settings-card h3 {
  margin: 0 0 1rem;
  font-size: 1rem;
}

.settings-card p {
  color: #65676b;
  margin: 0.5rem 0 1rem;
}

.danger-zone {
  background: #fef2f2;
  border: 1px solid #fecaca;
}

.danger-zone h3 {
  color: #dc2626;
}

/* Setting Row */
.setting-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 0;
  border-bottom: 1px solid #e4e6e9;
}

.setting-row:last-child {
  border-bottom: none;
}

.setting-info h4 {
  margin: 0;
  font-size: 0.95rem;
}

.setting-info p {
  margin: 0.25rem 0 0;
  font-size: 0.85rem;
  color: #65676b;
}

/* Toggle Switch */
.toggle {
  position: relative;
  display: inline-block;
  width: 50px;
  height: 28px;
}

.toggle input {
  opacity: 0;
  width: 0;
  height: 0;
}

.toggle-slider {
  position: absolute;
  cursor: pointer;
  inset: 0;
  background: #ccc;
  border-radius: 28px;
  transition: 0.3s;
}

.toggle-slider::before {
  position: absolute;
  content: "";
  height: 22px;
  width: 22px;
  left: 3px;
  bottom: 3px;
  background: white;
  border-radius: 50%;
  transition: 0.3s;
}

.toggle input:checked + .toggle-slider {
  background: #667eea;
}

.toggle input:checked + .toggle-slider::before {
  transform: translateX(22px);
}

/* Range Input */
.range-input {
  width: 150px;
  margin-right: 1rem;
}

.range-value {
  font-size: 0.9rem;
  color: #65676b;
  min-width: 40px;
  text-align: right;
}

/* Buttons */
.btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-primary {
  background: #667eea;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background: #5a6fd6;
}

.btn-primary:disabled {
  background: #a5b4fc;
  cursor: not-allowed;
}

.btn-secondary {
  background: #e4e6e9;
  color: #333;
}

.btn-secondary:hover {
  background: #d8dadc;
}

.btn-danger {
  background: #dc2626;
  color: white;
}

.btn-danger:hover {
  background: #b91c1c;
}

.btn-text {
  background: none;
  color: #65676b;
  padding: 0.5rem;
}

.btn-text:hover {
  color: #333;
}

/* Responsive */
@media (max-width: 640px) {
  .settings-nav {
    flex-wrap: nowrap;
  }

  .nav-btn {
    padding: 0.5rem 1rem;
    font-size: 0.9rem;
  }

  .nav-btn span:last-child {
    display: none;
  }

  .profile-photo-section {
    flex-direction: column;
    text-align: center;
  }

  .setting-row {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.75rem;
  }
}
</style>
