const Post = require('../models/Post');
const User = require('../models/User');
const { emitCriticalPost, emitPostStatusUpdate } = require('../services/socketService');

const getPosts = async (req, res, next) => {
  try {
    const { type, category, urgency, status, search, sort = 'newest', page = 1, limit = 20 } = req.query;
    const query = {};
    if (type) query.type = type;
    if (category) query.category = category;
    if (urgency) query.urgency = urgency;
    if (status) query.status = status;
    else query.status = { $nin: ['cancelled'] };
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } },
      ];
    }

    const sortMap = {
      newest: { createdAt: -1 },
      oldest: { createdAt: 1 },
      urgent: { urgency: -1, createdAt: -1 },
    };

    const posts = await Post.find(query)
      .populate('author', 'name neighborhood verificationStatus badges trustScore')
      .sort(sortMap[sort] || { createdAt: -1 })
      .skip((parseInt(page) - 1) * parseInt(limit))
      .limit(parseInt(limit));

    const total = await Post.countDocuments(query);
    res.json({ success: true, data: posts, total, page: parseInt(page), pages: Math.ceil(total / parseInt(limit)) });
  } catch (err) {
    next(err);
  }
};

const getPostById = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id)
      .populate('author', 'name neighborhood verificationStatus badges trustScore skills bloodGroup')
      .populate('matchedUsers', 'name neighborhood verificationStatus badges');
    if (!post) return res.status(404).json({ success: false, message: 'Post not found' });
    res.json({ success: true, data: post });
  } catch (err) {
    next(err);
  }
};

const createPost = async (req, res, next) => {
  try {
    const postData = { ...req.body, author: req.user._id };
    if (!postData.location) {
      postData.location = req.user.location;
    }
    const post = await Post.create(postData);
    await post.populate('author', 'name neighborhood verificationStatus badges trustScore');

    // Emit critical post alert
    if (post.urgency === 'critical') {
      const nearbyUsers = await User.find({
        location: {
          $near: {
            $geometry: post.location,
            $maxDistance: (post.vicinityRadiusKm || 5) * 1000,
          },
        },
        verificationStatus: 'verified',
        _id: { $ne: req.user._id },
      }).select('_id');
      emitCriticalPost(post, nearbyUsers.map((u) => u._id.toString()));
    }

    res.status(201).json({ success: true, data: post });
  } catch (err) {
    next(err);
  }
};

const updatePost = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ success: false, message: 'Post not found' });
    if (post.author.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }
    const allowed = ['title', 'description', 'urgency', 'tags', 'neededByDate', 'vicinityRadiusKm', 'location', 'amountNeeded', 'repaymentDate'];
    allowed.forEach((field) => {
      if (req.body[field] !== undefined) post[field] = req.body[field];
    });
    await post.save();
    await post.populate('author', 'name neighborhood verificationStatus badges trustScore');
    res.json({ success: true, data: post });
  } catch (err) {
    next(err);
  }
};

const deletePost = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ success: false, message: 'Post not found' });
    if (post.author.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }
    await post.deleteOne();
    res.json({ success: true, message: 'Post deleted' });
  } catch (err) {
    next(err);
  }
};

const updatePostStatus = async (req, res, next) => {
  try {
    const { status, completionNote } = req.body;
    const post = await Post.findById(req.params.id).populate('matchedUsers', '_id');
    if (!post) return res.status(404).json({ success: false, message: 'Post not found' });
    if (post.author.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }
    post.status = status;
    if (completionNote) post.completionNote = completionNote;
    await post.save();

    // Award badge for completing help
    if (status === 'completed') {
      const completedCount = await Post.countDocuments({ author: post.author, status: 'completed' });
      if (completedCount >= 5) {
        await User.findByIdAndUpdate(post.author, { $addToSet: { badges: 'Completed 5 Helps' } });
      }
      if (completedCount === 1) {
        await User.findByIdAndUpdate(post.author, { $addToSet: { badges: 'First Helper' } });
      }
    }

    const participantIds = post.matchedUsers.map((u) => u._id.toString());
    emitPostStatusUpdate(post, participantIds);

    res.json({ success: true, data: post });
  } catch (err) {
    next(err);
  }
};

const getMyPosts = async (req, res, next) => {
  try {
    const posts = await Post.find({ author: req.user._id })
      .populate('author', 'name neighborhood verificationStatus badges')
      .sort({ createdAt: -1 });
    res.json({ success: true, data: posts });
  } catch (err) {
    next(err);
  }
};

const getNearbyPosts = async (req, res, next) => {
  try {
    const { lat, lng, radius = 10, category, urgency } = req.query;
    if (!lat || !lng) return res.status(400).json({ success: false, message: 'lat and lng required' });

    const query = {
      location: {
        $near: {
          $geometry: { type: 'Point', coordinates: [parseFloat(lng), parseFloat(lat)] },
          $maxDistance: parseFloat(radius) * 1000,
        },
      },
      status: { $nin: ['completed', 'cancelled'] },
    };
    if (category) query.category = category;
    if (urgency) query.urgency = urgency;

    const posts = await Post.find(query)
      .populate('author', 'name neighborhood verificationStatus badges trustScore')
      .limit(50);
    res.json({ success: true, data: posts });
  } catch (err) {
    next(err);
  }
};

module.exports = { getPosts, getPostById, createPost, updatePost, deletePost, updatePostStatus, getMyPosts, getNearbyPosts };
