// backend/models/Provider.js
const mongoose = require('mongoose');

const providerSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
  },
  name: { type: String, required: true },
  serviceCategory: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Service',
    required: true,
  },
  location: { type: String, required: true },
  bio: { type: String, default: 'A trusted local service provider.' },
  hourlyRate: { type: Number, required: true },

  // ## ADD THESE NEW FIELDS ##
  averageRating: {
    type: Number,
    default: 0,
  },
  reviewCount: {
    type: Number,
    default: 0,
  },
});

const Provider = mongoose.model('Provider', providerSchema);
module.exports = Provider;