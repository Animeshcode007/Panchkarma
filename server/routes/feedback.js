const express = require('express');
const router = express.Router();
const asyncHandler = require('express-async-handler');
const Feedback = require('../models/Feedback');
const Appointment = require('../models/Appointment');
const { protect, requireRole } = require('../middleware/auth');

// Patient submits feedback for their appointment
router.post('/submit', protect, asyncHandler(async (req, res) => {
    if (req.user.role !== 'patient') return res.status(403).json({ message: 'Only patients can submit feedback' });
    const { appointmentId, rating, comment } = req.body;
    if (!appointmentId) return res.status(400).json({ message: 'appointmentId required' });

    const appointment = await Appointment.findById(appointmentId);
    if (!appointment) return res.status(404).json({ message: 'Appointment not found' });
    if (appointment.patient.toString() !== req.user._id.toString()) return res.status(403).json({ message: 'This appointment does not belong to you' });

    // optional: ensure appointment has already occurred
    // if (appointment.endTime > new Date()) return res.status(400).json({ message: 'You can submit feedback after the session ends' });

    const fb = await Feedback.create({
        appointment: appointmentId,
        patient: req.user._id,
        practitioner: appointment.practitioner,
        rating,
        comment
    });

    res.json(fb);
}));

// Practitioner: get feedbacks for themselves
router.get('/practitioner/:practitionerId', protect, asyncHandler(async (req, res) => {
    if (req.user.role !== 'practitioner' && req.user.role !== 'admin') return res.status(403).json({ message: 'Forbidden' });
    const practitionerId = req.params.practitionerId;
    // practitioner can only fetch own feedbacks
    if (req.user.role === 'practitioner' && req.user._id.toString() !== practitionerId) return res.status(403).json({ message: 'Forbidden' });

    const f = await Feedback.find({ practitioner: practitionerId }).populate('patient appointment').sort('-createdAt');
    res.json(f);
}));

// Admin: get all feedbacks
router.get('/all', protect, requireRole('admin'), asyncHandler(async (req, res) => {
    const f = await Feedback.find().populate('patient practitioner appointment').sort('-createdAt');
    res.json(f);
}));

module.exports = router;
