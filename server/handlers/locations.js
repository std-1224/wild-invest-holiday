/**
 * Locations Handler
 * Handles location and site management operations
 */
import { connectDB } from '../lib/db.js';
import Location from '../models/Location.js';
import Site from '../models/Site.js';
import User from '../models/User.js';
import { verifyToken } from '../lib/jwt.js';

/**
 * Get all locations
 */
export async function handleGetLocations(req, res) {
  try {
    await connectDB();

    const locations = await Location.find({ status: { $ne: 'inactive' } })
      .sort({ name: 1 });

    return res.status(200).json({
      success: true,
      locations,
      count: locations.length,
    });
  } catch (error) {
    console.error('Error fetching locations:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch locations',
      error: error.message,
    });
  }
}

/**
 * Create a new location (admin only)
 */
export async function handleCreateLocation(req, res) {
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

    const {
      name,
      description,
      address,
      coordinates,
      totalSites,
      cabinTypeDistribution,
      amenities,
      images,
    } = req.body;

    // Validate required fields
    if (!name || !totalSites) {
      return res.status(400).json({
        success: false,
        message: 'Name and total sites are required',
      });
    }

    // Generate slug from name
    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');

    // Handle address - convert string to object if needed
    let addressObj = address;
    if (typeof address === 'string') {
      addressObj = {
        street: address,
        city: '',
        state: '',
        postcode: '',
        country: 'Australia',
      };
    }

    // Create location
    const location = await Location.create({
      name,
      slug,
      description,
      address: addressObj,
      coordinates,
      totalSites,
      availableSites: totalSites,
      amenities,
      images,
    });

    // Create sites based on cabin type distribution
    if (cabinTypeDistribution && totalSites > 0) {
      const sites = [];
      const oneBRCount = Math.floor(totalSites * (cabinTypeDistribution['1BR'] || 0) / 100);
      const twoBRCount = totalSites - oneBRCount;

      // Create 1BR sites
      for (let i = 1; i <= oneBRCount; i++) {
        sites.push({
          locationId: location._id,
          siteNumber: `1BR-${String(i).padStart(3, '0')}`,
          cabinType: '1BR',
          price: 190000,
          status: 'available',
        });
      }

      // Create 2BR sites
      for (let i = 1; i <= twoBRCount; i++) {
        sites.push({
          locationId: location._id,
          siteNumber: `2BR-${String(i).padStart(3, '0')}`,
          cabinType: '2BR',
          price: 380000,
          status: 'available',
        });
      }

      await Site.insertMany(sites);
    }

    return res.status(201).json({
      success: true,
      message: 'Location created successfully',
      location,
    });
  } catch (error) {
    console.error('Error creating location:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to create location',
      error: error.message,
    });
  }
}

/**
 * Get sites for a location
 */
export async function handleGetSitesByLocation(req, res) {
  try {
    await connectDB();

    const { locationId } = req.params;

    const sites = await Site.find({ locationId })
      .sort({ siteNumber: 1 });

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
 * Update location (admin only)
 */
export async function handleUpdateLocation(req, res) {
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

    const { locationId } = req.params;
    const updates = req.body;

    const location = await Location.findByIdAndUpdate(
      locationId,
      updates,
      { new: true, runValidators: true }
    );

    if (!location) {
      return res.status(404).json({
        success: false,
        message: 'Location not found',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Location updated successfully',
      location,
    });
  } catch (error) {
    console.error('Error updating location:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update location',
      error: error.message,
    });
  }
}

