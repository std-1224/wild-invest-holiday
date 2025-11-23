/**
 * Authentication Handlers
 * Handles user registration, login, password reset, and referrals
 */
import { connectDB } from '../lib/db.js';
import { generateToken } from '../lib/jwt.js';
import User from '../models/User.js';
import ReferralTransaction from '../models/ReferralTransaction.js';
import crypto from 'crypto';
import { Resend } from 'resend';

// Initialize Resend (only if API key is provided)
const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

/**
 * Helper function to calculate user balance from ReferralTransaction records
 * @param {string} userId - User ID to calculate balance for
 * @returns {Promise<number>} Total balance from referral credits
 */
async function calculateUserBalance(userId) {
  try {
    // Get all completed transactions where this user received credits
    const transactions = await ReferralTransaction.find({
      toUserId: userId,
      status: 'completed',
    });

    // Sum up all the amounts
    const balance = transactions.reduce((total, tx) => total + tx.amount, 0);
    return balance;
  } catch (error) {
    console.error('Error calculating user balance:', error);
    return 0;
  }
}

/**
 * POST /api/auth/register
 * Register a new user
 */
export async function handleRegister(req, res) {
  try {
    await connectDB();

    const { firstName, lastName, email, password, referralCode } = req.body;

    // Validate required fields
    if (!firstName || !lastName || !email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Please provide all required fields',
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        error: 'User with this email already exists',
      });
    }

    // Validate referral code if provided
    let referrerUser = null;
    if (referralCode) {
      referrerUser = await User.findOne({ referralCode: referralCode.toUpperCase() });
      if (!referrerUser) {
        return res.status(400).json({
          success: false,
          error: 'Invalid referral code',
        });
      }
    }

    // Create user
    const user = await User.create({
      name: `${firstName} ${lastName}`,
      email: email.toLowerCase(),
      password,
      referredBy: referralCode ? referralCode.toUpperCase() : null,
      role: 'owner',
    });

    // If a referral code was used, create referral transactions and update balances
    if (referrerUser) {
      try {
        // Create two transactions: one for referrer, one for referee
        await ReferralTransaction.create([
          {
            fromUserId: user._id,
            toUserId: referrerUser._id,
            amount: 1000,
            status: 'completed',
            type: 'referrer_credit',
            notes: `Referral credit for referring ${user.name}`,
          },
          {
            fromUserId: referrerUser._id,
            toUserId: user._id,
            amount: 1000,
            status: 'completed',
            type: 'referee_credit',
            notes: `Referral credit for using ${referrerUser.name}'s code`,
          },
        ]);

        // Update balances for both users
        await User.findByIdAndUpdate(referrerUser._id, {
          $inc: { balance: 1000 },
        });
        await User.findByIdAndUpdate(user._id, {
          $inc: { balance: 1000 },
        });

        console.log(`✅ Referral credits applied: $1,000 to ${referrerUser.name} and $1,000 to ${user.name}`);
      } catch (error) {
        console.error('❌ Error creating referral transactions:', error);
        // Don't fail registration if referral credits fail
      }
    }

    // Generate JWT token
    const token = generateToken(user._id);

    // Get updated user with balance
    const updatedUser = await User.findById(user._id);

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      token,
      user: {
        id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        referralCode: updatedUser.referralCode,
        balance: updatedUser.balance,
        role: updatedUser.role,
        createdAt: updatedUser.createdAt,
      },
    });
  } catch (error) {
    console.error('❌ Registration error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Registration failed',
    });
  }
}

/**
 * POST /api/auth/login
 * Login user
 */
export async function handleLogin(req, res) {
  try {
    await connectDB();

    const { email, password } = req.body;

    // Validate required fields
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Please provide email and password',
      });
    }

    // Find user and include password field
    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
    
    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Invalid email or password',
      });
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password);
    
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        error: 'Invalid email or password',
      });
    }

    // Generate JWT token
    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        referralCode: user.referralCode,
        balance: user.balance || 0,
        role: user.role,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    console.error('❌ Login error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Login failed',
    });
  }
}

/**
 * POST /api/auth/forgot-password
 * Send password reset email
 */
export async function handleForgotPassword(req, res) {
  try {
    await connectDB();

    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        error: 'Please provide an email address',
      });
    }

    // Find user
    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      // In development, we can be more helpful
      const isDevelopment = process.env.NODE_ENV === 'development' || !process.env.NODE_ENV;

      if (isDevelopment) {
        return res.status(400).json({
          success: false,
          error: 'No account found with this email address',
          message: 'Please check your email or register for a new account',
        });
      }

      // Production: Don't reveal if user exists (security)
      return res.status(200).json({
        success: true,
        message: 'If an account exists with this email, a password reset link has been sent',
      });
    }


    // Generate reset token
    const resetToken = user.generateResetToken();
    await user.save({ validateBeforeSave: false });

    // Create reset URL
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const resetUrl = `${frontendUrl}/reset-password?token=${resetToken}`;

    // Send email if Resend is configured
    if (resend) {
      try {
        const emailResult = await resend.emails.send({
          from: process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev',
          to: user.email,
          subject: 'Password Reset Request - Wild Things',
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #0e181f;">Password Reset Request</h2>
              <p>Hi ${user.name},</p>
              <p>You requested to reset your password. Click the button below to reset it:</p>
              <div style="text-align: center; margin: 30px 0;">
                <a href="${resetUrl}"
                   style="background-color: #ffcf00; color: #0e181f; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
                  Reset Password
                </a>
              </div>
              <p>Or copy and paste this link into your browser:</p>
              <p style="color: #86dbdf; word-break: break-all;">${resetUrl}</p>
              <p style="color: #666; font-size: 14px;">This link will expire in 10 minutes.</p>
              <p style="color: #666; font-size: 14px;">If you didn't request this, please ignore this email.</p>
              <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
              <p style="color: #999; font-size: 12px;">Wild Things - Your Investment Partner</p>
            </div>
          `,
        });

        // Check if Resend returned an error
        if (emailResult?.error) {
          console.error('❌ Resend API Error:', emailResult.error.message);
          if (emailResult.error.statusCode === 403) {
            console.error('⚠️  Resend is in test mode. Verify a domain at: https://resend.com/domains');
          }
        } else {
          console.log('✅ Password reset email sent to:', user.email);
        }
      } catch (emailError) {
        console.error('❌ Email sending error:', emailError.message);
        // Continue anyway - token is saved, user can contact support
      }
    } else {
      // Development mode - log token to console
      console.log('⚠️  RESEND_API_KEY not configured - running in development mode');
      console.log('🔑 Password reset token:', resetToken);
      console.log('🔗 Reset URL:', resetUrl);
    }

    res.status(200).json({
      success: true,
      message: 'If an account exists with this email, a password reset link has been sent',
    });
  } catch (error) {
    console.error('❌ Forgot password error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to process password reset request',
    });
  }
}

/**
 * POST /api/auth/reset-password
 * Reset password using token
 */
export async function handleResetPassword(req, res) {
  try {
    await connectDB();

    const { token, password } = req.body;

    if (!token || !password) {
      return res.status(400).json({
        success: false,
        error: 'Please provide token and new password',
      });
    }

    // Hash the token to compare with stored hash
    const hashedToken = crypto
      .createHash('sha256')
      .update(token)
      .digest('hex');

    // Find user with valid token
    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        error: 'Invalid or expired reset token',
      });
    }

    // Set new password
    user.password = password;
    user.resetPasswordToken = null;
    user.resetPasswordExpire = null;
    await user.save();

    // Generate new JWT token
    const jwtToken = generateToken(user._id);

    res.status(200).json({
      success: true,
      message: 'Password reset successful',
      token: jwtToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        referralCode: user.referralCode,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('❌ Reset password error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to reset password',
    });
  }
}

/**
 * GET /api/auth/me
 * Get current user profile
 */
export async function handleGetProfile(req, res) {
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

    // Get user
    const user = await User.findById(decoded.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found',
      });
    }

    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        referralCode: user.referralCode,
        balance: user.balance || 0,
        role: user.role,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    });
  } catch (error) {
    console.error('❌ Get profile error:', error);
    res.status(401).json({
      success: false,
      error: 'Not authorized',
    });
  }
}

/**
 * PUT /api/auth/update-profile
 * Update user profile
 */
export async function handleUpdateProfile(req, res) {
  try {
    await connectDB();

    // Get token from header
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

    // Get user
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found',
      });
    }

    const { firstName, lastName, email, phone } = req.body;

    // Update fields if provided
    if (firstName || lastName) {
      user.name = `${firstName || user.name.split(' ')[0]} ${lastName || user.name.split(' ').slice(1).join(' ')}`;
    }

    if (email && email !== user.email) {
      // Check if new email is already taken
      const existingUser = await User.findOne({ email: email.toLowerCase() });
      if (existingUser && existingUser._id.toString() !== user._id.toString()) {
        return res.status(400).json({
          success: false,
          error: 'Email already in use',
        });
      }
      user.email = email.toLowerCase();
    }

    if (phone !== undefined) {
      user.phone = phone;
    }

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        referralCode: user.referralCode,
        role: user.role,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    });
  } catch (error) {
    console.error('❌ Update profile error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to update profile',
    });
  }
}

/**
 * PUT /api/auth/change-password
 * Change user password
 */
export async function handleChangePassword(req, res) {
  try {
    await connectDB();

    // Get token from header
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

    // Get user
    const user = await User.findById(decoded.id).select('+password');

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found',
      });
    }

    const { currentPassword, newPassword } = req.body;

    // Validate required fields
    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        error: 'Please provide current and new password',
      });
    }

    // Validate new password length
    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        error: 'New password must be at least 6 characters',
      });
    }

    // Check current password
    const isMatch = await user.matchPassword(currentPassword);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        error: 'Current password is incorrect',
      });
    }

    // Update password
    user.password = newPassword;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Password changed successfully',
    });
  } catch (error) {
    console.error('❌ Change password error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to change password',
    });
  }
}

/**
 * POST /api/auth/validate-referral
 * Validate a referral code
 */
export async function handleValidateReferral(req, res) {
  try {
    await connectDB();

    const { referralCode } = req.body;

    if (!referralCode) {
      return res.status(400).json({
        success: false,
        valid: false,
        message: 'Referral code is required',
      });
    }

    // Find user with this referral code
    const user = await User.findOne({ referralCode: referralCode.toUpperCase() });

    if (!user) {
      return res.status(200).json({
        success: true,
        valid: false,
        message: 'Invalid referral code',
      });
    }

    res.status(200).json({
      success: true,
      valid: true,
      message: 'Valid referral code',
      referrerName: user.name,
    });
  } catch (error) {
    console.error('❌ Validate referral error:', error);
    res.status(500).json({
      success: false,
      valid: false,
      error: error.message || 'Failed to validate referral code',
    });
  }
}

/**
 * GET /api/auth/referral-stats
 * Get referral statistics for the authenticated user
 */
export async function handleGetReferralStats(req, res) {
  try {
    await connectDB();

    // Extract token from Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: 'Not authenticated',
      });
    }

    const token = authHeader.substring(7);

    // Verify token
    const { verifyToken } = await import('../lib/jwt.js');
    let decoded;
    try {
      decoded = verifyToken(token);
    } catch (error) {
      return res.status(401).json({
        success: false,
        error: 'Invalid or expired token',
      });
    }

    // Get user's referral code
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found',
      });
    }

    // Count how many users used this user's referral code
    const referralCount = await User.countDocuments({
      referredBy: user.referralCode
    });

    // Calculate total earned from referral transactions
    const transactions = await ReferralTransaction.find({
      toUserId: decoded.id,
      status: 'completed',
    });

    const totalEarned = transactions.reduce((sum, tx) => sum + tx.amount, 0);

    res.status(200).json({
      success: true,
      referralCode: user.referralCode,
      referralCount,
      totalEarned,
      transactions: transactions.map(tx => ({
        amount: tx.amount,
        type: tx.type,
        createdAt: tx.createdAt,
      })),
    });
  } catch (error) {
    console.error('❌ Get referral stats error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to get referral stats',
    });
  }
}

/**
 * POST /api/auth/apply-referral-credits
 * Apply referral credits when user makes first investment
 * This should be called from the investment completion handler
 */
export async function handleApplyReferralCredits(req, res) {
  try {
    await connectDB();

    const { userId, investmentId } = req.body;

    if (!userId || !investmentId) {
      return res.status(400).json({
        success: false,
        error: 'User ID and Investment ID are required',
      });
    }

    // Get the user who just invested
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found',
      });
    }

    // Check if user was referred by someone
    if (!user.referredBy) {
      return res.status(200).json({
        success: true,
        message: 'No referral code used',
        creditsApplied: false,
      });
    }

    // Find the referrer
    const referrer = await User.findOne({ referralCode: user.referredBy });
    if (!referrer) {
      return res.status(404).json({
        success: false,
        error: 'Referrer not found',
      });
    }

    // Check if credits already applied for this user
    const existingCredits = await ReferralTransaction.findOne({
      fromUserId: referrer._id,
      toUserId: user._id,
    });

    if (existingCredits) {
      return res.status(200).json({
        success: true,
        message: 'Referral credits already applied',
        creditsApplied: false,
      });
    }

    // Create two transactions: one for referrer, one for referee
    const transactions = await ReferralTransaction.create([
      {
        fromUserId: user._id,
        toUserId: referrer._id,
        amount: 1000,
        status: 'completed',
        type: 'referrer_credit',
        investmentId,
        notes: `Referral credit for referring ${user.name}`,
      },
      {
        fromUserId: referrer._id,
        toUserId: user._id,
        amount: 1000,
        status: 'completed',
        type: 'referee_credit',
        investmentId,
        notes: `Referral credit for using ${referrer.name}'s code`,
      },
    ]);

    res.status(200).json({
      success: true,
      message: 'Referral credits applied successfully',
      creditsApplied: true,
      transactions: transactions.map(tx => ({
        id: tx._id,
        amount: tx.amount,
        type: tx.type,
      })),
    });
  } catch (error) {
    console.error('❌ Apply referral credits error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to apply referral credits',
    });
  }
}

