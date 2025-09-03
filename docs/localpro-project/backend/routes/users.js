const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const User = require('../models/User');
const Provider = require('../models/Provider');
const auth = require('../middleware/auth');

const router = express.Router();

// --- Nodemailer Transporter Setup ---
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// @route   POST /api/users/register
// @desc    Request registration and send OTP
router.post('/register', async (req, res) => {
  const { name, email, password, role } = req.body;
  try {
    let user = await User.findOne({ email });

    // If user exists and is already verified, block registration
    if (user && user.isVerified) {
      return res.status(400).json({ message: 'User with this email already exists' });
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = Date.now() + 10 * 60 * 1000; // OTP expires in 10 minutes
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    if (user) {
      // If user exists but is not verified, update their info and resend OTP
      user.name = name;
      user.password = hashedPassword;
      user.role = role === 'provider' ? 'provider' : 'customer';
      user.otp = otp;
      user.otpExpires = otpExpires;
      await user.save();
    } else {
      // If user does not exist, create a new unverified user
      user = new User({
        name,
        email,
        password: hashedPassword,
        role: role === 'provider' ? 'provider' : 'customer',
        otp,
        otpExpires,
      });
      await user.save();
    }

    // --- Send OTP Email ---
    await transporter.sendMail({
      from: `"LocalPro" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Your Verification Code for LocalPro',
      text: `Your OTP is: ${otp}. It will expire in 10 minutes.`,
      html: `<b>Your OTP is: ${otp}</b>. It will expire in 10 minutes.`,
    });

    res.status(200).json({ message: 'OTP sent to your email. Please verify.' });

  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   POST /api/users/verify
// @desc    Verify OTP and complete registration
router.post('/verify', async (req, res) => {
  const { email, otp } = req.body;
  try {
    const user = await User.findOne({
      email,
      otp,
      otpExpires: { $gt: Date.now() }, // Check if OTP is still valid
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired OTP. Please request a new one.' });
    }

    user.isVerified = true;
    user.otp = undefined;
    user.otpExpires = undefined;
    await user.save();

    res.status(200).json({ message: 'Email verified successfully! You can now log in.' });

  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   POST /api/users/login
// @desc    Authenticate a user and get their token
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    // Check if user is verified
    if (!user.isVerified) {
      return res.status(400).json({ message: 'Account not verified. Please check your email for an OTP.' });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    const payload = { user: { id: user.id } };
    jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' }, (err, token) => {
      if (err) throw err;
      res.json({ token });
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server Error' });
  }
});

// @route   GET /api/users/me
// @desc    Get the current logged-in user's data
router.get('/me', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   DELETE /api/users/me
// @desc    Delete the current user's account and profile
router.delete('/me', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // If the user is a provider, delete their provider profile first
    if (user.role === 'provider') {
      await Provider.findOneAndDelete({ user: req.user.id });
    }

    // Delete the user account
    await User.findByIdAndDelete(req.user.id);

    res.json({ message: 'Account deleted successfully' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;