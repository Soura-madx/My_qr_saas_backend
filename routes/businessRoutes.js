const express = require('express');
const router = express.Router();
const Business = require('../models/Business');
const Admin = require('../models/Admin'); // Admin model import kiya
const verifyToken = require('../middleware/auth'); // Auth middleware import kiya

// Create a new business & link to Admin
router.post('/', verifyToken, async (req, res) => {
  try {
    const newBusiness = new Business(req.body);
    const savedBusiness = await newBusiness.save();
    
    // Logged-in admin ke record mein businessId save karna
    await Admin.findByIdAndUpdate(req.user.id, { businessId: savedBusiness._id });
    
    res.status(201).json({ success: true, business: savedBusiness, message: 'Business linked successfully!' });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
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