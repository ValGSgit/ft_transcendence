import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import api from '../services/api'
import { socketService } from '../services/socket'

export const useAuthStore = defineStore('auth', () => {
  // State
  const user = ref(null)
  const token = ref(localStorage.getItem('token') || null)
  const refreshToken = ref(localStorage.getItem('refreshToken') || null)
  const initialized = ref(false)
  const loading = ref(false)
  const error = ref(null)

  // Getters
  const isAuthenticated = computed(() => !!token.value && !!user.value)
  const currentUser = computed(() => user.value)

  // Actions
  async function initialize() {
    if (initialized.value) return

    if (token.value) {
      try {
        await fetchCurrentUser()
        socketService.connect(token.value)
      } catch (err) {
        // Token might be expired, try refresh
        if (refreshToken.value) {
          try {
            await refreshAccessToken()
            await fetchCurrentUser()
            socketService.connect(token.value)
          } catch (refreshErr) {
            logout()
          }
        } else {
          logout()
        }
      }
    }
    initialized.value = true
  }

  async function register(userData) {
    loading.value = true
    error.value = null
    try {
      const response = await api.post('/auth/register', userData)
      
      console.log('Register response:', response.data)
      
      // Extract data from the response wrapper
      const { token: accessToken, refreshToken: refresh, user: newUser } = response.data.data || response.data
      
      if (!accessToken || !newUser) {
        console.error('Invalid response structure:', response.data)
        throw new Error('Invalid response from server')
      }
      
      setTokens(accessToken, refresh)
      user.value = newUser
      socketService.connect(token.value)
      return response.data
    } catch (err) {
      error.value = err.response?.data?.message || err.message || 'Registration failed'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function login(credentials) {
    loading.value = true
    error.value = null
    try {
      const response = await api.post('/auth/login', credentials)
      
      console.log('Login response:', response.data)
      
      // Check if 2FA is required
      if (response.data.data?.requires2FA) {
        loading.value = false
        return response.data.data
      }
      
      // Extract data from the response wrapper
      const { token: accessToken, refreshToken: refresh, user: userData } = response.data.data || response.data
      
      if (!accessToken || !userData) {
        console.error('Invalid response structure:', response.data)
        throw new Error('Invalid response from server')
      }
      
      setTokens(accessToken, refresh)
      user.value = userData
      socketService.connect(token.value)
      return response.data
    } catch (err) {
      error.value = err.response?.data?.message || err.message || 'Login failed'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function logout() {
    try {
      if (token.value) {
        await api.post('/auth/logout')
      }
    } catch (err) {
      // Ignore logout errors
    } finally {
      clearTokens()
      user.value = null
      socketService.disconnect()
    }
  }

  async function fetchCurrentUser() {
    const response = await api.get('/users/me')
    const userData = response.data.data?.user || response.data.user
    user.value = userData
    return userData
  }

  async function updateProfile(profileData) {
    loading.value = true
    error.value = null
    try {
      const response = await api.put('/users/profile', profileData)
      const updatedUser = response.data.data?.user || response.data.user
      user.value = { ...user.value, ...updatedUser }
      return response.data
    } catch (err) {
      error.value = err.response?.data?.message || 'Update failed'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function refreshAccessToken() {
    const response = await api.post('/auth/refresh', {
      refreshToken: refreshToken.value
    })
    setTokens(response.data.token, response.data.refreshToken)
    return response.data.token
  }

  function setTokens(accessToken, refresh) {
    token.value = accessToken
    refreshToken.value = refresh
    localStorage.setItem('token', accessToken)
    if (refresh) {
      localStorage.setItem('refreshToken', refresh)
    }
    api.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`
  }

  function clearTokens() {
    token.value = null
    refreshToken.value = null
    localStorage.removeItem('token')
    localStorage.removeItem('refreshToken')
    delete api.defaults.headers.common['Authorization']
  }

  return {
    // State
    user,
    token,
    initialized,
    loading,
    error,
    // Getters
    isAuthenticated,
    currentUser,
    // Actions
    initialize,
    register,
    login,
    logout,
    fetchCurrentUser,
    updateProfile,
    refreshAccessToken,
    setTokens,
    clearTokens
  }
})
