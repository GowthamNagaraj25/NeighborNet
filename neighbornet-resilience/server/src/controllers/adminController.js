const User = require('../models/User');
const Post = require('../models/Post');

const getAllUsers = async (req, res, next) => {
  try {
    const { status, role, page = 1, limit = 20 } = req.query;
    const query = {};
    if (status) query.verificationStatus = status;
    if (role) query.role = role;
    const users = await User.find(query)
      .select('-passwordHash')
      .sort({ createdAt: -1 })
      .skip((parseInt(page) - 1) * parseInt(limit))
      .limit(parseInt(limit));
    const total = await User.countDocuments(query);
    res.json({ success: true, data: users, total });
  } catch (err) {
    next(err);
  }
};

const getAllPosts = async (req, res, next) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const posts = await Post.find()
      .populate('author', 'name email neighborhood verificationStatus')
      .sort({ createdAt: -1 })
      .skip((parseInt(page) - 1) * parseInt(limit))
      .limit(parseInt(limit));
    const total = await Post.countDocuments();
    res.json({ success: true, data: posts, total });
  } catch (err) {
    next(err);
  }
};

const verifyUser = async (req, res, next) => {
  try {
    const { status } = req.body;
    if (!['verified', 'rejected', 'pending'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }
    const updates = { verificationStatus: status };
    if (status === 'verified') {
      updates.$addToSet = { badges: 'Verified Resident' };
      updates.trustScore = 70;
    }
    const user = await User.findByIdAndUpdate(req.params.id, updates, { new: true }).select('-passwordHash');
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    res.json({ success: true, data: user, message: `User ${status} successfully` });
  } catch (err) {
    next(err);
  }
};

const assignBadge = async (req, res, next) => {
  try {
    const { badge } = req.body;
    const validBadges = [
      'Verified Resident', 'First Helper', 'Blood Donor', 'Tool Sharer',
      'Emergency Responder', 'Elder Support', 'Community Organizer', 'Completed 5 Helps',
    ];
    if (!validBadges.includes(badge)) {
      return res.status(400).json({ success: false, message: 'Invalid badge' });
    }
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { $addToSet: { badges: badge } },
      { new: true }
    ).select('-passwordHash');
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    res.json({ success: true, data: user });
  } catch (err) {
    next(err);
  }
};

const deletePost = async (req, res, next) => {
  try {
    const post = await Post.findByIdAndDelete(req.params.id);
    if (!post) return res.status(404).json({ success: false, message: 'Post not found' });
    res.json({ success: true, message: 'Post deleted by admin' });
  } catch (err) {
    next(err);
  }
};

module.exports = { getAllUsers, getAllPosts, verifyUser, assignBadge, deletePost };
