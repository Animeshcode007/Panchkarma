const express = require('express');
const router = express.Router();
const asyncHandler = require('express-async-handler');
const User = require('../models/User');
const { protect } = require('../middleware/auth');

// search patients by name/email (existing)
router.get('/search-patients', protect, asyncHandler(async (req, res) => {
  if (req.user.role !== 'practitioner') return res.status(403).json({ message: 'Only practitioners' });
  const q = req.query.q || '';
  const patients = await User.find({ role: 'patient', $or: [{ name: new RegExp(q, 'i') }, { email: new RegExp(q, 'i') }] }).limit(20);
  res.json(patients);
}));

// get patient profile
router.get('/patient/:id', protect, asyncHandler(async (req, res) => {
  if (req.user.role !== 'practitioner') return res.status(403).json({ message: 'Only practitioners' });
  const patient = await User.findById(req.params.id);
  if (!patient) return res.status(404).json({ message: 'Not found' });
  res.json(patient);
}));

// NEW: list of practitioners (for patient to choose)
router.get('/list', protect, asyncHandler(async (req, res) => {
  // any authenticated user can fetch the list of practitioners
  const practitioners = await User.find({ role: 'practitioner' }).select('_id name email availability createdAt');
  res.json(practitioners);
}));

module.exports = router;
