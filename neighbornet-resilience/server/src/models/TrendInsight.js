const mongoose = require('mongoose');

const trendInsightSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    summary: { type: String, required: true },
    category: { type: String },
    severity: { type: String, enum: ['low', 'medium', 'high', 'critical'], default: 'medium' },
    detectedFromPosts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Post' }],
    recommendedAction: { type: String },
    affectedArea: { type: String },
    evidenceCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model('TrendInsight', trendInsightSchema);
