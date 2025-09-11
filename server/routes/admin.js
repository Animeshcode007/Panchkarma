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
  const hashed = await bcrypt.hash(password, 10);
  const pr = await User.create({ name, email, password: hashed, role: 'practitioner', availability });
  res.json(pr);
}));

// create patient
router.post('/patient', protect, requireRole('admin'), asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;
  if (!email || !password || !name) return res.status(400).json({ message: 'Missing fields' });
  const hashed = await bcrypt.hash(password, 10);
  const p = await User.create({ name, email, password: hashed, role: 'patient' });
  res.json(p);
}));

// assign practitioner to patient
router.post('/assign', protect, requireRole('admin'), asyncHandler(async (req, res) => {
  const { patientId, practitionerId } = req.body;
  const patient = await User.findById(patientId);
  if (!patient || patient.role !== 'patient') return res.status(404).json({ message: 'Patient not found' });
  patient.assignedPractitioner = practitionerId;
  await patient.save();
  res.json({ message: 'Assigned' });
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

// simple admin overview endpoints (appointments etc.) can be added later

module.exports = router;
