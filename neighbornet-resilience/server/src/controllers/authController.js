const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' });

const register = async (req, res, next) => {
  try {
    const { name, email, password, role, neighborhood, addressText, phone, location } = req.body;

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Email already registered' });
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const user = await User.create({
      name,
      email,
      passwordHash,
      role: role || 'resident',
      neighborhood,
      addressText,
      phone,
      location: location || { type: 'Point', coordinates: [80.2707, 13.0827] },
    });

    const token = generateToken(user._id);
    res.status(201).json({
      success: true,
      data: {
        token,
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          verificationStatus: user.verificationStatus,
          neighborhood: user.neighborhood,
          badges: user.badges,
          trustScore: user.trustScore,
        },
      },
    });
  } catch (err) {
    next(err);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }
    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }
    const token = generateToken(user._id);
    res.json({
      success: true,
      data: {
        token,
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          verificationStatus: user.verificationStatus,
          neighborhood: user.neighborhood,
          badges: user.badges,
          trustScore: user.trustScore,
          skills: user.skills,
          bloodGroup: user.bloodGroup,
          willingToDonate: user.willingToDonate,
          location: user.location,
        },
      },
    });
  } catch (err) {
    next(err);
  }
};

const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).select('-passwordHash');
    res.json({ success: true, data: user });
  } catch (err) {
    next(err);
  }
};

const submitVerification = async (req, res, next) => {
  try {
    const { addressProofType, neighborhoodCode, localReferenceName } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user._id,
      {
        verificationStatus: 'pending',
        verificationSubmission: {
          addressProofType,
          neighborhoodCode,
          localReferenceName,
          submittedAt: new Date(),
        },
      },
      { new: true }
    ).select('-passwordHash');
    res.json({ success: true, data: user, message: 'Verification submitted successfully' });
  } catch (err) {
    next(err);
  }
};

const simulateVerification = async (req, res, next) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.user._id,
      {
        verificationStatus: 'verified',
        $addToSet: { badges: 'Verified Resident' },
        trustScore: 70,
      },
      { new: true }
    ).select('-passwordHash');
    res.json({ success: true, data: user, message: 'Verification simulated successfully' });
  } catch (err) {
    next(err);
  }
};

module.exports = { register, login, getMe, submitVerification, simulateVerification };
