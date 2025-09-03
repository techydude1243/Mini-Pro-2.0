// backend/routes/admin.js
const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');
const User = require('../models/User');
const Provider = require('../models/Provider');

// @route   GET /api/admin/users
// @desc    Get all users (Admin only)
router.get('/users', [auth, admin], async (req, res) => {
    try {
        const users = await User.find().select('-password');
        res.json(users);
    } catch (err) {
        res.status(500).send('Server Error');
    }
});

// @route   GET /api/admin/providers
// @desc    Get all providers (Admin only)
router.get('/providers', [auth, admin], async (req, res) => {
    try {
        // ## THIS LINE IS THE FIX ##
        // We now populate both 'user' and 'serviceCategory'
        const providers = await Provider.find().populate('user', 'name email').populate('serviceCategory');
        res.json(providers);
    } catch (err) {
        res.status(500).send('Server Error');
    }
});

module.exports = router;