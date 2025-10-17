// server/routes/appointments.js
const express = require('express');
const router = express.Router();
const asyncHandler = require('express-async-handler');
const Appointment = require('../models/Appointment');
const User = require('../models/User');
const Therapy = require('../models/Therapy');
const Notification = require('../models/Notification');
const { sendMail } = require('../utils/mailer') || {};
const schedule = require('node-schedule');
const { parseISO } = require('date-fns');
const { protect } = require('../middleware/auth');

// Helper: check overlapping appointments for practitioner (can exclude one appointment id)
async function isPractitionerFree(practitionerId, start, end, excludeAppointmentId = null) {
    const q = {
        practitioner: practitionerId,
        status: 'scheduled',
        $or: [
            { startTime: { $lt: end }, endTime: { $gt: start } }
        ]
    };
    if (excludeAppointmentId) q._id = { $ne: excludeAppointmentId };
    const overlapping = await Appointment.findOne(q);
    return !overlapping;
}

// Patient books appointment (can optionally specify practitionerId)
router.post('/book', protect, asyncHandler(async (req, res) => {
    const user = req.user;
    if (user.role !== 'patient') return res.status(403).json({ message: 'Only patients can book here' });

    const { therapyId, startTimeISO, practitionerId } = req.body;
    if (!therapyId || !startTimeISO) return res.status(400).json({ message: 'Missing therapy or startTime' });

    const therapy = await Therapy.findById(therapyId);
    if (!therapy) return res.status(404).json({ message: 'Therapy not found' });

    // pick practitioner: if provided, use it; otherwise fallback to patient's assignedPractitioner
    let chosenPractitioner = practitionerId || user.assignedPractitioner;
    if (!chosenPractitioner) return res.status(400).json({ message: 'No practitioner specified or assigned' });

    const practitionerUser = await User.findById(chosenPractitioner);
    if (!practitionerUser || practitionerUser.role !== 'practitioner') return res.status(404).json({ message: 'Practitioner not found' });

    const start = parseISO(startTimeISO);
    if (isNaN(start.getTime())) return res.status(400).json({ message: 'Invalid startTimeISO' });

    const end = new Date(start.getTime() + therapy.durationMinutes * 60000);

    const free = await isPractitionerFree(chosenPractitioner, start, end);
    if (!free) return res.status(409).json({ message: 'Slot not available for selected practitioner' });

    const appointment = await Appointment.create({
        patient: user._id,
        practitioner: chosenPractitioner,
        therapy: therapy._id,
        startTime: start,
        endTime: end,
        status: 'scheduled'
    });

    // notifications
    await Notification.create({
        user: user._id,
        title: 'Appointment scheduled',
        message: `Your ${therapy.name} is scheduled at ${start.toISOString()}`,
        data: { appointmentId: appointment._id }
    });

    await Notification.create({
        user: chosenPractitioner,
        title: 'New appointment',
        message: `New appointment for ${therapy.name} at ${start.toISOString()}`,
        data: { appointmentId: appointment._id }
    });

    if (req.io) {
        req.io.to(user._id.toString()).emit('notification', { title: 'Appointment scheduled', message: `Your ${therapy.name} is scheduled at ${start.toISOString()}`, data: { appointmentId: appointment._id } });
        req.io.to(chosenPractitioner.toString()).emit('notification', { title: 'New appointment', message: `New appointment for ${therapy.name} at ${start.toISOString()}`, data: { appointmentId: appointment._id } });
    }

    // schedule reminder 2 hours before (best-effort)
    try {
        const reminderDate = new Date(start.getTime() - 2 * 60 * 60 * 1000);
        if (reminderDate > new Date()) {
            schedule.scheduleJob(reminderDate, async () => {
                const patientFresh = await User.findById(user._id);
                if (patientFresh) {
                    await Notification.create({ user: user._id, title: 'Reminder', message: `Reminder: please fast 2 hours before your session at ${start.toISOString()}` });
                    if (req.io) req.io.to(user._id.toString()).emit('notification', { title: 'Reminder', message: `Please fast 2 hours before your session` });
                    if (sendMail) {
                        try { await sendMail({ to: patientFresh.email, subject: 'Session reminder', text: `Please fast 2 hours before your session at ${start.toISOString()}` }); } catch (e) { console.error('email error', e); }
                    }
                }
            });
        }
    } catch (e) {
        console.error('reminder scheduling failed', e);
    }

    res.json({ appointment });
}));

// New: check availability for a practitioner for a given start time + therapy/duration
router.post('/check-availability', protect, asyncHandler(async (req, res) => {
    const { practitionerId, startTimeISO, therapyId, durationMinutes } = req.body;
    if (!practitionerId || !startTimeISO || (!therapyId && !durationMinutes)) {
        return res.status(400).json({ message: 'practitionerId, startTimeISO and therapyId or durationMinutes required' });
    }

    const pr = await User.findById(practitionerId);
    if (!pr || pr.role !== 'practitioner') return res.status(404).json({ message: 'Practitioner not found' });

    let duration = durationMinutes;
    if (therapyId) {
        const therapy = await Therapy.findById(therapyId);
        if (!therapy) return res.status(404).json({ message: 'Therapy not found' });
        duration = therapy.durationMinutes;
    }

    const start = parseISO(startTimeISO);
    if (isNaN(start.getTime())) return res.status(400).json({ message: 'Invalid startTimeISO' });
    const end = new Date(start.getTime() + duration * 60000);

    const free = await isPractitionerFree(practitionerId, start, end);
    res.json({ available: free, message: free ? 'Available' : 'Not available' });
}));

// Get appointment details
router.get('/:id', protect, asyncHandler(async (req, res) => {
    const appt = await Appointment.findById(req.params.id).populate('patient practitioner therapy');
    if (!appt) return res.status(404).json({ message: 'Appointment not found' });
    // authorize
    if (!(req.user.role === 'admin' || appt.patient._id.toString() === req.user._id.toString() || appt.practitioner._id.toString() === req.user._id.toString())) {
        return res.status(403).json({ message: 'Forbidden' });
    }
    res.json(appt);
}));

// Reschedule appointment (patient requests a new start time directly)
router.post('/reschedule', protect, asyncHandler(async (req, res) => {
    const { appointmentId, newStartISO } = req.body;
    if (!appointmentId || !newStartISO) return res.status(400).json({ message: 'appointmentId and newStartISO required' });

    const appt = await Appointment.findById(appointmentId).populate('therapy patient practitioner');
    if (!appt) return res.status(404).json({ message: 'Appointment not found' });

    if (req.user.role === 'patient') {
        if (appt.patient._id.toString() !== req.user._id.toString()) return res.status(403).json({ message: 'Cannot reschedule others appointment' });
    } else if (req.user.role !== 'admin' && req.user.role !== 'practitioner') {
        return res.status(403).json({ message: 'Forbidden' });
    }

    if (appt.status !== 'scheduled') return res.status(400).json({ message: 'Only scheduled appointments can be rescheduled' });

    const newStart = parseISO(newStartISO);
    const newEnd = new Date(newStart.getTime() + appt.therapy.durationMinutes * 60000);

    const free = await isPractitionerFree(appt.practitioner._id, newStart, newEnd, appt._id);
    if (!free) return res.status(409).json({ message: 'New slot not available for practitioner' });

    appt.startTime = newStart;
    appt.endTime = newEnd;
    await appt.save();

    await Notification.create({ user: appt.patient._id, title: 'Appointment rescheduled', message: `Your appointment moved to ${newStart.toISOString()}`, data: { appointmentId: appt._id } });
    await Notification.create({ user: appt.practitioner._id, title: 'Appointment rescheduled', message: `Appointment moved to ${newStart.toISOString()}`, data: { appointmentId: appt._id } });

    if (req.io) {
        req.io.to(appt.patient._id.toString()).emit('notification', { title: 'Appointment rescheduled', message: `Your appointment moved to ${newStart.toISOString()}` });
        req.io.to(appt.practitioner._id.toString()).emit('notification', { title: 'Appointment rescheduled', message: `Appointment moved to ${newStart.toISOString()}` });
    }

    res.json({ appointment: appt });
}));

// Cancel appointment
router.post('/cancel', protect, asyncHandler(async (req, res) => {
    const { appointmentId, reason } = req.body;
    if (!appointmentId) return res.status(400).json({ message: 'appointmentId required' });

    const appt = await Appointment.findById(appointmentId).populate('patient practitioner therapy');
    if (!appt) return res.status(404).json({ message: 'Appointment not found' });

    if (req.user.role === 'patient' && appt.patient._id.toString() !== req.user._id.toString()) return res.status(403).json({ message: 'Cannot cancel others appointment' });
    if (req.user.role === 'practitioner' && appt.practitioner._id.toString() !== req.user._id.toString()) return res.status(403).json({ message: 'Cannot cancel others appointment' });

    if (appt.status !== 'scheduled') return res.status(400).json({ message: 'Only scheduled appointments can be cancelled' });

    appt.status = 'cancelled';
    await appt.save();

    await Notification.create({ user: appt.patient._id, title: 'Appointment cancelled', message: `Your appointment on ${appt.startTime.toISOString()} was cancelled. ${reason || ''}` });
    await Notification.create({ user: appt.practitioner._id, title: 'Appointment cancelled', message: `Appointment on ${appt.startTime.toISOString()} was cancelled. ${reason || ''}` });

    if (req.io) {
        req.io.to(appt.patient._id.toString()).emit('notification', { title: 'Appointment cancelled', message: `Your appointment on ${appt.startTime.toISOString()} was cancelled.` });
        req.io.to(appt.practitioner._id.toString()).emit('notification', { title: 'Appointment cancelled', message: `Appointment on ${appt.startTime.toISOString()} was cancelled.` });
    }

    res.json({ message: 'Cancelled', appointment: appt });
}));

// Practitioner schedule (with optional from/to query)
router.get('/practitioner/schedule', protect, asyncHandler(async (req, res) => {
    if (req.user.role !== 'practitioner' && req.user.role !== 'admin') return res.status(403).json({ message: 'Only practitioner or admin' });
    const practitionerId = req.user.role === 'practitioner' ? req.user._id : req.query.practitionerId;
    const { fromISO, toISO } = req.query;
    const q = { practitioner: practitionerId };
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

// Mark appointment complete and attach progress metrics (practitioner)
router.post('/complete', protect, asyncHandler(async (req, res) => {
    const { appointmentId, progressNotes, metrics } = req.body;
    if (!appointmentId) return res.status(400).json({ message: 'appointmentId required' });

    const appt = await Appointment.findById(appointmentId).populate('patient practitioner therapy');
    if (!appt) return res.status(404).json({ message: 'Appointment not found' });

    if (req.user.role === 'practitioner' && appt.practitioner._id.toString() !== req.user._id.toString()) return res.status(403).json({ message: 'Forbidden' });
    if (appt.status === 'completed') return res.status(400).json({ message: 'Already completed' });

    appt.status = 'completed';
    appt.progress = appt.progress || [];
    appt.progress.push({
        by: req.user._id,
        notes: progressNotes || '',
        metrics: metrics || {},
        createdAt: new Date()
    });

    await appt.save();

    await Notification.create({ user: appt.patient._id, title: 'Session completed', message: `Your session ${appt.therapy?.name} was marked complete.`, data: { appointmentId: appt._id } });
    if (req.io) req.io.to(appt.patient._id.toString()).emit('notification', { title: 'Session completed', message: `Your session ${appt.therapy?.name} was marked complete.` });

    res.json(appt);
}));

module.exports = router;
