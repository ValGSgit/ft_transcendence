<template>
  <article class="post-card card">
    <!-- Post Header -->
    <header class="post-header">
      <router-link :to="`/profile/${postAuthor.username}`" class="author-link">
        <img :src="postAuthor.avatar || defaultAvatar" :alt="postAuthor.username" class="avatar" />
      </router-link>
      <div class="post-meta">
        <router-link :to="`/profile/${postAuthor.username}`" class="author-name">
          {{ postAuthor.username }}
        </router-link>
        <div class="post-info">
          <span class="post-time">{{ formatTime(post.createdAt || post.created_at) }}</span>
          <span v-if="post.visibility" class="visibility-icon">
            {{ visibilityIcon }}
          </span>
        </div>
      </div>
      <div class="post-menu" v-if="isAuthor">
        <button class="menu-btn" @click="showMenu = !showMenu">⋯</button>
        <div v-if="showMenu" class="menu-dropdown">
          <button @click="editPost">✏️ Edit</button>
          <button @click="$emit('delete', post.id)" class="danger">🗑️ Delete</button>
        </div>
      </div>
    </header>

    <!-- Post Content -->
    <div class="post-content">
      <p v-if="post.content" class="post-text" :class="{ expanded: isExpanded }">
        {{ displayContent }}
        <button v-if="isLongContent" class="see-more" @click="isExpanded = !isExpanded">
          {{ isExpanded ? 'See less' : 'See more' }}
        </button>
      </p>

      <!-- Farm Data Card -->
      <div v-if="farmData" class="farm-card">
        <div class="farm-header">
          <span class="farm-icon">🦙</span>
          <span class="farm-title">{{ postAuthor.username }}'s Farm</span>
        </div>
        <div class="farm-stats">
          <div class="farm-stat">
            <span class="stat-value">{{ farmData.alpacas?.length || farmData.alpacas || 0 }}</span>
            <span class="stat-label">Alpacas</span>
          </div>
          <div class="farm-stat">
            <span class="stat-value">{{ farmData.score || farmData.coins || 0 }}</span>
            <span class="stat-label">Coins</span>
          </div>
          <div class="farm-stat">
            <span class="stat-value">{{ farmData.decorations?.length || farmData.decorations || 0 }}</span>
            <span class="stat-label">Decorations</span>
          </div>
        </div>
        <button class="btn btn-farm" @click="visitFarm">
          🎮 Visit Farm
        </button>
      </div>

      <!-- Post Image -->
      <div v-if="post.image" class="post-image">
        <img :src="post.image" :alt="post.content" @click="showImageModal = true" />
      </div>
    </div>

    <!-- Engagement Stats -->
    <div v-if="hasEngagement" class="engagement-stats">
      <div class="likes-count" v-if="likesCount > 0">
        <span class="reaction-icons">❤️</span>
        <span>{{ likesCount }}</span>
      </div>
      <div class="comments-count" v-if="commentsCount > 0" @click="showComments = true">
        {{ commentsCount }} comments
      </div>
    </div>

    <!-- Action Buttons -->
    <div class="post-actions">
      <button 
        class="action-btn" 
        :class="{ active: isLiked }"
        @click="$emit('like', post.id)"
      >
        {{ isLiked ? '❤️' : '🤍' }} Like
      </button>
      <button class="action-btn" @click="toggleComments">
        💬 Comment
      </button>
      <button class="action-btn" @click="$emit('share', post)">
        🔗 Share
      </button>
    </div>

    <!-- Comments Section -->
    <div v-if="showComments" class="comments-section">
      <!-- Comment Input -->
      <div class="comment-input">
        <img :src="currentUser?.avatar || defaultAvatar" class="avatar-small" />
        <div class="input-wrapper">
          <input
            v-model="newComment"
            @keyup.enter="submitComment"
            placeholder="Write a comment..."
            class="comment-field"
          />
          <button 
            class="send-btn" 
            @click="submitComment"
            :disabled="!newComment.trim()"
          >
            ➤
          </button>
        </div>
      </div>

      <!-- Comments List -->
      <div class="comments-list">
        <div v-for="comment in displayedComments" :key="comment.id" class="comment">
          <router-link :to="`/profile/${normalizeCommentAuthor(comment).username}`">
            <img :src="normalizeCommentAuthor(comment).avatar || defaultAvatar" class="avatar-small" />
          </router-link>
          <div class="comment-bubble">
            <router-link :to="`/profile/${normalizeCommentAuthor(comment).username}`" class="comment-author">
              {{ normalizeCommentAuthor(comment).username }}
            </router-link>
            <p class="comment-text">{{ comment.content }}</p>
            <div class="comment-meta">
              <span class="comment-time">{{ formatTime(comment.createdAt || comment.created_at) }}</span>
              <button class="comment-action">Like</button>
              <button class="comment-action">Reply</button>
            </div>
          </div>
        </div>
        
        <button 
          v-if="commentsCount > 3 && !showAllComments" 
          class="view-more-comments"
          @click="showAllComments = true"
        >
          View {{ commentsCount - 3 }} more comments
        </button>
      </div>
    </div>
  </article>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useAuthStore } from '../stores/auth'
import { socketService } from '../services/socket'

const props = defineProps({
  post: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['like', 'comment', 'share', 'delete', 'edit', 'loadComments'])

const authStore = useAuthStore()
const currentUser = computed(() => authStore.currentUser)

const defaultAvatar = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="50" fill="%23667eea"/><text x="50" y="65" text-anchor="middle" fill="white" font-size="40">🦙</text></svg>'

const showMenu = ref(false)
const showComments = ref(false)
const showAllComments = ref(false)
const showImageModal = ref(false)
const isExpanded = ref(false)
const newComment = ref('')

// Normalize author data - supports both {author: {username, avatar}} and {username, avatar} formats
const postAuthor = computed(() => {
  const p = props.post
  if (p.author) {
    return p.author
  }
  return {
    id: p.user_id,
    username: p.username,
    avatar: p.avatar
  }
})

const isAuthor = computed(() => 
  currentUser.value?.id === postAuthor.value.id || currentUser.value?.id === props.post.user_id
)

const isLiked = computed(() => {
  const p = props.post
  // Check various ways the like status might be indicated
  if (p.user_liked !== undefined) return !!p.user_liked
  if (p.likes && Array.isArray(p.likes)) return p.likes.includes(currentUser.value?.id)
  return false
})

const likesCount = computed(() => {
  const p = props.post
  if (p.likes_count !== undefined) return p.likes_count
  if (p.likes && Array.isArray(p.likes)) return p.likes.length
  return 0
})

const commentsCount = computed(() => {
  const p = props.post
  if (p.comments_count !== undefined) return p.comments_count
  if (p.comments && Array.isArray(p.comments)) return p.comments.length
  return 0
})

const hasEngagement = computed(() => 
  likesCount.value > 0 || commentsCount.value > 0
)

const isLongContent = computed(() => 
  props.post.content?.length > 300
)

const displayContent = computed(() => {
  if (!props.post.content) return ''
  if (isExpanded.value || !isLongContent.value) {
    return props.post.content
  }
  return props.post.content.slice(0, 300) + '...'
})

const displayedComments = computed(() => {
  if (!props.post.comments) return []
  if (showAllComments.value) return props.post.comments
  return props.post.comments.slice(-3)
})

// Normalize comment author data
const normalizeCommentAuthor = (comment) => {
  if (!comment) return { id: null, username: 'Unknown', avatar: null }
  if (comment.author) return comment.author
  return {
    id: comment.user_id || null,
    username: comment.username || 'Unknown',
    avatar: comment.avatar || null
  }
}

const visibilityIcon = computed(() => {
  const icons = {
    public: '🌍',
    friends: '👥',
    private: '🔒'
  }
  return icons[props.post.visibility] || '🌍'
})

// Farm data - normalize between different field names
const farmData = computed(() => {
  const p = props.post
  if (p.farmData) return p.farmData
  if (p.farm_data) return typeof p.farm_data === 'string' ? JSON.parse(p.farm_data) : p.farm_data
  return null
})

function formatTime(dateString) {
  if (!dateString) return ''
  
  const date = new Date(dateString)
  
  // Check if date is invalid
  if (isNaN(date.getTime())) return ''
  
  const now = new Date()
  const diffMs = now - date
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMins / 60)
  const diffDays = Math.floor(diffHours / 24)

  if (diffMins < 1) return 'Just now'
  if (diffMins < 60) return `${diffMins}m`
  if (diffHours < 24) return `${diffHours}h`
  if (diffDays < 7) return `${diffDays}d`
  
  return date.toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric' 
  })
}

function toggleComments() {
  showComments.value = !showComments.value
  // If opening comments and no comments loaded yet, emit event to load them
  if (showComments.value && (!props.post.comments || props.post.comments.length === 0) && commentsCount.value > 0) {
    emit('loadComments', props.post.id)
  }
}

function submitComment() {
  if (!newComment.value.trim()) return
  emit('comment', props.post.id, newComment.value)
  newComment.value = ''
}

function editPost() {
  showMenu.value = false
  emit('edit', props.post)
}

function visitFarm() {
  socketService.visitFarm(postAuthor.value.id)
}
</script>

<style scoped>
.post-card {
  background: var(--bg-card);
  border-radius: 12px;
  box-shadow: var(--shadow);
  margin-bottom: 1rem;
  overflow: hidden;
}

/* Header */
.post-header {
  display: flex;
  align-items: center;
  padding: 1rem;
  gap: 0.75rem;
}

.author-link {
  text-decoration: none;
}

.avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
}

.post-meta {
  flex: 1;
}

.author-name {
  font-weight: 600;
  color: var(--text-primary);
  text-decoration: none;
}

.author-name:hover {
  text-decoration: underline;
}

.post-info {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.8rem;
  color: var(--text-secondary);
}

.post-menu {
  position: relative;
}

.menu-btn {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: none;
  border: none;
  cursor: pointer;
  font-size: 1.25rem;
  color: var(--text-secondary);
}

.menu-btn:hover {
  background: var(--bg-tertiary);
}

.menu-dropdown {
  position: absolute;
  right: 0;
  top: 100%;
  background: var(--bg-card);
  border-radius: 8px;
  box-shadow: var(--shadow-lg);
  overflow: hidden;
  z-index: 10;
  min-width: 150px;
}

.menu-dropdown button {
  display: block;
  width: 100%;
  padding: 0.75rem 1rem;
  background: none;
  border: none;
  text-align: left;
  cursor: pointer;
  color: var(--text-primary);
}

.menu-dropdown button:hover {
  background: var(--bg-hover);
}

.menu-dropdown button.danger {
  color: #dc2626;
}

/* Content */
.post-content {
  padding: 0 1rem;
}

.post-text {
  font-size: 1rem;
  line-height: 1.5;
  color: var(--text-primary);
  white-space: pre-wrap;
  word-break: break-word;
}

.see-more {
  background: none;
  border: none;
  color: var(--text-secondary);
  font-weight: 600;
  cursor: pointer;
  padding: 0;
  font-size: inherit;
}

.see-more:hover {
  text-decoration: underline;
}

/* Farm Card */
.farm-card {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 12px;
  padding: 1rem;
  margin: 1rem 0;
  color: white;
}

.farm-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.farm-icon {
  font-size: 1.5rem;
}

.farm-title {
  font-weight: 600;
}

.farm-stats {
  display: flex;
  justify-content: space-around;
  margin-bottom: 1rem;
}

.farm-stat {
  text-align: center;
}

.stat-value {
  display: block;
  font-size: 1.5rem;
  font-weight: bold;
}

.stat-label {
  font-size: 0.8rem;
  opacity: 0.9;
}

.btn-farm {
  width: 100%;
  padding: 0.75rem;
  background: rgba(255, 255, 255, 0.2);
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
}

.btn-farm:hover {
  background: rgba(255, 255, 255, 0.3);
}

/* Post Image */
.post-image {
  margin: 1rem -1rem 0;
}

.post-image img {
  width: 100%;
  max-height: 500px;
  object-fit: cover;
  cursor: pointer;
}

/* Engagement Stats */
.engagement-stats {
  display: flex;
  justify-content: space-between;
  padding: 0.75rem 1rem;
  color: var(--text-secondary);
  font-size: 0.9rem;
}

.likes-count {
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.reaction-icons {
  font-size: 1rem;
}

.comments-count {
  cursor: pointer;
}

.comments-count:hover {
  text-decoration: underline;
}

/* Actions */
.post-actions {
  display: flex;
  border-top: 1px solid var(--border-color);
  padding: 0.25rem;
}

.action-btn {
  flex: 1;
  padding: 0.75rem;
  background: none;
  border: none;
  cursor: pointer;
  font-size: 0.9rem;
  color: var(--text-secondary);
  font-weight: 600;
  border-radius: 4px;
  transition: background 0.2s;
}

.action-btn:hover {
  background: var(--bg-tertiary);
}

.action-btn.active {
  color: #e74c3c;
}

/* Comments */
.comments-section {
  padding: 0.5rem 1rem 1rem;
  border-top: 1px solid var(--border-color);
}

.comment-input {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 0.75rem;
}

.avatar-small {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  object-fit: cover;
}

.input-wrapper {
  flex: 1;
  display: flex;
  background: var(--bg-tertiary);
  border-radius: 20px;
  overflow: hidden;
}

.comment-field {
  flex: 1;
  padding: 0.5rem 1rem;
  background: none;
  border: none;
  font-size: 0.9rem;
  color: var(--text-primary);
}

.comment-field:focus {
  outline: none;
}

.comment-field::placeholder {
  color: var(--text-tertiary);
}

.send-btn {
  padding: 0 1rem;
  background: none;
  border: none;
  color: var(--primary);
  cursor: pointer;
  font-size: 1rem;
}

.send-btn:disabled {
  color: var(--text-tertiary);
  cursor: not-allowed;
}

.comments-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.comment {
  display: flex;
  gap: 0.5rem;
}

.comment-bubble {
  background: var(--bg-tertiary);
  padding: 0.5rem 0.75rem;
  border-radius: 18px;
  max-width: 80%;
}

.comment-author {
  font-weight: 600;
  font-size: 0.85rem;
  color: var(--text-primary);
  text-decoration: none;
}

.comment-author:hover {
  text-decoration: underline;
}

.comment-text {
  font-size: 0.9rem;
  margin: 0.25rem 0 0;
  color: var(--text-primary);
}

.comment-meta {
  display: flex;
  gap: 0.75rem;
  margin-top: 0.25rem;
  font-size: 0.75rem;
}

.comment-time {
  color: var(--text-secondary);
}

.comment-action {
  background: none;
  border: none;
  color: var(--text-secondary);
  font-weight: 600;
  cursor: pointer;
  padding: 0;
}

.comment-action:hover {
  text-decoration: underline;
}

.view-more-comments {
  background: none;
  border: none;
  color: var(--text-secondary);
  font-weight: 600;
  cursor: pointer;
  padding: 0.5rem 0;
  font-size: 0.9rem;
}

.view-more-comments:hover {
  text-decoration: underline;
}
</style>
