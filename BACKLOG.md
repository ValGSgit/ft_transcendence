# 📋 Project Backlog — Transcendence

> Last updated: 2026-02-12

---

## 🏗️ Project Overview

**Project:** ft_transcendence — Social Gaming Platform (42 School)  
**Team Size:** 4 (vagarcia, kfan, dpotsch, lstefane)  
**Target Score:** 35 module points (14 minimum required)  

---

## 📊 Module Point Tracker

### Category 1 — Web (13 pts)

| # | Module | Type | Pts | Status |
|---|--------|------|-----|--------|
| 1 | Use a framework for frontend AND backend (Vue 3 + Express) | Major | 2 | ✅ Done |
| 2 | Real-time features using WebSockets (Socket.io) | Major | 2 | ✅ Done |
| 3 | User interaction (Chat + Profiles + Friends) | Major | 2 | ✅ Done |
| 4 | Public API (secured API key, rate limiting, docs, 5+ endpoints) | Major | 2 | 📝 To Do |
| 5 | ORM for the database | Minor | 1 | 📝 To Do |
| 6 | Complete notification system | Minor | 1 | ✅ Done |
| 7 | Custom design system (10+ reusable components, color palette, typography, icons) | Minor | 1 | 📝 To Do |
| 8 | Advanced search (filters, sorting, pagination) | Minor | 1 | 📝 To Do |
| 9 | File upload and management system | Minor | 1 | 📝 To Do |

### Category 2 — Accessibility & Internationalization (1 pt)

| # | Module | Type | Pts | Status |
|---|--------|------|-----|--------|
| 10 | Support for additional browsers (Firefox + Edge/Safari) | Minor | 1 | 📝 To Do |

**▸ 14 pts reached here (minimum)**

### Category 3 — User Management (7 pts)

| # | Module | Type | Pts | Status |
|---|--------|------|-----|--------|
| 11 | Standard user management & authentication | Major | 2 | 🔧 In Progress |
| 12 | Game statistics & match history | Minor | 1 | 🔧 In Progress |
| 13 | OAuth 2.0 remote authentication (Google + GitHub) | Minor | 1 | ✅ Done |
| 14 | Organization system (CRUD orgs, add/remove users, org actions) | Major | 2 | 📝 To Do |
| 15 | User activity analytics & insights dashboard | Minor | 1 | 📝 To Do |

**▸ 21 pts reached here**

### Category 6 — Gaming & User Experience (12 pts)

| # | Module | Type | Pts | Status |
|---|--------|------|-----|--------|
| 16 | Complete web-based game (Pong / Farm / etc.) | Major | 2 | 🔧 In Progress |
| 17 | Remote players (two players on separate computers) | Major | 2 | 🔧 In Progress |
| 18 | Multiplayer game (3+ players) | Major | 2 | 📝 To Do |
| 19 | Add another game with history & matchmaking | Major | 2 | 📝 To Do |
| 20 | Advanced 3D graphics (Three.js) | Major | 2 | 🔧 In Progress |
| 21 | Game customization options (power-ups, maps, settings) | Minor | 1 | 📝 To Do |
| 22 | Gamification system (achievements, badges, leaderboards, XP — min 3) | Minor | 1 | 📝 To Do |

**▸ 33 pts reached here**

### Category 8 — Data & Analytics (2 pts)

| # | Module | Type | Pts | Status |
|---|--------|------|-----|--------|
| 23 | Data export & import (JSON, CSV, XML; bulk ops) | Minor | 1 | 📝 To Do |
| 24 | GDPR compliance (data request, deletion, export, confirmation) | Minor | 1 | 📝 To Do |

**▸ 35 pts total target**

### Summary

| | Points |
|---|--------|
| ✅ Secured (Done) | **9** |
| 🔧 In Progress | **9** |
| 📝 To Do | **17** |
| **Total Target** | **35** |

---

## ✅ DONE — Completed Features

### Core Infrastructure
- [x] Express.js backend with modular route/controller/model architecture
- [x] Vue 3 + Vite frontend with Composition API
- [x] Pinia state management (auth, chat, social, theme stores)
- [x] Vue Router with navigation guards & lazy loading
- [x] Docker Compose for dev (SQLite) and prod (PostgreSQL + Nginx + Certbot)
- [x] Dual-database support: SQLite (dev) / PostgreSQL (prod) with adapter layer
- [x] Database schema with 15 tables and proper indexes
- [x] Comprehensive Makefile (50+ targets)
- [x] CORS, Helmet, rate limiting middleware
- [x] `.env.example` and `.env.production.example` files
- [x] `.gitignore` properly configured
- [x] `package-lock.json` generated for all packages (npm ci works)

### Module 1 — Frameworks (Major, 2 pts) ✅
- [x] Vue 3.5+ frontend framework (Composition API, SFC)
- [x] Express.js backend framework (modular routes, controllers, middleware)

### Module 2 — Real-time WebSockets (Major, 2 pts) ✅
- [x] Socket.io server with JWT authentication middleware
- [x] User online/offline status tracking
- [x] Real-time chat message delivery
- [x] Typing indicators
- [x] Real-time notifications
- [x] Real-time friend request events
- [x] Real-time game state synchronization
- [x] Connection/disconnection handling with user session cleanup

### Module 3 — User Interaction (Major, 2 pts) ✅
- [x] Chat system: direct messages, room-based chat, message history
- [x] Chat search functionality
- [x] User profiles: avatar, bio, stats, posts tab, friends tab
- [x] Friends system: send/accept/decline requests, unfriend
- [x] Block/unblock users
- [x] Friend suggestions
- [x] Online status indicators

### Module 6 — Notification System (Minor, 1 pt) ✅
- [x] Notification model with CRUD
- [x] Real-time notification delivery via Socket.io
- [x] Mark as read / mark all as read
- [x] Delete individual / delete all notifications
- [x] Notification types: friend requests, messages, game invites

### Module 13 — OAuth 2.0 (Minor, 1 pt) ✅
- [x] Google OAuth 2.0 (Passport strategy)
- [x] GitHub OAuth 2.0 (Passport strategy)
- [x] OAuth callback handling (frontend `AuthCallback.vue`)

### Other Completed Work (not module-specific)
- [x] TOTP 2FA setup, verify, disable (speakeasy + QR code)
- [x] Password reset tokens (backend routes)
- [x] Social feed: posts, likes, comments, visibility controls
- [x] PostCard reusable component
- [x] Dark/Light theme toggle
- [x] Jest + Supertest test infrastructure
- [x] Backend Dockerfile (dev) + Dockerfile.prod (multi-stage, non-root user)
- [x] Frontend Dockerfile (dev) + Dockerfile.prod (multi-stage, nginx, non-root)
- [x] Nginx reverse proxy (HTTP + WebSocket)
- [x] Let's Encrypt SSL setup script + DuckDNS docs
- [x] PostgreSQL backup/restore/test scripts
- [x] Health check endpoints

---

## 🔧 IN PROGRESS — Partially Implemented

### Module 11 — Standard User Management (Major, 2 pts)
**Status:** ~80% complete  
**Done:**
- [x] User registration and login (bcrypt + JWT)
- [x] Profile update (username, bio, avatar URL)
- [x] Friends + online status
- [x] Profile page displaying user information
**Missing:**
- [ ] Avatar upload with actual file storage (currently URL-only)
- [ ] Default avatar when none is provided
- [ ] Verify all profile fields are editable in Settings

### Module 12 — Game Statistics & Match History (Minor, 1 pt)
**Status:** ~50% complete  
**Done:**
- [x] `user_stats` table (games_played, won, lost, scores, streaks)
- [x] `GET /api/game/history` and `GET /api/game/leaderboard`
- [x] `GET /api/users/:id/stats`
- [x] Profile "Achievements" tab in UI
**Missing:**
- [ ] Match history display in UI (dates, results, opponents)
- [ ] Achievements system with actual defined milestones
- [ ] Leaderboard UI page/component
- [ ] Level/ranking progression display

### Module 16 — Web-based Game (Major, 2 pts)
**Status:** ~60% complete  
**Done:**
- [x] Three.js 3D game rendering in `Game.vue`
- [x] Game model with scores, status, winner tracking
- [x] Game API endpoints (create, start, score, end, abandon)
- [x] Matchmaking queue (backend)
- [x] Socket.io game events (matchmaking, state sync, scoring)
**Missing:**
- [ ] **Decide: Pong vs Alpaca Farm vs both?** (README says Pong, code is Alpaca Farm)
- [ ] Ensure game has clear rules and win/loss conditions
- [ ] Players must be able to play live matches

### Module 17 — Remote Players (Major, 2 pts)
**Status:** ~30% complete  
**Done:**
- [x] Socket.io game state synchronization infrastructure
- [x] Matchmaking queue backend
**Missing:**
- [ ] Two players on separate computers playing in real-time
- [ ] Handle network latency gracefully
- [ ] Handle disconnections gracefully
- [ ] Reconnection logic

### Module 20 — Advanced 3D Graphics (Major, 2 pts)
**Status:** ~60% complete  
**Done:**
- [x] Three.js 3D rendering in Game.vue
- [x] Procedural world generation (terrain, fences, trees, stones)
- [x] Shadow mapping, fog effects
- [x] OrbitControls camera interaction
**Missing:**
- [ ] Advanced rendering techniques (post-processing, particles, etc.)
- [ ] Document the immersive 3D environment for evaluation
- [ ] Performance profiling & optimization

---

## 📝 TO DO — Not Yet Started

### 🔴 P0 — CRITICAL (Mandatory / Project Rejection Risk)

| Task | Notes |
|------|-------|
| **Privacy Policy page** | Must be accessible with real content; links exist but no content rendered |
| **Terms of Service page** | Must be accessible with real content; same issue |
| **HTTPS everywhere** | Backend must enforce HTTPS in production |
| **No browser console errors** | Audit Chrome DevTools for warnings/errors |
| **Multi-user simultaneous support** | Verify no race conditions with concurrent users |
| **README: team roles** | Document PO, PM, Tech Lead, Developer roles per subject |
| **README: module list** | List all 24 modules with Major/Minor, points, justification |
| **README: individual contributions** | Detailed breakdown per team member |
| **README: database schema** | Update — currently missing 5 tables + farm columns |
| **README: project management** | Document organization, tools, communication |
| **README: description accuracy** | Currently describes "Pong" — must match actual game |

### 🟠 P1 — Module Implementation (New Modules)

| Task | Module | Pts |
|------|--------|-----|
| **Public API** — API key auth, rate limiting, API docs, 5+ endpoint types (GET/POST/PUT/DELETE) | #4 Web Major | 2 |
| **ORM integration** — replace raw SQL with an ORM (Sequelize, Prisma, Drizzle, etc.) | #5 Web Minor | 1 |
| **Custom design system** — 10+ reusable components, color palette, typography, icons | #7 Web Minor | 1 |
| **Advanced search** — filters, sorting, pagination across users/posts/games | #8 Web Minor | 1 |
| **File upload system** — multi-type support, validation, secure storage, preview, progress, delete | #9 Web Minor | 1 |
| **Browser compatibility** — test Firefox + Edge/Safari, document limitations | #10 A11y Minor | 1 |
| **Organization system** — CRUD orgs, add/remove members, org-scoped actions | #14 User Mgmt Major | 2 |
| **User activity analytics dashboard** — usage insights, activity graphs | #15 User Mgmt Minor | 1 |
| **Multiplayer 3+ players** — 3+ simultaneous, sync, fairness | #18 Gaming Major | 2 |
| **Second game** — distinct game, history, matchmaking | #19 Gaming Major | 2 |
| **Game customization** — power-ups, maps/themes, customizable settings, defaults | #21 Gaming Minor | 1 |
| **Gamification** — implement 3+ of: achievements, badges, leaderboards, XP/levels, daily challenges, rewards | #22 Gaming Minor | 1 |
| **Data export/import** — JSON, CSV, XML; import with validation; bulk ops | #23 Data Minor | 1 |
| **GDPR compliance** — data request, deletion, export, confirmation emails | #24 Data Minor | 1 |

### 🟡 P2 — Polish & Quality

| Task | Notes |
|------|-------|
| Update README description to match actual game | Must be accurate for evaluation |
| Update README API endpoint documentation | Some paths don't match actual routes |
| Frontend form validation audit | All inputs must be validated frontend + backend |
| Backend input validation audit | Subject requirement |
| Remove `HelloWorld.vue` | Unused boilerplate |
| Clean up dead code (`PongGame.js` if not Pong) | Code hygiene |
| Test Docker prod deployment end-to-end | Must work with single command |
| Audit responsive design on all views | Subject requires clear, responsive, accessible |

---

## 🔍 Subject Compliance Checklist

### Mandatory Part

| Requirement | Status | Notes |
|-------------|--------|-------|
| Web app (frontend + backend + database) | ✅ | Vue 3 + Express + SQLite/PostgreSQL |
| Git with clear commits from all members | ⚠️ | verify commit quality |
| Containerized deployment, single command | ✅ | `make prod` / `docker compose` |
| Compatible with latest Chrome | ⚠️ | Needs testing |
| No browser console errors/warnings | ❌ | Needs audit |
| Privacy Policy page (accessible, real content) | ❌ | Links exist but no rendered content |
| Terms of Service page (accessible, real content) | ❌ | Links exist but no rendered content |
| Multi-user simultaneous support | ⚠️ | Architecture supports it, needs verification |

### Technical Requirements

| Requirement | Status | Notes |
|-------------|--------|-------|
| Frontend clear, responsive, accessible | ⚠️ | Responsive yes, accessibility needs audit |
| CSS framework or styling solution | ⚠️ | Custom CSS — plan: build custom design system (Module #7) |
| Credentials in .env (gitignored) + .env.example | ✅ | Properly configured |
| Database with clear schema and relations | ✅ | 15 tables with FK relationships |
| Basic user management (signup, login, hashed passwords) | ✅ | bcrypt + JWT |
| Form/input validation (frontend + backend) | ⚠️ | Backend has utils, frontend partial |
| HTTPS everywhere (backend) | ❌ | SSL scripts exist but not enforced |

### README Requirements

| Section | Status | Notes |
|---------|--------|-------|
| First line: italicized, team logins | ⚠️ | Format needs adjusting per spec |
| Description section | ⚠️ | Present but describes Pong (wrong) |
| Instructions section | ✅ | Comprehensive |
| Resources section (refs + AI usage) | ✅ | AI usage documented |
| Team Information (roles per member) | ❌ | Must add |
| Project Management (org, tools, comms) | ❌ | Must add |
| Technical Stack (with justification) | ✅ | Present |
| Database Schema (visual + relationships) | ⚠️ | Outdated — missing 5 tables |
| Features List (with member attribution) | ⚠️ | Checklist exists, no attribution |
| Modules list (Major/Minor, pts, justification) | ❌ | Must add |
| Individual Contributions | ❌ | Must add |

---

## 🗓️ Suggested Sprint Plan

### Sprint 1 — Critical Fixes (P0)
**Goal:** Eliminate all project-rejection risks

1. Create Privacy Policy + Terms of Service pages with real content and routes
2. Fix README: team roles, modules with points, contributions, accurate description
3. Update README database schema
4. Audit browser console for errors/warnings
5. Verify HTTPS enforcement in production

### Sprint 2 — Complete In-Progress Modules
**Goal:** Lock in the 9 in-progress points

1. Finalize game implementation (decide identity, ensure rules/win-loss)
2. Complete remote multiplayer (two players, separate computers)
3. Complete user management (avatar upload, default avatar)
4. Complete game stats/match history UI
5. Polish 3D graphics for evaluation

### Sprint 3 — New Modules (Batch 1)
**Goal:** Implement high-value new modules

1. Public API module (API key, docs, 5+ typed endpoints) — 2 pts
2. ORM integration — 1 pt
3. Organization system (CRUD, members, actions) — 2 pts
4. File upload system — 1 pt
5. Custom design system (10+ components) — 1 pt

### Sprint 4 — New Modules (Batch 2)
**Goal:** Implement remaining modules + buffer

1. Advanced search (filters, sorting, pagination) — 1 pt
2. Second game + matchmaking — 2 pts
3. Multiplayer 3+ — 2 pts
4. Game customization — 1 pt
5. Gamification system — 1 pt

### Sprint 5 — Final Modules & Polish
**Goal:** Complete all 35 points + overall polish

1. Browser compatibility testing (Firefox + Edge) — 1 pt
2. User activity analytics dashboard — 1 pt
3. Data export/import — 1 pt
4. GDPR compliance — 1 pt
5. Full end-to-end testing and Docker prod verification

---

## 📌 Decision Log

| Date | Decision | Rationale |
|------|----------|-----------|
| **Phase 0: Initialization** | | |
| 2025-12-10 | Initial commit (1390473) | Project inception |
| 2026-01-14 | Upload subject to repo (a23c5c7) | Reference documentation for 42 ft_transcendence requirements |
| **Phase 1: OAuth & Docker Setup (3-week effort)** | | |
| 2026-02-02 | Implement OAuth with dual frontend support (9d71b12) | Critical authentication requirement; 3 weeks of configuration |
| 2026-02-02 | Complete production Docker setup with working auth (57f2bd9) | Production-ready containerization with Nginx, SSL, health checks |
| **Phase 2: Testing & Game Core** | | |
| 2026-02-02 | Achieve 81% function coverage (7a2c5af) | Comprehensive test suite for controllers, models, services |
| 2026-02-02 | Fix game loading issue, improve test coverage to 80% (4af357a) | Game movement with incremental speed, better test reliability |
| 2026-02-02 | UI/UX improvements and game enhancements (3d2ae62) | Improved gameplay, better frontend developer experience |
| **Phase 3: Features & Data Systems** | | |
| 2026-02-02 | Full data consistency, posts system, chat fixes, dark mode (ae1e29c) | Social features implementation, theme support |
| 2026-02-02 | Implement all remaining features, resolve runtime errors (5f51dd8) | Critical bug fixes, feature completion |
| 2026-02-02 | Adjust movement speed and control logic (63386e3) | Game mechanics refinement |
| 2026-02-03 | Delete PROJECT_COMPLETE.md (231a7b0) | Cleanup redundant status file |
| **Phase 4: Frontend Improvements** | | |
| 2026-02-05 | Improve post likes, comments, friend request handling (07ce604) | Enhanced social interaction features |
| 2026-02-05 | Resolve multiple critical frontend/backend issues (a80b00e) | Major bug fixes, stability improvements |
| 2026-02-06 | Improve general connectivity for in-network access (3c95fd1) | Better local network support |
| 2026-02-06 | Enable local network access for mobile testing (031ee8d) | Mobile device testing capability |
| **Phase 5: Game Features** | | |
| 2026-02-09 | Add navbar in game mode, fix settings GUI (7f496ff) | Better game UX |
| 2026-02-09 | Implement mini shop for increasing map size (56924ac) | Game progression mechanic |
| 2026-02-09 | Add shop, limit alpaca size based on farm size (f63d150) | Game balance and mechanics |
| 2026-02-09 | Delete frontend/.env.development.local (4261923) | Remove sensitive config from repo |
| 2026-02-10 | Ensure no merge conflicts with Ka Hou's update (88ab295) | Team collaboration, merge Main and Val branches |
| 2026-02-11 | Big change in save/load (1f38574) | Game state persistence improvements |
| **Phase 6: Production & Database Migration** | | |
| 2026-02-11 | Add package locks for npm ci compatibility (8662afd) | Deterministic builds, version control, faster CI |
| 2026-02-11 | Migrate to async/await and add PostgreSQL support (28168f0) | Modern async patterns, production database |
| 2026-02-11 | Dual-database adapter: PostgreSQL for prod, SQLite for dev (e026a01) | Production stability with dev convenience; SQL translation layer |
| 2026-02-11 | OAuth works in both dev and prod builds (e026a01) | Environment-agnostic authentication |
| **Phase 7: Recent Organization** | | |
| 2026-02-12 | Docker cleanup after VM crash | Removed 1.03GB build cache, 2 orphaned volumes, fixed compose deprecation |
| 2026-02-12 | Fixed `docker-compose.yml` NODE_ENV from production to development | Dev compose should use development mode |
| 2026-02-12 | Fixed `package-lock.json` in `.gitignore` | Was ignored, preventing `npm ci` from working; now tracked |
| 2026-02-12 | Generated `package-lock.json` for root, backend, frontend | Required for `npm ci` in Dockerfiles and CI |
| 2026-02-12 | Rename frontend package from "my-3d-app" to "transcendence-frontend" | Professional naming consistency |
| 2026-02-12 | Created comprehensive BACKLOG.md | Project planning, module tracking, compliance checklists |
| 2026-02-12 | Expanded module target from 16 → 35 points | Aggressive but provides safety margin; 14 minimum required |
| 2026-02-12 | Planned documentation cleanup | Remove 8+ redundant docs to streamline repository |
| 2026-02-12 | Added admin architecture diagram system | Mermaid.js diagram at /admin/diagram for team onboarding; admin-only access |
| **Phase 8: Code Quality & Product Owner Implementation (70 issues fixed)** | | |
| 2026-02-12 | **SECURITY**: Fixed password reset token exposure in production | Token now only returned in dev mode; production uses email (C1) |
| 2026-02-12 | **SECURITY**: Removed userId leak in 2FA response | Returns email instead to prevent user enumeration (C2) |
| 2026-02-12 | **SECURITY**: Added token type distinction (access vs refresh) | Prevents token misuse; refresh tokens can't be used as access tokens (C3) |
| 2026-02-12 | **SECURITY**: Password change now requires current password | Prevents unauthorized password changes via stolen tokens (C4) |
| 2026-02-12 | **SECURITY**: Added blob size limit (500KB) to farm stats | Prevents abuse of unlimited JSON storage (C6) |
| 2026-02-12 | **SECURITY**: Added chat room authorization checks | Users must be room members to read/send messages (C7, C8, C9) |
| 2026-02-12 | **SECURITY**: Added authorization to game abandon endpoint | Only game participants can abandon games (C10) |
| 2026-02-12 | **SECURITY**: Narrowed CORS origins, removed hardcoded IPs | Removed Angular ports, specific machine IPs; safer regex patterns (C11, Q4, Q5) |
| 2026-02-12 | **SECURITY**: Fixed package-lock.json tracking | Removed from .gitignore for reproducible builds and supply-chain security (C14) |
| 2026-02-12 | **QUALITY**: Removed dead PongGame.js code | Project is Alpaca Farm, not Pong; 200+ lines of unused code removed (Q1, Q2, Q3) |
| 2026-02-12 | **QUALITY**: Fixed notification routes to use PATCH (RESTful) | Changed POST to PATCH for mark-as-read operations (Q21) |
| 2026-02-12 | **QUALITY**: Added input validation to profile updates | Email and username validation on updates, not just registration (C5, Q  |
| 2026-02-12 | **QUALITY**: Removed console.log from production code | Cleaned debug logs from auth store exposing tokens (Q18) |
| 2026-02-12 | **QUALITY**: Fixed social store response path inconsistency | Standardized response.data.data wrapper pattern (Q19) |
| 2026-02-12 | **UX**: Improved email validation | Client-side now uses proper regex, not just `.includes('@')` (U3) |
| 2026-02-12 | **UX**: Fixed Profile cover photo default | Removed undefined variable, now uses valid path (Q11) |
| 2026-02-12 | **UX**: Added forgot password handler | "Forgot password?" link now functional (  |
| 2026-02-12 | **DOCS**: Updated README with accurate project description | Changed from "Pong" to "Alpaca Farm", dual-database architecture documented (D1-D3) |
| 2026-02-12 | **DOCS**: Added team section with Product Owner role | vagarcia clearly identified as PO with role responsibilities |
| 2026-02-12 | **DOCS**: Fixed module count from 15 to 35 points | Accurate representation of project scope (D2) |
| 2026-02-12 | **DOCS**: Updated database schema in README | Added is_admin, fixed column names, added missing tables (D4-D6) |
| 2026-02-12 | **DOCS**: Added team structure to CONTRIBUTING.md | PO role, responsibilities, workflow for team collaboration (D17) |
| 2026-02-12 | **DOCS**: Changed fork workflow to branch workflow | Team members work on branches, not forks; appropriate for single-repo teams (D17) |
| **Phase 9: Repository Restructuring for Team Clarity** | | |
| 2026-02-12 | **STRUCTURE**: Created `docs/` folder | Consolidated all technical docs in one place for easier discovery |
| 2026-02-12 | **STRUCTURE**: Moved 7 markdown docs to `docs/` | AUTHENTICATION.md, DATABASE_MIGRATION.md, DEPLOYMENT.md, OAUTH_SETUP.md, SECURITY.md, TESTING.md, transubject.pdf now in `docs/` |
| 2026-02-12 | **STRUCTURE**: Removed `README.md.bak` backup file | Outdated backup cluttering root directory |
| 2026-02-12 | **STRUCTURE**: Removed `ARCHITECTURE_DIAGRAM.html` | Standalone file replaced by admin-only `/admin/diagram` route |
| 2026-02-12 | **STRUCTURE**: Removed empty `shared/` directory | PongGame files deleted in Phase 8; entire directory now unused |
| 2026-02-12 | **STRUCTURE**: Removed redundant frontend files | `frontend/docker-compose.yml` and `frontend/Makefile` superseded by root Makefile |
| 2026-02-12 | **STRUCTURE**: Updated Makefile | Removed `SHARED_DIR`, `install-shared` target, and shared node_modules references |
| 2026-02-12 | **STRUCTURE**: Updated root `package.json` | Removed shared/ references from scripts; updated description to "Alpaca Farm" |
| 2026-02-12 | **DOCS**: Updated cross-references in README.md | Changed `DEPLOYMENT.md` → `docs/DEPLOYMENT.md`, etc. |
| 2026-02-12 | **DOCS**: Updated cross-references in CONTRIBUTING.md | Changed `TESTING.md` → `docs/TESTING.md` |
| 2026-02-12 | **DOCS**: Updated README file structure section | Removed shared/, added docs/, added nginx/, scripts/, BACKLOG.md |
| 2026-02-12 | **DOCS**: Updated CONTRIBUTING.md file structure | Removed shared/, added docs/ with full documentation list |
| 2026-02-12 | **DOCS**: Expanded "Where to Make Changes" in CONTRIBUTING.md | Added database migrations, Nginx config, docs updates |
| 2026-02-12 | **DOCS**: Created comprehensive `QUICKSTART.md` | 350+ line teammate guide: simplified structure, team roles, common workflows, troubleshooting |
| 2026-02-12 | **Outcome**: Repository simplified from 20+ root items to ~12 | Teammates can now easily find docs in `docs/`, understand structure via QUICKSTART.md |
| **Pending Decisions** | | |
| TBD | Game identity: Pong vs Alpaca Farm vs both | Need to decide — second game module may allow both |
| TBD | ORM choice | Sequelize, Prisma, or Drizzle — evaluate compatibility with dual-DB |
| TBD | Privacy Policy & Terms of Service content | Pages exist but need legal content |
| TBD | Forgot password email integration | Backend ready; need email service (SendGrid/Mailgun) for production |
