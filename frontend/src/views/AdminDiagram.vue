<template>
  <div class="admin-diagram">
    <div class="diagram-header">
      <h1>🔧 System Architecture Diagram</h1>
      <p class="subtitle">Complete technical overview of ft_transcendence</p>
      <div class="admin-badge">
        <span class="badge">🛡️ Admin Only</span>
      </div>
    </div>

    <div v-if="loading" class="loading">
      <div class="spinner"></div>
      <p>Loading system diagram...</p>
    </div>

    <div v-else-if="error" class="error">
      <p>{{ error }}</p>
      <router-link to="/" class="btn-back">Return Home</router-link>
    </div>

    <div v-else class="diagram-container">
      <div class="diagram-info">
        <h2>{{ diagramData.title }}</h2>
        <p>{{ diagramData.description }}</p>
      </div>

      <div class="mermaid-wrapper">
        <div ref="mermaidContainer" class="mermaid">
          {{ diagramData.diagram }}
        </div>
      </div>

      <div class="diagram-legend">
        <h3>Architecture Layers</h3>
        <div class="legend-grid">
          <div class="legend-item">
            <span class="color-box infrastructure"></span>
            <span>Infrastructure (Docker, Nginx, SSL)</span>
          </div>
          <div class="legend-item">
            <span class="color-box frontend"></span>
            <span>Frontend (Vue 3, Vite, Three.js)</span>
          </div>
          <div class="legend-item">
            <span class="color-box backend"></span>
            <span>Backend (Express, Socket.io, Passport)</span>
          </div>
          <div class="legend-item">
            <span class="color-box database"></span>
            <span>Database (SQLite/PostgreSQL)</span>
          </div>
          <div class="legend-item">
            <span class="color-box external"></span>
            <span>External Services (OAuth Providers)</span>
          </div>
        </div>
      </div>

      <div class="diagram-actions">
        <button @click="downloadDiagram" class="btn-download">
          📥 Download as SVG
        </button>
        <button @click="refreshDiagram" class="btn-refresh">
          🔄 Refresh
        </button>
        <router-link to="/" class="btn-back">← Back to Home</router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick } from 'vue';
import { useRouter } from 'vue-router';
import api from '../services/api';
import mermaid from 'mermaid';

const router = useRouter();
const loading = ref(true);
const error = ref(null);
const diagramData = ref(null);
const mermaidContainer = ref(null);

// Initialize Mermaid
mermaid.initialize({
  startOnLoad: false,
  theme: 'default',
  securityLevel: 'loose',
  flowchart: {
    useMaxWidth: true,
    htmlLabels: true,
    curve: 'basis'
  }
});

const fetchDiagram = async () => {
  try {
    loading.value = true;
    error.value = null;
    
    const response = await api.get('/admin/diagram');
    
    if (response.data.success) {
      diagramData.value = response.data.data;
      
      // Render Mermaid diagram
      await nextTick();
      await renderMermaid();
    } else {
      throw new Error(response.data.error || 'Failed to load diagram');
    }
  } catch (err) {
    console.error('Error fetching diagram:', err);
    
    if (err.response?.status === 403) {
      error.value = '🚫 Access Denied: Admin privileges required';
    } else if (err.response?.status === 401) {
      error.value = '🔒 Authentication required';
      router.push('/login');
    } else {
      error.value = '❌ Failed to load diagram: ' + (err.message || 'Unknown error');
    }
  } finally {
    loading.value = false;
  }
};

const renderMermaid = async () => {
  if (!mermaidContainer.value || !diagramData.value) return;
  
  try {
    const elementId = 'mermaid-diagram-' + Date.now();
    const { svg } = await mermaid.render(elementId, diagramData.value.diagram);
    mermaidContainer.value.innerHTML = svg;
  } catch (err) {
    console.error('Mermaid rendering error:', err);
    error.value = 'Failed to render diagram';
  }
};

const downloadDiagram = () => {
  if (!mermaidContainer.value) return;
  
  const svgElement = mermaidContainer.value.querySelector('svg');
  if (!svgElement) return;
  
  const svgData = new XMLSerializer().serializeToString(svgElement);
  const blob = new Blob([svgData], { type: 'image/svg+xml' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = 'ft_transcendence_architecture.svg';
  link.click();
  
  URL.revokeObjectURL(url);
};

const refreshDiagram = () => {
  fetchDiagram();
};

onMounted(() => {
  fetchDiagram();
});
</script>

<style scoped>
.admin-diagram {
  max-width: 1400px;
  margin: 0 auto;
  padding: 2rem;
  min-height: 100vh;
}

.diagram-header {
  text-align: center;
  margin-bottom: 3rem;
  padding: 2rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 12px;
  color: white;
}

.diagram-header h1 {
  margin: 0 0 0.5rem 0;
  font-size: 2.5rem;
  font-weight: 700;
}

.subtitle {
  margin: 0 0 1rem 0;
  font-size: 1.1rem;
  opacity: 0.95;
}

.admin-badge {
  margin-top: 1rem;
}

.badge {
  display: inline-block;
  padding: 0.5rem 1rem;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 20px;
  font-size: 0.9rem;
  font-weight: 600;
  backdrop-filter: blur(10px);
}

.loading {
  text-align: center;
  padding: 4rem 2rem;
}

.spinner {
  width: 50px;
  height: 50px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #667eea;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 1rem;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.error {
  text-align: center;
  padding: 3rem 2rem;
  background: #fee;
  border-radius: 8px;
  color: #c33;
}

.error p {
  margin-bottom: 1.5rem;
  font-size: 1.1rem;
}

.diagram-container {
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.diagram-info {
  padding: 2rem;
  background: #f8f9fa;
  border-bottom: 2px solid #e9ecef;
}

.diagram-info h2 {
  margin: 0 0 0.5rem 0;
  color: #2c3e50;
  font-size: 1.8rem;
}

.diagram-info p {
  margin: 0;
  color: #6c757d;
  font-size: 1rem;
}

.mermaid-wrapper {
  padding: 2rem;
  overflow-x: auto;
  background: #fff;
}

.mermaid {
  display: flex;
  justify-content: center;
  min-height: 400px;
}

.diagram-legend {
  padding: 2rem;
  background: #f8f9fa;
  border-top: 2px solid #e9ecef;
}

.diagram-legend h3 {
  margin: 0 0 1rem 0;
  color: #2c3e50;
}

.legend-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.color-box {
  width: 24px;
  height: 24px;
  border-radius: 4px;
  border: 2px solid #dee2e6;
}

.color-box.infrastructure {
  background: #2c3e50;
}

.color-box.frontend {
  background: #3498db;
}

.color-box.backend {
  background: #e74c3c;
}

.color-box.database {
  background: #27ae60;
}

.color-box.external {
  background: #f39c12;
}

.diagram-actions {
  display: flex;
  gap: 1rem;
  padding: 2rem;
  background: #fff;
  border-top: 2px solid #e9ecef;
  flex-wrap: wrap;
}

.btn-download,
.btn-refresh,
.btn-back {
  padding: 0.75rem 1.5rem;
  border-radius: 6px;
  font-weight: 600;
  text-decoration: none;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
  font-size: 1rem;
}

.btn-download {
  background: #667eea;
  color: white;
}

.btn-download:hover {
  background: #5568d3;
  transform: translateY(-2px);
}

.btn-refresh {
  background: #27ae60;
  color: white;
}

.btn-refresh:hover {
  background: #229954;
  transform: translateY(-2px);
}

.btn-back {
  background: #6c757d;
  color: white;
  display: inline-block;
}

.btn-back:hover {
  background: #5a6268;
  transform: translateY(-2px);
}

/* Dark mode support */
@media (prefers-color-scheme: dark) {
  .diagram-container,
  .diagram-info,
  .diagram-legend,
  .diagram-actions {
    background: #1a1a1a;
    color: #e0e0e0;
  }

  .diagram-info,
  .diagram-legend {
    background: #2a2a2a;
  }

  .diagram-info h2,
  .diagram-legend h3 {
    color: #e0e0e0;
  }

  .diagram-info p {
    color: #b0b0b0;
  }

  .mermaid-wrapper {
    background: #1a1a1a;
  }
}

/* Responsive */
@media (max-width: 768px) {
  .admin-diagram {
    padding: 1rem;
  }

  .diagram-header h1 {
    font-size: 1.8rem;
  }

  .diagram-actions {
    flex-direction: column;
  }

  .btn-download,
  .btn-refresh,
  .btn-back {
    width: 100%;
  }
}
</style>
