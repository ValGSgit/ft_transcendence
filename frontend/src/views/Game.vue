<template>
  <div class="game-page">
    <!-- Game Canvas -->
    <div ref="gameContainer" class="game-canvas"></div>
    
    <!-- Loading Overlay -->
    <div v-if="!isEngineReady" class="loading-overlay">
      <div class="loading-content">
        <div class="loading-spinner">🦙</div>
        <p>{{ loadingStatus }}</p>
      </div>
    </div>

    <!-- Error Overlay -->
    <div v-if="errorMessage" class="error-overlay">
      <div class="error-content">
        <span class="error-icon">⚠️</span>
        <h3>Something went wrong</h3>
        <p>{{ errorMessage }}</p>
        <button class="btn btn-primary" @click="retryInit">Try Again</button>
      </div>
    </div>

    <!-- Game HUD -->
    <div v-if="isEngineReady && isPlaying" class="game-hud">
      <!-- Top Bar -->
      <div class="hud-top">
        <div class="farm-info">
          <span class="farm-name">{{ farmName }}</span>
          <span v-if="isVisiting" class="visiting-badge">Visiting</span>
        </div>
        <div class="hud-stats">
          <div class="stat">
            <span class="stat-icon">💰</span>
            <span class="stat-value">{{ score }}</span>
          </div>
          <div class="stat">
            <span class="stat-icon">🦙</span>
            <span class="stat-value">{{ alpacaList.length }}</span>
          </div>
        </div>
      </div>

      <!-- Side Controls -->
      <div class="hud-side">
        <button class="hud-btn" @click="showPanel = !showPanel" title="Settings">
          ⚙️
        </button>
        <button class="hud-btn" @click="openCreationMenu(false)" title="Add Alpaca">
          ➕
        </button>
        <button class="hud-btn" @click="shareFarmProgress" title="Share Progress">
          📤
        </button>
        <button class="hud-btn" @click="saveGame" title="Save Game">
          💾
        </button>
        <button v-if="isVisiting" class="hud-btn return-btn" @click="returnHome" title="Return Home">
          🏠
        </button>
      </div>

      <!-- Alpaca List -->
      <div class="alpaca-sidebar">
        <h4>Your Herd</h4>
        <div class="alpaca-list">
          <div
            v-for="alpaca in alpacaList"
            :key="alpaca.id"
            :class="['alpaca-item', { active: alpaca.id === activeAlpacaId }]"
            @click="switchControl(alpaca.id)"
          >
            <div class="alpaca-color" :style="{ background: alpaca.color }"></div>
            <span class="alpaca-name">{{ alpaca.name }}</span>
            <span v-if="alpaca.id === activeAlpacaId" class="control-badge">🎮</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Start Screen (when not playing) -->
    <div v-if="isEngineReady && !isPlaying" class="start-screen">
      <div class="start-content">
        <h1>🦙 Alpaca Farm</h1>
        <p>Build and manage your alpaca farm, visit friends, and collect coins!</p>
        
        <div class="start-actions">
          <button class="btn btn-primary btn-large" @click="openCreationMenu(true)">
            🎮 New Game
          </button>
          <button class="btn btn-secondary btn-large" @click="loadGame">
            📂 Load Game
          </button>
          <button class="btn btn-secondary btn-large" @click="visitFriend">
            👥 Visit Friend
          </button>
        </div>

        <div class="controls-help">
          <h4>Controls</h4>
          <ul>
            <li><kbd>WASD</kbd> or <kbd>Arrow Keys</kbd> - Move</li>
            <li><kbd>Click</kbd> - Walk to location</li>
            <li><kbd>Mouse Drag</kbd> - Rotate camera</li>
            <li><kbd>Scroll</kbd> - Zoom in/out</li>
          </ul>
          <p class="mobile-note">📱 Touch: Use on-screen joystick to move</p>
        </div>
      </div>
    </div>

    <!-- Mobile Touch Controls -->
    <div v-if="isEngineReady && isPlaying && isTouchDevice" class="mobile-controls">
      <div 
        class="joystick-zone"
        @touchstart="onJoystickStart"
        @touchmove="onJoystickMove"
        @touchend="onJoystickEnd"
      >
        <div class="joystick-base">
          <div 
            class="joystick-knob"
            :style="{ 
              transform: `translate(${joystickPos.x}px, ${joystickPos.y}px)` 
            }"
          ></div>
        </div>
      </div>
    </div>

    <!-- Settings Panel -->
    <div v-if="showPanel" class="settings-panel">
      <div class="panel-header">
        <h3>Settings</h3>
        <button class="close-btn" @click="showPanel = false">✕</button>
      </div>
      <div ref="guiContainer" class="gui-container"></div>
    </div>

    <!-- Creation Modal -->
    <div v-if="showCreation" class="modal-overlay" @click.self="showCreation = false">
      <div class="modal creation-modal">
        <div class="modal-header">
          <h3>{{ creationData.isPlayer ? '🎮 Create Your Alpaca' : '➕ Add New Alpaca' }}</h3>
          <button class="close-btn" @click="showCreation = false">✕</button>
        </div>
        <div class="modal-content">
          <div class="form-group">
            <label>Name</label>
            <input v-model="creationData.name" type="text" class="form-input" placeholder="Enter name..." />
          </div>
          <div class="form-group">
            <label>Color</label>
            <div class="color-picker">
              <input v-model="creationData.color" type="color" class="color-input" />
              <span class="color-preview" :style="{ background: creationData.color }"></span>
              <span class="color-value">{{ creationData.color }}</span>
            </div>
          </div>
          <div class="preset-colors">
            <button
              v-for="color in presetColors"
              :key="color"
              class="preset-btn"
              :style="{ background: color }"
              @click="creationData.color = color"
            ></button>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" @click="showCreation = false">Cancel</button>
          <button class="btn btn-primary" @click="confirmCreation">
            {{ creationData.isPlayer ? 'Start Game' : 'Add Alpaca' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Alpaca Profile Modal -->
    <div v-if="showProfile && selectedAlpacaProfile" class="modal-overlay" @click.self="closeProfile">
      <div class="modal profile-modal">
        <div class="modal-header">
          <h3>🦙 {{ selectedAlpacaProfile.name }}</h3>
          <button class="close-btn" @click="closeProfile">✕</button>
        </div>
        <div class="modal-content">
          <div class="profile-preview">
            <div class="alpaca-preview" :style="{ background: selectedAlpacaProfile.color }">
              🦙
            </div>
          </div>
          <div class="profile-stats">
            <div class="stat-row">
              <span class="stat-label">Status</span>
              <span class="stat-value">{{ selectedAlpacaProfile.aiState === 'controlled' ? 'Player Controlled' : 'AI Wandering' }}</span>
            </div>
            <div class="stat-row">
              <span class="stat-label">Position</span>
              <span class="stat-value">{{ Math.round(selectedAlpacaProfile.x) }}, {{ Math.round(selectedAlpacaProfile.z) }}</span>
            </div>
            <div class="stat-row">
              <span class="stat-label">Speed</span>
              <span class="stat-value">{{ selectedAlpacaProfile.speed }}</span>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button 
            v-if="selectedAlpacaProfile.id !== activeAlpacaId"
            class="btn btn-primary" 
            @click="takeControl"
          >
            🎮 Take Control
          </button>
          <button 
            v-if="!isDeleteConfirm"
            class="btn btn-danger" 
            @click="isDeleteConfirm = true"
          >
            🗑️ Delete
          </button>
          <button 
            v-else
            class="btn btn-danger" 
            @click="deleteAlpaca"
          >
            ⚠️ Confirm Delete
          </button>
        </div>
      </div>
    </div>

    <!-- Share Progress Modal -->
    <div v-if="showShareModal" class="modal-overlay" @click.self="showShareModal = false">
      <div class="modal share-modal">
        <div class="modal-header">
          <h3>📤 Share Farm Progress</h3>
          <button class="close-btn" @click="showShareModal = false">✕</button>
        </div>
        <div class="modal-content">
          <p>Share your farm progress with friends on your feed!</p>
          <div class="share-preview">
            <div class="preview-card">
              <div class="preview-header">🦙 {{ farmName }}</div>
              <div class="preview-stats">
                <span>{{ alpacaList.length }} Alpacas</span>
                <span>{{ score }} Coins</span>
              </div>
            </div>
          </div>
          <div class="form-group">
            <label>Add a message (optional)</label>
            <textarea v-model="shareMessage" class="form-input" placeholder="Check out my farm!"></textarea>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" @click="showShareModal = false">Cancel</button>
          <button class="btn btn-primary" @click="postFarmUpdate">Post to Feed</button>
        </div>
      </div>
    </div>

    <!-- Hidden File Inputs -->
    <input ref="fileInput" type="file" accept=".json" style="display:none" @change="onLoadFile" />
    <input ref="visitInput" type="file" accept=".json" style="display:none" @change="loadVisitFile" />
  </div>
</template>

<script setup>
import { onMounted, onUnmounted, ref, reactive, nextTick, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { useSocialStore } from '../stores/social'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import GUI from 'lil-gui'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const socialStore = useSocialStore()

// ==============================
// 1. APP STATE
// ==============================
const gameContainer = ref(null)
const guiContainer = ref(null)
const fileInput = ref(null)
const visitInput = ref(null)

const isEngineReady = ref(false)
const loadingStatus = ref("Initializing 3D Engine...")
const errorMessage = ref("")
const isPlaying = ref(false)
const isVisiting = ref(false)
const showPanel = ref(false)
const showProfile = ref(false)
const showCreation = ref(false)
const showShareModal = ref(false)
const isDeleteConfirm = ref(false)
const score = ref(0)
const shareMessage = ref('')

const farmName = ref("My Happy Farm")
const activeAlpacaId = ref(0)
const selectedAlpacaProfile = ref(null)

let homeBackup = null

// Touch/Mobile controls
const isTouchDevice = ref(false)
const joystickPos = reactive({ x: 0, y: 0 })
const joystickInput = reactive({ x: 0, z: 0 })
let joystickTouchId = null
let joystickCenter = { x: 0, y: 0 }

const creationData = reactive({
  isPlayer: false,
  name: "",
  color: "#f5f5dc"
})

const alpacaList = reactive([])

const worldParams = reactive({
  mapSize: 30,
  fogNear: 20,
  fogFar: 80
})

const palette = reactive({
  sky: '#87CEEB',
  ground: '#458B00',
  fence: '#A0522D',
  skin: '#8b4513',
  hoof: '#3d1e0b',
  leaves: '#228B22',
  wood: '#8B4513',
  stone: '#808080'
})

const keyState = reactive({
  ArrowUp: false, ArrowDown: false, ArrowLeft: false, ArrowRight: false,
  KeyW: false, KeyS: false, KeyA: false, KeyD: false
})

// Movement configuration for smoother controls
const movementConfig = reactive({
  baseSpeed: 0.15,           // Base movement speed
  acceleration: 0.02,        // How fast to reach full speed
  deceleration: 0.08,        // How fast to slow down
  maxSpeed: 0.25,            // Maximum speed cap
  turnSpeed: 0.15,           // How fast to turn towards movement direction
  diagonalNormalize: true    // Normalize diagonal movement
})

// Current velocity for smooth movement
const playerVelocity = reactive({ x: 0, z: 0 })

const presetColors = [
  '#f5f5dc', '#ffffff', '#8B4513', '#D2691E', '#808080',
  '#FFB6C1', '#ADD8E6', '#90EE90', '#DDA0DD', '#F0E68C'
]

// ==============================
// 2. THREE.JS GLOBALS
// ==============================
let renderer, scene, camera, controls, animationId, gui
let fenceGroup, decoGroup, groundMesh, dirLight, targetMarker

const alpacaMeshes = new Map()
const clock = new THREE.Clock()
const coins = []
const raycaster = new THREE.Raycaster()
const pointer = new THREE.Vector2()
const targetPosition = ref(null)

const materials = {}

// ==============================
// 3. INITIALIZATION
// ==============================
onMounted(async () => {
  try {
    await nextTick()
    
    // Detect touch device
    isTouchDevice.value = 'ontouchstart' in window || navigator.maxTouchPoints > 0
    
    let attempts = 0
    while (!gameContainer.value && attempts < 10) {
      await new Promise(r => setTimeout(r, 100))
      attempts++
    }
    
    if (!gameContainer.value) throw new Error("Game container missing")
    
    init3D()
    
    // Check if visiting someone
    if (route.query.visit) {
      // Load friend's farm from API
      loadFriendFarm(route.query.visit)
    }
  } catch (err) {
    errorMessage.value = err.message
    loadingStatus.value = "CRASHED"
  }
})

onUnmounted(() => {
  removeEvents()
  if (animationId) cancelAnimationFrame(animationId)
  if (renderer) renderer.dispose()
  if (gui) gui.destroy()
})

const init3D = () => {
  loadingStatus.value = "Building world..."
  
  // Create Materials
  const matConfig = { flatShading: true }
  materials.skin = new THREE.MeshLambertMaterial({ color: palette.skin, ...matConfig })
  materials.hoof = new THREE.MeshLambertMaterial({ color: palette.hoof, ...matConfig })
  materials.wood = new THREE.MeshLambertMaterial({ color: palette.fence, ...matConfig })
  materials.ground = new THREE.MeshLambertMaterial({ color: palette.ground, ...matConfig })
  materials.coin = new THREE.MeshLambertMaterial({ color: 0xFFD700, ...matConfig })
  materials.leaves = new THREE.MeshLambertMaterial({ color: palette.leaves, ...matConfig })
  materials.trunk = new THREE.MeshLambertMaterial({ color: palette.wood, ...matConfig })
  materials.stone = new THREE.MeshLambertMaterial({ color: palette.stone, ...matConfig })
  materials.eyes = new THREE.MeshStandardMaterial({
    color: 0x111111,
    roughness: 0.1,
    metalness: 0.5,
    flatShading: true
  })

  // Create Scene
  scene = new THREE.Scene()
  scene.background = new THREE.Color(palette.sky)
  scene.fog = new THREE.Fog(palette.sky, worldParams.fogNear, worldParams.fogFar)

  // Create Camera
  const aspect = gameContainer.value.clientWidth / gameContainer.value.clientHeight
  camera = new THREE.PerspectiveCamera(60, aspect, 0.1, 1000)
  camera.position.set(0, 18, 24)

  // Create Renderer
  renderer = new THREE.WebGLRenderer({ antialias: true })
  renderer.setSize(gameContainer.value.clientWidth, gameContainer.value.clientHeight)
  renderer.shadowMap.enabled = true
  renderer.shadowMap.type = THREE.PCFSoftShadowMap
  gameContainer.value.appendChild(renderer.domElement)

  // Create Lights
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.7)
  scene.add(ambientLight)
  
  dirLight = new THREE.DirectionalLight(0xffffff, 1.0)
  dirLight.position.set(30, 50, 20)
  dirLight.castShadow = true
  dirLight.shadow.mapSize.set(2048, 2048)
  const d = 60
  dirLight.shadow.camera.left = -d
  dirLight.shadow.camera.right = d
  dirLight.shadow.camera.top = d
  dirLight.shadow.camera.bottom = -d
  scene.add(dirLight)

  // Create Groups
  fenceGroup = new THREE.Group()
  scene.add(fenceGroup)
  decoGroup = new THREE.Group()
  scene.add(decoGroup)

  // Create Click Marker
  const ringGeo = new THREE.RingGeometry(0.4, 0.6, 16)
  targetMarker = new THREE.Mesh(ringGeo, new THREE.MeshBasicMaterial({
    color: 0xFFFF00,
    side: THREE.DoubleSide,
    transparent: true,
    opacity: 0.6
  }))
  targetMarker.rotation.x = -Math.PI / 2
  targetMarker.visible = false
  scene.add(targetMarker)

  // Create Ground
  groundMesh = new THREE.Mesh(new THREE.PlaneGeometry(300, 300), materials.ground)
  groundMesh.rotation.x = -Math.PI / 2
  groundMesh.receiveShadow = true
  scene.add(groundMesh)

  // Build Farm
  buildFarm(worldParams.mapSize)

  // Controls
  controls = new OrbitControls(camera, renderer.domElement)
  controls.enableDamping = true
  controls.maxPolarAngle = Math.PI / 2 - 0.1

  // Events
  addEvents()

  // Start Animation Loop
  animate()

  // Initialize GUI
  if (guiContainer.value) {
    initGUI()
  }

  isEngineReady.value = true
  loadingStatus.value = "Ready!"
}

// ==============================
// 4. GAME LOOP
// ==============================
const animate = () => {
  animationId = requestAnimationFrame(animate)
  
  const delta = clock.getDelta()
  
  if (isPlaying.value) {
    updateAlpacas(delta)
    updateCoins(delta)
  }
  
  controls.update()
  renderer.render(scene, camera)
}

const updateAlpacas = (delta) => {
  alpacaList.forEach(data => {
    const meshObj = alpacaMeshes.get(data.id)
    if (!meshObj) return

    let moving = false
    const speed = data.speed * 60 * delta

    if (data.aiState === 'controlled' && data.id === activeAlpacaId.value) {
      // Player Control with smooth velocity-based movement
      let inputX = 0
      let inputZ = 0
      
      // Get input direction from keyboard
      if (keyState.ArrowUp || keyState.KeyW) inputZ = -1
      if (keyState.ArrowDown || keyState.KeyS) inputZ = 1
      if (keyState.ArrowLeft || keyState.KeyA) inputX = -1
      if (keyState.ArrowRight || keyState.KeyD) inputX = 1
      
      // Add joystick input for mobile
      if (joystickInput.x !== 0 || joystickInput.z !== 0) {
        inputX = joystickInput.x
        inputZ = joystickInput.z
      }
      
      // Normalize diagonal movement to prevent faster diagonal speed
      if (movementConfig.diagonalNormalize && inputX !== 0 && inputZ !== 0) {
        const magnitude = Math.sqrt(inputX * inputX + inputZ * inputZ)
        inputX /= magnitude
        inputZ /= magnitude
      }
      
      // Apply acceleration/deceleration for smooth movement
      const targetVelX = inputX * movementConfig.baseSpeed
      const targetVelZ = inputZ * movementConfig.baseSpeed
      
      // Smoothly interpolate velocity
      if (inputX !== 0 || inputZ !== 0) {
        playerVelocity.x += (targetVelX - playerVelocity.x) * movementConfig.acceleration * 60 * delta
        playerVelocity.z += (targetVelZ - playerVelocity.z) * movementConfig.acceleration * 60 * delta
      } else {
        // Apply deceleration when no input
        playerVelocity.x *= (1 - movementConfig.deceleration)
        playerVelocity.z *= (1 - movementConfig.deceleration)
        
        // Stop completely if very slow
        if (Math.abs(playerVelocity.x) < 0.001) playerVelocity.x = 0
        if (Math.abs(playerVelocity.z) < 0.001) playerVelocity.z = 0
      }
      
      // Clamp velocity to max speed
      const currentSpeed = Math.sqrt(playerVelocity.x ** 2 + playerVelocity.z ** 2)
      if (currentSpeed > movementConfig.maxSpeed) {
        const scale = movementConfig.maxSpeed / currentSpeed
        playerVelocity.x *= scale
        playerVelocity.z *= scale
      }
      
      // Apply velocity to position
      if (Math.abs(playerVelocity.x) > 0.001 || Math.abs(playerVelocity.z) > 0.001) {
        data.x += playerVelocity.x * 60 * delta
        data.z += playerVelocity.z * 60 * delta
        moving = true
        
        // Smooth rotation towards movement direction
        const targetRotation = Math.atan2(playerVelocity.x, playerVelocity.z)
        let rotDiff = targetRotation - data.yRot
        
        // Normalize rotation difference to -PI to PI
        while (rotDiff > Math.PI) rotDiff -= Math.PI * 2
        while (rotDiff < -Math.PI) rotDiff += Math.PI * 2
        
        data.yRot += rotDiff * movementConfig.turnSpeed
      }

      // Click-to-move
      if (targetPosition.value && !moving) {
        const dx = targetPosition.value.x - data.x
        const dz = targetPosition.value.z - data.z
        const dist = Math.sqrt(dx * dx + dz * dz)
        
        if (dist > 0.5) {
          // Use same smooth velocity system for click-to-move
          const targetVelX = (dx / dist) * movementConfig.baseSpeed
          const targetVelZ = (dz / dist) * movementConfig.baseSpeed
          
          playerVelocity.x += (targetVelX - playerVelocity.x) * movementConfig.acceleration * 60 * delta
          playerVelocity.z += (targetVelZ - playerVelocity.z) * movementConfig.acceleration * 60 * delta
          
          data.x += playerVelocity.x * 60 * delta
          data.z += playerVelocity.z * 60 * delta
          data.yRot = Math.atan2(dx, dz)
          moving = true
        } else {
          targetPosition.value = null
          targetMarker.visible = false
          playerVelocity.x = 0
          playerVelocity.z = 0
        }
      }
    } else {
      // AI Control
      data.aiTimer -= delta
      if (data.aiTimer <= 0) {
        if (data.aiState === 'idle') {
          data.aiState = 'walking'
          const range = worldParams.mapSize - 2
          data.targetX = (Math.random() - 0.5) * range * 2
          data.targetZ = (Math.random() - 0.5) * range * 2
          data.aiTimer = 3 + Math.random() * 4
        } else {
          data.aiState = 'idle'
          data.aiTimer = 2 + Math.random() * 3
        }
      }

      if (data.aiState === 'walking' && data.targetX != null) {
        const dx = data.targetX - data.x
        const dz = data.targetZ - data.z
        const dist = Math.sqrt(dx * dx + dz * dz)
        
        if (dist > 0.5) {
          data.x += (dx / dist) * speed * 0.5
          data.z += (dz / dist) * speed * 0.5
          data.yRot = Math.atan2(dx, dz)
          moving = true
        }
      }
    }

    // Boundary Check
    const limit = worldParams.mapSize - 1.5
    data.x = Math.max(-limit, Math.min(limit, data.x))
    data.z = Math.max(-limit, Math.min(limit, data.z))

    // Update Mesh Position
    meshObj.group.position.x = data.x
    meshObj.group.position.z = data.z
    meshObj.group.rotation.y = data.yRot

    // Walk Animation
    if (moving) {
      meshObj.walkTime += delta * 10
      meshObj.legs.forEach((leg, i) => {
        leg.rotation.x = Math.sin(meshObj.walkTime + i * Math.PI * 0.5) * 0.4
      })
    }

    // Camera Follow
    if (data.id === activeAlpacaId.value) {
      controls.target.set(data.x, 2, data.z)
    }
  })
}

const updateCoins = (delta) => {
  coins.forEach((coin, index) => {
    coin.rotation.y += delta * 2
    coin.position.y = 1 + Math.sin(Date.now() * 0.003 + index) * 0.2

    // Check collision with player
    const player = alpacaList.find(a => a.id === activeAlpacaId.value)
    if (player) {
      const dx = coin.position.x - player.x
      const dz = coin.position.z - player.z
      const dist = Math.sqrt(dx * dx + dz * dz)
      
      if (dist < 1.5) {
        scene.remove(coin)
        coins.splice(index, 1)
        score.value += 10
      }
    }
  })

  // Respawn coins periodically
  if (coins.length < 5 && Math.random() < 0.02) {
    spawnCoin()
  }
}

// ==============================
// 5. OBJECT CREATION
// ==============================
const createBlock = (w, h, d, mat, x, y, z) => {
  const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat)
  m.position.set(x, y, z)
  m.castShadow = true
  m.receiveShadow = true
  return m
}

const spawnAlpacaMesh = (data) => {
  const group = new THREE.Group()
  group.position.set(data.x, 0, data.z)
  group.rotation.y = data.yRot
  group.userData = { isAlpaca: true, id: data.id }

  const bodyGroup = new THREE.Group()
  group.add(bodyGroup)

  const woolMat = new THREE.MeshLambertMaterial({ color: data.color, flatShading: true })
  const hipHeight = 0.9

  // Body Parts
  bodyGroup.add(createBlock(1.2, 1.0, 1.8, woolMat, 0, hipHeight + 0.5, 0))
  bodyGroup.add(createBlock(0.6, 0.6, 0.6, woolMat, 0, hipHeight + 1.3, 0.6))
  bodyGroup.add(createBlock(0.6, 0.6, 0.6, woolMat, 0, hipHeight + 1.9, 0.6))
  bodyGroup.add(createBlock(0.8, 0.8, 0.8, woolMat, 0, hipHeight + 2.6, 0.7))
  bodyGroup.add(createBlock(0.6, 0.4, 0.2, materials.skin, 0, hipHeight + 2.4, 1.2))
  bodyGroup.add(createBlock(0.2, 0.3, 0.2, woolMat, 0.25, hipHeight + 3.15, 0.5))
  bodyGroup.add(createBlock(0.2, 0.3, 0.2, woolMat, -0.25, hipHeight + 3.15, 0.5))

  // Eyes
  const eyeSize = 0.12
  bodyGroup.add(createBlock(eyeSize, eyeSize, 0.05, materials.eyes, 0.25, hipHeight + 2.7, 1.11))
  bodyGroup.add(createBlock(eyeSize, eyeSize, 0.05, materials.eyes, -0.25, hipHeight + 2.7, 1.11))

  // Legs
  const legs = []
  const createLeg = (x, z) => {
    const g = new THREE.Group()
    g.add(createBlock(0.35, 0.7, 0.35, woolMat, 0, -0.35, 0))
    g.add(createBlock(0.35, 0.2, 0.35, materials.hoof, 0, -0.8, 0))
    g.position.set(x, hipHeight, z)
    return g
  }

  const FL = createLeg(-0.4, 0.6)
  const FR = createLeg(0.4, 0.6)
  const BL = createLeg(-0.4, -0.6)
  const BR = createLeg(0.4, -0.6)
  group.add(FL, FR, BL, BR)
  legs.push(FL, FR, BL, BR)

  scene.add(group)
  alpacaMeshes.set(data.id, { group, bodyGroup, legs, woolMat, walkTime: Math.random() * 10 })
}

const buildFarm = (size) => {
  if (!fenceGroup) return
  while (fenceGroup.children.length > 0) fenceGroup.remove(fenceGroup.children[0])
  
  const createFence = (x, z, rotated) => {
    const g = new THREE.Group()
    g.add(createBlock(0.3, 1.5, 0.3, materials.wood, 0, 0.75, 0))
    g.add(createBlock(2.1, 0.2, 0.15, materials.wood, 1, 1.1, 0))
    g.add(createBlock(2.1, 0.2, 0.15, materials.wood, 1, 0.6, 0))
    g.position.set(x, 0, z)
    if (rotated) g.rotation.y = Math.PI / 2
    fenceGroup.add(g)
  }

  for (let i = -size; i <= size; i += 2) {
    createFence(i, -size, false)
    createFence(i, size, false)
    createFence(-size, i, true)
    createFence(size, i, true)
  }

  buildDecorations(size)
}

const buildDecorations = (size) => {
  if (!decoGroup) return
  while (decoGroup.children.length > 0) decoGroup.remove(decoGroup.children[0])

  // Trees
  for (let i = 0; i < 8; i++) {
    const x = (Math.random() - 0.5) * size * 1.5
    const z = (Math.random() - 0.5) * size * 1.5
    const tree = new THREE.Group()
    tree.add(createBlock(0.5, 3, 0.5, materials.trunk, x, 1.5, z))
    tree.add(createBlock(2, 2, 2, materials.leaves, x, 4, z))
    decoGroup.add(tree)
  }

  // Rocks
  for (let i = 0; i < 5; i++) {
    const x = (Math.random() - 0.5) * size * 1.5
    const z = (Math.random() - 0.5) * size * 1.5
    const rock = createBlock(
      0.8 + Math.random() * 0.5,
      0.5 + Math.random() * 0.3,
      0.8 + Math.random() * 0.5,
      materials.stone,
      x, 0.3, z
    )
    decoGroup.add(rock)
  }
}

const spawnCoin = () => {
  const range = worldParams.mapSize - 3
  const coinMesh = new THREE.Mesh(
    new THREE.CylinderGeometry(0.4, 0.4, 0.1, 16),
    materials.coin
  )
  coinMesh.position.set(
    (Math.random() - 0.5) * range * 2,
    1,
    (Math.random() - 0.5) * range * 2
  )
  coinMesh.rotation.x = Math.PI / 2
  scene.add(coinMesh)
  coins.push(coinMesh)
}

const respawnCoins = () => {
  coins.forEach(c => scene.remove(c))
  coins.length = 0
  for (let i = 0; i < 10; i++) spawnCoin()
}

// ==============================
// 6. USER INTERACTIONS
// ==============================
const openCreationMenu = (isPlayer) => {
  creationData.isPlayer = isPlayer
  creationData.name = isPlayer ? (authStore.currentUser?.username || "Player") : `Alpaca ${alpacaList.length + 1}`
  creationData.color = presetColors[Math.floor(Math.random() * presetColors.length)]
  showCreation.value = true
}

const confirmCreation = () => {
  const id = Date.now()
  const range = worldParams.mapSize - 3

  const newData = {
    id,
    name: creationData.name,
    color: creationData.color,
    speed: 0.12,
    x: (Math.random() - 0.5) * range * 2,
    z: (Math.random() - 0.5) * range * 2,
    yRot: Math.random() * Math.PI * 2,
    aiState: creationData.isPlayer ? 'controlled' : 'idle',
    aiTimer: 0,
    targetX: null,
    targetZ: null
  }

  if (creationData.isPlayer) {
    alpacaList.splice(0, alpacaList.length)
    alpacaMeshes.forEach(v => scene.remove(v.group))
    alpacaMeshes.clear()
    score.value = 0
    respawnCoins()
    newData.x = 0
    newData.z = 0
    activeAlpacaId.value = id
    isPlaying.value = true
  }

  alpacaList.push(newData)
  spawnAlpacaMesh(newData)
  showCreation.value = false
}

const switchControl = (id) => {
  const oldPlayer = alpacaList.find(a => a.id === activeAlpacaId.value)
  if (oldPlayer) oldPlayer.aiState = 'idle'
  
  const newPlayer = alpacaList.find(a => a.id === id)
  if (newPlayer) {
    newPlayer.aiState = 'controlled'
    activeAlpacaId.value = id
  }
}

const takeControl = () => {
  if (selectedAlpacaProfile.value) {
    switchControl(selectedAlpacaProfile.value.id)
    showProfile.value = false
  }
}

const deleteAlpaca = () => {
  if (!selectedAlpacaProfile.value) return
  const id = selectedAlpacaProfile.value.id

  const meshObj = alpacaMeshes.get(id)
  if (meshObj) {
    scene.remove(meshObj.group)
    alpacaMeshes.delete(id)
  }

  const index = alpacaList.findIndex(a => a.id === id)
  if (index !== -1) alpacaList.splice(index, 1)

  if (id === activeAlpacaId.value && alpacaList.length > 0) {
    switchControl(alpacaList[0].id)
  } else if (alpacaList.length === 0) {
    openCreationMenu(true)
  }

  showProfile.value = false
  isDeleteConfirm.value = false
}

const closeProfile = () => {
  showProfile.value = false
  isDeleteConfirm.value = false
}

// ==============================
// 7. SAVE/LOAD SYSTEM
// ==============================
const saveGame = () => {
  const saveData = {
    farmName: farmName.value,
    score: score.value,
    world: { ...worldParams },
    colors: { ...palette },
    alpacas: alpacaList.map(a => ({ ...a }))
  }

  const blob = new Blob([JSON.stringify(saveData, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${farmName.value.replace(/\s+/g, '_')}.json`
  a.click()
  URL.revokeObjectURL(url)
}

const loadGame = () => {
  fileInput.value?.click()
}

const onLoadFile = (event) => {
  const file = event.target.files[0]
  if (!file) return

  const reader = new FileReader()
  reader.onload = (e) => {
    try {
      const data = JSON.parse(e.target.result)
      
      alpacaMeshes.forEach(v => scene.remove(v.group))
      alpacaMeshes.clear()
      alpacaList.splice(0, alpacaList.length)

      farmName.value = data.farmName || "Loaded Farm"
      score.value = data.score || 0
      Object.assign(worldParams, data.world)
      Object.assign(palette, data.colors)
      updateColors()

      if (data.alpacas) {
        data.alpacas.forEach(a => {
          alpacaList.push(a)
          spawnAlpacaMesh(a)
        })
      }

      buildFarm(worldParams.mapSize)
      
      if (alpacaList.length > 0) {
        const player = alpacaList.find(a => a.aiState === 'controlled') || alpacaList[0]
        activeAlpacaId.value = player.id
        player.aiState = 'controlled'
        isPlaying.value = true
      }

      respawnCoins()
    } catch (err) {
      console.error('Failed to load save:', err)
      alert('Failed to load save file')
    }
  }
  reader.readAsText(file)
}

const visitFriend = () => {
  visitInput.value?.click()
}

const loadVisitFile = (event) => {
  const file = event.target.files[0]
  if (!file) return

  const reader = new FileReader()
  reader.onload = (e) => {
    try {
      const data = JSON.parse(e.target.result)

      homeBackup = {
        farmName: farmName.value,
        score: score.value,
        worldParams: { ...worldParams },
        palette: { ...palette },
        alpacaList: JSON.parse(JSON.stringify(alpacaList))
      }

      const traveler = alpacaList.find(a => a.id === activeAlpacaId.value) || alpacaList[0]

      alpacaMeshes.forEach(v => scene.remove(v.group))
      alpacaMeshes.clear()
      alpacaList.splice(0, alpacaList.length)

      farmName.value = "Visiting: " + (data.farmName || "Unknown Farm")
      Object.assign(worldParams, data.world)
      Object.assign(palette, data.colors)
      updateColors()

      if (data.alpacas) {
        data.alpacas.forEach(a => {
          if (traveler && a.id === traveler.id) a.id = Date.now() + Math.random()
          a.aiState = 'idle'
          a.aiTimer = 0
          alpacaList.push(a)
          spawnAlpacaMesh(a)
        })
      }

      if (traveler) {
        traveler.x = 0
        traveler.z = 0
        traveler.aiState = 'controlled'
        alpacaList.push(traveler)
        spawnAlpacaMesh(traveler)
        activeAlpacaId.value = traveler.id
      }

      buildFarm(worldParams.mapSize)
      isVisiting.value = true
      isPlaying.value = true
      respawnCoins()
    } catch (err) {
      console.error('Failed to load visit file:', err)
      alert('Failed to load farm file')
    }
  }
  reader.readAsText(file)
}

const loadFriendFarm = async (username) => {
  // TODO: Implement API call to load friend's farm
  console.log('Loading farm for:', username)
}

const returnHome = () => {
  if (!homeBackup) return

  alpacaMeshes.forEach(v => scene.remove(v.group))
  alpacaMeshes.clear()
  alpacaList.splice(0, alpacaList.length)

  farmName.value = homeBackup.farmName
  score.value = homeBackup.score
  Object.assign(worldParams, homeBackup.worldParams)
  Object.assign(palette, homeBackup.palette)
  updateColors()

  homeBackup.alpacaList.forEach(a => {
    a.aiTimer = 0
    alpacaList.push(a)
    spawnAlpacaMesh(a)
  })

  buildFarm(worldParams.mapSize)
  isVisiting.value = false
  homeBackup = null
}

const updateColors = () => {
  if (scene) scene.background = new THREE.Color(palette.sky)
  if (scene?.fog) scene.fog.color = new THREE.Color(palette.sky)
  if (materials.ground) materials.ground.color = new THREE.Color(palette.ground)
  if (materials.wood) materials.wood.color = new THREE.Color(palette.fence)
  if (materials.skin) materials.skin.color = new THREE.Color(palette.skin)
  if (materials.hoof) materials.hoof.color = new THREE.Color(palette.hoof)
  if (materials.leaves) materials.leaves.color = new THREE.Color(palette.leaves)
  if (materials.trunk) materials.trunk.color = new THREE.Color(palette.wood)
  if (materials.stone) materials.stone.color = new THREE.Color(palette.stone)
}

// ==============================
// 8. SOCIAL FEATURES
// ==============================
const shareFarmProgress = () => {
  shareMessage.value = ''
  showShareModal.value = true
}

const postFarmUpdate = async () => {
  try {
    await socialStore.createPost({
      content: shareMessage.value || `Check out my alpaca farm!`,
      farmData: {
        farmName: farmName.value,
        alpacas: alpacaList.length,
        coins: score.value,
        decorations: decoGroup?.children.length || 0
      }
    })
    showShareModal.value = false
    router.push('/feed')
  } catch (error) {
    console.error('Failed to post farm update:', error)
  }
}

// ==============================
// 9. EVENT HANDLERS
// ==============================
const addEvents = () => {
  window.addEventListener('resize', onResize)
  window.addEventListener('keydown', onKeyDown)
  window.addEventListener('keyup', onKeyUp)
  renderer.domElement.addEventListener('click', onClick)
}

const removeEvents = () => {
  window.removeEventListener('resize', onResize)
  window.removeEventListener('keydown', onKeyDown)
  window.removeEventListener('keyup', onKeyUp)
  if (renderer?.domElement) {
    renderer.domElement.removeEventListener('click', onClick)
  }
}

const onResize = () => {
  if (!gameContainer.value || !camera || !renderer) return
  camera.aspect = gameContainer.value.clientWidth / gameContainer.value.clientHeight
  camera.updateProjectionMatrix()
  renderer.setSize(gameContainer.value.clientWidth, gameContainer.value.clientHeight)
}

const onKeyDown = (e) => {
  if (keyState.hasOwnProperty(e.code)) {
    keyState[e.code] = true
    
    // Prevent default for arrow keys to stop page scrolling
    if (e.code.startsWith('Arrow')) {
      e.preventDefault()
    }
    
    // Cancel click-to-move when using keyboard
    if (isPlaying.value && targetPosition.value) {
      targetPosition.value = null
      if (targetMarker) targetMarker.visible = false
    }
  }
}

const onKeyUp = (e) => {
  if (keyState.hasOwnProperty(e.code)) {
    keyState[e.code] = false
  }
}

const onClick = (e) => {
  if (!isPlaying.value) return

  const rect = renderer.domElement.getBoundingClientRect()
  pointer.x = ((e.clientX - rect.left) / rect.width) * 2 - 1
  pointer.y = -((e.clientY - rect.top) / rect.height) * 2 + 1

  raycaster.setFromCamera(pointer, camera)
  const intersects = raycaster.intersectObjects(scene.children, true)

  for (const hit of intersects) {
    // Check for alpaca click
    let obj = hit.object
    while (obj) {
      if (obj.userData?.isAlpaca) {
        const alpaca = alpacaList.find(a => a.id === obj.userData.id)
        if (alpaca) {
          selectedAlpacaProfile.value = alpaca
          showProfile.value = true
        }
        return
      }
      obj = obj.parent
    }

    // Ground click - move to location
    if (hit.object === groundMesh) {
      const limit = worldParams.mapSize - 1
      const x = Math.max(-limit, Math.min(limit, hit.point.x))
      const z = Math.max(-limit, Math.min(limit, hit.point.z))
      targetPosition.value = { x, z }
      targetMarker.position.set(x, 0.1, z)
      targetMarker.visible = true
      return
    }
  }
}

const retryInit = () => {
  errorMessage.value = ''
  loadingStatus.value = 'Retrying...'
  init3D()
}

// ==============================
// 10. TOUCH/MOBILE CONTROLS
// ==============================
const onJoystickStart = (e) => {
  e.preventDefault()
  const touch = e.touches[0]
  joystickTouchId = touch.identifier
  
  const rect = e.currentTarget.getBoundingClientRect()
  joystickCenter = {
    x: rect.left + rect.width / 2,
    y: rect.top + rect.height / 2
  }
  
  updateJoystick(touch.clientX, touch.clientY)
}

const onJoystickMove = (e) => {
  e.preventDefault()
  for (const touch of e.touches) {
    if (touch.identifier === joystickTouchId) {
      updateJoystick(touch.clientX, touch.clientY)
      break
    }
  }
}

const onJoystickEnd = (e) => {
  e.preventDefault()
  let touchFound = false
  for (const touch of e.touches) {
    if (touch.identifier === joystickTouchId) {
      touchFound = true
      break
    }
  }
  
  if (!touchFound) {
    joystickTouchId = null
    joystickPos.x = 0
    joystickPos.y = 0
    joystickInput.x = 0
    joystickInput.z = 0
  }
}

const updateJoystick = (touchX, touchY) => {
  const maxRadius = 40
  
  let dx = touchX - joystickCenter.x
  let dy = touchY - joystickCenter.y
  
  const distance = Math.sqrt(dx * dx + dy * dy)
  
  // Clamp to max radius
  if (distance > maxRadius) {
    dx = (dx / distance) * maxRadius
    dy = (dy / distance) * maxRadius
  }
  
  joystickPos.x = dx
  joystickPos.y = dy
  
  // Convert to normalized input (-1 to 1)
  joystickInput.x = dx / maxRadius
  joystickInput.z = dy / maxRadius  // Z is forward/backward
}
// ==============================
// 10. GUI SETUP
// ==============================
const initGUI = () => {
  if (gui) gui.destroy()
  gui = new GUI({ container: guiContainer.value, autoPlace: false })
  
  const worldFolder = gui.addFolder('World')
  worldFolder.add(worldParams, 'mapSize', 10, 50).step(5).onChange(() => buildFarm(worldParams.mapSize))
  worldFolder.add(worldParams, 'fogNear', 5, 50).onChange(() => { if (scene?.fog) scene.fog.near = worldParams.fogNear })
  worldFolder.add(worldParams, 'fogFar', 20, 100).onChange(() => { if (scene?.fog) scene.fog.far = worldParams.fogFar })
  
  const colorFolder = gui.addFolder('Colors')
  colorFolder.addColor(palette, 'sky').onChange(updateColors)
  colorFolder.addColor(palette, 'ground').onChange(updateColors)
  colorFolder.addColor(palette, 'fence').onChange(updateColors)
  colorFolder.addColor(palette, 'leaves').onChange(updateColors)
}
</script>

<style scoped>
.game-page {
  position: relative;
  width: 100%;
  height: 100vh;
  overflow: hidden;
  background: #1a1a2e;
}

.game-canvas {
  width: 100%;
  height: 100%;
}

/* Loading & Error Overlays */
.loading-overlay,
.error-overlay {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  z-index: 100;
}

.loading-content,
.error-content {
  text-align: center;
  color: white;
}

.loading-spinner {
  font-size: 4rem;
  animation: bounce 1s ease-in-out infinite;
}

@keyframes bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-20px); }
}

.error-icon {
  font-size: 4rem;
}

.error-content h3 {
  margin: 1rem 0;
}

/* Start Screen */
.start-screen {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.7);
  z-index: 50;
}

.start-content {
  text-align: center;
  color: white;
  padding: 2rem;
  max-width: 500px;
}

.start-content h1 {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.start-actions {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin: 2rem 0;
}

.controls-help {
  background: rgba(255, 255, 255, 0.1);
  padding: 1.5rem;
  border-radius: 12px;
  text-align: left;
}

.controls-help h4 {
  margin: 0 0 1rem;
}

.controls-help ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.controls-help li {
  margin: 0.5rem 0;
}

kbd {
  background: rgba(255, 255, 255, 0.2);
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-family: monospace;
}

/* Game HUD */
.game-hud {
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 30;
}

.game-hud > * {
  pointer-events: auto;
}

.hud-top {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 1rem;
}

.farm-info {
  background: rgba(0, 0, 0, 0.6);
  padding: 0.75rem 1.25rem;
  border-radius: 12px;
  color: white;
}

.farm-name {
  font-weight: bold;
  font-size: 1.1rem;
}

.visiting-badge {
  background: #667eea;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  margin-left: 0.5rem;
  font-size: 0.8rem;
}

.hud-stats {
  display: flex;
  gap: 1rem;
}

.stat {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: rgba(0, 0, 0, 0.6);
  padding: 0.75rem 1rem;
  border-radius: 12px;
  color: white;
}

.stat-icon {
  font-size: 1.25rem;
}

.stat-value {
  font-weight: bold;
  font-size: 1.1rem;
}

.hud-side {
  position: absolute;
  right: 1rem;
  top: 50%;
  transform: translateY(-50%);
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.hud-btn {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.6);
  border: none;
  color: white;
  font-size: 1.5rem;
  cursor: pointer;
  transition: all 0.2s;
}

.hud-btn:hover {
  background: rgba(0, 0, 0, 0.8);
  transform: scale(1.1);
}

.return-btn {
  background: #667eea;
}

/* Alpaca Sidebar */
.alpaca-sidebar {
  position: absolute;
  left: 1rem;
  top: 50%;
  transform: translateY(-50%);
  background: rgba(0, 0, 0, 0.6);
  padding: 1rem;
  border-radius: 12px;
  color: white;
  min-width: 180px;
}

.alpaca-sidebar h4 {
  margin: 0 0 0.75rem;
  font-size: 0.9rem;
  opacity: 0.8;
}

.alpaca-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  max-height: 300px;
  overflow-y: auto;
}

.alpaca-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.5rem;
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.2s;
}

.alpaca-item:hover {
  background: rgba(255, 255, 255, 0.1);
}

.alpaca-item.active {
  background: rgba(102, 126, 234, 0.5);
}

.alpaca-color {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  border: 2px solid white;
}

.alpaca-name {
  flex: 1;
  font-size: 0.9rem;
}

.control-badge {
  font-size: 0.8rem;
}

/* Settings Panel */
.settings-panel {
  position: absolute;
  right: 1rem;
  top: 1rem;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
  z-index: 40;
  min-width: 280px;
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  border-bottom: 1px solid #e4e6e9;
}

.panel-header h3 {
  margin: 0;
}

.gui-container {
  padding: 0.5rem;
}

/* Modal */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
}

.modal {
  background: white;
  border-radius: 16px;
  width: 90%;
  max-width: 400px;
  overflow: hidden;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.5rem;
  border-bottom: 1px solid #e4e6e9;
}

.modal-header h3 {
  margin: 0;
}

.close-btn {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: #f0f2f5;
  border: none;
  cursor: pointer;
  font-size: 1rem;
}

.modal-content {
  padding: 1.5rem;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  padding: 1rem 1.5rem;
  border-top: 1px solid #e4e6e9;
}

/* Form Elements */
.form-group {
  margin-bottom: 1rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 600;
  color: #333;
}

.form-input {
  width: 100%;
  padding: 0.75rem 1rem;
  border: 1px solid #e4e6e9;
  border-radius: 8px;
  font-size: 1rem;
}

.form-input:focus {
  outline: none;
  border-color: #667eea;
}

textarea.form-input {
  resize: vertical;
  min-height: 80px;
}

.color-picker {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.color-input {
  width: 50px;
  height: 40px;
  padding: 0;
  border: none;
  cursor: pointer;
}

.color-preview {
  width: 40px;
  height: 40px;
  border-radius: 8px;
  border: 1px solid #e4e6e9;
}

.color-value {
  color: #65676b;
  font-family: monospace;
}

.preset-colors {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-top: 0.5rem;
}

.preset-btn {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: 2px solid transparent;
  cursor: pointer;
  transition: transform 0.2s;
}

.preset-btn:hover {
  transform: scale(1.2);
}

/* Profile Modal */
.profile-preview {
  text-align: center;
  margin-bottom: 1.5rem;
}

.alpaca-preview {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2.5rem;
}

.profile-stats {
  background: #f8f9fa;
  border-radius: 8px;
  padding: 1rem;
}

.stat-row {
  display: flex;
  justify-content: space-between;
  padding: 0.5rem 0;
  border-bottom: 1px solid #e4e6e9;
}

.stat-row:last-child {
  border-bottom: none;
}

.stat-label {
  color: #65676b;
}

/* Share Modal */
.share-preview {
  margin: 1rem 0;
}

.preview-card {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 1.5rem;
  border-radius: 12px;
  text-align: center;
}

.preview-header {
  font-size: 1.25rem;
  font-weight: bold;
  margin-bottom: 0.5rem;
}

.preview-stats {
  display: flex;
  justify-content: center;
  gap: 2rem;
  opacity: 0.9;
}

/* Buttons */
.btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-large {
  padding: 1rem 2rem;
  font-size: 1.1rem;
}

.btn-primary {
  background: #667eea;
  color: white;
}

.btn-primary:hover {
  background: #5a6fd6;
}

.btn-secondary {
  background: #e4e6e9;
  color: #333;
}

.btn-secondary:hover {
  background: #d8dadc;
}

.btn-danger {
  background: #dc2626;
  color: white;
}

.btn-danger:hover {
  background: #b91c1c;
}

/* Responsive */
@media (max-width: 768px) {
  .alpaca-sidebar {
    display: none;
  }

  .hud-side {
    bottom: 1rem;
    top: auto;
    right: 1rem;
    transform: none;
    flex-direction: row;
  }
}

/* Mobile Touch Controls */
.mobile-controls {
  position: fixed;
  bottom: 2rem;
  left: 2rem;
  z-index: 100;
  touch-action: none;
}

.joystick-zone {
  width: 120px;
  height: 120px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.joystick-base {
  width: 100px;
  height: 100px;
  background: rgba(0, 0, 0, 0.3);
  border: 3px solid rgba(255, 255, 255, 0.4);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

.joystick-knob {
  width: 40px;
  height: 40px;
  background: rgba(255, 255, 255, 0.8);
  border-radius: 50%;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
  transition: transform 0.05s ease-out;
}

.mobile-note {
  font-size: 0.85rem;
  color: #666;
  margin-top: 0.5rem;
  display: none;
}

@media (max-width: 768px) {
  .mobile-note {
    display: block;
  }
  
  .controls-help ul li:first-child,
  .controls-help ul li:nth-child(4) {
    display: none;
  }
}
</style>
