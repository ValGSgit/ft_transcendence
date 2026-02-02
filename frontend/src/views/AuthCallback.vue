<template>
  <div class="auth-callback">
    <div class="loading-spinner">
      <div class="spinner"></div>
      <p>Completing authentication...</p>
    </div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

onMounted(async () => {
  const { token, refreshToken } = route.query

  if (token && refreshToken) {
    // Store tokens
    authStore.setTokens(token, refreshToken)
    
    try {
      // Fetch user profile
      await authStore.fetchCurrentUser()
      
      // Redirect to feed
      router.push('/feed')
    } catch (error) {
      console.error('OAuth callback error:', error)
      router.push('/login?error=oauth_failed')
    }
  } else {
    // No tokens, redirect to login
    router.push('/login?error=no_tokens')
  }
})
</script>

<style scoped>
.auth-callback {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #0a0f1e 0%, #1a1f35 100%);
}

.loading-spinner {
  text-align: center;
  color: #00f7ff;
}

.spinner {
  width: 50px;
  height: 50px;
  margin: 0 auto 1rem;
  border: 4px solid rgba(0, 247, 255, 0.1);
  border-top-color: #00f7ff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

p {
  font-size: 1.1rem;
  margin: 0;
}
</style>
