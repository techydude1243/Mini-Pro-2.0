const express = require('express');
const router = express.Router();
const Provider = require('../models/Provider');
const Service = require('../models/Service');
const User = require('../models/User');
const auth = require('../middleware/auth');

// CUSTOMER ROUTE: Search for providers
router.get('/', async (req, res) => {
    try {
        const { service, location, minRate, maxRate, sortBy } = req.query;
        const filter = {};

        if (service) {
          const serviceDoc = await Service.findOne({ name: { $regex: `^${service}$`, $options: 'i' } });
          if (serviceDoc) {
            filter.serviceCategory = serviceDoc._id;
          } else {
            return res.json([]);
          }
        }
        if (location) {
          filter.location = { $regex: location, $options: 'i' };
        }

        if (minRate || maxRate) {
          filter.hourlyRate = {};
          if (minRate) {
            filter.hourlyRate.$gte = Number(minRate);
          }
          if (maxRate) {
            filter.hourlyRate.$lte = Number(maxRate);
          }
        }

        let sortOption = {};
        if (sortBy === 'price_asc') {
          sortOption.hourlyRate = 1;
        } else if (sortBy === 'price_desc') {
          sortOption.hourlyRate = -1;
        }
        
        const providers = await Provider.find(filter)
                                        .populate('serviceCategory')
                                        .sort(sortOption);
        res.json(providers);
        
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: 'Server Error' });
    }
});

// PROVIDER ROUTE: Create a provider profile
router.post('/', auth, async (req, res) => {
  const { serviceCategory, location, bio, hourlyRate } = req.body;

  try {
    const user = await User.findById(req.user.id);
    if (!user) {
        return res.status(404).json({ message: 'User not found' });
    }

    const existingProvider = await Provider.findOne({ user: req.user.id });
    if (existingProvider) {
      return res.status(400).json({ message: 'Provider profile already exists' });
    }

    const newProvider = new Provider({
      user: req.user.id,
      name: user.name,
      serviceCategory,
      location,
      bio,
      hourlyRate,
    });

    await newProvider.save();
    await User.findByIdAndUpdate(req.user.id, { role: 'provider' });

    res.status(201).json(newProvider);
  } catch (err) {
    console.error('ERROR creating provider profile:', err.message);
    res.status(500).json({ message: 'Server Error' });
  }
});

// PROVIDER ROUTE: Get the logged-in provider's profile
router.get('/me', auth, async (req, res) => {
    try {
        const provider = await Provider.findOne({ user: req.user.id }).populate('serviceCategory');
        if (!provider) {
            return res.status(404).json({ message: 'Provider profile not found for this user.' });
        }
        res.json(provider);
    } catch (err) {
        console.error('ERROR fetching provider profile:', err.message);
        res.status(500).json({ message: 'Server Error' });
    }
});

// PROVIDER ROUTE: Update the logged-in provider's profile
router.put('/me', auth, async (req, res) => {
    const { location, bio, hourlyRate } = req.body;
    const updatedFields = { location, bio, hourlyRate };

    try {
        let provider = await Provider.findOneAndUpdate(
            { user: req.user.id },
            { $set: updatedFields },
            { new: true }
        ).populate('serviceCategory');

        if (!provider) {
            return res.status(404).json({ message: 'Provider profile not found.' });
        }
        res.json(provider);
    } catch (err) {
        console.error('ERROR updating provider profile:', err.message);
        res.status(500).json({ message: 'Server Error' });
    }
});

module.exports = router;