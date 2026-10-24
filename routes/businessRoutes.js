const express = require('express');
const router = express.Router();
const Business = require('../models/Business');
const Admin = require('../models/Admin'); 
const verifyToken = require('../middleware/auth'); 
const Feedback = require('../models/Feedback');

// 1. Create a new business & link to Admin
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

// 2. NAYA ROUTE: Get logged-in admin's business (Admin Dashboard ke liye)
// Is route ko hamesha /:slug se upar rakhna zaroori hai!
router.get('/me', verifyToken, async (req, res) => {
  try {
    const admin = await Admin.findById(req.user.id);
    if (!admin || !admin.businessId) {
      return res.status(404).json({ success: false, message: 'No business linked to this admin.' });
    }
    const business = await Business.findById(admin.businessId);
    res.json({ success: true, business });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// 3. NAYA ROUTE: Business ke saare feedbacks fetch karne ke liye (Admin Dashboard ke liye)
router.get('/:businessId/feedbacks', async (req, res) => {
  try {
    const feedbacks = await Feedback.find({ businessId: req.params.businessId }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, feedbacks });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching feedbacks' });
  }
});

// 4. Get business details by slug (Customer QR Scan ke liye)
router.get('/:slug', async (req, res) => {
  try {
    const business = await Business.findOne({ slug: req.params.slug });
    if (!business) return res.status(404).json({ message: 'Business not found' });
    res.json(business);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// 5. POST route review save karne ke liye (Customer Feedback submit)
router.post('/:slug/review', async (req, res) => {
  try {
    const { slug } = req.params;
    const { rating, feedbackText } = req.body;

    const business = await Business.findOne({ slug });
    if (!business) {
      return res.status(404).json({ success: false, message: 'Business not found' });
    }

    // Naye Feedback collection me document save karna
    const newFeedback = new Feedback({
      businessId: business._id,
      rating,
      feedbackText
    });

    await newFeedback.save();
    res.status(200).json({ success: true, message: 'Feedback saved successfully' });
  } catch (error) {
    console.error("Feedback save error:", error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;