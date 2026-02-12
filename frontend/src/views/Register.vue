<template>
  <div class="auth-page">
    <div class="auth-container">
      <div class="auth-header">
        <router-link to="/" class="logo">🦙 Alpaca Social</router-link>
        <h1>Create Account</h1>
        <p>Start your alpaca farming journey today!</p>
      </div>

      <form @submit.prevent="handleRegister" class="auth-form">
        <div class="form-group">
          <label for="username">Username</label>
          <input
            type="text"
            id="username"
            v-model="form.username"
            placeholder="Choose a unique username"
            required
            :disabled="loading"
            minlength="3"
            maxlength="20"
            pattern="[a-zA-Z0-9_]+"
          />
          <span class="form-hint">3-20 characters, letters, numbers, and underscores only</span>
        </div>

        <div class="form-group">
          <label for="email">Email</label>
          <input
            type="email"
            id="email"
            v-model="form.email"
            placeholder="your@email.com"
            required
            :disabled="loading"
          />
        </div>

        <div class="form-group">
          <label for="password">Password</label>
          <div class="password-input">
            <input
              :type="showPassword ? 'text' : 'password'"
              id="password"
              v-model="form.password"
              placeholder="Create a strong password"
              required
              :disabled="loading"
              minlength="8"
            />
            <button type="button" class="toggle-password" @click="showPassword = !showPassword">
              {{ showPassword ? '🙈' : '👁️' }}
            </button>
          </div>
          <div class="password-strength">
            <div class="strength-bar" :class="passwordStrength.level"></div>
            <span>{{ passwordStrength.text }}</span>
          </div>
        </div>

        <div class="form-group">
          <label for="confirmPassword">Confirm Password</label>
          <input
            :type="showPassword ? 'text' : 'password'"
            id="confirmPassword"
            v-model="form.confirmPassword"
            placeholder="Repeat your password"
            required
            :disabled="loading"
          />
          <span v-if="form.confirmPassword && !passwordsMatch" class="form-error">
            Passwords do not match
          </span>
        </div>

        <div class="form-group">
          <label class="checkbox">
            <input type="checkbox" v-model="form.acceptTerms" required />
            <span>I agree to the <a href="#" @click.prevent="showTerms = true">Terms of Service</a> and <a href="#" @click.prevent="showPrivacy = true">Privacy Policy</a></span>
          </label>
        </div>

        <div v-if="error" class="error-message">
          {{ error }}
        </div>

        <button 
          type="submit" 
          class="btn btn-primary btn-block" 
          :disabled="loading || !isFormValid"
        >
          <span v-if="loading" class="spinner"></span>
          {{ loading ? 'Creating account...' : 'Create Account' }}
        </button>
      </form>

      <div class="auth-divider">
        <span>or</span>
      </div>

      <div class="social-login">
        <button class="btn btn-social btn-google" @click="handleOAuthLogin('google')">
          <span class="social-icon">G</span>
          Sign up with Google
        </button>
        <button class="btn btn-social btn-github" @click="handleOAuthLogin('github')">
          <span class="social-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.840 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.430.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
            </svg>
          </span>
          Sign up with GitHub
        </button>
      </div>

      <div class="auth-footer">
        <p>Already have an account? <router-link to="/login">Sign in</router-link></p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const form = reactive({
  username: '',
  email: '',
  password: '',
  confirmPassword: '',
  acceptTerms: false
})

const loading = ref(false)
const error = ref('')
const showPassword = ref(false)
const showTerms = ref(false)
const showPrivacy = ref(false)

const passwordsMatch = computed(() => {
  return form.password === form.confirmPassword
})

const passwordStrength = computed(() => {
  const password = form.password
  if (!password) return { level: '', text: '' }
  
  let strength = 0
  if (password.length >= 8) strength++
  if (password.length >= 12) strength++
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++
  if (/\d/.test(password)) strength++
  if (/[^a-zA-Z0-9]/.test(password)) strength++
  
  const levels = [
    { level: 'weak', text: 'Weak' },
    { level: 'weak', text: 'Weak' },
    { level: 'fair', text: 'Fair' },
    { level: 'good', text: 'Good' },
    { level: 'strong', text: 'Strong' },
    { level: 'strong', text: 'Very Strong' }
  ]
  
  return levels[strength]
})

const isFormValid = computed(() => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return (
    form.username.length >= 3 &&
    emailRegex.test(form.email) &&
    form.password.length >= 8 &&
    passwordsMatch.value &&
    form.acceptTerms
  )
})

async function handleRegister() {
  if (!isFormValid.value) return

  loading.value = true
  error.value = ''

  try {
    await authStore.register({
      username: form.username,
      email: form.email,
      password: form.password
    })

    router.push('/feed')
  } catch (err) {
    error.value = err.response?.data?.message || 'Registration failed. Please try again.'
  } finally {
    loading.value = false
  }
}

function handleOAuthLogin(provider) {
  // Always use relative URL to leverage nginx proxy (running on port 8080)
  window.location.href = `/api/auth/${provider}`
}
</script>

<style scoped>
.auth-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 2rem;
  position: relative;
  overflow: hidden;
}

.auth-page::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 600"><path d="M0,200 Q300,100 600,200 T1200,200 L1200,600 L0,600 Z" fill="rgba(255,255,255,0.05)"/></svg>') repeat-x;
  opacity: 0.3;
  animation: wave 20s linear infinite;
}

@keyframes wave {
  0% { transform: translateX(0); }
  100% { transform: translateX(-1200px); }
}

.auth-container {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  padding: 3rem;
  border-radius: 20px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(255, 255, 255, 0.5) inset;
  width: 100%;
  max-width: 440px;
  position: relative;
  z-index: 1;
  animation: slideUp 0.6s ease-out;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.auth-header {
  text-align: center;
  margin-bottom: 2rem;
}

.logo {
  font-size: 1.5rem;
  font-weight: bold;
  text-decoration: none;
  color: #667eea;
  display: block;
  margin-bottom: 1.5rem;
}

.auth-header h1 {
  font-size: 1.75rem;
  color: #333;
  margin-bottom: 0.5rem;
}

.auth-header p {
  color: #666;
}

.auth-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-group label {
  font-weight: 500;
  color: #333;
  font-size: 0.9rem;
}

.form-group input[type="text"],
.form-group input[type="email"],
.form-group input[type="password"] {
  padding: 0.875rem 1rem;
  border: 2px solid #e1e5eb;
  border-radius: 10px;
  font-size: 1rem;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  background: #fafbfc;
}

.form-group input:hover {
  border-color: #c4c9d4;
}

.form-group input:focus {
  outline: none;
  border-color: #667eea;
  background: white;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
  transform: translateY(-1px);
}

.form-group input:disabled {
  background: #f5f5f5;
  cursor: not-allowed;
  opacity: 0.6;
}

.form-hint {
  font-size: 0.75rem;
  color: #999;
}

.form-error {
  font-size: 0.8rem;
  color: #dc2626;
}

.password-input {
  position: relative;
  display: flex;
}

.password-input input {
  flex: 1;
  padding-right: 3rem;
}

.toggle-password {
  position: absolute;
  right: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  cursor: pointer;
  font-size: 1.2rem;
  padding: 0.25rem;
}

.password-strength {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.75rem;
  color: #666;
}

.strength-bar {
  flex: 1;
  height: 4px;
  background: #e1e5eb;
  border-radius: 2px;
  position: relative;
  overflow: hidden;
}

.strength-bar::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  border-radius: 2px;
  transition: width 0.3s ease, background 0.3s ease;
}

.strength-bar.weak::after {
  width: 25%;
  background: #dc2626;
}

.strength-bar.fair::after {
  width: 50%;
  background: #f59e0b;
}

.strength-bar.good::after {
  width: 75%;
  background: #10b981;
}

.strength-bar.strong::after {
  width: 100%;
  background: #059669;
}

.checkbox {
  display: flex;
  align-items: flex-start;
  gap: 0.5rem;
  cursor: pointer;
  color: #666;
  font-size: 0.85rem;
  line-height: 1.4;
}

.checkbox input {
  margin-top: 0.2rem;
  width: 1rem;
  height: 1rem;
  cursor: pointer;
  flex-shrink: 0;
}

.checkbox a {
  color: #667eea;
  text-decoration: none;
}

.checkbox a:hover {
  text-decoration: underline;
}

.error-message {
  background: #fee2e2;
  color: #dc2626;
  padding: 0.75rem 1rem;
  border-radius: 8px;
  font-size: 0.9rem;
  text-align: center;
}

.btn {
  padding: 0.875rem 1.5rem;
  border-radius: 8px;
  font-weight: 600;
  font-size: 1rem;
  cursor: pointer;
  border: none;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.btn-block {
  width: 100%;
}

.btn-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.btn-primary:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.spinner {
  width: 1.25rem;
  height: 1.25rem;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.auth-divider {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin: 1.5rem 0;
  color: #999;
  font-size: 0.9rem;
}

.auth-divider::before,
.auth-divider::after {
  content: '';
  flex: 1;
  height: 1px;
  background: #e1e5eb;
}

.social-login {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.btn-social {
  background: #f8f9fa;
  color: #333;
  border: 2px solid #e1e5eb;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
}

.btn-social:hover {
  background: #e9ecef;
  transform: translateY(-2px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.btn-google {
  background: white;
  border-color: #ddd;
}

.btn-google:hover {
  background: #f8f9fa;
  border-color: #4285f4;
}

.btn-google .social-icon {
  background: linear-gradient(135deg, #4285f4, #34a853);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  font-weight: bold;
  font-size: 1.3rem;
}

.btn-github {
  background: #24292e;
  color: white;
  border-color: #24292e;
}

.btn-github:hover {
  background: #1b1f23;
  border-color: #1b1f23;
}

.btn-github .social-icon svg {
  fill: white;
}

.social-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.auth-footer {
  text-align: center;
  margin-top: 1.5rem;
  padding-top: 1.5rem;
  border-top: 1px solid #e1e5eb;
  color: #666;
}

.auth-footer a {
  color: #667eea;
  font-weight: 600;
  text-decoration: none;
}

.auth-footer a:hover {
  text-decoration: underline;
}

@media (max-width: 480px) {
  .auth-container {
    padding: 1.5rem;
  }
}
</style>
