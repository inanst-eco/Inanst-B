const jwt = require('jsonwebtoken');

module.exports = function(req, res, next) {
  const authHeader = req.header('Authorization');
  const token = (authHeader && authHeader.startsWith('Bearer ')) 
    ? authHeader.split(' ')[1] 
    : req.header('x-auth-token');

  if (!token) {
    return res.status(401).json({ msg: 'Access denied. No token provided.' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    
    if (!decoded.id || !decoded.role) {
      return res.status(401).json({ msg: 'Token is missing user permissions' });
    }

    req.user = decoded;
    next();
  } catch (e) {
    console.error("JWT Auth Error:", e.message);
    res.status(401).json({ msg: 'Token is not valid or has expired' });
  }
};