const express = require('express');
const router = express.Router();
const asyncHandler = require('express-async-handler');
const Feedback = require('../models/Feedback');
const { protect } = require('../middleware/auth');

// patient submit feedback
router.post('/feedback', protect, asyncHandler(async (req, res) => {
    if (req.user.role !== 'patient') return res.status(403).json({ message: 'Only patients' });
    const { appointmentId, rating, comment, practitionerId } = req.body;
    const fb = await Feedback.create({
        appointment: appointmentId, patient: req.user._id, practitioner: practitionerId, rating, comment
    });
    res.json(fb);
}));

module.exports = router;
