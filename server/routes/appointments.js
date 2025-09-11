const express = require('express');
const router = express.Router();
const asyncHandler = require('express-async-handler');
const Appointment = require('../models/Appointment');
const User = require('../models/User');
const Therapy = require('../models/Therapy');
const Notification = require('../models/Notification');
const { sendMail } = require('../utils/mailer');
const schedule = require('node-schedule');
const { parseISO } = require('date-fns');
const { protect } = require('../middleware/auth');

// Helper: check overlapping appointments for practitioner
async function isPractitionerFree(practitionerId, start, end) {
    const overlapping = await Appointment.findOne({
        practitioner: practitionerId,
        status: 'scheduled',
        $or: [
            { startTime: { $lt: end }, endTime: { $gt: start } }
        ]
    });
    return !overlapping;
}

// Patient books appointment
router.post('/book', protect, asyncHandler(async (req, res) => {
    const user = req.user;
    if (user.role !== 'patient') return res.status(403).json({ message: 'Only patients can book here' });

    const { therapyId, startTimeISO } = req.body;
    if (!therapyId || !startTimeISO) return res.status(400).json({ message: 'Missing therapy or startTime' });

    const therapy = await Therapy.findById(therapyId);
    if (!therapy) return res.status(404).json({ message: 'Therapy not found' });

    const practitionerId = user.assignedPractitioner;
    if (!practitionerId) return res.status(400).json({ message: 'No practitioner assigned' });

    const start = parseISO(startTimeISO);
    const end = new Date(start.getTime() + therapy.durationMinutes * 60000);

    const free = await isPractitionerFree(practitionerId, start, end);
    if (!free) return res.status(409).json({ message: 'Slot not available' });

    const appointment = await Appointment.create({
        patient: user._id,
        practitioner: practitionerId,
        therapy: therapy._id,
        startTime: start,
        endTime: end
    });

    const notifPatient = await Notification.create({
        user: user._id,
        title: 'Appointment scheduled',
        message: `Your ${therapy.name} is scheduled at ${start.toISOString()}`,
        data: { appointmentId: appointment._id }
    });

    const notifPract = await Notification.create({
        user: practitionerId,
        title: 'New appointment',
        message: `New appointment for ${therapy.name} at ${start.toISOString()}`,
        data: { appointmentId: appointment._id }
    });

    if (req.io) {
        req.io.to(user._id.toString()).emit('notification', notifPatient);
        req.io.to(practitionerId.toString()).emit('notification', notifPract);
    }

    // schedule reminder 2 hours before
    const reminderDate = new Date(start.getTime() - 2 * 60 * 60 * 1000);
    if (reminderDate > new Date()) {
        schedule.scheduleJob(reminderDate, async () => {
            const patientFresh = await User.findById(user._id);
            if (patientFresh) {
                await Notification.create({ user: user._id, title: 'Reminder', message: `Reminder: please fast 2 hours before your session at ${start.toISOString()}` });
                if (req.io) req.io.to(user._id.toString()).emit('notification', { title: 'Reminder', message: `Please fast 2 hours before your session` });
                try { await sendMail({ to: patientFresh.email, subject: 'Session reminder', text: `Please fast 2 hours before your session at ${start.toISOString()}` }); } catch (e) { console.error('email error', e); }
            }
        });
    }

    res.json({ appointment });
}));

// Practitioner schedule (with optional from/to query)
router.get('/practitioner/schedule', protect, asyncHandler(async (req, res) => {
    if (req.user.role !== 'practitioner') return res.status(403).json({ message: 'Only practitioner' });
    const { fromISO, toISO } = req.query;
    const q = { practitioner: req.user._id };
    if (fromISO && toISO) q.startTime = { $gte: new Date(fromISO), $lte: new Date(toISO) };
    const appts = await Appointment.find(q).populate('patient therapy').sort('startTime');
    res.json(appts);
}));

// Patient upcoming
router.get('/patient/upcoming', protect, asyncHandler(async (req, res) => {
    if (req.user.role !== 'patient') return res.status(403).json({ message: 'Only patient' });
    const appts = await Appointment.find({ patient: req.user._id, status: 'scheduled', startTime: { $gte: new Date() } }).populate('practitioner therapy').sort('startTime');
    res.json(appts);
}));

// Patient past appointments (so patients can submit feedback)
router.get('/patient/past', protect, asyncHandler(async (req, res) => {
    if (req.user.role !== 'patient') return res.status(403).json({ message: 'Only patient' });
    const appts = await Appointment.find({ patient: req.user._id, endTime: { $lt: new Date() } }).populate('practitioner therapy').sort('-startTime');
    res.json(appts);
}));

module.exports = router;
