<template>
  <div class="home">
    <!-- Hero Section -->
    <section class="hero">
      <div class="hero-content">
        <h1>🦙 Alpaca Social</h1>
        <p class="tagline">Build your farm, connect with friends, share your adventures!</p>
        
        <div class="hero-actions" v-if="!isAuthenticated">
          <router-link to="/register" class="btn btn-primary btn-lg">
            Get Started
          </router-link>
          <router-link to="/login" class="btn btn-secondary btn-lg">
            Sign In
          </router-link>
        </div>
        
        <div class="hero-actions" v-else>
          <router-link to="/game" class="btn btn-primary btn-lg">
            🎮 Play Now
          </router-link>
          <router-link to="/feed" class="btn btn-secondary btn-lg">
            📰 View Feed
          </router-link>
        </div>
      </div>
      
      <div class="hero-visual">
        <div class="floating-alpaca">🦙</div>
        <div class="floating-coin">🪙</div>
        <div class="floating-tree">🌲</div>
      </div>
    </section>

    <!-- Features Section -->
    <section class="features">
      <h2>What You Can Do</h2>
      <div class="feature-grid">
        <div class="feature-card">
          <span class="feature-icon">🏠</span>
          <h3>Build Your Farm</h3>
          <p>Create and customize your own alpaca farm with unique decorations and landscape.</p>
        </div>
        
        <div class="feature-card">
          <span class="feature-icon">🦙</span>
          <h3>Raise Alpacas</h3>
          <p>Care for your alpacas, give them names, and watch them roam your farm.</p>
        </div>
        
        <div class="feature-card">
          <span class="feature-icon">👥</span>
          <h3>Connect with Friends</h3>
          <p>Add friends, visit their farms, and share your progress on the social feed.</p>
        </div>
        
        <div class="feature-card">
          <span class="feature-icon">💬</span>
          <h3>Real-time Chat</h3>
          <p>Chat with friends in real-time while playing or browsing the feed.</p>
        </div>
        
        <div class="feature-card">
          <span class="feature-icon">🏆</span>
          <h3>Earn Achievements</h3>
          <p>Complete challenges, collect coins, and unlock special rewards.</p>
        </div>
        
        <div class="feature-card">
          <span class="feature-icon">🌍</span>
          <h3>Visit Friends</h3>
          <p>Explore other players' farms and see their unique creations.</p>
        </div>
      </div>
    </section>

    <!-- Stats Section -->
    <section class="stats" v-if="isAuthenticated">
      <h2>Your Stats</h2>
      <div class="stats-grid">
        <div class="stat-card">
          <span class="stat-value">{{ userStats.friends || 0 }}</span>
          <span class="stat-label">Friends</span>
        </div>
        <div class="stat-card">
          <span class="stat-value">{{ userStats.alpacas || 0 }}</span>
          <span class="stat-label">Alpacas</span>
        </div>
        <div class="stat-card">
          <span class="stat-value">{{ userStats.coins || 0 }}</span>
          <span class="stat-label">Coins</span>
        </div>
        <div class="stat-card">
          <span class="stat-value">{{ userStats.visits || 0 }}</span>
          <span class="stat-label">Farm Visits</span>
        </div>
      </div>
    </section>

    <!-- CTA Section -->
    <section class="cta" v-if="!isAuthenticated">
      <h2>Ready to start your adventure?</h2>
      <p>Join thousands of players building their dream alpaca farms!</p>
      <router-link to="/register" class="btn btn-primary btn-lg">
        Create Free Account
      </router-link>
    </section>
  </div>
</template>

<script setup>
import { computed, ref, onMounted } from 'vue'
import { useAuthStore } from '../stores/auth'
import api from '../services/api'

const authStore = useAuthStore()
const isAuthenticated = computed(() => authStore.isAuthenticated)

const userStats = ref({
  friends: 0,
  alpacas: 0,
  coins: 0,
  visits: 0
})

onMounted(async () => {
  if (isAuthenticated.value) {
    try {
      const response = await api.get('/users/me/stats')
      userStats.value = response.data.stats
    } catch (err) {
      console.error('Failed to load stats:', err)
    }
  }
})
</script>

<style scoped>
.home {
  min-height: 100vh;
}

/* Hero Section */
.hero {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 4rem 2rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  min-height: 60vh;
  position: relative;
  overflow: hidden;
}

.hero-content {
  max-width: 600px;
  z-index: 1;
}

.hero h1 {
  font-size: 3.5rem;
  margin-bottom: 1rem;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.2);
}

.tagline {
  font-size: 1.5rem;
  opacity: 0.9;
  margin-bottom: 2rem;
}

.hero-actions {
  display: flex;
  gap: 1rem;
}

.hero-visual {
  position: relative;
  width: 300px;
  height: 300px;
}

.floating-alpaca,
.floating-coin,
.floating-tree {
  position: absolute;
  font-size: 4rem;
  animation: float 3s ease-in-out infinite;
}

.floating-alpaca {
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 6rem;
}

.floating-coin {
  top: 20%;
  right: 10%;
  animation-delay: 0.5s;
}

.floating-tree {
  bottom: 20%;
  left: 10%;
  animation-delay: 1s;
}

@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-20px); }
}

/* Buttons */
.btn {
  display: inline-block;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-weight: 600;
  text-decoration: none;
  transition: all 0.3s ease;
  cursor: pointer;
  border: none;
}

.btn-lg {
  padding: 1rem 2rem;
  font-size: 1.1rem;
}

.btn-primary {
  background: white;
  color: #667eea;
}

.btn-primary:hover {
  background: #f0f0f0;
  transform: translateY(-2px);
}

.btn-secondary {
  background: transparent;
  color: white;
  border: 2px solid white;
}

.btn-secondary:hover {
  background: rgba(255, 255, 255, 0.1);
}

/* Features Section */
.features {
  padding: 4rem 2rem;
  background: #f8f9fa;
}

.features h2 {
  text-align: center;
  font-size: 2.5rem;
  margin-bottom: 3rem;
  color: #333;
}

.feature-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 2rem;
  max-width: 1200px;
  margin: 0 auto;
}

.feature-card {
  background: white;
  padding: 2rem;
  border-radius: 12px;
  text-align: center;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease;
}

.feature-card:hover {
  transform: translateY(-5px);
}

.feature-icon {
  font-size: 3rem;
  display: block;
  margin-bottom: 1rem;
}

.feature-card h3 {
  color: #333;
  margin-bottom: 0.5rem;
}

.feature-card p {
  color: #666;
  line-height: 1.6;
}

/* Stats Section */
.stats {
  padding: 4rem 2rem;
  background: white;
}

.stats h2 {
  text-align: center;
  font-size: 2rem;
  margin-bottom: 2rem;
  color: #333;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 2rem;
  max-width: 800px;
  margin: 0 auto;
}

.stat-card {
  text-align: center;
  padding: 1.5rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 12px;
  color: white;
}

.stat-value {
  display: block;
  font-size: 2.5rem;
  font-weight: bold;
}

.stat-label {
  font-size: 0.9rem;
  opacity: 0.9;
}

/* CTA Section */
.cta {
  padding: 4rem 2rem;
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  color: white;
  text-align: center;
}

.cta h2 {
  font-size: 2.5rem;
  margin-bottom: 1rem;
}

.cta p {
  font-size: 1.2rem;
  margin-bottom: 2rem;
  opacity: 0.9;
}

/* Responsive */
@media (max-width: 768px) {
  .hero {
    flex-direction: column;
    text-align: center;
    padding: 2rem;
  }

  .hero h1 {
    font-size: 2.5rem;
  }

  .hero-actions {
    flex-direction: column;
  }

  .hero-visual {
    margin-top: 2rem;
  }

  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>
