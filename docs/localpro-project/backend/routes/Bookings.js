// backend/routes/bookings.js
const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Booking = require('../models/Booking');
const Provider = require('../models/Provider');
const User = require('../models/User');

// @route   POST /api/bookings
// @desc    Create a new booking (Customer only)
router.post('/', auth, async (req, res) => {
  const { providerId, serviceDate } = req.body;
  try {
    const newBooking = new Booking({
      customer: req.user.id,
      provider: providerId,
      serviceDate,
    });
    const booking = await newBooking.save();
    res.status(201).json(booking);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET /api/bookings/customer
// @desc    Get all bookings for the logged-in customer
router.get('/customer', auth, async (req, res) => {
    try {
        const bookings = await Booking.find({ customer: req.user.id })
            .populate({ 
                path: 'provider', 
                select: 'name serviceCategory', // Select specific fields from provider
                populate: { 
                    path: 'serviceCategory', 
                    select: 'name' // Select name from serviceCategory
                } 
            })
            .sort({ createdAt: -1 });
        res.json(bookings);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   GET /api/bookings/provider
// @desc    Get all bookings for the logged-in provider
router.get('/provider', auth, async (req, res) => {
    try {
        const providerProfile = await Provider.findOne({ user: req.user.id });
        if (!providerProfile) {
            return res.json([]); // Return empty if they are not a provider
        }

        const bookings = await Booking.find({ provider: providerProfile._id })
            .populate('customer', 'name email')
            .sort({ createdAt: -1 });
        res.json(bookings);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   PUT /api/bookings/:id/status
// @desc    Update a booking's status (Provider only)
router.put('/:id/status', auth, async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.id);
        if (!booking) {
            return res.status(404).json({ message: 'Booking not found.' });
        }
        
        // Security check: Ensure the logged-in user is the provider for this booking
        const providerProfile = await Provider.findOne({ user: req.user.id });
        if (!providerProfile || booking.provider.toString() !== providerProfile._id.toString()) {
            return res.status(401).json({ message: 'User not authorized to update this booking.' });
        }

        booking.status = req.body.status;
        await booking.save();
        res.json(booking);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;