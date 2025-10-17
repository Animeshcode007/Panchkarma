// server/models/PatientRecord.js
const mongoose = require('mongoose');

const PatientRecordSchema = new mongoose.Schema({
    patient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    contactInfo: {
        phone: String,
        address: String
    },
    medicalHistory: { type: String, default: '' },
    assignedTherapyPlan: { type: String, default: '' }, // free-text or structured later
    updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('PatientRecord', PatientRecordSchema);
