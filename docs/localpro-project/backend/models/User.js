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
  role: {
    type: String,
    enum: ['customer', 'provider'], // Role must be one of these two values
    default: 'customer', // New users are customers by default
  },
  role: {
    type: String,
    enum: ['customer', 'provider'], // Role must be one of these two values
    default: 'customer', // New users are customers by default
  },
  role: {
    type: String,
    enum: ['customer', 'provider', 'admin'], // Add 'admin' here
    default: 'customer',
  },
});

const User = mongoose.model('User', userSchema);
module.exports = User;