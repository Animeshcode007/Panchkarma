const express = require('express');
const router = express.Router();
const asyncHandler = require('express-async-handler');
const { protect } = require('../middleware/auth');
const User = require('../models/User');

// Return current user info with assignedPractitioner populated (name/email)
router.get('/me', protect, asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id)
    .select('-password')
    .populate('assignedPractitioner', '_id name email');
  if (!user) return res.status(404).json({ message: 'User not found' });
  res.json(user);
}));

module.exports = router;
