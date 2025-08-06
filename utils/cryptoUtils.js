/**
 * Utility functions for cryptographic operations
 */
import crypto from 'crypto';

/**
 * Generate a hash using HMAC SHA256
 * @param {string} data - The data to hash
 * @param {string} secret - The secret key
 * @returns {string} - The generated hash
 */
export const generateHmacSha256 = (data, secret) => {
  return crypto
    .createHmac('sha256', secret)
    .update(data)
    .digest('hex');
};

/**
 * Verify Razorpay payment signature
 * @param {string} orderId - The Razorpay order ID
 * @param {string} paymentId - The Razorpay payment ID
 * @param {string} signature - The signature to verify
 * @param {string} secret - The Razorpay key secret
 * @returns {boolean} - True if signature is valid, false otherwise
 */
export const verifyRazorpaySignature = (orderId, paymentId, signature, secret) => {
  const generatedSignature = generateHmacSha256(`${orderId}|${paymentId}`, secret);
  return generatedSignature === signature;
};

/**
 * Generate a random string
 * @param {number} length - The length of the string to generate
 * @returns {string} - The generated random string
 */
export const generateRandomString = (length = 16) => {
  return crypto
    .randomBytes(Math.ceil(length / 2))
    .toString('hex')
    .slice(0, length);
};

/**
 * Generate a secure token
 * @param {number} length - The length of the token to generate
 * @returns {string} - The generated token
 */
export const generateSecureToken = (length = 32) => {
  return crypto.randomBytes(length).toString('hex');
};

/**
 * Hash a password using bcrypt
 * Note: This is just a placeholder. In the actual implementation,
 * we use bcrypt directly in the User model.
 * @param {string} password - The password to hash
 * @returns {Promise<string>} - The hashed password
 */
export const hashPassword = async (password) => {
  // This is just a placeholder. In the actual implementation,
  // we use bcrypt directly in the User model.
  return password;
};