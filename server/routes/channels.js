const express = require('express');
const Channel = require('../models/Channel');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// @route   GET /api/channels
// @desc    Get all channels (public)
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const channels = await Channel.find({})
      .populate('createdBy', 'username')
      .populate('members', 'username email')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: channels.length,
      channels,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});


// @route   POST /api/channels
// @desc    Create new channel
// @access  Private
router.post('/', protect, async (req, res) => {
  try {
    const { name, description } = req.body;

    if (!name) {
      return res.status(400).json({ 
        success: false, 
        message: 'Channel name is required' 
      });
    }

    // Check if channel exists
    const channelExists = await Channel.findOne({ name });
    
    if (channelExists) {
      return res.status(400).json({ 
        success: false, 
        message: 'Channel already exists' 
      });
    }

    // Create channel
    const channel = await Channel.create({
      name,
      description: description || '',
      createdBy: req.user._id,
      members: [req.user._id]
    });

    // Populate creator info
    await channel.populate('createdBy', 'username');
    await channel.populate('members', 'username email');

    res.status(201).json({
      success: true,
      channel
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
});

// @route   GET /api/channels/:id
// @desc    Get single channel
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const channel = await Channel.findById(req.params.id)
      .populate('createdBy', 'username')
      .populate('members', 'username email');

    if (!channel) {
      return res.status(404).json({ 
        success: false, 
        message: 'Channel not found' 
      });
    }

    // Check if user is member
    if (!channel.members.some(member => member._id.toString() === req.user._id.toString())) {
      return res.status(403).json({ 
        success: false, 
        message: 'Not authorized to view this channel' 
      });
    }

    res.status(200).json({
      success: true,
      channel
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
});

// @route   PUT /api/channels/:id/join
// @desc    Join a channel
// @access  Private
router.put('/:id/join', protect, async (req, res) => {
  try {
    const channel = await Channel.findById(req.params.id);

    if (!channel) {
      return res.status(404).json({ 
        success: false, 
        message: 'Channel not found' 
      });
    }

    // Check if already a member
    if (channel.members.includes(req.user._id)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Already a member of this channel' 
      });
    }

    // Add user to members
    channel.members.push(req.user._id);
    await channel.save();

    await channel.populate('members', 'username email');

    res.status(200).json({
      success: true,
      message: 'Joined channel successfully',
      channel
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
});

// @route   PUT /api/channels/:id/leave
// @desc    Leave a channel
// @access  Private
router.put('/:id/leave', protect, async (req, res) => {
  try {
    const channel = await Channel.findById(req.params.id);

    if (!channel) {
      return res.status(404).json({ 
        success: false, 
        message: 'Channel not found' 
      });
    }

    // Check if member
    if (!channel.members.includes(req.user._id)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Not a member of this channel' 
      });
    }

    // Remove user from members
    channel.members = channel.members.filter(
      member => member.toString() !== req.user._id.toString()
    );
    await channel.save();

    res.status(200).json({
      success: true,
      message: 'Left channel successfully'
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
});

module.exports = router;
