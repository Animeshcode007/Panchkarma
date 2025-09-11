const express = require('express');
const router = express.Router();
const asyncHandler = require('express-async-handler');
const Therapy = require('../models/Therapy');

// Public list of therapies (patients and other roles can fetch)
router.get('/', asyncHandler(async (req, res) => {
  const therapies = await Therapy.find().sort('name');
  res.json(therapies);
}));

// Get single therapy
router.get('/:id', asyncHandler(async (req, res) => {
  const t = await Therapy.findById(req.params.id);
  if (!t) return res.status(404).json({ message: 'Therapy not found' });
  res.json(t);
}));

module.exports = router;
