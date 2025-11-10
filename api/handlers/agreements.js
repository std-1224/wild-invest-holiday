/**
 * Agreement Handlers
 * API handlers for managing legal agreements and documents
 */
import connectDB from '../lib/db.js';
import Agreement from '../models/Agreement.js';
import User from '../models/User.js';

/**
 * GET /api/agreements/owners
 * Get all users with role 'owner'
 * Admin only
 */
export async function handleGetAllOwners(req, res) {
  try {
    await connectDB();

    // Extract token from Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: 'Not authorized',
      });
    }

    const token = authHeader.substring(7);
    
    // Verify token
    const { verifyToken } = await import('../lib/jwt.js');
    const decoded = verifyToken(token);

    // Get current user to check if admin
    const currentUser = await User.findById(decoded.id);
    
    if (!currentUser) {
      return res.status(404).json({
        success: false,
        error: 'User not found',
      });
    }

    // Check if user is admin
    if (currentUser.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Access denied. Admin only.',
      });
    }

    // Get all owners
    const owners = await User.find({ role: 'owner' })
      .select('name email phone referralCode createdAt')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: owners.length,
      owners: owners.map(owner => ({
        id: owner._id,
        name: owner.name,
        email: owner.email,
        phone: owner.phone,
        referralCode: owner.referralCode,
        createdAt: owner.createdAt,
      })),
    });
  } catch (error) {
    console.error('❌ Get all owners error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch owners',
    });
  }
}

/**
 * GET /api/agreements/:ownerId
 * Get all agreements for a specific owner
 */
export async function handleGetAgreementsByOwner(req, res) {
  try {
    await connectDB();

    const { ownerId } = req.params;

    // Extract token from Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: 'Not authorized',
      });
    }

    const token = authHeader.substring(7);
    
    // Verify token
    const { verifyToken } = await import('../lib/jwt.js');
    const decoded = verifyToken(token);

    // Get current user
    const currentUser = await User.findById(decoded.id);
    
    if (!currentUser) {
      return res.status(404).json({
        success: false,
        error: 'User not found',
      });
    }

    // Check if user is admin or the owner themselves
    if (currentUser.role !== 'admin' && currentUser._id.toString() !== ownerId) {
      return res.status(403).json({
        success: false,
        error: 'Access denied',
      });
    }

    // Get agreements for owner
    const agreements = await Agreement.find({ owner_id: ownerId })
      .populate('uploaded_by', 'name email')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: agreements.length,
      agreements: agreements.map(agreement => ({
        id: agreement._id,
        owner_id: agreement.owner_id,
        agreement_type: agreement.agreement_type,
        agreement_url: agreement.agreement_url,
        cabin_id: agreement.cabin_id,
        file_name: agreement.file_name,
        file_size: agreement.file_size,
        file_type: agreement.file_type,
        uploaded_by: agreement.uploaded_by,
        status: agreement.status,
        createdAt: agreement.createdAt,
        updatedAt: agreement.updatedAt,
      })),
    });
  } catch (error) {
    console.error('❌ Get agreements by owner error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch agreements',
    });
  }
}

/**
 * POST /api/agreements
 * Create a new agreement
 * Admin only
 */
export async function handleCreateAgreement(req, res) {
  try {
    await connectDB();

    const { owner_id, agreement_type, agreement_url, cabin_id, file_name, file_size, file_type } = req.body;

    // Extract token from Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: 'Not authorized',
      });
    }

    const token = authHeader.substring(7);
    
    // Verify token
    const { verifyToken } = await import('../lib/jwt.js');
    const decoded = verifyToken(token);

    // Get current user to check if admin
    const currentUser = await User.findById(decoded.id);
    
    if (!currentUser) {
      return res.status(404).json({
        success: false,
        error: 'User not found',
      });
    }

    // Check if user is admin
    if (currentUser.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Access denied. Admin only.',
      });
    }

    // Validate required fields
    if (!owner_id || !agreement_type || !agreement_url) {
      return res.status(400).json({
        success: false,
        error: 'Please provide owner_id, agreement_type, and agreement_url',
      });
    }

    // Verify owner exists
    const owner = await User.findById(owner_id);
    if (!owner) {
      return res.status(404).json({
        success: false,
        error: 'Owner not found',
      });
    }

    // Create agreement
    const agreement = await Agreement.create({
      owner_id,
      agreement_type,
      agreement_url,
      cabin_id: cabin_id || null,
      file_name,
      file_size,
      file_type,
      uploaded_by: currentUser._id,
      status: 'active',
    });

    res.status(201).json({
      success: true,
      message: 'Agreement created successfully',
      agreement: {
        id: agreement._id,
        owner_id: agreement.owner_id,
        agreement_type: agreement.agreement_type,
        agreement_url: agreement.agreement_url,
        cabin_id: agreement.cabin_id,
        file_name: agreement.file_name,
        file_size: agreement.file_size,
        file_type: agreement.file_type,
        uploaded_by: agreement.uploaded_by,
        status: agreement.status,
        createdAt: agreement.createdAt,
      },
    });
  } catch (error) {
    console.error('❌ Create agreement error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to create agreement',
    });
  }
}

/**
 * PUT /api/agreements/:agreementId
 * Update agreement URL
 * Admin only
 */
export async function handleUpdateAgreement(req, res) {
  try {
    await connectDB();

    const { agreementId } = req.params;
    const { agreement_url, agreement_type, cabin_id, status } = req.body;

    // Extract token from Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: 'Not authorized',
      });
    }

    const token = authHeader.substring(7);
    
    // Verify token
    const { verifyToken } = await import('../lib/jwt.js');
    const decoded = verifyToken(token);

    // Get current user to check if admin
    const currentUser = await User.findById(decoded.id);
    
    if (!currentUser) {
      return res.status(404).json({
        success: false,
        error: 'User not found',
      });
    }

    // Check if user is admin
    if (currentUser.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Access denied. Admin only.',
      });
    }

    // Find and update agreement
    const updateData = {};
    if (agreement_url) updateData.agreement_url = agreement_url;
    if (agreement_type) updateData.agreement_type = agreement_type;
    if (cabin_id !== undefined) updateData.cabin_id = cabin_id;
    if (status) updateData.status = status;

    const agreement = await Agreement.findByIdAndUpdate(
      agreementId,
      updateData,
      { new: true, runValidators: true }
    );

    if (!agreement) {
      return res.status(404).json({
        success: false,
        error: 'Agreement not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Agreement updated successfully',
      agreement: {
        id: agreement._id,
        owner_id: agreement.owner_id,
        agreement_type: agreement.agreement_type,
        agreement_url: agreement.agreement_url,
        cabin_id: agreement.cabin_id,
        status: agreement.status,
        updatedAt: agreement.updatedAt,
      },
    });
  } catch (error) {
    console.error('❌ Update agreement error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to update agreement',
    });
  }
}

