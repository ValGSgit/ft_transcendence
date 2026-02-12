<template>
  <div class="admin-diagram">
    <h1>System Architecture & Flow Diagrams</h1>
    
    <!-- Tab selector -->
    <div class="tabs">
      <button 
        :class="{ active: activeTab === 'architecture' }" 
        @click="activeTab = 'architecture'"
      >
        Architecture Overview
      </button>
      <button 
        :class="{ active: activeTab === 'flow' }" 
        @click="activeTab = 'flow'"
      >
        Step-by-Step Flow
      </button>
    </div>
    
    <!-- Architecture Diagram -->
    <div v-if="activeTab === 'architecture'" class="diagram-container">
      <div v-if="loading">Loading architecture diagram...</div>
      <div v-else-if="error" class="error">{{ error }}</div>
      <div v-else id="architecture-diagram" class="mermaid">{{ architectureDiagram }}</div>
    </div>
    
    <!-- Flow Diagram -->
    <div v-if="activeTab === 'flow'" class="diagram-container">
      <div v-if="loading">Loading flow diagram...</div>
      <div v-else-if="error" class="error">{{ error }}</div>
      <div v-else id="flow-diagram" class="mermaid">{{ flowDiagram }}</div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, watch } from 'vue';
import api from '../services/api';
import mermaid from 'mermaid';

export default {
  name: 'AdminDiagram',
  setup() {
    const activeTab = ref('architecture');
    const architectureDiagram = ref('');
    const flowDiagram = ref('');
    const loading = ref(true);
    const error = ref(null);

    const fetchDiagrams = async () => {
      try {
        loading.value = true;
        error.value = null;
        
        // Fetch architecture diagram
        const archResponse = await api.get('/admin/architecture');
        architectureDiagram.value = archResponse.data.data.diagram;
        
        // Fetch flow diagram
        const flowResponse = await api.get('/admin/flow');
        flowDiagram.value = flowResponse.data.data.diagram;
        
        loading.value = false;
        
        // Render diagrams
        mermaid.initialize({ 
          startOnLoad: true,
          theme: 'default',
          securityLevel: 'loose',
          sequence: {
            actorMargin: 50,
            width: 150
          }
        });
        
        setTimeout(() => {
          mermaid.contentLoaded();
        }, 100);
      } catch (err) {
        error.value = err.response?.data?.message || 'Failed to load diagrams';
        loading.value = false;
      }
    };

    onMounted(() => {
      fetchDiagrams();
    });

    // Re-render when switching tabs
    watch(activeTab, () => {
      setTimeout(() => {
        mermaid.contentLoaded();
      }, 100);
    });

    return {
      activeTab,
      architectureDiagram,
      flowDiagram,
      loading,
      error
    };
  }
};
</script>

<style scoped>
.admin-diagram {
  padding: 2rem;
  max-width: 1400px;
  margin: 0 auto;
}

h1 {
  margin-bottom: 2rem;
  color: #2c3e50;
}

.tabs {
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
  border-bottom: 2px solid #e0e0e0;
}

.tabs button {
  padding: 0.75rem 1.5rem;
  background: none;
  border: none;
  border-bottom: 3px solid transparent;
  cursor: pointer;
  font-size: 1rem;
  color: #666;
  transition: all 0.3s;
}

.tabs button:hover {
  color: #42b883;
}

.tabs button.active {
  color: #42b883;
  border-bottom-color: #42b883;
  font-weight: 600;
}

.diagram-container {
  background: white;
  border-radius: 8px;
  padding: 2rem;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  overflow-x: auto;
}

.mermaid {
  text-align: center;
}

.error {
  color: #e74c3c;
  padding: 1rem;
  background: #fee;
  border-radius: 4px;
  border: 1px solid #e74c3c;
}

/* Responsive scrolling for large diagrams */
@media (max-width: 768px) {
  .diagram-container {
    padding: 1rem;
  }
  
  .admin-diagram {
    padding: 1rem;
  }
}
</style>