import mongoose from 'mongoose';
import crypto from 'crypto';

/**
 * XeroConnection Schema
 * Stores Xero OAuth tokens and connection data for each user
 * 
 * Security: Access and refresh tokens are encrypted at rest
 */
const xeroConnectionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true, // One Xero connection per user
  },
  tenantId: {
    type: String,
    required: true,
    index: true,
  },
  tenantName: {
    type: String,
    default: '',
  },
  // Encrypted access token (expires every ~30 minutes)
  accessToken: {
    type: String,
    required: true,
  },
  // Encrypted refresh token (expires if unused for 60 days)
  refreshToken: {
    type: String,
    required: true,
  },
  // When the access token expires (Date object)
  tokenExpiresAt: {
    type: Date,
    required: true,
    index: true, // For finding expired tokens
  },
  // Additional token metadata
  tokenType: {
    type: String,
    default: 'Bearer',
  },
  scope: {
    type: String,
    default: '',
  },
  // Connection timestamps
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Update the updatedAt timestamp before saving
xeroConnectionSchema.pre('save', function (next) {
  this.updatedAt = new Date();
  next();
});

/**
 * Encryption/Decryption helpers
 * Uses AES-256-GCM for secure token storage
 */
const ENCRYPTION_KEY = process.env.XERO_ENCRYPTION_KEY || crypto.randomBytes(32).toString('hex');
const ALGORITHM = 'aes-256-gcm';

/**
 * Encrypt a token string
 * @param {string} text - Plain text token
 * @returns {string} - Encrypted token in format: iv:authTag:encryptedData
 */
function encrypt(text) {
  if (!text) {
    throw new Error('Cannot encrypt empty or null token');
  }

  const key = Buffer.from(ENCRYPTION_KEY.slice(0, 64), 'hex');
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');

  const authTag = cipher.getAuthTag();

  // Return format: iv:authTag:encryptedData
  return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`;
}

/**
 * Decrypt a token string
 * @param {string} encryptedText - Encrypted token in format: iv:authTag:encryptedData
 * @returns {string} - Plain text token
 */
function decrypt(encryptedText) {
  if (!encryptedText) return '';
  
  try {
    const key = Buffer.from(ENCRYPTION_KEY.slice(0, 64), 'hex');
    const parts = encryptedText.split(':');
    
    if (parts.length !== 3) {
      throw new Error('Invalid encrypted token format');
    }
    
    const iv = Buffer.from(parts[0], 'hex');
    const authTag = Buffer.from(parts[1], 'hex');
    const encrypted = parts[2];
    
    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(authTag);
    
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  } catch (error) {
    console.error('Error decrypting token:', error.message);
    return '';
  }
}

/**
 * Instance method to get decrypted access token
 */
xeroConnectionSchema.methods.getAccessToken = function () {
  return decrypt(this.accessToken);
};

/**
 * Instance method to get decrypted refresh token
 */
xeroConnectionSchema.methods.getRefreshToken = function () {
  return decrypt(this.refreshToken);
};

/**
 * Instance method to set encrypted access token
 */
xeroConnectionSchema.methods.setAccessToken = function (token) {
  this.accessToken = encrypt(token);
};

/**
 * Instance method to set encrypted refresh token
 */
xeroConnectionSchema.methods.setRefreshToken = function (token) {
  this.refreshToken = encrypt(token);
};

/**
 * Instance method to check if access token is expired
 */
xeroConnectionSchema.methods.isAccessTokenExpired = function () {
  return new Date() >= this.tokenExpiresAt;
};

/**
 * Instance method to check if token needs refresh (expires in < 5 minutes)
 */
xeroConnectionSchema.methods.needsRefresh = function () {
  const fiveMinutesFromNow = new Date(Date.now() + 5 * 60 * 1000);
  return this.tokenExpiresAt <= fiveMinutesFromNow;
};

/**
 * Static method to find connection by user ID
 */
xeroConnectionSchema.statics.findByUserId = function (userId) {
  return this.findOne({ userId });
};

/**
 * Static method to create or update connection
 */
xeroConnectionSchema.statics.createOrUpdate = async function (userId, tokenSet, tenantId, tenantName = '') {
  const connection = await this.findOne({ userId });
  
  if (connection) {
    // Update existing connection
    connection.setAccessToken(tokenSet.access_token);
    connection.setRefreshToken(tokenSet.refresh_token);
    connection.tokenExpiresAt = new Date((tokenSet.expires_at || 0) * 1000);
    connection.tenantId = tenantId;
    connection.tenantName = tenantName;
    connection.tokenType = tokenSet.token_type || 'Bearer';
    connection.scope = tokenSet.scope || '';
    
    await connection.save();
    return connection;
  } else {
    // Create new connection
    const newConnection = new this({
      userId,
      tenantId,
      tenantName,
      tokenType: tokenSet.token_type || 'Bearer',
      scope: tokenSet.scope || '',
      tokenExpiresAt: new Date((tokenSet.expires_at || 0) * 1000),
    });
    
    newConnection.setAccessToken(tokenSet.access_token);
    newConnection.setRefreshToken(tokenSet.refresh_token);
    
    await newConnection.save();
    return newConnection;
  }
};

/**
 * Static method to delete connection by user ID
 */
xeroConnectionSchema.statics.deleteByUserId = function (userId) {
  return this.deleteOne({ userId });
};

const XeroConnection = mongoose.model('XeroConnection', xeroConnectionSchema);

export default XeroConnection;

