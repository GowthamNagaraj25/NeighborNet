const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    phone: { type: String, trim: true },
    role: { type: String, enum: ['resident', 'organizer', 'admin'], default: 'resident' },
    verificationStatus: {
      type: String,
      enum: ['pending', 'verified', 'rejected'],
      default: 'pending',
    },
    neighborhood: { type: String, trim: true },
    addressText: { type: String, trim: true },
    location: {
      type: { type: String, enum: ['Point'], default: 'Point' },
      coordinates: { type: [Number], default: [80.2707, 13.0827] }, // [lng, lat]
    },
    skills: [{ type: String, trim: true }],
    availability: { type: String, trim: true },
    badges: [{ type: String }],
    trustScore: { type: Number, default: 50 },
    // Blood donor fields
    bloodGroup: { type: String, enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', ''] },
    willingToDonate: { type: Boolean, default: false },
    lastDonationDate: { type: Date },
    emergencyContact: { type: String },
    // Verification submission
    verificationSubmission: {
      addressProofType: String,
      neighborhoodCode: String,
      localReferenceName: String,
      submittedAt: Date,
    },
  },
  { timestamps: true }
);

userSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('User', userSchema);
