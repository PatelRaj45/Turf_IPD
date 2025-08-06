const jwt = require('jsonwebtoken');

/**
 * Generate JWT token
 * @param {Object} payload - The data to be encoded in the token
 * @param {string} secret - The secret key for signing the token
 * @param {Object} options - Options for the token (e.g., expiresIn)
 * @returns {string} - The JWT token
 */
exports.generateToken = (payload, secret, options = {}) => {
  return jwt.sign(payload, secret, options);
};

/**
 * Verify JWT token
 * @param {string} token - The JWT token to verify
 * @param {string} secret - The secret key used to sign the token
 * @returns {Object} - The decoded token payload
 */
exports.verifyToken = (token, secret) => {
  try {
    return jwt.verify(token, secret);
  } catch (error) {
    throw error; // Let the error handler middleware handle JWT errors
  }
};

/**
 * Set JWT token in cookie
 * @param {Object} res - Express response object
 * @param {string} token - The JWT token
 * @param {number} expires - Cookie expiration time in milliseconds
 * @param {boolean} secure - Whether the cookie should be secure (HTTPS only)
 * @param {boolean} httpOnly - Whether the cookie should be HTTP only
 */
exports.setCookie = (res, token, expires, secure = false, httpOnly = true) => {
  const options = {
    expires: new Date(Date.now() + expires),
    httpOnly,
    secure
  };

  res.cookie('token', token, options);
};

/**
 * Clear JWT token cookie
 * @param {Object} res - Express response object
 */
exports.clearCookie = (res) => {
  res.cookie('token', 'none', {
    expires: new Date(Date.now() + 10 * 1000), // 10 seconds
    httpOnly: true
  });
};