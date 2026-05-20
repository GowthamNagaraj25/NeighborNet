const mongoose = require('mongoose');

const postSchema = new mongoose.Schema(
  {
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    type: { type: String, enum: ['request', 'offer'], required: true },
    title: { type: String, required: true, trim: true },
    category: {
      type: String,
      enum: [
        'groceries', 'medical', 'transport', 'tools', 'repairs',
        'childcare', 'elderly-care', 'education', 'blood', 'emergency',
        'money-lending', 'logistics', 'other',
      ],
      required: true,
    },
    description: { type: String, required: true, trim: true },
    urgency: { type: String, enum: ['low', 'medium', 'high', 'critical'], default: 'medium' },
    status: {
      type: String,
      enum: ['open', 'matched', 'in-progress', 'completed', 'cancelled'],
      default: 'open',
    },
    vicinityRadiusKm: { type: Number, default: 5 },
    location: {
      type: { type: String, enum: ['Point'], default: 'Point' },
      coordinates: { type: [Number], default: [80.2707, 13.0827] },
    },
    tags: [{ type: String, trim: true }],
    neededByDate: { type: Date },
    matchedUsers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    completionNote: { type: String },
    // Money lending specific
    amountNeeded: { type: Number },
    repaymentDate: { type: Date },
  },
  { timestamps: true }
);

postSchema.index({ location: '2dsphere' });
postSchema.index({ category: 1, urgency: 1, status: 1 });

module.exports = mongoose.model('Post', postSchema);
