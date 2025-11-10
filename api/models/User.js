/**
 * User Model
 * MongoDB schema for user authentication and profile
 */
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide a name'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Please provide an email'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        'Please provide a valid email',
      ],
    },
    password: {
      type: String,
      required: [true, 'Please provide a password'],
      minlength: [6, 'Password must be at least 6 characters'],
      select: false, // Don't return password by default
    },
    phone: {
      type: String,
      trim: true,
      default: '',
    },
    referralCode: {
      type: String,
      unique: true,
      sparse: true, // Allow null values but enforce uniqueness when set
      trim: true,
      uppercase: true,
    },
    referredBy: {
      type: String, // Stores the referral code used during signup
      trim: true,
      uppercase: true,
      default: null,
    },
    resetPasswordToken: {
      type: String,
      default: null,
    },
    resetPasswordExpire: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt
  }
);

// Generate unique referral code before saving (only for new users)
userSchema.pre('save', async function (next) {
  // Generate referral code for new users
  if (this.isNew && !this.referralCode) {
    try {
      let isUnique = false;
      let code = '';

      // Keep generating until we get a unique code
      while (!isUnique) {
        // Generate 8-character alphanumeric code (e.g., KAL12345)
        const randomPart = crypto.randomBytes(4).toString('hex').toUpperCase();
        code = randomPart.substring(0, 8);

        // Check if code already exists
        const existing = await mongoose.models.User.findOne({ referralCode: code });
        if (!existing) {
          isUnique = true;
        }
      }

      this.referralCode = code;
    } catch (error) {
      return next(error);
    }
  }

  next();
});

// Hash password before saving
userSchema.pre('save', async function (next) {
  // Only hash if password is modified
  if (!this.isModified('password')) {
    return next();
  }

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare password
userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Alias for matchPassword (used in some handlers)
userSchema.methods.matchPassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Method to generate password reset token
userSchema.methods.generateResetToken = function () {
  // Generate random token
  const resetToken = crypto.randomBytes(32).toString('hex');

  // Hash token and set to resetPasswordToken field
  this.resetPasswordToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  // Set expire time (10 minutes)
  this.resetPasswordExpire = Date.now() + 10 * 60 * 1000;

  return resetToken;
};

// Create model
const User = mongoose.models.User || mongoose.model('User', userSchema);

export default User;

