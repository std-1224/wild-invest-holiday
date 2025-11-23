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
      cabinTypeDistribution: cabinTypeDistribution || { '1BR': 50, '2BR': 50 },
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

/**
 * Get sites for a specific location
 */
export async function handleGetLocationSites(req, res) {
  try {
    await connectDB();

    const { locationId } = req.params;

    if (!locationId) {
      return res.status(400).json({
        success: false,
        message: 'Location ID is required',
      });
    }

    // Get all sites for this location
    const sites = await Site.find({ locationId })
      .sort({ cabinType: 1, siteNumber: 1 });

    // Get statistics
    const stats = {
      total: sites.length,
      available: sites.filter(s => s.status === 'available').length,
      reserved: sites.filter(s => s.status === 'reserved').length,
      sold: sites.filter(s => s.status === 'sold').length,
      unavailable: sites.filter(s => s.status === 'unavailable').length,
      '1BR': sites.filter(s => s.cabinType === '1BR').length,
      '2BR': sites.filter(s => s.cabinType === '2BR').length,
    };

    return res.status(200).json({
      success: true,
      sites,
      stats,
    });
  } catch (error) {
    console.error('Error fetching location sites:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch location sites',
      error: error.message,
    });
  }
}

/**
 * Delete location (admin only)
 * Soft delete by setting status to 'inactive' and also delete all associated sites
 */
export async function handleDeleteLocation(req, res) {
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

    // Check if location exists
    const location = await Location.findById(locationId);
    if (!location) {
      return res.status(404).json({
        success: false,
        message: 'Location not found',
      });
    }

    // Check if location has any sold sites
    const soldSites = await Site.find({
      locationId,
      status: 'sold'
    });

    if (soldSites.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete location with ${soldSites.length} sold site(s). Please contact support.`,
      });
    }

    // Soft delete location by setting status to 'inactive'
    location.status = 'inactive';
    await location.save();

    // Delete all associated sites (hard delete since they're not sold)
    const deletedSites = await Site.deleteMany({ locationId });

    console.log(`✅ Location "${location.name}" soft-deleted (status: inactive)`);
    console.log(`🗑️  Deleted ${deletedSites.deletedCount} associated sites`);

    return res.status(200).json({
      success: true,
      message: 'Location deleted successfully',
      deletedSitesCount: deletedSites.deletedCount,
    });
  } catch (error) {
    console.error('Error deleting location:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to delete location',
      error: error.message,
    });
  }
}
