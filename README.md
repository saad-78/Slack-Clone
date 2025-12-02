# Mini Team Chat Application (Slack-like)

A full-stack, real-time team chat application where multiple users can communicate inside channels with live messaging, presence, and message history.


## Tech Stack

### Frontend

- React (Vite)
- React Router
- Tailwind CSS
- Axios
- Socket.IO Client

### Backend

- Node.js
- Express.js
- Socket.IO
- MongoDB + Mongoose
- Redis (for presence tracking)
- JSON Web Tokens (JWT) for authentication

### Infrastructure

- MongoDB Atlas (database)
- Redis (local or managed)
- Render / Railway / Fly.io (backend)  
- Vercel / Netlify (frontend)

---

## Features

### Core Requirements

- **User Authentication**
  - Signup and login with JWT.
  - Auth state persisted across page refresh via stored token and `/auth/me` endpoint.
- **Channels**
  - Create new channels.
  - View all existing channels.
  - Auto-join channel when a user opens it (user is added to members list).
  - Channel info: name and member count.
- **Real-Time Messaging**
  - Messages appear instantly to all users in the same channel using Socket.IO.
  - Each message stored in MongoDB with:
    - Sender (user reference)
    - Channel (channel reference)
    - Text content
    - Timestamp
- **Online / Offline Presence**
  - Shows how many users are online in a channel.
  - Presence is tracked with Redis + Socket.IO.
  - Works across multiple browser tabs per user.
- **Message History & Pagination**
  - Recent messages loaded when entering a channel.
  - Cursor-based pagination using `before` cursor and `limit` to fetch older messages without loading everything at once.
- **Frontend UI**
  - Clean, modern, responsive layout built with Tailwind CSS:
    - Left sidebar with channel list.
    - Top header with channel name, description, member count, online count.
    - Main conversation view with message bubbles.
    - Message input bar with send button.
    - Typing indicator and online user count.

### Optional / Bonus Features Implemented

- **Typing Indicator**
  - Shows “Someone is typing…” when another user is typing in the same channel using `typing:start` / `typing:stop` events.
- **Enhanced Presence**
  - Presence tracking with Redis and per-socket tracking to support multiple tabs per user.

_(Not implemented: private channels, message editing/deletion, message search.)_

---

## Project Structure

### Backend (`/server`)

server/
config/
db.js # MongoDB connection
redis.js # Redis client & connection
models/
User.js # User schema (auth, lastSeen)
Channel.js # Channel schema (name, members)
Message.js # Message schema (channel, sender, content, timestamp)
routes/
auth.js # /api/auth (signup, login, me)
channels.js # /api/channels (list, create, join/leave)
messages.js # /api/messages (paginated fetch)
middleware/
authMiddleware.js # JWT protect middleware
socket/
socketHandler.js # Socket.IO events: messaging, presence, typing
utils/
generateToken.js # JWT creation
presenceManager.js # Redis-based presence utilities
server.js # Express app + Socket.IO setup
.env # Environment variables (not committed)


### Frontend (`/client`)

client/
src/
api.js # Axios instance with baseURL + auth header
App.jsx # Routing + providers
main.jsx # React entry
context/
AuthContext.jsx # Auth state, login/signup/logout
SocketContext.jsx # Socket.IO client connection
components/
Sidebar.jsx # Channel list, user info, create channel modal
ChatArea.jsx # Active conversation view, messages, typing, online
pages/
Login.jsx # Login form
Signup.jsx # Signup form with client-side validation
Chat.jsx # Layout combining Sidebar + ChatArea
index.css # Tailwind base + custom styles
vite.config.js
tailwind.config.js


---

## Setup & Run Instructions

### Prerequisites

- Node.js (LTS)
- npm or yarn
- MongoDB Atlas account
- Redis (local install or cloud instance)

---

### 1. Clone the Repository

git clone https://github.com/your-username/mini-team-chat.git
cd mini-team-chat


---

### 2. Backend Setup (`/server`)

cd server
npm install


Create a `.env` file in `server/`:

PORT=5000
MONGO_URI=your_mongodb_atlas_connection_string
JWT_SECRET=your_super_secret_jwt_key
JWT_EXPIRE=7d
NODE_ENV=development
REDIS_URL=redis://localhost:6379
FRONTEND_URL=http://localhost:5173


> Make sure your MongoDB Atlas cluster allows connections from your IP (or 0.0.0.0/0 for testing).

Start Redis locally or use a managed Redis and set `REDIS_URL` accordingly.

Run backend in dev mode:

npm run dev



---

### 3. Frontend Setup (`/client`)

In another terminal:

cd client
npm install



Create a `.env` file in `client/` (optional but recommended):

VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000


Start the frontend:

npm run dev



Open: `http://localhost:5173`

---

## Usage

1. **Sign up & Login**
   - Create a new user account from the Signup page.
   - Login with the same credentials.

2. **Create Channels**
   - Use the sidebar “+” button to create a new channel (e.g., `general`).

3. **Multi-User Real-Time Chat**
   - Open a second browser window/incognito.
   - Sign up/login as another user.
   - Both users will see the same channels in the sidebar.
   - Click a channel to join it and load message history.
   - Start chatting; messages will appear instantly in both windows.

4. **Presence & Typing**
   - Online count in the channel header changes as users connect/disconnect.
   - Typing in one window shows a typing indicator in the other.

5. **Pagination**
   - When many messages exist, scrolling to the top triggers loading of older messages.

---

## Design Decisions & Tradeoffs

- **JWT over Sessions**
  - Stateless, easy to scale, works cleanly with SPA frontend.
- **MongoDB for Chat Data**
  - Flexible schema for messages/channels.
  - Index on `(channel, timestamp)` for efficient paginated queries.
- **Cursor-Based Pagination**
  - Uses `_id`/timestamp as a cursor rather than offset for performance with growing message volume.
- **Socket.IO for Real-Time**
  - Provides rooms, reconnection, and fallbacks instead of raw WebSockets.
- **Redis for Presence**
  - Tracks online users and supports multiple open tabs per user.

---

## Assumptions & Limitations

- Channels are all public; there is no concept of private channels yet.
- No 1:1 direct messaging UI (only channel-based messaging).
- No message editing, deletion, or full-text search.
- Basic error handling and validation; production-hardening (rate limiting, stricter validation, etc.) can be added.

---

## Optional Improvements (Future Work)

- Private and invite-only channels.
- Direct messages between users.
- Message editing & soft deletion.
- Full-text search for messages and channels.
- File uploads and attachments.
- Notifications and unread message counts.

---

## Recording (for Assignment Submission)

The screen recording should cover:

1. **Demo**
   - Signup and login with two users.
   - Create/join channels.
   - Real-time chat between two browser windows.
   - Online/offline indication.
   - Pagination loading older messages.

2. **Code Walkthrough**
   - Backend structure (models, routes, socket handler).
   - Real-time messaging flow (Socket.IO).
   - Presence tracking (Redis + Socket.IO).
   - Frontend structure and key components (Sidebar, ChatArea, contexts).

---

## Author

- **Your Name** – Saad Samir Momin
  - Email: smomin1008@gmail.com