// backend/models/Provider.js
const mongoose = require('mongoose');

const providerSchema = new mongoose.Schema({
  // Link to the User model
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true, // A user can only have one provider profile
  },
  name: {
    type: String,
    required: true,
  },
  serviceCategory: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Service',
    required: true,
  },
  location: {
    type: String,
    required: true,
  },
  bio: {
    type: String,
    default: 'A trusted local service provider.',
  },
  hourlyRate: {
    type: Number,
    required: true,
  },
});

const Provider = mongoose.model('Provider', providerSchema);
module.exports = Provider;