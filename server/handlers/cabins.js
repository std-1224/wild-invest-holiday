/**
 * Cabins Handler
 * Handles cabin ownership and management operations
 */
import { connectDB } from '../lib/db.js';
import Cabin from '../models/Cabin.js';
import User from '../models/User.js';
import { verifyToken } from '../lib/jwt.js';

/**
 * Get cabins owned by a specific owner (admin only)
 */
export async function handleGetOwnerCabins(req, res) {
  try {
    await connectDB();

    // Verify admin authentication
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
      });
    }

    const decoded = verifyToken(token);
    const user = await User.findById(decoded.id);

    if (!user || user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Admin access required',
      });
    }

    const { ownerId } = req.params;

    const cabins = await Cabin.findByOwnerId(ownerId);

    return res.status(200).json({
      success: true,
      cabins,
      count: cabins.length,
    });
  } catch (error) {
    console.error('Error fetching owner cabins:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch owner cabins',
      error: error.message,
    });
  }
}

/**
 * Get all cabins for authenticated user
 */
export async function handleGetMyCabins(req, res) {
  try {
    await connectDB();

    // Verify authentication
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
      });
    }

    const decoded = verifyToken(token);
    const cabins = await Cabin.findByOwnerId(decoded.id);

    return res.status(200).json({
      success: true,
      cabins,
      count: cabins.length,
    });
  } catch (error) {
    console.error('Error fetching my cabins:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch cabins',
      error: error.message,
    });
  }
}

/**
 * Search owners by name or email (admin only)
 */
export async function handleSearchOwners(req, res) {
  try {
    await connectDB();

    // Verify admin authentication
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
      });
    }

    let decoded;
    try {
      decoded = verifyToken(token);
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired token',
      });
    }

    // Note: JWT token uses 'id' field, not 'userId'
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User not found',
      });
    }

    if (user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Admin access required',
      });
    }

    const { query } = req.query;

    if (!query || query.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Search query is required',
      });
    }

    // Search by name or email (case-insensitive)
    const owners = await User.find({
      role: 'owner',
      $or: [
        { name: { $regex: query, $options: 'i' } },
        { email: { $regex: query, $options: 'i' } },
      ],
    })
      .select('name email phone createdAt')
      .limit(20)
      .sort({ name: 1 });

    return res.status(200).json({
      success: true,
      owners,
      count: owners.length,
    });
  } catch (error) {
    console.error('Error searching owners:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to search owners',
      error: error.message,
    });
  }
}

