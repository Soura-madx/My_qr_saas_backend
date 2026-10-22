const express = require('express');
const router = express.Router();
const Feedback = require('../models/Feedback');

// Submit negative feedback
router.post('/submit', async (req, res) => {
  try {
    const { businessId, rating, message } = req.body;
    
    const newFeedback = new Feedback({
      businessId,
      rating,
      message
    });

    await newFeedback.save();
    res.status(201).json({ message: 'Feedback saved successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;