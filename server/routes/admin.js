const express = require('express');
const router = express.Router();
const asyncHandler = require('express-async-handler');
const User = require('../models/User');
const Therapy = require('../models/Therapy');
const bcrypt = require('bcryptjs');
const { protect, requireRole } = require('../middleware/auth');

// create practitioner
router.post('/practitioner', protect, requireRole('admin'), asyncHandler(async (req, res) => {
  const { name, email, password, availability } = req.body;
  if (!email || !password || !name) return res.status(400).json({ message: 'Missing fields' });
  const exists = await User.findOne({ email });
  if (exists) return res.status(400).json({ message: 'User exists' });
  const hashed = await bcrypt.hash(password, 10);
  const pr = await User.create({ name, email, password: hashed, role: 'practitioner', availability });
  res.json(pr);
}));

// create patient
router.post('/patient', protect, requireRole('admin'), asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;
  if (!email || !password || !name) return res.status(400).json({ message: 'Missing fields' });
  const exists = await User.findOne({ email });
  if (exists) return res.status(400).json({ message: 'User exists' });
  const hashed = await bcrypt.hash(password, 10);
  const p = await User.create({ name, email, password: hashed, role: 'patient' });
  res.json(p);
}));

// assign practitioner to patient
router.post('/assign', protect, requireRole('admin'), asyncHandler(async (req, res) => {
  const { patientId, practitionerId } = req.body;
  if (!patientId || !practitionerId) return res.status(400).json({ message: 'patientId and practitionerId required' });
  const patient = await User.findById(patientId);
  if (!patient || patient.role !== 'patient') return res.status(404).json({ message: 'Patient not found' });
  const practitioner = await User.findById(practitionerId);
  if (!practitioner || practitioner.role !== 'practitioner') return res.status(404).json({ message: 'Practitioner not found' });

  patient.assignedPractitioner = practitionerId;
  await patient.save();
  res.json({ message: 'Assigned', patientId: patient._id, practitionerId });
}));

// create therapy
router.post('/therapy', protect, requireRole('admin'), asyncHandler(async (req, res) => {
  const { name, description, durationMinutes } = req.body;
  if (!name || !durationMinutes) return res.status(400).json({ message: 'Missing fields' });
  const t = await Therapy.create({ name, description, durationMinutes });
  res.json(t);
}));

// list therapies (for frontend)
router.get('/therapies', protect, requireRole('admin'), asyncHandler(async (req, res) => {
  const t = await Therapy.find().sort('name');
  res.json(t);
}));

// NEW: search patients for admin (query by name or email) — populated assignedPractitioner
router.get('/patients/search', protect, requireRole('admin'), asyncHandler(async (req, res) => {
  const q = req.query.q || '';
  const patients = await User.find({
    role: 'patient',
    $or: [
      { name: new RegExp(q, 'i') },
      { email: new RegExp(q, 'i') }
    ]
  })
    .select('_id name email assignedPractitioner')
    .populate('assignedPractitioner', '_id name email') // <-- populate the assignedPractitioner
    .limit(50);
  res.json(patients);
}));

module.exports = router;
