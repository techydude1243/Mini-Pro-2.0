// backend/models/User.js
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  // ADD THIS ROLE FIELD
  role: {
    type: String,
    enum: ['customer', 'provider'], // Role must be one of these two values
    default: 'customer', // New users are customers by default
  },
});

const User = mongoose.model('User', userSchema);
module.exports = User;