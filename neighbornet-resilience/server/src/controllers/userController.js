const User = require('../models/User');

const getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).select('-passwordHash');
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    res.json({ success: true, data: user });
  } catch (err) {
    next(err);
  }
};

const updateMe = async (req, res, next) => {
  try {
    const allowed = ['name', 'phone', 'neighborhood', 'addressText', 'skills', 'availability', 'location', 'bloodGroup', 'willingToDonate', 'lastDonationDate', 'emergencyContact'];
    const updates = {};
    allowed.forEach((field) => {
      if (req.body[field] !== undefined) updates[field] = req.body[field];
    });
    const user = await User.findByIdAndUpdate(req.user._id, updates, { new: true, runValidators: true }).select('-passwordHash');
    res.json({ success: true, data: user });
  } catch (err) {
    next(err);
  }
};

const getNearbyUsers = async (req, res, next) => {
  try {
    const { lat, lng, radius = 10 } = req.query;
    if (!lat || !lng) return res.status(400).json({ success: false, message: 'lat and lng required' });
    const users = await User.find({
      location: {
        $near: {
          $geometry: { type: 'Point', coordinates: [parseFloat(lng), parseFloat(lat)] },
          $maxDistance: parseFloat(radius) * 1000,
        },
      },
      verificationStatus: 'verified',
    }).select('-passwordHash').limit(20);
    res.json({ success: true, data: users });
  } catch (err) {
    next(err);
  }
};

const getBloodDonors = async (req, res, next) => {
  try {
    const { bloodGroup, lat, lng, radius = 20 } = req.query;
    const query = { willingToDonate: true };
    if (bloodGroup) query.bloodGroup = bloodGroup;

    let donors;
    if (lat && lng) {
      donors = await User.find({
        ...query,
        location: {
          $near: {
            $geometry: { type: 'Point', coordinates: [parseFloat(lng), parseFloat(lat)] },
            $maxDistance: parseFloat(radius) * 1000,
          },
        },
      }).select('-passwordHash').limit(30);
    } else {
      donors = await User.find(query).select('-passwordHash').limit(30);
    }
    res.json({ success: true, data: donors });
  } catch (err) {
    next(err);
  }
};

module.exports = { getProfile, updateMe, getNearbyUsers, getBloodDonors };
