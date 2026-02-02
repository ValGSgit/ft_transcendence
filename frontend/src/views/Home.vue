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
  alpacas: 1,
  coins: 0,
  visits: 0
})

onMounted(async () => {
  if (isAuthenticated.value) {
    try {
      const response = await api.get('/users/me')
      const stats = response.data.data.stats
      
      // Map backend stats to frontend display
      userStats.value = {
        friends: 0, // TODO: Count friends from friends API
        alpacas: stats.farm_alpacas || 1,
        coins: stats.farm_coins || 0,
        visits: stats.farm_visits || 0
      }
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
  animation: fadeInUp 0.8s ease-out;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.hero h1 {
  font-size: 3.5rem;
  margin-bottom: 1rem;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.2);
  font-weight: 800;
  line-height: 1.2;
}

.tagline {
  font-size: 1.5rem;
  opacity: 0.9;
  margin-bottom: 2rem;
  font-weight: 300;
  line-height: 1.6;
}

.hero-actions {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
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
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;
  border: none;
  position: relative;
  overflow: hidden;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.btn::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 0;
  height: 0;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.2);
  transform: translate(-50%, -50%);
  transition: width 0.6s, height 0.6s;
}

.btn:hover::before {
  width: 300px;
  height: 300px;
}

.btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.15);
}

.btn:active {
  transform: translateY(0);
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
  border-radius: 16px;
  text-align: center;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.07), 0 10px 15px -3px rgba(0, 0, 0, 0.05);
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  border: 1px solid rgba(0, 0, 0, 0.05);
  position: relative;
  overflow: hidden;
}

.feature-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(102, 126, 234, 0.1), transparent);
  transition: left 0.5s;
}

.feature-card:hover::before {
  left: 100%;
}

.feature-card:hover {
  transform: translateY(-8px) scale(1.02);
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  border-color: rgba(102, 126, 234, 0.2);
}

.feature-icon {
  font-size: 3.5rem;
  display: block;
  margin-bottom: 1rem;
  filter: drop-shadow(0 4px 6px rgba(0, 0, 0, 0.1));
  transition: transform 0.3s;
}

.feature-card:hover .feature-icon {
  transform: scale(1.1) rotate(5deg);
}

.feature-card h3 {
  color: #333;
  margin-bottom: 0.75rem;
  font-size: 1.25rem;
  font-weight: 700;
}

.feature-card p {
  color: #666;
  line-height: 1.6;
  font-size: 0.95rem;
}

/* Stats Section */
.stats {
  padding: 4rem 2rem;
  background: linear-gradient(180deg, white 0%, #f8f9fa 100%);
}

.stats h2 {
  text-align: center;
  font-size: 2.5rem;
  margin-bottom: 3rem;
  color: #333;
  font-weight: 700;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 2rem;
  max-width: 900px;
  margin: 0 auto;
}

.stat-card {
  text-align: center;
  padding: 2rem 1.5rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 16px;
  color: white;
  box-shadow: 0 10px 25px rgba(102, 126, 234, 0.3);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
}

.stat-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.2) 0%, transparent 100%);
  opacity: 0;
  transition: opacity 0.3s;
}

.stat-card:hover::before {
  opacity: 1;
}

.stat-card:hover {
  transform: translateY(-5px) scale(1.05);
  box-shadow: 0 15px 35px rgba(102, 126, 234, 0.4);
}

.stat-value {
  display: block;
  font-size: 3rem;
  font-weight: 800;
  margin-bottom: 0.5rem;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.stat-label {
  font-size: 1rem;
  opacity: 0.95;
  text-transform: uppercase;
  letter-spacing: 1px;
  font-weight: 600;
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
