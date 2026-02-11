// Shared Three.js Game Logic for Pong-style game
// This can be used by both Angular and Vue frontends

import * as THREE from 'three';

export class PongGame {
  constructor(container) {
    this.container = container;
    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.paddle1 = null;
    this.paddle2 = null;
    this.ball = null;
    this.score = { player1: 0, player2: 0 };
    this.ballVelocity = { x: 0.02, y: 0.02, z: 0 };
    this.animationId = null;
    this.init();
  }

  // init() {
  //   // Scene setup (now synchronous with static import)
    
  //   // Scene setup
  //   this.scene = new THREE.Scene();
  //   this.scene.background = new THREE.Color(0x000033);
    
  //   // Camera setup
  //   this.camera = new THREE.PerspectiveCamera(
  //     75,
  //     this.container.clientWidth / this.container.clientHeight,
  //     0.1,
  //     1000
  //   );
  //   this.camera.position.z = 5;
    
  //   // Renderer setup
  //   this.renderer = new THREE.WebGLRenderer({ antialias: true });
  //   this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
  //   this.container.appendChild(this.renderer.domElement);
    
  //   // Create game objects
  //   this.createPaddles(THREE);
  //   this.createBall(THREE);
  //   this.createField(THREE);
    
  //   // Start animation
  //   this.animationId = 1; // Initialize to enable animation
  //   this.animate();
  // }
   init() {
    // Check WebGL support
    if (!this.checkWebGLSupport()) {
      throw new Error('WebGL is not supported on this browser/device. Please try Firefox or enable hardware acceleration in Chrome.');
    }
    
    // Scene setup
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x000033);
    
    // Camera setup
    this.camera = new THREE.PerspectiveCamera(
      75,
      this.container.clientWidth / this.container.clientHeight,
      0.1,
      1000
    );
    this.camera.position.z = 5;
    
    // Renderer setup with error handling
    try {
      this.renderer = new THREE.WebGLRenderer({ 
        antialias: true,
        alpha: true,
        // Fallback options for problematic systems
        context: this.createWebGL1Context(),
        powerPreference: 'high-performance',
        failIfMajorPerformanceCaveat: false // Allow software rendering as fallback
      });
      this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
      this.container.appendChild(this.renderer.domElement);
    } catch (error) {
      console.error('WebGL initialization failed:', error);
      throw new Error('Failed to initialize 3D graphics. Your system may not support WebGL or hardware acceleration is disabled.');
    }
    
    // Create game objects
    this.createPaddles(THREE);
    this.createBall(THREE);
    this.createField(THREE);
    
    // Start animation
    this.animationId = 1;
    this.animate();
  }

  checkWebGLSupport() {
    try {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      return !!gl;
    } catch (e) {
      return false;
    }
  }

  createWebGL1Context() {
    const canvas = document.createElement('canvas');
    const contextAttributes = {
      alpha: true,
      antialias: true,
      depth: true,
      stencil: false,
      powerPreference: 'high-performance',
      failIfMajorPerformanceCaveat: false
    };
    
    // Try WebGL1 only (skip WebGL2)
    return canvas.getContext('webgl', contextAttributes) || 
           canvas.getContext('experimental-webgl', contextAttributes);
  }

  createPaddles(THREE) {
    const paddleGeometry = new THREE.BoxGeometry(0.2, 1, 0.2);
    const paddleMaterial = new THREE.MeshPhongMaterial({ color: 0x00ff00 });
    
    this.paddle1 = new THREE.Mesh(paddleGeometry, paddleMaterial);
    this.paddle1.position.x = -4;
    this.scene.add(this.paddle1);
    
    this.paddle2 = new THREE.Mesh(paddleGeometry, paddleMaterial);
    this.paddle2.position.x = 4;
    this.scene.add(this.paddle2);
  }

  createBall(THREE) {
    const ballGeometry = new THREE.SphereGeometry(0.15, 32, 32);
    const ballMaterial = new THREE.MeshPhongMaterial({ color: 0xffffff });
    this.ball = new THREE.Mesh(ballGeometry, ballMaterial);
    this.scene.add(this.ball);
  }

  createField(THREE) {
    // Add lighting
    const ambientLight = new THREE.AmbientLight(0x404040);
    this.scene.add(ambientLight);
    
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
    directionalLight.position.set(0, 10, 10);
    this.scene.add(directionalLight);
    
    // Add field lines
    const lineMaterial = new THREE.LineBasicMaterial({ color: 0x00ffff });
    const points = [];
    points.push(new THREE.Vector3(0, -3, 0));
    points.push(new THREE.Vector3(0, 3, 0));
    const lineGeometry = new THREE.BufferGeometry().setFromPoints(points);
    const centerLine = new THREE.Line(lineGeometry, lineMaterial);
    this.scene.add(centerLine);
  }

  animate() {
    if (!this.animationId) return;
    this.animationId = requestAnimationFrame(() => this.animate());
    
    // Update ball position
    this.ball.position.x += this.ballVelocity.x;
    this.ball.position.y += this.ballVelocity.y;
    
    // Ball collision with top/bottom
    if (this.ball.position.y > 3 || this.ball.position.y < -3) {
      this.ballVelocity.y *= -1;
    }
    
    // Ball collision with paddles
    if (this.checkPaddleCollision(this.paddle1) || this.checkPaddleCollision(this.paddle2)) {
      this.ballVelocity.x *= -1;
    }
    
    // Ball out of bounds
    if (this.ball.position.x > 5) {
      this.score.player1++;
      this.resetBall();
    } else if (this.ball.position.x < -5) {
      this.score.player2++;
      this.resetBall();
    }
    
    this.renderer.render(this.scene, this.camera);
  }

  checkPaddleCollision(paddle) {
    const distance = this.ball.position.distanceTo(paddle.position);
    return distance < 0.6;
  }

  resetBall() {
    this.ball.position.set(0, 0, 0);
    this.ballVelocity.x = (Math.random() > 0.5 ? 1 : -1) * 0.02;
    this.ballVelocity.y = (Math.random() - 0.5) * 0.02;
  }

  movePaddle(paddleNumber, direction) {
    const paddle = paddleNumber === 1 ? this.paddle1 : this.paddle2;
    const newY = paddle.position.y + direction * 0.1;
    if (newY >= -2.5 && newY <= 2.5) {
      paddle.position.y = newY;
    }
  }

  getScore() {
    return this.score;
  }

  resize() {
    this.camera.aspect = this.container.clientWidth / this.container.clientHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
  }

  dispose() {
    // Stop animation loop
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
    
    if (this.renderer) {
      this.renderer.dispose();
      if (this.container.contains(this.renderer.domElement)) {
        this.container.removeChild(this.renderer.domElement);
      }
    }
  }
}
