# Contributing to Transcendence

Thank you for considering contributing to Transcendence! This document provides guidelines and best practices for contributing to the project.

## � Team Structure

**Product Owner**: vagarcia
- Defines project vision and roadmap
- Manages backlog and module priorities
- Ensures compliance with 42 subject requirements
- Makes final decisions on features and architecture

**Development Team**:
- Full-stack development (Vue 3 + Express.js)
- Code review and quality assurance
- Testing and documentation
- DevOps and deployment

### Working with the Product Owner

- All major architectural decisions require PO approval
- Module selection and priority defined in BACKLOG.md
- Feature requests should align with module strategy
- Regular sync on progress and blockers

## �📋 Table of Contents

## 📋 Table of Contents

- [Team Structure](#team-structure)
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [Code Style](#code-style)
- [Testing](#testing)
- [Pull Request Process](#pull-request-process)
- [Project Structure](#project-structure)
- [Questions](#questions)

## 🚀 Getting Started

For team members working on the same repository:

1. **Clone the repository**:
   ```bash
   git clone <repository-url>
   cd transcendence
   ```
2. **Create a feature branch**:
   ```bash
   git checkout -b feature/your-feature-name
   ```
3. **Keep your branch updated**:
   ```bash
   git pull origin main  # or Val, depending on your base branch
   ```

For external contributors:

1. **Fork the repository** on GitHub
2. **Clone your fork** locally
3. **Add upstream remote**:
   ```bash
   git remote add upstream <original-repository-url>
   ```
4. **Create a feature branch** from your fork

## 🛠️ Development Setup

### Install Dependencies

```bash
# Install all dependencies (backend + frontend)
make install

# Or manually:
npm install
cd backend && npm install
cd ../frontend && npm install
```

### Start Development Servers

```bash
# Start both backend and frontend with hot reload
make dev

# Or separately:
# Terminal 1 - Backend
cd backend && npm run dev

# Terminal 2 - Frontend
cd frontend && npm run dev
```

### Environment Configuration

**Backend (`backend/.env`):**
```env
PORT=3000
NODE_ENV=development
JWT_SECRET=your-secret-key-for-development
DATABASE_PATH=./data/transcendence.db
```

**Frontend (`frontend/.env`):**
```env
VITE_API_URL=http://localhost:3000
VITE_WS_URL=http://localhost:3000
```

## 🎨 Code Style

### General Guidelines

- **Be consistent** with existing code style
- **Keep it simple** - prefer clarity over cleverness
- **Write comments** for complex logic
- **Use meaningful names** for variables and functions
- **Keep functions small** - single responsibility principle

### JavaScript/Vue Style

**Use ESLint:**
```bash
# Backend
cd backend && npm run lint

# Frontend  
cd frontend && npm run lint
```

**Vue 3 Composition API:**
```vue
<script setup>
// ✅ Good - Composition API with script setup
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const count = ref(0)
const doubleCount = computed(() => count.value * 2)

onMounted(() => {
  console.log('Component mounted')
})
</script>

<!-- ❌ Avoid - Options API (unless necessary) -->
<script>
export default {
  data() {
    return { count: 0 }
  }
}
</script>
```

**Naming Conventions:**
- **Components**: PascalCase (`UserProfile.vue`)
- **Variables/Functions**: camelCase (`getUserData`, `isAuthenticated`)
- **Constants**: UPPER_SNAKE_CASE (`API_URL`, `MAX_RETRIES`)
- **CSS Classes**: kebab-case (`user-profile`, `btn-primary`)

**Function Structure:**
```javascript
// ✅ Good - Descriptive name, JSDoc, clear logic
/**
 * Authenticates a user with email and password
 * @param {string} email - User's email address
 * @param {string} password - User's password
 * @returns {Promise<Object>} Authenticated user object
 */
async function authenticateUser(email, password) {
  const user = await User.findByEmail(email)
  if (!user) throw new Error('User not found')
  
  const isValid = await comparePassword(password, user.password)
  if (!isValid) throw new Error('Invalid password')
  
  return user
}

// ❌ Avoid - No docs, unclear purpose, too complex
function auth(e, p) {
  return User.findByEmail(e).then(u => {
    if (!u) throw new Error('User not found')
    return comparePassword(p, u.password).then(v => {
      if (!v) throw new Error('Invalid password')
      return u
    })
  })
}
```

### Database Queries

**Use parameterized queries:**
```javascript
// ✅ Good - Prevents SQL injection
const user = db.prepare('SELECT * FROM users WHERE id = ?').get(userId)

// ❌ Never do this - SQL injection vulnerability!
const user = db.prepare(`SELECT * FROM users WHERE id = ${userId}`).get()
```

### Commit Messages

Follow conventional commit format:

```
<type>(<scope>): <subject>

<body>

<footer>
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting)
- `refactor`: Code refactoring
- `test`: Adding/updating tests
- `chore`: Maintenance tasks

**Examples:**
```bash
feat(auth): add Google OAuth integration

Implemented Google OAuth 2.0 authentication flow:
- Added Passport.js Google strategy
- Created OAuth callback handler
- Updated frontend login page

Closes #123

---

fix(game): resolve ball collision detection bug

Ball was passing through paddles at high speeds.
Fixed by implementing continuous collision detection.

Fixes #456

---

docs(readme): update installation instructions

Added Docker setup instructions and troubleshooting section.
```

## 🧪 Testing

### Writing Tests

All new features should include tests. Aim for >80% coverage.

**Test Structure:**
```javascript
import { describe, it, expect, beforeEach } from '@jest/globals'

describe('Feature Name', () => {
  let testData
  
  beforeEach(() => {
    // Setup before each test
    testData = { ... }
  })
  
  describe('Function Name', () => {
    it('should handle expected input correctly', () => {
      const result = myFunction(testData)
      expect(result).toBe(expectedValue)
    })
    
    it('should throw error for invalid input', () => {
      expect(() => myFunction(null)).toThrow()
    })
  })
})
```

### Running Tests

```bash
# Run all tests
make test

# Run tests with coverage
cd backend && npm test -- --coverage

# Watch mode (re-runs on file changes)
cd backend && npm test -- --watch

# Specific test file
cd backend && npm test user.test.js
```

### Test Coverage Requirements

- **Utils**: >90% coverage
- **Models**: >80% coverage
- **Controllers**: >70% coverage
- **Services**: >70% coverage

See [docs/TESTING.md](docs/TESTING.md) for comprehensive testing guide.

## 🔄 Pull Request Process

### Before Submitting

1. **Update your branch** with latest upstream changes:
   ```bash
   git fetch upstream
   git rebase upstream/main
   ```

2. **Run tests** and ensure they pass:
   ```bash
   make test
   ```

3. **Check code style**:
   ```bash
   cd backend && npm run lint
   cd frontend && npm run lint
   ```

4. **Update documentation** if needed:
   - Update README.md if adding features
   - Add/update JSDoc comments
   - Update API documentation

5. **Commit your changes**:
   ```bash
   git add .
   git commit -m "feat(scope): description"
   ```

6. **Push to your fork**:
   ```bash
   git push origin feature/amazing-feature
   ```

### Creating the Pull Request

1. Go to GitHub and create a Pull Request
2. **Use a clear title**: Follow commit message format
3. **Describe your changes**:
   ```markdown
   ## What

   Brief description of what this PR does

   ## Why

   Explanation of why this change is needed

   ## How

   Technical details of implementation

   ## Testing

   How to test these changes

   ## Checklist

   - [ ] Tests added/updated
   - [ ] Documentation updated
   - [ ] Code style guidelines followed
   - [ ] All tests passing
   ```

4. **Link related issues**: Use "Closes #123" or "Fixes #456"
5. **Request review** from maintainers
6. **Address feedback** and update PR as needed

### PR Guidelines

- **Keep PRs focused** - one feature/fix per PR
- **Keep PRs small** - easier to review and merge
- **Write clear descriptions** - help reviewers understand
- **Respond to feedback** promptly and professionally
- **Update your PR** when requested
- **Be patient** - reviews take time

## 📁 Project Structure

Understanding the project structure helps you contribute effectively:

```
transcendence/
├── backend/              # Express.js API server
│   ├── src/
│   │   ├── __tests__/   # Test files
│   │   ├── config/      # Configuration
│   │   ├── controllers/ # Request handlers
│   │   ├── middleware/  # Express middleware
│   │   ├── models/      # Database models
│   │   ├── routes/      # API routes
│   │   ├── services/    # Business logic
│   │   └── utils/       # Utility functions
│   └── package.json
│
├── frontend/            # Vue 3 application
│   ├── src/
│   │   ├── components/  # Reusable components
│   │   ├── router/      # Vue Router config
│   │   ├── services/    # API & Socket clients
│   │   ├── stores/      # Pinia state stores
│   │   └── views/       # Page components
│   └── package.json
│
├── docs/                # Documentation
│   ├── AUTHENTICATION.md
│   ├── DATABASE_MIGRATION.md
│   ├── DEPLOYMENT.md
│   ├── OAUTH_SETUP.md
│   ├── SECURITY.md
│   ├── TESTING.md
│   └── transubject.pdf
│
├── nginx/               # Nginx reverse proxy configs
├── scripts/             # Utility scripts (DB, admin tools)
└── package.json         # Root package file
```

### Where to Make Changes

- **Adding API endpoint**: `backend/src/routes/` + `backend/src/controllers/`
- **Adding database model**: `backend/src/models/`
- **Adding database migration**: `scripts/` (for schema changes)
- **Adding Vue component**: `frontend/src/components/`
- **Adding page**: `frontend/src/views/` + update router
- **Adding Pinia store**: `frontend/src/stores/`
- **Adding tests**: `backend/src/__tests__/`
- **Updating docs**: `docs/` folder for technical docs, root `.md` for guides
- **Nginx config**: `nginx/` or `frontend/nginx.conf` (production container)

## 🐛 Reporting Bugs

**Before reporting:**
1. Check existing issues
2. Verify it's reproducible
3. Test with latest code

**When reporting, include:**
- Clear, descriptive title
- Steps to reproduce
- Expected behavior
- Actual behavior
- Screenshots (if applicable)
- Environment details:
  - OS
  - Node.js version
  - Browser (for frontend issues)

**Template:**
```markdown
### Bug Description
Clear description of the bug

### Steps to Reproduce
1. Go to...
2. Click on...
3. See error...

### Expected Behavior
What should happen

### Actual Behavior
What actually happens

### Environment
- OS: macOS 13.0
- Node: v20.0.0
- Browser: Chrome 120

### Additional Context
Any other relevant information
```

## 💡 Suggesting Features

**Before suggesting:**
- Check if already requested
- Consider if it fits project scope
- Think about implementation

**When suggesting, include:**
- Clear description
- Use case/problem it solves
- Proposed solution
- Alternatives considered
- Willingness to implement

## ❓ Questions?

- **General questions**: Open a discussion on GitHub
- **Bug reports**: Create an issue
- **Feature requests**: Create an issue with [Feature Request] label
- **Security issues**: Email maintainers directly (don't create public issue)

## 📜 Code of Conduct

- Be respectful and inclusive
- Welcome newcomers
- Focus on constructive feedback
- Assume good intentions
- Report unacceptable behavior

## 📝 License

By contributing, you agree that your contributions will be licensed under the same license as the project.

---

**Thank you for contributing to Transcendence! 🎮**
