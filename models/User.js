const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  brightspaceUserId: { type: String, required: true },
  email: { type: String, required: true },
  name: { type: String },
  roles: [{ type: String }],
  orgUnitId: { type: String },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', userSchema);