import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../stores/auth'

// Lazy-loaded route components
const Home = () => import('../views/Home.vue')
const Login = () => import('../views/Login.vue')
const Register = () => import('../views/Register.vue')
const AuthCallback = () => import('../views/AuthCallback.vue')
const Profile = () => import('../views/Profile.vue')
const Feed = () => import('../views/Feed.vue')
const Friends = () => import('../views/Friends.vue')
const Messages = () => import('../views/Messages.vue')
const Game = () => import('../views/Game.vue')
const Settings = () => import('../views/Settings.vue')
const AdminDashboard = () => import('../views/AdminDashboard.vue')
const AdminDiagram = () => import('../views/AdminDiagram.vue')
const NotFound = () => import('../views/NotFound.vue')

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home,
    meta: { requiresAuth: false }
  },
  {
    path: '/login',
    name: 'Login',
    component: Login,
    meta: { requiresAuth: false, guestOnly: true }
  },
  {
    path: '/register',
    name: 'Register',
    component: Register,
    meta: { requiresAuth: false, guestOnly: true }
  },
  {
    path: '/auth/callback',
    name: 'AuthCallback',
    component: AuthCallback,
    meta: { requiresAuth: false }
  },
  {
    path: '/feed',
    name: 'Feed',
    component: Feed,
    meta: { requiresAuth: true }
  },
  {
    path: '/profile/:username?',
    name: 'Profile',
    component: Profile,
    meta: { requiresAuth: true }
  },
  {
    path: '/friends',
    name: 'Friends',
    component: Friends,
    meta: { requiresAuth: true }
  },
  {
    path: '/messages/:chatId?',
    name: 'Messages',
    component: Messages,
    meta: { requiresAuth: true }
  },
  {
    path: '/game',
    name: 'Game',
    component: Game,
    meta: { requiresAuth: true }
  },
  {
    path: '/settings',
    name: 'Settings',
    component: Settings,
    meta: { requiresAuth: true }
  },
  {
    path: '/admin',
    name: 'AdminDashboard',
    component: AdminDashboard,
    meta: { requiresAuth: true, requiresAdmin: true }
  },
  {
    path: '/admin/diagram',
    name: 'AdminDiagram',
    component: AdminDiagram,
    meta: { requiresAuth: true, requiresAdmin: true }
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: NotFound
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// Navigation guards
router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore()
  
  // Try to restore session on first load
  if (!authStore.initialized) {
    await authStore.initialize()
  }

  const isAuthenticated = authStore.isAuthenticated

  // Redirect authenticated users away from guest-only pages
  if (to.meta.guestOnly && isAuthenticated) {
    return next({ name: 'Feed' })
  }

  // Redirect unauthenticated users to login
  if (to.meta.requiresAuth && !isAuthenticated) {
    return next({ name: 'Login', query: { redirect: to.fullPath } })
  }

  // Check admin access for admin-only routes
  if (to.meta.requiresAdmin && !authStore.user?.is_admin) {
    return next({ name: 'Home' })
  }

  next()
})

export default router
