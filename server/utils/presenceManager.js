const { redisClient } = require('../config/redis');

class PresenceManager {
  // Set user online
  async setUserOnline(userId, socketId) {
    await redisClient.hSet(`user:${userId}:sockets`, socketId, Date.now());
    await redisClient.set(`user:${userId}:status`, 'online', { EX: 60 });
  }

  // Remove user socket
  async removeUserSocket(userId, socketId) {
    await redisClient.hDel(`user:${userId}:sockets`, socketId);
    
    // Check if user has other active sockets
    const sockets = await redisClient.hGetAll(`user:${userId}:sockets`);
    
    if (Object.keys(sockets).length === 0) {
      await redisClient.set(`user:${userId}:status`, 'offline');
    }
  }

  // Get user status
  async getUserStatus(userId) {
    return await redisClient.get(`user:${userId}:status`) || 'offline';
  }

  // Get all online users in channel
  async getChannelOnlineUsers(memberIds) {
    const statuses = await Promise.all(
      memberIds.map(async (id) => ({
        userId: id.toString(),
        status: await this.getUserStatus(id)
      }))
    );
    return statuses.filter(s => s.status === 'online');
  }

  // Update heartbeat
  async updateHeartbeat(userId) {
    await redisClient.expire(`user:${userId}:status`, 60);
  }
}

module.exports = new PresenceManager();
