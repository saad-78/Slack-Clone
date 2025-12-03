require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const connectDB = require('./config/db');
const { connectRedis } = require('./config/redis');
const socketHandler = require('./socket/socketHandler');

const app = express();
const server = http.createServer(app);

// ✅ Allowed origins for dev
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:5173',
  'https://slack-clone-omega-orcin.vercel.app',
  process.env.FRONTEND_URL
].filter(Boolean);

// ✅ CORS for REST API
app.use(cors({
  origin: (origin, callback) => {
    // Allow tools like Postman with no origin
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ✅ Socket.IO with same origins
const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    credentials: true,
  },
});

// DB connections
connectDB();
connectRedis();

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/channels', require('./routes/channels'));
app.use('/api/messages', require('./routes/messages'));

app.get('/', (req, res) => {
  res.json({ message: 'Team Chat API is running' });
});

// Socket.IO handler
socketHandler(io);

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
