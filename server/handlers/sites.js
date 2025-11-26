/**
 * Sites Handler
 * Handles site management operations for cabin locations
 */
import { connectDB } from '../lib/db.js';
import Site from '../models/Site.js';
import Location from '../models/Location.js';
import User from '../models/User.js';
import { verifyToken } from '../lib/jwt.js';

/**
 * GET /api/sites/:locationId
 * Get all sites for a specific location
 */
export async function handleGetSites(req, res) {
  try {
    await connectDB();

    const { locationId } = req.params;

    const sites = await Site.find({ locationId })
      .sort({ siteNumber: 1 })
      .lean();

    return res.status(200).json({
      success: true,
      sites,
      count: sites.length,
    });
  } catch (error) {
    console.error('Error fetching sites:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch sites',
      error: error.message,
    });
  }
}

/**
 * GET /api/sites/:locationId/available
 * Get available sites for a specific location and cabin type
 */
export async function handleGetAvailableSites(req, res) {
  try {
    await connectDB();

    const { locationId } = req.params;
    const { cabinType } = req.query;

    const query = {
      locationId,
      status: 'available',
    };

    if (cabinType) {
      query.cabinType = cabinType;
    }

    const sites = await Site.find(query)
      .sort({ siteNumber: 1 })
      .lean();

    return res.status(200).json({
      success: true,
      sites,
      count: sites.length,
    });
  } catch (error) {
    console.error('Error fetching available sites:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch available sites',
      error: error.message,
    });
  }
}

/**
 * POST /api/sites
 * Create a new site (admin only)
 */
export async function handleCreateSite(req, res) {
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

    const { locationId, siteNumber, cabinType, price, siteLeaseFee, features } = req.body;

    // Validate required fields
    if (!locationId || !siteNumber || !cabinType || price === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Please provide locationId, siteNumber, cabinType, and price',
      });
    }

    // Verify location exists
    const location = await Location.findById(locationId);
    if (!location) {
      return res.status(404).json({
        success: false,
        message: 'Location not found',
      });
    }

    // Check if site number already exists for this location
    const existingSite = await Site.findOne({ locationId, siteNumber });
    if (existingSite) {
      return res.status(400).json({
        success: false,
        message: `Site number ${siteNumber} already exists for this location`,
      });
    }

    // Create site
    const site = await Site.create({
      locationId,
      siteNumber,
      cabinType,
      price,
      siteLeaseFee: siteLeaseFee || 14000,
      status: 'available',
      features: features || [],
    });

    return res.status(201).json({
      success: true,
      message: 'Site created successfully',
      site,
    });
  } catch (error) {
    console.error('Error creating site:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to create site',
      error: error.message,
    });
  }
}

/**
 * PUT /api/sites/:siteId
 * Update a site (admin only)
 */
export async function handleUpdateSite(req, res) {
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

    const { siteId } = req.params;
    const updates = req.body;

    // Find and update site
    const site = await Site.findByIdAndUpdate(
      siteId,
      updates,
      { new: true, runValidators: true }
    );

    if (!site) {
      return res.status(404).json({
        success: false,
        message: 'Site not found',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Site updated successfully',
      site,
    });
  } catch (error) {
    console.error('Error updating site:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update site',
      error: error.message,
    });
  }
}

/**
 * POST /api/sites/bulk-create
 * Create multiple sites at once (admin only)
 */
export async function handleBulkCreateSites(req, res) {
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

    const { sites } = req.body;

    if (!Array.isArray(sites) || sites.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide an array of sites',
      });
    }

    // Create all sites
    const createdSites = await Site.insertMany(sites, { ordered: false });

    return res.status(201).json({
      success: true,
      message: `${createdSites.length} sites created successfully`,
      sites: createdSites,
      count: createdSites.length,
    });
  } catch (error) {
    console.error('Error bulk creating sites:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to create sites',
      error: error.message,
    });
  }
}

/**
 * PUT /api/admin/sites/bulk-update-lease-fee
 * Update site lease fee for all sites (admin only)
 */
export async function handleBulkUpdateSiteLeaseFee(req, res) {
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

    const { siteLeaseFee, locationId } = req.body;

    if (siteLeaseFee === undefined || siteLeaseFee === null) {
      return res.status(400).json({
        success: false,
        message: 'Please provide siteLeaseFee',
      });
    }

    // Build query - update all sites or just for a specific location
    const query = locationId ? { locationId } : {};

    // Update all matching sites
    const result = await Site.updateMany(
      query,
      { $set: { siteLeaseFee } }
    );

    return res.status(200).json({
      success: true,
      message: locationId
        ? `Updated ${result.modifiedCount} sites at this location`
        : `Updated ${result.modifiedCount} sites across all locations`,
      modifiedCount: result.modifiedCount,
      matchedCount: result.matchedCount,
    });
  } catch (error) {
    console.error('Error bulk updating site lease fee:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update site lease fee',
      error: error.message,
    });
  }
}

