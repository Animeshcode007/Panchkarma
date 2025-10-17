// server/routes/admin.js
const express = require('express');
const router = express.Router();
const asyncHandler = require('express-async-handler');
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');

const User = require('../models/User');
const Therapy = require('../models/Therapy');
const Appointment = require('../models/Appointment');
const Feedback = require('../models/Feedback');
const { protect, requireRole } = require('../middleware/auth');

// Create practitioner
router.post('/practitioner', protect, requireRole('admin'), asyncHandler(async (req, res) => {
  const { name, email, password, availability } = req.body;
  if (!name || !email || !password) return res.status(400).json({ message: 'Name, email and password required' });
  const exists = await User.findOne({ email });
  if (exists) return res.status(400).json({ message: 'User already exists' });
  const hashed = await bcrypt.hash(password, 10);
  const pr = await User.create({ name, email, password: hashed, role: 'practitioner', availability });
  res.json(pr);
}));

// Create patient
router.post('/patient', protect, requireRole('admin'), asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) return res.status(400).json({ message: 'Name, email and password required' });
  const exists = await User.findOne({ email });
  if (exists) return res.status(400).json({ message: 'User already exists' });
  const hashed = await bcrypt.hash(password, 10);
  const p = await User.create({ name, email, password: hashed, role: 'patient' });
  res.json(p);
}));

// Create therapy
router.post('/therapy', protect, requireRole('admin'), asyncHandler(async (req, res) => {
  const { name, description, durationMinutes } = req.body;
  if (!name || !durationMinutes) return res.status(400).json({ message: 'Missing fields' });
  const t = await Therapy.create({ name, description, durationMinutes });
  res.json(t);
}));

// List therapies (needed by frontend)
router.get('/therapies', protect, requireRole('admin'), asyncHandler(async (req, res) => {
  const t = await Therapy.find().sort('name');
  res.json(t);
}));

// Assign practitioner to patient
router.post('/assign', protect, requireRole('admin'), asyncHandler(async (req, res) => {
  const { patientId, practitionerId } = req.body;
  if (!patientId || !practitionerId) return res.status(400).json({ message: 'patientId and practitionerId required' });

  const patient = await User.findById(patientId);
  if (!patient || patient.role !== 'patient') return res.status(404).json({ message: 'Patient not found' });
  const practitioner = await User.findById(practitionerId);
  if (!practitioner || practitioner.role !== 'practitioner') return res.status(404).json({ message: 'Practitioner not found' });

  patient.assignedPractitioner = practitionerId;
  await patient.save();

  res.json({ message: 'Assigned', patientId: patient._id.toString(), practitionerId: practitioner._id.toString() });
}));

// Search patients (admin)
router.get('/patients/search', protect, requireRole('admin'), asyncHandler(async (req, res) => {
  const q = req.query.q || '';
  const patients = await User.find({
    role: 'patient',
    $or: [{ name: new RegExp(q, 'i') }, { email: new RegExp(q, 'i') }]
  }).select('_id name email assignedPractitioner').limit(50).populate('assignedPractitioner', '_id name email');
  res.json(patients);
}));

// List practitioners (admin)
router.get('/practitioners/list', protect, requireRole('admin'), asyncHandler(async (req, res) => {
  const practitioners = await User.find({ role: 'practitioner' }).select('_id name email availability').sort('name');
  res.json(practitioners);
}));

// Clinic activity: active patients (last N days)
router.get('/stats/active-patients', protect, requireRole('admin'), asyncHandler(async (req, res) => {
  const days = Number(req.query.days) || 30;
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
  const agg = await Appointment.aggregate([
    { $match: { startTime: { $gte: since } } },
    { $group: { _id: '$patient' } },
    { $count: 'activeCount' }
  ]);
  const activeCount = agg.length ? agg[0].activeCount : 0;
  const totalPatients = await User.countDocuments({ role: 'patient' });
  const totalPractitioners = await User.countDocuments({ role: 'practitioner' });
  res.json({ activeCount, totalPatients, totalPractitioners });
}));

// Upcoming appointments
router.get('/upcoming-appointments', protect, requireRole('admin'), asyncHandler(async (req, res) => {
  const limit = Number(req.query.limit) || 50;
  const appts = await Appointment.find({ startTime: { $gte: new Date() }, status: 'scheduled' })
    .populate('patient practitioner therapy')
    .sort('startTime')
    .limit(limit);
  res.json(appts);
}));

// Recent feedbacks highlights
router.get('/recent-feedbacks', protect, requireRole('admin'), asyncHandler(async (req, res) => {
  const limit = Number(req.query.limit) || 10;
  const f = await Feedback.find().populate('patient practitioner appointment').sort('-createdAt').limit(limit);
  const highlights = f.map(x => ({
    _id: x._id,
    rating: x.rating,
    comment: x.comment,
    patient: { _id: x.patient?._id, name: x.patient?.name },
    practitioner: { _id: x.practitioner?._id, name: x.practitioner?.name },
    createdAt: x.createdAt
  }));
  res.json(highlights);
}));

// Reports summary
router.get('/reports/summary', protect, requireRole('admin'), asyncHandler(async (req, res) => {
  const now = new Date();
  const startOfWeek = new Date(now);
  const day = now.getDay(); // 0-6 (0 = Sunday)
  const diffToMonday = (day === 0 ? -6 : 1 - day);
  startOfWeek.setDate(now.getDate() + diffToMonday);
  startOfWeek.setHours(0, 0, 0, 0);

  const completedThisWeek = await Appointment.countDocuments({
    status: 'completed',
    startTime: { $gte: startOfWeek, $lte: now }
  });

  const popular = await Appointment.aggregate([
    { $match: {} },
    { $group: { _id: '$therapy', count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $limit: 5 },
    {
      $lookup: {
        from: 'therapies',
        localField: '_id',
        foreignField: '_id',
        as: 'therapy'
      }
    },
    { $unwind: { path: '$therapy', preserveNullAndEmptyArrays: true } },
    { $project: { therapyId: '$_id', name: '$therapy.name', count: 1 } }
  ]);

  res.json({ completedThisWeek, popular });
}));

module.exports = router;
