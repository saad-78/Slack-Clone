const jwt = require('jsonwebtoken');
const Message = require('../models/Message');
const Channel = require('../models/Channel');
const presenceManager = require('../utils/presenceManager');


module.exports = (io) => {
  // Socket.IO authentication middleware
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      
      if (!token) {
        return next(new Error('Authentication error'));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.userId = decoded.id;
      next();
    } catch (error) {
      next(new Error('Authentication error'));
    }
  });


  

  io.on('connection', async (socket) => {
    console.log(`✅ User connected: ${socket.userId} (${socket.id})`);

    // Set user online
    await presenceManager.setUserOnline(socket.userId, socket.id);

    // Join user's channels
    const channels = await Channel.find({ members: socket.userId });
    channels.forEach(channel => {
      socket.join(channel._id.toString());
    });

    // Emit presence to all user's channels
    channels.forEach(async (channel) => {
      const onlineUsers = await presenceManager.getChannelOnlineUsers(channel.members);
      io.to(channel._id.toString()).emit('presence:update', onlineUsers);
    });

    // Handle joining a channel
    socket.on('channel:join', async (channelId) => {
      socket.join(channelId);
      
      const channel = await Channel.findById(channelId);
      if (channel) {
        const onlineUsers = await presenceManager.getChannelOnlineUsers(channel.members);
        io.to(channelId).emit('presence:update', onlineUsers);
      }
    });

    // Handle leaving a channel
    socket.on('channel:leave', (channelId) => {
      socket.leave(channelId);
    });

    // Handle new message
    socket.on('message:send', async (data, callback) => {
      try {
        const { channelId, content } = data;

        // Verify user is member
        const channel = await Channel.findById(channelId);
        if (!channel || !channel.members.includes(socket.userId)) {
          return callback({ success: false, message: 'Not authorized' });
        }

        // Save message to database
        const message = await Message.create({
          channel: channelId,
          sender: socket.userId,
          content
        });

        // Populate sender info
        await message.populate('sender', 'username email');

        // Broadcast to channel
        io.to(channelId).emit('message:new', message);

        // Acknowledge
        callback({ success: true, messageId: message._id });
      } catch (error) {
        callback({ success: false, message: error.message });
      }
    });

    // Handle heartbeat
    socket.on('heartbeat', async () => {
      await presenceManager.updateHeartbeat(socket.userId);
    });

    // Handle typing indicator
    socket.on('typing:start', (channelId) => {
      socket.to(channelId).emit('typing:user', { 
        userId: socket.userId, 
        channelId 
      });
    });

    socket.on('typing:stop', (channelId) => {
      socket.to(channelId).emit('typing:stop', { 
        userId: socket.userId, 
        channelId 
      });
    });

    // Handle disconnect
    socket.on('disconnect', async () => {
      console.log(`❌ User disconnected: ${socket.userId} (${socket.id})`);
      
      await presenceManager.removeUserSocket(socket.userId, socket.id);

      // Update presence in all channels
      channels.forEach(async (channel) => {
        const onlineUsers = await presenceManager.getChannelOnlineUsers(channel.members);
        io.to(channel._id.toString()).emit('presence:update', onlineUsers);
      });
    });
  });
};
