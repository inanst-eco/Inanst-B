const jwt = require('jsonwebtoken');

// Define the protect middleware 
const protect = function(req, res, next) {
    const authHeader = req.header('Authorization');
    let token;

    if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.split(' ')[1];
    } else {
        token = req.header('x-auth-token');
    }

    if (!token) {
        return res.status(401).json({ success: false, msg: 'Access denied. No token provided.' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        if (!decoded.id) {
            return res.status(401).json({ success: false, msg: 'Token is invalid: missing user ID' });
        }

        // Assign decoded user info to request object
        req.user = decoded; 
        next();
    } catch (e) {
        console.error("JWT Auth Error:", e.message);
        const message = e.name === 'TokenExpiredError' 
            ? 'Session expired. Please login again.' 
            : 'Token is not valid';
        res.status(401).json({ success: false, msg: message });
    }
};


const unitAccess = (req, res, next) => {
    // Ensuring we match the 'admin' role stored in your JWT payload
    if (req.user && req.user.role === 'admins') {
        next();
    } else {
        res.status(403).json({ 
            success: false, 
            msg: "Access denied. Authority: System Control Level required." 
        });
    }
};

// Exporting with the new naming convention
module.exports = {
    protect,
    unitAccess
};


/*const jwt = require('jsonwebtoken');

// Define the protect middleware 
const protect = function(req, res, next) {
  const authHeader = req.header('Authorization');
  let token;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.split(' ')[1];
  } else {
    token = req.header('x-auth-token');
  }

  if (!token) {
    return res.status(401).json({ msg: 'Access denied. No token provided.' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    if (!decoded.id) {
      return res.status(401).json({ msg: 'Token is invalid: missing user ID' });
    }

    req.user = decoded; 
    next();
  } catch (e) {
    console.error("JWT Auth Error:", e.message);
    const message = e.name === 'TokenExpiredError' 
      ? 'Session expired. Please login again.' 
      : 'Token is not valid';
    res.status(401).json({ msg: message });
  }
};

// Define the adminOnly middleware
const adminOnly = (req, res, next) => {
    // Check if req.user exists and has the admin role
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        res.status(403).json({ msg: "Access denied. Authority: Administrator required." });
    }
};

//  Export them as an object so the destructuring in adminRoutes works
module.exports = {
    protect,
    adminOnly
};
*/