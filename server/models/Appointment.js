const mongoose = require('mongoose');

const AppointmentSchema = new mongoose.Schema({
  patient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  practitioner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  therapy: { type: mongoose.Schema.Types.ObjectId, ref: 'Therapy', required: true },
  startTime: { type: Date, required: true },
  endTime: { type: Date, required: true },
  status: { type: String, enum: ['scheduled', 'completed', 'cancelled'], default: 'scheduled' },
  progress: [{
    by: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    notes: String,
    metrics: mongoose.Schema.Types.Mixed,
    createdAt: { type: Date, default: Date.now }
  }],
  notes: String,
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Appointment', AppointmentSchema);
