// backend/middleware/admin.js
const User = require('../models/User');

async function admin(req, res, next) {
    try {
        // req.user.id is from the 'auth' middleware
        const user = await User.findById(req.user.id);

        if (user.role !== 'admin') {
            return res.status(403).json({ message: 'Access denied. Not an administrator.' });
        }
        next(); // If user is an admin, proceed to the next function
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
}

module.exports = admin;