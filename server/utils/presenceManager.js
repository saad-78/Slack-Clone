const { redisClient } = require('../config/redis');

const isRedisEnabled = () => redisClient.isOpen;


class PresenceManager {
  async setUserOnline(userId, socketId) {
    if (!isRedisEnabled()) return;
    await redisClient.hSet(`user:${userId}:sockets`, socketId, Date.now());
    await redisClient.set(`user:${userId}:status`, 'online', { EX: 60 });
  }

  async removeUserSocket(userId, socketId) {
    if (!isRedisEnabled()) return;
    await redisClient.hDel(`user:${userId}:sockets`, socketId);
    const sockets = await redisClient.hGetAll(`user:${userId}:sockets`);
    if (Object.keys(sockets).length === 0) {
      await redisClient.set(`user:${userId}:status`, 'offline');
    }
  }

  async getUserStatus(userId) {
    if (!isRedisEnabled()) return 'offline';
    return (await redisClient.get(`user:${userId}:status`)) || 'offline';
  }

  async getChannelOnlineUsers(memberIds) {
    if (!isRedisEnabled()) return [];
    const statuses = await Promise.all(
      memberIds.map(async (id) => ({
        userId: id.toString(),
        status: await this.getUserStatus(id),
      }))
    );
    return statuses.filter((s) => s.status === 'online');
  }

  async updateHeartbeat(userId) {
    if (!isRedisEnabled()) return;
    await redisClient.expire(`user:${userId}:status`, 60);
  }
}

module.exports = new PresenceManager();

