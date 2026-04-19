const jwt = require('jsonwebtoken');

module.exports = function(req, res, next) {
  // Get token from header
  const authHeader = req.header('Authorization');
  let token;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.split(' ')[1];
  } else {
    token = req.header('x-auth-token');
  }

  // Check if no token
  if (!token) {
    return res.status(401).json({ msg: 'Access denied. No token provided.' });
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Ensure the decoded token has the necessary data
    if (!decoded.id) {
      return res.status(401).json({ msg: 'Token is invalid: missing user ID' });
    }

    // Add user from payload to request object
    req.user = decoded;
    next();
  } catch (e) {
    console.error("JWT Auth Error:", e.message);
    
    // Distinguish between expired and invalid for better frontend debugging
    const message = e.name === 'TokenExpiredError' 
      ? 'Session expired. Please login again.' 
      : 'Token is not valid';
      
    res.status(401).json({ msg: message });
  }
};