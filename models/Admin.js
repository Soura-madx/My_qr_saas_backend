const mongoose = require('mongoose');

const adminSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  // Jab owner signup ke baad apna business add karega, tab yeh ID update hogi
  businessId: { type: mongoose.Schema.Types.ObjectId, ref: 'Business', default: null } 
}, { timestamps: true });

module.exports = mongoose.model('Admin', adminSchema);