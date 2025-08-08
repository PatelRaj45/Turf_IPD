import jwt from 'jsonwebtoken';
import User from '../models/User.js';

/**
 * Middleware to protect routes that require authentication
 */
const protect = async (req, res, next) => {
  try {
    let token;

    // Check if token exists in headers
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      // Extract token from Bearer token
      token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies && req.cookies.token) {
      // Alternative: Check if token exists in cookies
      token = req.cookies.token;
    }

    // Check if token exists
    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'Not authorized to access this route'
      });
    }

    try {
      // Get JWT secret with fallback
      const secret = process.env.JWT_SECRET || 'fallback_secret_for_development_only_do_not_use_in_production';
      
      // Verify token
      const decoded = jwt.verify(token, secret);

      // Attach user to request object
      req.user = await User.findById(decoded.id);

      if (!req.user) {
        return res.status(401).json({
          success: false,
          error: 'User not found with this token'
        });
      }

      next();
    } catch (error) {
      console.error('Token verification error:', error.message);
      return res.status(401).json({
        success: false,
        error: 'Not authorized to access this route - invalid token'
      });
    }
  } catch (error) {
    console.error('Auth middleware error:', error);
    next(error);
  }
};

/**
 * Middleware to restrict access to specific roles
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'User not authenticated'
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: `User role ${req.user.role} is not authorized to access this route`
      });
    }

    next();
  };
};

export { protect, authorize };