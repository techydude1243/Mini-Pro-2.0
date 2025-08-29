// models/Service.js
const mongoose = require('mongoose');

const serviceSchema = new mongoose.Schema({
  name: { type: String, required: true },
  emoji: { type: String, required: true },
  description: { type: String },
});

const Service = mongoose.model('Service', serviceSchema);

module.exports = Service;