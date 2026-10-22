const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
  // Frontend se aane wale header se token nikalna
  const token = req.header('Authorization');
  if (!token) return res.status(401).json({ success: false, message: 'Access Denied! Token missing.' });

  try {
    // Token verify karna
    const verified = jwt.verify(token.replace('Bearer ', ''), process.env.JWT_SECRET);
    req.user = verified; // req.user me { id: admin._id } save ho jayega
    next();
  } catch (err) {
    res.status(400).json({ success: false, message: 'Invalid Token!' });
  }
};

module.exports = verifyToken;