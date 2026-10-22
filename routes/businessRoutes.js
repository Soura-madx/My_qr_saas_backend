const express = require('express');
const router = express.Router();
const Business = require('../models/Business');

// Create a new business (Abhi Postman ya ThunderClient se dummy data dalne ke liye)
router.post('/add', async (req, res) => {
  try {
    const newBusiness = new Business(req.body);
    const savedBusiness = await newBusiness.save();
    res.status(201).json(savedBusiness);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Get business details by slug (e.g., /api/business/my-cafe)
router.get('/:slug', async (req, res) => {
  try {
    const business = await Business.findOne({ slug: req.params.slug });
    if (!business) return res.status(404).json({ message: 'Business not found' });
    res.json(business);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;