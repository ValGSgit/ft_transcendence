# Testing Guide

## Overview

Transcendence uses **Jest** as the primary testing framework for both unit and integration tests. The project aims for >80% code coverage across all critical modules.

## Test Structure

```
backend/src/__tests__/
├── controllers/           # Controller tests
│   └── authController.test.js
├── models/               # Model tests  
│   └── User.integration.test.js
├── auth.test.js         # Authentication utilities
├── response.test.js     # Response formatters
├── user.test.js        # User model tests
└── validation.test.js  # Validation utilities
```

## Running Tests

### Run All Tests
```bash
cd backend
npm test
```

### Run Tests with Coverage
```bash
npm test -- --coverage
```

### Run Specific Test File
```bash
npm test auth.test.js
```

### Run Tests in Watch Mode
```bash
npm test -- --watch
```

### Run Tests with Verbose Output
```bash
npm test -- --verbose
```

## Current Test Coverage

### ✅ Fully Tested Modules

#### 1. Authentication Utilities (`auth.test.js`)
- Password hashing with bcrypt
- Password comparison
- JWT token generation
- Token verification
- Refresh token generation

**Coverage:** ~95%

#### 2. Validation Utilities (`validation.test.js`)
- Email validation
- Username validation (3-20 chars, alphanumeric + underscore)
- Password validation (length, uppercase, lowercase, numbers)
- User sanitization (removes sensitive fields)

**Coverage:** 100%

#### 3. Response Utilities (`response.test.js`)
- Success response formatting
- Error response formatting
- Custom status codes
- Error details inclusion

**Coverage:** 100%

#### 4. User Model (`user.test.js`)
- User creation with defaults
- Find by ID, email, username
- Find by email OR username
- User updates
- 2FA enable/disable/get secret
- Online status management
- Duplicate prevention

**Coverage:** ~90%

### 🔄 Partially Tested

#### Controller Tests (`authController.test.js`)
- Registration with validation
- Login with credentials
- Logout functionality
- Mocked dependencies

**Coverage:** ~60% (needs more edge cases)

### ❌ Not Yet Tested

The following modules need test coverage:

1. **Friend Controller** - Friend requests, blocking, unblocking
2. **Chat Controller** - Room creation, messaging, search
3. **Game Controller** - Game creation, AI modes, scoring
4. **Notification Controller** - Creation, marking as read
5. **Socket Service** - WebSocket connections, events
6. **AI Service** - AI difficulty levels, movement logic
7. **Middleware** - Auth middleware, error handler

## Writing Tests

### Test Template

```javascript
import { describe, it, expect, beforeEach } from '@jest/globals';

describe('Module Name', () => {
  let testVar;

  beforeEach(() => {
    // Setup before each test
    testVar = 'initial value';
  });

  describe('Function Name', () => {
    it('should do something expected', () => {
      const result = someFunction(testVar);
      expect(result).toBe('expected value');
    });

    it('should handle edge cases', () => {
      const result = someFunction(null);
      expect(result).toBeNull();
    });
  });
});
```

### Testing Async Functions

```javascript
it('should hash password asynchronously', async () => {
  const password = 'Test123!';
  const hash = await hashPassword(password);
  
  expect(hash).toBeDefined();
  expect(hash).not.toBe(password);
});
```

### Testing Express Controllers

```javascript
describe('Controller Function', () => {
  let req, res;

  beforeEach(() => {
    req = {
      body: {},
      params: {},
      user: null,
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
  });

  it('should return 200 on success', async () => {
    req.body = { username: 'test' };
    
    await controllerFunction(req, res);
    
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: true,
      })
    );
  });
});
```

### Mocking Dependencies

```javascript
import { jest } from '@jest/globals';

// Mock a module
jest.mock('../../models/User.js');

// Mock implementation
User.findByEmail.mockReturnValue({ id: 1, email: 'test@example.com' });

// Mock async function
User.create.mockResolvedValue({ id: 1, username: 'test' });

// Mock rejection
User.create.mockRejectedValue(new Error('Database error'));
```

## Best Practices

### 1. Test Isolation
- Each test should be independent
- Use `beforeEach` to reset state
- Don't rely on test execution order

### 2. Descriptive Names
```javascript
// ❌ Bad
it('works', () => { ... });

// ✅ Good
it('should return error when email is invalid', () => { ... });
```

### 3. Arrange-Act-Assert Pattern
```javascript
it('should create user', async () => {
  // Arrange
  const userData = { username: 'test', email: 'test@example.com' };
  
  // Act
  const user = await User.create(userData);
  
  // Assert
  expect(user).toBeDefined();
  expect(user.username).toBe('test');
});
```

### 4. Test Both Success and Failure
```javascript
describe('validateEmail', () => {
  it('should validate correct email', () => {
    expect(validateEmail('test@example.com')).toBe(true);
  });

  it('should reject invalid email', () => {
    expect(validateEmail('invalid')).toBe(false);
  });
});
```

### 5. Don't Test Implementation Details
Test behavior, not internal implementation.

## Integration Tests

Integration tests verify multiple components working together:

```javascript
// User.integration.test.js
describe('User Model Integration', () => {
  let db;

  beforeAll(() => {
    // Setup test database
    db = new Database(':memory:');
    // Create schema
  });

  afterAll(() => {
    db.close();
  });

  it('should create user with stats', async () => {
    const user = await User.create({ ... });
    const stats = await UserStats.getByUserId(user.id);
    
    expect(stats.games_played).toBe(0);
  });
});
```

## Code Coverage Goals

| Module | Current | Target | Priority |
|--------|---------|--------|----------|
| Utils (auth, validation, response) | 95% | 95% | ✅ Met |
| User Model | 90% | 90% | ✅ Met |
| Auth Controller | 60% | 85% | 🔴 High |
| Friend Controller | 0% | 80% | 🔴 High |
| Chat Controller | 0% | 80% | 🟡 Medium |
| Game Controller | 0% | 85% | 🟡 Medium |
| Socket Service | 0% | 70% | 🟡 Medium |
| AI Service | 0% | 75% | 🟢 Low |
| Middleware | 0% | 90% | 🔴 High |

## CI/CD Integration

Tests run automatically on:
- Pull requests
- Pushes to main branch
- Pre-commit hooks (optional)

### GitHub Actions Example

```yaml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '20'
      - run: cd backend && npm ci
      - run: cd backend && npm test -- --coverage
      - uses: codecov/codecov-action@v3
```

## Debugging Tests

### Debug Single Test
```bash
node --inspect-brk node_modules/.bin/jest --runInBand auth.test.js
```

### View Failed Test Output
```bash
npm test -- --verbose --no-coverage
```

### Check Why Test Failed
```javascript
it('should work', () => {
  const result = someFunction();
  console.log('Result:', result); // Add logging
  expect(result).toBe('expected');
});
```

## Next Steps

### High Priority
1. ✅ Fix failing response tests (completed)
2. 🔲 Complete auth controller tests
3. 🔲 Add middleware tests (auth, error handler)
4. 🔲 Add friend controller tests

### Medium Priority
5. 🔲 Add chat controller tests
6. 🔲 Add game controller tests
7. 🔲 Add socket service tests

### Low Priority
8. 🔲 Add AI service tests
9. 🔲 Add E2E tests with supertest
10. 🔲 Setup CI/CD pipeline

## Resources

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [Testing Best Practices](https://github.com/goldbergyoni/javascript-testing-best-practices)
- [Supertest for API Testing](https://github.com/visionmedia/supertest)

## Contributing

When adding new features:
1. Write tests first (TDD approach recommended)
2. Ensure all tests pass before committing
3. Maintain or improve code coverage
4. Update this document if adding new test patterns
