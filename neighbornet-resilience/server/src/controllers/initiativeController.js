const Initiative = require('../models/Initiative');
const User = require('../models/User');

const getInitiatives = async (req, res, next) => {
  try {
    const initiatives = await Initiative.find()
      .populate('organizer', 'name neighborhood verificationStatus badges')
      .sort({ createdAt: -1 });
    res.json({ success: true, data: initiatives });
  } catch (err) {
    next(err);
  }
};

const createInitiative = async (req, res, next) => {
  try {
    const initiative = await Initiative.create({ ...req.body, organizer: req.user._id });
    await initiative.populate('organizer', 'name neighborhood verificationStatus badges');
    // Award badge
    await User.findByIdAndUpdate(req.user._id, {
      $addToSet: { badges: 'Community Organizer' },
    });
    res.status(201).json({ success: true, data: initiative });
  } catch (err) {
    next(err);
  }
};

const updateInitiative = async (req, res, next) => {
  try {
    const initiative = await Initiative.findById(req.params.id);
    if (!initiative) return res.status(404).json({ success: false, message: 'Initiative not found' });
    if (initiative.organizer.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }
    Object.assign(initiative, req.body);
    await initiative.save();
    res.json({ success: true, data: initiative });
  } catch (err) {
    next(err);
  }
};

const updateInitiativeStatus = async (req, res, next) => {
  try {
    const initiative = await Initiative.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status },
      { new: true }
    );
    if (!initiative) return res.status(404).json({ success: false, message: 'Initiative not found' });
    res.json({ success: true, data: initiative });
  } catch (err) {
    next(err);
  }
};

module.exports = { getInitiatives, createInitiative, updateInitiative, updateInitiativeStatus };
