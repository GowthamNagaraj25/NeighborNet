const mongoose = require('mongoose');

const messageThreadSchema = new mongoose.Schema(
  {
    participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }],
    post: { type: mongoose.Schema.Types.ObjectId, ref: 'Post' },
    lastMessage: { type: String },
    lastMessageAt: { type: Date },
  },
  { timestamps: true }
);

module.exports = mongoose.model('MessageThread', messageThreadSchema);
