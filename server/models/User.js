const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['admin','practitioner','patient'], required: true },
  assignedPractitioner: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  availability: {
    type: [{ dayOfWeek: Number, start: String, end: String }],
    default: []
  },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', UserSchema);
