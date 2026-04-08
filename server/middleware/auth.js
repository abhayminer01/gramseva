const jwt = require('jsonwebtoken');
const Citizen = require('../models/Citizen');
const Authority = require('../models/Authority');

const protect = async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      let targetUser = null;
      if (decoded.scope === 'authority') {
         targetUser = await Authority.findById(decoded.id).select('-password');
      } else if (decoded.scope === 'citizen') {
         targetUser = await Citizen.findById(decoded.id).select('-password');
      } else {
         // Fallback legacy support just in case
         targetUser = await Citizen.findById(decoded.id).select('-password') || await Authority.findById(decoded.id).select('-password');
      }

      if(!targetUser) {
         return res.status(401).json({ message: 'User account no longer exists' });
      }

      req.user = targetUser;
      next();
    } catch (error) {
      res.status(401).json({ message: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    res.status(401).json({ message: 'Not authorized, no token' });
  }
};

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: `User role ${req.user.role} is not authorized` });
    }
    next();
  };
};

module.exports = { protect, authorize };
