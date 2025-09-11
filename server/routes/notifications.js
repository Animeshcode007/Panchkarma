const express = require('express');
const router = express.Router();
const asyncHandler = require('express-async-handler');
const Notification = require('../models/Notification');
const { protect } = require('../middleware/auth');

router.get('/', protect, asyncHandler(async (req, res) => {
    const notes = await Notification.find({ user: req.user._id }).sort('-createdAt').limit(50);
    res.json(notes);
}));

router.post('/:id/read', protect, asyncHandler(async (req, res) => {
    const n = await Notification.findByIdAndUpdate(req.params.id, { read: true }, { new: true });
    res.json(n);
}));

module.exports = router;
