const mongoose = require('mongoose');

const mediaSelectionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  courseId: { type: String, required: true },
  assetId: { type: String, required: true },
  title: { type: String },
  altText: { type: String },
  metadata: {
    mediaType: String,
    docSubType: String,
    mediaNumber: String,
    createdDate: Date
  },
  downloadUrl: { type: String },
  insertedToBrightspace: { type: Boolean, default: false },
  insertedAt: { type: Date },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('MediaSelection', mediaSelectionSchema);