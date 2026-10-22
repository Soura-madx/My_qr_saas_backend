const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Admin = require('./models/Admin');
const Business = require('./models/Business');
const Feedback = require('./models/Feedback');
const verifyToken = require('./middleware/auth');

const app = express();

// Middleware
app.use(cors());
app.use(express.json()); // JSON data parse karne ke liye

const businessRoutes = require('./routes/businessRoutes');
const feedbackRoutes = require('./routes/feedbackRoutes');

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB Connected Successfully'))
  .catch((err) => console.log('MongoDB Connection Error: ', err));

// Basic Test Route


app.use('/api/business', businessRoutes);
app.use('/api/feedback', feedbackRoutes);

app.post('/api/admin/signup', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Check karein email pehle se registered toh nahi hai
    const existingAdmin = await Admin.findOne({ email });
    if (existingAdmin) {
      return res.status(400).json({ success: false, message: 'Email already registered!' });
    }

    // Password Hash (Encrypt) karein
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Naya Owner database mein save karein
    const newAdmin = new Admin({ name, email, password: hashedPassword });
    await newAdmin.save();

    // Token generate karein taaki signup hote hi direct login ho jaye
    const token = jwt.sign({ id: newAdmin._id }, process.env.JWT_SECRET, { expiresIn: '1d' });

    res.status(201).json({ success: true, token, message: 'Owner registered successfully!' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});



app.get('/api/admin/dashboard', verifyToken, async (req, res) => {
  try {
    // 1. JWT token se mile Admin ID ke through unka Business dhundein
    // Note: Agar aapne Admin model me businessId save ki hai, toh Admin fetch karke business nikal sakte hain.
    // Ya agar Business model me adminId hai, toh direct query karein:
    const admin = await Admin.findById(req.user.id);
    if (!admin || !admin.businessId) {
      return res.status(404).json({ success: false, message: 'No business linked to this account yet.' });
    }

    const business = await Business.findById(admin.businessId);
    
    // 2. Is business ke saare feedbacks fetch karein (Latest pehle)
    const feedbacks = await Feedback.find({ businessId: business._id }).sort({ createdAt: -1 });

    // 3. Stats Calculate karein
    const totalFeedbacks = feedbacks.length;
    const negativePrevented = feedbacks.filter(f => f.rating <= 3).length;
    const avgRating = totalFeedbacks > 0 
      ? (feedbacks.reduce((sum, current) => sum + current.rating, 0) / totalFeedbacks).toFixed(1)
      : 0;

    res.json({
      success: true,
      business,
      stats: { totalFeedbacks, negativePrevented, avgRating },
      feedbacks
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error fetching dashboard data' });
  }
});

app.post('/api/admin/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Database mein user find karein
    const admin = await Admin.findOne({ email });
    if (!admin) {
      return res.status(401).json({ success: false, message: 'Invalid Email or Password!' });
    }

    // Encrypt password ko match karein
    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid Email or Password!' });
    }

    // Sahi details hone par Token generate karein
    const token = jwt.sign({ id: admin._id }, process.env.JWT_SECRET, { expiresIn: '1d' });

    res.json({ success: true, token, message: 'Login successful!' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});



// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});