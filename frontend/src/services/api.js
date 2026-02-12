import axios from 'axios'

// All API requests use relative paths.
// Routing is handled by nginx (Docker) or Vite proxy (local dev).
const api = axios.create({
  baseURL: '/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// Request interceptor - add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Response interceptor - handle errors and token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    // If 401 and we haven't tried refreshing yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true

      const refreshToken = localStorage.getItem('refreshToken')
      if (refreshToken) {
        try {
          const response = await axios.post('/api/auth/refresh', {
            refreshToken
          })

          // Handle both direct and wrapped response formats
          const responseData = response.data.data || response.data
          const token = responseData.token
          const newRefreshToken = responseData.refreshToken

          if (token) {
            localStorage.setItem('token', token)
            if (newRefreshToken) {
              localStorage.setItem('refreshToken', newRefreshToken)
            }
            api.defaults.headers.common['Authorization'] = `Bearer ${token}`
            originalRequest.headers.Authorization = `Bearer ${token}`

            return api(originalRequest)
          }
        } catch (refreshError) {
          // Refresh failed - logout user
          localStorage.removeItem('token')
          localStorage.removeItem('refreshToken')
          window.location.href = '/login'
          return Promise.reject(refreshError)
        }
      }
    }

    return Promise.reject(error)
  }
)

export default api
