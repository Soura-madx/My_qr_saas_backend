const mongoose = require('mongoose');

const businessSchema = new mongoose.Schema({
  name: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  whatsappNumber: { type: String },
  instagramHandle: { type: String },
  website: { type: String },
  reviews: [{
    rating: { type: Number, required: true },
    feedbackText: { type: String },
    createdAt: { type: Date, default: Date.now }
  }]
});

module.exports = mongoose.model('Business', businessSchema);