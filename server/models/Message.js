const mongoose = require('mongoose');

const MessageSchema = new mongoose.Schema({
  channel: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Channel',
    required: true,
    index: true
  },
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  content: {
    type: String,
    required: [true, 'Message content is required'],
    trim: true,
    maxlength: 2000
  },
  timestamp: {
    type: Date,
    default: Date.now,
    index: true
  },
  edited: {
    type: Boolean,
    default: false
  },
  deleted: {
    type: Boolean,
    default: false
  }
});

// Compound index for efficient pagination queries
MessageSchema.index({ channel: 1, timestamp: -1 });

module.exports = mongoose.model('Message', MessageSchema);
