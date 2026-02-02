# Pre-Submission Checklist

Use this checklist before submitting your ft_transcendence project.

## 📋 Documentation Review

- [ ] README.md first line is italicized with your login(s)
- [ ] Team Information section has actual names and logins
- [ ] Individual Contributions section is filled out
- [ ] All placeholder `[your_login]`, `[Name]` replaced
- [ ] Technical justifications are accurate
- [ ] Module descriptions match implementation
- [ ] Database schema reflects actual structure
- [ ] Resources section includes all used references
- [ ] AI usage is honestly disclosed

## 🧪 Testing

- [ ] Fresh install works: `make clean && make install`
- [ ] Development mode starts: `make dev`
- [ ] Backend health check responds: `curl http://localhost:3000/api/health`
- [ ] Frontend loads: http://localhost:5173
- [ ] User registration works
- [ ] User login works
- [ ] Game playable (single player vs AI)
- [ ] Game playable (multiplayer - test with 2 browsers)
- [ ] Chat functionality works
- [ ] Friends system works
- [ ] Docker build succeeds: `make docker-build`
- [ ] Docker deployment works: `make docker-up`
- [ ] Verification passes: `./verify.sh`

## 🔒 Security Check

- [ ] No `.env` files in git (check with `git status`)
- [ ] `.gitignore` includes `.env` and `node_modules`
- [ ] No hardcoded passwords or secrets in code
- [ ] JWT_SECRET is different in production
- [ ] `.env.example` files present
- [ ] Sensitive data not logged
- [ ] CORS properly configured
- [ ] Input validation on all endpoints

## 📦 Module Verification

### Major Modules (2 points each)
- [ ] Backend Framework implemented and working
- [ ] User Management functional (register, login, profile)
- [ ] Remote Players working (multiplayer via Socket.io)
- [ ] AI Opponent playable (all difficulty levels)
- [ ] Game Customization available

### Minor Modules (1 point each)
- [ ] Database Integration functional
- [ ] Live Chat working
- [ ] User Stats displayed
- [ ] Two-Factor Authentication available
- [ ] Server-Side game logic validated

**Total Points**: ___ / 14 minimum (15 recommended)

## 🐳 Docker Verification

- [ ] `docker-compose.yml` present
- [ ] Backend Dockerfile present
- [ ] Frontend Dockerfile present (or uses node:20-alpine)
- [ ] Services defined: backend, frontend
- [ ] Ports exposed: 3000 (backend), 5173 (frontend)
- [ ] Volumes configured correctly
- [ ] Environment variables set
- [ ] Build succeeds: `docker-compose build`
- [ ] Containers run: `docker-compose up`
- [ ] Application accessible in Docker environment

## 📝 Code Quality

- [ ] Code is properly formatted
- [ ] No console.log in production code (or minimal)
- [ ] Functions have clear names
- [ ] Complex logic has comments
- [ ] Error handling present
- [ ] No unnecessary files (temp, test files, etc.)
- [ ] File structure is clean and logical
- [ ] Dependencies in package.json are used

## 🚀 Git Repository

- [ ] All changes committed
- [ ] Commit messages are descriptive
- [ ] No merge conflicts
- [ ] `.gitignore` is complete
- [ ] No large files (>10MB)
- [ ] README.md is at root
- [ ] License file present (if required)
- [ ] Remote repository accessible

## 📊 Peer Review Simulation

Have a teammate or friend test:

- [ ] Clone repository
- [ ] Follow README instructions
- [ ] Successfully install
- [ ] Successfully run
- [ ] Create account
- [ ] Play game
- [ ] Test all claimed features
- [ ] Verify module implementations

## 🎯 Final Checks

- [ ] Project name is appropriate
- [ ] All required sections in README
- [ ] Screenshots/demos included (optional but nice)
- [ ] Known limitations documented
- [ ] Future enhancements listed
- [ ] Credits given where due
- [ ] Contact information provided
- [ ] English language throughout

## ⚡ Pre-Demo Preparation

For live demonstration:

- [ ] Practice explaining architecture (2 minutes)
- [ ] Know your module choices and why
- [ ] Can explain technical decisions
- [ ] Demonstrate user registration
- [ ] Demonstrate single player game
- [ ] Demonstrate multiplayer game
- [ ] Show security features (2FA, password hashing)
- [ ] Explain database schema
- [ ] Show Docker deployment
- [ ] Ready to answer questions about:
  - Module implementations
  - Security measures
  - Scalability
  - Team contributions

## 📈 Bonus Points Preparation (Optional)

If implementing bonus modules:

- [ ] Additional modules documented in README
- [ ] Module choice justified
- [ ] Fully implemented and tested
- [ ] Does not break existing features
- [ ] Adds real value to project
- [ ] Calculated in points total

Maximum bonus: 5 points

## ❓ Common Questions to Prepare For

Be ready to explain:

1. **Architecture**: Why did you choose this stack?
2. **Security**: How do you prevent SQL injection? XSS? CSRF?
3. **Real-time**: How does Socket.io handle disconnections?
4. **Scalability**: How would you scale to 1000 concurrent users?
5. **Database**: Why SQLite? When would you migrate to PostgreSQL?
6. **AI**: How does your AI opponent work?
7. **Testing**: How do you test your application?
8. **Docker**: Explain your container setup
9. **Modules**: Why did you choose these specific modules?
10. **Team**: How did you distribute the work?

## 🎓 Evaluation Criteria

Expect evaluation on:

- **Functionality**: Does it work as described?
- **Modules**: Are all claimed modules implemented?
- **Security**: Is it secure?
- **Code Quality**: Is it clean and maintainable?
- **Documentation**: Is README complete and accurate?
- **Docker**: Does containerization work?
- **Demo**: Can you demonstrate features?
- **Understanding**: Do you understand what you built?

## ✅ Final Sign-Off

- [ ] I have tested everything
- [ ] All documentation is complete
- [ ] No credentials in repository
- [ ] Docker deployment works
- [ ] I can explain all implementations
- [ ] Team contributions are documented
- [ ] Project meets minimum 14 points
- [ ] I am ready for evaluation

**Signed**: ________________  
**Date**: ________________  
**Points**: ____ / 14 minimum

---

## 🎉 Ready to Submit!

If all boxes are checked, your project is ready for submission.

**Good luck with your evaluation!** 🚀

### Quick Command Reference

```bash
# Last-minute verification
./verify.sh

# Test full install
make clean && make install && make dev

# Test Docker
make docker-build && make docker-up

# View what's running
docker-compose ps
make docker-logs
```

### Emergency Fixes

If something breaks:

```bash
# Reset everything
make docker-down
make clean
rm -rf backend/data/*.db
make install
make dev

# Check logs
cd backend && npm run dev  # See backend errors
cd frontend && npm run dev  # See frontend errors
```

---

**Remember**: The best project is one that works reliably, is well-documented, and that you fully understand. Quality over quantity!
