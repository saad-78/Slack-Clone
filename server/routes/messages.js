const express = require('express');
const Message = require('../models/Message');
const Channel = require('../models/Channel');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// @route   GET /api/messages/:channelId
// @desc    Get messages for a channel (with pagination)
// @access  Private
router.get('/:channelId', protect, async (req, res) => {
  try {
    const { channelId } = req.params;
    const { limit = 50, before } = req.query;

    // Check if user is member of channel
    const channel = await Channel.findById(channelId);

    if (!channel) {
      return res.status(404).json({
        success: false,
        message: 'Channel not found'
      });
    }

    // If not member, auto-join channel
    if (!channel.members.includes(req.user._id)) {
      channel.members.push(req.user._id);
      await channel.save();
    }


    // Build query
    const query = { channel: channelId, deleted: false };

    if (before) {
      // Cursor-based pagination
      query._id = { $lt: before };
    }

    // Fetch messages
    const messages = await Message.find(query)
      .sort({ timestamp: -1 })
      .limit(parseInt(limit))
      .populate('sender', 'username email');

    // Check if more messages exist
    const hasMore = messages.length === parseInt(limit);
    const nextCursor = messages.length > 0 ? messages[messages.length - 1]._id : null;

    res.status(200).json({
      success: true,
      count: messages.length,
      messages: messages.reverse(), // Reverse to chronological order
      hasMore,
      nextCursor
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

module.exports = router;
