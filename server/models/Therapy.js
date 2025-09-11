const mongoose = require('mongoose');

const TherapySchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: String,
  durationMinutes: { type: Number, required: true }
});

module.exports = mongoose.model('Therapy', TherapySchema);
