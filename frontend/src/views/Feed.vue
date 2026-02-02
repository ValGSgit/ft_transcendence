<template>
  <div class="feed-page">
    <!-- Create Post -->
    <div class="create-post card">
      <div class="create-post-header">
        <img :src="currentUser?.avatar || defaultAvatar" :alt="currentUser?.username" class="avatar" />
        <button class="create-post-input" @click="showCreateModal = true">
          What's on your mind, {{ currentUser?.username }}?
        </button>
      </div>
      <div class="create-post-actions">
        <button class="action-btn" @click="showCreateModal = true; postType = 'photo'">
          📷 Photo
        </button>
        <button class="action-btn" @click="showCreateModal = true; postType = 'farm'">
          🦙 Farm Update
        </button>
        <button class="action-btn" @click="showCreateModal = true; postType = 'achievement'">
          🏆 Achievement
        </button>
      </div>
    </div>

    <!-- Posts Feed -->
    <div class="posts-feed">
      <div v-if="loading && posts.length === 0" class="loading-state">
        <div class="spinner-large"></div>
        <p>Loading feed...</p>
      </div>

      <TransitionGroup name="post" tag="div">
        <PostCard
          v-for="post in posts"
          :key="post.id"
          :post="post"
          @like="handleLike"
          @comment="handleComment"
          @share="handleShare"
          @delete="handleDelete"
        />
      </TransitionGroup>

      <div v-if="!loading && posts.length === 0" class="empty-state">
        <span class="empty-icon">📭</span>
        <h3>No posts yet</h3>
        <p>Be the first to share something with your friends!</p>
        <button class="btn btn-primary" @click="showCreateModal = true">
          Create First Post
        </button>
      </div>

      <div v-if="hasMore && posts.length > 0" class="load-more">
        <button class="btn btn-secondary" @click="loadMore" :disabled="loading">
          {{ loading ? 'Loading...' : 'Load More' }}
        </button>
      </div>
    </div>

    <!-- Create Post Modal -->
    <Teleport to="body">
      <div v-if="showCreateModal" class="modal-overlay" @click.self="closeModal">
        <div class="modal create-post-modal">
          <div class="modal-header">
            <h2>Create Post</h2>
            <button class="close-btn" @click="closeModal">×</button>
          </div>
          
          <div class="modal-body">
            <div class="post-author">
              <img :src="currentUser?.avatar || defaultAvatar" :alt="currentUser?.username" class="avatar" />
              <div>
                <span class="author-name">{{ currentUser?.username }}</span>
                <select v-model="newPost.visibility" class="visibility-select">
                  <option value="public">🌍 Public</option>
                  <option value="friends">👥 Friends</option>
                  <option value="private">🔒 Only me</option>
                </select>
              </div>
            </div>

            <textarea
              v-model="newPost.content"
              :placeholder="getPlaceholder()"
              class="post-textarea"
              rows="4"
              ref="postTextarea"
            ></textarea>

            <div v-if="newPost.image" class="image-preview">
              <img :src="newPost.image" alt="Preview" />
              <button class="remove-image" @click="newPost.image = null">×</button>
            </div>

            <div class="post-attachments">
              <button class="attachment-btn" @click="triggerImageUpload">
                📷 Photo
              </button>
              <button class="attachment-btn" @click="attachFarmData">
                🦙 Farm Stats
              </button>
              <button class="attachment-btn">
                😊 Feeling
              </button>
              <input type="file" ref="imageInput" @change="handleImageUpload" accept="image/*" hidden />
            </div>
          </div>

          <div class="modal-footer">
            <button 
              class="btn btn-primary btn-block" 
              @click="submitPost"
              :disabled="!newPost.content.trim() || submitting"
            >
              {{ submitting ? 'Posting...' : 'Post' }}
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, nextTick } from 'vue'
import { useAuthStore } from '../stores/auth'
import { useSocialStore } from '../stores/social'
import PostCard from '../components/PostCard.vue'

const authStore = useAuthStore()
const socialStore = useSocialStore()

const currentUser = computed(() => authStore.currentUser)
const posts = computed(() => socialStore.posts)
const loading = computed(() => socialStore.loading)
const hasMore = computed(() => socialStore.hasMore)

const defaultAvatar = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="50" fill="%23667eea"/><text x="50" y="65" text-anchor="middle" fill="white" font-size="40">🦙</text></svg>'

const showCreateModal = ref(false)
const postType = ref('text')
const submitting = ref(false)
const postTextarea = ref(null)
const imageInput = ref(null)

const newPost = ref({
  content: '',
  visibility: 'public',
  image: null,
  type: 'text',
  farmData: null
})

onMounted(async () => {
  await socialStore.fetchPosts(1, true)
})

function getPlaceholder() {
  const placeholders = {
    text: `What's on your mind, ${currentUser.value?.username}?`,
    photo: 'Add a caption to your photo...',
    farm: 'Share what happened on your farm today...',
    achievement: 'Tell everyone about your achievement!'
  }
  return placeholders[postType.value] || placeholders.text
}

function closeModal() {
  showCreateModal.value = false
  newPost.value = {
    content: '',
    visibility: 'public',
    image: null,
    type: 'text',
    farmData: null
  }
  postType.value = 'text'
}

function triggerImageUpload() {
  imageInput.value?.click()
}

function handleImageUpload(event) {
  const file = event.target.files?.[0]
  if (file) {
    const reader = new FileReader()
    reader.onload = (e) => {
      newPost.value.image = e.target.result
      postType.value = 'photo'
    }
    reader.readAsDataURL(file)
  }
}

function attachFarmData() {
  // Get farm data from localStorage (saved by the game)
  const farmData = localStorage.getItem('alpacaFarm')
  if (farmData) {
    newPost.value.farmData = JSON.parse(farmData)
    postType.value = 'farm'
    newPost.value.content = `🦙 Check out my farm! I have ${newPost.value.farmData.alpacas?.length || 0} alpacas and ${newPost.value.farmData.score || 0} coins!`
  } else {
    newPost.value.content = '🦙 Just started my alpaca farm adventure!'
    postType.value = 'farm'
  }
}

async function submitPost() {
  if (!newPost.value.content.trim()) return

  submitting.value = true
  try {
    await socialStore.createPost({
      content: newPost.value.content,
      type: postType.value,
      visibility: newPost.value.visibility,
      image: newPost.value.image,
      farmData: newPost.value.farmData
    })
    closeModal()
  } catch (err) {
    console.error('Failed to create post:', err)
  } finally {
    submitting.value = false
  }
}

async function loadMore() {
  const nextPage = socialStore.currentPage + 1
  await socialStore.fetchPosts(nextPage)
}

function handleLike(postId) {
  socialStore.likePost(postId)
}

function handleComment(postId, content) {
  socialStore.commentOnPost(postId, content)
}

function handleShare(post) {
  // TODO: Implement share functionality
  console.log('Share post:', post)
}

function handleDelete(postId) {
  if (confirm('Are you sure you want to delete this post?')) {
    socialStore.deletePost(postId)
  }
}
</script>

<style scoped>
.feed-page {
  max-width: 680px;
  margin: 0 auto;
  padding: 1rem;
}

.card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  margin-bottom: 1rem;
}

/* Create Post */
.create-post {
  padding: 1rem;
}

.create-post-header {
  display: flex;
  gap: 0.75rem;
  margin-bottom: 0.75rem;
}

.avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
}

.create-post-input {
  flex: 1;
  padding: 0.75rem 1rem;
  background: #f0f2f5;
  border: none;
  border-radius: 20px;
  text-align: left;
  color: #65676b;
  cursor: pointer;
  font-size: 1rem;
  transition: background 0.2s;
}

.create-post-input:hover {
  background: #e4e6e9;
}

.create-post-actions {
  display: flex;
  gap: 0.5rem;
  padding-top: 0.75rem;
  border-top: 1px solid #e4e6e9;
}

.action-btn {
  flex: 1;
  padding: 0.5rem;
  background: none;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 0.9rem;
  color: #65676b;
  transition: background 0.2s;
}

.action-btn:hover {
  background: #f0f2f5;
}

/* Posts Feed */
.posts-feed {
  margin-top: 1rem;
}

.loading-state,
.empty-state {
  text-align: center;
  padding: 3rem 1rem;
  background: white;
  border-radius: 12px;
}

.spinner-large {
  width: 48px;
  height: 48px;
  border: 4px solid #e4e6e9;
  border-top-color: #667eea;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 1rem;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.empty-icon {
  font-size: 4rem;
  display: block;
  margin-bottom: 1rem;
}

.empty-state h3 {
  margin-bottom: 0.5rem;
  color: #333;
}

.empty-state p {
  color: #65676b;
  margin-bottom: 1.5rem;
}

.load-more {
  text-align: center;
  padding: 1rem;
}

/* Post Transitions */
.post-enter-active,
.post-leave-active {
  transition: all 0.3s ease;
}

.post-enter-from {
  opacity: 0;
  transform: translateY(-20px);
}

.post-leave-to {
  opacity: 0;
  transform: translateX(-100%);
}

/* Modal */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
}

.modal {
  background: white;
  border-radius: 12px;
  width: 100%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  border-bottom: 1px solid #e4e6e9;
}

.modal-header h2 {
  font-size: 1.25rem;
  margin: 0;
}

.close-btn {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: #e4e6e9;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.close-btn:hover {
  background: #d8dadf;
}

.modal-body {
  padding: 1rem;
}

.post-author {
  display: flex;
  gap: 0.75rem;
  align-items: center;
  margin-bottom: 1rem;
}

.author-name {
  font-weight: 600;
  display: block;
}

.visibility-select {
  font-size: 0.8rem;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  border: 1px solid #ddd;
  background: #f0f2f5;
  cursor: pointer;
}

.post-textarea {
  width: 100%;
  border: none;
  font-size: 1.25rem;
  resize: none;
  padding: 0;
  min-height: 100px;
}

.post-textarea:focus {
  outline: none;
}

.post-textarea::placeholder {
  color: #65676b;
}

.image-preview {
  position: relative;
  margin: 1rem 0;
  border-radius: 8px;
  overflow: hidden;
}

.image-preview img {
  width: 100%;
  max-height: 300px;
  object-fit: cover;
}

.remove-image {
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.6);
  color: white;
  border: none;
  font-size: 1.25rem;
  cursor: pointer;
}

.post-attachments {
  display: flex;
  gap: 0.5rem;
  padding: 0.75rem;
  background: #f0f2f5;
  border-radius: 8px;
  margin-top: 1rem;
}

.attachment-btn {
  flex: 1;
  padding: 0.5rem;
  background: white;
  border: 1px solid #ddd;
  border-radius: 8px;
  cursor: pointer;
  font-size: 0.85rem;
  transition: background 0.2s;
}

.attachment-btn:hover {
  background: #f8f9fa;
}

.modal-footer {
  padding: 1rem;
  border-top: 1px solid #e4e6e9;
}

/* Buttons */
.btn {
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  border: none;
  transition: all 0.2s;
}

.btn-block {
  width: 100%;
}

.btn-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.btn-primary:hover:not(:disabled) {
  opacity: 0.9;
}

.btn-primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-secondary {
  background: #e4e6e9;
  color: #333;
}

.btn-secondary:hover {
  background: #d8dadf;
}

@media (max-width: 768px) {
  .feed-page {
    padding: 0.5rem;
  }

  .create-post-actions {
    flex-wrap: wrap;
  }

  .action-btn {
    flex: 1 1 calc(33.333% - 0.5rem);
    font-size: 0.8rem;
  }
}
</style>
