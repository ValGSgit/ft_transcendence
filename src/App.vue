<script setup>
// --- IMPORTS (Like #include in C++) ---
// 'ref' and 'reactive' are used to create variables that the UI listens to.
// 'onMounted' and 'onUnmounted' are lifecycle hooks (constructor/destructor logic).
import { onMounted, onUnmounted, ref, reactive, nextTick } from 'vue'

// Import the entire Three.js library (The 3D Engine)
import * as THREE from 'three'

// Import specific camera controls (OrbitControls allows mouse dragging)
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'

// Import a lightweight GUI library for the right-hand settings panel
import GUI from 'lil-gui'

// ==============================
// 1. APP STATE (Global Variables for the UI)
// ==============================

// 'ref(null)' creates a reactive reference.
// This is like a pointer that starts null but will point to the HTML <div> later.
const container = ref(null) 
const guiContainer = ref(null) // Pointer to the settings panel div
const fileInput = ref(null)    // Pointer to the hidden file input (for loading)
const visitInput = ref(null)   // Pointer to the hidden visit input

// Boolean flags (State Machine)
const isEngineReady = ref(false) // True when 3D scene is fully built
const loadingStatus = ref("Waiting for DOM...") // String for UI feedback
const errorMessage = ref("")     // Error string
const isPlaying = ref(false)     // True = Game Mode, False = Lobby/Menu Mode
const isVisiting = ref(false)    // True = Visiting another farm save file
const showPanel = ref(false)     // Toggle for Settings Menu
const showProfile = ref(false)   // Toggle for Alpaca Profile Popup
const showCreation = ref(false)  // Toggle for "New Game" Popup
const isDeleteConfirm = ref(false) // Toggle for "Are you sure?" delete button
const score = ref(0)             // Integer for coins collected

// Strings and Integers
const farmName = ref("My Happy Farm")
const activeAlpacaId = ref(0)    // ID of the alpaca the player is currently controlling
const selectedAlpacaProfile = ref(null) // Pointer to the alpaca data currently clicked on

// Storage for Home State
// When visiting another farm, we save our current farm data here (like a backup struct)
let homeBackup = null

// 'reactive' creates a JavaScript Object (like a C struct or Map) that Vue watches for changes.
const creationData = reactive({ 
  isPlayer: false, // Boolean: Is this a new game (true) or just adding an NPC (false)?
  name: "",        // String
  color: "#f5f5dc" // Hex Color String
})

// Array to store all Alpaca Data Objects (Like std::vector<AlpacaData>)
const alpacaList = reactive([])

// Configuration Struct for World Settings
const worldParams = reactive({ 
  mapSize: 30, 
  fogNear: 20, 
  fogFar: 80 
})

// Configuration Struct for Colors
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

// Input State Struct (Tracks which keys are pressed down)
const keyState = reactive({ 
  ArrowUp: false, ArrowDown: false, ArrowLeft: false, ArrowRight: false, 
  KeyW: false, KeyS: false, KeyA: false, KeyD: false 
})

// ==============================
// 2. THREE.JS GLOBALS (Pointers to 3D Objects)
// ==============================
let renderer, scene, camera, controls, animationId, gui
let fenceGroup, decoGroup, groundMesh, dirLight, targetMarker

// A Map to link IDs to 3D Meshes. (Like std::map<int, MeshData>)
// We need this to find the 3D model when we have the Data ID.
const alpacaMeshes = new Map()

const clock = new THREE.Clock()   // Handles delta time
const coins = []                  // Array of Coin Meshes
const raycaster = new THREE.Raycaster() // Physics ray for mouse clicking
const pointer = new THREE.Vector2()     // Mouse X,Y coordinates
const targetPosition = ref(null)        // Where the player clicked to walk

// Object to store Materials (Shaders) so we don't recreate them every frame
const materials = {}

// ==============================
// 3. INITIALIZATION (Like 'int main()')
// ==============================

// onMounted runs when the HTML component is inserted into the page.
onMounted(async () => {
  try {
    // await nextTick() waits for one UI update cycle to ensure HTML exists
    await nextTick()
    
    // Retry Loop: sometimes HTML takes a few milliseconds to render.
    // This is a safety check to ensure 'container' is not null.
    let attempts = 0
    while (!container.value && attempts < 10) { 
      await new Promise(r => setTimeout(r, 100)) // Sleep 100ms
      attempts++ 
    }
    
    // If still null, throw error
    if (!container.value) throw new Error("Canvas container missing")
    
    // Call the setup function
    init3D()
  } catch (err) { 
    errorMessage.value = err.message; 
    loadingStatus.value = "CRASHED" 
  }
})

// Function to initialize the 3D Engine
const init3D = () => {
  loadingStatus.value = "Initializing..."
  
  // Create Materials (Like compiling shaders)
  // flatShading: true gives it that low-poly look
  const matConfig = { flatShading: true }
  materials.skin = new THREE.MeshLambertMaterial({ color: palette.skin, ...matConfig })
  materials.hoof = new THREE.MeshLambertMaterial({ color: palette.hoof, ...matConfig })
  materials.wood = new THREE.MeshLambertMaterial({ color: palette.fence, ...matConfig })
  materials.ground = new THREE.MeshLambertMaterial({ color: palette.ground, ...matConfig })
  materials.coin = new THREE.MeshLambertMaterial({ color: 0xFFD700, ...matConfig })
  materials.leaves = new THREE.MeshLambertMaterial({ color: palette.leaves, ...matConfig })
  materials.trunk = new THREE.MeshLambertMaterial({ color: palette.wood, ...matConfig })
  materials.stone = new THREE.MeshLambertMaterial({ color: palette.stone, ...matConfig })
  // NEW: Shiny Black Eye Material
  materials.eyes = new THREE.MeshStandardMaterial({ 
    color: 0x111111, // Almost black
    roughness: 0.1,  // Very smooth (shiny)
    metalness: 0.5,  // Slightly metallic (reflective)
    flatShading: true
  })


  // Create Scene (The world container)
  scene = new THREE.Scene()
  scene.background = new THREE.Color(palette.sky)
  scene.fog = new THREE.Fog(palette.sky, worldParams.fogNear, worldParams.fogFar)

  // Create Camera (Perspective view)
  camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000)
  camera.position.set(0, 18, 24) // Set initial XYZ position

  // Create Renderer (The OpenGL/WebGL context)
  renderer = new THREE.WebGLRenderer({ antialias: false }) 
  renderer.setSize(window.innerWidth, window.innerHeight)
  renderer.shadowMap.enabled = true // Turn on shadows
  renderer.shadowMap.type = THREE.PCFSoftShadowMap
  
  // Append the <canvas> element to our HTML container
  container.value.appendChild(renderer.domElement)

  // Create Lights
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.7) // Soft global light
  scene.add(ambientLight)
  
  dirLight = new THREE.DirectionalLight(0xffffff, 1.0) // Sun light
  dirLight.position.set(30, 50, 20)
  dirLight.castShadow = true
  dirLight.shadow.mapSize.set(2048, 2048) // Shadow texture resolution
  
  // Configure shadow camera frustum (how much area shadows cover)
  const d = 60; 
  dirLight.shadow.camera.left = -d; dirLight.shadow.camera.right = d; 
  dirLight.shadow.camera.top = d; dirLight.shadow.camera.bottom = -d;
  scene.add(dirLight)

  // Create Groups (Empty containers for objects)
  fenceGroup = new THREE.Group(); scene.add(fenceGroup)
  decoGroup = new THREE.Group(); scene.add(decoGroup)

  // Create Click Marker (The yellow ring)
  const ringGeo = new THREE.RingGeometry(0.4, 0.6, 16)
  targetMarker = new THREE.Mesh(ringGeo, new THREE.MeshBasicMaterial({ color: 0xFFFF00, side: THREE.DoubleSide, transparent: true, opacity: 0.6 }))
  targetMarker.rotation.x = -Math.PI / 2; // Rotate flat on ground
  targetMarker.visible = false; 
  scene.add(targetMarker)

  // Create Ground Plane
  groundMesh = new THREE.Mesh(new THREE.PlaneGeometry(300, 300), materials.ground)
  groundMesh.rotation.x = -Math.PI / 2; 
  groundMesh.receiveShadow = true; 
  scene.add(groundMesh)

  // Initial Level Build
  buildFarm(worldParams.mapSize)
  
  // Controls (Mouse interaction)
  controls = new OrbitControls(camera, renderer.domElement)
  controls.enableDamping = true // Smooth camera movement
  controls.maxPolarAngle = Math.PI / 2 - 0.1 // Prevent camera going underground
  
  // Attach Event Listeners
  addEvents()
  
  // Start the Game Loop
  animate()
  
  // Flag system as ready
  isEngineReady.value = true
}

// ==============================
// 4. VISIT SYSTEM (Loading other JSONs)
// ==============================

// Helper to trigger the hidden file input click
const triggerVisit = () => {
  if (visitInput.value) {
    visitInput.value.value = null; // 👈 reset file input
    visitInput.value.click();
  }
}

// Logic for loading a visiting file
const loadVisitFile = (event) => {
  const file = event.target.files[0]; if (!file) return
  const reader = new FileReader()
  
  reader.onload = (e) => {
    try {
      const data = JSON.parse(e.target.result) // Deserialize JSON
      
      // Backup current state to memory
      homeBackup = {
        farmName: farmName.value,
        worldParams: { ...worldParams },
        palette: { ...palette },
        alpacaList: JSON.parse(JSON.stringify(alpacaList)) // Deep copy
      }
      
      // Find the player character to take with us
      const traveler = alpacaList.find(a => a.id === activeAlpacaId.value) || alpacaList[0]
      if (!traveler) throw new Error("No traveler found!")

      // Clear 3D Scene
      alpacaMeshes.forEach(v => scene.remove(v.group)); alpacaMeshes.clear()
      alpacaList.splice(0, alpacaList.length) 

      // Load new world settings
      farmName.value = "Visiting: " + (data.farmName || "Unknown Farm")
      Object.assign(worldParams, data.world)
      Object.assign(palette, data.colors)
      updateColors()
      
      // Add visiting alpacas (Set them to AI mode)
      if (data.alpacas) {
        data.alpacas.forEach(a => {
          if (a.id === traveler.id) a.id = Date.now() + Math.random() // Prevent ID conflict
          a.aiState = 'idle'; a.aiTimer = 0; // Force AI
          alpacaList.push(a); spawnAlpacaMesh(a)
        })
      }
      
      // Add Traveler
      traveler.x = 0; traveler.z = 0; traveler.aiState = 'controlled'
      alpacaList.push(traveler); spawnAlpacaMesh(traveler)
      
      // Rebuild geometry
      buildFarm(worldParams.mapSize)
      activeAlpacaId.value = traveler.id
      isVisiting.value = true
      respawnCoins() // Add coins to new world

    } catch (err) { 
      console.error(err)
      alert("Failed to load farm file.") 
    }
  }
  reader.readAsText(file)
}

// Logic to return to original state
const returnHome = () => {
  if (!homeBackup) return
  
  // Clear scene
  alpacaMeshes.forEach(v => scene.remove(v.group)); alpacaMeshes.clear()
  alpacaList.splice(0, alpacaList.length)
  
  // Restore Backup
  farmName.value = homeBackup.farmName
  Object.assign(worldParams, homeBackup.worldParams)
  Object.assign(palette, homeBackup.palette)
  updateColors()
  
  // Respawn home alpacas
  homeBackup.alpacaList.forEach(a => { a.aiTimer = 0; alpacaList.push(a); spawnAlpacaMesh(a) })
  
  buildFarm(worldParams.mapSize)
  isVisiting.value = false
  homeBackup = null // Delete backup
}

// ==============================
// 5. OBJECT FACTORY (Mesh Generators)
// ==============================

// Helper to create a Box Mesh with shadows
const createBlock = (w, h, d, mat, x, y, z) => {
    const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat)
    m.position.set(x,y,z)
    m.castShadow=true
    m.receiveShadow=true
    return m
}

// Opens the menu to input name/color
const openCreationMenu = (isPlayer) => {
  creationData.isPlayer = isPlayer
  creationData.name = isPlayer ? "Player One" : "Alpaca " + (alpacaList.length + 1)
  creationData.color = '#' + Math.floor(Math.random()*16777215).toString(16) // Random Hex
  showCreation.value = true
}

// Confirms creation and spawns object
const confirmCreation = () => {
  const id = Date.now() // Use timestamp as unique ID
  const range = worldParams.mapSize - 3
  
  // Create Data Object
  const newData = { 
    id, name: creationData.name, color: creationData.color, speed: 0.12, 
    x: (Math.random() - 0.5) * range * 2, z: (Math.random() - 0.5) * range * 2, 
    yRot: Math.random() * Math.PI * 2,
    aiState: creationData.isPlayer ? 'controlled' : 'idle', aiTimer: 0, 
    targetX: null, targetZ: null
  }

  // If New Game, clear everything first
  if (creationData.isPlayer) {
    alpacaList.splice(0, alpacaList.length) // Clear Array
    alpacaMeshes.forEach(v => scene.remove(v.group)); alpacaMeshes.clear() // Clear Meshes
    score.value = 0; respawnCoins(); newData.x = 0; newData.z = 0 
    activeAlpacaId.value = id; isPlaying.value = true
  }

  // Add to list and spawn 3D model
  alpacaList.push(newData)
  spawnAlpacaMesh(newData)
  showCreation.value = false
}

// Delete Logic
const deleteAlpaca = () => {
  if(!selectedAlpacaProfile.value) return
  const id = selectedAlpacaProfile.value.id
  
  // Remove 3D Mesh
  const meshObj = alpacaMeshes.get(id)
  if(meshObj) { scene.remove(meshObj.group); alpacaMeshes.delete(id) }
  
  // Remove Data
  const index = alpacaList.findIndex(a => a.id === id)
  if(index !== -1) alpacaList.splice(index, 1)
  
  // If we deleted the player, switch to another alpaca or reset
  if(id === activeAlpacaId.value && alpacaList.length > 0) switchControl(alpacaList[0].id)
  else if (alpacaList.length === 0) openCreationMenu(true) // Game Over -> New Game
  
  showProfile.value = false; isDeleteConfirm.value = false
}

// Function to construct the Alpaca 3D Model
const spawnAlpacaMesh = (data) => {
  const group = new THREE.Group()
  group.position.set(data.x, 0, data.z); group.rotation.y = data.yRot
  group.userData = { isAlpaca: true, id: data.id }

  const bodyGroup = new THREE.Group()
  group.add(bodyGroup)

  const woolMat = new THREE.MeshLambertMaterial({ color: data.color, flatShading: true })

  const hipHeight = 0.9 
  
  // Body Parts
  bodyGroup.add(createBlock(1.2, 1.0, 1.8, woolMat, 0, hipHeight + 0.5, 0)) // Torso
  bodyGroup.add(createBlock(0.6, 0.6, 0.6, woolMat, 0, hipHeight + 1.3, 0.6)) // Neck Low
  bodyGroup.add(createBlock(0.6, 0.6, 0.6, woolMat, 0, hipHeight + 1.9, 0.6)) // Neck High
  
  // HEAD
  bodyGroup.add(createBlock(0.8, 0.8, 0.8, woolMat, 0, hipHeight + 2.6, 0.7)) 

  // FACE
  bodyGroup.add(createBlock(0.6, 0.4, 0.2, materials.skin, 0, hipHeight + 2.4, 1.2)) // Snout
  bodyGroup.add(createBlock(0.2, 0.3, 0.2, woolMat, 0.25, hipHeight + 3.15, 0.5)) // Ear L
  bodyGroup.add(createBlock(0.2, 0.3, 0.2, woolMat, -0.25, hipHeight + 3.15, 0.5)) // Ear R

  // --- NEW: EYES ---
  // Position: On the front face of the head (z=1.1), spaced apart (x=0.25), slightly up (y=2.7)
  const eyeSize = 0.12
  bodyGroup.add(createBlock(eyeSize, eyeSize, 0.05, materials.eyes, 0.25, hipHeight + 2.7, 1.11)) // Left Eye
  bodyGroup.add(createBlock(eyeSize, eyeSize, 0.05, materials.eyes, -0.25, hipHeight + 2.7, 1.11)) // Right Eye

  // Legs
  const legs = []; const createLeg = (x, z) => {
    const g = new THREE.Group()
    g.add(createBlock(0.35, 0.7, 0.35, woolMat, 0, -0.35, 0))
    g.add(createBlock(0.35, 0.2, 0.35, materials.hoof, 0, -0.8, 0))
    g.position.set(x, hipHeight, z); return g
  }
  const FL = createLeg(-0.4, 0.6); const FR = createLeg(0.4, 0.6)
  const BL = createLeg(-0.4, -0.6); const BR = createLeg(0.4, -0.6)
  group.add(FL, FR, BL, BR); legs.push(FL, FR, BL, BR)

  scene.add(group)
  alpacaMeshes.set(data.id, { group, bodyGroup, legs, woolMat, walkTime: Math.random() * 10 })
}

// Generates Fences and Decorations
const buildFarm = (size) => {
  if(!fenceGroup) return
  while(fenceGroup.children.length > 0) fenceGroup.remove(fenceGroup.children[0]) 
  
  const createFence = (x, z, rotated) => {
    const g = new THREE.Group()
    g.add(createBlock(0.3, 1.5, 0.3, materials.wood, 0, 0.75, 0)) 
    g.add(createBlock(2.1, 0.2, 0.15, materials.wood, 1, 1.1, 0)) 
    g.add(createBlock(2.1, 0.2, 0.15, materials.wood, 1, 0.6, 0)) 
    g.position.set(x, 0, z); if(rotated) g.rotation.y = Math.PI/2; fenceGroup.add(g)
  }
  // Loop around perimeter
  for(let i = -size; i <= size; i+=2) {
    createFence(i, -size, false); createFence(i, size, false);
    createFence(-size, i, true); createFence(size, i, true);
  }
  buildDecorations(size)
}

const buildDecorations = (size) => {
  while(decoGroup.children.length > 0) decoGroup.remove(decoGroup.children[0]) 
  const count = Math.floor(size * 1.5)
  for(let i=0; i<count; i++) {
     const x = (Math.random() - 0.5) * (size * 1.8); const z = (Math.random() - 0.5) * (size * 1.8)
     if(Math.abs(x) < 5 && Math.abs(z) < 5) continue; // Keep center clear
     const type = Math.random()
     
     if (type > 0.7) { // Tree
        const tree = new THREE.Group(); tree.position.set(x, 0, z)
        tree.add(createBlock(0.6, 2, 0.6, materials.trunk, 0, 1, 0))
        tree.add(createBlock(2.2, 1.2, 2.2, materials.leaves, 0, 2.6, 0))
        tree.add(createBlock(1.6, 1.0, 1.6, materials.leaves, 0, 3.7, 0))
        decoGroup.add(tree)
     } else if (type > 0.4) { // Rock
        const rock = createBlock(0.8+Math.random(), 0.5+Math.random(), 0.8+Math.random(), materials.stone, x, 0.25, z)
        rock.rotation.y = Math.random(); decoGroup.add(rock)
     } else { // Grass
        const grass = createBlock(0.1, 0.6, 0.1, materials.leaves, x, 0.3, z)
        grass.rotation.y = Math.random(); decoGroup.add(grass)
     }
  }
}

// ==============================
// 6. GAME LOOP (The Heartbeat)
// ==============================

const animate = () => {
  animationId = requestAnimationFrame(animate) // Request next frame
  const delta = clock.getDelta() // Time since last frame
  const time = clock.getElapsedTime()

  if (isPlaying.value) {
    
    // Iterate over ALL Alpacas
    alpacaList.forEach(stats => {
      const meshObj = alpacaMeshes.get(stats.id)
      if(!meshObj) return

      let isMoving = false
      const isPlayer = (stats.id === activeAlpacaId.value)

      if (isPlayer) {
        // Handle Player Input
        isMoving = updatePlayerInput(meshObj.group, stats)
        
        // Move Camera & Light
        controls.target.lerp(meshObj.group.position, 0.1)
        dirLight.position.set(meshObj.group.position.x + 20, 30, meshObj.group.position.z + 10)
        dirLight.target.position.copy(meshObj.group.position)
        dirLight.target.updateMatrixWorld()
        
        checkCoinCollisions(time, meshObj.group)
      } else {
        // Handle AI Logic
        isMoving = updateAIBehavior(meshObj.group, stats, delta)
      }

      // Animate Legs
      updateLegAnimation(meshObj, isMoving, delta)
    })

    updateNameTags()
  } else {
    // Spin alpacas in Lobby
    alpacaMeshes.forEach(m => m.group.rotation.y += 0.005)
  }

  controls.update()
  renderer.render(scene, camera)
}

const updatePlayerInput = (mesh, stats) => {
    let isMoving = false
    let dx = 0, dz = 0
    const isKeyPressed = Object.values(keyState).some(v => v)
    const boundary = worldParams.mapSize - 1.0

    // Keyboard Input
    if (isKeyPressed) {
        if (keyState.ArrowLeft || keyState.KeyA) mesh.rotation.y += 0.04
        if (keyState.ArrowRight || keyState.KeyD) mesh.rotation.y -= 0.04
        let dir = 0
        if (keyState.ArrowUp || keyState.KeyW) dir = 1
        if (keyState.ArrowDown || keyState.KeyS) dir = -1
        if (dir !== 0) {
            dx = Math.sin(mesh.rotation.y) * stats.speed * dir
            dz = Math.cos(mesh.rotation.y) * stats.speed * dir
        }
    } else if (targetPosition.value) {
        // Mouse Input
        const dist = mesh.position.distanceTo(targetPosition.value)
        if (dist > 0.2) { 
            const angle = Math.atan2(targetPosition.value.x - mesh.position.x, targetPosition.value.z - mesh.position.z)
            let angleDiff = angle - mesh.rotation.y
            while (angleDiff > Math.PI) angleDiff -= Math.PI * 2
            while (angleDiff < -Math.PI) angleDiff += Math.PI * 2
            mesh.rotation.y += angleDiff * 0.08
            dx = Math.sin(mesh.rotation.y) * stats.speed
            dz = Math.cos(mesh.rotation.y) * stats.speed
        } else {
            targetPosition.value = null; if(targetMarker) targetMarker.visible = false
        }
    }

    // Apply Movement with Boundary Check
    if (dx !== 0 || dz !== 0) {
        const nextX = mesh.position.x + dx
        const nextZ = mesh.position.z + dz
        if (nextX > -boundary && nextX < boundary) mesh.position.x += dx
        if (nextZ > -boundary && nextZ < boundary) mesh.position.z += dz
        isMoving = true
        stats.x = mesh.position.x; stats.z = mesh.position.z; stats.yRot = mesh.rotation.y
    }
    return isMoving
}

const updateAIBehavior = (mesh, stats, delta) => {
  const boundary = worldParams.mapSize - 2.0
  
  if (stats.aiState === 'idle') {
    stats.aiTimer -= delta
    if (stats.aiTimer <= 0) {
      // Pick new target
      stats.targetX = (Math.random() - 0.5) * (boundary * 2)
      stats.targetZ = (Math.random() - 0.5) * (boundary * 2)
      stats.aiState = 'moving'
    }
    return false 
  } 
  
  if (stats.aiState === 'moving') {
    const target = new THREE.Vector3(stats.targetX, 0, stats.targetZ)
    const dist = mesh.position.distanceTo(target)
    
    if (dist > 0.5) {
      // Turn and Walk
      const angle = Math.atan2(target.x - mesh.position.x, target.z - mesh.position.z)
      let angleDiff = angle - mesh.rotation.y
      while (angleDiff > Math.PI) angleDiff -= Math.PI * 2
      while (angleDiff < -Math.PI) angleDiff += Math.PI * 2
      mesh.rotation.y += angleDiff * 0.05
      
      const dx = Math.sin(mesh.rotation.y) * (stats.speed * 0.5) 
      const dz = Math.cos(mesh.rotation.y) * (stats.speed * 0.5)
      mesh.position.x += dx; mesh.position.z += dz
      
      stats.x = mesh.position.x; stats.z = mesh.position.z; stats.yRot = mesh.rotation.y
      return true 
    } else {
      // Arrived
      stats.aiState = 'idle'
      stats.aiTimer = 2 + Math.random() * 4
      return false
    }
  }
  return false
}

const updateLegAnimation = (obj, isMoving, delta) => {
    if (isMoving) {
        obj.walkTime += delta * 12
        obj.bodyGroup.position.y = Math.sin(obj.walkTime * 2) * 0.05
        obj.legs[0].rotation.x = Math.sin(obj.walkTime) * 0.5
        obj.legs[3].rotation.x = Math.sin(obj.walkTime) * 0.5
        obj.legs[1].rotation.x = Math.sin(obj.walkTime + Math.PI) * 0.5
        obj.legs[2].rotation.x = Math.sin(obj.walkTime + Math.PI) * 0.5
    } else {
        const lerp = 0.1
        obj.bodyGroup.position.y = THREE.MathUtils.lerp(obj.bodyGroup.position.y, 0, lerp)
        obj.legs.forEach(l => l.rotation.x = THREE.MathUtils.lerp(l.rotation.x, 0, lerp))
    }
}

// Projects 3D position to 2D screen space for Name Tags
const updateNameTags = () => {
  alpacaList.forEach(alpaca => {
    const meshObj = alpacaMeshes.get(alpaca.id)
    if(meshObj) {
      const headPos = meshObj.group.position.clone()
      headPos.y += 5.0 
      headPos.project(camera)
      const x = (headPos.x * .5 + .5) * container.value.clientWidth
      const y = (headPos.y * -.5 + .5) * container.value.clientHeight
      alpaca.screenX = x; alpaca.screenY = y
      
      const isBehind = (Math.abs(headPos.z) > 1) || (headPos.z > 1)
      // Check if this alpaca is the one selected in the profile menu
      const isMenuOpenForThisAlpaca = showProfile.value && selectedAlpacaProfile.value && selectedAlpacaProfile.value.id === alpaca.id
      alpaca.visible = !isBehind && !isMenuOpenForThisAlpaca
    }
  })
}

// ==============================
// 7. EVENTS & LISTENERS
// ==============================

const onDoubleClick = (event) => {
  if (!isPlaying.value) return
  pointer.x = (event.clientX / window.innerWidth) * 2 - 1
  pointer.y = -(event.clientY / window.innerHeight) * 2 + 1
  raycaster.setFromCamera(pointer, camera)

  // Raycast scene
  const hits = raycaster.intersectObjects(scene.children, true)
  
  // Check if we hit an alpaca
  const alpacaHit = hits.find(h => {
     let obj = h.object
     while(obj) { if (obj.userData && obj.userData.isAlpaca) return true; obj = obj.parent }
     return false
  })

  if (alpacaHit) {
     let obj = alpacaHit.object
     while(!obj.userData.isAlpaca) obj = obj.parent
     const id = obj.userData.id
     const profile = alpacaList.find(a => a.id === id)
     if(profile) { 
        selectedAlpacaProfile.value = profile
        isDeleteConfirm.value = false
        showProfile.value = true 
     }
     return 
  }

  // Check if we hit the ground (Move Command)
  const groundHit = hits.find(h => h.object === groundMesh)
  if (groundHit) {
      targetPosition.value = new THREE.Vector3(groundHit.point.x, 0, groundHit.point.z)
      if(targetMarker) { targetMarker.position.set(groundHit.point.x, 0.1, groundHit.point.z); targetMarker.visible = true }
  }
}

const switchControl = (id) => {
  const oldStats = alpacaList.find(a => a.id === activeAlpacaId.value)
  if(oldStats) { oldStats.aiState = 'idle'; oldStats.aiTimer = 0 }

  activeAlpacaId.value = id
  const newStats = alpacaList.find(a => a.id === id)
  if(newStats) { newStats.aiState = 'controlled'; newStats.targetX = null }

  showProfile.value = false 
  targetPosition.value = null
  if(targetMarker) targetMarker.visible = false
}

const spawnCoin = () => {
  const range = worldParams.mapSize - 2
  const x = (Math.random() - 0.5) * (range * 2); const z = (Math.random() - 0.5) * (range * 2)
  const coin = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.6, 0.1), materials.coin)
  coin.position.set(x, 1, z); coin.castShadow = true; coin.userData = { offset: Math.random() * 10 }
  scene.add(coin); coins.push(coin)
}
const respawnCoins = () => {
  for(const c of coins) scene.remove(c); coins.length = 0
  for(let i=0; i<10; i++) spawnCoin()
}
const checkCoinCollisions = (time, activeGroup) => {
    if(!activeGroup) return
    for (let i = coins.length - 1; i >= 0; i--) {
        const coin = coins[i]
        coin.rotation.y += 0.05
        coin.position.y = 1 + Math.sin(time * 3 + coin.userData.offset) * 0.2
        if (activeGroup.position.distanceTo(coin.position) < 1.2) {
            scene.remove(coin); coins.splice(i, 1); score.value++      
        }
    }
}

const saveGame = () => {
  const jsonStr = JSON.stringify({ alpacas: alpacaList, world: worldParams, colors: palette, score: score.value, active: activeAlpacaId.value, farmName: farmName.value }, null, 2)
  const blob = new Blob([jsonStr], { type: "application/json" })
  const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = `alpacafarm.json`; a.click(); URL.revokeObjectURL(url)
}
const triggerLoad = () => fileInput.value.click()
const loadGame = (event) => {
  const file = event.target.files[0]; if (!file) return
  const reader = new FileReader()
  reader.onload = (e) => {
    try {
      const data = JSON.parse(e.target.result)
      alpacaList.splice(0, alpacaList.length)
      alpacaMeshes.forEach(v => scene.remove(v.group)); alpacaMeshes.clear()
      Object.assign(worldParams, data.world); Object.assign(palette, data.colors); 
      score.value = data.score || 0
      farmName.value = data.farmName || "My Farm"
      activeAlpacaId.value = data.active || 0
      data.alpacas.forEach(a => { a.aiTimer = 0; alpacaList.push(a); spawnAlpacaMesh(a) })
      buildFarm(worldParams.mapSize)
      isPlaying.value = true
      respawnCoins()
    } catch (err) { alert("Invalid Save File!") }
  }
  reader.readAsText(file)
}

const togglePanel = () => { showPanel.value = !showPanel.value; if(showPanel.value) nextTick(() => setupGui()); else if(gui) gui.destroy() }
const setupGui = () => {
  if(!guiContainer.value) return; if(gui) gui.destroy()
  gui = new GUI({ container: guiContainer.value, width: '100%' })
  const wFolder = gui.addFolder('World')
  wFolder.add(worldParams, 'mapSize', 10, 50, 2).onChange(buildFarm)
  wFolder.add(worldParams, 'fogNear', 0, 100).onChange(v => scene.fog.near = v)
  wFolder.add(worldParams, 'fogFar', 50, 200).onChange(v => scene.fog.far = v)
  const cFolder = gui.addFolder('Colors')
  cFolder.addColor(palette, 'sky').onChange(c => { scene.background.set(c); scene.fog.color.set(c) })
  cFolder.addColor(palette, 'ground').onChange(c => materials.ground.color.set(c))
  cFolder.addColor(palette, 'fence').onChange(c => materials.wood.color.set(c))
  cFolder.addColor(palette, 'leaves').onChange(c => materials.leaves.color.set(c))
  cFolder.addColor(palette, 'skin').onChange(c => materials.skin.color.set(c))
  cFolder.addColor(palette, 'hoof').onChange(c => materials.hoof.color.set(c))
}

const updateColors = () => {
  materials.skin.color.set(palette.skin); materials.hoof.color.set(palette.hoof); materials.wood.color.set(palette.fence); materials.ground.color.set(palette.ground); materials.coin.color.set(0xFFD700); materials.leaves.color.set(palette.leaves); materials.trunk.color.set(palette.wood); materials.stone.color.set(palette.stone)
  if(scene) { scene.background.set(palette.sky); scene.fog.color.set(palette.sky); scene.fog.near = worldParams.fogNear; scene.fog.far = worldParams.fogFar }
}

const addEvents = () => {
  window.addEventListener('keydown', (e) => { if(['ArrowUp','ArrowDown','ArrowLeft','ArrowRight','Space'].includes(e.code)) e.preventDefault(); keyState[e.code] = true; targetPosition.value = null })
  window.addEventListener('keyup', (e) => keyState[e.code] = false)
  window.addEventListener('resize', () => { if(camera && renderer) { camera.aspect = window.innerWidth / window.innerHeight; camera.updateProjectionMatrix(); renderer.setSize(window.innerWidth, window.innerHeight) } })
  window.addEventListener('dblclick', onDoubleClick)
}
onUnmounted(() => { if(gui) gui.destroy(); cancelAnimationFrame(animationId); if(renderer) renderer.dispose() })
</script>

<template>
  <div class="app-wrapper">
    <input type="file" ref="fileInput" @change="loadGame" style="display: none" accept=".json" />
    <input type="file" ref="visitInput" @change="loadVisitFile" style="display: none" accept=".json" />

    <div v-if="!isPlaying" class="lobby-overlay">
      <div class="lobby-box">
        <h1>Voxel Alpaca Farm</h1>
        <div v-if="isEngineReady" class="lobby-buttons">
          <button class="btn large primary" @click="openCreationMenu(true)">✨ New Game</button>
          <button class="btn large" @click="triggerLoad">📂 Load</button>
        </div>
        <p v-else>{{ loadingStatus }}</p>
        <p v-if="errorMessage" style="color:red">{{ errorMessage }}</p>
      </div>
    </div>

    <div v-if="showCreation" class="panel creation-panel" style="z-index: 3000;">
      <h3>{{ creationData.isPlayer ? "Start New Farm" : "New Alpaca" }}</h3>
      <label>Name</label> <input v-model="creationData.name" type="text" maxlength="15" />
      <label>Coat Color</label> <input v-model="creationData.color" type="color" />
      <button class="btn primary full" @click="confirmCreation">Spawn</button>
      <button v-if="!creationData.isPlayer" class="btn close" @click="showCreation = false">Cancel</button>
      <button v-else class="btn close" @click="showCreation = false">Back</button>
    </div>

    <div v-if="isPlaying" class="game-ui">
      <div class="farm-title">{{ farmName }}</div>

      <div v-for="alp in alpacaList" :key="alp.id" 
           class="name-tag-floating"
           :class="{ active: alp.id === activeAlpacaId }"
           :style="{ 
             top: alp.screenY + 'px', 
             left: alp.screenX + 'px', 
             display: (alp.visible && (!showProfile || selectedAlpacaProfile?.id !== alp.id)) ? 'block' : 'none' 
           }">
        {{ alp.name }}
      </div>

      <div class="top-bar">
        <div class="score-board">💰 {{ score }}</div>
        <button class="btn primary small" @click="openCreationMenu(false)">➕ Alpaca</button>
      </div>

      <div v-if="showPanel" class="panel settings-panel">
        <h3>Settings</h3>
        <label>Farm Name</label><input v-model="farmName" type="text" />
        <div ref="guiContainer" class="gui-embed"></div>
        <button class="btn close" @click="togglePanel">Close</button>
      </div>

      <div v-if="showProfile && selectedAlpacaProfile" class="panel profile-panel">
        <h3>{{ selectedAlpacaProfile.name }}</h3>
        <label>Name</label><input v-model="selectedAlpacaProfile.name" type="text" />
        <label>Color</label><input v-model="selectedAlpacaProfile.color" type="color" @input="alpacaMeshes.get(selectedAlpacaProfile.id).woolMat.color.set(selectedAlpacaProfile.color)" />
        <label>Speed</label><input v-model.number="selectedAlpacaProfile.speed" type="range" min="0.05" max="0.3" step="0.01" />
        <label>Eyes</label><input v-model.number="selectedAlpacaProfile.eyeSize" type="range" min="0.05" max="0.3" step="0.01" />
        <hr/>
        
        <button class="btn primary full" v-if="selectedAlpacaProfile.id !== activeAlpacaId" @click="switchControl(selectedAlpacaProfile.id)">🎮 Possess</button>
        <p v-else class="status-txt">Currently Playing</p>

        <div class="delete-section">
          <button v-if="!isDeleteConfirm" class="btn danger full" @click="isDeleteConfirm = true">🗑️ Delete</button>
          <div v-else class="confirm-row">
            <span class="warning">Sure?</span>
            <button class="btn danger small" @click="deleteAlpaca">Yes</button>
            <button class="btn small" @click="isDeleteConfirm = false">No</button>
          </div>
        </div>
        <button class="btn close" @click="showProfile = false">Close</button>
      </div>

      <div class="bottom-bar">
        <button class="btn" @click="respawnCoins">🔄 Respawn</button>
        <button class="btn" @click="togglePanel">⚙️ Settings</button> 
        <button class="btn save" @click="saveGame">💾 Save</button>
        <button class="btn visit" v-if="!isVisiting" @click="triggerVisit">✈️ Visit</button>
        <button class="btn visit" v-else @click="returnHome">🏠 Return</button>
      </div>
    </div>
    <div ref="container" class="canvas-container"></div>
  </div>
</template>

<style>
html, body, #app { margin: 0; padding: 0; width: 100%; height: 100%; overflow: hidden; font-family: 'Segoe UI', sans-serif; }
</style>
<style scoped>
.canvas-container { width: 100%; height: 100%; display: block; background: #000; }
.app-wrapper { position: relative; width: 100%; height: 100%; }

.farm-title { position: absolute; top: 20px; width: 100%; text-align: center; font-size: 2rem; font-weight: bold; color: white; text-shadow: 2px 2px 4px rgba(0,0,0,0.5); pointer-events: none; z-index: 5; }
.name-tag-floating { position: absolute; transform: translate(-50%, -100%); color: white; font-weight: bold; font-size: 11px; text-shadow: 1px 1px 2px black; pointer-events: none; white-space: nowrap; z-index: 10; }
.name-tag-floating.active { color: #FFD700; font-size: 12px; text-shadow: 0 0 3px #FFA500; }

.lobby-overlay { position: absolute; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.6); backdrop-filter: blur(5px); z-index: 2000; display: flex; justify-content: center; align-items: center; }
.lobby-box { background: white; padding: 40px; border-radius: 20px; text-align: center; box-shadow: 0 20px 50px rgba(0,0,0,0.5); }
.lobby-buttons { display: flex; gap: 20px; margin-top: 20px; }

.game-ui { position: absolute; top: 0; left: 0; width: 100%; height: 100%; pointer-events: none; display: flex; flex-direction: column; justify-content: space-between; padding: 20px; box-sizing: border-box; }
.top-bar { display: flex; justify-content: space-between; pointer-events: auto; z-index: 20; }
.score-board { font-size: 1.5rem; font-weight: bold; color: white; text-shadow: 2px 2px 0 #000; }
.bottom-bar { display: flex; gap: 10px; justify-content: center; pointer-events: auto; z-index: 20; }

.panel { position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); background: rgba(255, 255, 255, 0.98); padding: 20px; border-radius: 12px; box-shadow: 0 20px 60px rgba(0,0,0,0.5); pointer-events: auto; width: 300px; text-align: left; z-index: 100; max-height: 80vh; overflow-y: auto; }
.panel h3 { margin: 0 0 15px; border-bottom: 1px solid #ddd; padding-bottom: 10px; text-align: center; }
.panel label { display: block; margin-top: 10px; font-weight: bold; font-size: 0.85rem; color: #555; }
.panel input { width: 100%; padding: 5px; margin-top: 3px; box-sizing: border-box; border: 1px solid #ccc; border-radius: 4px; }
.panel .close { width: 100%; margin-top: 15px; background: #999; color: white; border: none; }
.gui-embed { margin-top: 10px; width: 100%; }
.status-txt { color: green; font-weight: bold; text-align: center; margin: 10px 0; }
.delete-section { margin-top: 15px; border-top: 1px solid #eee; padding-top: 10px; }
.confirm-row { display: flex; gap: 10px; align-items: center; justify-content: center; }
.warning { color: red; font-weight: bold; font-size: 0.9rem; }

:deep(.lil-gui) { --width: 100%; --name-width: 45%; }
:deep(.lil-gui .title) { display: none; } 

.btn { background: white; border: 1px solid #ccc; padding: 8px 16px; border-radius: 6px; font-weight: bold; cursor: pointer; box-shadow: 0 2px 0 #999; transition: transform 0.1s; pointer-events: auto; }
.btn:active { transform: translateY(2px); box-shadow: 0 0 0 #999; }
.btn.primary { background: #FFD700; border-color: #DAA520; color: #333; }
.btn.danger { background: #ff4444; border-color: #cc0000; color: white; }
.btn.visit { background: #87CEEB; border-color: #0077be; color: #fff; text-shadow: 1px 1px 0 #000; }
.btn.save { background: #4CAF50; border-color: #388E3C; color: white; }
.btn.large { font-size: 1.2rem; padding: 15px 30px; }
.btn.small { font-size: 0.9rem; padding: 5px 10px; }
.btn.full { width: 100%; margin-top: 10px; }
</style>