const mongoose = require('mongoose');

const initiativeSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    organizer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    targetCategory: { type: String },
    location: {
      type: { type: String, enum: ['Point'], default: 'Point' },
      coordinates: { type: [Number], default: [80.2707, 13.0827] },
    },
    radiusKm: { type: Number, default: 5 },
    actionPlan: { type: String },
    status: { type: String, enum: ['planned', 'active', 'completed'], default: 'planned' },
    requiredVolunteers: { type: Number, default: 0 },
    requiredResources: [{ type: String }],
  },
  { timestamps: true }
);

initiativeSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('Initiative', initiativeSchema);
