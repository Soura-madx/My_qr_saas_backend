const mongoose = require('mongoose');

const businessSchema = new mongoose.Schema({
  slug: { type: String, required: true, unique: true }, // URL ke liye jaise 'cafe-mocha'
  name: { type: String, required: true },
  upiId: { type: String, required: true },
  googleReviewLink: { type: String, required: true },
  instagramHandle: { type: String },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Business', businessSchema);