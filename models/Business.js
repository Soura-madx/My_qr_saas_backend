const mongoose = require('mongoose');

const businessSchema = new mongoose.Schema({
  name: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  whatsappNumber: { type: String },
  instagramHandle: { type: String },
  googleReviewLink: { type: String },
  website: { type: String }
});

module.exports = mongoose.model('Business', businessSchema);