const Post = require('../models/Post');
const User = require('../models/User');
const TrendInsight = require('../models/TrendInsight');
const { findMatchesForPost, detectCommunityTrends, generateActionPlan } = require('../services/aiService');
const { generateLogisticsPlan } = require('../services/logisticsService');

const getMatches = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.postId).populate('author', 'name neighborhood location verificationStatus');
    if (!post) return res.status(404).json({ success: false, message: 'Post not found' });

    // Get candidate posts within radius
    const candidatePosts = await Post.find({
      _id: { $ne: post._id },
      status: { $nin: ['completed', 'cancelled'] },
      location: {
        $near: {
          $geometry: post.location,
          $maxDistance: (post.vicinityRadiusKm || 10) * 1000 * 2,
        },
      },
    }).populate('author', 'name neighborhood verificationStatus badges trustScore').limit(50);

    // Get candidate users with skills
    const candidateUsers = await User.find({
      _id: { $ne: post.author._id },
      verificationStatus: 'verified',
      skills: { $exists: true, $not: { $size: 0 } },
      location: {
        $near: {
          $geometry: post.location,
          $maxDistance: (post.vicinityRadiusKm || 10) * 1000 * 2,
        },
      },
    }).limit(30);

    const matches = await findMatchesForPost(post, candidatePosts, candidateUsers);

    res.json({
      success: true,
      data: {
        post: { _id: post._id, title: post.title, category: post.category, description: post.description },
        matches,
        totalMatches: matches.length,
        algorithm: 'Semantic matching with synonym expansion + category scoring + distance boost',
      },
    });
  } catch (err) {
    next(err);
  }
};

const getTrends = async (req, res, next) => {
  try {
    const posts = await Post.find({
      createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
    });

    const trends = detectCommunityTrends(posts);

    // Save/update trends in DB
    const savedTrends = [];
    for (const trend of trends) {
      const saved = await TrendInsight.findOneAndUpdate(
        { category: trend.category, createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } },
        trend,
        { upsert: true, new: true }
      );
      savedTrends.push(saved);
    }

    res.json({
      success: true,
      data: trends,
      message: `Analyzed ${posts.length} posts from the last 7 days`,
    });
  } catch (err) {
    next(err);
  }
};

const generatePlan = async (req, res, next) => {
  try {
    const { category, neighborhood, urgency, availableVolunteers } = req.body;

    const recentPosts = await Post.find({
      category,
      createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
    });

    const trend = {
      category,
      neighborhood: neighborhood || 'Local Area',
      urgency: urgency || 'high',
      evidenceCount: recentPosts.length,
      severity: urgency || 'high',
    };

    const plan = generateActionPlan(trend, availableVolunteers || []);

    res.json({ success: true, data: plan });
  } catch (err) {
    next(err);
  }
};

const getLogisticsPlan = async (req, res, next) => {
  try {
    const urgentRequests = await Post.find({
      type: 'request',
      urgency: { $in: ['high', 'critical'] },
      status: { $in: ['open', 'matched'] },
    }).limit(20);

    const volunteers = await User.find({
      verificationStatus: 'verified',
      skills: { $exists: true, $not: { $size: 0 } },
    }).limit(20);

    const plan = generateLogisticsPlan(urgentRequests, volunteers);

    res.json({ success: true, data: plan });
  } catch (err) {
    next(err);
  }
};

const getCommunityPulse = async (req, res, next) => {
  try {
    const [
      totalRequests,
      totalOffers,
      urgentNeeds,
      completedHelps,
      recentPosts,
      totalUsers,
      verifiedUsers,
    ] = await Promise.all([
      Post.countDocuments({ type: 'request', status: { $nin: ['cancelled'] } }),
      Post.countDocuments({ type: 'offer', status: { $nin: ['cancelled'] } }),
      Post.countDocuments({ urgency: { $in: ['high', 'critical'] }, status: { $in: ['open', 'matched'] } }),
      Post.countDocuments({ status: 'completed' }),
      Post.find({ createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } }),
      User.countDocuments(),
      User.countDocuments({ verificationStatus: 'verified' }),
    ]);

    // Category breakdown
    const categoryBreakdown = {};
    recentPosts.forEach((p) => {
      categoryBreakdown[p.category] = (categoryBreakdown[p.category] || 0) + 1;
    });
    const topCategory = Object.entries(categoryBreakdown).sort((a, b) => b[1] - a[1])[0];

    // Neighborhood breakdown
    const neighborhoodPosts = await Post.aggregate([
      { $match: { status: { $in: ['open', 'matched'] } } },
      { $lookup: { from: 'users', localField: 'author', foreignField: '_id', as: 'authorData' } },
      { $unwind: '$authorData' },
      { $group: { _id: '$authorData.neighborhood', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 },
    ]);

    res.json({
      success: true,
      data: {
        totalRequests,
        totalOffers,
        urgentNeeds,
        completedHelps,
        totalUsers,
        verifiedUsers,
        topCategory: topCategory ? { name: topCategory[0], count: topCategory[1] } : null,
        categoryBreakdown,
        topNeighborhoods: neighborhoodPosts,
        weeklyActivity: recentPosts.length,
      },
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { getMatches, getTrends, generatePlan, getLogisticsPlan, getCommunityPulse };
