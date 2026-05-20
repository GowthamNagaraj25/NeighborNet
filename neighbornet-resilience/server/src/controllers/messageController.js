const MessageThread = require('../models/MessageThread');
const Message = require('../models/Message');
const { getIO } = require('../services/socketService');

const getThreads = async (req, res, next) => {
  try {
    const threads = await MessageThread.find({ participants: req.user._id })
      .populate('participants', 'name neighborhood verificationStatus badges')
      .populate('post', 'title category urgency')
      .sort({ updatedAt: -1 });
    res.json({ success: true, data: threads });
  } catch (err) {
    next(err);
  }
};

const createThread = async (req, res, next) => {
  try {
    const { participantId, postId } = req.body;
    if (!participantId) return res.status(400).json({ success: false, message: 'participantId required' });

    // Check if thread already exists
    const existing = await MessageThread.findOne({
      participants: { $all: [req.user._id, participantId] },
      ...(postId && { post: postId }),
    });
    if (existing) {
      await existing.populate('participants', 'name neighborhood verificationStatus badges');
      await existing.populate('post', 'title category urgency');
      return res.json({ success: true, data: existing });
    }

    const thread = await MessageThread.create({
      participants: [req.user._id, participantId],
      ...(postId && { post: postId }),
    });
    await thread.populate('participants', 'name neighborhood verificationStatus badges');
    await thread.populate('post', 'title category urgency');
    res.status(201).json({ success: true, data: thread });
  } catch (err) {
    next(err);
  }
};

const getMessages = async (req, res, next) => {
  try {
    const thread = await MessageThread.findById(req.params.id);
    if (!thread) return res.status(404).json({ success: false, message: 'Thread not found' });
    if (!thread.participants.map((p) => p.toString()).includes(req.user._id.toString())) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }
    const messages = await Message.find({ thread: req.params.id })
      .populate('sender', 'name neighborhood verificationStatus badges')
      .sort({ createdAt: 1 });

    // Mark as read
    await Message.updateMany(
      { thread: req.params.id, readBy: { $ne: req.user._id } },
      { $addToSet: { readBy: req.user._id } }
    );

    res.json({ success: true, data: messages });
  } catch (err) {
    next(err);
  }
};

const sendMessage = async (req, res, next) => {
  try {
    const { text } = req.body;
    if (!text?.trim()) return res.status(400).json({ success: false, message: 'Message text required' });

    const thread = await MessageThread.findById(req.params.id);
    if (!thread) return res.status(404).json({ success: false, message: 'Thread not found' });
    if (!thread.participants.map((p) => p.toString()).includes(req.user._id.toString())) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    const message = await Message.create({
      thread: req.params.id,
      sender: req.user._id,
      text: text.trim(),
      readBy: [req.user._id],
    });
    await message.populate('sender', 'name neighborhood verificationStatus badges');

    // Update thread last message
    await MessageThread.findByIdAndUpdate(req.params.id, {
      lastMessage: text.trim().substring(0, 100),
      lastMessageAt: new Date(),
    });

    // Emit via socket
    try {
      const io = getIO();
      io.to(`thread:${req.params.id}`).emit('receiveMessage', {
        threadId: req.params.id,
        message,
      });
    } catch (e) {
      // Socket not critical
    }

    res.status(201).json({ success: true, data: message });
  } catch (err) {
    next(err);
  }
};

module.exports = { getThreads, createThread, getMessages, sendMessage };
