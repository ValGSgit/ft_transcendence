# Fixes Summary

## Issues Fixed

### 1. **Posts Not Working / "Invalid Date" Error**
**Problem:** Posts were showing "Invalid date" and filter/reduce TypeErrors were occurring.

**Root Cause:** 
- Store state (posts, friends, conversations) wasn't guaranteed to be arrays
- Date formatting didn't handle null/invalid dates

**Fixes Applied:**
- **frontend/src/stores/social.js:**
  - Added null safety checks to `unreadNotifications` and `pendingRequests` computed properties
  - Modified `fetchPosts()` to ensure `posts.value` is always an array with `Array.isArray()` checks
  - Modified `createPost()` to check array before unshift operation
  - Added `updatePost()` function for editing posts

- **frontend/src/stores/chat.js:**
  - Added null safety to `unreadCount` computed property
  - Fixed `sortedConversations` to handle undefined conversations array
  - Modified `fetchConversations()` to ensure result is always an array

- **frontend/src/components/PostCard.vue:**
  - Updated `formatTime()` function to check for null/invalid dates
  - Returns empty string for invalid dates instead of "Invalid date"
  - Added `isNaN(date.getTime())` check

### 2. **Friend Requests / Suggestions 404 Errors**
**Problem:** Frontend was calling `/friends/suggestions` and `/friends/requests/sent` which didn't exist.

**Fixes Applied:**
- **backend/src/models/Friend.js:**
  - Added `getSentRequests(userId)` method to get pending requests sent by user
  - Added `getSuggestions(userId, limit)` method to get friend suggestions based on mutual friends

- **backend/src/controllers/friendController.js:**
  - Added `getSentRequests()` controller function
  - Added `getSuggestions()` controller function

- **backend/src/routes/friends.js:**
  - Added `GET /friends/suggestions` route
  - Added `GET /friends/requests/sent` route
  - Imported new controller functions

- **frontend/src/views/Friends.vue:**
  - Already had graceful fallback for missing endpoints (try/catch with empty array)
  - Now uses the actual endpoints when available

### 3. **"can't access property 'avatar', t.user is undefined" Error**
**Problem:** Frontend expected `conversation.user` object but backend returns different conversation formats.

**Root Cause:** Backend can return conversations with either:
- `user` property (direct messages)
- `members` array (group chats)
- Just `name` property

**Fixes Applied:**
- **frontend/src/views/Messages.vue:**
  - Added `getConversationUser(conv)` helper function that handles all formats
  - Updated all template references to use helper instead of direct `activeConversation.user`
  - Fixed message avatars, typing indicator, chat header, chat info sidebar
  - Updated `startNewConversation()`, `visitFarm()`, `visitProfile()`, `startGame()` to use helper
  - Removed duplicate `visitFarm()` function

### 4. **Implemented Remaining TODOs**

#### Post Editing Feature
- **frontend/src/components/PostCard.vue:**
  - Added `'edit'` to emits list
  - Updated `editPost()` to emit edit event

- **frontend/src/views/Feed.vue:**
  - Added `showEditModal`, `editingPost`, and `editPost` reactive state
  - Added `handleEdit()` function to open edit modal
  - Added `submitEdit()` function to save changes
  - Added edit modal to template
  - Added `@edit` handler to PostCard component

- **frontend/src/stores/social.js:**
  - Added `updatePost(postId, postData)` function
  - Exported in store return object

#### Post Sharing Feature
- **frontend/src/views/Feed.vue:**
  - Implemented `handleShare()` with native share API support
  - Fallback to clipboard copy for browsers without share API
  - Handles errors gracefully

#### Message Image Attachment
- **frontend/src/views/Messages.vue:**
  - Implemented `attachImage()` to create file input and read image as data URL
  - Sends message with image through chat store

#### Farm Sharing in Messages
- **frontend/src/views/Messages.vue:**
  - Implemented `shareFarm()` to read farm data from localStorage
  - Sends formatted farm data message to active conversation

#### Visit User Farm
- **frontend/src/views/Messages.vue:**
  - Updated `visitUserFarm(userId)` to pass userId in query param

#### Friends Count in Home
- **frontend/src/views/Home.vue:**
  - Fetches friends count from `/friends` API
  - Updates `userStats.friends` with actual count

## Files Modified

### Backend
1. `backend/src/models/Friend.js` - Added getSentRequests and getSuggestions methods
2. `backend/src/controllers/friendController.js` - Added controller functions for new endpoints
3. `backend/src/routes/friends.js` - Added routes for suggestions and sent requests

### Frontend
4. `frontend/src/stores/social.js` - Null safety, updatePost function
5. `frontend/src/stores/chat.js` - Null safety for conversations
6. `frontend/src/views/Feed.vue` - Edit post modal, share implementation
7. `frontend/src/views/Messages.vue` - Conversation user helper, image/farm sharing
8. `frontend/src/views/Friends.vue` - Already had graceful fallbacks
9. `frontend/src/views/Home.vue` - Friends count implementation
10. `frontend/src/components/PostCard.vue` - Date validation, edit emit

## Testing Recommendations

1. **Posts:**
   - Create new posts ✓
   - Edit existing posts ✓
   - Delete posts ✓
   - Share posts (test native share + clipboard fallback) ✓
   - Check that dates display correctly ✓

2. **Friends:**
   - View friend suggestions ✓
   - Send friend requests ✓
   - View sent requests ✓
   - Accept/decline requests ✓

3. **Messages:**
   - Send text messages ✓
   - Attach images ✓
   - Share farm data ✓
   - Visit user farms from shared farm cards ✓
   - View profile from chat info ✓

4. **Error Handling:**
   - Check browser console for errors ✓
   - Verify no "Invalid date" messages ✓
   - Verify no "filter/reduce is not a function" errors ✓
   - Verify no "can't access property" errors ✓

## Known Remaining TODOs

These TODOs are lower priority or require more complex implementation:

1. **Profile.vue:**
   - Share modal (line 458)
   - Cover photo editor (line 473)
   - Avatar editor (line 477)

2. **Settings.vue:**
   - Avatar upload (line 471)

3. **Game.vue:**
   - Load friend's farm via API (line 1104)

These can be implemented in future iterations as they don't affect core functionality.
