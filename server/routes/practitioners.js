// server/routes/practitioners.js
const express = require('express');
const router = express.Router();
const asyncHandler = require('express-async-handler');
const User = require('../models/User');
const BlockTime = require('../models/BlockTime');
const PatientRecord = require('../models/PatientRecord');
const Appointment = require('../models/Appointment');
const { protect, requireRole } = require('../middleware/auth');

// Search patients by name/email (practitioner or admin)
router.get('/search-patients', protect, asyncHandler(async (req, res) => {
  const q = req.query.q || '';
  const patients = await User.find({
    role: 'patient',
    $or: [{ name: new RegExp(q, 'i') }, { email: new RegExp(q, 'i') }]
  }).limit(50).select('_id name email assignedPractitioner');
  res.json(patients);
}));

// Get patient profile (practitioner can view)
router.get('/patient/:id', protect, asyncHandler(async (req, res) => {
  if (req.user.role !== 'practitioner' && req.user.role !== 'admin') return res.status(403).json({ message: 'Only practitioners/admin' });
  const patient = await User.findById(req.params.id).select('-password');
  if (!patient) return res.status(404).json({ message: 'Patient not found' });

  // fetch patient record (if exists)
  const record = await PatientRecord.findOne({ patient: patient._id });
  // fetch last 5 appointments
  const recentAppointments = await Appointment.find({ patient: patient._id }).populate('therapy practitioner').sort('-startTime').limit(8);

  res.json({ patient, record, recentAppointments });
}));

// Create or update patient record (practitioner or admin)
router.post('/patient/:id/record', protect, asyncHandler(async (req, res) => {
  if (req.user.role !== 'practitioner' && req.user.role !== 'admin') return res.status(403).json({ message: 'Only practitioners/admin' });
  const patientId = req.params.id;
  const { contactInfo, medicalHistory, assignedTherapyPlan } = req.body;
  let rec = await PatientRecord.findOne({ patient: patientId });
  if (!rec) {
    rec = await PatientRecord.create({ patient: patientId, contactInfo, medicalHistory, assignedTherapyPlan, updatedAt: new Date() });
  } else {
    rec.contactInfo = contactInfo || rec.contactInfo;
    rec.medicalHistory = medicalHistory || rec.medicalHistory;
    rec.assignedTherapyPlan = assignedTherapyPlan || rec.assignedTherapyPlan;
    rec.updatedAt = new Date();
    await rec.save();
  }
  res.json(rec);
}));

// Block time (practitioner can block own time; admin can block any)
router.post('/block-time', protect, asyncHandler(async (req, res) => {
  const { practitionerId, startISO, endISO, reason } = req.body;
  if (!practitionerId || !startISO || !endISO) return res.status(400).json({ message: 'Missing params' });
  // only allow practitioner to block their own or admin to block any
  if (req.user.role === 'practitioner' && req.user._id.toString() !== practitionerId) return res.status(403).json({ message: 'Cannot block other practitioner' });

  const start = new Date(startISO);
  const end = new Date(endISO);
  if (isNaN(start.getTime()) || isNaN(end.getTime()) || start >= end) return res.status(400).json({ message: 'Invalid times' });

  const block = await BlockTime.create({ practitioner: practitionerId, start, end, reason, createdBy: req.user._id });
  res.json(block);
}));

// List blocks for practitioner (optional from/to)
router.get('/blocks', protect, asyncHandler(async (req, res) => {
  const practitionerId = req.query.practitionerId || req.user._id;
  const from = req.query.from ? new Date(req.query.from) : null;
  const to = req.query.to ? new Date(req.query.to) : null;
  const q = { practitioner: practitionerId };
  if (from && to) q.start = { $gte: from, $lte: to };
  const blocks = await BlockTime.find(q).sort('start');
  res.json(blocks);
}));

// Remove a block
router.delete('/block/:id', protect, asyncHandler(async (req, res) => {
  const block = await BlockTime.findById(req.params.id);
  if (!block) return res.status(404).json({ message: 'Block not found' });
  if (req.user.role === 'practitioner' && block.practitioner.toString() !== req.user._id.toString()) return res.status(403).json({ message: 'Cannot remove block' });
  await block.remove();
  res.json({ message: 'Removed' });
}));

module.exports = router;
