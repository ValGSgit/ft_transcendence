import express from 'express';
import { authenticate } from '../middleware/auth.js';
import { errorResponse, successResponse } from '../utils/response.js';

const router = express.Router();

// Admin middleware
const requireAdmin = (req, res, next) => {
  if (!req.user || !req.user.is_admin) {
    return errorResponse(res, 'Admin access required', 403);
  }
  next();
};

// Get system architecture diagram
router.get('/diagram', authenticate, requireAdmin, (req, res) => {
  const mermaidDiagram = `graph TB
    subgraph "Infrastructure Layer"
        Docker[Docker Containers]
        Nginx[Nginx Reverse Proxy]
        SSL[Certbot SSL/TLS]
        
        Docker --> Nginx
        SSL --> Nginx
    end
    
    subgraph "Frontend Layer - Vue 3"
        VueApp[Vue Application]
        ViteServer[Vite Dev Server]
        Router[Vue Router]
        Pinia[Pinia State Management]
        ThreeJS[Three.js Engine]
        
        VueApp --> Router
        VueApp --> Pinia
        VueApp --> ThreeJS
        Vite[Vite Build] --> VueApp
    end
    
    subgraph "API Gateway"
        Express[Express.js Server]
        SocketIO[Socket.io Server]
        PassportAuth[Passport OAuth]
        
        Express --> PassportAuth
        SocketIO -.Real-time.-> Express
    end
    
    subgraph "Middleware Layer"
        AuthMW[Authentication]
        ErrorMW[Error Handler]
        AdminMW[Admin Guard]
        HelmetSec[Helmet Security]
        CORS[CORS Handler]
        
        Express --> AuthMW
        Express --> ErrorMW
        Express --> AdminMW
        Express --> HelmetSec
        Express --> CORS
    end
    
    subgraph "Controller Layer"
        AuthCtrl[Auth Controller]
        UserCtrl[User Controller]
        GameCtrl[Game Controller]
        ChatCtrl[Chat Controller]
        FriendCtrl[Friend Controller]
        PostCtrl[Post Controller]
        NotifCtrl[Notification Controller]
    end
    
    subgraph "Service Layer"
        AIService[AI Service]
        SocketService[Socket Service]
        GameEngine[Pong Game Engine]
        
        GameCtrl --> GameEngine
        ChatCtrl --> SocketService
        GameCtrl --> AIService
    end
    
    subgraph "Model Layer - ORM"
        UserModel[User Model]
        GameModel[Game Model]
        ChatModel[Chat Model]
        FriendModel[Friend Model]
        PostModel[Post Model]
        NotifModel[Notification Model]
        
        AuthCtrl --> UserModel
        UserCtrl --> UserModel
        GameCtrl --> GameModel
        ChatCtrl --> ChatModel
        FriendCtrl --> FriendModel
        PostCtrl --> PostModel
        NotifCtrl --> NotifModel
    end
    
    subgraph "Database Layer"
        DBAdapter[Database Adapter]
        SQLite[(SQLite - Dev)]
        PostgreSQL[(PostgreSQL - Prod)]
        
        DBAdapter -->|NODE_ENV=dev| SQLite
        DBAdapter -->|NODE_ENV=prod| PostgreSQL
        
        UserModel --> DBAdapter
        GameModel --> DBAdapter
        ChatModel --> DBAdapter
        FriendModel --> DBAdapter
        PostModel --> DBAdapter
        NotifModel --> DBAdapter
    end
    
    subgraph "External Services"
        OAuth42[42 OAuth]
        OAuthGoogle[Google OAuth]
        OAuthGitHub[GitHub OAuth]
        
        PassportAuth --> OAuth42
        PassportAuth --> OAuthGoogle
        PassportAuth --> OAuthGitHub
    end
    
    subgraph "Frontend Views"
        Login[Login/Register]
        Home[Home Dashboard]
        Game[Game View]
        Chat[Messages]
        Feed[Social Feed]
        Friends[Friends List]
        Profile[User Profile]
        Settings[Settings]
        Admin[Admin Panel]
        
        Router --> Login
        Router --> Home
        Router --> Game
        Router --> Chat
        Router --> Feed
        Router --> Friends
        Router --> Profile
        Router --> Settings
        Router --> Admin
    end
    
    subgraph "Frontend Services"
        APIService[API Service]
        SocketClient[Socket Client]
        AuthStore[Auth Store]
        ChatStore[Chat Store]
        SocialStore[Social Store]
        ThemeStore[Theme Store]
        
        Login --> APIService
        Home --> APIService
        Game --> APIService
        Chat --> SocketClient
        Feed --> APIService
        
        APIService --> AuthStore
        SocketClient --> ChatStore
        APIService --> SocialStore
        Settings --> ThemeStore
    end
    
    %% External Connections
    Nginx -->|Port 443 HTTPS| VueApp
    Nginx -->|/api Route| Express
    Nginx -->|WebSocket| SocketIO
    
    APIService -->|HTTP/REST| Express
    SocketClient -->|WebSocket| SocketIO
    
    %% Styling
    classDef infrastructure fill:#2c3e50,stroke:#34495e,color:#ecf0f1
    classDef frontend fill:#3498db,stroke:#2980b9,color:#ecf0f1
    classDef backend fill:#e74c3c,stroke:#c0392b,color:#ecf0f1
    classDef database fill:#27ae60,stroke:#229954,color:#ecf0f1
    classDef external fill:#f39c12,stroke:#d68910,color:#2c3e50
    
    class Docker,Nginx,SSL infrastructure
    class VueApp,Router,Pinia,ThreeJS,ViteServer,Vite frontend
    class Express,SocketIO,PassportAuth,AuthMW,ErrorMW,AdminMW backend
    class SQLite,PostgreSQL,DBAdapter database
    class OAuth42,OAuthGoogle,OAuthGitHub external`;

  return successResponse(res, {
    diagram: mermaidDiagram,
    type: 'graph',
    title: 'ft_transcendence System Architecture',
    description: 'Complete system architecture showing all layers from infrastructure to database'
  });
});

// Get system statistics (admin only)
router.get('/stats', authenticate, requireAdmin, async (req, res) => {
  try {
    const stats = {
      system: {
        nodeVersion: process.version,
        environment: process.env.NODE_ENV,
        uptime: process.uptime(),
        memory: process.memoryUsage()
      },
      database: {
        type: process.env.DB_TYPE === 'postgres' ? 'PostgreSQL' : 'SQLite',
        path: process.env.DATABASE_PATH || 'data/transcendence.db'
      }
    };
    
    return successResponse(res, stats);
  } catch (error) {
    return errorResponse(res, 'Failed to fetch stats', 500, error.message);
  }
});

export default router;
