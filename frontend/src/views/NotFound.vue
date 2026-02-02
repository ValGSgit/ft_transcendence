<template>
  <div class="not-found-page">
    <div class="content">
      <div class="alpaca-404">
        <span class="alpaca-emoji">🦙</span>
        <span class="question-marks">???</span>
      </div>
      <h1>404</h1>
      <h2>Page Not Found</h2>
      <p>Oops! This alpaca wandered off and couldn't find the page you're looking for.</p>
      <div class="actions">
        <router-link to="/" class="btn btn-primary">
          🏠 Go Home
        </router-link>
        <router-link to="/game" class="btn btn-secondary">
          🎮 Play Game
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
</script>

<style scoped>
.not-found-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 2rem;
}

.content {
  text-align: center;
  color: white;
}

.alpaca-404 {
  position: relative;
  margin-bottom: 1rem;
}

.alpaca-emoji {
  font-size: 8rem;
  display: block;
  animation: bounce 2s ease-in-out infinite;
}

.question-marks {
  position: absolute;
  top: -1rem;
  right: 50%;
  transform: translateX(80%);
  font-size: 2rem;
  animation: float 1.5s ease-in-out infinite;
}

@keyframes bounce {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-15px);
  }
}

@keyframes float {
  0%, 100% {
    transform: translateX(80%) translateY(0);
    opacity: 1;
  }
  50% {
    transform: translateX(80%) translateY(-10px);
    opacity: 0.7;
  }
}

h1 {
  font-size: 6rem;
  margin: 0;
  font-weight: bold;
  text-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
}

h2 {
  font-size: 2rem;
  margin: 0.5rem 0 1rem;
  font-weight: 600;
}

p {
  font-size: 1.1rem;
  opacity: 0.9;
  max-width: 400px;
  margin: 0 auto 2rem;
}

.actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
  flex-wrap: wrap;
}

.btn {
  padding: 1rem 2rem;
  border-radius: 12px;
  font-weight: 600;
  font-size: 1rem;
  text-decoration: none;
  transition: all 0.2s;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
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
  background: rgba(255, 255, 255, 0.2);
  color: white;
  border: 2px solid rgba(255, 255, 255, 0.3);
}

.btn-secondary:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: translateY(-2px);
}

@media (max-width: 480px) {
  .alpaca-emoji {
    font-size: 5rem;
  }

  h1 {
    font-size: 4rem;
  }

  h2 {
    font-size: 1.5rem;
  }
}
</style>
