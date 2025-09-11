const express = require('express');
const router = express.Router();
const asyncHandler = require('express-async-handler');
const AssignmentRequest = require('../models/AssignmentRequest');
const User = require('../models/User');
const Notification = require('../models/Notification');
const { protect, requireRole } = require('../middleware/auth');

// Patient: request practitioner assignment
router.post('/request', protect, asyncHandler(async (req, res) => {
    if (req.user.role !== 'patient') return res.status(403).json({ message: 'Only patients can request assignments' });
    const { practitionerId, message } = req.body;
    if (!practitionerId) return res.status(400).json({ message: 'practitionerId required' });

    // ensure practitioner exists and role
    const pr = await User.findById(practitionerId);
    if (!pr || pr.role !== 'practitioner') return res.status(404).json({ message: 'Practitioner not found' });

    // avoid duplicate pending request for same patient -> practitioner
    const existing = await AssignmentRequest.findOne({ patient: req.user._id, practitioner: practitionerId, status: 'pending' });
    if (existing) return res.status(409).json({ message: 'You already have a pending request for this practitioner' });

    const reqDoc = await AssignmentRequest.create({ patient: req.user._id, practitioner: practitionerId, message });
    // Notify admins (quick approach: notify all admins)
    const admins = await User.find({ role: 'admin' }).select('_id');
    for (const a of admins) {
        await Notification.create({ user: a._id, title: 'Assignment request', message: `${req.user.name} requested ${pr.name}`, data: { requestId: reqDoc._id } });
        if (req.io) req.io.to(a._id.toString()).emit('notification', { title: 'Assignment request', message: `${req.user.name} requested ${pr.name}`, data: { requestId: reqDoc._id } });
    }
    res.json({ message: 'Request created', request: reqDoc });
}));

// Admin: list pending requests
router.get('/pending', protect, requireRole('admin'), asyncHandler(async (req, res) => {
    const items = await AssignmentRequest.find({ status: 'pending' }).populate('patient practitioner').sort('-createdAt');
    res.json(items);
}));

// Admin: approve a request (assigns practitioner to patient)
router.post('/approve', protect, requireRole('admin'), asyncHandler(async (req, res) => {
    const { requestId } = req.body;
    if (!requestId) return res.status(400).json({ message: 'requestId required' });
    const reqDoc = await AssignmentRequest.findById(requestId).populate('patient practitioner');
    if (!reqDoc) return res.status(404).json({ message: 'Request not found' });
    if (reqDoc.status !== 'pending') return res.status(400).json({ message: 'Request not pending' });

    // perform assignment
    const patient = await User.findById(reqDoc.patient._id);
    patient.assignedPractitioner = reqDoc.practitioner._id;
    await patient.save();

    // update request
    reqDoc.status = 'approved';
    await reqDoc.save();

    // notify patient and practitioner
    await Notification.create({ user: patient._id, title: 'Assignment approved', message: `You are assigned to ${reqDoc.practitioner.name}`, data: { practitionerId: reqDoc.practitioner._id } });
    await Notification.create({ user: reqDoc.practitioner._id, title: 'New patient assigned', message: `${patient.name} has been assigned to you`, data: { patientId: patient._id } });

    if (req.io) {
        req.io.to(patient._id.toString()).emit('notification', { title: 'Assignment approved', message: `You are assigned to ${reqDoc.practitioner.name}` });
        req.io.to(reqDoc.practitioner._id.toString()).emit('notification', { title: 'New patient assigned', message: `${patient.name} has been assigned to you` });
    }

    res.json({ message: 'Approved and assigned', request: reqDoc });
}));

// Admin: reject request
router.post('/reject', protect, requireRole('admin'), asyncHandler(async (req, res) => {
    const { requestId, reason } = req.body;
    if (!requestId) return res.status(400).json({ message: 'requestId required' });
    const reqDoc = await AssignmentRequest.findById(requestId).populate('patient practitioner');
    if (!reqDoc) return res.status(404).json({ message: 'Request not found' });
    if (reqDoc.status !== 'pending') return res.status(400).json({ message: 'Request not pending' });

    reqDoc.status = 'rejected';
    await reqDoc.save();

    // notify patient
    await Notification.create({ user: reqDoc.patient._id, title: 'Assignment rejected', message: `Your request to ${reqDoc.practitioner.name} was rejected. ${reason || ''}` });
    if (req.io) req.io.to(reqDoc.patient._id.toString()).emit('notification', { title: 'Assignment rejected', message: `Your request to ${reqDoc.practitioner.name} was rejected.` });

    res.json({ message: 'Request rejected', request: reqDoc });
}));

module.exports = router;
