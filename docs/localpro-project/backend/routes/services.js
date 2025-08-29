// routes/services.js
const express = require('express');
const router = express.Router();
const Service = require('../models/Service'); // Import the Service model

// @route   GET /api/services
// @desc    Get all services
router.get('/', async (req, res) => {
  try {
    const services = await Service.find();
    res.json(services);
  } catch (err) {
    res.status(500).json({ message: 'Server Error' });
  }
});

module.exports = router;