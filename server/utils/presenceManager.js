const { isRedisEnabled } = require('../config/redis');

class PresenceManager {
  async setUserOnline() {
    if (!isRedisEnabled()) return;
  }

  async removeUserSocket() {
    if (!isRedisEnabled()) return;
  }

  async getUserStatus() {
    if (!isRedisEnabled()) return 'offline';
    return 'offline';
  }

  async getChannelOnlineUsers() {
    if (!isRedisEnabled()) return [];
    return [];
  }

  async updateHeartbeat() {
    if (!isRedisEnabled()) return;
  }
}

module.exports = new PresenceManager();
