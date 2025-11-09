/**
 * JWT Utility Functions
 * Handles token generation and verification
 */
import jwt from 'jsonwebtoken';

/**
 * Generate JWT token
 * @param {string} userId - User ID to encode in token
 * @returns {string} JWT token
 */
export function generateToken(userId) {
  const secret = process.env.JWT_SECRET;
  const expire = process.env.JWT_EXPIRE || '7d';

  if (!secret) {
    throw new Error('JWT_SECRET environment variable is not defined');
  }

  return jwt.sign({ id: userId }, secret, {
    expiresIn: expire,
  });
}

/**
 * Verify JWT token
 * @param {string} token - JWT token to verify
 * @returns {object} Decoded token payload
 */
export function verifyToken(token) {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new Error('JWT_SECRET environment variable is not defined');
  }

  try {
    return jwt.verify(token, secret);
  } catch (error) {
    throw new Error('Invalid or expired token');
  }
}

/**
 * Extract token from Authorization header
 * @param {string} authHeader - Authorization header value
 * @returns {string|null} Token or null if not found
 */
export function extractToken(authHeader) {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }

  return authHeader.substring(7);
}

